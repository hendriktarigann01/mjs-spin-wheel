// lib/db/schema.ts
import Database from "better-sqlite3";
import { blobSync } from "./blobSync";

export function initDatabase(): Database.Database {
  const dbPath = blobSync.getDbPath();

  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");

  // Create prizes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS prizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      weight INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#25569E',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create settings table for customization
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      logo_left TEXT,
      logo_right TEXT,
      bg_color TEXT DEFAULT '#17242B',
      pattern_top TEXT,
      pattern_bottom TEXT,
      instagram TEXT DEFAULT '@mjsolutionid',
      whatsapp TEXT DEFAULT '+628111122492',
      website TEXT DEFAULT 'mjsolution.co.id',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default settings if not exists
  db.exec(`
    INSERT OR IGNORE INTO settings (id, logo_left, logo_right, bg_color, pattern_top, pattern_bottom)
    VALUES (1, '/logo/tei_logo.png', '/logo/mjs_logo_text.png', '#17242B', '/entry-top.webp', '/entry-bottom.webp')
  `);

  // Create trigger for updated_at prizes
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_prizes_timestamp 
    AFTER UPDATE ON prizes
    BEGIN
      UPDATE prizes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  // Create trigger for updated_at settings
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
    AFTER UPDATE ON settings
    BEGIN
      UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  return db;
}
