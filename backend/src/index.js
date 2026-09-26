import { loadConfig } from "./config.js";
import { createProductionApp } from "./server.js";

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

createProductionApp(config).listen(config.port, (error) => {
  if (error) {
    console.error(`Could not start server on port ${config.port}:`, error.message);
    process.exit(1);
  }
  console.log(`Backend running at http://localhost:${config.port} (model: ${config.model})`);
  if (!config.airtable) console.log("Airtable not configured - analyses will not be saved.");
});
