import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/components/lib/db/storageService";

export const dynamic = "force-dynamic";

const IS_LOCAL = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only JPG, PNG, and WebP are allowed",
        },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    // Generate unique filename
    import path from "path";
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `prize-${timestamp}.${extension}`;

    if (IS_LOCAL) {
      const uploadDir = path.join(process.cwd(), "public", "uploads/prizes");
      await import("fs").then((fs) => {
        if (!fs.existsSync(uploadDir))
          fs.mkdirSync(uploadDir, { recursive: true });
      });
      await import("fs/promises").then(({ writeFile }) =>
        writeFile(
          path.join(uploadDir, filename),
          Buffer.from(await file.arrayBuffer()),
        ),
      );
      const url = `/uploads/prizes/${filename}`;
      return NextResponse.json({ success: true, url, filename });
    } else {
      const result = await StorageService.upload("prizes", filename, file);
      return NextResponse.json({ success: true, url: result.url, filename });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
