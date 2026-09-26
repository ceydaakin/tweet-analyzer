import Anthropic from "@anthropic-ai/sdk";
import { createApp } from "./app.js";
import { createAirtableStore } from "./airtable.js";
import { createClaudeAnalyzer } from "./analyzer.js";
import { createTweetFetcher } from "./tweets.js";

/** Wires the app to its real dependencies. Shared by the local server and the Vercel function. */
export function createProductionApp(config) {
  return createApp({
    corsOrigins: config.corsOrigins,
    rateLimitPerMinute: config.rateLimitPerMinute,
    trustProxy: config.trustProxy,
    fetchTweet: createTweetFetcher(),
    analyzeText: createClaudeAnalyzer({
      client: new Anthropic({ timeout: 60_000 }),
      model: config.model,
    }),
    saveAnalysis: config.airtable ? createAirtableStore(config.airtable) : null,
  });
}
