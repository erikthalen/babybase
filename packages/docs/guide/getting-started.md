# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org) v22 or later

## Quickstart with the CLI

The fastest way to get started — no installation needed:

```bash
npx babybase ./my-database.db
```

Your browser will open automatically. See the [CLI guide](/guide/cli) for all options.

## Embedding in a Hono server

If you want Babybase alongside an existing app, install it as a dependency:

```bash
pnpm add @babybase/core
pnpm add hono @hono/node-server
```

Then mount it as a route:

```ts
import { serve } from "@hono/node-server";
import { defineBabybase } from "@babybase/core";
import { Hono } from "hono";
import type { DatabaseSync } from "node:sqlite";

type AppEnv = { Variables: { db: DatabaseSync | null } };

const { app: babybaseApp, getDb } = defineBabybase({ database: "./my-app.db" });

const app = new Hono<AppEnv>();

// Make the current db available to all your routes via context
app.use("*", async (c, next) => {
  c.set("db", getDb());
  await next();
});

app.get("/users", (c) => {
  const db = c.get("db");
  const users = db?.prepare("SELECT * FROM users").all() ?? [];
  return c.json(users);
});

app.route("/baby", babybaseApp);

serve(app);
```

Open `http://localhost:3000/baby` in your browser to access the GUI.

::: tip Sharing the database connection
`defineBabybase` returns both `app` (the Hono router) and `getDb` (a function that returns the active `DatabaseSync` instance). Calling `getDb()` on each request — rather than storing the result once — ensures your routes always use the correct connection even when Babybase mounts or unmounts a different database at runtime.
:::

## Configuration

| Option          | Type                   | Default                  | Description                                          |
| --------------- | ---------------------- | ------------------------ | ---------------------------------------------------- |
| `database`      | `string`               | —                        | Path to your `.db` or `.sqlite` file (required)      |
| `basePath`      | `string`               | `"/"`                    | URL prefix when mounted at a sub-path                |
| `migrationsDir` | `string`               | `./.babybase/migrations` | Directory for `.sql` migration files                 |
| `storage`       | `string \| S3Config`   | `./.babybase/storage`    | Local directory path, or an S3 config for remote storage |
| `readonly`      | `boolean`              | `false`                  | Hide schema editing and migration tools              |
| `autoBackup`    | `"daily" \| "weekly"`  | —                        | Automatically create backups on a schedule           |

### S3 storage

Pass an `S3Config` object to `storage` to send backups to any S3-compatible service — including [Garage](https://garagehq.deuxfleurs.fr/), AWS S3, Cloudflare R2, and MinIO. Backups are uploaded automatically whenever one is created.

```ts
const { app: babybaseApp } = defineBabybase({
  database: "./my-app.db",
  storage: {
    endpoint: "https://s3.example.com",
    bucket: "my-backups",
    accessKeyId: "your-access-key-id",
    secretAccessKey: "your-secret-access-key",
    region: "garage",       // optional, defaults to "garage"
    keyPrefix: "babybase",  // optional, prefixes uploaded object keys
  },
});
```

For local storage, pass a directory path string instead:

```ts
const { app: babybaseApp } = defineBabybase({
  database: "./my-app.db",
  storage: "./my-backups", // defaults to ./.babybase/storage
});
```

**`S3Config` options:**

| Option            | Type     | Default    | Description                                   |
| ----------------- | -------- | ---------- | --------------------------------------------- |
| `endpoint`        | `string` | —          | Base URL of the S3-compatible service         |
| `bucket`          | `string` | —          | Target bucket name                            |
| `accessKeyId`     | `string` | —          | Access key ID                                 |
| `secretAccessKey` | `string` | —          | Secret access key                             |
| `region`          | `string` | `"garage"` | Region passed to the S3 client                |
| `keyPrefix`       | `string` | —          | Optional path prefix for uploaded object keys |

::: tip Credentials and environment variables
Avoid hardcoding credentials in source code. Read them from environment variables instead:
```ts
storage: {
  endpoint: process.env.S3_ENDPOINT!,
  bucket: process.env.S3_BUCKET!,
  accessKeyId: process.env.S3_ACCESS_KEY_ID!,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
},
```
:::

### Read-only mode

Setting `readonly: true` hides all schema editing controls — creating/modifying tables and the migrations panel are disabled, and their write endpoints return `403`. Row data remains fully readable and writable. This is useful when you want to expose Babybase to team members who should be able to work with data but not modify the schema.

```ts
const { app: babybaseApp } = defineBabybase({
  database: "./my-app.db",
  readonly: true,
});
```
