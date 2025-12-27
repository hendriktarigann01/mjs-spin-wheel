import { initDatabase } from "@/components/lib/db/schema";

const db = initDatabase();

console.log("Seeding database...");

db.prepare("DELETE FROM prizes").run();

const prizes = [
  ["KEY CHAIN", "/prize/keychain.png", 15, 60, "#36B0A9"],
  ["NOTEBOOK", "/prize/notebook.png", 8, 25, "#277C79"],
  ["MUG", "/prize/mug.png", 7, 20, "#36B0A9"],
  ["HAND FAN", "/prize/fan.png", 20, 50, "#277C79"],
  ["ZONK", "/prize/zonk.png", 50, 9999, "#36B0A9"],
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
  db.prepare("SELECT COUNT(*) as count FROM prizes").get()
);

db.close();
