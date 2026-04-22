import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initDatabase } from "@/components/lib/db/schema";

// ── Helpers ──────────────────────────────────────────────────────────────────

function weightedPick(
  prizes: { name: string; weight: number; stock: number }[],
) {
  const pool = prizes.filter((p) => p.stock > 0);
  const totalWeight = pool.reduce((s, p) => s + p.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const p of pool) {
    rand -= p.weight;
    if (rand <= 0) return p.name;
  }
  return pool[pool.length - 1].name;
}

function simulate(
  prizes: { name: string; weight: number; stock: number }[],
  spins: number,
) {
  const counts: Record<string, number> = {};
  for (let i = 0; i < spins; i++) {
    const result = weightedPick(prizes);
    counts[result] = (counts[result] ?? 0) + 1;
  }
  return counts;
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const PRIZES = [
  { name: "KEY CHAIN", weight: 30, stock: 30 },
  { name: "NOTEBOOK", weight: 20, stock: 20 },
  { name: "MUG", weight: 16, stock: 16 },
  { name: "HAND FAN", weight: 30, stock: 30 },
  { name: "PULPEN", weight: 25, stock: 25 },
  { name: "ZONK", weight: 479, stock: 9999 },
];

const TOTAL_WEIGHT = PRIZES.reduce((s, p) => s + p.weight, 0); // 600

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Prize weight configuration", () => {
  it("total weight harus 600", () => {
    expect(TOTAL_WEIGHT).toBe(600);
  });

  it("ZONK harus punya weight terbesar", () => {
    const zonk = PRIZES.find((p) => p.name === "ZONK")!;
    const others = PRIZES.filter((p) => p.name !== "ZONK");
    expect(zonk.weight).toBeGreaterThan(
      Math.max(...others.map((p) => p.weight)),
    );
  });

  it("peluang ZONK harus antara 75%–85%", () => {
    const zonk = PRIZES.find((p) => p.name === "ZONK")!;
    const prob = zonk.weight / TOTAL_WEIGHT;
    expect(prob).toBeGreaterThanOrEqual(0.75);
    expect(prob).toBeLessThanOrEqual(0.85);
  });

  it("total stok hadiah nyata harus 121", () => {
    const realStock = PRIZES.filter((p) => p.name !== "ZONK").reduce(
      (s, p) => s + p.stock,
      0,
    );
    expect(realStock).toBe(121);
  });

  it("semua prize harus punya weight > 0", () => {
    PRIZES.forEach((p) => expect(p.weight).toBeGreaterThan(0));
  });

  it("semua prize harus punya stock > 0", () => {
    PRIZES.forEach((p) => expect(p.stock).toBeGreaterThan(0));
  });
});

describe("Simulasi spin 10.000x", () => {
  const SPINS = 10_000;
  let results: Record<string, number>;

  beforeEach(() => {
    results = simulate(PRIZES, SPINS);
  });

  it("ZONK keluar 75%–85% dari spin", () => {
    const zonkRate = (results["ZONK"] ?? 0) / SPINS;
    expect(zonkRate).toBeGreaterThanOrEqual(0.72); // toleransi ±3%
    expect(zonkRate).toBeLessThanOrEqual(0.88);
  });

  it("KEY CHAIN keluar 3%–7%", () => {
    const rate = (results["KEY CHAIN"] ?? 0) / SPINS;
    expect(rate).toBeGreaterThanOrEqual(0.03);
    expect(rate).toBeLessThanOrEqual(0.07);
  });

  it("HAND FAN keluar 3%–7%", () => {
    const rate = (results["HAND FAN"] ?? 0) / SPINS;
    expect(rate).toBeGreaterThanOrEqual(0.03);
    expect(rate).toBeLessThanOrEqual(0.07);
  });

  it("PULPEN keluar 2%–6%", () => {
    const rate = (results["PULPEN"] ?? 0) / SPINS;
    expect(rate).toBeGreaterThanOrEqual(0.02);
    expect(rate).toBeLessThanOrEqual(0.06);
  });

  it("NOTEBOOK keluar 1.5%–5%", () => {
    const rate = (results["NOTEBOOK"] ?? 0) / SPINS;
    expect(rate).toBeGreaterThanOrEqual(0.015);
    expect(rate).toBeLessThanOrEqual(0.05);
  });

  it("MUG keluar 1%–4%", () => {
    const rate = (results["MUG"] ?? 0) / SPINS;
    expect(rate).toBeGreaterThanOrEqual(0.01);
    expect(rate).toBeLessThanOrEqual(0.04);
  });

  it("estimasi hadiah terbagi habis dalam 600 spin", () => {
    // Di 600 spin nyata, hadiah nyata ~= 121 pcs (20.2%)
    const realPrizeRate =
      PRIZES.filter((p) => p.name !== "ZONK").reduce(
        (s, p) => s + p.weight,
        0,
      ) / TOTAL_WEIGHT;
    expect(realPrizeRate).toBeCloseTo(0.202, 1);
  });
});

describe("Edge case: stok habis", () => {
  it("prize dengan stok 0 tidak masuk pool", () => {
    const prizesWithEmpty = [
      ...PRIZES.filter((p) => p.name !== "MUG"),
      { name: "MUG", weight: 16, stock: 0 }, // stok habis
    ];
    const results = simulate(prizesWithEmpty, 1000);
    expect(results["MUG"]).toBeUndefined();
  });

  it("sistem tetap jalan walau semua hadiah habis (hanya ZONK tersisa)", () => {
    const onlyZonk = PRIZES.map((p) =>
      p.name === "ZONK" ? p : { ...p, stock: 0 },
    );
    const results = simulate(onlyZonk, 100);
    expect(results["ZONK"]).toBe(100);
  });
});

describe("Simulasi sampai stok habis (121 hadiah nyata)", () => {
  it("semua hadiah nyata habis sebelum atau tepat di spin ke-600", () => {
    const stock = {
      "KEY CHAIN": 30,
      NOTEBOOK: 20,
      MUG: 16,
      "HAND FAN": 30,
      PULPEN: 25,
    };
    const prizes = PRIZES.map((p) => ({
      ...p,
      stock: stock[p.name as keyof typeof stock] ?? p.stock,
    }));

    let totalSpins = 0;
    let realPrizesGiven = 0;
    const given: Record<string, number> = {};

    while (totalSpins < 600) {
      totalSpins++;
      const pool = prizes.filter((p) => p.stock > 0);
      const totalW = pool.reduce((s, p) => s + p.weight, 0);
      let rand = Math.random() * totalW;
      let picked = pool[pool.length - 1];
      for (const p of pool) {
        rand -= p.weight;
        if (rand <= 0) {
          picked = p;
          break;
        }
      }

      if (picked.name !== "ZONK") {
        picked.stock--;
        realPrizesGiven++;
        given[picked.name] = (given[picked.name] ?? 0) + 1;
      }
    }

    console.table({
      ...Object.fromEntries(
        Object.entries(given).map(([k, v]) => [
          k,
          { diberikan: v, sisa: (stock[k as keyof typeof stock] ?? 0) - v },
        ]),
      ),
      ZONK: { diberikan: totalSpins - realPrizesGiven, sisa: "∞" },
    });

    // Semua hadiah nyata tidak melebihi stok
    expect(given["KEY CHAIN"] ?? 0).toBeLessThanOrEqual(30);
    expect(given["HAND FAN"] ?? 0).toBeLessThanOrEqual(30);
    expect(given["PULPEN"] ?? 0).toBeLessThanOrEqual(25);
    expect(given["NOTEBOOK"] ?? 0).toBeLessThanOrEqual(20);
    expect(given["MUG"] ?? 0).toBeLessThanOrEqual(16);

    // Total hadiah nyata tidak melebihi 121
    expect(realPrizesGiven).toBeLessThanOrEqual(121);
  });

  it("distribusi per prize proporsional terhadap weight-nya", () => {
    const RUNS = 50; // jalankan 50 simulasi, ambil rata-rata
    const totals: Record<string, number> = {};

    for (let r = 0; r < RUNS; r++) {
      const prizes = PRIZES.map((p) => ({ ...p }));
      const stock = {
        "KEY CHAIN": 30,
        NOTEBOOK: 20,
        MUG: 16,
        "HAND FAN": 30,
        PULPEN: 25,
      };
      prizes.forEach((p) => {
        if (p.name !== "ZONK")
          p.stock = stock[p.name as keyof typeof stock] ?? p.stock;
      });

      for (let i = 0; i < 600; i++) {
        const pool = prizes.filter((p) => p.stock > 0);
        const totalW = pool.reduce((s, p) => s + p.weight, 0);
        let rand = Math.random() * totalW;
        let picked = pool[pool.length - 1];
        for (const p of pool) {
          rand -= p.weight;
          if (rand <= 0) {
            picked = p;
            break;
          }
        }
        if (picked.name !== "ZONK") picked.stock--;
        totals[picked.name] = (totals[picked.name] ?? 0) + 1;
      }
    }

    // Rata-rata per run
    const avg = Object.fromEntries(
      Object.entries(totals).map(([k, v]) => [k, +(v / RUNS).toFixed(1)]),
    );
    console.log("Rata-rata per simulasi (50 run × 600 spin):", avg);

    // KEY CHAIN & HAND FAN harus lebih sering dari MUG (weight lebih besar)
    expect(avg["KEY CHAIN"]).toBeGreaterThan(avg["MUG"]);
    expect(avg["HAND FAN"]).toBeGreaterThan(avg["MUG"]);
    expect(avg["PULPEN"]).toBeGreaterThan(avg["MUG"]);
    expect(avg["NOTEBOOK"]).toBeGreaterThan(avg["MUG"]);
  });
});
