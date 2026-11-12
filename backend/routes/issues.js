import express from "express";
import { getDb } from "../db/connection.js";

const router = express.Router();
const issues = () => getDb().collection("knownIssues");
const PAGE_SIZE = 20;

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

export default router;
