import { initDatabase } from "./schema";
import { blobSync } from "./blobSync";
import type { Prize } from "./schema";

export class PrizeService {
  /**
   * Get all prizes
   */
  static async getAllPrizes(): Promise<Prize[]> {
    return blobSync.withSync(async () => {
      const db = initDatabase();
      const prizes = db
        .prepare("SELECT * FROM prizes ORDER BY id")
        .all() as Prize[];
      db.close();
      return prizes;
    });
  }

  /**
   * Get prize by ID
   */
  static async getPrizeById(id: number): Promise<Prize | null> {
    return blobSync.withSync(async () => {
      const db = initDatabase();
      const prize = db.prepare("SELECT * FROM prizes WHERE id = ?").get(id) as
        | Prize
        | undefined;
      db.close();
      return prize || null;
    });
  }

  /**
   * Update prize stock and weight
   */
  static async updatePrize(
    id: number,
    data: { weight?: number; stock?: number }
  ): Promise<Prize | null> {
    return blobSync.withSync(async () => {
      const db = initDatabase();

      const updates: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const values: any[] = [];

      if (data.weight !== undefined) {
        updates.push("weight = ?");
        values.push(data.weight);
      }

      if (data.stock !== undefined) {
        updates.push("stock = ?");
        values.push(data.stock);
      }

      if (updates.length === 0) {
        db.close();
        return null;
      }

      values.push(id);

      const stmt = db.prepare(`
        UPDATE prizes 
        SET ${updates.join(", ")} 
        WHERE id = ?
      `);

      stmt.run(...values);

      const prize = db
        .prepare("SELECT * FROM prizes WHERE id = ?")
        .get(id) as Prize;
      db.close();

      return prize;
    });
  }

  /**
   * Batch update multiple prizes
   */
  static async batchUpdatePrizes(
    updates: Array<{ id: number; weight?: number; stock?: number }>
  ): Promise<boolean> {
    return blobSync.withSync(async () => {
      const db = initDatabase();

      const transaction = db.transaction(() => {
        for (const update of updates) {
          const sets: string[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const values: any[] = [];

          if (update.weight !== undefined) {
            sets.push("weight = ?");
            values.push(update.weight);
          }

          if (update.stock !== undefined) {
            sets.push("stock = ?");
            values.push(update.stock);
          }

          if (sets.length > 0) {
            values.push(update.id);
            db.prepare(`UPDATE prizes SET ${sets.join(", ")} WHERE id = ?`).run(
              ...values
            );
          }
        }
      });

      transaction();
      db.close();
      return true;
    });
  }

  /**
   * Create new prize
   */
  static async createPrize(data: {
    name: string;
    image: string;
    weight: number;
    stock: number;
    color: string;
  }): Promise<Prize> {
    return blobSync.withSync(async () => {
      const db = initDatabase();

      const stmt = db.prepare(`
        INSERT INTO prizes (name, image, weight, stock, color)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.name,
        data.image,
        data.weight,
        data.stock,
        data.color
      );
      const prize = db
        .prepare("SELECT * FROM prizes WHERE id = ?")
        .get(result.lastInsertRowid) as Prize;

      db.close();
      return prize;
    });
  }

  /**
   * Delete prize
   */
  static async deletePrize(id: number): Promise<boolean> {
    return blobSync.withSync(async () => {
      const db = initDatabase();
      const stmt = db.prepare("DELETE FROM prizes WHERE id = ?");
      const result = stmt.run(id);
      db.close();
      return result.changes > 0;
    });
  }

  /**
   * Decrease stock after spin
   */
  static async decreaseStock(id: number): Promise<boolean> {
    return blobSync.withSync(async () => {
      const db = initDatabase();
      const stmt = db.prepare(
        "UPDATE prizes SET stock = stock - 1 WHERE id = ? AND stock > 0"
      );
      const result = stmt.run(id);
      db.close();
      return result.changes > 0;
    });
  }

  /**
   * Get prizes with stock > 0 (for wheel)
   */
  static async getAvailablePrizes(): Promise<Prize[]> {
    return blobSync.withSync(async () => {
      const db = initDatabase();
      const prizes = db
        .prepare("SELECT * FROM prizes WHERE stock > 0 ORDER BY id")
        .all() as Prize[];
      db.close();
      return prizes;
    });
  }
}

export default PrizeService;
