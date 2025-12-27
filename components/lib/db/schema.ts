// lib/db/schema.ts
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export function initDatabase(): Database.Database {
  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "prizes.db");
  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS prizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      weight INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#36B0A9',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_prizes_timestamp 
    AFTER UPDATE ON prizes
    BEGIN
      UPDATE prizes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  return db;
}
