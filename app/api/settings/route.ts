import { NextResponse } from "next/server";
import SettingsService from "@/components/lib/db/settingService";

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = await SettingsService.updateSettings(body);
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
