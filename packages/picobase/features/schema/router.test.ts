import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { createDb } from '../../db/client.ts'
import { createSchemaRouter } from './router.ts'
import type { AppEnv } from '../../index.ts'

function makeApp() {
  const db = createDb(':memory:')
  db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)')
  db.exec('CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id))')
  const app = new Hono<AppEnv>()
  app.use('*', async (c, next) => {
    c.set('db', db)
    c.set('config', { database: ':memory:', basePath: '/', migrationsDir: './m', backupsDir: './b' })
    await next()
  })
  app.route('/schema', createSchemaRouter())
  return app
}

describe('schema router', () => {
  it('GET /schema returns column list with table names', async () => {
    const app = makeApp()
    const res = await app.request('/schema')
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('users')
    expect(body).toContain('posts')
  })

  it('GET /schema/diagram returns SVG with table names', async () => {
    const app = makeApp()
    const res = await app.request('/schema/diagram')
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('<svg')
    expect(body).toContain('users')
    expect(body).toContain('posts')
  })

  it('POST /schema/tables creates a new table and returns SSE', async () => {
    const app = makeApp()
    const res = await app.request('/schema/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _tableName: 'orders' }),
    })
    expect(res.status).toBe(200)
    const body = await res.text()
    // SSE response should contain the new table name in the patched HTML
    expect(body).toContain('orders')
  })
})
