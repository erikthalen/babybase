# CLI

The easiest way to use Babybase is via the CLI — no server setup, no configuration file, no dependencies to install.

## Usage

```bash
npx babybase ./my-database.db
```

This starts a local server and opens your browser automatically.

```bash
npx babybase ./my-database.db --port 4000
```

## Options

| Option          | Default | Description              |
| --------------- | ------- | ------------------------ |
| `--port`, `-p`  | `3000`  | Port to listen on        |

## Where files are stored

Babybase creates a `.babybase/` folder **next to your database file** the first time it needs to write something (a backup, a migration, or a settings file). If you never use those features, no folder is created.

```
my-project/
  data.db
  .babybase/
    storage/      ← database backups
    migrations/   ← SQL migration files
    babybase-settings.json
```

## Install globally

If you use Babybase regularly, install it once instead of running through `npx` every time:

```bash
npm install -g babybase
babybase ./my-database.db
```
