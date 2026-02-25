import { describe, it, expect } from 'vitest'
import { createDb } from '../../db/client.ts'
import { getFullSchema, getForeignKeys } from './queries.ts'

describe('schema queries', () => {
  it('getFullSchema returns all tables with columns', () => {
    const db = createDb(':memory:')
    db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)')
    db.exec('CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id))')
    const schema = getFullSchema(db)
    expect(schema.map((t) => t.name)).toContain('users')
    expect(schema.find((t) => t.name === 'users')?.columns.map((c) => c.name)).toEqual(['id', 'name'])
    db.close()
  })

  it('getForeignKeys returns FK relationships', () => {
    const db = createDb(':memory:')
    db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY)')
    db.exec('CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id))')
    const fks = getForeignKeys(db, 'posts')
    expect(fks).toHaveLength(1)
    expect(fks[0].table).toBe('users')
    expect(fks[0].from).toBe('user_id')
    db.close()
  })
})
