import { blobSync } from "@/components/lib/db/blobSync";
import { initDatabase } from "@/components/lib/db/schema";
import path from "path";

async function main() {
  const dbPath = path.join(process.cwd(), "tmp", "prizes.db");
  blobSync.forceDbPath(dbPath);

  await blobSync.downloadFromBlob();

  const db = initDatabase();

  db.prepare(`
    UPDATE settings SET 
      logo_left = '/logo/arch_id.png',
      logo_right = '/logo/mjs_logo_text.png'
    WHERE id = 1
  `).run();

  console.log("✅ Settings updated:", db.prepare("SELECT logo_left, logo_right FROM settings WHERE id = 1").get());

  db.close();

  await blobSync.uploadToBlob();
  console.log("☁️ Blob updated!");
}

main().catch(console.error);
