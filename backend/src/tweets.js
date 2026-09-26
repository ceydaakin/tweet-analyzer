import { AppError } from "./errors.js";

// FxTwitter is a free, unofficial mirror of X's public data. X's own API is paid
// and its oEmbed endpoint no longer works, so this is the no-key option.
const FXTWITTER_API = "https://api.fxtwitter.com";
const TWEET_HOSTS = new Set(["x.com", "twitter.com", "mobile.twitter.com", "mobile.x.com"]);
const TWEET_PATH = /^\/([A-Za-z0-9_]{1,15})\/status(?:es)?\/(\d{1,20})(?:\/|$)/;
const REQUEST_TIMEOUT_MS = 8_000;

const PASTE_HINT = "Paste the tweet text instead.";

/**
 * @param {string} value
 * @returns {{ handle: string, id: string } | null}
 */
export function parseTweetUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!TWEET_HOSTS.has(url.hostname.replace(/^www\./, ""))) return null;

  const match = TWEET_PATH.exec(url.pathname);
  return match ? { handle: match[1], id: match[2] } : null;
}

export function createTweetFetcher(fetchImpl = fetch) {
  /**
   * @param {string} tweetUrl - must already be validated with parseTweetUrl
   * @returns {Promise<{ username: string, content: string }>}
   */
  return async function fetchTweet(tweetUrl) {
    const { handle, id } = parseTweetUrl(tweetUrl);

    let response;
    try {
      response = await fetchImpl(`${FXTWITTER_API}/${handle}/status/${id}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new AppError(502, `Could not reach the tweet service. ${PASTE_HINT}`, { cause: error });
    }

    if (response.status === 404) {
      throw new AppError(404, `Could not find that tweet. It may be deleted or private. ${PASTE_HINT}`);
    }
    if (!response.ok) {
      throw new AppError(502, `The tweet service returned an error. ${PASTE_HINT}`);
    }

    const body = await response.json().catch(() => null);
    const text = body?.tweet?.text?.trim();
    if (!text) {
      throw new AppError(422, `That tweet has no text to analyze. ${PASTE_HINT}`);
    }

    return {
      username: `@${body.tweet.author?.screen_name ?? handle}`,
      content: text,
    };
  };
}
