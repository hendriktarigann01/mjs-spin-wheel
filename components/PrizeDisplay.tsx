import React from "react";
import Image from "next/image";
import { Prize } from "@/components/types/prize";

interface PrizeDisplayProps {
  prizes: Prize[];
}

export const PrizeDisplay: React.FC<PrizeDisplayProps> = ({ prizes }) => {
  const duplicatedPrizes = [...prizes, ...prizes];

  return (
    <>
      {/* Desktop version - Vertical scroll */}
      <div className="hidden md:block relative h-full max-h-170 overflow-hidden">
        <div
          className="flex flex-col"
          style={{ animation: "marqueeVertical 20s linear infinite" }}
        >
          {duplicatedPrizes.map((prize, idx) => (
            <div
              key={`${prize.id}-${idx}`}
              className="flex flex-col items-center gap-4 mb-12"
            >
              <div className="relative w-32 h-32 bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={prize.image}
                  alt={prize.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-white font-bold text-xl text-center">
                {prize.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile & Tablet version - Horizontal scroll */}
      <div className="md:hidden relative w-full overflow-hidden py-4">
        <div
          className="flex gap-6"
          style={{ animation: "marqueeHorizontal 20s linear infinite" }}
        >
          {duplicatedPrizes.map((prize, idx) => (
            <div
              key={`${prize.id}-${idx}`}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="relative w-20 h-20 bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={prize.image}
                  alt={prize.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-white font-bold text-sm text-center whitespace-nowrap">
                {prize.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marqueeVertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes marqueeHorizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
};
