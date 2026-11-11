const EMPTY = "–";

/** @returns {string} like "6m 05s" */
export function formatDuration(seconds) {
  if (seconds == null) return EMPTY;
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, "0")}s`;
}

/** @returns {string} like "2.3s" */
export function formatMs(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

/** @returns {string} like "91%" */
export function formatPercent(rate) {
  return rate == null ? EMPTY : `${Math.round(rate * 100)}%`;
}

/** @returns {string} like "Nov 1, 14:02" */
export function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/** @returns {string} like "14:02" */
export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/** @returns {string} like "Oct 22" */
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Daily series use UTC "YYYY-MM-DD" keys, so format them in UTC too.
export function formatDay(day) {
  return new Date(day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
