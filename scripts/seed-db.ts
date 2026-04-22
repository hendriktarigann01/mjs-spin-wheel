import Database from "better-sqlite3";
import { blobSync } from "@/components/lib/db/blobSync";
import path from "path";

async function main() {
  const dbPath = path.join(process.cwd(), "tmp", "prizes.db");
  blobSync.forceDbPath(dbPath); 

  console.log("DB path:", dbPath);

  await blobSync.downloadFromBlob();

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  console.log("Seeding database...");

  db.prepare("DELETE FROM prizes").run();

  const prizes = [
    ["KEY CHAIN", "/prize/keychain.png", 65, 65, "#25569E"],
    ["NOTEBOOK", "/prize/notebook.png", 20, 20, "#0D1F3C"],
    ["MUG", "/prize/mug.png", 16, 16, "#25569E"],
    ["HAND FAN", "/prize/fan.png", 6, 6, "#0D1F3C"],
    ["PULPEN", "/prize/pulpen.png", 30, 0, "#25569E"],
  ];

  const insert = db.prepare(`
    INSERT INTO prizes (name, image, weight, stock, color)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const prize of prizes) {
    insert.run(...prize);
  }

  console.log("Database seeded successfully!");
  console.log(
    "Total prizes:",
    db.prepare("SELECT COUNT(*) as count FROM prizes").get(),
  );

  db.close();

 const uploaded = await blobSync.uploadToBlob();
  console.log(
    "Blob upload:",
    uploaded ? "SUCCESS" : "SKIPPED (local)",
  );
}

main().catch(console.error);
