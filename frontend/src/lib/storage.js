// localStorage can be missing or throw (private mode, blocked site data), so every
// access is guarded and callers get a fallback instead of an exception.

export function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not persisting is acceptable; the in-memory state still works.
  }
}
