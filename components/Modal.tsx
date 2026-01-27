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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center overflow-hidden justify-center z-100">
      <div
        className="rounded-2xl p-12 overflow-hidden max-w-md text-center relative"
        style={{ backgroundColor: settings.bg_color }}
      >
        {settings.pattern_top && (
          <div className="hidden md:block absolute -top-2 -left-1 w-60 h-60">
            <Image
              src={settings.pattern_top}
              fill
              alt="pattern top"
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        {settings.pattern_bottom && (
          <div className="hidden md:block absolute -bottom-2 -right-1 w-60 h-60">
            <Image
              src={settings.pattern_bottom}
              fill
              alt="pattern bottom"
              className="object-contain"
              unoptimized
            />
          </div>
        )}
        <div className="p-8 bg-[#3AAFA9]/50 rounded-2xl relative space-y-4 z-10">
          <h2 className="text-xl font-bold text-white">
            {prize.name === "ZONK" ? "ZONK!" : "Congratulations, you got"}
          </h2>
          <div className="relative w-44 h-44 mx-auto bg-transparent rounded-lg overflow-hidden">
            <Image
              src={prize.image}
              alt={prize.name}
              fill
              className="object-contain"
            />
          </div>
          <p className="text-2xl font-bold text-white">
            {prize.name === "ZONK"
              ? "Coba lagi ya!🤚😜🤚"
              : `${prize.name}`}
          </p>
          {!isProduction && (
            <p className="text-sm text-[#17242B] mt-4">
              Stock tersisa: {prize.stock}
            </p>
          )}

          <button
            onClick={onClose}
            className="bg-[#73CAC2] text-white px-12 py-2 text-lg font-bold "
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
