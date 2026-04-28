import Database from "better-sqlite3";
import { join } from "node:path";

declare global {
  // eslint-disable-next-line no-var
  var __sentinelDb: Database.Database | undefined;
}

const DB_PATH = join(process.cwd(), "data", "sentinel.db");

export function getDb(): Database.Database {
  if (globalThis.__sentinelDb) return globalThis.__sentinelDb;
  const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  db.pragma("journal_mode = WAL");
  globalThis.__sentinelDb = db;
  return db;
}
