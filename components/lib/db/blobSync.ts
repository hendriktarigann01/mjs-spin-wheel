// lib/db/blobSync.ts
import { put, head, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;
const DB_BLOB_PATH = "prizes.db";

const IS_LOCAL = !BLOB_TOKEN || !BLOB_TOKEN.startsWith("vercel_blob_rw_");

export class BlobSyncService {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), "tmp", "prizes.db");
  }

  /**
   * Download database from Vercel Blob to local
   */
  async downloadFromBlob(): Promise<boolean> {
    // Skip blob sync in local development
    if (IS_LOCAL) {
      console.log(
        "Local mode: Skipping blob download (using local SQLite file)"
      );
      return false;
    }

    try {
      // Check if blob exists
      const metadata = await head(DB_BLOB_PATH, {
        token: BLOB_TOKEN,
      });

      if (!metadata) {
        console.log("No database found in blob, will create new one");
        return false;
      }

      // Download the blob
      const response = await fetch(metadata.url);
      const buffer = await response.arrayBuffer();

      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Write to local file
      fs.writeFileSync(this.dbPath, Buffer.from(buffer));
      console.log("Database downloaded from blob successfully");
      return true;
    } catch (error) {
      console.error("Error downloading from blob:", error);
      return false;
    }
  }

  /**
   * Upload local database to Vercel Blob
   */
  async uploadToBlob(): Promise<boolean> {
    // Skip blob sync in local development
    if (IS_LOCAL) {
      console.log(
        "Local mode: Skipping blob upload (changes saved to local SQLite file)"
      );
      return true; // Return true so the flow doesn't break
    }

    try {
      if (!fs.existsSync(this.dbPath)) {
        console.error("Database file not found");
        return false;
      }

      // Read the database file
      const buffer = fs.readFileSync(this.dbPath);

      // Upload to Vercel Blob
      const blob = await put(DB_BLOB_PATH, buffer, {
        access: "public",
        token: BLOB_TOKEN,
      });

      console.log("Database uploaded to blob:", blob.url);
      return true;
    } catch (error) {
      console.error("Error uploading to blob:", error);
      return false;
    }
  }

  /**
   * Sync workflow: Download → Modify → Upload
   */
  async withSync<T>(callback: () => Promise<T>): Promise<T> {
    // Download latest version (skipped in local mode)
    await this.downloadFromBlob();

    // Execute the operation
    const result = await callback();

    // Upload back to blob (skipped in local mode)
    await this.uploadToBlob();

    return result;
  }

  /**
   * Delete database from blob (for cleanup)
   */
  async deleteFromBlob(): Promise<boolean> {
    if (IS_LOCAL) {
      console.log("Local mode: Skipping blob delete");
      return true;
    }

    try {
      await del(DB_BLOB_PATH, {
        token: BLOB_TOKEN,
      });
      console.log("Database deleted from blob");
      return true;
    } catch (error) {
      console.error("Error deleting from blob:", error);
      return false;
    }
  }
}

export async function uploadPrizeImage(filename: string) {
  const localPath = path.join("/prize", filename);

  if (!fs.existsSync(localPath)) throw new Error("File not found");

  const buffer = fs.readFileSync(localPath);

  const blob = await put(`prizes/${filename}`, buffer, {
    access: "public",
    token: process.env.BLOB_TOKEN!,
  });

  return blob.url;
}

export const blobSync = new BlobSyncService();
