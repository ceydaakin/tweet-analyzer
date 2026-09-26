const ARROWS = { Positive: "↑", Neutral: "→", Negative: "↓" };

function SentimentBadge({ sentiment }) {
  const tone = ARROWS[sentiment] ? sentiment.toLowerCase() : "neutral";
  return (
    <span className={`sentiment sentiment-${tone}`}>
      <span aria-hidden="true">{ARROWS[sentiment] ?? "→"}</span>
      {sentiment}
    </span>
  );
}

export default SentimentBadge;
