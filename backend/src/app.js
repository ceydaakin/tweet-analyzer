import express from "express";
import cors from "cors";
import { validateAnalysis } from "./validation.js";

const ok = (data) => ({ success: true, data, error: null });
const fail = (error) => ({ success: false, data: null, error });

export function createApp({ corsOrigins, saveAnalysis, logger = console }) {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_req, res) => {
    res.json(ok({ status: "ok" }));
  });

  app.post("/api/analyze", async (req, res) => {
    const { value, errors } = validateAnalysis(req.body);
    if (errors.length > 0) {
      return res.status(400).json(fail(errors.join("; ")));
    }

    try {
      await saveAnalysis(value);
      return res.status(201).json(ok(value));
    } catch (error) {
      logger.error("Failed to save analysis:", error.message);
      return res.status(502).json(fail("Could not save the analysis. Please try again later."));
    }
  });

  app.use((_req, res) => {
    res.status(404).json(fail("Not found"));
  });

  // Express 5 routes async errors here too; body-parser errors carry a status.
  app.use((err, _req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) logger.error("Unhandled error:", err);
    res.status(status).json(fail(status >= 500 ? "Internal server error" : "Invalid request"));
  });

  return app;
}
