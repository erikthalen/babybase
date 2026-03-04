import { DatabaseSync } from "node:sqlite";

export function createDb(path: string): DatabaseSync {
  return new DatabaseSync(path);
}
