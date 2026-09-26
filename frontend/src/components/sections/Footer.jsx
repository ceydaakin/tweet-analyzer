import Logo from "../Logo";
import { ArrowRightIcon, GithubIcon } from "../icons";
import { REPO_URL } from "../../lib/constants";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cta panel">
          <div>
            <h2 className="cta-title">Try it on a tweet right now</h2>
            <p className="section-subtitle">Free, no account needed.</p>
          </div>
          <div className="cta-actions">
            <a className="btn btn-primary" href="#top">
              Analyze a tweet <ArrowRightIcon size={16} />
            </a>
            <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">
              <GithubIcon size={16} /> View source
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <Logo />
          <p>Built with React, Vite, Express and Claude. Not affiliated with X Corp.</p>
          <p>© {new Date().getFullYear()} TweetAnalyzer</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
