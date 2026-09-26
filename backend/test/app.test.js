import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const validBody = {
  username: "@someone",
  content: "What a great day",
  sentiment: "Positive",
  summary: "Someone is having a great day.",
  datetime: "2026-01-01T10:00:00.000Z",
};

describe("POST /api/analyze", () => {
  let saved;
  let app;

  beforeEach(() => {
    saved = [];
    app = createApp({
      corsOrigins: ["http://localhost:5173"],
      saveAnalysis: async (record) => {
        saved.push(record);
      },
    });
  });

  it("saves a valid analysis and returns 201", async () => {
    const res = await request(app).post("/api/analyze").send(validBody);

    assert.equal(res.status, 201);
    assert.deepEqual(res.body, { success: true, data: validBody, error: null });
    assert.deepEqual(saved, [validBody]);
  });

  it("rejects a body with missing fields", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ username: "@someone" });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /content/);
    assert.equal(saved.length, 0);
  });

  it("rejects an unknown sentiment value", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ ...validBody, sentiment: "Ecstatic" });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /sentiment/);
  });

  it("rejects an invalid datetime", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ ...validBody, datetime: "yesterday" });

    assert.equal(res.status, 400);
    assert.match(res.body.error, /datetime/);
  });

  it("rejects malformed JSON", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .set("Content-Type", "application/json")
      .send("{not json");

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("returns 502 without leaking details when storage fails", async () => {
    const failingApp = createApp({
      corsOrigins: [],
      saveAnalysis: async () => {
        throw new Error("Airtable said: secret internals");
      },
      logger: { error: () => {} },
    });

    const res = await request(failingApp).post("/api/analyze").send(validBody);

    assert.equal(res.status, 502);
    assert.equal(res.body.success, false);
    assert.doesNotMatch(res.body.error, /secret internals/);
  });

  it("only allows configured CORS origins", async () => {
    const allowed = await request(app)
      .post("/api/analyze")
      .set("Origin", "http://localhost:5173")
      .send(validBody);
    const blocked = await request(app)
      .post("/api/analyze")
      .set("Origin", "https://evil.example")
      .send(validBody);

    assert.equal(
      allowed.headers["access-control-allow-origin"],
      "http://localhost:5173",
    );
    assert.equal(blocked.headers["access-control-allow-origin"], undefined);
  });
});

describe("GET /api/health", () => {
  it("responds ok", async () => {
    const app = createApp({ corsOrigins: [], saveAnalysis: async () => {} });
    const res = await request(app).get("/api/health");

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { success: true, data: { status: "ok" }, error: null });
  });
});

describe("loadConfig", () => {
  const env = {
    AIRTABLE_TOKEN: "tok",
    AIRTABLE_BASE_ID: "app123",
    AIRTABLE_TABLE_NAME: "Table 1",
  };

  it("reads required values and applies defaults", () => {
    const config = loadConfig(env);

    assert.equal(config.port, 3001);
    assert.deepEqual(config.corsOrigins, ["http://localhost:5173"]);
    assert.equal(config.airtable.tableName, "Table 1");
  });

  it("parses PORT and a comma-separated CORS_ORIGIN", () => {
    const config = loadConfig({
      ...env,
      PORT: "8080",
      CORS_ORIGIN: "https://a.dev, https://b.dev",
    });

    assert.equal(config.port, 8080);
    assert.deepEqual(config.corsOrigins, ["https://a.dev", "https://b.dev"]);
  });

  it("fails fast listing every missing variable", () => {
    assert.throws(
      () => loadConfig({}),
      /AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME/,
    );
  });

  it("rejects an invalid PORT", () => {
    assert.throws(() => loadConfig({ ...env, PORT: "abc" }), /PORT/);
  });
});
