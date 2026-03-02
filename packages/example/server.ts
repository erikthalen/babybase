import { serve } from "@hono/node-server";
import { definePicobase } from "@picobase/core";
import { Hono } from "hono";

const ROOT = import.meta.dirname;

const app = new Hono();
app.route(
  "/",
  definePicobase({
    database: `${ROOT}/dev.db`,
    migrationsDir: `${ROOT}/migrations`,
    backupsDir: `${ROOT}/backups`,
  }),
);

serve({ fetch: app.fetch, port: 3002 }, () => {
	console.log("Picobase dev server: http://localhost:3002");
});
