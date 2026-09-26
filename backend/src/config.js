const AIRTABLE_VARS = ["AIRTABLE_TOKEN", "AIRTABLE_BASE_ID", "AIRTABLE_TABLE_NAME"];
const DEFAULTS = Object.freeze({
  port: 3001,
  model: "claude-opus-5",
  rateLimitPerMinute: 10,
  corsOrigin: "http://localhost:5173",
  trustProxy: 0,
});

function parseInteger(name, value, fallback, min, max) {
  if (value === undefined || value === "") return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`Invalid ${name} "${value}": must be an integer ${min}-${max}`);
  }
  return number;
}

function parseOrigins(value) {
  return (value || DEFAULTS.corsOrigin)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Airtable is optional, but a half-configured Airtable is almost certainly a mistake.
function parseAirtable(env) {
  const present = AIRTABLE_VARS.filter((name) => env[name]?.trim());
  if (present.length === 0) return null;
  if (present.length < AIRTABLE_VARS.length) {
    const missing = AIRTABLE_VARS.filter((name) => !present.includes(name));
    throw new Error(`Airtable is partly configured. Also set: ${missing.join(", ")}`);
  }
  return Object.freeze({
    token: env.AIRTABLE_TOKEN.trim(),
    baseId: env.AIRTABLE_BASE_ID.trim(),
    tableName: env.AIRTABLE_TABLE_NAME.trim(),
  });
}

export function loadConfig(env = process.env) {
  if (!env.ANTHROPIC_API_KEY?.trim()) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Copy backend/.env.example to backend/.env and fill it in.",
    );
  }

  return Object.freeze({
    port: parseInteger("PORT", env.PORT, DEFAULTS.port, 1, 65535),
    model: env.ANTHROPIC_MODEL?.trim() || DEFAULTS.model,
    rateLimitPerMinute: parseInteger(
      "RATE_LIMIT_PER_MINUTE",
      env.RATE_LIMIT_PER_MINUTE,
      DEFAULTS.rateLimitPerMinute,
      1,
      10_000,
    ),
    corsOrigins: parseOrigins(env.CORS_ORIGIN),
    // Number of reverse proxies in front of the app (1 on Vercel), so rate limiting
    // sees the real client IP instead of the proxy's.
    trustProxy: parseInteger("TRUST_PROXY", env.TRUST_PROXY, DEFAULTS.trustProxy, 0, 10),
    airtable: parseAirtable(env),
  });
}
