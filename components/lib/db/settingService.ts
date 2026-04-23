import { supabase } from "./supabase";
import type { Settings } from "@/components/types/settings";

export class SettingsService {
  static async getSettings(): Promise<Settings> {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return data as Settings;
  }

  static async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const { data: settings, error } = await supabase
      .from("settings")
      .update(data)
      .eq("id", 1)
      .select()
      .single();
    if (error) throw error;
    return settings as Settings;
  }
}

export default SettingsService;
