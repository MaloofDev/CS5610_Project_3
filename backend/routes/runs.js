import express from "express";
import { getDb } from "../db/connection.js";
import { toObjectId } from "../lib/ids.js";
import { validateRun } from "../lib/validateRun.js";

const router = express.Router();

const PAGE_SIZE = 25;
const NOT_FOUND = { error: "Run not found." };

const runs = () => getDb().collection("runs");
const text = (value) => (typeof value === "string" ? value.trim() : "");

// List rows carry test counts instead of the tests array.
const LIST_PROJECTION = {
  repo: 1,
  release: 1,
  branch: 1,
  commitSha: 1,
  status: 1,
  startedAt: 1,
  durationSec: 1,
  totalTests: { $size: "$tests" },
  passedTests: {
    $size: {
      $filter: { input: "$tests", cond: { $eq: ["$$this.status", "passed"] } },
    },
  },
};

function listQuery(req) {
  const query = { userId: req.user._id };
  for (const key of ["repo", "release", "branch", "status"]) {
    const value = text(req.query[key]);
    if (value) query[key] = value;
  }
  const range = {};
  for (const [key, operator] of [
    ["from", "$gte"],
    ["to", "$lte"],
  ]) {
    const date = new Date(text(req.query[key]));
    if (!Number.isNaN(date.getTime())) range[operator] = date;
  }
  if (Object.keys(range).length) query.startedAt = range;
  return query;
}

// Filtering by userId is the ownership check: someone else's run matches nothing.
function ownRun(req) {
  const _id = toObjectId(req.params.id);
  return _id && { _id, userId: req.user._id };
}

router.get("/", async (req, res) => {
  const query = listQuery(req);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const [list, total] = await Promise.all([
    runs()
      .find(query, { projection: LIST_PROJECTION })
      .sort({ startedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    runs().countDocuments(query),
  ]);
  res.json({ runs: list, total, page, pageSize: PAGE_SIZE });
});

// Dropdown options. Releases and branches narrow to the chosen repo.
router.get("/filters", async (req, res) => {
  const userId = req.user._id;
  const repo = text(req.query.repo);
  const scoped = repo ? { userId, repo } : { userId };
  const [repos, releases, branches] = await Promise.all([
    runs().distinct("repo", { userId }),
    runs().distinct("release", scoped),
    runs().distinct("branch", scoped),
  ]);
  res.json({ repos, releases, branches });
});

router.post("/", async (req, res) => {
  const { run, error } = validateRun(req.body);
  if (error) return res.status(400).json({ error });

  const now = new Date();
  const { insertedId } = await runs().insertOne({
    userId: req.user._id,
    ...run,
    createdAt: now,
    updatedAt: now,
  });
  res.status(201).json({ _id: insertedId });
});

router.get("/:id", async (req, res) => {
  const filter = ownRun(req);
  const run = filter && (await runs().findOne(filter));
  if (!run) return res.status(404).json(NOT_FOUND);
  res.json(run);
});

router.put("/:id", async (req, res) => {
  const filter = ownRun(req);
  if (!filter) return res.status(404).json(NOT_FOUND);
  const { run, error } = validateRun(req.body);
  if (error) return res.status(400).json({ error });

  const { matchedCount } = await runs().updateOne(filter, {
    $set: { ...run, updatedAt: new Date() },
  });
  if (!matchedCount) return res.status(404).json(NOT_FOUND);
  res.json({ _id: filter._id });
});

router.delete("/:id", async (req, res) => {
  const filter = ownRun(req);
  const result = filter && (await runs().deleteOne(filter));
  if (!result?.deletedCount) return res.status(404).json(NOT_FOUND);
  res.status(204).end();
});

export default router;
