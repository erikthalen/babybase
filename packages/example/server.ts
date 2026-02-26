import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { definePicobase } from "@picobase/core";

const ROOT = import.meta.dirname;

const app = new Hono();
app.route(
  "/",
  definePicobase({
    database: `${ROOT}/chinook.db`,
    migrationsDir: `${ROOT}/migrations`,
    backupsDir: `${ROOT}/backups`,
  }),
);

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Picobase dev server: http://localhost:3000");
});
