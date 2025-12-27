import { NextRequest, NextResponse } from "next/server";
import PrizeService from "@/components/lib/db/service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image, weight, stock, color } = body;

    if (
      !name ||
      !image ||
      weight === undefined ||
      stock === undefined ||
      !color
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prize = await PrizeService.createPrize({
      name,
      image, 
      weight: Number(weight),
      stock: Number(stock),
      color,
    });

    return NextResponse.json({
      success: true,
      data: prize,
      message: "Prize created successfully",
    });
  } catch (error) {
    console.error("Error creating prize:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create prize" },
      { status: 500 }
    );
  }
}
