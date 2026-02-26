import { describe, it, expect } from 'vitest'
import { createDb } from './client.ts'
import { listTables } from './schema-queries.ts'

describe('listTables', () => {
  it('returns user table names, excludes sqlite_ and _picobase_ prefixes', () => {
    const db = createDb(':memory:')
    db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY)')
    db.exec('CREATE TABLE posts (id INTEGER PRIMARY KEY)')
    db.exec('CREATE TABLE _picobase_migrations (id INTEGER PRIMARY KEY)')
    expect(listTables(db)).toEqual(['posts', 'users'])
    db.close()
  })

  it('returns empty array when no user tables exist', () => {
    const db = createDb(':memory:')
    expect(listTables(db)).toEqual([])
    db.close()
  })
})
