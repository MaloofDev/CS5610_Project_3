// Loads deterministic demo data, dated relative to the day the seed runs.
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { hashPassword } from "../auth/password.js";
import { closeDb, connectToDb } from "../db/connection.js";
import { initCollections } from "../db/collections.js";
import { chance, hex, int, pick, random } from "./random.js";
import {
  BASE_FAILURE_RATE,
  DEFAULT_ERRORS,
  FIX_NOTES,
  FLAKY,
  ISSUES,
  ISSUE_STATUSES,
  REGRESSION,
  REPOS,
  TEST_ERRORS,
  UPDATE_NOTES,
  UPDATE_OUTCOMES,
} from "./fixtures.js";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, "..", "..", ".env"), quiet: true });

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const RUNS_PER_REPO = 400;
const SPAN_DAYS = 60;
const UPDATE_COUNT = 100;

// Midnight today: every date is an offset from here.
const anchor = new Date();
anchor.setHours(0, 0, 0, 0);
const daysAgo = (date) => (anchor - date) / DAY;

function failureRate(repo, release, suite, name, age) {
  const r = REGRESSION;
  const isRegression =
    repo === r.repo &&
    release === r.release &&
    suite === r.suite &&
    name === r.test &&
    age < r.days;
  if (isRegression) return r.failureRate;
  return FLAKY[`${repo}|${suite}|${name}`] ?? BASE_FAILURE_RATE;
}

function buildRuns(userId) {
  const runs = [];
  for (const repo of REPOS) {
    const tests = Object.entries(repo.suites).flatMap(([suite, names]) =>
      names.map((name) => ({ suite, name })),
    );
    for (let i = 0; i < RUNS_PER_REPO; i++) {
      // Spread evenly over the last 60 days, with releases interleaved at random.
      const slot = (i + random()) / RUNS_PER_REPO;
      const startedAt = new Date(anchor - (1 - slot) * SPAN_DAYS * DAY);
      const { release, branch } = pick(repo.releases);
      const age = daysAgo(startedAt);

      let durationSec = int(...repo.duration);
      if (repo.name === "billing-api" && age < 14) {
        // Builds slow down over the last two weeks, toward about 420s.
        durationSec += Math.round((1 - age / 14) * 80);
      }

      // About 2% of runs are cancelled partway, with partial test results.
      const cancelled = chance(0.02);
      const ran = cancelled ? tests.slice(0, int(0, tests.length - 1)) : tests;
      const runTests = ran.map(({ suite, name }) => {
        const failed = chance(
          failureRate(repo.name, release, suite, name, age),
        );
        const errors = TEST_ERRORS[`${suite}|${name}`] ?? DEFAULT_ERRORS;
        return {
          name,
          suite,
          status: failed ? "failed" : "passed",
          durationMs: int(50, 5000),
          errorMessage: failed ? pick(errors) : "",
        };
      });

      let status = "passed";
      if (cancelled) status = "cancelled";
      else if (runTests.some((t) => t.status === "failed")) status = "failed";

      runs.push({
        userId,
        repo: repo.name,
        release,
        branch,
        commitSha: hex(7),
        status,
        startedAt,
        durationSec,
        tests: runTests,
        createdAt: startedAt,
        updatedAt: startedAt,
      });
    }
  }
  return runs;
}

function buildIssues(userId) {
  return ISSUES.map(
    ([title, repoName, testOrJob, errorSnippet, category], i) => {
      const repo = REPOS.find((r) => r.name === repoName);
      const releases = [...new Set(repo.releases.map((r) => r.release))];
      const affected = releases.filter(() => chance(0.5));
      const status = ISSUE_STATUSES[i % ISSUE_STATUSES.length];
      const createdAt = new Date(
        anchor - int(5, SPAN_DAYS) * DAY + int(8, 18) * HOUR,
      );
      return {
        userId,
        title,
        repo: repoName,
        affectedReleases: affected.length ? affected : [pick(releases)],
        testOrJob,
        errorSnippet,
        category,
        status,
        fixNotes: pick(FIX_NOTES[status]),
        createdAt,
        updatedAt: createdAt,
      };
    },
  );
}

// 0 to 6 updates per issue, adding up to exactly 100.
function updateCounts(n) {
  const counts = Array.from({ length: n }, () => int(0, 6));
  let total = counts.reduce((a, b) => a + b, 0);
  while (total !== UPDATE_COUNT) {
    const i = int(0, n - 1);
    if (total < UPDATE_COUNT && counts[i] < 6) {
      counts[i]++;
      total++;
    } else if (total > UPDATE_COUNT && counts[i] > 0) {
      counts[i]--;
      total--;
    }
  }
  return counts;
}

// Each update comes after its issue was created and after the previous update.
function buildUpdates(userId, issues) {
  const updates = [];
  const counts = updateCounts(issues.length);
  issues.forEach((issue, i) => {
    const start = issue.createdAt.getTime();
    const gap = (anchor.getTime() - start) / (counts[i] + 1);
    for (let k = 1; k <= counts[i]; k++) {
      const at = new Date(start + k * gap - int(0, 6) * HOUR);
      updates.push({
        userId,
        issueId: issue._id,
        note: pick(UPDATE_NOTES)(pick(issue.affectedReleases)),
        outcome: pick(UPDATE_OUTCOMES),
        createdAt: at,
        updatedAt: at,
      });
      issue.updatedAt = at;
    }
  });
  return updates;
}

async function main() {
  for (const name of ["MONGO_URI", "DEMO_PASSWORD"]) {
    if (!process.env[name]) {
      console.error(`Missing ${name}. Set it in .env before seeding.`);
      process.exit(1);
    }
  }

  const db = await connectToDb();
  await initCollections(db);

  const username = (process.env.DEMO_USERNAME || "demo").toLowerCase();
  const { salt, passwordHash } = await hashPassword(process.env.DEMO_PASSWORD);
  await db
    .collection("users")
    .updateOne(
      { username },
      { $set: { salt, passwordHash }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  const { _id: userId } = await db.collection("users").findOne({ username });

  for (const name of ["runs", "knownIssues", "issueUpdates"]) {
    await db.collection(name).deleteMany({});
  }

  await db.collection("runs").insertMany(buildRuns(userId));

  const issues = buildIssues(userId);
  const { insertedIds } = await db.collection("knownIssues").insertMany(issues);
  issues.forEach((issue, i) => (issue._id = insertedIds[i]));
  await db.collection("issueUpdates").insertMany(buildUpdates(userId, issues));
  // Issues with updates take their updatedAt from the latest one.
  for (const issue of issues) {
    await db
      .collection("knownIssues")
      .updateOne({ _id: issue._id }, { $set: { updatedAt: issue.updatedAt } });
  }

  for (const name of ["runs", "knownIssues", "issueUpdates", "users"]) {
    console.log(`${name}: ${await db.collection(name).countDocuments()}`);
  }
  console.log(`Demo user: ${username}`);
  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
