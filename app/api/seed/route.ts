import { NextResponse } from "next/server";
import PrizeService from "@/components/lib/db/appService";
import SettingsService from "@/components/lib/db/settingService";

export const dynamic = "force-dynamic";

const SEED_SECRET = process.env.SEED_SECRET;

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();

    if (secret !== SEED_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Clear existing data
    await PrizeService.deletePrize(1);
    await PrizeService.deletePrize(2);
    await PrizeService.deletePrize(3);
    await PrizeService.deletePrize(4);
    await PrizeService.deletePrize(5);

    // Seed prizes
    console.log("Seeding prizes...");
    await Promise.all([
      PrizeService.createPrize({
        name: "KEY CHAIN",
        image: "/prize/keychain.png",
        weight: 65,
        stock: 65,
        color: "#25569E",
      }),
      PrizeService.createPrize({
        name: "NOTEBOOK",
        image: "/prize/notebook.png",
        weight: 20,
        stock: 20,
        color: "#0D1F3C",
      }),
      PrizeService.createPrize({
        name: "MUG",
        image: "/prize/mug.png",
        weight: 16,
        stock: 16,
        color: "#25569E",
      }),
      PrizeService.createPrize({
        name: "HAND FAN",
        image: "/prize/fan.png",
        weight: 46,
        stock: 46,
        color: "#0D1F3C",
      }),
      PrizeService.createPrize({
        name: "PEN",
        image: "/prize/pen.png",
        weight: 50,
        stock: 50,
        color: "#25569E",
      }),
    ]);

    console.log("Prizes seeded successfully! Total 5 prizes.");

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
      { status: 500 },
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
        { status: 401 },
      );
    }

    // Clear all prizes
    const prizes = await PrizeService.getAllPrizes();
    for (const prize of prizes) {
      await PrizeService.deletePrize(prize.id);
    }

    console.log(`🗑️  Deleted ${prizes.length} prizes`);

    return NextResponse.json({
      success: true,
      message: "All prizes deleted successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error clearing database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear database" },
      { status: 500 },
    );
  }
}
