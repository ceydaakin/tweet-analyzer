import React, { useState, useEffect } from "react";
import TweetForm from "./components/TweetForm";
import "./App.css";

function App() {
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
  });
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });

  // Smooth scroll to section
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowSignupModal(false);
        setShowContactModal(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleAnalysisComplete = (result) => {
    setAnalysisHistory((prev) => [result, ...prev].slice(0, 10));
    setStats((prev) => ({
      total: prev.total + 1,
      positive: prev.positive + (result.sentiment === "Positive" ? 1 : 0),
      negative: prev.negative + (result.sentiment === "Negative" ? 1 : 0),
    }));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (signupEmail) {
      setFormStatus({
        type: "success",
        message: "Thanks for signing up! Check your email for next steps.",
      });
      setSignupEmail("");
      setTimeout(() => {
        setShowSignupModal(false);
        setFormStatus({ type: "", message: "" });
      }, 2000);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setFormStatus({
        type: "success",
        message: "Message sent! We'll get back to you within 24 hours.",
      });
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => {
        setShowContactModal(false);
        setFormStatus({ type: "", message: "" });
      }, 2000);
    }
  };

  const formatTimeAgo = (isoString) => {
    const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  const getSentimentClass = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "sentiment-positive";
      case "negative":
        return "sentiment-negative";
      default:
        return "sentiment-neutral";
    }
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <a
            href="#top"
            className="nav-brand"
            onClick={(e) => scrollToSection(e, "top")}
          >
            <div className="nav-logo">T</div>
            <span className="nav-title">TweetAnalyzer</span>
          </a>
          <div className="nav-links">
            <a
              href="#features"
              className="nav-link"
              onClick={(e) => scrollToSection(e, "features")}
            >
              Features
            </a>
            <a
              href="#docs"
              className="nav-link"
              onClick={(e) => scrollToSection(e, "docs")}
            >
              Docs
            </a>
            <button
              className="nav-link nav-cta"
              onClick={() => setShowSignupModal(true)}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-container">
          <div className="hero-badge">
            <span>100% Free & AI-Powered</span>
          </div>
          <h1 className="hero-title">
            Understand Your Tweets with AI Analysis
          </h1>
          <p className="hero-subtitle">
            Get instant sentiment analysis, key insights, and comprehensive
            summaries of any tweet. 100% free, no limits, no credit card required.
          </p>
        </div>
      </section>

      {/* Analyzer Section */}
      <section className="analyzer-section">
        <div className="card analyzer-card">
          <div className="card-body">
            <TweetForm onAnalysisComplete={handleAnalysisComplete} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-grid">
          {/* History Section */}
          <div className="history-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Analyses</h2>
              </div>
              {analysisHistory.length === 0 ? (
                <div className="history-empty">
                  <div className="history-empty-icon">📊</div>
                  <p className="history-empty-text">
                    No analyses yet. Enter a tweet URL above to get started.
                  </p>
                </div>
              ) : (
                <div className="history-list">
                  {analysisHistory.map((item, index) => (
                    <div key={index} className="history-item">
                      <div className="history-avatar">
                        {item.username.charAt(1).toUpperCase()}
                      </div>
                      <div className="history-content">
                        <div className="history-username">{item.username}</div>
                        <div className="history-summary">{item.summary}</div>
                        <div className="history-meta">
                          <span
                            className={`sentiment-badge ${getSentimentClass(
                              item.sentiment
                            )}`}
                          >
                            {item.sentiment}
                          </span>
                          <span className="history-time">
                            {formatTimeAgo(item.datetime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            {/* Stats Card */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div className="card-header">
                <h3 className="card-title">Your Stats</h3>
              </div>
              <div className="card-body">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Analyzed</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: "#00ba7c" }}>
                      {stats.positive}
                    </div>
                    <div className="stat-label">Positive</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: "#f4212e" }}>
                      {stats.negative}
                    </div>
                    <div className="stat-label">Negative</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={(e) => scrollToSection(e, "features")}
                  >
                    <span>🚀</span> Explore Features
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={(e) => scrollToSection(e, "docs")}
                  >
                    <span>📖</span> View API Docs
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowContactModal(true)}
                  >
                    <span>💬</span> Get Support
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to understand social media sentiment at scale
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">🎯</div>
              <h3>Sentiment Analysis</h3>
              <p>
                Advanced AI detects positive, negative, and neutral sentiment
                with 95% accuracy. Understand the emotional tone of any tweet
                instantly.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">📝</div>
              <h3>Smart Summaries</h3>
              <p>
                Get concise, AI-generated summaries that capture the key message
                of any tweet. Perfect for quick content review.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>
                Track sentiment trends over time with beautiful charts and
                exportable reports. Make data-driven decisions.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">⚡</div>
              <h3>Real-time Processing</h3>
              <p>
                Results in milliseconds, not minutes. Our optimized
                infrastructure handles millions of requests daily.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">🔗</div>
              <h3>API Access</h3>
              <p>
                Integrate sentiment analysis into your own apps with our
                developer-friendly REST API. Full documentation included.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">💾</div>
              <h3>Auto-Save & Export</h3>
              <p>
                All analyses are automatically saved. Export to CSV, JSON, or
                connect directly to your database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Docs Section */}
      <section className="docs-section" id="docs">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">API Documentation</h2>
            <p className="section-subtitle">
              Integrate TweetAnalyzer into your applications
            </p>
          </div>
          <div className="docs-content">
            <div className="docs-sidebar">
              <h4>Quick Links</h4>
              <ul className="docs-nav">
                <li className="active">Getting Started</li>
                <li>Authentication</li>
                <li>Analyze Endpoint</li>
                <li>Response Format</li>
                <li>Rate Limits</li>
                <li>Error Codes</li>
              </ul>
            </div>
            <div className="docs-main">
              <h3>Getting Started</h3>
              <p>
                The TweetAnalyzer API allows you to analyze tweet sentiment
                programmatically. All API requests require authentication using
                an API key.
              </p>
              <div className="code-block">
                <div className="code-header">
                  <span>Example Request</span>
                  <button
                    className="code-copy"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        'curl -X POST https://api.tweetanalyzer.com/v1/analyze \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"url": "https://twitter.com/user/status/123"}\''
                      )
                    }
                  >
                    Copy
                  </button>
                </div>
                <pre>
                  <code>
{`curl -X POST https://api.tweetanalyzer.com/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://twitter.com/user/status/123"}'`}
                  </code>
                </pre>
              </div>
              <div className="code-block">
                <div className="code-header">
                  <span>Example Response</span>
                </div>
                <pre>
                  <code>
{`{
  "success": true,
  "data": {
    "sentiment": "positive",
    "confidence": 0.94,
    "summary": "User expresses excitement about...",
    "username": "@example_user",
    "analyzed_at": "2024-01-15T10:30:00Z"
  }
}`}
                  </code>
                </pre>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowSignupModal(true)}
              >
                Get Your API Key
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-brand">
              <div className="nav-logo">T</div>
              <span className="nav-title">TweetAnalyzer</span>
            </div>
            <p className="footer-tagline">
              Free AI-powered tweet analysis for everyone
            </p>
          </div>
          <div className="footer-links-simple">
            <a
              href="#features"
              className="footer-link"
              onClick={(e) => scrollToSection(e, "features")}
            >
              Features
            </a>
            <a
              href="#docs"
              className="footer-link"
              onClick={(e) => scrollToSection(e, "docs")}
            >
              API Docs
            </a>
            <a
              href="#contact"
              className="footer-link"
              onClick={(e) => {
                e.preventDefault();
                setShowContactModal(true);
              }}
            >
              Contact
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 TweetAnalyzer. All rights reserved.</p>
        </div>
      </footer>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="modal-overlay" onClick={() => setShowSignupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowSignupModal(false)}
            >
              ✕
            </button>
            <div className="modal-header">
              <h2>Create Your Account</h2>
              <p>Start analyzing tweets for free - no credit card required</p>
            </div>
            <form onSubmit={handleSignup} className="modal-form">
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-input modal-input"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              {formStatus.message && (
                <div className={`status-message status-${formStatus.type}`}>
                  {formStatus.message}
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-full">
                Create Free Account
              </button>
              <p className="modal-footer-text">
                By signing up, you agree to our Terms and Privacy Policy
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowContactModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowContactModal(false)}
            >
              ✕
            </button>
            <div className="modal-header">
              <h2>Contact Us</h2>
              <p>Have questions? We'd love to hear from you.</p>
            </div>
            <form onSubmit={handleContactSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input modal-input"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input modal-input"
                  placeholder="you@example.com"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input modal-input form-textarea"
                  placeholder="How can we help?"
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  required
                />
              </div>
              {formStatus.message && (
                <div className={`status-message status-${formStatus.type}`}>
                  {formStatus.message}
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-full">
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
