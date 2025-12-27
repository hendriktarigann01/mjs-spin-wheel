
import { NextResponse } from "next/server";
import { initDatabase } from "@/components/lib/db/schema";
import { blobSync } from "@/components/lib/db/blobSync";

export const dynamic = "force-dynamic";

const SEED_SECRET = process.env.SEED_SECRET;

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();

    if (secret !== SEED_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await blobSync.withSync(async () => {
      const db = initDatabase();

      const count = db
        .prepare("SELECT COUNT(*) as count FROM prizes")
        .get() as { count: number };

      if (count.count > 0) {
        db.close();
        throw new Error(
          "Database already seeded. Please delete existing data first."
        );
      }

      console.log("Seeding database...");

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

      const insertMany = db.transaction((prizes) => {
        for (const prize of prizes) {
          insert.run(...prize);
        }
      });

      insertMany(prizes);

      const finalCount = db
        .prepare("SELECT COUNT(*) as count FROM prizes")
        .get() as { count: number };
      console.log(
        "Database seeded successfully! Total prizes:",
        finalCount.count
      );

      db.close();
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      prizes: 5,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

// Optional: Reset endpoint (clear all data)
export async function DELETE(request: Request) {
  try {
    const { secret } = await request.json();

    if (secret !== SEED_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await blobSync.withSync(async () => {
      const db = initDatabase();

      // Clear all prizes
      db.prepare("DELETE FROM prizes").run();

      console.log("🗑️  All prizes deleted");
      db.close();
    });

    return NextResponse.json({
      success: true,
      message: "All prizes deleted successfully",
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error clearing database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear database" },
      { status: 500 }
    );
  }
}
