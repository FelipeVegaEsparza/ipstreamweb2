import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

export type AppDatabase = BetterSQLite3Database<typeof schema>;
export type SqliteConnection = Database.Database;

const MIGRATIONS_FOLDER = 'drizzle';

export function resolveMigrationsFolder(folder = MIGRATIONS_FOLDER): string {
  return resolve(process.cwd(), folder);
}

export interface DatabaseHandle {
  db: AppDatabase;
  sqlite: SqliteConnection;
}

export function createDatabase(path: string, migrationsFolder = MIGRATIONS_FOLDER): DatabaseHandle {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const sqlite = new Database(path);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: resolveMigrationsFolder(migrationsFolder) });
  return { db, sqlite };
}

let cached: DatabaseHandle | null = null;

export function getDatabase(): AppDatabase {
  if (!cached) {
    const path = process.env.DATABASE_PATH ?? './data/app.db';
    cached = createDatabase(path);
  }
  return cached.db;
}
