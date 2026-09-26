import { renderHook } from "@testing-library/react";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("uses a saved theme", () => {
    localStorage.setItem("tweet-analyzer:theme", JSON.stringify("light"));
    expect(renderHook(() => useTheme()).result.current.theme).toBe("light");
  });

  it("falls back to the system preference", () => {
    vi.stubGlobal("matchMedia", (query) => ({ matches: query.includes("light") }));
    expect(renderHook(() => useTheme()).result.current.theme).toBe("light");
  });

  it("defaults to dark", () => {
    expect(renderHook(() => useTheme()).result.current.theme).toBe("dark");
  });
});
