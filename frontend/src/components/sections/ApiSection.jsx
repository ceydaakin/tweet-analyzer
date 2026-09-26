import CopyButton from "../CopyButton";
import { API_BASE_EXAMPLE } from "../../lib/constants";

const REQUEST = `curl -X POST ${API_BASE_EXAMPLE}/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://x.com/jack/status/20"}'`;

const RESPONSE = `{
  "success": true,
  "data": {
    "username": "@jack",
    "content": "just setting up my twttr",
    "sentiment": "Neutral",
    "summary": "Jack announces he is setting up his account.",
    "datetime": "2026-09-26T18:30:00.000Z",
    "url": "https://x.com/jack/status/20",
    "saved": false
  },
  "error": null
}`;

function CodeBlock({ title, code, copyable }) {
  return (
    <div className="code">
      <div className="code-head">
        <span>{title}</span>
        {copyable && <CopyButton text={code} label={`Copy ${title.toLowerCase()}`} />}
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ApiSection() {
  return (
    <section className="section" id="api" aria-labelledby="api-title">
      <div className="container api">
        <div className="api-copy">
          <p className="eyebrow">API</p>
          <h2 id="api-title" className="section-title">One endpoint. JSON in, JSON out.</h2>
          <p className="section-subtitle">
            Run the backend yourself and call it from scripts or other apps. Send a post URL, its
            text, or both.
          </p>
          <ul className="api-points">
            <li>
              <code>POST /api/analyze</code> returns sentiment and summary
            </li>
            <li>
              <code>GET /api/health</code> for uptime checks
            </li>
            <li>Per-IP rate limiting built in</li>
          </ul>
        </div>
        <div className="api-code">
          <CodeBlock title="Request" code={REQUEST} copyable />
          <CodeBlock title="Response" code={RESPONSE} />
        </div>
      </div>
    </section>
  );
}

export default ApiSection;
