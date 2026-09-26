import { useCallback, useEffect, useState } from "react";
import { readJson, writeJson } from "../lib/storage";

const STORAGE_KEY = "tweet-analyzer:theme";

function initialTheme() {
  const stored = readJson(STORAGE_KEY, null);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      writeJson(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
