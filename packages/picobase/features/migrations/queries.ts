import {
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

export interface MigrationFile {
  name: string;
  path: string;
}

export function ensureMigrationsTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS _picobase_migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
}

export function getApplied(db: DatabaseSync): string[] {
  const rows = db
    .prepare("SELECT name FROM _picobase_migrations ORDER BY name")
    .all() as { name: string }[];
  return rows.map((r) => r.name);
}

export function getFileMigrations(dir: string): MigrationFile[] {
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".sql"));
  } catch {
    return [];
  }
  return files.sort().map((name) => ({ name, path: join(dir, name) }));
}

export function runMigration(
  db: DatabaseSync,
  dir: string,
  filename: string,
): void {
  const sql = readFileSync(join(dir, filename), "utf8");
  db.exec(sql);
  db.prepare("INSERT INTO _picobase_migrations (name) VALUES (?)").run(
    filename,
  );
}

export function getMigrationSql(dir: string, filename: string): string {
  try {
    return readFileSync(join(dir, filename), "utf8");
  } catch {
    return "";
  }
}

export function deleteMigration(
  db: DatabaseSync,
  dir: string,
  filename: string,
): void {
  try {
    unlinkSync(join(dir, filename));
  } catch {
    // file already gone
  }
  db.prepare("DELETE FROM _picobase_migrations WHERE name = ?").run(filename);
}

export function saveMigration(
  dir: string,
  filename: string,
  sql: string,
): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), sql, "utf8");
}
