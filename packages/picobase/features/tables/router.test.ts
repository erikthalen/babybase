import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { createDb } from '../../db/client.ts'
import { createTablesRouter } from './router.ts'
import type { AppEnv } from '../../index.ts'

function makeApp() {
  const db = createDb(':memory:')
  const app = new Hono<AppEnv>()
  app.use('*', async (c, next) => {
    c.set('db', db)
    c.set('config', { database: ':memory:', basePath: '/', migrationsDir: './m', backupsDir: './b' })
    await next()
  })
  app.route('/tables', createTablesRouter())
  return { app, db }
}

describe('tables router', () => {
  it('GET /tables returns 200 with table list', async () => {
    const { app, db } = makeApp()
    db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)')
    const res = await app.request('/tables')
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('users')
  })

  it('GET /tables/:name returns rows', async () => {
    const { app, db } = makeApp()
    db.exec('CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT)')
    db.exec("INSERT INTO posts (title) VALUES ('Hello')")
    const res = await app.request('/tables/posts')
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('Hello')
  })
})
