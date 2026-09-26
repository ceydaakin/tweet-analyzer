const REQUIRED_VARS = ["AIRTABLE_TOKEN", "AIRTABLE_BASE_ID", "AIRTABLE_TABLE_NAME"];
const DEFAULT_PORT = 3001;
const DEFAULT_CORS_ORIGIN = "http://localhost:5173";

function parsePort(value) {
  if (value === undefined || value === "") return DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT "${value}": must be an integer 1-65535`);
  }
  return port;
}

function parseOrigins(value) {
  return (value || DEFAULT_CORS_ORIGIN)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function loadConfig(env = process.env) {
  const missing = REQUIRED_VARS.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Copy backend/.env.example to backend/.env and fill them in.",
    );
  }

  return Object.freeze({
    port: parsePort(env.PORT),
    corsOrigins: parseOrigins(env.CORS_ORIGIN),
    airtable: Object.freeze({
      token: env.AIRTABLE_TOKEN.trim(),
      baseId: env.AIRTABLE_BASE_ID.trim(),
      tableName: env.AIRTABLE_TABLE_NAME.trim(),
    }),
  });
}
