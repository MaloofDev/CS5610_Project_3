const GRID_RUNS = 20;

const testKey = (test) => `${test.suite} › ${test.name}`;

export function passRate(passed, total) {
  return total ? passed / total : null;
}

/** Pass rate per day, leaving out cancelled runs. Expects runs sorted oldest first. */
export function dailyPassRate(runs) {
  const days = new Map();
  for (const run of runs) {
    if (run.status === "cancelled") continue;
    const day = run.startedAt.toISOString().slice(0, 10);
    const entry = days.get(day) ?? { day, runs: 0, passed: 0 };
    entry.runs++;
    if (run.status === "passed") entry.passed++;
    days.set(day, entry);
  }
  return [...days.values()].map(({ day, runs: count, passed }) => ({
    day,
    passRate: passRate(passed, count),
  }));
}

/**
 * Builds a test by run grid from the last 20 runs. Each test's results line up
 * with the returned runs; a test missing from a run gets null.
 */
export function buildHistory(runs) {
  const recent = runs.slice(-GRID_RUNS);
  const tests = new Map();
  recent.forEach((run, index) => {
    for (const test of run.tests) {
      const key = testKey(test);
      if (!tests.has(key)) {
        tests.set(key, { name: key, results: Array(recent.length).fill(null) });
      }
      tests.get(key).results[index] = test.status;
    }
  });

  return {
    runs: recent.map(({ _id, status, startedAt }) => ({
      _id,
      status,
      startedAt,
    })),
    tests: [...tests.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}
