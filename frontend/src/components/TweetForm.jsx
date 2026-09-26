import { useState } from "react";
import AnalysisResult from "./AnalysisResult";
import { ArrowRightIcon, LinkIcon } from "./icons";
import { analyzeTweet } from "../lib/api";

const MAX_TEXT_LENGTH = 5000;

function TweetForm({ onAnalysisComplete }) {
  const [tweetUrl, setTweetUrl] = useState("");
  const [tweetText, setTweetText] = useState("");
  const [showText, setShowText] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = tweetUrl.trim();
    const text = tweetText.trim();
    if (!url && !text) {
      setStatus({ type: "error", message: "Enter a tweet URL or paste the tweet text" });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "loading", message: "Claude is reading the tweet..." });
    setAnalysisResult(null);

    try {
      const result = await analyzeTweet({ url: url || undefined, text: text || undefined });
      setAnalysisResult(result);
      setStatus({ type: "", message: "" });
      onAnalysisComplete?.(result);
      setTweetUrl("");
      setTweetText("");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="analyzer">
      <form onSubmit={handleSubmit} className="analyzer-form" noValidate>
        <label className="visually-hidden" htmlFor="tweetUrl">
          Tweet URL
        </label>
        <div className="url-field">
          <LinkIcon className="url-field-icon" />
          <input
            id="tweetUrl"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            placeholder="Paste a post link, e.g. https://x.com/user/status/123"
            disabled={isLoading}
          />
          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? <span className="spinner" aria-hidden="true" /> : null}
            {isLoading ? "Analyzing..." : "Analyze Tweet"}
            {!isLoading && <ArrowRightIcon size={16} />}
          </button>
        </div>

        {showText ? (
          <div className="text-field">
            <label htmlFor="tweetText">Tweet text (optional)</label>
            <textarea
              id="tweetText"
              rows={3}
              maxLength={MAX_TEXT_LENGTH}
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="Paste the tweet text. Used instead of fetching the link."
              disabled={isLoading}
            />
          </div>
        ) : (
          <button type="button" className="link-button" onClick={() => setShowText(true)}>
            Link not working? Paste the text instead
          </button>
        )}
      </form>

      {status.message && (
        <div className={`status status-${status.type}`} role={status.type === "error" ? "alert" : "status"}>
          {status.type === "loading" && <span className="spinner spinner-muted" aria-hidden="true" />}
          {status.message}
        </div>
      )}

      {analysisResult && <AnalysisResult result={analysisResult} />}
    </div>
  );
}

export default TweetForm;
