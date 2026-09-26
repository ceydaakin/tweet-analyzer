const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
// Claude usually answers in a few seconds; leave room for a slow tweet fetch too.
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Asks the backend to analyze a tweet with Claude.
 * @param {{ url?: string, text?: string }} input - a tweet URL, its text, or both
 * @returns {Promise<{ username: string, content: string, sentiment: "Positive" | "Neutral" | "Negative",
 *   summary: string, datetime: string, url: string | null, saved: boolean }>}
 */
export async function analyzeTweet(input, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new Error(
      error.name === "TimeoutError"
        ? "The analysis took too long. Please try again."
        : "Could not reach the server. Is the backend running?",
      { cause: error },
    );
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? `Request failed with status ${response.status}`);
  }
  return body.data;
}
