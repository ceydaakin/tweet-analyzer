import Anthropic from "@anthropic-ai/sdk";
import { createApp } from "./app.js";
import { createAirtableStore } from "./airtable.js";
import { createClaudeAnalyzer } from "./analyzer.js";
import { loadConfig } from "./config.js";
import { createTweetFetcher } from "./tweets.js";

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = createApp({
  corsOrigins: config.corsOrigins,
  rateLimitPerMinute: config.rateLimitPerMinute,
  fetchTweet: createTweetFetcher(),
  analyzeText: createClaudeAnalyzer({
    client: new Anthropic({ timeout: 60_000 }),
    model: config.model,
  }),
  saveAnalysis: config.airtable ? createAirtableStore(config.airtable) : null,
});

app.listen(config.port, (error) => {
  if (error) {
    console.error(`Could not start server on port ${config.port}:`, error.message);
    process.exit(1);
  }
  console.log(`Backend running at http://localhost:${config.port} (model: ${config.model})`);
  if (!config.airtable) console.log("Airtable not configured - analyses will not be saved.");
});
