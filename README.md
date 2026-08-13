# Blackbaud Content React App

React + Express implementation of the executive content-management discussion site, designed for direct Replit hosting without post-processing static assets.

## Runtime architecture

- **Frontend:** Vite + React + React Router
- **Server:** Express (`server/index.js`)
- **Auth gate:** Replit identity headers validated server-side by `/api/auth/session`
- **Domain allowlist:** `blackbaud.com`, `salesforce.com`

## Local development

```bash
npm install
npm run api-server
npm run dev
```

`npm run dev` serves the React app and proxies `/api/*` to `http://localhost:8080`.
Run `npm run api-server` in parallel so auth/session endpoints are available during local development.

## Production build and run

```bash
npm run build
npm start
```

The server hosts `dist/` and exposes:

- `GET /api/auth/session` -> validates authenticated user and domain access
- `GET /api/auth/allowed-domains` -> returns current allowlist

## Replit authentication expectations

This app assumes Replit provides user identity headers at request time:

- `x-replit-user-email`
- `x-replit-user-id`
- `x-replit-user-name`

Access behavior:

- `401` unauthenticated -> login required
- `403` authenticated but wrong domain -> access denied
- `200` authenticated + allowed domain -> app rendered

For non-production local testing, you can set:

- `DEV_AUTH_EMAIL=<allowed_email>`

to simulate authenticated access.

## Content notes (Assessment v2 alignment)

Current content incorporates v2 context corrections:

- Microsoft-first Sales/CS delivery (Teams/SharePoint/Outlook)
- Slack excluded as a Sales/CS dependency
- MuleSoft entitlement correction (Dataloader.io Enterprise is owned; full Anypoint/Titanium is incremental)

## Content enrichment model

The React content framework now supports richer advisory cards per page section:

- `copy` narrative framing
- `list` structured bullets
- `metrics` KPI/priority chips
- `decisionPrompts` executive decision questions
- `risks` dependency and risk callouts
- `links` internal/external calls to action
- `scoreRows` dimension-level scorecard rows

## Scorecard framework

The `Capability Scorecard` page is driven by a normalized dimension model:

- `dimension`
- `currentScore` and `targetScore` (1-5)
- `confidence` (`Confirmed`, `Inferred`, `Pending`)
- `evidence`
- `owner`
- `nextAction`

An executive snapshot rollup is also surfaced in `Executive Summary`.

## Trailhead MCP curation

Enablement cards were curated via the Cursor `user-trailhead` MCP server:

- `content_search` for candidate learning paths
- `fetch_content` for high-signal validation and metadata checks

Each curated entry includes:

- `title`, `type`, `level`, `role`
- `minutes`, `whyItMatters`
- `apiName`, `url`
- `verifiedAt`

This keeps learning recommendations role-based, phase-aligned, and traceable to Trailhead validation runs.
