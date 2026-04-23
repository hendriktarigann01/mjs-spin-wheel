import { NextResponse } from "next/server";
import { StorageService } from "@/components/lib/db/storageService";
import { readdir, unlink } from "fs/promises";
import path from "path";

const IS_LOCAL = process.env.NODE_ENV === "development";

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
      // Production: Delete from Supabase Storage
      await StorageService.deleteAll("customization");

      return NextResponse.json({
        success: true,
        message: "Deleted all customization files",
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
