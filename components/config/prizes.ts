import { Prize } from "@/components/types/prize";

const IS_DEV = process.env.NEXT_PUBLIC_MODE === "development";

// Penyesuaian Strategi Distribusi Seharian
export const BASE_PRIZES: Prize[] = [
  {
    id: 1,
    name: "KEY CHAIN",
    image: "/prize/keychain.png",
    weight: IS_DEV ? 10 : 15,
    stock: IS_DEV ? 10 : 60, 
    color: "#36B0A9",
  },
  {
    id: 2,
    name: "NOTEBOOK",
    image: "/prize/notebook.png",
    weight: IS_DEV ? 5 : 8,
    stock: IS_DEV ? 5 : 25,
    color: "#277C79",
  },
  {
    id: 3,
    name: "MUG",
    image: "/prize/mug.png",
    weight: IS_DEV ? 5 : 7, 
    stock: IS_DEV ? 5 : 20,
    color: "#36B0A9",
  },
  {
    id: 4,
    name: "HAND FAN",
    image: "/prize/fan.png",
    weight: IS_DEV ? 10 : 20, 
    stock: IS_DEV ? 3 : 50,
    color: "#277C79",
  },
  {
    id: 5,
    name: "ZONK",
    image: "/prize/zonk.png",
    // Zonk dinaikkan menjadi 50% untuk menjaga durasi permainan hingga malam
    weight: IS_DEV ? 70 : 50,
    stock: 9999,
    color: "#36B0A9",
  },
];

export const createWheelSegments = (): Prize[] => {
  const segments: Prize[] = [];
  const repetitions = 4;

  let idCounter = 1;

  for (let i = 0; i < repetitions; i++) {
    BASE_PRIZES.forEach((prize) => {
      segments.push({
        ...prize,
        id: idCounter++,
        originalId: prize.id,
      });
    });
  }

  return segments;
};

export const WHEEL_PRIZES = createWheelSegments();

// Prize selection logic dengan weighted random
export const selectPrizeFromWheel = (prizes: Prize[]): Prize => {
  const availablePrizes = prizes.filter((p) => p.stock > 0);

  if (availablePrizes.length === 0) {
    return prizes[prizes.length - 1]; // Fallback ke ZONK
  }

  const totalWeight = availablePrizes.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of availablePrizes) {
    random -= prize.weight;
    if (random <= 0) return prize;
  }

  return availablePrizes[0];
};

// Calculate rotation untuk spin wheel
export const calculateWheelRotation = (
  currentRotation: number,
  prizeIndex: number,
  totalPrizes: number,
  spins: number = 5
): number => {
  const segmentAngle = 360 / totalPrizes;
  const segmentCenterAngle = prizeIndex * segmentAngle + segmentAngle / 2;
  const targetAngle = 90 - segmentCenterAngle;
  const normalizedCurrent = currentRotation % 360;
  const baseRotation = 360 * spins;
  const finalRotation = baseRotation + targetAngle;

  let totalRotation = currentRotation - normalizedCurrent + finalRotation;

  if (totalRotation - currentRotation < 360 * spins) {
    totalRotation += 360;
  }

  return totalRotation;
};
