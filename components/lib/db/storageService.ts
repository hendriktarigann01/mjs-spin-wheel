import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export class StorageService {
  static async upload(
    bucket: string,
    path: string,
    file: File | Buffer | Uint8Array,
    filename?: string,
  ): Promise<{ url: string; filename?: string }> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    return { url: publicUrl, filename };
  }

  static async deleteAll(bucket: string): Promise<void> {
    // List all files
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(bucket)
      .list();

    if (listError || !files || files.length === 0) {
      return; // No files or error (empty ok)
    }

    // Remove all files
    const deletePromises = files.map(({ name }) =>
      supabaseAdmin.storage.from(bucket).remove([name]),
    );

    await Promise.all(deletePromises);
  }
}

export default StorageService;
