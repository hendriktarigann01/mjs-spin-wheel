// app/api/prizes/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import PrizeService from "@/components/lib/db/service";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prizes } = body;

    if (!Array.isArray(prizes)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Batch update
    const updates = prizes.map((p) => ({
      id: p.id,
      weight: p.weight,
      stock: p.stock,
    }));

    await PrizeService.batchUpdatePrizes(updates);

    return NextResponse.json({
      success: true,
      message: "Prizes updated successfully",
    });
  } catch (error) {
    console.error("Error updating prizes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update prizes" },
      { status: 500 }
    );
  }
}
