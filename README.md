# 🧠 AI Tweet Analyzer

Paste a tweet URL (or the tweet text) and **Claude** returns its sentiment
(Positive / Neutral / Negative) and a one-to-two sentence summary. Results can optionally
be saved to Airtable.

**How it works:** the backend fetches the tweet text through [FxTwitter](https://github.com/FxEmbed/FxEmbed)
(a free, unofficial mirror of X's public data, since X's own API is paid), then asks Claude
for a structured analysis. If a tweet can't be fetched, paste its text instead.

## 🧰 Tech Stack

| Part | Stack |
|------|-------|
| Frontend | React 19, Vite 8, Vitest 5 + Testing Library, ESLint 10 |
| Backend | Node.js 22+, Express 5, Anthropic SDK (Claude Opus 5, structured outputs), `node:test` + Supertest |
| Storage | Airtable REST API (optional) |

## 💻 Run Locally

Requires **Node.js 22.12+** (`nvm use` picks it up from `.nvmrc`).

### 1. Clone

```bash
git clone https://github.com/ceydaakin/tweet-analyzer.git
cd tweet-analyzer
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # then add your ANTHROPIC_API_KEY
npm run dev            # http://localhost:3001
```

`.env` variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | From https://platform.claude.com/settings/keys |
| `ANTHROPIC_MODEL` | | Defaults to `claude-opus-5` |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME` | | Set all three to save analyses to Airtable |
| `RATE_LIMIT_PER_MINUTE` | | Analyses per client IP per minute, defaults to `10` (each is a paid Claude call) |
| `PORT` | | Defaults to `3001` (5000 is taken by AirPlay on macOS) |
| `CORS_ORIGIN` | | Comma-separated allowed origins, defaults to `http://localhost:5173` |

The Airtable table needs these fields: `username`, `tweet`, `sentiment`, `summary`, `datetime`.

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev            # http://localhost:5173
```

In development, Vite proxies `/api/*` to the backend. For a production build served from a
different origin than the API, set `VITE_API_URL` (see `frontend/.env.example`).

## 🔌 API

`POST /api/analyze` with a tweet URL, the tweet text, or both (text wins; the URL then only
supplies the username):

```json
{ "url": "https://x.com/jack/status/20", "text": "optional pasted text" }
```

Responses use the envelope `{ "success": boolean, "data": ..., "error": string | null }`:

```json
{
  "success": true,
  "data": {
    "username": "@jack",
    "content": "just setting up my twttr",
    "sentiment": "Neutral",
    "summary": "Jack announces he is setting up his account.",
    "datetime": "2026-09-26T18:30:00.000Z",
    "url": "https://x.com/jack/status/20",
    "saved": false
  },
  "error": null
}
```

Errors: `400` invalid input · `404` tweet not found · `422` Claude declined / tweet has no text ·
`429` rate limited · `502` tweet service or Claude unavailable · `503` Claude rate limit.

`GET /api/health` → `{ "success": true, "data": { "status": "ok" }, "error": null }`

## 🧪 Scripts

| Where | Command | What it does |
|-------|---------|--------------|
| backend | `npm test` | API, Claude analyzer, tweet fetcher, config and Airtable tests |
| frontend | `npm test` | Component and unit tests |
| frontend | `npm run coverage` | Tests with coverage report |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run build` | Production build to `dist/` |
