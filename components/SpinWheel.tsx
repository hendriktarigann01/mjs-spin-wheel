"use client";

import { useState } from "react";
import { Prize } from "@/components/types/prize";
import Image from "next/image";

interface SpinWheelProps {
  prizes: Prize[];
  onSpinComplete: (prize: Prize) => void;
}

const SPIN_DURATION = 4000;
const DEFAULT_SPINS = 5;

const selectPrizeFromWheel = (prizes: Prize[]): Prize => {
  const availablePrizes = prizes.filter((p) => p.stock > 0);

  if (availablePrizes.length === 0) {
    return prizes[prizes.length - 1];
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
const calculateWheelRotation = (
  currentRotation: number,
  prizeIndex: number,
  totalPrizes: number,
  spins: number = 5,
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

export const SpinWheel: React.FC<SpinWheelProps> = ({
  prizes,
  onSpinComplete,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const segmentAngle = 360 / prizes.length;

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);

    const selectedPrize = selectPrizeFromWheel(prizes);
    const prizeIndex = prizes.findIndex((p) => p.id === selectedPrize.id);

    const totalRotation = calculateWheelRotation(
      rotation,
      prizeIndex,
      prizes.length,
      DEFAULT_SPINS,
    );

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinComplete(selectedPrize);
    }, SPIN_DURATION);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative scale-100 md:scale-90">
        <WheelHeader />

        <div className="relative w-150 h-150">
          <WheelPointer />

          <svg width="600" height="600" viewBox="0 0 500 500">
            <WheelSegments
              prizes={prizes}
              rotation={rotation}
              segmentAngle={segmentAngle}
            />

            <SpinButton isSpinning={isSpinning} onSpin={handleSpin} />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Wheel header dengan GIF
const WheelHeader = () => (
  <div className="z-20 mb-5 flex justify-center">
    <Image
      src="/heading-roulette.gif"
      alt="Spin N Win"
      width={100}
      height={100}
      className="w-120 h-auto"
    />
  </div>
);

// Pointer (arrow) component
const WheelPointer = () => (
  <div className="absolute top-1/2 right-0 transform rotate-90 -translate-y-6 z-20">
    <div className="w-0 h-0 border-l-20 border-r-20 border-t-40 border-l-transparent border-r-transparent border-t-brand-light" />
  </div>
);

// Wheel segments component
const WheelSegments = ({
  prizes,
  rotation,
  segmentAngle,
}: {
  prizes: Prize[];
  rotation: number;
  segmentAngle: number;
}) => (
  <g
    className="transition-transform duration-4000 ease-out"
    style={{
      transform: `rotate(${rotation}deg)`,
      transformOrigin: "250px 250px",
    }}
  >
    <circle cx="250" cy="250" r="240" fill="white" />

    {prizes.map((prize, index) => {
      const startAngle = index * segmentAngle * (Math.PI / 180);
      const endAngle = (index + 1) * segmentAngle * (Math.PI / 180);
      const largeArc = segmentAngle > 180 ? 1 : 0;

      const x1 = 250 + 230 * Math.cos(startAngle);
      const y1 = 250 + 230 * Math.sin(startAngle);
      const x2 = 250 + 230 * Math.cos(endAngle);
      const y2 = 250 + 230 * Math.sin(endAngle);

      const pathData = `M 250 250 L ${x1} ${y1} A 230 230 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const midAngle = (startAngle + endAngle) / 2;
      const imgX = 250 + 160 * Math.cos(midAngle);
      const imgY = 250 + 155 * Math.sin(midAngle);
      const imgRotation = index * segmentAngle + segmentAngle / 2 + 90;

      return (
        <g key={prize.id}>
          <path
            d={pathData}
            fill={prize.color}
            stroke="white"
            strokeWidth="2"
          />

          {prize.name === "ZONK" ? (
            <g transform={`translate(${imgX}, ${imgY}) rotate(${imgRotation})`}>
              <image
                href={prize.image}
                x="-20"
                y="-20"
                width="40"
                height="40"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          ) : (
            <text
              x={imgX}
              y={imgY}
              fill="white"
              fontSize="14"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${imgRotation + 270}, ${imgX}, ${imgY})`}
            >
              {prize.name}
            </text>
          )}
        </g>
      );
    })}
  </g>
);

// Spin button (center circle)
const SpinButton = ({
  isSpinning,
  onSpin,
}: {
  isSpinning: boolean;
  onSpin: () => void;
}) => (
  <>
    <circle
      cx="250"
      cy="250"
      r="40"
      fill="#25569E"
      stroke="white"
      strokeWidth="4"
      className={`${
        isSpinning ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } transition-all`}
      onClick={onSpin}
      style={{ pointerEvents: isSpinning ? "none" : "auto" }}
    />

    <text
      x="250"
      y="255"
      fill="white"
      fontSize="18"
      textAnchor="middle"
      className={`${isSpinning ? "cursor-not-allowed" : "cursor-pointer"}`}
      onClick={onSpin}
      style={{ pointerEvents: isSpinning ? "none" : "auto" }}
    >
      Spin
    </text>
  </>
);
