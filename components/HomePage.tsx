"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { PrizeDisplay } from "@/components/PrizeDisplay";
import { Modal } from "@/components/Modal";
import { Prize } from "@/components/types/prize";

export function HomePage() {
  const IS_PRODUCTION = process.env.NEXT_PUBLIC_MODE === "production";
  const [wheelPrizes, setWheelPrizes] = useState<Prize[]>([]);
  const [basePrizes, setBasePrizes] = useState<Prize[]>([]);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrizes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/prizes");
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          const prizes = result.data;
          setBasePrizes(prizes);

          // Create wheel segments (4 repetitions)
          const wheelSegments = createWheelSegments(prizes);
          setWheelPrizes(wheelSegments);
        }
      } catch (error) {
        console.error("Error loading prizes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPrizes();
  }, []);

  const createWheelSegments = (prizes: Prize[]): Prize[] => {
    const segments: Prize[] = [];
    const repetitions = 4;
    let idCounter = 1;

    for (let i = 0; i < repetitions; i++) {
      prizes.forEach((prize) => {
        segments.push({
          ...prize,
          id: idCounter++,
          originalId: prize.id,
        });
      });
    }

    return segments;
  };

  const handleSpinComplete = async (prize: Prize) => {
    const originalId = prize.originalId || prize.id;

    try {
      // Decrease stock via API
      const response = await fetch("/api/prizes/decrease-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: originalId }),
      });

      if (response.ok) {
        // Reload prizes to get updated stock
        try {
          setLoading(true);
          const response = await fetch("/api/prizes");
          const result = await response.json();

          if (result.success && result.data.length > 0) {
            const prizes = result.data;
            setBasePrizes(prizes);

            // Create wheel segments (4 repetitions)
            const wheelSegments = createWheelSegments(prizes);
            setWheelPrizes(wheelSegments);
          }
        } catch (error) {
          console.error("Error loading prizes:", error);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }

    setSelectedPrize(prize);
    setShowModal(true);
  };

  if (basePrizes.length === 0) {
    return (
      <div className="h-screen bg-[#17242B] flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">No Prizes Available</h2>
          <p className="text-gray-400">Please contact admin to add prizes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen bg-[#17242B] relative overflow-hidden p-3 md:p-5">
      {/* Pattern - Hidden on mobile */}
      <div className="hidden md:block absolute top-0 left-0 w-100 h-100">
        <Image src="/entry-top.webp" fill alt="top" />
      </div>
      <div className="hidden md:block absolute bottom-0 right-0 w-100 h-100">
        <Image src="/entry-bottom.webp" fill alt="bottom" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4 md:mb-0">
          <div className="w-auto h-12 md:h-16">
            <Image
              src="/logo/tei_logo.png"
              width={100}
              height={150}
              alt="tei_logo"
              className="md:w-37.5"
            />
          </div>
          <div className="w-auto h-12 md:h-16">
            <Image
              src="/logo/mjs_logo_text.png"
              width={100}
              height={150}
              alt="mjs_logo"
              className="md:w-37.5"
            />
          </div>
        </div>

        {/* Main Wheel - Responsive Layout */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-0 md:gap-16 max-w-7xl mx-auto w-full">
          {/* Spin Wheel */}
          <div className="flex justify-center w-full md:flex-1 scale-60 sm:scale-95">
            <SpinWheel
              prizes={wheelPrizes}
              onSpinComplete={handleSpinComplete}
            />
          </div>

          {/* Prize Display - Below on mobile/tablet, side on desktop */}
          <div className="w-full md:w-64 relative scale-80 sm:scale-95 md:static bottom-30 md:bottom-0">
            <PrizeDisplay prizes={basePrizes} />
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex flex-col md:flex-row justify-between gap-2 md:gap-4 text-xs md:text-base mt-4 md:mt-0">
          <div className="flex items-center gap-2 md:gap-4 justify-center md:justify-start">
            <Image
              src="/icon/instagram.svg"
              width={16}
              height={20}
              alt="instagram"
              className="md:w-5"
            />
            <p className="text-white">@mjsolutionid</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 justify-center">
            <Image
              src="/icon/whatsapp.svg"
              width={16}
              height={20}
              alt="whatsapp"
              className="md:w-5"
            />
            <p className="text-white">+628111122492</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 justify-center md:justify-end">
            <Image
              src="/icon/web.svg"
              width={16}
              height={20}
              alt="web"
              className="md:w-5"
            />
            <p className="text-white">mjsolution.co.id</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        prize={selectedPrize}
        isProduction={IS_PRODUCTION}
      />

      {/* Debug Info (Development only) */}
      {!IS_PRODUCTION && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded text-xs z-50 max-h-96 overflow-y-auto">
          <p className="font-bold mb-2">DEBUG MODE</p>
          <p className="font-bold mb-1">Wheel: {wheelPrizes.length} segments</p>
          <p className="text-[10px] mb-2">
            Order:{" "}
            {wheelPrizes
              .map((p, i) => `${i + 1}:${p.name.substring(0, 3)}`)
              .join(" ")}
          </p>
          <p className="font-bold mb-2">Base Prizes:</p>
          {basePrizes.map((p) => (
            <p key={p.id}>
              {p.name}: W={p.weight} S={p.stock}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
