#!/usr/bin/env node
import { serve } from "@hono/node-server";
import { definePicobase } from "@picobase/core";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
let dbArg;
let port = 3000;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--port" || arg === "-p") {
    const raw = args[++i];
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      console.error(`Invalid port: "${raw}"`);
      process.exit(1);
    }
    port = parsed;
  } else if (!arg.startsWith("-")) {
    dbArg = arg;
  } else {
    console.error(`Unknown option: ${arg}`);
    process.exit(1);
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
