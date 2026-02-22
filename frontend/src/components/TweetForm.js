import React, { useState } from "react";
import axios from "axios";

function TweetForm({ onAnalysisComplete }) {
  const [tweetUrl, setTweetUrl] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fakeTweetContent =
    "This is a great example tweet for testing our AI tool.";

  const analyzeTweet = (content) => {
    return {
      summary: content.slice(0, 50) + "...",
      sentiment: content.includes("great") ? "Positive" : "Neutral",
      datetime: new Date().toISOString(),
      username: "@dummy_user",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tweetUrl.trim()) {
      setStatus({ type: "error", message: "Please enter a tweet URL" });
      return;
    }

    setIsLoading(true);
    setStatus({ type: "loading", message: "Analyzing tweet..." });
    setAnalysisResult(null);

    const content = fakeTweetContent;
    const analysis = analyzeTweet(content);

    try {
      await axios.post("http://localhost:5000/api/analyze", {
        username: analysis.username,
        content,
        sentiment: analysis.sentiment,
        summary: analysis.summary,
        datetime: analysis.datetime,
      });

      const result = { ...analysis, content };
      setAnalysisResult(result);
      setStatus({
        type: "success",
        message: "Analysis complete! Results saved to database.",
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

      setTweetUrl("");
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to save analysis. Please try again.",
      });
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
              placeholder="https://twitter.com/user/status/123456789"
              disabled={isLoading}
            />
          </div>
          <p className="form-hint">
            Paste any Twitter/X post URL to analyze its sentiment and content
          </p>
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
