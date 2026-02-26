import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { createBackup, listBackups, restoreBackup } from './queries.ts'

const backupsDir = './tmp-backups-test'
const srcDb = './tmp-backups-src.db'

describe('backup queries', () => {
  beforeEach(() => {
    rmSync(backupsDir, { recursive: true, force: true })
    mkdirSync(backupsDir, { recursive: true })
    writeFileSync(srcDb, 'fake db content')
  })

  afterAll(() => {
    rmSync(backupsDir, { recursive: true, force: true })
    rmSync(srcDb, { force: true })
  })

  it('createBackup copies the db file to backupsDir with a timestamp name ending in .bak', () => {
    const name = createBackup(srcDb, backupsDir)
    expect(name).toMatch(/\.bak$/)
    expect(existsSync(`${backupsDir}/${name}`)).toBe(true)
  })

  it('listBackups returns backup files sorted newest first', () => {
    createBackup(srcDb, backupsDir)
    createBackup(srcDb, backupsDir)
    const list = listBackups(backupsDir)
    expect(list.length).toBe(2)
    expect(list[0].name).toMatch(/\.bak$/)
  })

  it('restoreBackup replaces source db content with backup content', () => {
    const name = createBackup(srcDb, backupsDir)
    writeFileSync(srcDb, 'modified content')
    restoreBackup(srcDb, backupsDir, name)
    expect(readFileSync(srcDb, 'utf8')).toBe('fake db content')
  })

  it('restoreBackup creates a safety backup before overwriting', () => {
    const name = createBackup(srcDb, backupsDir)
    writeFileSync(srcDb, 'modified content')
    restoreBackup(srcDb, backupsDir, name)
    // Should have 2 backups now (original + safety)
    const list = listBackups(backupsDir)
    expect(list.length).toBe(2)
  })
})
