import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { AppError } from "../src/errors.js";

const TWEET_URL = "https://x.com/jack/status/20";
const silentLogger = { error: () => {}, warn: () => {} };

function buildApp(overrides = {}) {
  const calls = { fetched: [], analyzed: [], saved: [] };
  const app = createApp({
    corsOrigins: ["http://localhost:5173"],
    rateLimitPerMinute: 1000,
    logger: silentLogger,
    fetchTweet: async (url) => {
      calls.fetched.push(url);
      return { username: "@jack", content: "just setting up my twttr" };
    },
    analyzeText: async (content) => {
      calls.analyzed.push(content);
      return { sentiment: "Neutral", summary: "Jack is setting up his account." };
    },
    saveAnalysis: async (record) => {
      calls.saved.push(record);
    },
    ...overrides,
  });
  return { app, calls };
}

describe("POST /api/analyze", () => {
  let app;
  let calls;

  beforeEach(() => {
    ({ app, calls } = buildApp());
  });

  it("fetches the tweet from a URL, analyzes it and saves it", async () => {
    const res = await request(app).post("/api/analyze").send({ url: TWEET_URL });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(
      { ...res.body.data, datetime: undefined },
      {
        username: "@jack",
        content: "just setting up my twttr",
        sentiment: "Neutral",
        summary: "Jack is setting up his account.",
        url: TWEET_URL,
        datetime: undefined,
        saved: true,
      },
    );
    assert.ok(!Number.isNaN(Date.parse(res.body.data.datetime)));
    assert.deepEqual(calls.fetched, [TWEET_URL]);
    assert.deepEqual(calls.analyzed, ["just setting up my twttr"]);
    assert.equal(calls.saved.length, 1);
  });

  it("analyzes pasted text without fetching, taking the handle from the URL", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ url: TWEET_URL, text: "  Pasted tweet text  " });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.username, "@jack");
    assert.equal(res.body.data.content, "Pasted tweet text");
    assert.deepEqual(calls.fetched, []);
    assert.deepEqual(calls.analyzed, ["Pasted tweet text"]);
  });

  it("analyzes pasted text with no URL", async () => {
    const res = await request(app).post("/api/analyze").send({ text: "Loving this weather" });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.username, "unknown");
    assert.equal(res.body.data.url, null);
  });

  it("still returns the analysis when saving fails", async () => {
    ({ app } = buildApp({
      saveAnalysis: async () => {
        throw new Error("Airtable down");
      },
    }));

    const res = await request(app).post("/api/analyze").send({ url: TWEET_URL });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.saved, false);
  });

  it("skips saving when storage is not configured", async () => {
    ({ app } = buildApp({ saveAnalysis: null }));

    const res = await request(app).post("/api/analyze").send({ url: TWEET_URL });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.saved, false);
  });

  it("rejects a request with neither url nor text", async () => {
    const res = await request(app).post("/api/analyze").send({});

    assert.equal(res.status, 400);
    assert.match(res.body.error, /url.*text/i);
    assert.equal(calls.analyzed.length, 0);
  });

  it("rejects a URL that is not a tweet", async () => {
    const res = await request(app).post("/api/analyze").send({ url: "https://example.com" });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /tweet url/i);
  });

  it("rejects overly long text", async () => {
    const res = await request(app).post("/api/analyze").send({ text: "a".repeat(5001) });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /5000/);
  });

  it("rejects non-string fields", async () => {
    const res = await request(app).post("/api/analyze").send({ url: 42, text: ["x"] });

    assert.equal(res.status, 400);
  });

  it("rejects a non-object JSON body", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .set("Content-Type", "application/json")
      .send("[1,2]");

    assert.equal(res.status, 400);
  });

  it("rejects malformed JSON", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .set("Content-Type", "application/json")
      .send("{not json");

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("passes AppError status and message through", async () => {
    ({ app } = buildApp({
      fetchTweet: async () => {
        throw new AppError(404, "Could not find that tweet.");
      },
    }));

    const res = await request(app).post("/api/analyze").send({ url: TWEET_URL });

    assert.equal(res.status, 404);
    assert.equal(res.body.error, "Could not find that tweet.");
  });

  it("returns a generic 500 for unexpected errors", async () => {
    ({ app } = buildApp({
      analyzeText: async () => {
        throw new Error("secret internals");
      },
    }));

    const res = await request(app).post("/api/analyze").send({ url: TWEET_URL });

    assert.equal(res.status, 500);
    assert.doesNotMatch(res.body.error, /secret internals/);
  });

  it("rate limits requests per client", async () => {
    ({ app } = buildApp({ rateLimitPerMinute: 2 }));

    await request(app).post("/api/analyze").send({ url: TWEET_URL });
    await request(app).post("/api/analyze").send({ url: TWEET_URL });
    const res = await request(app).post("/api/analyze").send({ url: TWEET_URL });

    assert.equal(res.status, 429);
    assert.equal(res.body.success, false);
  });

  it("only allows configured CORS origins", async () => {
    const allowed = await request(app)
      .post("/api/analyze")
      .set("Origin", "http://localhost:5173")
      .send({ url: TWEET_URL });
    const blocked = await request(app)
      .post("/api/analyze")
      .set("Origin", "https://evil.example")
      .send({ url: TWEET_URL });

    assert.equal(allowed.headers["access-control-allow-origin"], "http://localhost:5173");
    assert.equal(blocked.headers["access-control-allow-origin"], undefined);
  });
});

describe("other routes", () => {
  it("GET /api/health responds ok", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/api/health");

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { success: true, data: { status: "ok" }, error: null });
  });

  it("unknown routes return a JSON 404", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/nope");

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("loadConfig", () => {
  const env = { ANTHROPIC_API_KEY: "sk-test" };
  const airtableEnv = {
    AIRTABLE_TOKEN: "tok",
    AIRTABLE_BASE_ID: "app123",
    AIRTABLE_TABLE_NAME: "Table 1",
  };

  it("applies defaults and leaves Airtable disabled when not configured", () => {
    const config = loadConfig(env);

    assert.equal(config.port, 3001);
    assert.equal(config.model, "claude-opus-5");
    assert.equal(config.rateLimitPerMinute, 10);
    assert.deepEqual(config.corsOrigins, ["http://localhost:5173"]);
    assert.equal(config.airtable, null);
  });

  it("reads Airtable, PORT, model, rate limit and CORS overrides", () => {
    const config = loadConfig({
      ...env,
      ...airtableEnv,
      PORT: "8080",
      ANTHROPIC_MODEL: "claude-sonnet-5",
      RATE_LIMIT_PER_MINUTE: "30",
      CORS_ORIGIN: "https://a.dev, https://b.dev",
    });

    assert.equal(config.port, 8080);
    assert.equal(config.model, "claude-sonnet-5");
    assert.equal(config.rateLimitPerMinute, 30);
    assert.deepEqual(config.corsOrigins, ["https://a.dev", "https://b.dev"]);
    assert.deepEqual(config.airtable, { token: "tok", baseId: "app123", tableName: "Table 1" });
  });

  it("requires ANTHROPIC_API_KEY", () => {
    assert.throws(() => loadConfig({}), /ANTHROPIC_API_KEY/);
  });

  it("requires all Airtable variables once any is set", () => {
    assert.throws(
      () => loadConfig({ ...env, AIRTABLE_TOKEN: "tok" }),
      /AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME/,
    );
  });

  it("rejects invalid numbers", () => {
    assert.throws(() => loadConfig({ ...env, PORT: "abc" }), /PORT/);
    assert.throws(() => loadConfig({ ...env, RATE_LIMIT_PER_MINUTE: "0" }), /RATE_LIMIT_PER_MINUTE/);
  });
});
