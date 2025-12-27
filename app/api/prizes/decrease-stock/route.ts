import { NextRequest, NextResponse } from "next/server";
import PrizeService from "@/components/lib/db/service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Prize ID is required" },
        { status: 400 }
      );
    }

    const success = await PrizeService.decreaseStock(id);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Stock decreased successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to decrease stock or stock is 0" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error decreasing stock:", error);
    return NextResponse.json(
      { success: false, error: "Failed to decrease stock" },
      { status: 500 }
    );
  }
}
