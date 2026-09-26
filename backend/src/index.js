import { createApp } from "./app.js";
import { createAirtableStore } from "./airtable.js";
import { loadConfig } from "./config.js";

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = createApp({
  corsOrigins: config.corsOrigins,
  saveAnalysis: createAirtableStore(config.airtable),
});

app.listen(config.port, (error) => {
  if (error) {
    console.error(`Could not start server on port ${config.port}:`, error.message);
    process.exit(1);
  }
  console.log(`Backend running at http://localhost:${config.port}`);
});
