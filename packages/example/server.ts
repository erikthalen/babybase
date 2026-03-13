import { serve } from "@hono/node-server";
import { defineBabybase } from "@babybase/core";
import { Hono } from "hono";
import { html } from "hono/html";
import type { DatabaseSync } from "node:sqlite";

type AppEnv = { Variables: { db: DatabaseSync | null } };

const { app: babybase, getDb } = defineBabybase({
  database: "./chinook.db",
});

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  c.set("db", getDb());
  await next();
});

app.get("/artists", (c) => {
  const db = c.get("db");
  const artists =
    (db
      ?.prepare("SELECT ArtistId, Name FROM artists ORDER BY Name LIMIT 50")
      .all() as { ArtistId: number; Name: string }[]) ?? [];

  return c.html(
    html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Artists</title>
          <style>
            body {
              font-family: sans-serif;
              max-width: 600px;
              margin: 2rem auto;
            }
            ul {
              list-style: none;
              padding: 0;
            }
            li {
              padding: 0.4rem 0;
              border-bottom: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <h1>Artists</h1>
          <ul>
            ${artists.map((a) => html`<li>${a.Name}</li>`)}
          </ul>
        </body>
      </html>`,
  );
});

app.route("/", babybase);

serve({ fetch: app.fetch, port: 3002 }, () => {
  console.log("Babybase dev server: http://localhost:3002");
  console.log("Artists page:        http://localhost:3002/artists");
});
