// Vercel entrypoint: exports the Express app instead of calling listen().
import express from "express";
import { loadConfig } from "./config.js";
import { createProductionApp } from "./server.js";

function createNotConfiguredApp(reason) {
  console.error("Backend is not configured:", reason);
  const app = express();
  // Same route prefix as the real app, so a misrouted request shows up as a 404.
  app.use("/api", (_req, res) => {
    res.status(503).json({
      success: false,
      data: null,
      error: "The analyzer is not configured yet. Please try again later.",
    });
  });
  app.use((_req, res) => {
    res.status(404).json({ success: false, data: null, error: "Not found" });
  });
  return app;
}

function createVercelApp() {
  try {
    // Vercel sits in front as one reverse proxy.
    return createProductionApp(loadConfig({ TRUST_PROXY: "1", ...process.env }));
  } catch (error) {
    return createNotConfiguredApp(error.message);
  }
}

export default createVercelApp();
