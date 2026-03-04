# CLI Package Design

Date: 2026-03-04

## Goal

Allow users to run picobase directly from the terminal via `npx picobase ./data.db` without any project setup.

## Package

New `packages/cli/` in the monorepo, published as `picobase` on npm (unscoped).

## Structure

```
packages/cli/
  cli.js        ← plain JS entry point, shebang at top
  package.json  ← name: "picobase", bin: { "picobase": "./cli.js" }, type: "module"
```

No TypeScript, no build step, no tsconfig.

## Runtime behavior

1. Parse `process.argv`: extract `<db>` positional and optional `--port`/`-p` flag (default 3000)
2. Print usage and exit if no db path given
3. Resolve db to absolute path via `path.resolve(process.cwd(), dbArg)`
4. Derive picobase dir: `path.join(path.dirname(resolvedDb), ".picobase")`
5. Call `definePicobase({ database, migrationsDir, storageDir })` — no upfront directory creation
6. Serve with `@hono/node-server` on the chosen port
7. Print `Picobase running at http://localhost:<port>`

## Key constraint

The `.picobase/` folder must not be created at startup. It is created lazily by storage/migration code only when a file needs to be written.

## Dependencies

- `@picobase/core: workspace:*`
- `@hono/node-server`
- `hono`
