const STEPS = [
  {
    title: "Paste a link",
    text: "Drop in any public X post URL, or paste the text if the link can't be fetched.",
  },
  {
    title: "Claude reads it",
    text: "The post is sent to Claude, which weighs tone, context and sarcasm.",
  },
  {
    title: "Get the gist",
    text: "You get the sentiment and a one-to-two sentence summary, ready to scan or save.",
  },
];

function HowItWorks() {
  return (
    <section className="section" id="how-it-works" aria-labelledby="how-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="section-title">From link to insight in three steps</h2>
        </div>
        <ol className="steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="panel step">
              <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
