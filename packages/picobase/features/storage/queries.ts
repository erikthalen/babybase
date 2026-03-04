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

export function readSettings(storageDir: string): { activeDatabase?: string } {
  try {
    return JSON.parse(
      readFileSync(join(storageDir, "picobase-settings.json"), "utf-8"),
    );
  } catch {
    return {};
  }
}

export function writeSettings(
  storageDir: string,
  data: { activeDatabase: string },
): void {
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(
    join(storageDir, "picobase-settings.json"),
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
  return safetyName;
}
