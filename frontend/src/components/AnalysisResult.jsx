import SentimentBadge from "./SentimentBadge";
import { ExternalIcon, SparklesIcon } from "./icons";
import { formatDateTime, initialOf } from "../lib/format";

function AnalysisResult({ result }) {
  return (
    <article className="result" aria-labelledby="result-title">
      <h3 id="result-title" className="visually-hidden">
        Analysis Results
      </h3>

      <div className="tweet">
        <div className="avatar" aria-hidden="true">
          {initialOf(result.username)}
        </div>
        <div className="tweet-body">
          <div className="tweet-meta">
            <span className="tweet-user">{result.username}</span>
            {result.url && (
              <a className="tweet-link" href={result.url} target="_blank" rel="noreferrer">
                View post <ExternalIcon size={13} />
              </a>
            )}
          </div>
          <p className="tweet-text">{result.content}</p>
        </div>
      </div>

      <div className="insight">
        <div className="insight-header">
          <span className="insight-label">
            <SparklesIcon size={14} /> Claude&apos;s read
          </span>
          <SentimentBadge sentiment={result.sentiment} />
        </div>
        <p className="insight-summary">{result.summary}</p>
        <div className="insight-footer">
          <time dateTime={result.datetime}>{formatDateTime(result.datetime)}</time>
          {result.saved && <span className="chip">Saved to Airtable</span>}
        </div>
      </div>
    </article>
  );
}

export default AnalysisResult;
