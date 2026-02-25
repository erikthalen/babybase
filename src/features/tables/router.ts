import { Hono } from 'hono'
import type { AppEnv } from '../../index.ts'
import { listTables } from '../../db/schema-queries.ts'
import { getColumns, getRows, countRows } from './queries.ts'
import { tableListView, rowsView } from './views.ts'
import { layout, nav } from '../../components/layout.ts'
import { respond, sseAction } from '../../components/sse.ts'

const LIMIT = 50

export function createTablesRouter(): Hono<AppEnv> {
  const app = new Hono<AppEnv>()

  // List all tables
  app.get('/', async (c) => {
    const db = c.get('db')
    const config = c.get('config')
    const tables = listTables(db)
    const base = config.basePath.replace(/\/$/, '')
    const content = tableListView(tables, base)
    const navHtml = nav({ basePath: base, activeSection: 'tables', tables })
    return respond(c, {
      fullPage: () => layout({ title: 'Tables', nav: navHtml, content }),
      fragment: () => `<main id="main">${content}</main>`,
    })
  })

  // View rows for a table
  app.get('/:table', async (c) => {
    const db = c.get('db')
    const config = c.get('config')
    const tableName = c.req.param('table')
    const page = Number(c.req.query('page') ?? 1)
    const base = config.basePath.replace(/\/$/, '')
    const tables = listTables(db)
    const columns = getColumns(db, tableName)
    const total = countRows(db, tableName)
    const rows = getRows(db, tableName, { limit: LIMIT, offset: (page - 1) * LIMIT })
    const content = rowsView({ table: tableName, columns, rows, page, total, limit: LIMIT, basePath: base })
    const navHtml = nav({ basePath: base, activeSection: 'tables', tables })
    return respond(c, {
      fullPage: () => layout({ title: tableName, nav: navHtml, content }),
      fragment: () => `<main id="main">${content}</main>`,
    })
  })

  // Insert row
  app.post('/:table', async (c) => {
    const db = c.get('db')
    const config = c.get('config')
    const tableName = c.req.param('table')
    const body = await c.req.parseBody()
    const cols = Object.keys(body).filter((k) => body[k] !== '')
    if (cols.length > 0) {
      const vals = cols.map((k) => body[k])
      db.prepare(
        `INSERT INTO ${JSON.stringify(tableName)} (${cols.map((k) => JSON.stringify(k)).join(',')}) VALUES (${cols.map(() => '?').join(',')})`
      ).run(...vals as string[])
    }
    const base = config.basePath.replace(/\/$/, '')
    const columns = getColumns(db, tableName)
    const total = countRows(db, tableName)
    const rows = getRows(db, tableName, { limit: LIMIT, offset: 0 })
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(`<main id="main">${rowsView({ table: tableName, columns, rows, page: 1, total, limit: LIMIT, basePath: base })}</main>`)
    })
  })

  // Delete row
  app.delete('/:table/:rowid', async (c) => {
    const db = c.get('db')
    const tableName = c.req.param('table')
    const rowid = c.req.param('rowid')
    const pkCol = getColumns(db, tableName).find((col) => col.pk)
    const pkName = pkCol?.name ?? 'rowid'
    db.prepare(`DELETE FROM ${JSON.stringify(tableName)} WHERE ${JSON.stringify(pkName)} = ?`).run(rowid)
    return sseAction(c, async ({ patchElements }) => {
      // Send an empty element with the same id — Datastar will remove it
      await patchElements(`<div id="row-${rowid}" data-swap-mode="delete"></div>`)
    })
  })

  return app
}
