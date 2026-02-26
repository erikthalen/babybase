import { DatabaseSync } from 'node:sqlite'
import { unlinkSync, existsSync, mkdirSync } from 'node:fs'

const path = './example/dev.db'

mkdirSync('./example', { recursive: true })
if (existsSync(path)) unlinkSync(path)

const db = new DatabaseSync(path)

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT,
    published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com');

  INSERT INTO posts (user_id, title, body, published) VALUES
    (1, 'Hello world', 'First post body', 1),
    (1, 'Draft post', 'Unpublished', 0),
    (2, 'Bob writes', 'Content here', 1);
`)

db.close()
console.log('Seeded example/dev.db with users and posts tables')
