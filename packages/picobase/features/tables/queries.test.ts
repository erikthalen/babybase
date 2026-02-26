import { describe, it, expect } from 'vitest'
import { createDb } from '../../db/client.ts'
import { getColumns, getRows, countRows } from './queries.ts'

describe('tables queries', () => {
  it('getColumns returns column metadata', () => {
    const db = createDb(':memory:')
    db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT)')
    const cols = getColumns(db, 'users')
    expect(cols.map((c) => c.name)).toEqual(['id', 'name', 'email'])
    expect(cols.find((c) => c.name === 'id')?.pk).toBe(true)
    expect(cols.find((c) => c.name === 'name')?.notnull).toBe(true)
    db.close()
  })

  it('getRows returns paginated rows', () => {
    const db = createDb(':memory:')
    db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, val TEXT)')
    for (let i = 1; i <= 5; i++) db.exec(`INSERT INTO t (val) VALUES ('v${i}')`)
    const rows = getRows(db, 't', { limit: 3, offset: 0 })
    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual({ id: 1, val: 'v1' })
  })

  it('countRows returns total row count', () => {
    const db = createDb(':memory:')
    db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY)')
    db.exec('INSERT INTO t DEFAULT VALUES')
    db.exec('INSERT INTO t DEFAULT VALUES')
    expect(countRows(db, 't')).toBe(2)
    db.close()
  })
})
