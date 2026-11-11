const MIN_RUNS = 5;
const TOP = 10;

/**
 * Ranks tests by how often their status flips between consecutive runs on a branch.
 * Expects runs sorted oldest first. A test that always fails never flips, so it scores 0.
 */
export function flakyTests(runs) {
  const stats = new Map();
  for (const run of runs) {
    for (const { name, suite, status } of run.tests) {
      if (status === "skipped") continue;
      const key = `${run.branch}|${suite}|${name}`;
      const entry = stats.get(key) ?? {
        name,
        suite,
        branch: run.branch,
        runs: 0,
        flips: 0,
        last: status,
      };
      if (status !== entry.last) entry.flips++;
      entry.runs++;
      entry.last = status;
      stats.set(key, entry);
    }
  }

  return [...stats.values()]
    .filter((entry) => entry.runs >= MIN_RUNS && entry.flips > 0)
    .map((entry) => ({
      name: entry.name,
      suite: entry.suite,
      branch: entry.branch,
      runs: entry.runs,
      flips: entry.flips,
      flipRate: entry.flips / entry.runs,
    }))
    .sort((a, b) => b.flipRate - a.flipRate)
    .slice(0, TOP);
}
