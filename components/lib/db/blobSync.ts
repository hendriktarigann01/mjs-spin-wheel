import { put, head, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;
const DB_BLOB_PATH = "prizes.db";

export class BlobSyncService {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), "data", "prizes.db");
  }

  /**
   * Download database from Vercel Blob to local
   */
  async downloadFromBlob(): Promise<boolean> {
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
    // Download latest version
    await this.downloadFromBlob();

    // Execute the operation
    const result = await callback();

    // Upload back to blob
    await this.uploadToBlob();

    return result;
  }

  /**
   * Delete database from blob (for cleanup)
   */
  async deleteFromBlob(): Promise<boolean> {
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

export const blobSync = new BlobSyncService();
