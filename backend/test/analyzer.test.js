import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Anthropic from "@anthropic-ai/sdk";
import { createClaudeAnalyzer } from "../src/analyzer.js";

function fakeClient(impl) {
  const calls = [];
  return {
    calls,
    beta: {
      messages: {
        parse: async (params) => {
          calls.push(params);
          return impl(params);
        },
      },
    },
  };
}

const silentLogger = { error: () => {}, warn: () => {} };

describe("createClaudeAnalyzer", () => {
  it("sends the tweet to Claude and returns the structured analysis", async () => {
    const client = fakeClient(() => ({
      stop_reason: "end_turn",
      parsed_output: { sentiment: "Positive", summary: "Jack is setting up Twitter." },
    }));
    const analyze = createClaudeAnalyzer({ client, model: "claude-opus-5", logger: silentLogger });

    const result = await analyze("just setting up my twttr");

    assert.deepEqual(result, { sentiment: "Positive", summary: "Jack is setting up Twitter." });
    const params = client.calls[0];
    assert.equal(params.model, "claude-opus-5");
    assert.equal(params.fallbacks, "default");
    assert.deepEqual(params.betas, ["server-side-fallback-2026-07-01"]);
    assert.equal(params.output_config.effort, "low");
    assert.ok(params.output_config.format, "uses structured output");
    assert.match(params.system, /untrusted/i);
    assert.match(params.messages[0].content, /<tweet>\njust setting up my twttr\n<\/tweet>/);
  });

  it("throws a 422 AppError when Claude refuses", async () => {
    const client = fakeClient(() => ({
      stop_reason: "refusal",
      stop_details: { category: "cyber" },
      parsed_output: null,
    }));
    const analyze = createClaudeAnalyzer({ client, model: "m", logger: silentLogger });

    await assert.rejects(analyze("x"), { status: 422, message: /declined/i });
  });

  it("throws a 502 AppError when the output cannot be parsed", async () => {
    const client = fakeClient(() => ({ stop_reason: "max_tokens", parsed_output: null }));
    const analyze = createClaudeAnalyzer({ client, model: "m", logger: silentLogger });

    await assert.rejects(analyze("x"), { status: 502 });
  });

  it("maps a rate limit to 503", async () => {
    const client = fakeClient(() => {
      throw new Anthropic.RateLimitError(429, { error: {} }, "rate limited", new Headers());
    });
    const analyze = createClaudeAnalyzer({ client, model: "m", logger: silentLogger });

    await assert.rejects(analyze("x"), { status: 503, message: /busy/i });
  });

  it("maps an authentication failure to 500 without leaking details", async () => {
    const client = fakeClient(() => {
      throw new Anthropic.AuthenticationError(401, { error: {} }, "invalid x-api-key", new Headers());
    });
    const analyze = createClaudeAnalyzer({ client, model: "m", logger: silentLogger });

    await assert.rejects(analyze("x"), (error) => {
      assert.equal(error.status, 500);
      assert.doesNotMatch(error.message, /x-api-key/);
      return true;
    });
  });

  it("maps connection errors and other API errors to 502", async () => {
    for (const thrown of [
      new Anthropic.APIConnectionError({ message: "socket hang up" }),
      new Anthropic.InternalServerError(500, { error: {} }, "boom", new Headers()),
    ]) {
      const client = fakeClient(() => {
        throw thrown;
      });
      const analyze = createClaudeAnalyzer({ client, model: "m", logger: silentLogger });

      await assert.rejects(analyze("x"), { status: 502 });
    }
  });

  it("maps an off-schema response (SDK parse error) to 502", async () => {
    const client = fakeClient(() => {
      throw new Anthropic.AnthropicError("Failed to parse structured output");
    });
    const analyze = createClaudeAnalyzer({ client, model: "m", logger: silentLogger });

    await assert.rejects(analyze("x"), { status: 502, message: /incomplete/i });
  });

  it("rethrows unexpected non-API errors", async () => {
    const client = fakeClient(() => {
      throw new TypeError("bug");
    });
    const analyze = createClaudeAnalyzer({ client, model: "m", logger: silentLogger });

    await assert.rejects(analyze("x"), TypeError);
  });
});
