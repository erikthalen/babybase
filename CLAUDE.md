# Picobase

Lightweight, self-hosted SQLite database manager with a browser GUI. Provides schema visualization and data management, similar to Supabase but for local SQLite files.

## Tech Stack

- **Runtime**: Node.js + TypeScript (strict)
- **Package manager**: pnpm
- **Backend**: Hono
- **Database**: node:sqlite (built-in)
- **Frontend**: Datastar (SSE + signals), Hono `html` helper for components

## Commands

```
pnpm dev     # start dev server
pnpm build   # build for production
pnpm start   # run production build
```

## Architecture

The backend is the source of truth. All UI is server-rendered HTML using Hono's `html` helper and TypeScript template literals — no UI framework, no React, no component library. Interactivity is handled exclusively by Datastar via SSE and signals.

## Core Rules

- TypeScript only — no `.js` files
- No UI libraries (no React, Vue, Tailwind component kits, etc.)
- All HTML components are built with Hono's `html` helper as TS template literals
- All interactivity via Datastar — no custom JS/client-side logic
- Prefer server-side state; use frontend signals only for UI-only concerns (toggles, input binding)

## Skills

Consult these skills for technology-specific guidance:

- `skills/hono/` — Hono routing, middleware, testing endpoints
- `skills/datastar/` — SSE patterns, signal conventions, anti-patterns
- `skills/sql-expert/` — SQLite queries, schema design, migrations
