import express from "express";
import { getDb } from "../db/connection.js";
import { toObjectId } from "../lib/ids.js";

const router = express.Router();
const updates = () => getDb().collection("issueUpdates");

router.get("/", async (req, res) => {
  const issueId = toObjectId(req.query.issueId);
  if (!issueId) return res.status(400).json({ error: "Issue not found" });

  const list = await updates()
    .find({ issueId, userId: req.user._id })
    .sort({ createdAt: 1 })
    .toArray();
  res.json(list);
});

export default router;
