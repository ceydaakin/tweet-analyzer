const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

export async function saveAnalysis(analysis, fetchImpl = fetch) {
  const response = await fetchImpl(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analysis),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new Error(body?.error ?? `Request failed with status ${response.status}`);
  }
  return body.data;
}
