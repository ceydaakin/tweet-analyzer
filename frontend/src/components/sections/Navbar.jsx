import Logo from "../Logo";
import { GithubIcon, MoonIcon, SunIcon } from "../icons";
import { REPO_URL } from "../../lib/constants";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#api", label: "API" },
];

function Navbar({ theme, onToggleTheme }) {
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <header className="nav">
      <div className="nav-inner container">
        <a href="#top" className="nav-brand" aria-label="TweetAnalyzer home">
          <Logo />
        </a>
        <nav className="nav-links" aria-label="Main">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a className="icon-button" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub repository">
            <GithubIcon />
          </a>
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <a className="btn btn-small nav-cta" href="#top">
            Try it
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
