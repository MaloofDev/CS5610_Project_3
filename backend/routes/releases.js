import express from "express";
import { getDb } from "../db/connection.js";
import {
  buildHistory,
  dailyPassRate,
  passRate,
} from "../lib/releaseHistory.js";

const router = express.Router();

const runs = () => getDb().collection("runs");
const text = (value) => (typeof value === "string" ? value.trim() : "");

const failingTests = (run) =>
  run.tests
    .filter((test) => test.status === "failed")
    .map((test) => `${test.suite} › ${test.name}`);

router.get("/", async (req, res) => {
  const repo = text(req.query.repo);
  if (!repo) return res.status(400).json({ error: "Choose a repository." });

  const groups = await runs()
    .aggregate([
      { $match: { userId: req.user._id, repo } },
      { $sort: { startedAt: -1 } },
      {
        $group: {
          _id: "$release",
          totalRuns: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ["$status", "passed"] }, 1, 0] } },
          finished: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 0, 1] },
          },
          latestRun: {
            $first: {
              _id: "$_id",
              status: "$status",
              startedAt: "$startedAt",
              tests: "$tests",
            },
          },
        },
      },
      { $sort: { "latestRun.startedAt": -1 } },
    ])
    .toArray();

  res.json(
    groups.map(({ _id, totalRuns, passed, finished, latestRun }) => ({
      release: _id,
      passRate: passRate(passed, finished),
      totalRuns,
      latestRun: {
        _id: latestRun._id,
        status: latestRun.status,
        startedAt: latestRun.startedAt,
      },
      failingTests: failingTests(latestRun),
    })),
  );
});

// Release names contain dots, so they come in as query parameters.
router.get("/detail", async (req, res) => {
  const repo = text(req.query.repo);
  const release = text(req.query.release);
  if (!repo || !release) {
    return res.status(400).json({ error: "Choose a repository and release." });
  }

  const list = await runs()
    .find(
      { userId: req.user._id, repo, release },
      {
        projection: {
          status: 1,
          startedAt: 1,
          "tests.name": 1,
          "tests.suite": 1,
          "tests.status": 1,
        },
      },
    )
    .sort({ startedAt: 1 })
    .toArray();
  if (!list.length) {
    return res.status(404).json({ error: "Release not found." });
  }

  const finished = list.filter((run) => run.status !== "cancelled");
  const passed = finished.filter((run) => run.status === "passed").length;
  res.json({
    repo,
    release,
    passRate: passRate(passed, finished.length),
    totalRuns: list.length,
    firstRunAt: list[0].startedAt,
    lastRunAt: list.at(-1).startedAt,
    daily: dailyPassRate(list),
    ...buildHistory(list),
  });
});

export default router;
