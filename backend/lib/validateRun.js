export const RUN_STATUSES = ["passed", "failed", "cancelled"];
export const TEST_STATUSES = ["passed", "failed", "skipped"];

const MAX_TEXT = 100;
const MAX_TESTS = 500;

const trimmed = (value) => (typeof value === "string" ? value.trim() : "");
const isCount = (value) => Number.isFinite(value) && value >= 0;

function readTest(test = {}, index) {
  const label = `Test ${index + 1}`;
  const name = trimmed(test.name);
  const suite = trimmed(test.suite);
  if (!name || !suite) return { error: `${label} needs a suite and a name.` };
  if (!TEST_STATUSES.includes(test.status)) {
    return { error: `${label} needs a status of passed, failed, or skipped.` };
  }
  const durationMs = Number(test.durationMs ?? 0);
  if (!isCount(durationMs)) {
    return { error: `${label} needs a duration of 0 ms or more.` };
  }
  return {
    test: {
      name,
      suite,
      status: test.status,
      durationMs: Math.round(durationMs),
      errorMessage: test.status === "failed" ? trimmed(test.errorMessage) : "",
    },
  };
}

/** Validates a run body. Returns { error } or { run }. */
export function validateRun(body = {}) {
  const fields = {};
  for (const [key, label] of [
    ["repo", "repository"],
    ["release", "release"],
    ["branch", "branch"],
  ]) {
    fields[key] = trimmed(body[key]);
    if (!fields[key] || fields[key].length > MAX_TEXT) {
      return { error: `Enter a ${label} up to ${MAX_TEXT} characters.` };
    }
  }

  const commitSha = trimmed(body.commitSha).toLowerCase();
  if (!/^[a-f0-9]{7,40}$/.test(commitSha)) {
    return { error: "Enter a commit SHA of 7 to 40 hex characters." };
  }
  if (!RUN_STATUSES.includes(body.status)) {
    return { error: "Choose a status of passed, failed, or cancelled." };
  }
  const startedAt = new Date(body.startedAt);
  if (!body.startedAt || Number.isNaN(startedAt.getTime())) {
    return { error: "Enter when the run started." };
  }
  const durationSec = Number(body.durationSec);
  if (body.durationSec === "" || !isCount(durationSec)) {
    return { error: "Enter a duration of 0 seconds or more." };
  }

  const list = body.tests ?? [];
  if (!Array.isArray(list) || list.length > MAX_TESTS) {
    return { error: `A run can have up to ${MAX_TESTS} tests.` };
  }
  const tests = [];
  for (const [index, item] of list.entries()) {
    const { test, error } = readTest(item, index);
    if (error) return { error };
    tests.push(test);
  }

  return {
    run: {
      ...fields,
      commitSha,
      status: body.status,
      startedAt,
      durationSec: Math.round(durationSec),
      tests,
    },
  };
}
