import { cpSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, basename } from 'node:path'

export interface BackupEntry {
  name: string
  path: string
  size: number
  createdAt: Date
}

export function createBackup(dbPath: string, backupsDir: string): string {
  mkdirSync(backupsDir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const nano = process.hrtime.bigint().toString().slice(-6)
  const dbName = basename(dbPath)
  const name = `${dbName}.${ts}-${nano}.bak`
  cpSync(dbPath, join(backupsDir, name))
  return name
}

export function listBackups(backupsDir: string): BackupEntry[] {
  let files: string[]
  try {
    files = readdirSync(backupsDir).filter((f) => f.endsWith('.bak'))
  } catch {
    return []
  }
  return files
    .map((name) => {
      const path = join(backupsDir, name)
      const stat = statSync(path)
      return { name, path, size: stat.size, createdAt: stat.birthtime }
    })
    .sort((a, b) => b.name.localeCompare(a.name))
}

export function restoreBackup(dbPath: string, backupsDir: string, backupName: string, backup = true): void {
  if (backup) createBackup(dbPath, backupsDir)
  cpSync(join(backupsDir, backupName), dbPath)
}
