import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { S3Config } from "../../types.ts";

export interface BackupEntry {
  name: string;
  path: string;
  size: number;
  createdAt: Date;
  type: "backup" | "upload" | "original";
}

export function createBackup(dbPath: string, storageDir: string): string {
  mkdirSync(storageDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const nano = process.hrtime.bigint().toString().slice(-6);
  const dbName = basename(dbPath);
  const name = `${dbName}.${ts}-${nano}.bak`;
  cpSync(dbPath, join(storageDir, name));
  return name;
}

export function listBackups(storageDir: string): BackupEntry[] {
  let files: string[];
  try {
    files = readdirSync(storageDir).filter(
      (f) => f.endsWith(".bak") || f.endsWith(".db") || f.endsWith(".sqlite"),
    );
  } catch {
    return [];
  }
  return files
    .map((name) => {
      const filePath = join(storageDir, name);
      const stat = statSync(filePath);
      const type: BackupEntry["type"] = name.endsWith(".bak")
        ? "backup"
        : "upload";
      return {
        name,
        path: filePath,
        size: stat.size,
        createdAt: stat.birthtime,
        type,
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function saveUploadedDb(
  storageDir: string,
  filename: string,
  data: Buffer,
): void {
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(join(storageDir, filename), data);
}

export function deleteBackup(storageDir: string, name: string): void {
  unlinkSync(join(storageDir, name));
}

export interface CameraState {
  x: number;
  y: number;
  z: number;
}

export interface OriginalDbSettings {
  hiddenColumns?: Record<string, string[]>;
  camera?: CameraState;
  tablePositions?: Record<string, { x: number; y: number }>;
}

export interface BackupDbSettings {
  database: string;
}

export type DbEntry = OriginalDbSettings | BackupDbSettings;

export interface Settings {
  activeDatabase?: string;
  databases?: Record<string, DbEntry>;
  lastAutoBackup?: string; // ISO timestamp of last automatic backup
}

export function readSettings(storageDir: string): Settings {
  try {
    return JSON.parse(
      readFileSync(join(storageDir, "babybase-settings.json"), "utf-8"),
    );
  } catch {
    return {};
  }
}

export function writeSettings(storageDir: string, data: Settings): void {
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(
    join(storageDir, "babybase-settings.json"),
    JSON.stringify(data, null, 2),
  );
}

export function restoreBackup(
  dbPath: string,
  storageDir: string,
  backupName: string,
  backup = true,
): string | null {
  const safetyName = backup ? createBackup(dbPath, storageDir) : null;
  cpSync(join(storageDir, backupName), dbPath);

  // Register the safety backup in settings
  if (safetyName) {
    const babybaseDir = join(storageDir, "..");
    try {
      const settings = readSettings(babybaseDir);
      const updated = registerBackup(settings, safetyName, basename(dbPath));
      writeSettings(babybaseDir, updated);
    } catch {
      // settings write failure is non-fatal
    }
  }

  return safetyName;
}

/** If dbName is a backup, return the original's name; otherwise return dbName. */
export function resolveOriginalName(settings: Settings, dbName: string): string {
  const entry = settings.databases?.[dbName];
  if (entry && "database" in entry) return entry.database;
  return dbName;
}

/** Get the hidden column names for a table, resolving through backup → original. */
export function getHiddenColumns(
  settings: Settings,
  dbName: string,
  tableName: string,
): string[] {
  const originalName = resolveOriginalName(settings, dbName);
  const entry = settings.databases?.[originalName];
  if (!entry || "database" in entry) return [];
  return entry.hiddenColumns?.[tableName] ?? [];
}

/** Return updated Settings with the hidden columns set for the given table on the original. */
export function setHiddenColumns(
  settings: Settings,
  dbName: string,
  tableName: string,
  hidden: string[],
): Settings {
  const originalName = resolveOriginalName(settings, dbName);
  const databases = settings.databases ?? {};
  const existingEntry = databases[originalName];
  if (existingEntry && "database" in existingEntry) {
    // originalName resolved to a backup entry — settings chain is inconsistent, bail out
    return settings;
  }
  const existing = existingEntry as OriginalDbSettings | undefined;
  const hiddenColumns = { ...(existing?.hiddenColumns ?? {}) };
  if (hidden.length === 0) {
    delete hiddenColumns[tableName];
  } else {
    hiddenColumns[tableName] = hidden;
  }
  return {
    ...settings,
    databases: {
      ...databases,
      [originalName]: { ...existing, hiddenColumns },
    },
  };
}

/** Get the saved camera state for the given db, resolving through backup → original. */
export function getCameraState(
  settings: Settings,
  dbName: string,
): CameraState | undefined {
  const originalName = resolveOriginalName(settings, dbName);
  const entry = settings.databases?.[originalName];
  if (!entry || "database" in entry) return undefined;
  return entry.camera;
}

/** Return updated Settings with the camera state set for the given db's original. */
export function setCameraState(
  settings: Settings,
  dbName: string,
  camera: CameraState,
): Settings {
  const originalName = resolveOriginalName(settings, dbName);
  const databases = settings.databases ?? {};
  const existingEntry = databases[originalName];
  if (existingEntry && "database" in existingEntry) return settings;
  const existing = existingEntry as OriginalDbSettings | undefined;
  return {
    ...settings,
    databases: {
      ...databases,
      [originalName]: { ...existing, camera },
    },
  };
}

/** Get the saved table positions for the given db, resolving through backup → original. */
export function getTablePositions(
  settings: Settings,
  dbName: string,
): Record<string, { x: number; y: number }> {
  const originalName = resolveOriginalName(settings, dbName);
  const entry = settings.databases?.[originalName];
  if (!entry || "database" in entry) return {};
  return entry.tablePositions ?? {};
}

/** Return updated Settings with one table's position set for the given db's original. */
export function setTablePosition(
  settings: Settings,
  dbName: string,
  tableName: string,
  position: { x: number; y: number },
): Settings {
  const originalName = resolveOriginalName(settings, dbName);
  const databases = settings.databases ?? {};
  const existingEntry = databases[originalName];
  if (existingEntry && "database" in existingEntry) return settings;
  const existing = existingEntry as OriginalDbSettings | undefined;
  return {
    ...settings,
    databases: {
      ...databases,
      [originalName]: {
        ...existing,
        tablePositions: { ...(existing?.tablePositions ?? {}), [tableName]: position },
      },
    },
  };
}

export async function uploadToS3(
  filePath: string,
  s3: S3Config,
): Promise<string> {
  const client = new S3Client({
    endpoint: s3.endpoint,
    region: s3.region ?? "garage",
    credentials: {
      accessKeyId: s3.accessKeyId,
      secretAccessKey: s3.secretAccessKey,
    },
    forcePathStyle: true,
  });
  const key = s3.keyPrefix
    ? `${s3.keyPrefix.replace(/\/$/, "")}/${basename(filePath)}`
    : basename(filePath);
  const body = readFileSync(filePath);
  await client.send(
    new PutObjectCommand({
      Bucket: s3.bucket,
      Key: key,
      Body: body,
      ContentType: "application/octet-stream",
      ContentLength: body.length,
    }),
  );
  return key;
}

export async function deleteFromS3(key: string, s3: S3Config): Promise<void> {
  const client = new S3Client({
    endpoint: s3.endpoint,
    region: s3.region ?? "garage",
    credentials: {
      accessKeyId: s3.accessKeyId,
      secretAccessKey: s3.secretAccessKey,
    },
    forcePathStyle: true,
  });
  await client.send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: key }));
}

/** Return updated Settings registering a backup as pointing to its original. */
export function registerBackup(
  settings: Settings,
  backupName: string,
  originalName: string,
): Settings {
  const databases = settings.databases ?? {};
  // Don't overwrite if already registered
  if (databases[backupName]) return settings;
  return {
    ...settings,
    databases: {
      ...databases,
      [backupName]: { database: originalName },
    },
  };
}
