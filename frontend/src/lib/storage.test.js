import { readJson, writeJson } from "./storage";

describe("storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("round-trips JSON", () => {
    writeJson("k", { a: 1 });
    expect(readJson("k", null)).toEqual({ a: 1 });
  });

  it("returns the fallback for missing or corrupt values", () => {
    expect(readJson("missing", "fallback")).toBe("fallback");
    localStorage.setItem("bad", "{not json");
    expect(readJson("bad", "fallback")).toBe("fallback");
  });

  it("swallows storage errors", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(readJson("k", 1)).toBe(1);
    expect(() => writeJson("k", 2)).not.toThrow();
  });
});
