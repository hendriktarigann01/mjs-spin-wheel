import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

const BLOB_TOKEN = process.env.BLOB_TOKEN!;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large" },
        { status: 400 }
      );
    }

    // Simpan sementara di /tmp
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `prize-${timestamp}.${extension}`;
    const tmpDir = path.join("/tmp", "prize");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tmpPath = path.join(tmpDir, filename);
    fs.writeFileSync(tmpPath, buffer);

    // Upload ke Vercel Blob
    const blob = await put(`prizes/${filename}`, buffer, {
      access: "public",
      token: BLOB_TOKEN,
    });

    // Kembalikan URL publik
    return NextResponse.json({
      success: true,
      url: blob.url, 
      filename: filename,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
