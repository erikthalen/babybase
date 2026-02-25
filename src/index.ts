import { Hono } from 'hono'
import { createDb } from './db/client.ts'
import type { PicobaseConfig } from './types.ts'
import type { DatabaseSync } from 'node:sqlite'
import { createTablesRouter } from './features/tables/router.ts'

export type AppEnv = {
  Variables: {
    db: DatabaseSync
    config: Required<PicobaseConfig>
  }
}

export function definePicobase(config: PicobaseConfig): Hono<AppEnv> {
  const resolved: Required<PicobaseConfig> = {
    database: config.database,
    basePath: config.basePath ?? '/',
    migrationsDir: config.migrationsDir ?? './migrations',
    backupsDir: config.backupsDir ?? './backups',
  }

  const db = createDb(resolved.database)
  const app = new Hono<AppEnv>()

  // Inject db and config into every request
  app.use('*', async (c, next) => {
    c.set('db', db)
    c.set('config', resolved)
    await next()
  })

  app.get('/', (c) => c.redirect(`${resolved.basePath.replace(/\/$/, '')}/tables`))

  app.route('/tables', createTablesRouter())
  app.get('/schema', (c) => c.text('schema coming soon'))
  app.get('/migrations', (c) => c.text('migrations coming soon'))
  app.get('/backups', (c) => c.text('backups coming soon'))

  return app
}

export type { PicobaseConfig }
