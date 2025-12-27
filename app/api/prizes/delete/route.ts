// app/api/prizes/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import PrizeService from "@/components/lib/db/service";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Prize ID is required" },
        { status: 400 }
      );
    }

    const success = await PrizeService.deletePrize(id);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Prize deleted successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Prize not found or already deleted" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting prize:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete prize" },
      { status: 500 }
    );
  }
}
