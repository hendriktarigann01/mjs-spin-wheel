import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface Prize {
  id: number;
  name: string;
  image: string;
  weight: number;
  stock: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export function initDatabase(): Database.Database {
  // Ensure db directory exists
  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "prizes.db");
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrency
  db.pragma("journal_mode = WAL");

  // Create prizes table
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

  // Create trigger for updated_at
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_prizes_timestamp 
    AFTER UPDATE ON prizes
    BEGIN
      UPDATE prizes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  // Insert default data if table is empty
  const count = db.prepare("SELECT COUNT(*) as count FROM prizes").get() as {
    count: number;
  };

  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO prizes (name, image, weight, stock, color) 
      VALUES (?, ?, ?, ?, ?)
    `);

    const defaultPrizes = [
      ["KEY CHAIN", "/prize/keychain.png", 15, 60, "#36B0A9"],
      ["NOTEBOOK", "/prize/notebook.png", 8, 25, "#277C79"],
      ["MUG", "/prize/mug.png", 7, 20, "#36B0A9"],
      ["HAND FAN", "/prize/fan.png", 20, 50, "#277C79"],
      ["ZONK", "/prize/zonk.png", 50, 9999, "#36B0A9"],
    ];

    const insertMany = db.transaction((prizes) => {
      for (const prize of prizes) {
        insert.run(...prize);
      }
    });

    insertMany(defaultPrizes);
  }

  return db;
}
