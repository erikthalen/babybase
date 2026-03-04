#!/usr/bin/env node
import { exec } from "node:child_process";
import { dirname, resolve } from "node:path";
import { serve } from "@hono/node-server";
import { definePicobase } from "@picobase/core";

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
  const url = `http://localhost:${port}`;

  const R = "\x1b[0m";
  const D = "\x1b[2m";
  const T = "\x1b[36m";

  const lines = [
    `${T}╭─╮  ╷  ╭─  ╭─╮  ╷    ╭─╮  ╭─╮  ╭─╮${R}`,
    `${T}├─╯  │  │   │ │  ├─╮  ╭─┤  ╰─╮  ├─ ${R}`,
    `${T}╵    ╵  ╰─  ╰─╯  ╰─╯  ╰─╯  ╰─╯  ╰─╯${R}`,
    ``,
    `  Server started on port ${T}${port}${R}.`,
    `  Browse your database at ${T}${url}${R}`,
    ``,
    `  ${D}database${R}  ${database}`,
    `  ${D}storage ${R}  ${picobaseDir}`,
  ];

  process.stdout.write(`\n${lines.join("\n")}\n\n`);

  const cmd =
    process.platform === "win32"
      ? "start"
      : process.platform === "darwin"
        ? "open"
        : "xdg-open";
  exec(`${cmd} ${url}`);
});
