import { describe, it, expect, beforeEach } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { createDb } from '../../db/client.ts'
import { ensureMigrationsTable, getApplied, getFileMigrations, runMigration, saveMigration } from './queries.ts'

const dir = './tmp-migrations-test'

describe('migrations queries', () => {
  beforeEach(() => {
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
  })

  it('ensureMigrationsTable creates the tracking table', () => {
    const db = createDb(':memory:')
    ensureMigrationsTable(db)
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_picobase_migrations'").all()
    expect(tables).toHaveLength(1)
    db.close()
  })

  it('getFileMigrations reads .sql files sorted by name', () => {
    writeFileSync(`${dir}/002_add_posts.sql`, 'SELECT 1')
    writeFileSync(`${dir}/001_create_users.sql`, 'SELECT 2')
    const files = getFileMigrations(dir)
    expect(files[0].name).toBe('001_create_users.sql')
    expect(files[1].name).toBe('002_add_posts.sql')
  })

  it('runMigration executes SQL and records it as applied', () => {
    const db = createDb(':memory:')
    ensureMigrationsTable(db)
    writeFileSync(`${dir}/001_init.sql`, 'CREATE TABLE foo (id INTEGER PRIMARY KEY)')
    runMigration(db, dir, '001_init.sql')
    const applied = getApplied(db)
    expect(applied).toContain('001_init.sql')
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='foo'").all()
    expect(tables).toHaveLength(1)
    db.close()
  })

  it('saveMigration writes a file to the directory', () => {
    saveMigration(dir, '003_test.sql', 'CREATE TABLE bar (id INTEGER PRIMARY KEY)')
    const files = getFileMigrations(dir)
    expect(files.some((f) => f.name === '003_test.sql')).toBe(true)
  })
})
