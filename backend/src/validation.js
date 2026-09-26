export const SENTIMENTS = ["Positive", "Neutral", "Negative"];

const MAX_LENGTH = {
  username: 100,
  content: 1000,
  summary: 500,
};

function checkString(body, field) {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    return `"${field}" is required and must be a non-empty string`;
  }
  if (value.length > MAX_LENGTH[field]) {
    return `"${field}" must be at most ${MAX_LENGTH[field]} characters`;
  }
  return null;
}

export function validateAnalysis(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { value: null, errors: ["Request body must be a JSON object"] };
  }

  const errors = ["username", "content", "summary"]
    .map((field) => checkString(body, field))
    .filter(Boolean);

  if (!SENTIMENTS.includes(body.sentiment)) {
    errors.push(`"sentiment" must be one of: ${SENTIMENTS.join(", ")}`);
  }
  if (typeof body.datetime !== "string" || Number.isNaN(Date.parse(body.datetime))) {
    errors.push('"datetime" must be an ISO 8601 date string');
  }

  if (errors.length > 0) return { value: null, errors };

  return {
    value: {
      username: body.username.trim(),
      content: body.content.trim(),
      sentiment: body.sentiment,
      summary: body.summary.trim(),
      datetime: new Date(body.datetime).toISOString(),
    },
    errors: [],
  };
}
