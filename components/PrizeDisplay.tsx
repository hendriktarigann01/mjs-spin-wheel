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
      {/* Desktop landscape */}
      <div className="prize-vertical relative h-full max-h-170 overflow-hidden">
        <div
          className="flex flex-col"
          style={{ animation: "marqueeVertical 20s linear infinite" }}
        >
          {duplicatedPrizes.map((prize, idx) => (
            <div
              key={`${prize.id}-${idx}`}
              className="flex flex-col items-center gap-4 mb-12"
            >
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={prize.image}
                  alt={prize.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-white text-xl text-center">
                {prize.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile & Digital Signage portrait */}
      <div className="prize-horizontal relative w-full overflow-hidden py-4">
        <div
          className="flex gap-8"
          style={{ animation: "marqueeHorizontal 20s linear infinite" }}
        >
          {duplicatedPrizes.map((prize, idx) => (
            <div
              key={`${prize.id}-${idx}`}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="relative w-28 h-28 rounded-lg overflow-hidden">
                <Image
                  src={prize.image}
                  alt={prize.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-white text-base text-center whitespace-nowrap">
                {prize.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        /* Portrait: mobile & digital signage 1080x1920 */
        @media (orientation: portrait) {
          .prize-vertical {
            display: none;
          }
          .prize-horizontal {
            display: block;
          }
        }

        /* Landscape: desktop */
        @media (orientation: landscape) {
          .prize-vertical {
            display: block;
          }
          .prize-horizontal {
            display: none;
          }
        }

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
