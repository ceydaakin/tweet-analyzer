const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "Just now", "5m ago", "3h ago", or a short date. */
export function formatTimeAgo(isoString, now = new Date()) {
  const seconds = Math.floor((now - new Date(isoString)) / 1000);
  if (seconds < MINUTE) return "Just now";
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`;
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** First letter of a handle, for avatar placeholders. */
export function initialOf(username) {
  const letter = (username ?? "").replace(/^@/, "").charAt(0);
  return letter ? letter.toUpperCase() : "?";
}
