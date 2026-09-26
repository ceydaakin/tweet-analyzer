# 🧠 AI Tweet Analyzer

Analyzes a tweet and saves the result (summary, sentiment, username, timestamp) to Airtable.

> **Note:** the analysis is currently **mocked**. The tweet URL is not fetched; every run
> analyzes the same sample text with a keyword-based sentiment check
> (`frontend/src/lib/analyze.js`). Hooking up a real tweet source and an LLM is the next step.

## 🧰 Tech Stack

| Part | Stack |
|------|-------|
| Frontend | React 19, Vite 8, Vitest 5 + Testing Library, ESLint 10 |
| Backend | Node.js 22+, Express 5, native `fetch`, `node:test` + Supertest |
| Storage | Airtable REST API |

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
cp .env.example .env   # then fill in your Airtable values
npm run dev            # http://localhost:3001
```

`.env` variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `AIRTABLE_TOKEN` | ✅ | Personal access token with `data.records:write` |
| `AIRTABLE_BASE_ID` | ✅ | Base ID (starts with `app`) |
| `AIRTABLE_TABLE_NAME` | ✅ | Table name, e.g. `Table 1` |
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

`POST /api/analyze`

```json
{
  "username": "@someone",
  "content": "Tweet text",
  "sentiment": "Positive | Neutral | Negative",
  "summary": "Short summary",
  "datetime": "2026-01-01T10:00:00.000Z"
}
```

Responses use the envelope `{ "success": boolean, "data": ..., "error": string | null }`:
`201` saved · `400` invalid input · `502` Airtable failure.

`GET /api/health` → `{ "success": true, "data": { "status": "ok" }, "error": null }`

## 🧪 Scripts

| Where | Command | What it does |
|-------|---------|--------------|
| backend | `npm test` | API + config + Airtable client tests |
| frontend | `npm test` | Component and unit tests |
| frontend | `npm run coverage` | Tests with coverage report |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run build` | Production build to `dist/` |
