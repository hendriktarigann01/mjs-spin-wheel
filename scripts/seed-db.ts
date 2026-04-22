import { initDatabase } from "@/components/lib/db/schema";

const db = initDatabase();

console.log("Seeding database...");

db.prepare("DELETE FROM prizes").run();

const prizes = [
  ["KEY CHAIN", "/prize/keychain.png", 30, 30, "#25569E"],
  ["NOTEBOOK", "/prize/notebook.png", 20, 20, "#0D1F3C"],
  ["MUG", "/prize/mug.png", 16, 16, "#25569E"],
  ["HAND FAN", "/prize/fan.png", 30, 30, "#0D1F3C"],
  ["PEN", "/prize/pen.png", 25, 25, "#25569E"],
  ["ZONK", "/prize/zonk.png", 479, 9999, "#0D1F3C"],
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
