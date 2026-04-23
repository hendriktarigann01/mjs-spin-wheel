import { NextResponse } from "next/server";
import { StorageService } from "@/components/lib/db/storageService";
import { writeFile } from "fs/promises";
import path from "path";

const IS_LOCAL = process.env.NODE_ENV === "development";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json(
        { success: false, error: "File and type are required" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${type}_${Date.now()}_${file.name}`;

    if (IS_LOCAL) {
      // Development: Save to /public/uploads/
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, filename);

      // Create directory if not exists
      import("fs/promises").then(async ({ mkdir, access }) => {
        try {
          await access(uploadDir);
        } catch {
          await mkdir(uploadDir, { recursive: true });
        }
      });

      await writeFile(filePath, buffer);
      const url = `/uploads/${filename}`;

      return NextResponse.json({ success: true, url });
    } else {
      // Production: Upload to Supabase Storage
      const result = await StorageService.upload(
        "customization",
        `customization/${filename}`,
        buffer,
      );
      return NextResponse.json({ success: true, url: result.url });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
