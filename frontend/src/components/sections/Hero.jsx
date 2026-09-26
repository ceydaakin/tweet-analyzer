import TweetForm from "../TweetForm";
import { SparklesIcon } from "../icons";

function Hero({ onAnalysisComplete }) {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-inner">
        <p className="eyebrow">
          <SparklesIcon size={14} /> Powered by Claude
        </p>
        <h1 className="hero-title">
          Understand any tweet <span className="gradient-text">in seconds</span>
        </h1>
        <p className="hero-subtitle">
          Paste a link to an X post and get its sentiment and a plain-language summary.
          It reads sarcasm and tone, not just keywords.
        </p>

        <div className="analyzer-shell">
          <div className="analyzer-card">
            <TweetForm onAnalysisComplete={onAnalysisComplete} />
          </div>
        </div>

        <ul className="hero-points" aria-label="Highlights">
          <li>Free and open source</li>
          <li>No sign-up</li>
          <li>History stays in your browser</li>
        </ul>
      </div>
    </section>
  );
}

export default Hero;
