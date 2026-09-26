import { act, renderHook } from "@testing-library/react";
import { MAX_HISTORY, useAnalysisHistory } from "./useAnalysisHistory";
import { sampleResult } from "../test/fixtures";

const KEY = "tweet-analyzer:history";

describe("useAnalysisHistory", () => {
  beforeEach(() => localStorage.clear());

  it("computes stats per sentiment", () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      result.current.add({ ...sampleResult, sentiment: "Positive" });
      result.current.add({ ...sampleResult, sentiment: "Negative" });
      result.current.add({ ...sampleResult, sentiment: "Negative" });
    });

    expect(result.current.stats).toEqual({ total: 3, positive: 1, neutral: 0, negative: 2 });
    expect(result.current.items[0].sentiment).toBe("Negative");
  });

  it(`keeps at most ${MAX_HISTORY} items`, () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      for (let i = 0; i < MAX_HISTORY + 5; i += 1) result.current.add(sampleResult);
    });

    expect(result.current.items).toHaveLength(MAX_HISTORY);
  });

  it("ignores stored data that is not a list of analyses", () => {
    localStorage.setItem(KEY, JSON.stringify([sampleResult, { junk: true }, null]));
    expect(renderHook(() => useAnalysisHistory()).result.current.items).toEqual([sampleResult]);

    localStorage.setItem(KEY, JSON.stringify({ not: "an array" }));
    expect(renderHook(() => useAnalysisHistory()).result.current.items).toEqual([]);
  });
});
