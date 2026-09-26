import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { AppError } from "./errors.js";
import { parseTweetUrl } from "./tweets.js";
import { validateAnalyzeRequest } from "./validation.js";

const ok = (data) => ({ success: true, data, error: null });
const fail = (error) => ({ success: false, data: null, error });

/**
 * @param {object} deps
 * @param {string[]} deps.corsOrigins
 * @param {number} deps.rateLimitPerMinute - per client IP, on /api/analyze
 * @param {number} [deps.trustProxy] - reverse proxies to trust for the client IP
 * @param {(url: string) => Promise<{ username: string, content: string }>} deps.fetchTweet
 * @param {(content: string) => Promise<{ sentiment: string, summary: string }>} deps.analyzeText
 * @param {((record: object) => Promise<void>) | null} deps.saveAnalysis - null disables saving
 */
export function createApp({
  corsOrigins,
  rateLimitPerMinute,
  trustProxy = 0,
  fetchTweet,
  analyzeText,
  saveAnalysis,
  logger = console,
}) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", trustProxy);
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_req, res) => {
    res.json(ok({ status: "ok" }));
  });

  const analyzeLimiter = rateLimit({
    windowMs: 60_000,
    limit: rateLimitPerMinute,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json(fail("Too many analyses. Please wait a minute and try again."));
    },
  });

  app.post("/api/analyze", analyzeLimiter, async (req, res) => {
    const { value, errors } = validateAnalyzeRequest(req.body);
    if (errors.length > 0) {
      return res.status(400).json(fail(errors.join("; ")));
    }

    const tweet = value.text
      ? { username: handleFrom(value.url), content: value.text }
      : await fetchTweet(value.url);
    const analysis = await analyzeText(tweet.content);

    const record = {
      username: tweet.username,
      content: tweet.content,
      sentiment: analysis.sentiment,
      summary: analysis.summary,
      datetime: new Date().toISOString(),
      url: value.url,
    };
    const saved = await trySave(saveAnalysis, record, logger);

    return res.json(ok({ ...record, saved }));
  });

  app.use((_req, res) => {
    res.status(404).json(fail("Not found"));
  });

  // Express 5 forwards rejected async handlers here; body-parser errors carry a status.
  app.use((err, _req, res, _next) => {
    if (err instanceof AppError) {
      return res.status(err.status).json(fail(err.message));
    }
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) logger.error("Unhandled error:", err);
    return res.status(status).json(fail(status >= 500 ? "Internal server error" : "Invalid request"));
  });

  return app;
}

function handleFrom(url) {
  const parsed = url && parseTweetUrl(url);
  return parsed ? `@${parsed.handle}` : "unknown";
}

async function trySave(saveAnalysis, record, logger) {
  if (!saveAnalysis) return false;
  try {
    await saveAnalysis(record);
    return true;
  } catch (error) {
    logger.error("Failed to save analysis:", error.message);
    return false;
  }
}
