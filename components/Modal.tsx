import React, { useEffect } from "react";
import Image from "next/image";
import { Prize } from "@/components/types/prize";
import { triggerConfetti } from "@/components/utils/confetti";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize | null;
  isProduction: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  prize,
  isProduction,
}) => {
  useEffect(() => {
    if (isOpen && prize && prize.name !== "ZONK") {
      triggerConfetti();
    }
  }, [isOpen, prize]);

  if (!isOpen || !prize) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-100">
      <div className="bg-[#7DD3CE] rounded-2xl p-12 max-w-md text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#17242B] text-3xl font-bold hover:text-gray-700"
        >
          ×
        </button>
        <h2 className="text-4xl font-bold text-[#17242B] mb-6">
          {prize.name === "ZONK" ? "ZONK!" : "SELAMAT!"}
        </h2>
        <div className="relative w-48 h-48 mx-auto mb-6 bg-transparent rounded-lg overflow-hidden">
          <Image
            src={prize.image}
            alt={prize.name}
            fill
            className="object-contain"
          />
        </div>
        <p className="text-2xl font-bold text-[#17242B] mb-2">
          {prize.name === "ZONK"
            ? "Coba lagi ya!🤚😜🤚"
            : `Kamu mendapat ${prize.name}!`}
        </p>
        {!isProduction && (
          <p className="text-sm text-[#17242B] mt-4">
            Stock tersisa: {prize.stock}
          </p>
        )}
      </div>
    </div>
  );
};
