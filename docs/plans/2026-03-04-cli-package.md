# CLI Package Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `packages/cli` package published as `picobase` on npm so users can run `npx picobase ./data.db`.

**Architecture:** Plain JavaScript single-file CLI. Parses argv, resolves the db path to absolute, derives `.picobase/` beside the db file, and delegates to `definePicobase()` from `@picobase/core`. No build step — Node runs `cli.js` directly.

**Tech Stack:** Node.js (ESM), `@picobase/core` (workspace), `@hono/node-server`, `hono`

---

### Task 1: Create package.json

**Files:**
- Create: `packages/cli/package.json`

**Step 1: Write the file**

```json
{
  "name": "picobase",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "picobase": "./cli.js"
  },
  "dependencies": {
    "@picobase/core": "workspace:*",
    "@hono/node-server": "catalog:",
    "hono": "catalog:"
  }
}
```

**Step 2: Install workspace deps**

Run: `pnpm install`
Expected: `packages/cli/node_modules` populated with symlinks to workspace packages.

**Step 3: Commit**

```bash
git add packages/cli/package.json pnpm-lock.yaml
git commit -m "feat(cli): scaffold cli package"
```

---

### Task 2: Write cli.js

**Files:**
- Create: `packages/cli/cli.js`

**Step 1: Write the file**

```js
#!/usr/bin/env node
import { serve } from "@hono/node-server";
import { definePicobase } from "@picobase/core";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
let dbArg;
let port = 3000;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if ((arg === "--port" || arg === "-p") && args[i + 1]) {
    port = Number(args[++i]);
  } else if (!arg.startsWith("-")) {
    dbArg = arg;
  }
}

if (!dbArg) {
  console.error("Usage: picobase <database.db> [--port 3000]");
  process.exit(1);
}

const database = resolve(process.cwd(), dbArg);
const picobaseDir = resolve(dirname(database), ".picobase");

const app = definePicobase({
  database,
  migrationsDir: `${picobaseDir}/migrations`,
  storageDir: `${picobaseDir}/storage`,
});

serve({ fetch: app.fetch, port }, () => {
  console.log(`Picobase running at http://localhost:${port}`);
});
```

**Step 2: Make executable**

Run: `chmod +x packages/cli/cli.js`

**Step 3: Smoke test — no db arg**

Run: `node packages/cli/cli.js`
Expected output: `Usage: picobase <database.db> [--port 3000]` and exit code 1.

**Step 4: Smoke test — with a real db**

Run: `node packages/cli/cli.js packages/example/chinook.db --port 4000`
Expected: `Picobase running at http://localhost:4000`
Visit `http://localhost:4000` in a browser — should show the schema view.
Verify no `.picobase/` folder is created until you trigger a backup or migration.

**Step 5: Commit**

```bash
git add packages/cli/cli.js
git commit -m "feat(cli): add cli entrypoint"
```

---

### Task 3: Wire into root scripts

**Files:**
- Modify: `package.json` (root)

The root `dev`/`build`/`start` scripts run `pnpm -r --parallel` across all packages. The cli package has no `dev` or `build` script, so it will be silently skipped — no change needed.

Optionally add a `"start"` script to `packages/cli/package.json` for local testing:

```json
"scripts": {
  "start": "node cli.js"
}
```

This lets `pnpm --filter picobase start -- ./path/to/db.sqlite` work during development.

**Step 1: Add start script**

Add to `packages/cli/package.json`:
```json
"scripts": {
  "start": "node cli.js"
}
```

**Step 2: Commit**

```bash
git add packages/cli/package.json
git commit -m "feat(cli): add start script for local dev"
```
