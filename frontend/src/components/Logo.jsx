import { SparklesIcon } from "./icons";

function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark">
        <SparklesIcon size={16} />
      </span>
      <span className="logo-text">TweetAnalyzer</span>
    </span>
  );
}

export default Logo;
