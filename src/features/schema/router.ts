import { Hono } from 'hono'
import type { AppEnv } from '../../index.ts'
import { listTables } from '../../db/schema-queries.ts'
import { getFullSchema } from './queries.ts'
import { schemaListView, erDiagramView } from './views.ts'
import { layout, nav } from '../../components/layout.ts'
import { respond } from '../../components/sse.ts'

export function createSchemaRouter(): Hono<AppEnv> {
  const app = new Hono<AppEnv>()

  app.get('/', async (c) => {
    const db = c.get('db')
    const config = c.get('config')
    const base = config.basePath.replace(/\/$/, '')
    const tables = listTables(db)
    const schema = getFullSchema(db)
    const content = schemaListView(schema, base)
    const navHtml = nav({ basePath: base, activeSection: 'schema', tables })
    return respond(c, {
      fullPage: () => layout({ title: 'Schema', nav: navHtml, content }),
      fragment: () => `<main id="main">${content}</main>`,
    })
  })

  app.get('/diagram', async (c) => {
    const db = c.get('db')
    const config = c.get('config')
    const base = config.basePath.replace(/\/$/, '')
    const tables = listTables(db)
    const schema = getFullSchema(db)
    const content = erDiagramView(schema, base)
    const navHtml = nav({ basePath: base, activeSection: 'schema', tables })
    return respond(c, {
      fullPage: () => layout({ title: 'ER Diagram', nav: navHtml, content }),
      fragment: () => `<main id="main">${content}</main>`,
    })
  })

  return app
}
