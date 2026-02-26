import { Hono } from 'hono'
import type { AppEnv } from '../../index.ts'
import { listTables } from '../../db/schema-queries.ts'
import { createBackup, listBackups, restoreBackup } from './queries.ts'
import { backupsView } from './views.ts'
import { layout, nav } from '../../components/layout.ts'
import { respond, sseAction } from '../../components/sse.ts'

export function createBackupsRouter(reconnectDb: () => void): Hono<AppEnv> {
  const app = new Hono<AppEnv>()

  app.get('/', async (c) => {
    const db = c.get('db')
    const config = c.get('config')
    const base = config.basePath.replace(/\/$/, '')
    const tables = listTables(db)
    const backups = listBackups(config.backupsDir)
    const content = backupsView({ backups, basePath: base })
    const navHtml = nav({ basePath: base, activeSection: 'backups', tables })
    return respond(c, {
      fullPage: () => layout({ title: 'Backups', nav: navHtml, content }),
      fragment: () => `<main id="main">${content}</main>`,
    })
  })

  // Create a new backup
  app.post('/', async (c) => {
    const config = c.get('config')
    const base = config.basePath.replace(/\/$/, '')
    createBackup(config.database, config.backupsDir)
    const backups = listBackups(config.backupsDir)
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(`<main id="main">${backupsView({ backups, basePath: base })}</main>`)
    })
  })

  // Restore from a backup — static route before parameterized (none here, but good practice)
  app.post('/:name/restore', async (c) => {
    const db = c.get('db')
    const config = c.get('config')
    const name = decodeURIComponent(c.req.param('name'))
    const base = config.basePath.replace(/\/$/, '')
    const backup = c.req.query('backup') !== 'false'
    try { db.close() } catch { /* already closed or errored */ }
    restoreBackup(config.database, config.backupsDir, name, backup)
    reconnectDb()
    const backups = listBackups(config.backupsDir)
    return sseAction(c, async ({ patchElements }) => {
      await patchElements(`<main id="main">${backupsView({ backups, basePath: base })}</main>`)
      await patchElements(`<div id="backup-status" style="padding:0.75rem;background:var(--pb-badge-fk-bg);border-radius:6px;margin-bottom:1rem;color:var(--pb-badge-fk-fg)">Restored from <strong>${name}</strong>. A safety backup was created automatically.</div>`)
    })
  })

  return app
}
