import { basename, dirname, join } from "node:path";
import type { S3Config } from "../../types.ts";
import { createBackup, readSettings, registerBackup, uploadToS3, writeSettings } from "./queries.ts";

const INTERVALS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
} as const;

const CHECK_INTERVAL = 60 * 60 * 1000; // check every hour

export function startAutoBackupScheduler(
  frequency: "daily" | "weekly",
  getDatabase: () => string | undefined,
  storageDir: string,
  s3?: S3Config,
): () => void {
  const babybaseDir = dirname(storageDir);
  const threshold = INTERVALS[frequency];

  async function runIfDue() {
    const dbPath = getDatabase();
    if (!dbPath) return;

    const settings = readSettings(babybaseDir);
    const last = settings.lastAutoBackup ? new Date(settings.lastAutoBackup).getTime() : 0;
    if (Date.now() - last < threshold) return;

    try {
      const backupName = createBackup(dbPath, storageDir);
      const updated = registerBackup(
        { ...settings, lastAutoBackup: new Date().toISOString() },
        backupName,
        basename(dbPath),
      );
      writeSettings(babybaseDir, updated);
      console.log(`[babybase] Auto backup created: ${backupName}`);

      if (s3) {
        try {
          const key = await uploadToS3(join(storageDir, backupName), s3);
          console.log(`[babybase] Auto backup uploaded to S3: ${key}`);
        } catch (err) {
          console.warn("[babybase] Auto backup S3 upload failed:", (err as Error).message);
        }
      }
    } catch (err) {
      console.warn("[babybase] Auto backup failed:", (err as Error).message);
    }
  }

  runIfDue();
  const timer = setInterval(runIfDue, CHECK_INTERVAL);

  return () => clearInterval(timer);
}
