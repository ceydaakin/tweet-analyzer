// Vercel Function: serves every /api/* route with the Express backend.
// vercel.json rewrites /api/(.*) here; Express still sees the original path.
import { loadConfig } from "../backend/src/config.js";
import { createProductionApp } from "../backend/src/server.js";

function createHandler() {
  try {
    // Vercel sits in front as one reverse proxy.
    const config = loadConfig({ TRUST_PROXY: "1", ...process.env });
    return createProductionApp(config);
  } catch (error) {
    console.error("Backend is not configured:", error.message);
    return (_req, res) => {
      res.status(503).json({
        success: false,
        data: null,
        error: "The analyzer is not configured yet. Please try again later.",
      });
    };
  }
}

export default createHandler();
