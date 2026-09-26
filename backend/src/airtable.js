const AIRTABLE_API = "https://api.airtable.com/v0";

export function createAirtableStore({ token, baseId, tableName }, fetchImpl = fetch) {
  const url = `${AIRTABLE_API}/${baseId}/${encodeURIComponent(tableName)}`;

  return async function saveAnalysis({ username, content, sentiment, summary, datetime }) {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: { username, tweet: content, sentiment, summary, datetime },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Airtable request failed (${response.status}): ${detail}`);
    }
  };
}
