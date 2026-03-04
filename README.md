<br>
<br>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/logo-white.png">
    <img src=".github/logo-black.png" alt="picobase" height="48" />
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

Most database tools are designed for teams, cloud accounts, and enterprise scale. Picobase is designed for the opposite: a single file, on your machine, visible in your browser. No sign-up. No infra. No monthly bill.

It mounts directly into your existing server as a route — like adding `/pico` to your app — and gives you a polished interface to explore your schema, browse rows, run migrations, and manage backups. Everything you'd expect from a proper database GUI, with none of the overhead.

## Why SQLite

SQLite is the most deployed database engine in the world, and for good reason. It is a single file on disk. There is no server to run, no connection pool to configure, no daemon to crash at 3am. Your entire database is a file you can copy, email, or open with any tool.

For a vast category of projects — internal tools, personal apps, side projects, small SaaS products — SQLite is not a compromise. It is the right choice. Fast, reliable, zero-maintenance, and universally supported. The only thing it was missing was a nice UI.

## How it compares

Picobase occupies a different niche than the tools you may already know:

|                      | Picobase                      | Supabase                   | PocketBase       | Prisma Studio   |
| -------------------- | ----------------------------- | -------------------------- | ---------------- | --------------- |
| **Hosting**          | Your server                   | Supabase cloud / self-host | Separate binary  | Local dev only  |
| **Database**         | Your SQLite file              | PostgreSQL                 | Own SQLite       | Any (via ORM)   |
| **Auth / API layer** | None — bring your own         | Built-in                   | Built-in         | None            |
| **Footprint**        | A library import              | Full platform              | Separate process | Dev dependency  |
| **Best for**         | Existing apps that use SQLite | Greenfield projects        | Rapid prototypes | Prisma projects |

Supabase and PocketBase are full platforms — they bring their own auth, storage, realtime, and API generation. That is powerful, but it also means they own your architecture. Picobase does one thing: give you a window into your database. Your app, your data model, your rules — Picobase just makes it visible.

## Self-hosting

Because Picobase is a library rather than a service, "self-hosting" is just running your app. There is no separate container to manage, no port to expose, no admin password to rotate.

Deploy your Node.js application the way you normally would — on a VPS, a container platform, Fly.io, Railway, Render, or a bare server — and Picobase comes along for the ride. If you want to restrict access, put your existing auth middleware in front of the `/pico` route. You already own the server, so you already own the access controls.

```ts
// Protect with whatever auth you already have
app.use("/pico/*", yourAuthMiddleware);
app.route("/pico", definePicobase({ database: "./app.db" }));
```

## Getting started

```ts
import { serve } from "@hono/node-server";
import { definePicobase } from "@picobase/core";
import { Hono } from "hono";

const app = new Hono();

app.route("/pico", definePicobase({ database: "./my-app.db" }));

serve(app);
```

Then open **http://localhost:3000/pico** in your browser.
