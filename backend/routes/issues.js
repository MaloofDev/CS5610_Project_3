import express from "express";
import { getDb } from "../db/connection.js";
import { toObjectId } from "../lib/ids.js";

const router = express.Router();
const issues = () => getDb().collection("knownIssues");
const PAGE_SIZE = 20;

// Display issues on Issues Page
router.get("/", async (req, res) => {
  const query = { userId: req.user._id };
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);

  const [list, total] = await Promise.all([
    issues()
      .find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    issues().countDocuments(query),
  ]);
  res.json({ issues: list, total, page, pageSize: PAGE_SIZE });
});

//  Drill down on an issue and get the details
router.get("/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  const issue = _id && (await issues().findOne({ _id, userId: req.user._id }));
  if (!issue) return res.status(404).json({ error: "No such issue." });
  res.json(issue);
});

export default router;
