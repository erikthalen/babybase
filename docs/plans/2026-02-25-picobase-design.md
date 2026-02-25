# Picobase Design

**Date:** 2026-02-25

## Overview

Picobase is a lightweight, self-hosted SQLite database manager with a browser GUI. It is distributed as a Hono sub-app plugin — users mount it inside their own Hono server at any route prefix.

## Public API

```ts
interface PicobaseConfig {
  database: string        // path to .db file (relative or absolute)
  migrationsDir?: string  // default: './migrations'
  backupsDir?: string     // default: './backups'
}

function definePicobase(config: PicobaseConfig): Hono
```

**Usage:**
```ts
import { Hono } from 'hono'
import { definePicobase } from 'picobase'

const app = new Hono()
app.route('/admin', definePicobase({ database: './data.db' }))
```

## Project Structure

```
picobase/
├── src/
│   ├── index.ts                  # exports definePicobase
│   ├── types.ts                  # PicobaseConfig, shared types
│   ├── db/
│   │   └── client.ts             # opens node:sqlite connection, query helpers
│   ├── components/
│   │   ├── layout.ts             # HTML shell (nav, <head>, Datastar CDN)
│   │   └── shared.ts             # reusable UI bits (table, button, etc.)
│   └── features/
│       ├── tables/               # browse + edit rows
│       │   ├── router.ts
│       │   ├── queries.ts
│       │   └── views.ts
│       ├── schema/               # column list + SVG ER diagram
│       │   ├── router.ts
│       │   ├── queries.ts
│       │   └── views.ts
│       ├── migrations/           # write + run SQL migrations
│       │   ├── router.ts
│       │   ├── queries.ts
│       │   └── views.ts
│       └── backups/              # create + restore .db snapshots
│           ├── router.ts
│           ├── queries.ts
│           └── views.ts
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

Each feature folder contains:
- `router.ts` — Hono route handlers
- `queries.ts` — SQL query functions
- `views.ts` — HTML components (Hono `html` helper)

## Features

### Tables (`/tables`)

- Sidebar lists all user tables
- Clicking a table loads paginated rows with column headers
- Inline cell editing: click to edit, save via `@patch('/tables/:name/:rowid')`
- Add row: form appended at bottom of table
- Delete row: per-row button with confirmation

### Schema (`/schema`)

- **Column list view:** table → columns with type, nullable, default, PK/FK badges
- **ER diagram:** server-rendered SVG, tables as boxes, FK relationships as arrows. Layout computed server-side (grid algorithm, no client-side graph lib). Sent as a `datastar-patch-elements` fragment.
- Toggle between views via a local signal: `_view: 'list' | 'diagram'`

### Migrations (`/migrations`)

- Migration files stored on disk at `migrationsDir`
- Applied migrations tracked in a `_picobase_migrations` meta-table in the SQLite database
- UI lists files with status: pending / applied
- Editor: textarea to write SQL, save to a new numbered file
- Run button: applies all pending migrations in filename order

### Backups (`/backups`)

- Creates a timestamped copy of the `.db` file (e.g. `data.2026-02-25T12-00-00.db.bak`) in `backupsDir`
- Lists existing backups with creation timestamp and file size
- Restore: copies backup over the live `.db` file, preceded by an automatic safety backup of the current state

## Data Flow & Datastar Patterns

All interactivity uses Datastar — no custom client-side JavaScript.

| Action | Pattern |
|---|---|
| Navigate to a table | `@get('/tables/:name')` → `datastar-patch-elements` replaces main content |
| Edit a cell | `_editing` signal toggles form visibility; `@patch('/tables/:name/:rowid')` streams updated row HTML |
| View ER diagram | `_view` signal switches tab; `@get('/schema/diagram')` streams SVG fragment |
| Run a migration | `@post('/migrations/run')` streams inline status message |
| Create backup | `@post('/backups')` streams updated backup list |
| Restore backup | `@post('/backups/:id/restore')` streams status + updated list |

**Signal conventions:**
- `_`-prefixed signals are local UI state (not sent to backend): `_editing`, `_view`, `_confirmDelete`
- Plain signals carry form data to the server: `sql`, `rowData`

## Tech Stack

- **Runtime:** Node.js + TypeScript (strict)
- **Package manager:** pnpm
- **Backend:** Hono
- **Database:** node:sqlite (built-in)
- **Frontend:** Datastar (SSE + signals), Hono `html` helper for server-rendered components
