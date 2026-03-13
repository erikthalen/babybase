#!/usr/bin/env node
import { exec } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { defineBabybase } from "@babybase/core";

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

const isDemo = args[0] === "demo";

if (isDemo && port === 3000) {
  port = 1234;
}

if (!dbArg && !isDemo) {
  console.error("Usage: babybase <database.db> [--port 3000]");
  process.exit(1);
}

let database;
let migrationsDir;
let storageDir;

if (isDemo) {
  const bundled = join(dirname(fileURLToPath(import.meta.url)), "demo-database.sqlite");
  const tempDir = join(tmpdir(), "babybase-demo");
  mkdirSync(tempDir, { recursive: true });
  database = join(tempDir, "demo.sqlite");
  migrationsDir = join(tempDir, "migrations");
  storageDir = join(tempDir, "storage");
  copyFileSync(bundled, database);
} else {
  database = resolve(process.cwd(), dbArg);
  const babybaseDir = resolve(dirname(database), ".babybase");
  migrationsDir = `${babybaseDir}/migrations`;
  storageDir = `${babybaseDir}/storage`;
}

const { app } = defineBabybase({ database, migrationsDir, storageDir });

serve({ fetch: app.fetch, port }, () => {
  const url = `http://localhost:${port}`;

  const R = "\x1b[0m";
  const D = "\x1b[2m";
  const T = "\x1b[36m";

  const lines = [
    `${T}╷    ─╮ ╷   ╷ ╷ ╷    ─╮ ╭─╮ ╭─╮${R}`,
    `${T}├─╮ ╭─┤ ├─╮ ╰─┤ ├─╮ ╭─┤ ╰─╮ ├─ ${R}`,
    `${T}╰─╯ ╰─╯ ╰─╯   ╵ ╰─╯ ╰─╯  ─╯ ╰─╯${R}`,
    ``,
    `  Server started on port ${T}${port}${R}.`,
    `  Browse your database at ${T}${url}${R}`,
    ``,
    ...(isDemo
      ? [`  ${D}demo mode${R}  Changes are not saved.`]
      : [`  ${D}database${R}  ${database}`, `  ${D}storage ${R}  ${storageDir}`]),
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
