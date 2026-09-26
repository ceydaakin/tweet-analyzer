// Placeholder analysis: the tweet URL is not fetched yet, so every run analyzes
// the same sample text. Swap this for a real tweet fetch + LLM call later.
export const SAMPLE_TWEET_CONTENT =
  "This is a great example tweet for testing our AI tool.";

const SUMMARY_LENGTH = 50;

export function analyzeTweet(content, now = new Date()) {
  return {
    summary: content.length > SUMMARY_LENGTH ? `${content.slice(0, SUMMARY_LENGTH)}...` : content,
    sentiment: content.toLowerCase().includes("great") ? "Positive" : "Neutral",
    datetime: now.toISOString(),
    username: "@dummy_user",
  };
}
