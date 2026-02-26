import { describe, it, expect, afterEach } from 'vitest'
import { createDb } from './client.ts'
import { unlinkSync, existsSync } from 'node:fs'

const tmp = './tmp-test.db'

describe('createDb', () => {
  afterEach(() => { if (existsSync(tmp)) unlinkSync(tmp) })

  it('opens an in-memory database', () => {
    const db = createDb(':memory:')
    expect(db).toBeDefined()
    db.close()
  })

  it('runs a query and returns rows', () => {
    const db = createDb(':memory:')
    db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT NOT NULL)')
    db.exec("INSERT INTO t (name) VALUES ('alice')")
    const rows = db.prepare('SELECT * FROM t').all()
    expect(rows).toEqual([{ id: 1, name: 'alice' }])
    db.close()
  })

  it('creates a file on disk when given a path', () => {
    const db = createDb(tmp)
    db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY)')
    db.close()
    expect(existsSync(tmp)).toBe(true)
  })
})
