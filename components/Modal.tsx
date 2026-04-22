import React, { useEffect } from "react";
import Image from "next/image";
import { Prize } from "@/components/types/prize";
import { triggerConfetti } from "@/components/utils/confetti";

interface Settings {
  logo_left: string | null;
  logo_right: string | null;
  bg_color: string;
  pattern_top: string | null;
  pattern_bottom: string | null;
  instagram: string;
  whatsapp: string;
  website: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize | null;
  isProduction: boolean;
  settings: Settings | null;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  prize,
  isProduction,
  settings,
}) => {
  useEffect(() => {
    if (isOpen && prize && prize.name !== "ZONK") {
      triggerConfetti();
    }
  }, [isOpen, prize]);

  if (!isOpen || !prize || !settings) return null;

  const isZonk = prize.name === "ZONK";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-6">
      <div className="relative bg-[#0D1F3C] rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 h-full w-full 
        bg-[linear-gradient(to_right,#002965_1px,transparent_1px),linear-gradient(to_bottom,#002965_1px,transparent_1px)] 
        bg-[size:45px_45px] scale-105"
        ></div>

        {/* Content */}
        <div className="relative z-30 flex flex-col items-center gap-6 px-10 py-12">
          <div className="p-10 relative rounded-xl bg-[#25569E80]/40">
            {/* Inner dashed border */}
            <div className="absolute inset-5 border-2 border-dashed rounded-xl border-brand-primary/60 pointer-events-none z-10" />
            {/* Title */}
            <h2 className="text-base text-brand-primary uppercase tracking-widest text-center">
              {isZonk ? "ZONK!" : "Congratulations, you got"}
            </h2>
            {/* Prize image */}
            <div className="items-center justify-center flex relative w-44 h-44 mx-auto">
              <Image
                src={prize.image}
                alt={prize.name}
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
            {/* Prize name */}
            <p className="text-2xl text-brand-primary uppercase tracking-[0.2em] text-center">
              {isZonk ? "Try again, okay?" : prize.name}
            </p>
            {/* Stock (dev only) */}
            {!isProduction && (
              <p className="text-xs text-brand-primary/50 uppercase tracking-widest">
                Remaining stock:{prize.stock}
              </p>
            )}
            {/* Done button */}
            <button
              onClick={onClose}
              className="relative mt-2 w-full py-3 border-2 border-brand-primary bg-[#0a192f] text-sm text-brand-primary uppercase tracking-widest transition-colors"
            >
              <div className="absolute inset-1 border-2 border-dashed border-brand-primary/50 pointer-events-none" />
              <span className="relative">
               Spin Again
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
