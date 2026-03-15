import { basename } from "node:path";
import type { S3Config } from "../../types.ts";
import { createBackup, createBackupToS3, readSettings, registerBackup, writeSettings } from "./queries.ts";

const INTERVALS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
} as const;

const CHECK_INTERVAL = 60 * 60 * 1000; // check every hour

export function startAutoBackupScheduler(
  frequency: "daily" | "weekly",
  getDatabase: () => string | undefined,
  settingsDir: string,
  storageDir?: string,
  s3?: S3Config,
): () => void {
  const threshold = INTERVALS[frequency];

  async function runIfDue() {
    const dbPath = getDatabase();
    if (!dbPath) return;

    const settings = readSettings(settingsDir);
    const last = settings.lastAutoBackup ? new Date(settings.lastAutoBackup).getTime() : 0;
    if (Date.now() - last < threshold) return;

    try {
      let backupName: string;
      if (s3) {
        backupName = await createBackupToS3(dbPath, s3);
      } else {
        backupName = createBackup(dbPath, storageDir!);
      }

      const updated = registerBackup(
        { ...settings, lastAutoBackup: new Date().toISOString() },
        backupName,
        basename(dbPath),
      );
      writeSettings(settingsDir, updated);
      console.log(`[babybase] Auto backup created: ${backupName}`);
    } catch (err) {
      console.warn("[babybase] Auto backup failed:", (err as Error).message);
    }
  }

  runIfDue();
  const timer = setInterval(runIfDue, CHECK_INTERVAL);

  return () => clearInterval(timer);
}
