import { put, head, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;
const DB_BLOB_PATH = "prizes.db";

const getDbPath = () => {
  const isLocal = !BLOB_TOKEN || !BLOB_TOKEN.startsWith("vercel_blob_rw_");
  if (isLocal) {
    return path.join(process.cwd(), "data", "prizes.db");
  } else {
    return path.join("/tmp", "prizes.db");
  }
};

export class BlobSyncService {
  private dbPath: string;

  constructor() {
    this.dbPath = getDbPath();
  }

  // ← TAMBAH INI
  forceDbPath(newPath: string) {
    const dir = path.dirname(newPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.dbPath = newPath;
  }

  private get isLocal() {
    return !BLOB_TOKEN || !BLOB_TOKEN.startsWith("vercel_blob_rw_");
  }

  private ensureDir(dirPath: string) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (error) {
      console.warn("Could not create directory:", error);
    }
  }

  async downloadFromBlob(): Promise<boolean> {
    if (this.isLocal) {
      console.log(
        "Local mode: Skipping blob download (using local SQLite file)",
      );
      const dbDir = path.dirname(this.dbPath);
      this.ensureDir(dbDir);
      return false;
    }

    try {
      const metadata = await head(DB_BLOB_PATH, { token: BLOB_TOKEN });
      if (!metadata) {
        console.log("No database found in blob, will create new one");
        return false;
      }
      const response = await fetch(metadata.url);
      const buffer = await response.arrayBuffer();
      const dbDir = path.dirname(this.dbPath);
      this.ensureDir(dbDir);
      fs.writeFileSync(this.dbPath, Buffer.from(buffer));
      console.log("Database downloaded from blob successfully to", this.dbPath);
      return true;
    } catch (error) {
      console.error("Error downloading from blob:", error);
      return false;
    }
  }

  async uploadToBlob(): Promise<boolean> {
    if (this.isLocal) {
      console.log(
        "Local mode: Skipping blob upload (changes saved to local SQLite file)",
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

  async withSync<T>(callback: () => Promise<T>): Promise<T> {
    await this.downloadFromBlob();
    const result = await callback();
    await this.uploadToBlob();
    return result;
  }

  async deleteFromBlob(): Promise<boolean> {
    if (this.isLocal) {
      console.log("Local mode: Skipping blob delete");
      return true;
    }
    try {
      await del(DB_BLOB_PATH, { token: BLOB_TOKEN });
      console.log("Database deleted from blob");
      return true;
    } catch (error) {
      console.error("Error deleting from blob:", error);
      return false;
    }
  }

  getDbPath(): string {
    return this.dbPath;
  }
}

export const blobSync = new BlobSyncService();
