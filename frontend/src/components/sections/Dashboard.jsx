import SentimentBadge from "../SentimentBadge";
import { TrashIcon } from "../icons";
import { formatTimeAgo, initialOf } from "../../lib/format";

const SEGMENTS = [
  { key: "positive", label: "Positive" },
  { key: "neutral", label: "Neutral" },
  { key: "negative", label: "Negative" },
];

function SentimentBreakdown({ stats }) {
  return (
    <div className="panel stats">
      <div className="stats-total">
        <span className="stats-number">{stats.total}</span>
        <span className="stats-caption">Analyzed</span>
      </div>
      <div className="stats-bar" aria-hidden="true">
        {SEGMENTS.map(({ key }) =>
          stats[key] > 0 ? (
            <span key={key} className={`bar-${key}`} style={{ flexGrow: stats[key] }} />
          ) : null,
        )}
      </div>
      <dl className="stats-legend">
        {SEGMENTS.map(({ key, label }) => (
          <div key={key} className={`legend-${key}`}>
            <dt>{label}</dt>
            <dd>{stats[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function HistoryList({ items }) {
  if (items.length === 0) {
    return (
      <div className="panel empty">
        <p>No analyses yet. Paste a tweet link above to get started.</p>
      </div>
    );
  }
  return (
    <ul className="panel history">
      {items.map((item) => (
        <li key={`${item.datetime}-${item.username}`} className="history-item">
          <div className="avatar avatar-small" aria-hidden="true">
            {initialOf(item.username)}
          </div>
          <div className="history-body">
            <div className="history-meta">
              <span className="tweet-user">{item.username}</span>
              <span className="history-time">{formatTimeAgo(item.datetime)}</span>
            </div>
            <p className="history-summary">{item.summary}</p>
          </div>
          <SentimentBadge sentiment={item.sentiment} />
        </li>
      ))}
    </ul>
  );
}

function Dashboard({ items, stats, onClear }) {
  return (
    <section className="section" id="history" aria-labelledby="history-title">
      <div className="container">
        <div className="section-head section-head-row">
          <div>
            <h2 id="history-title" className="section-title">Recent Analyses</h2>
            <p className="section-subtitle">Saved in this browser only.</p>
          </div>
          {items.length > 0 && (
            <button type="button" className="btn btn-ghost btn-small" onClick={onClear}>
              <TrashIcon size={15} /> Clear
            </button>
          )}
        </div>
        <div className="dashboard">
          <SentimentBreakdown stats={stats} />
          <HistoryList items={items} />
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
