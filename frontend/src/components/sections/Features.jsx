import {
  ClipboardIcon,
  CodeIcon,
  DatabaseIcon,
  GaugeIcon,
  ShieldIcon,
  TextIcon,
} from "../icons";

const FEATURES = [
  {
    icon: GaugeIcon,
    title: "Sentiment that gets nuance",
    text: "Positive, neutral or negative, judged on what the author actually means, including irony.",
  },
  {
    icon: TextIcon,
    title: "Plain-language summaries",
    text: "One or two sentences that capture the point of the post, in the post's own language.",
  },
  {
    icon: ClipboardIcon,
    title: "Link or text",
    text: "Works from a post URL, or from pasted text when a post can't be fetched.",
  },
  {
    icon: DatabaseIcon,
    title: "Optional Airtable sync",
    text: "Connect an Airtable base and every analysis is saved as a row automatically.",
  },
  {
    icon: ShieldIcon,
    title: "Private by default",
    text: "No accounts. Your history lives in your browser unless you connect Airtable.",
  },
  {
    icon: CodeIcon,
    title: "Open source & self-hostable",
    text: "A small React + Express app you can read end to end and run with your own API key.",
  },
];

function Features() {
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Features</p>
          <h2 id="features-title" className="section-title">Everything you need, nothing you don&apos;t</h2>
        </div>
        <div className="features">
          {FEATURES.map(({ icon: FeatureIcon, title, text }) => (
            <div key={title} className="panel feature">
              <span className="feature-icon">
                <FeatureIcon size={20} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
