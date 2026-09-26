import { useState } from "react";
import { analyzeTweet } from "../lib/api";

function TweetForm({ onAnalysisComplete }) {
  const [tweetUrl, setTweetUrl] = useState("");
  const [tweetText, setTweetText] = useState("");
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
      setStatus({
        type: "success",
        message: result.saved
          ? "Analysis complete! Saved to Airtable."
          : "Analysis complete!",
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

      setTweetUrl("");
      setTweetText("");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentClass = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "sentiment-positive";
      case "negative":
        return "sentiment-negative";
      default:
        return "sentiment-neutral";
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="tweetUrl">
            Tweet URL
          </label>
          <div className="input-wrapper">
            <span className="input-icon">🔗</span>
            <input
              id="tweetUrl"
              className="form-input"
              type="text"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              placeholder="https://x.com/user/status/123456789"
              disabled={isLoading}
            />
          </div>
          <p className="form-hint">
            Paste any public X/Twitter post URL and Claude will analyze it
          </p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tweetText">
            Tweet text (optional)
          </label>
          <textarea
            id="tweetText"
            className="form-input form-textarea"
            rows={3}
            maxLength={5000}
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="Or paste the tweet text here, e.g. if the URL can't be fetched"
            disabled={isLoading}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <span className="btn-icon">✨</span>
              Analyze Tweet
            </>
          )}
        </button>
      </form>

      {status.message && (
        <div className={`status-message status-${status.type}`}>
          <span className="status-icon">
            {status.type === "success" && "✓"}
            {status.type === "error" && "✕"}
            {status.type === "loading" && ""}
          </span>
          <span>{status.message}</span>
        </div>
      )}

      {analysisResult && (
        <div className="results-section">
          <div className="results-header">
            <h3 className="results-title">Analysis Results</h3>
          </div>
          <div className="results-grid">
            <div className="result-card">
              <div className="result-label">Username</div>
              <div className="result-value">{analysisResult.username}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Sentiment</div>
              <span
                className={`sentiment-badge ${getSentimentClass(
                  analysisResult.sentiment
                )}`}
              >
                {analysisResult.sentiment === "Positive" && "↑ "}
                {analysisResult.sentiment === "Negative" && "↓ "}
                {analysisResult.sentiment === "Neutral" && "→ "}
                {analysisResult.sentiment}
              </span>
            </div>
            <div className="result-card full-width">
              <div className="result-label">Tweet</div>
              <div className="result-value">{analysisResult.content}</div>
            </div>
            <div className="result-card full-width">
              <div className="result-label">Summary</div>
              <div className="result-value">{analysisResult.summary}</div>
            </div>
            <div className="result-card full-width">
              <div className="result-label">Analyzed</div>
              <div className="result-value">
                {formatDate(analysisResult.datetime)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TweetForm;
