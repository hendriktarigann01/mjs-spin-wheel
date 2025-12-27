
import { put, head, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;
const DB_BLOB_PATH = "prizes.db";

const IS_LOCAL = !BLOB_TOKEN || !BLOB_TOKEN.startsWith("vercel_blob_rw_");

// Use local path in development
const getDbPath = () => {
  if (IS_LOCAL) {
    return path.join(process.cwd(), "data", "prizes.db");
  } else {
    // In production (Vercel), use /tmp directory (writable)
    return path.join("/tmp", "prizes.db");
  }
};

export class BlobSyncService {
  private dbPath: string;

  constructor() {
    this.dbPath = getDbPath();
  }

  /**
   * Ensure directory exists (only works in local or /tmp)
   */
  private ensureDir(dirPath: string) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (error) {
      console.warn("Could not create directory:", error);
    }
  }

  /**
   * Download database from Vercel Blob to local
   */
  async downloadFromBlob(): Promise<boolean> {
    if (IS_LOCAL) {
      console.log(
        "Local mode: Skipping blob download (using local SQLite file)"
      );
      const dbDir = path.dirname(this.dbPath);
      this.ensureDir(dbDir);
      return false;
    }

    try {
      const metadata = await head(DB_BLOB_PATH, {
        token: BLOB_TOKEN,
      });

      if (!metadata) {
        console.log("No database found in blob, will create new one");
        return false;
      }

      const response = await fetch(metadata.url);
      const buffer = await response.arrayBuffer();

      const dbDir = path.dirname(this.dbPath);
      this.ensureDir(dbDir);

      fs.writeFileSync(this.dbPath, Buffer.from(buffer));
      console.log(
        "Database downloaded from blob successfully to",
        this.dbPath
      );
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
    if (IS_LOCAL) {
      console.log(
        "Local mode: Skipping blob upload (changes saved to local SQLite file)"
      );
      return true;
    }

    try {
      if (!fs.existsSync(this.dbPath)) {
        console.error("Database file not found at", this.dbPath);
        return false;
      }

      const buffer = fs.readFileSync(this.dbPath);

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
    await this.downloadFromBlob();

    const result = await callback();

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

  /**
   * Get current database path
   */
  getDbPath(): string {
    return this.dbPath;
  }
}

export const blobSync = new BlobSyncService();
