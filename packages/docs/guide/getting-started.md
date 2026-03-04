# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org) v22 or later

## Quickstart with the CLI

The fastest way to get started — no installation needed:

```bash
npx picobase ./my-database.db
```

Your browser will open automatically. See the [CLI guide](/guide/cli) for all options.

## Embedding in a Hono server

If you want Picobase alongside an existing app, install it as a dependency:

```bash
pnpm add github:erikthalen/picobase
pnpm add hono @hono/node-server
```

Then mount it as a route:

```ts
import { serve } from "@hono/node-server";
import { definePicobase } from "@picobase/core";
import { Hono } from "hono";

const app = new Hono();

app.route("/pico", definePicobase({ database: "./my-app.db" }));

serve(app);
```

Open `http://localhost:3000/pico` in your browser to access the GUI.

## Configuration

| Option          | Type     | Default                    | Description                                         |
| --------------- | -------- | -------------------------- | --------------------------------------------------- |
| `database`      | `string` | —                          | Path to your `.db` or `.sqlite` file (required)     |
| `basePath`      | `string` | `"/"`                      | URL prefix when mounted at a sub-path               |
| `migrationsDir` | `string` | `./.picobase/migrations`   | Directory for `.sql` migration files                |
| `storageDir`    | `string` | `./.picobase/storage`      | Directory where database backups are stored         |
