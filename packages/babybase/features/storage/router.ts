import { readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { Hono } from "hono";
import { html } from "hono/html";
import { layout, nav, navElement, toastHtml } from "../../components/layout.ts";
import { respond, sseAction } from "../../components/sse.ts";
import { listTables } from "../../db/schema-queries.ts";
import type { AppEnv } from "../../index.ts";
import type { S3Config } from "../../types.ts";
import {
  type BackupEntry,
  createBackup,
  deleteBackup,
  deleteFromS3,
  listBackups,
  readSettings,
  registerBackup,
  saveUploadedDb,
  uploadToS3,
  writeSettings,
} from "./queries.ts";
import { storageListRows, storageView } from "./views.ts";

function makeOriginalEntry(dbPath: string): BackupEntry {
  let size = 0;
  let createdAt = new Date(0);
  try {
    const stat = statSync(dbPath);
    size = stat.size;
    createdAt = stat.birthtime;
  } catch {
    /* file may not exist yet */
  }
  return {
    name: basename(dbPath),
    path: dbPath,
    size,
    createdAt,
    type: "original",
  };
}

function buildEntries(
  originalDatabase: string | undefined,
  storageDir: string,
): BackupEntry[] {
  return [
    ...(originalDatabase ? [makeOriginalEntry(originalDatabase)] : []),
    ...listBackups(storageDir),
  ];
}

export function createStorageRouter(opts: {
  originalDatabase: string | undefined;
  mountDb: (path: string) => void;
  unmountDb: () => void;
  dbOpenError?: string;
  dbOpenFailedPath?: string;
  s3?: S3Config;
}): Hono<AppEnv> {
  const { originalDatabase, mountDb, unmountDb, dbOpenError, dbOpenFailedPath, s3 } = opts;
  const app = new Hono<AppEnv>();

  app.get("/", async (c) => {
    const db = c.get("db") as DatabaseSync | null;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const tables = db ? listTables(db) : [];
    const entries = buildEntries(originalDatabase, config.storageDir);
    const content = storageView({ entries, basePath: base, activeDatabase: config.database });
    const navHtml = nav({
      basePath: base,
      activeSection: "storage",
      tables,
      hasDatabase: db !== null,
      readonly: config.readonly,
    });
    return respond(c, {
      fullPage: () =>
        layout({
          title: "Storage",
          nav: navHtml,
          content,
          toasts: dbOpenError
            ? toastHtml(
                "Database not found",
                html`No file found at
                  <code>${dbOpenFailedPath}</code>

                  Mount a database to get started.`,
                "error",
              )
            : undefined,
        }),
      fragment: () => html`<main id="main">${content}</main>`,
    });
  });

  // Create a new backup
  app.post("/", async (c) => {
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    if (!config.database) {
      return c.json({ error: "No database mounted" }, 400);
    }
    const backupName = createBackup(config.database, config.storageDir);
    const babybaseDir = dirname(config.storageDir);
    try {
      const currentSettings = readSettings(babybaseDir);
      const updatedSettings = registerBackup(
        currentSettings,
        backupName,
        basename(config.database),
      );
      writeSettings(babybaseDir, updatedSettings);
    } catch {
      // settings write failed — backup exists but origin won't be registered
    }

    // Auto-upload to S3 if configured
    let s3Key: string | undefined;
    if (s3) {
      try {
        s3Key = await uploadToS3(join(config.storageDir, backupName), s3);
      } catch {
        // S3 upload failure is non-fatal — backup is still saved locally
      }
    }

    const entries = buildEntries(originalDatabase, config.storageDir);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<main id="main">
          ${storageView({ entries, basePath: base, activeDatabase: config.database })}
        </main>`,
      );
      await patchElements(
        s3Key
          ? toastHtml("Backup created", html`Saved as <code>${backupName}</code> and uploaded to S3 as <code>${s3Key}</code>.`)
          : toastHtml("Backup created", html`Saved as <code>${backupName}</code>.`),
        { selector: "#toast-container", mode: "prepend" },
      );
    });
  });

  // Upload an external database file
  app.post("/upload", async (c) => {
    const config = c.get("config");
    try {
      const body = await c.req.parseBody();
      const file = body.file;
      if (file instanceof File && file.size > 0) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const data = Buffer.from(await file.arrayBuffer());
        saveUploadedDb(config.storageDir, safe, data);
        if (!config.database) {
          mountDb(join(config.storageDir, safe));
        }
      }
    } catch {
      // ignore upload errors
    }
    return c.json({ ok: true });
  });

  // Delete a backup or uploaded file
  app.delete("/:name", async (c) => {
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const name = decodeURIComponent(c.req.param("name"));
    const deletedPath = join(config.storageDir, name);
    const wasActive = deletedPath === config.database;
    try {
      deleteBackup(config.storageDir, name);
    } catch {
      // file already gone
    }
    if (s3) {
      const key = s3.keyPrefix ? `${s3.keyPrefix.replace(/\/$/, "")}/${name}` : name;
      deleteFromS3(key, s3).catch(() => {/* non-fatal */});
    }
    if (wasActive) {
      unmountDb();
    }
    const entries = buildEntries(originalDatabase, config.storageDir);
    if (wasActive) {
      return sseAction(c, async ({ patchElements }) => {
        await patchElements(
          navElement({
            basePath: base,
            activeSection: "storage",
            hasDatabase: false,
            readonly: config.readonly,
          }),
          { useViewTransition: true },
        );
        await patchElements(
          html`<main id="main">
            ${storageView({ entries, basePath: base, activeDatabase: config.database })}
          </main>`,
          { useViewTransition: true },
        );
      });
    }
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<tbody id="storage-list">
          ${storageListRows(entries, base, config.database)}
        </tbody>`,
        { useViewTransition: true },
      );
    });
  });

  // Download a database or backup file
  app.get("/:name/download", (c) => {
    const config = c.get("config");
    const name = decodeURIComponent(c.req.param("name"));
    const filePath =
      name === "~original" ? originalDatabase : join(config.storageDir, name);
    if (!filePath) return c.json({ error: "Not found" }, 404);
    const filename =
      name === "~original" ? basename(originalDatabase ?? "database.db") : name;
    try {
      const data = readFileSync(filePath);
      return new Response(data, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(data.length),
        },
      });
    } catch {
      return c.json({ error: "File not found" }, 404);
    }
  });

  // Mount a database file as the active database
  app.post("/:name/mount", async (c) => {
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const name = decodeURIComponent(c.req.param("name"));
    const newPath =
      name === "~original" ? originalDatabase : join(config.storageDir, name);
    if (!newPath) {
      return c.json({ error: "No original database configured" }, 400);
    }
    mountDb(newPath);
    const entries = buildEntries(originalDatabase, config.storageDir);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        navElement({
          basePath: base,
          activeSection: "storage",
          hasDatabase: true,
          readonly: config.readonly,
        }),
        { useViewTransition: true },
      );
      await patchElements(
        html`<main id="main">
          ${storageView({ entries, basePath: base, activeDatabase: config.database })}
        </main>`,
        { useViewTransition: true },
      );
      await patchElements(
        toastHtml(
          "Database mounted",
          html`Now using <code>${basename(newPath)}</code>.`,
        ),
        { selector: "#toast-container", mode: "prepend" },
      );
    });
  });

  return app;
}
