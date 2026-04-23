import { supabase } from "./supabase";
import type { Prize } from "@/components/types/prize";

export class PrizeService {
  static async getAllPrizes(): Promise<Prize[]> {
    const { data, error } = await supabase
      .from("prizes")
      .select("*")
      .order("id");
    if (error) throw error;
    return data as Prize[];
  }

  static async getPrizeById(id: number): Promise<Prize | null> {
    const { data, error } = await supabase
      .from("prizes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as Prize;
  }

  static async updatePrize(
    id: number,
    data: { weight?: number; stock?: number },
  ): Promise<Prize | null> {
    const { data: prize, error } = await supabase
      .from("prizes")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return prize as Prize;
  }

  static async batchUpdatePrizes(
    updates: Array<{ id: number; weight?: number; stock?: number }>,
  ): Promise<boolean> {
    for (const update of updates) {
      const { id, ...data } = update;
      await supabase.from("prizes").update(data).eq("id", id);
    }
    return true;
  }

  static async createPrize(data: {
    name: string;
    image: string;
    weight: number;
    stock: number;
    color: string;
  }): Promise<Prize> {
    const { data: prize, error } = await supabase
      .from("prizes")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return prize as Prize;
  }

  static async deletePrize(id: number): Promise<boolean> {
    const { error } = await supabase.from("prizes").delete().eq("id", id);
    return !error;
  }

  static async decreaseStock(id: number): Promise<boolean> {
    const { data: prize } = await supabase
      .from("prizes")
      .select("stock")
      .eq("id", id)
      .single();
    if (!prize || prize.stock <= 0) return false;
    const { error } = await supabase
      .from("prizes")
      .update({ stock: prize.stock - 1 })
      .eq("id", id);
    return !error;
  }

  static async getAvailablePrizes(): Promise<Prize[]> {
    const { data, error } = await supabase
      .from("prizes")
      .select("*")
      .gt("stock", 0)
      .order("id");
    if (error) throw error;
    return data as Prize[];
  }
}

export default PrizeService;
