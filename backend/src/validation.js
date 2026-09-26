import { parseTweetUrl } from "./tweets.js";

export const MAX_URL_LENGTH = 500;
export const MAX_TEXT_LENGTH = 5000;

function optionalString(body, field, maxLength, errors) {
  const value = body[field];
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    errors.push(`"${field}" must be a string`);
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    errors.push(`"${field}" must be at most ${maxLength} characters`);
  }
  return trimmed;
}

/**
 * Validates a POST /api/analyze body: a tweet URL, pasted text, or both.
 * @returns {{ value: { url: string | null, text: string | null } | null, errors: string[] }}
 */
export function validateAnalyzeRequest(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { value: null, errors: ["Request body must be a JSON object"] };
  }

  const errors = [];
  const url = optionalString(body, "url", MAX_URL_LENGTH, errors);
  const text = optionalString(body, "text", MAX_TEXT_LENGTH, errors);

  if (errors.length === 0 && !url && !text) {
    errors.push('Provide a tweet "url", the tweet "text", or both');
  }
  if (url && !parseTweetUrl(url)) {
    errors.push('"url" must be a tweet URL like https://x.com/user/status/123');
  }

  if (errors.length > 0) return { value: null, errors };
  return { value: { url: url || null, text: text || null }, errors: [] };
}
