import { formatDateTime, formatTimeAgo, initialOf } from "./format";

describe("formatTimeAgo", () => {
  const now = new Date("2026-09-26T12:00:00Z");
  const ago = (seconds) => new Date(now - seconds * 1000).toISOString();

  it.each([
    [10, "Just now"],
    [5 * 60, "5m ago"],
    [3 * 3600, "3h ago"],
    [3 * 86400, "Sep 23"],
  ])("%is ago -> %s", (seconds, expected) => {
    expect(formatTimeAgo(ago(seconds), now)).toBe(expected);
  });
});

describe("formatDateTime", () => {
  it("includes the date and year", () => {
    expect(formatDateTime("2026-09-26T12:00:00Z")).toMatch(/Sep 26, 2026/);
  });
});

describe("initialOf", () => {
  it.each([
    ["@jack", "J"],
    ["nasa", "N"],
    ["", "?"],
    [undefined, "?"],
  ])("%s -> %s", (username, expected) => {
    expect(initialOf(username)).toBe(expected);
  });
});
