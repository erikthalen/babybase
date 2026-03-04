# CLI

The easiest way to use Picobase is via the CLI — no server setup, no configuration file, no dependencies to install.

## Usage

```bash
npx picobase ./my-database.db
```

This starts a local server and opens your browser automatically.

```bash
npx picobase ./my-database.db --port 4000
```

## Options

| Option          | Default | Description              |
| --------------- | ------- | ------------------------ |
| `--port`, `-p`  | `3000`  | Port to listen on        |

## Where files are stored

Picobase creates a `.picobase/` folder **next to your database file** the first time it needs to write something (a backup, a migration, or a settings file). If you never use those features, no folder is created.

```
my-project/
  data.db
  .picobase/
    storage/      ← database backups
    migrations/   ← SQL migration files
    picobase-settings.json
```

## Install globally

If you use Picobase regularly, install it once instead of running through `npx` every time:

```bash
npm install -g picobase
picobase ./my-database.db
```
