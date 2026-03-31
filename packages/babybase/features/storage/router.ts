import { mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
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
  createBackupToS3,
  deleteFromS3,
  getFromS3,
  listBackups,
  listS3Backups,
  readSettings,
  registerBackup,
  s3Key,
  saveUploadedDb,
  uploadToS3,
  writeSettings,
} from "./queries.ts";
import { storageView } from "./views.ts";

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
    source: "local",
  };
}

async function buildEntries(
  originalDatabase: string | undefined,
  storageDir: string | undefined,
  s3: S3Config | undefined,
  settingsDir: string,
): Promise<BackupEntry[]> {
  const original = originalDatabase
    ? [makeOriginalEntry(originalDatabase)]
    : [];
  if (s3) {
    const mounted = listBackups(join(settingsDir, "mounts"));
    const s3Backups = await listS3Backups(s3);
    return [...original, ...mounted, ...s3Backups];
  }
  const localBackups = storageDir ? listBackups(storageDir) : [];
  return [...original, ...localBackups];
}

export function createStorageRouter(opts: {
  originalDatabase: string | undefined;
  mountDb: (path: string) => void;
  unmountDb: () => void;
  dbOpenError?: string;
  dbOpenFailedPath?: string;
  settingsDir: string;
  storageDir?: string;
  s3?: S3Config;
}): Hono<AppEnv> {
  const {
    originalDatabase,
    mountDb,
    unmountDb,
    dbOpenError,
    dbOpenFailedPath,
    settingsDir,
    storageDir,
    s3,
  } = opts;
  const app = new Hono<AppEnv>();

  app.get("/", async (c) => {
    const db = c.get("db") as DatabaseSync | null;
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const tables = db ? listTables(db) : [];
    const entries = await buildEntries(originalDatabase, storageDir, s3, settingsDir);
    const content = storageView({
      entries,
      basePath: base,
      activeDatabase: config.database,
      s3: !!s3,
    });
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
    if (!config.database) return c.json({ error: "No database mounted" }, 400);

    let backupName: string;
    if (s3) {
      backupName = await createBackupToS3(config.database, s3);
    } else {
      backupName = createBackup(config.database, storageDir!);
    }

    try {
      const current = readSettings(settingsDir);
      writeSettings(
        settingsDir,
        registerBackup(current, backupName, basename(config.database)),
      );
    } catch {
      // settings write failed — backup still exists
    }

    const entries = await buildEntries(originalDatabase, storageDir, s3, settingsDir);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<main id="main">
          ${storageView({
            entries,
            basePath: base,
            activeDatabase: config.database,
            s3: !!s3,
          })}
        </main>`,
      );
      await patchElements(
        toastHtml("Backup created", html`Saved as <code>${backupName}</code>.`),
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
        if (s3) {
          const tempPath = join(settingsDir, safe);
          saveUploadedDb(settingsDir, safe, data);
          try {
            await uploadToS3(tempPath, s3);
          } finally {
            try { unlinkSync(tempPath); } catch { /* already gone */ }
          }
        } else {
          const uploadDir = storageDir ?? settingsDir;
          saveUploadedDb(uploadDir, safe, data);
          if (!config.database) {
            mountDb(join(uploadDir, safe));
          }
        }
      }
    } catch {
      // ignore upload errors
    }
    return c.json({ ok: true });
  });

  // Delete an S3 backup (also removes local mounted copy if present)
  app.delete("/s3/:name", async (c) => {
    if (!s3) return c.json({ error: "S3 not configured" }, 400);
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const name = decodeURIComponent(c.req.param("name"));

    deleteFromS3(s3Key(name, s3), s3).catch(() => { /* non-fatal */ });
    const localPath = join(settingsDir, "mounts", name);
    const wasActive = localPath === config.database;
    if (wasActive) unmountDb();
    try { unlinkSync(localPath); } catch { /* not present locally */ }

    const entries = await buildEntries(originalDatabase, storageDir, s3, settingsDir);
    return sseAction(c, async ({ patchElements }) => {
      if (wasActive) {
        await patchElements(
          navElement({
            basePath: base,
            activeSection: "storage",
            hasDatabase: false,
            readonly: config.readonly,
          }),
        );
      }
      await patchElements(
        html`<main id="main">
          ${storageView({
            entries,
            basePath: base,
            activeDatabase: config.database,
            s3: !!s3,
          })}
        </main>`,
      );
    });
  });

  // Delete a local backup or mounted copy (never touches S3)
  app.delete("/:name", async (c) => {
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const name = decodeURIComponent(c.req.param("name"));

    // When S3 is configured, local entries live in the mounts/ dir
    const localPath = s3
      ? join(settingsDir, "mounts", name)
      : join(storageDir!, name);
    const wasActive = localPath === config.database;
    if (wasActive) unmountDb();
    try { unlinkSync(localPath); } catch { /* file already gone */ }

    const entries = await buildEntries(originalDatabase, storageDir, s3, settingsDir);
    return sseAction(c, async ({ patchElements }) => {
      if (wasActive) {
        await patchElements(
          navElement({
            basePath: base,
            activeSection: "storage",
            hasDatabase: false,
            readonly: config.readonly,
          }),
        );
      }
      await patchElements(
        html`<main id="main">
          ${storageView({
            entries,
            basePath: base,
            activeDatabase: config.database,
            s3: !!s3,
          })}
        </main>`,
      );
    });
  });

  // Download a database or backup file
  app.get("/:name/download", async (c) => {
    const name = decodeURIComponent(c.req.param("name"));
    const filename =
      name === "~original" ? basename(originalDatabase ?? "database.db") : name;

    if (name === "~original") {
      if (!originalDatabase) return c.json({ error: "Not found" }, 404);
      try {
        const data = readFileSync(originalDatabase);
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
    }

    if (s3) {
      try {
        const data = await getFromS3(s3Key(name, s3), s3);
        return new Response(new Uint8Array(data), {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": String(data.length),
          },
        });
      } catch {
        return c.json({ error: "File not found" }, 404);
      }
    }

    // Local
    const filePath = join(storageDir!, name);
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

    let newPath: string;
    if (name === "~original") {
      if (!originalDatabase)
        return c.json({ error: "No original database configured" }, 400);
      newPath = originalDatabase;
    } else if (s3) {
      // Download from S3 to .babybase/mounts/, then mount the local copy
      const mountsDir = join(settingsDir, "mounts");
      mkdirSync(mountsDir, { recursive: true });
      newPath = join(mountsDir, name);
      try {
        const data = await getFromS3(s3Key(name, s3), s3);
        writeFileSync(newPath, data);
      } catch {
        return c.json({ error: "Could not download from S3" }, 500);
      }
    } else {
      newPath = join(storageDir!, name);
    }

    mountDb(newPath);
    const entries = await buildEntries(originalDatabase, storageDir, s3, settingsDir);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        navElement({
          basePath: base,
          activeSection: "storage",
          hasDatabase: true,
          readonly: config.readonly,
        }),
      );
      await patchElements(
        html`<main id="main">
          ${storageView({
            entries,
            basePath: base,
            activeDatabase: config.database,
            s3: !!s3,
          })}
        </main>`,
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

  // Clone an S3 backup to local mounts/ without mounting it
  app.post("/s3/:name/clone", async (c) => {
    if (!s3) return c.json({ error: "S3 not configured" }, 400);
    const config = c.get("config");
    const base = config.basePath.replace(/\/$/, "");
    const name = decodeURIComponent(c.req.param("name"));

    const mountsDir = join(settingsDir, "mounts");
    mkdirSync(mountsDir, { recursive: true });
    const localPath = join(mountsDir, name);
    try {
      const data = await getFromS3(s3Key(name, s3), s3);
      writeFileSync(localPath, data);
    } catch {
      return c.json({ error: "Could not download from S3" }, 500);
    }

    const entries = await buildEntries(originalDatabase, storageDir, s3, settingsDir);
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(
        html`<main id="main">
          ${storageView({
            entries,
            basePath: base,
            activeDatabase: config.database,
            s3: !!s3,
          })}
        </main>`,
      );
      await patchElements(
        toastHtml(
          "Database cloned",
          html`<code>${name}</code> saved locally.`,
        ),
        { selector: "#toast-container", mode: "prepend" },
      );
    });
  });

  return app;
}
