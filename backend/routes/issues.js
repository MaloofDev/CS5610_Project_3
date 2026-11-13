import express from "express";
import { getDb } from "../db/connection.js";
import { toObjectId } from "../lib/ids.js";

const router = express.Router();
const knownIssues = () => getDb().collection("knownIssues");
const PAGE_SIZE = 20;
const trimValue = (value) => (typeof value === "string" ? value.trim() : "");

// Display issues on Issues Page
router.get("/", async (req, res) => {
  const query = { userId: req.user._id };
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

  const [list, total] = await Promise.all([
    knownIssues()
      .find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    knownIssues().countDocuments(query),
  ]);
  res.json({ issues: list, total, page, pageSize: PAGE_SIZE });
});

//  Drill down on an issue and get the details
router.get("/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  const issue =
    _id && (await knownIssues().findOne({ _id, userId: req.user._id }));
  if (!issue) return res.status(404).json({ error: "No such issue." });
  res.json(issue);
});

// Create a new issue
router.post("/", async (req, res) => {
  const userId = req.user._id;
  const title = trimValue(req.body.title);
  const repo = trimValue(req.body.repo);
  const affectedReleases = trimValue(req.body.affectedReleases);
  const testOrJob = trimValue(req.body.testOrJob);
  const errorSnippet = trimValue(req.body.errorSnippet);
  const category = trimValue(req.body.category);
  const status = trimValue(req.body.status);
  const fixNotes = trimValue(req.body.fixNotes);
  const now = new Date();
  const createdAt = now;
  const updatedAt = now;
  const issue_entry = {};

  if (!title || !repo || !testOrJob || !errorSnippet || !category) {
    return res.status(400).json({
      error:
        "Title, Repo, Test/Job, Error and Category are all required fields.",
    });
  }

  issue_entry.userId = userId;
  issue_entry.title = title;
  issue_entry.repo = repo;
  issue_entry.affectedReleases = affectedReleases
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  issue_entry.testOrJob = testOrJob;
  issue_entry.errorSnippet = errorSnippet;
  issue_entry.category = category;
  issue_entry.status = status;
  issue_entry.fixNotes = fixNotes;
  issue_entry.createdAt = createdAt;
  issue_entry.updatedAt = updatedAt;

  const { insertedId } = await knownIssues().insertOne(issue_entry);
  res.status(200).json({ _id: insertedId });
});

// Update an issue
router.put("/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(404).json({ error: "No such issue." });

  const title = trimValue(req.body.title);
  const repo = trimValue(req.body.repo);
  const affectedReleases = trimValue(req.body.affectedReleases);
  const testOrJob = trimValue(req.body.testOrJob);
  const errorSnippet = trimValue(req.body.errorSnippet);
  const category = trimValue(req.body.category);
  const status = trimValue(req.body.status);
  const fixNotes = trimValue(req.body.fixNotes);
  const now = new Date();
  const updatedAt = now;
  const issue_entry = {};

  if (!title || !repo || !testOrJob || !errorSnippet || !category) {
    return res.status(400).json({
      error:
        "Title, Repo, Test/Job, Error and Category are all required fields.",
    });
  }

  issue_entry.userId = userId;
  issue_entry.title = title;
  issue_entry.repo = repo;
  issue_entry.affectedReleases = affectedReleases
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  issue_entry.testOrJob = testOrJob;
  issue_entry.errorSnippet = errorSnippet;
  issue_entry.category = category;
  issue_entry.status = status;
  issue_entry.fixNotes = fixNotes;
  issue_entry.updatedAt = updatedAt;

  const { matchedCount } = await knownIssues().updateOne(
    { _id, userId },
    { $set: issue_entry },
  );
  if (!matchedCount) return res.status(404).json({ error: "No such issue." });
  res.json({ _id });
});

export default router;
