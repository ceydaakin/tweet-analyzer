import { useCallback, useEffect, useMemo, useState } from "react";
import { readJson, writeJson } from "../lib/storage";

const STORAGE_KEY = "tweet-analyzer:history";
export const MAX_HISTORY = 20;

function isAnalysis(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    typeof item.summary === "string" &&
    typeof item.sentiment === "string" &&
    typeof item.datetime === "string"
  );
}

function loadHistory() {
  const stored = readJson(STORAGE_KEY, []);
  return Array.isArray(stored) ? stored.filter(isAnalysis).slice(0, MAX_HISTORY) : [];
}

/** Recent analyses, kept in this browser only. */
export function useAnalysisHistory() {
  const [items, setItems] = useState(loadHistory);

  useEffect(() => {
    writeJson(STORAGE_KEY, items);
  }, [items]);

  const add = useCallback((result) => {
    setItems((prev) => [result, ...prev].slice(0, MAX_HISTORY));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const stats = useMemo(() => {
    const count = (sentiment) => items.filter((item) => item.sentiment === sentiment).length;
    return {
      total: items.length,
      positive: count("Positive"),
      neutral: count("Neutral"),
      negative: count("Negative"),
    };
  }, [items]);

  return { items, stats, add, clear };
}
