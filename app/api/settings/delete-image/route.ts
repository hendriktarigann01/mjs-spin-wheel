import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { readdir, unlink } from "fs/promises";
import path from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const IS_LOCAL = !BLOB_TOKEN || !BLOB_TOKEN.startsWith("vercel_blob_rw_");

export async function DELETE() {
  try {
    if (IS_LOCAL) {
      // Development: Delete from /public/uploads/
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      try {
        const files = await readdir(uploadDir);

        // Delete all files in the uploads directory
        await Promise.all(
          files.map((file) => unlink(path.join(uploadDir, file))),
        );

        return NextResponse.json({
          success: true,
          message: `Deleted ${files.length} file(s)`,
        });
      } catch (error) {
        // Directory might not exist, which is fine
        return NextResponse.json({
          success: true,
          message: "No files to delete",
        });
      }
    } else {
      // Production: Delete from Vercel Blob
      const { blobs } = await fetch(
        `https://blob.vercel-storage.com/?prefix=customization/`,
        {
          headers: {
            authorization: `Bearer ${BLOB_TOKEN}`,
          },
        },
      ).then((res) => res.json());

      if (blobs && blobs.length > 0) {
        await Promise.all(
          blobs.map((blob: { url: string }) =>
            del(blob.url, { token: BLOB_TOKEN! }),
          ),
        );

        return NextResponse.json({
          success: true,
          message: `Deleted ${blobs.length} file(s)`,
        });
      }

      return NextResponse.json({
        success: true,
        message: "No files to delete",
      });
    }
  } catch (error) {
    console.error("Error deleting uploads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete uploads",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
