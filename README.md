<br>
<br>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/logo-white.png">
    <img src=".github/logo-black.png" alt="babybase" height="48" />
  </picture>
</p>

<br>

<p align="center">
  A lightweight, self-hosted SQLite admin panel you mount inside your own server.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/runtime-Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/framework-Hono-e36002?style=flat-square" alt="Hono" />
  <img src="https://img.shields.io/badge/database-SQLite-003b57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/version-0.1.0-8b5cf6?style=flat-square" alt="Version" />
</p>

---

Babybase is a SQLite admin panel for your existing Node.js app. One command and your browser opens. No sign-up, no config file, no infra.

## Quick look

```sh
npx babybase ./my-database.db
```

That's it. Your browser opens automatically.

Explore your schema, browse rows, run migrations, and manage backups — all from the UI.

## Embed in your app

Mount it as a route inside your existing server:

```ts
import { serve } from "@hono/node-server";
import { defineBabybase } from "@babybase/core";
import { Hono } from "hono";

const app = new Hono();

app.route("/baby", defineBabybase({ database: "./my-app.db" }));

serve(app);
```

Protect it with whatever auth you already have:

```ts
app.use("/baby/*", yourAuthMiddleware);
app.route("/baby", defineBabybase({ database: "./app.db" }));
```

## Self-hosting

Because Babybase is a library, self-hosting is just running your app. Deploy the way you normally would — Fly.io, Railway, a VPS, a bare server — and Babybase comes along for the ride.

## Why SQLite

SQLite is a single file on disk. No server to run, no connection pool to configure. For internal tools, personal apps, and small projects it is often the right choice — fast, reliable, zero-maintenance. Babybase gives it a proper UI.
