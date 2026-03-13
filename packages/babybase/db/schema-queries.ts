import type { DatabaseSync } from "node:sqlite";

export function listTables(db: DatabaseSync): string[] {
  const rows = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_babybase_%' ORDER BY name",
    )
    .all() as { name: string }[];
  return rows.map((r) => r.name);
}
