import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { definePicobase } from "../src/index.ts"

const app = new Hono()
app.route("/", definePicobase({ database: "./example/dev.db" }))

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Picobase dev server: http://localhost:3000")
})
