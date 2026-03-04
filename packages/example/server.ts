import { serve } from "@hono/node-server";
import { definePicobase } from "@picobase/core";
import { Hono } from "hono";

const app = new Hono();
app.route("/", definePicobase({ database: "chinook.db" }));

serve({ fetch: app.fetch, port: 3002 }, () => {
  console.log("Picobase dev server: http://localhost:3002");
});
