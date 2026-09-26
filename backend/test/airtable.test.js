import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAirtableStore } from "../src/airtable.js";

const airtable = { token: "tok", baseId: "app123", tableName: "Table 1" };
const record = {
  username: "@someone",
  content: "What a great day",
  sentiment: "Positive",
  summary: "Someone is having a great day.",
  datetime: "2026-01-01T10:00:00.000Z",
};

describe("createAirtableStore", () => {
  it("posts the record to the Airtable REST API", async () => {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push({ url, init });
      return new Response("{}", { status: 200 });
    };

    await createAirtableStore(airtable, fetchImpl)(record);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.airtable.com/v0/app123/Table%201");
    assert.equal(calls[0].init.method, "POST");
    assert.equal(calls[0].init.headers.Authorization, "Bearer tok");
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      fields: {
        username: "@someone",
        tweet: "What a great day",
        sentiment: "Positive",
        summary: "Someone is having a great day.",
        datetime: "2026-01-01T10:00:00.000Z",
      },
    });
  });

  it("throws with the Airtable status when the request fails", async () => {
    const fetchImpl = async () =>
      new Response('{"error":"INVALID_PERMISSIONS"}', { status: 403 });

    await assert.rejects(
      createAirtableStore(airtable, fetchImpl)(record),
      /Airtable request failed \(403\)/,
    );
  });
});
