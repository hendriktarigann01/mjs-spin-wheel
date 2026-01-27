import { initDatabase } from "@/components/lib/db/schema";
import { blobSync } from "./blobSync";
import type { Settings } from "@/components/types/settings";

export class SettingsService {
  /**
   * Get settings
   */
  static async getSettings(): Promise<Settings> {
    return blobSync.withSync(async () => {
      const db = initDatabase();
      const settings = db
        .prepare("SELECT * FROM settings WHERE id = 1")
        .get() as Settings;
      db.close();
      return settings;
    }); 
  }

  /**
   * Update settings
   */
  static async updateSettings(data: {
    logo_left?: string;
    logo_right?: string;
    bg_color?: string;
    pattern_top?: string;
    pattern_bottom?: string;
    instagram?: string;
    whatsapp?: string;
    website?: string;
  }): Promise<Settings> {
    return blobSync.withSync(async () => {
      const db = initDatabase();

      const updates: string[] = [];
      const values: any[] = [];

      if (data.logo_left !== undefined) {
        updates.push("logo_left = ?");
        values.push(data.logo_left);
      }
      if (data.logo_right !== undefined) {
        updates.push("logo_right = ?");
        values.push(data.logo_right);
      }
      if (data.bg_color !== undefined) {
        updates.push("bg_color = ?");
        values.push(data.bg_color);
      }
      if (data.pattern_top !== undefined) {
        updates.push("pattern_top = ?");
        values.push(data.pattern_top);
      }
      if (data.pattern_bottom !== undefined) {
        updates.push("pattern_bottom = ?");
        values.push(data.pattern_bottom);
      }
      if (data.instagram !== undefined) {
        updates.push("instagram = ?");
        values.push(data.instagram);
      }
      if (data.whatsapp !== undefined) {
        updates.push("whatsapp = ?");
        values.push(data.whatsapp);
      }
      if (data.website !== undefined) {
        updates.push("website = ?");
        values.push(data.website);
      }

      if (updates.length > 0) {
        const stmt = db.prepare(`
          UPDATE settings 
          SET ${updates.join(", ")} 
          WHERE id = 1
        `);
        stmt.run(...values);
      }

      const settings = db
        .prepare("SELECT * FROM settings WHERE id = 1")
        .get() as Settings;
      db.close();

      return settings;
    });
  }
}

export default SettingsService;
