import express from "express";
import { getDb } from "../db/connection.js";
import { flakyTests } from "../lib/flakiness.js";
import { passRate } from "../lib/releaseHistory.js";

const router = express.Router();

const DAY = 24 * 60 * 60 * 1000;
const RANGES = { "7d": 7, "30d": 30 };

const runs = () => getDb().collection("runs");

const isPassed = { $cond: [{ $eq: ["$status", "passed"] }, 1, 0] };
const isFinished = { $cond: [{ $eq: ["$status", "cancelled"] }, 0, 1] };

router.get("/", async (req, res) => {
  const range = req.query.range ?? "7d";
  if (!RANGES[range]) {
    return res.status(400).json({ error: "Choose a range of 7d or 30d." });
  }
  const match = {
    userId: req.user._id,
    startedAt: { $gte: new Date(Date.now() - RANGES[range] * DAY) },
  };
  if (typeof req.query.repo === "string" && req.query.repo) {
    match.repo = req.query.repo;
  }

  const [byStatus, daily, testRuns] = await Promise.all([
    runs()
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            duration: { $sum: "$durationSec" },
          },
        },
      ])
      .toArray(),
    runs()
      .aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
            avgDuration: {
              $avg: { $cond: [isFinished, "$durationSec", null] },
            },
            passed: { $sum: isPassed },
            finished: { $sum: isFinished },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    runs()
      .find(match, {
        projection: {
          branch: 1,
          "tests.name": 1,
          "tests.suite": 1,
          "tests.status": 1,
        },
      })
      .sort({ startedAt: 1 })
      .toArray(),
  ]);

  // Cancelled runs count toward total runs but not pass rate or duration.
  const counts = Object.fromEntries(byStatus.map((s) => [s._id, s]));
  const passed = counts.passed?.count ?? 0;
  const failed = counts.failed?.count ?? 0;
  const finishedDuration =
    (counts.passed?.duration ?? 0) + (counts.failed?.duration ?? 0);

  res.json({
    passRate: passRate(passed, passed + failed),
    totalRuns: byStatus.reduce((sum, s) => sum + s.count, 0),
    failedRuns: failed,
    avgDuration: passed + failed ? finishedDuration / (passed + failed) : null,
    daily: daily.map((d) => ({
      day: d._id,
      avgDuration: d.avgDuration,
      passRate: passRate(d.passed, d.finished),
    })),
    flakyTests: flakyTests(testRuns),
  });
});

export default router;
