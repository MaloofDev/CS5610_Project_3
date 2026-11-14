import express from "express";
import { getDb } from "../db/connection.js";
import { toObjectId } from "../lib/ids.js";

const router = express.Router();
const updates = () => getDb().collection("issueUpdates");
const trimValue = (value) => (typeof value === "string" ? value.trim() : "");
const knownIssues = () => getDb().collection("knownIssues");

router.get("/", async (req, res) => {
  const issueId = toObjectId(req.query.issueId);
  if (!issueId) return res.status(400).json({ error: "Issue not found" });

  const list = await updates()
    .find({ issueId, userId: req.user._id })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(list);
});

router.post("/", async (req, res) => {
  const issueId = toObjectId(req.body.issueId);
  if (!issueId) return res.status(400).json({ error: "Issue not found" });

  const userId = req.user._id;
  const note = trimValue(req.body.note);
  const outcome = trimValue(req.body.outcome);
  const now = new Date();
  const createdAt = now;
  const updatedAt = now;

  if (!outcome || !note) {
    return res
      .status(400)
      .json({ error: "Please provide both a note and the current status!" });
  }

  const issue = await knownIssues().findOne({ _id: issueId, userId });
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  const entry = { userId, issueId, note, outcome, createdAt, updatedAt };
  const { insertedId } = await updates().insertOne(entry);

  await knownIssues().updateOne(
    { _id: issueId },
    { $set: { updatedAt: updatedAt } },
  );

  res.status(201).json({ _id: insertedId, ...entry });
});

export default router;
