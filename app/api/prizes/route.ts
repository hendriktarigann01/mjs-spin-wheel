import { NextResponse } from "next/server";
import PrizeService from "@/components/lib/db/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prizes = await PrizeService.getAllPrizes();
    return NextResponse.json({ success: true, data: prizes });
  } catch (error) {
    console.error("Error fetching prizes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch prizes" },
      { status: 500 }
    );
  }
}
