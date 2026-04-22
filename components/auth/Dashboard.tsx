"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Save, Info, Plus, Trash2, Upload } from "lucide-react";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { Prize } from "@/components/types/prize";
import { CustomizationPanel } from "@/components/auth/CustomizationPanel";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [showFormula, setShowFormula] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/prizes");
      const result = await response.json();
      if (result.success) {
        setPrizes(result.data);
      } else {
        alert("Failed to load prizes");
      }
    } catch (error) {
      console.error("Error loading prizes:", error);
      alert("Failed to load prizes");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    try {
      const response = await fetch("/api/prizes/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizes }),
      });
      const result = await response.json();
      if (result.success) {
        setShowConfirmModal(false);
        await loadPrizes();
      } else {
        alert("Failed to save: " + result.error);
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleDeletePrize = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const response = await fetch("/api/prizes/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) await loadPrizes();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const updatePrize = (
    id: number,
    field: "weight" | "stock",
    value: number,
  ) => {
    setPrizes((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.name === "ZONK" && field === "stock") return p;
        return { ...p, [field]: Math.max(0, value) };
      }),
    );
  };

  const totalWeight = prizes.reduce(
    (sum, p) => sum + (p.stock > 0 ? p.weight : 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1F3C] flex items-center justify-center">
        <p className="text-sm text-brand-light/60 uppercase tracking-widest">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0D1F3C] p-4 md:p-8 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 h-full w-full 
        bg-[linear-gradient(to_right,#002965_1px,transparent_1px),linear-gradient(to_bottom,#002965_1px,transparent_1px)] 
        bg-[size:45px_45px]"
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="relative border-2 border-brand-primary bg-[#0a192f] px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="absolute inset-2 border border-dashed border-brand-primary/30 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl text-brand-light uppercase tracking-[0.3em]">
              Stock Management
            </h1>
            <p className="text-xs text-brand-light/50 uppercase tracking-widest mt-1">
              Manage prize inventory and probabilities
            </p>
          </div>
          <button
            onClick={onLogout}
            className="relative z-10 px-6 py-2 border border-red-400/50 bg-red-500/10 text-xs text-red-400 uppercase tracking-widest hover:bg-red-500/20 hover:border-red-400 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* ── Formula Toggle ──────────────────────────────── */}
            <div className="relative border border-brand-primary/30 bg-[#0a192f] px-6 py-4">
              <div className="absolute inset-2 border border-dashed border-brand-primary/20 pointer-events-none" />
              <button
                onClick={() => setShowFormula(!showFormula)}
                className="relative z-10 flex items-center gap-3 text-xs text-brand-light/60 uppercase tracking-widest hover:text-brand-light transition-colors"
              >
                <Info className="w-4 h-4" />
                {showFormula ? "Hide" : "Show"} Probability Formula Explanation
              </button>

              {showFormula && (
                <div className="relative z-10 mt-4 border border-brand-primary/20 bg-[#0D1F3C] p-5 space-y-4">
                  <h3 className="text-sm text-brand-light uppercase tracking-widest">
                    How Weighted Random Selection Works
                  </h3>
                  <div className="space-y-3 text-xs">
                    <p className="text-brand-light/60 uppercase tracking-widest">
                      1. Formula
                    </p>
                    <div className="border border-brand-primary/30 bg-brand-primary/5 px-4 py-3 text-brand-light">
                      Probability = (Prize Weight / Total Weight) × 100%
                    </div>
                    <p className="text-brand-light/60 uppercase tracking-widest">
                      2. Real-time Calculation
                    </p>
                    <div className="grid grid-cols-2 gap-2 border border-brand-primary/20 p-4">
                      {prizes
                        .filter((p) => p.stock > 0)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between text-brand-light/70"
                          >
                            <span>{p.name}</span>
                            <span className="text-brand-light">
                              {((p.weight / totalWeight) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                    </div>
                    <ul className="space-y-1 text-brand-light/50 list-disc list-inside">
                      <li>Generate random number antara 0 s/d total weight</li>
                      <li>
                        Sistem mengurangi bobot setiap hadiah secara berurutan
                      </li>
                      <li>Hadiah dengan stok 0 otomatis diabaikan sistem</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* ── Prize Inventory ─────────────────────────────── */}
            <div className="relative border-2 border-brand-primary bg-[#0a192f] p-6">
              <div className="absolute inset-2 border border-dashed border-brand-primary/30 pointer-events-none" />
              <div className="relative z-10 flex justify-between items-center mb-6">
                <h2 className="text-xl text-brand-light uppercase tracking-widest">
                  Prize Inventory
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-brand-primary bg-brand-primary/10 text-xs text-brand-light uppercase tracking-widest hover:bg-brand-primary/20 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Prize
                </button>
              </div>

              <div className="relative z-10 space-y-3">
                {prizes.map((prize) => {
                  const probability =
                    prize.stock > 0
                      ? ((prize.weight / totalWeight) * 100).toFixed(1)
                      : "0.0";
                  const isZonk = prize.name === "ZONK";

                  return (
                    <div
                      key={prize.id}
                      className="border border-brand-primary/20 bg-[#0D1F3C] p-4 hover:border-brand-primary/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm text-brand-light uppercase tracking-widest">
                              {prize.name}
                            </h3>
                            {!isZonk && (
                              <button
                                onClick={() =>
                                  handleDeletePrize(prize.id, prize.name)
                                }
                                className="text-red-400/60 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: prize.color }}
                            />
                            <span className="text-xs text-brand-light/50 uppercase tracking-widest">
                              Probabilitas:{" "}
                              <span className="text-brand-light">
                                {probability}%
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-4 lg:w-1/2">
                          <div className="flex-1">
                            <label className="text-xs text-brand-light/40 uppercase tracking-widest block mb-1">
                              Weight
                            </label>
                            <input
                              type="number"
                              value={prize.weight}
                              onChange={(e) =>
                                updatePrize(
                                  prize.id,
                                  "weight",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full px-3 py-2 bg-[#0a192f] border border-brand-primary/30 text-brand-light text-sm focus:outline-none focus:border-brand-primary transition-colors"
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-brand-light/40 uppercase tracking-widest block mb-1">
                              Stock {isZonk && "(Fixed)"}
                            </label>
                            <input
                              type="number"
                              value={prize.stock}
                              onChange={(e) =>
                                updatePrize(
                                  prize.id,
                                  "stock",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full px-3 py-2 bg-[#0a192f] border border-brand-primary/30 text-brand-light text-sm focus:outline-none focus:border-brand-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              min="0"
                              disabled={isZonk}
                            />
                          </div>
                        </div>
                      </div>

                      {prize.stock === 0 && !isZonk && (
                        <div className="mt-3 text-xs text-red-400/70 uppercase tracking-widest border border-red-400/20 bg-red-500/5 px-3 py-2">
                          Out of stock — excluded from wheel
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="relative z-10 mt-6 w-full flex items-center justify-center gap-3 py-3 border-2 border-brand-primary bg-brand-primary/10 text-sm text-brand-light uppercase tracking-widest hover:bg-brand-primary/20 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save All Changes
              </button>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Statistics */}
              <div className="relative border-2 border-brand-primary bg-[#0a192f] p-6">
                <div className="absolute inset-2 border border-dashed border-brand-primary/30 pointer-events-none" />
                <h2 className="relative z-10 text-xl text-brand-light uppercase tracking-widest mb-5">
                  Statistics Overview
                </h2>
                <div className="relative z-10 grid grid-cols-1 gap-3">
                  {[
                    {
                      label: "Total Weight",
                      value: totalWeight,
                      color: "text-brand-light",
                    },
                    {
                      label: "Active Prizes",
                      value: prizes.filter(
                        (p) => p.stock > 0 && p.name !== "ZONK",
                      ).length,
                      color: "text-brand-light",
                    },
                    {
                      label: "Total Stock",
                      value: prizes
                        .filter((p) => p.name !== "ZONK")
                        .reduce((s, p) => s + p.stock, 0),
                      color: "text-brand-light",
                    },
                    {
                      label: "ZONK Rate",
                      value:
                        (
                          ((prizes.find((p) => p.name === "ZONK")?.weight ||
                            0) /
                            totalWeight) *
                          100
                        ).toFixed(1) + "%",
                      color: "text-brand-light",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="border border-brand-primary/20 bg-[#0D1F3C] px-4 py-3"
                    >
                      <p className="text-xs text-brand-light/50 uppercase tracking-widest">
                        {label}
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${color}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 mt-4 border border-brand-primary/20 bg-brand-primary/5 px-4 py-3">
                  <p className="text-xs text-brand-light/50 leading-relaxed">
                    * Perubahan pada bobot (weight) akan langsung mempengaruhi
                    persentase kemenangan di roda keberuntungan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="w-7xl relative border-2 border-brand-primary bg-[#0a192f] overflow-hidden">
            <div className="absolute inset-2 border border-dashed border-brand-primary/30 pointer-events-none z-10" />
            <CustomizationPanel />
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmModal
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {showAddModal && (
        <AddPrizeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadPrizes();
          }}
        />
      )}
    </div>
  );
}

// ── Add Prize Modal ───────────────────────────────────────────

const COLORS = [
  { value: "#25569E", label: "Blue Light" },
  { value: "#0D1F3C", label: "Blue Dark" },
];

function AddPrizeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    weight: 10,
    stock: 50,
    color: COLORS[0].value,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !selectedFile) return;

    try {
      setLoading(true);
      setUploading(true);

      const imageFormData = new FormData();
      imageFormData.append("file", selectedFile);
      const uploadResponse = await fetch("/api/upload/image", {
        method: "POST",
        body: imageFormData,
      });
      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) return;

      setUploading(false);

      const response = await fetch("/api/prizes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: uploadResult.url }),
      });
      const result = await response.json();
      if (result.success) onSuccess();
    } catch (error) {
      console.error("Error creating prize:", error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative border-2 border-brand-primary bg-[#0a192f] w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-3 border border-dashed border-brand-primary/30 pointer-events-none" />

        <div className="relative z-10 p-6 space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg text-brand-light uppercase tracking-[0.3em]">
              Add New Prize
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-brand-light/50 hover:text-brand-light transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs text-brand-light/60 uppercase tracking-widest">
                Prize Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-4 py-3 bg-[#0D1F3C] border border-brand-primary/30 text-brand-light text-sm placeholder-brand-primary/30 uppercase focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="e.g. T-SHIRT"
                required
                disabled={loading}
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <label className="text-xs text-brand-light/60 uppercase tracking-widest">
                Prize Image *
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border border-brand-primary/40 bg-brand-primary/5 text-xs text-brand-light/70 uppercase tracking-widest cursor-pointer hover:bg-brand-primary/10 hover:border-brand-primary transition-colors">
                <Upload className="w-4 h-4" />
                {selectedFile ? selectedFile.name : "Choose image file"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                  disabled={loading}
                />
              </label>
              {previewUrl && (
                <div className="w-full h-28 border border-brand-primary/20 bg-[#0D1F3C] flex items-center justify-center">
                  <Image
                    src={previewUrl}
                    width={120}
                    height={120}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Weight + Stock */}
            <div className="grid grid-cols-2 gap-4">
              {(["weight", "stock"] as const).map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-xs text-brand-light/60 uppercase tracking-widest">
                    {field}
                  </label>
                  <input
                    type="number"
                    value={formData[field]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 bg-[#0D1F3C] border border-brand-primary/30 text-brand-light text-sm focus:outline-none focus:border-brand-primary transition-colors"
                    min="0"
                    required
                    disabled={loading}
                  />
                </div>
              ))}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-xs text-brand-light/60 uppercase tracking-widest">
                Wheel Color
              </label>
              <div className="grid grid-cols-2 gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                    disabled={loading}
                    className={`flex items-center gap-3 px-4 py-3 border text-xs uppercase tracking-widest transition-colors ${
                      formData.color === color.value
                        ? "border-brand-primary text-brand-light bg-brand-primary/10"
                        : "border-brand-primary/20 text-brand-light/50 hover:border-brand-primary/50"
                    }`}
                  >
                    <div
                      className="w-4 h-4 border border-brand-primary/30"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 border border-brand-primary/30 text-xs text-brand-light/60 uppercase tracking-widest hover:border-brand-primary hover:text-brand-light transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 border-2 border-brand-primary bg-brand-primary/10 text-xs text-brand-light uppercase tracking-widest hover:bg-brand-primary/20 transition-colors disabled:opacity-40"
              >
                {uploading
                  ? "Uploading..."
                  : loading
                    ? "Creating..."
                    : "Create Prize"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
