import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile } from "fs/promises";
import path from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const IS_LOCAL = !BLOB_TOKEN || !BLOB_TOKEN.startsWith("vercel_blob_rw_");

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
      const fs = require("fs");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      await writeFile(filePath, buffer);
      const url = `/uploads/${filename}`;

      return NextResponse.json({ success: true, url });
    } else {
      // Production: Upload to Vercel Blob
      const blob = await put(`customization/${filename}`, buffer, {
        access: "public",
        token: BLOB_TOKEN!,
      });

      return NextResponse.json({ success: true, url: blob.url });
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
