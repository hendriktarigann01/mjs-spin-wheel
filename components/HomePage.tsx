"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { SpinWheel } from "@/components/SpinWheel";
import { PrizeDisplay } from "@/components/PrizeDisplay";
import { Modal } from "@/components/Modal";
import { Prize } from "@/components/types/prize";

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

export function HomePage() {
  const IS_PRODUCTION = process.env.NEXT_PUBLIC_MODE === "production";
  const [wheelPrizes, setWheelPrizes] = useState<Prize[]>([]);
  const [basePrizes, setBasePrizes] = useState<Prize[]>([]);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadingProgress(0);

        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) return 90;
            if (prev >= 70) return prev + 2;
            if (prev >= 50) return prev + 5;
            return prev + 10;
          });
        }, 150);

        const [settingsRes, prizesRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/prizes"),
        ]);

        const settingsResult = await settingsRes.json();
        const prizesResult = await prizesRes.json();

        clearInterval(progressInterval);
        setLoadingProgress(100);

        if (settingsResult.success && settingsResult.data) {
          setSettings(settingsResult.data);
        }

        if (prizesResult.success && prizesResult.data.length > 0) {
          const prizes = prizesResult.data;
          setBasePrizes(prizes);
          const wheelSegments = createWheelSegments(prizes);
          setWheelPrizes(wheelSegments);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    loadData();

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/settings");
        const result = await response.json();
        if (result.success && result.data) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error("Error reloading settings:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
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

    const updatedBasePrizes = basePrizes.map((p) =>
      p.id === originalId ? { ...p, stock: p.stock - 1 } : p,
    );
    setBasePrizes(updatedBasePrizes);
    setWheelPrizes(createWheelSegments(updatedBasePrizes));

    setSelectedPrize(prize);
    setShowModal(true);

    try {
      await fetch("/api/prizes/decrease-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: originalId }),
      });
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#17242B] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h6 className="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-white">
              Loading
            </h6>
            <h6 className="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-white">
              {loadingProgress}%
            </h6>
          </div>
          <div className="flex-start flex h-2.5 w-full overflow-hidden rounded-full bg-gray-700 font-sans text-xs font-medium">
            <div
              className="flex items-center justify-center h-full overflow-hidden text-white break-all bg-white rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && basePrizes.length === 0) {
    return (
      <div className="h-screen bg-[#17242B] flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">No Prizes Available</h2>
          <p className="text-gray-400">Please contact admin to add prizes</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="h-screen bg-[#17242B] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen md:h-screen relative overflow-hidden p-3 md:p-5"
      style={{ backgroundColor: settings.bg_color }}
    >
      {settings.pattern_top && (
        <div className="hidden md:block absolute top-0 left-0 w-100 h-100">
          <Image
            src={settings.pattern_top}
            fill
            alt="pattern top"
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      {settings.pattern_bottom && (
        <div className="hidden md:block absolute bottom-0 right-0 w-100 h-100">
          <Image
            src={settings.pattern_bottom}
            fill
            alt="pattern bottom"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="w-full flex justify-between items-center mb-4 md:mb-0">
          {settings.logo_left && (
            <div className="w-auto h-12 md:h-16 relative">
              <Image
                src={settings.logo_left}
                width={100}
                height={48}
                alt="logo_left"
                className="h-12 md:h-16 w-auto object-contain"
                unoptimized
              />
            </div>
          )}
          {settings.logo_right && (
            <div className="w-auto h-12 md:h-16 relative">
              <Image
                src={settings.logo_right}
                width={100}
                height={48}
                alt="logo_right"
                className="h-12 md:h-16 w-auto object-contain"
                unoptimized
              />
            </div>
          )}
        </div>

        <div className="signage-layout flex-1 flex flex-col md:flex-row items-center justify-center gap-0 md:gap-16 max-w-7xl mx-auto w-full">
          <div className="signage-wheel flex justify-center w-1/2 md:flex-1 scale-60 sm:scale-95">
            <SpinWheel
              prizes={wheelPrizes}
              onSpinComplete={handleSpinComplete}
            />
          </div>

          <div className="signage-prize w-full md:w-64 relative scale-80 sm:scale-95 md:static bottom-30 md:bottom-0">
            <PrizeDisplay prizes={basePrizes} />
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between gap-2 md:gap-4 text-xs md:text-base mt-4 md:mt-0">
          <div className="flex items-center gap-2 md:gap-4 justify-center md:justify-start">
            <Image
              src="/icon/instagram.svg"
              width={16}
              height={20}
              alt="instagram"
              className="md:w-5"
            />
            <p className="text-white">{settings.instagram}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 justify-center">
            <Image
              src="/icon/whatsapp.svg"
              width={16}
              height={20}
              alt="whatsapp"
              className="md:w-5"
            />
            <p className="text-white">{settings.whatsapp}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 justify-center md:justify-end">
            <Image
              src="/icon/web.svg"
              width={16}
              height={20}
              alt="web"
              className="md:w-5"
            />
            <p className="text-white">{settings.website}</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        prize={selectedPrize}
        isProduction={IS_PRODUCTION}
        settings={settings}
      />

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
          <p className="font-bold mb-2 mt-4">Settings:</p>
          <p className="text-[10px]">{JSON.stringify(settings, null, 2)}</p>
        </div>
      )}
    </div>
  );
}
