export const REPOS = [
  {
    name: "billing-api",
    duration: [300, 380],
    releases: [
      { release: "v2.3.7", branch: "release/2.3" },
      { release: "v2.4.2", branch: "release/2.4" },
      { release: "v3.1.0", branch: "main" },
    ],
    suites: {
      "invoice.test": [
        "rounds tax on invoices",
        "creates invoice from order",
        "applies late fee",
        "voids paid invoice",
        "exports invoice PDF",
        "sums line items",
      ],
      "auth.test": [
        "refresh token expiry",
        "rejects expired session",
        "rotates API keys",
        "locks account after 5 attempts",
      ],
      "events.test": [
        "webhook retries",
        "publishes invoice.paid",
        "dedupes repeated events",
        "orders events by timestamp",
      ],
      "payment.test": [
        "charges saved card",
        "refunds partial payment",
        "handles currency rounding",
        "retries declined card",
      ],
    },
  },
  {
    name: "web-checkout",
    duration: [420, 520],
    releases: [
      { release: "v1.8.4", branch: "release/1.8" },
      { release: "v1.9.0", branch: "main" },
      { release: "v1.9.0", branch: "feature/coupons" },
    ],
    suites: {
      "checkout.spec": [
        "applies coupon",
        "stacks two coupons",
        "totals cart",
        "validates shipping address",
        "shows tax estimate",
        "completes guest checkout",
        "keeps cart after login",
      ],
      "cart.spec": [
        "adds item to cart",
        "removes item from cart",
        "updates quantity",
        "persists cart in storage",
        "shows empty cart message",
        "limits quantity to stock",
      ],
      "payment.spec": [
        "retries declined card",
        "renders card form",
        "submits 3DS challenge",
        "shows payment error",
        "saves card for later",
      ],
      "a11y.spec": [
        "focus moves to error summary",
        "buttons have labels",
        "checkout passes axe scan",
      ],
    },
  },
  {
    name: "mobile-sync",
    duration: [220, 300],
    releases: [
      { release: "v0.7.9", branch: "release/0.7" },
      { release: "v0.8.3", branch: "main" },
    ],
    suites: {
      "sync.test": [
        "syncs offline edits",
        "resolves conflicting edits",
        "retries after network loss",
        "batches uploads",
        "skips unchanged records",
      ],
      "storage.test": [
        "migrates schema v3 to v4",
        "encrypts local cache",
        "evicts stale entries",
        "reads large attachments",
      ],
      "session.test": [
        "refreshes token in background",
        "logs out on revoke",
        "restores session on launch",
      ],
      "push.test": [
        "registers device token",
        "handles silent push",
        "dedupes notifications",
      ],
    },
  },
];

// Failure probability for the deliberately flaky tests, keyed "repo|suite|test".
export const FLAKY = {
  "billing-api|invoice.test|rounds tax on invoices": 0.4,
  "billing-api|auth.test|refresh token expiry": 0.2,
  "web-checkout|checkout.spec|applies coupon": 0.4,
  "billing-api|events.test|webhook retries": 0.15,
};
export const BASE_FAILURE_RATE = 0.005;

// The billing-api v2.3.7 regression: this test fails in nearly every run for the last 6 days.
export const REGRESSION = {
  repo: "billing-api",
  release: "v2.3.7",
  suite: "events.test",
  test: "webhook retries",
  days: 6,
  failureRate: 0.95,
};

export const DEFAULT_ERRORS = [
  "AssertionError: expected 200, got 500",
  "Timeout after 1500ms",
  "ECONNRESET",
  "Received undefined, expected object",
  "Snapshot mismatch: 3 lines changed",
];

// Error messages for specific tests, keyed "suite|test".
export const TEST_ERRORS = {
  "invoice.test|rounds tax on invoices": [
    "Expected 18.00, got 20.00",
    "Expected 4.35, got 4.34",
    "Redis connection timed out after 2000ms",
  ],
  "auth.test|refresh token expiry": [
    "Redis connection timed out after 2000ms",
    "Token expired 2s before refresh",
  ],
  "events.test|webhook retries": [
    "Timeout after 1500ms",
    "Expected 3 delivery attempts, got 2",
  ],
  "checkout.spec|applies coupon": [
    "Expected 18.00, got 20.00",
    "Coupon SAVE10 not applied: cart total unchanged",
  ],
  "payment.spec|retries declined card": [
    "ECONNRESET",
    "Expected status declined, got pending",
  ],
};

// [title, repo, testOrJob, errorSnippet, category]. The first 12 snippets appear in seeded run errors.
export const ISSUES = [
  [
    "Redis timeout in invoice tests",
    "billing-api",
    "invoice.test › rounds tax on invoices",
    "Redis connection timed out",
    "infra",
  ],
  [
    "Coupon rounding off by a cent on retry",
    "web-checkout",
    "checkout.spec › applies coupon",
    "Expected 18.00, got 20.00",
    "flaky-test",
  ],
  [
    "Webhook retry test times out on release/2.3",
    "billing-api",
    "events.test › webhook retries",
    "Timeout after 1500ms",
    "timeout",
  ],
  [
    "Refresh token test fails near the expiry boundary",
    "billing-api",
    "auth.test › refresh token expiry",
    "Token expired 2s before refresh",
    "flaky-test",
  ],
  [
    "Payment sandbox resets connections",
    "web-checkout",
    "payment.spec › retries declined card",
    "ECONNRESET",
    "infra",
  ],
  [
    "Tax rounding differs between Node versions",
    "billing-api",
    "invoice.test › rounds tax on invoices",
    "Expected 4.35, got 4.34",
    "dependency",
  ],
  [
    "Webhook delivered fewer times than expected",
    "billing-api",
    "events.test › webhook retries",
    "Expected 3 delivery attempts, got 2",
    "flaky-test",
  ],
  [
    "Coupon not applied when the cart loads slowly",
    "web-checkout",
    "checkout.spec › applies coupon",
    "Coupon SAVE10 not applied",
    "timeout",
  ],
  [
    "Declined card stays pending in the sandbox",
    "web-checkout",
    "payment.spec › retries declined card",
    "Expected status declined, got pending",
    "config",
  ],
  [
    "UI snapshots drift after font update",
    "web-checkout",
    "a11y.spec › buttons have labels",
    "Snapshot mismatch",
    "dependency",
  ],
  [
    "API returns 500 when seed data is missing",
    "mobile-sync",
    "sync.test › batches uploads",
    "AssertionError: expected 200, got 500",
    "config",
  ],
  [
    "Undefined response body after client upgrade",
    "mobile-sync",
    "storage.test › evicts stale entries",
    "Received undefined, expected object",
    "dependency",
  ],
  [
    "npm install times out on CI runners",
    "web-checkout",
    "install job",
    "npm ERR! code ETIMEDOUT",
    "infra",
  ],
  [
    "Runner disk fills up during build",
    "billing-api",
    "build job",
    "ENOSPC: no space left on device",
    "infra",
  ],
  [
    "Docker Hub rate limit on base image pull",
    "mobile-sync",
    "docker build job",
    "toomanyrequests: You have reached your pull rate limit",
    "infra",
  ],
  [
    "Frontend build runs out of memory",
    "web-checkout",
    "build job",
    "JavaScript heap out of memory",
    "infra",
  ],
  [
    "Stripe SDK missing after lockfile change",
    "web-checkout",
    "payment.spec › renders card form",
    "Cannot find module '@stripe/stripe-js'",
    "dependency",
  ],
  [
    "Postgres container port already in use",
    "billing-api",
    "integration job",
    "port 5432 is already allocated",
    "infra",
  ],
  [
    "Simulator boot times out on macOS runners",
    "mobile-sync",
    "ios e2e job",
    "Simulator failed to boot within 120s",
    "timeout",
  ],
  [
    "Conflict resolution test depends on test order",
    "mobile-sync",
    "sync.test › resolves conflicting edits",
    "Expected version 4, got 3",
    "flaky-test",
  ],
  [
    "Schema migration test uses the wrong fixture",
    "mobile-sync",
    "storage.test › migrates schema v3 to v4",
    "Unknown column 'sync_token'",
    "config",
  ],
  [
    "Feature flag missing in staging env",
    "web-checkout",
    "checkout.spec › completes guest checkout",
    "Flag guest_checkout_v2 is not defined",
    "config",
  ],
  [
    "Clock skew breaks session tests",
    "billing-api",
    "auth.test › rejects expired session",
    "Session expired 30s early",
    "flaky-test",
  ],
  [
    "Late fee test fails at the month boundary",
    "billing-api",
    "invoice.test › applies late fee",
    "Expected 25.00, got 0.00",
    "flaky-test",
  ],
  [
    "Lint job fails on generated files",
    "web-checkout",
    "lint job",
    "Parsing error: Unexpected token <",
    "config",
  ],
  [
    "Push notification test hits real APNs",
    "mobile-sync",
    "push.test › handles silent push",
    "APNs connection refused",
    "config",
  ],
  [
    "Axe scan times out on the product page",
    "web-checkout",
    "a11y.spec › checkout passes axe scan",
    "Timeout after 30000ms",
    "timeout",
  ],
  [
    "Cache encryption key not set on CI",
    "mobile-sync",
    "storage.test › encrypts local cache",
    "CACHE_KEY must be 32 bytes",
    "config",
  ],
  [
    "Invoice PDF export fails without fonts",
    "billing-api",
    "invoice.test › exports invoice PDF",
    "Font 'Inter' not found",
    "dependency",
  ],
  [
    "Card form iframe loads slowly",
    "web-checkout",
    "payment.spec › renders card form",
    "Timeout waiting for iframe[name=card]",
    "timeout",
  ],
  [
    "Artifact upload fails intermittently",
    "billing-api",
    "upload artifacts job",
    "Upload failed: 502 Bad Gateway",
    "infra",
  ],
  [
    "Cart storage test leaks between tests",
    "web-checkout",
    "cart.spec › persists cart in storage",
    "Expected 1 item, got 3",
    "flaky-test",
  ],
  [
    "Large attachment read exceeds memory limit",
    "mobile-sync",
    "storage.test › reads large attachments",
    "RangeError: Array buffer allocation failed",
    "infra",
  ],
  [
    "Event ordering assumes a single worker",
    "billing-api",
    "events.test › orders events by timestamp",
    "Expected evt_2 before evt_3",
    "flaky-test",
  ],
  [
    "Background refresh test never resolves",
    "mobile-sync",
    "session.test › refreshes token in background",
    "Timeout after 1500ms",
    "timeout",
  ],
  [
    "Saved card test needs network access",
    "web-checkout",
    "payment.spec › saves card for later",
    "ECONNRESET",
    "infra",
  ],
  [
    "Dependency bump breaks date parsing",
    "billing-api",
    "invoice.test › creates invoice from order",
    "Invalid time value",
    "dependency",
  ],
  [
    "Node upgrade changes stack trace snapshots",
    "mobile-sync",
    "sync.test › retries after network loss",
    "Snapshot mismatch",
    "dependency",
  ],
  [
    "Integration DB not ready when tests start",
    "billing-api",
    "integration job",
    "MongoServerSelectionError: connect ECONNREFUSED",
    "timeout",
  ],
  [
    "Shipping address test uses the real geocoder",
    "web-checkout",
    "checkout.spec › validates shipping address",
    "getaddrinfo ENOTFOUND maps.example.com",
    "config",
  ],
];

export const ISSUE_STATUSES = ["investigating", "quarantined", "resolved"];

export const FIX_NOTES = {
  investigating: [
    "",
    "Not fixed yet. Retrying the job usually passes.",
    "Looks environment-related; still collecting failures.",
  ],
  quarantined: [
    "Moved to the quarantine suite so it doesn't block merges.",
    "Quarantined until the sandbox provider fixes their side.",
    "Skipped on CI, still runs locally.",
  ],
  resolved: [
    "Pinned the dependency and added a regression test.",
    "Raised the timeout and moved the test to the slow suite.",
    "Fixed the fixture so the test no longer depends on order.",
    "Added a readiness check before the tests start.",
  ],
};

export const UPDATE_OUTCOMES = [
  "no-change",
  "workaround",
  "fixed",
  "escalated",
];

// Each note is given a release the issue affects.
export const UPDATE_NOTES = [
  (r) => `Retried 3 times on ${r}, passed on the third.`,
  () => "Pinned redis client to 4.6.x as a workaround.",
  (r) => `Seen again on ${r}, retried, passed.`,
  () => "Could not reproduce locally after 20 runs.",
  (r) => `Fails on ${r} only when the runner is under load.`,
  () => "Bumped the timeout from 1500ms to 3000ms on CI.",
  () => "Added logging around the failing call to capture timing.",
  (r) => `Bisected to the dependency bump that shipped in ${r}.`,
  () => "Asked the infra channel whether the runners changed.",
  () => "Opened a ticket with the sandbox provider.",
  () => "Reverted the change; failures stopped.",
  (r) => `Still failing on ${r} after the fix, reopening.`,
  () => "Quarantined the test while we investigate.",
  () => "Pair-debugged with the owning team, root cause found.",
  () =>
    "Running the suite serially makes it pass, so it's an ordering problem.",
  (r) => `Backported the fix to ${r}.`,
];
