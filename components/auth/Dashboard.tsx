"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Save, Info, Plus, Trash2, Upload } from "lucide-react";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { Prize } from "@/components/types/prize";

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

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      const response = await fetch("/api/prizes/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prizes }),
      });

      const result = await response.json();

      if (result.success) {
        setShowConfirmModal(false);
        alert("Stock updated successfully!");
        await loadPrizes();
      } else {
        alert("Failed to save: " + result.error);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save data");
    }
  };

  const handleDeletePrize = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch("/api/prizes/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Prize deleted successfully!");
        await loadPrizes();
      } else {
        alert("Failed to delete: " + result.error);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete prize");
    }
  };

  const updatePrize = (
    id: number,
    field: "weight" | "stock",
    value: number
  ) => {
    setPrizes((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          // ZONK hanya bisa edit weight, stock tetap 9999
          if (p.name === "ZONK" && field === "stock") {
            return p;
          }
          return { ...p, [field]: Math.max(0, value) };
        }
        return p;
      })
    );
  };

  const totalWeight = prizes.reduce(
    (sum, p) => sum + (p.stock > 0 ? p.weight : 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17242B] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#17242B] p-4 md:p-8 overflow-hidden">
      <div className="hidden md:block absolute top-0 left-0 w-80 h-80 opacity-40 pointer-events-none">
        <Image
          src="/entry-top.webp"
          fill
          alt="top"
          className="object-contain"
        />
      </div>
      <div className="hidden md:block absolute bottom-0 right-0 w-80 h-80 opacity-40 pointer-events-none">
        <Image
          src="/entry-bottom.webp"
          fill
          alt="bottom"
          className="object-contain"
        />
      </div>

      <div className="relative z-10 max-w-375 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">
                    Stock Management
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Manage prize inventory and probabilities
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 px-6 py-2 rounded-xl transition duration-300 font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <button
                onClick={() => setShowFormula(!showFormula)}
                className="flex items-center gap-3 text-white font-semibold hover:text-teal-400 transition-colors"
              >
                <Info className="w-5 h-5" />
                {showFormula ? "Hide" : "Show"} Probability Formula Explanation
              </button>

              {showFormula && (
                <div className="mt-4 p-5 rounded-xl bg-black/20 border border-white/5 space-y-4 text-sm">
                  <h3 className="font-bold text-lg text-white">
                    How Weighted Random Selection Works:
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-300">
                      <strong className="text-white">1. Formula:</strong>
                    </p>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 font-mono text-teal-300">
                      Probability = (Prize Weight / Total Weight) × 100%
                    </div>

                    <p className="text-gray-300">
                      <strong className="text-white">
                        2. Real-time Calculation:
                      </strong>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/5 p-4 rounded-lg border border-white/10">
                      {prizes
                        .filter((p) => p.stock > 0)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="text-xs text-gray-300 flex justify-between"
                          >
                            <span>{p.name}:</span>
                            <span className="text-teal-400 font-mono">
                              {((p.weight / totalWeight) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                    </div>

                    <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
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

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Prize Inventory
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Prize
                </button>
              </div>

              <div className="grid gap-4">
                {prizes.map((prize) => {
                  const probability =
                    prize.stock > 0
                      ? ((prize.weight / totalWeight) * 100).toFixed(1)
                      : "0.0";
                  const isZonk = prize.name === "ZONK";

                  return (
                    <div
                      key={prize.id}
                      className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition duration-300 shadow-inner"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                              {prize.name}
                            </h3>
                            {!isZonk && (
                              <button
                                onClick={() =>
                                  handleDeletePrize(prize.id, prize.name)
                                }
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete prize"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div
                              className="w-3 h-3 rounded-full shadow-lg"
                              style={{ backgroundColor: prize.color }}
                            />
                            <span className="text-sm text-gray-400">
                              Probabilitas:{" "}
                              <strong className="text-teal-400 font-mono">
                                {probability}%
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 lg:w-2/3">
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                              Weight
                            </label>
                            <input
                              type="number"
                              value={prize.weight}
                              onChange={(e) =>
                                updatePrize(
                                  prize.id,
                                  "weight",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                              Stock {isZonk && "(Fixed)"}
                            </label>
                            <input
                              type="number"
                              value={prize.stock}
                              onChange={(e) =>
                                updatePrize(
                                  prize.id,
                                  "stock",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              min="0"
                              disabled={isZonk}
                            />
                          </div>
                        </div>
                      </div>
                      {prize.stock === 0 && !isZonk && (
                        <div className="mt-3 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg italic">
                          Out of stock - excluded from wheel
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSaveClick}
                className="mt-8 w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition duration-300 active:scale-95"
              >
                <Save className="w-5 h-5" />
                Save All Changes
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  Statistics Overview
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                      Total Weight
                    </p>
                    <p className="text-3xl font-black text-white mt-1">
                      {totalWeight}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                      Active Prizes
                    </p>
                    <p className="text-3xl font-black text-white mt-1">
                      {
                        prizes.filter((p) => p.stock > 0 && p.name !== "ZONK")
                          .length
                      }
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest">
                      Total Stock
                    </p>
                    <p className="text-3xl font-black text-white mt-1">
                      {prizes
                        .filter((p) => p.name !== "ZONK")
                        .reduce((sum, p) => sum + p.stock, 0)}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                      ZONK Rate
                    </p>
                    <p className="text-3xl font-black text-white mt-1">
                      {(
                        ((prizes.find((p) => p.name === "ZONK")?.weight || 0) /
                          totalWeight) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-xs text-yellow-200/70 italic leading-relaxed">
                    * Perubahan pada bobot (weight) akan langsung mempengaruhi
                    persentase kemenangan di roda keberuntungan.
                  </p>
                </div>
              </div>
            </div>
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

// Add Prize Modal Component
function AddPrizeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const COLORS = [
    { value: "#36B0A9", label: "Teal Light" },
    { value: "#277C79", label: "Teal Dark" },
  ];

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
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please enter prize name");
      return;
    }

    if (!selectedFile) {
      alert("Please select an image");
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      // Upload image first
      const imageFormData = new FormData();
      imageFormData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload/image", {
        method: "POST",
        body: imageFormData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        alert("Failed to upload image: " + uploadResult.error);
        return;
      }

      setUploading(false);

      // Create prize with uploaded image URL
      const response = await fetch("/api/prizes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: uploadResult.url,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Prize created successfully!");
        onSuccess();
      } else {
        alert("Failed to create prize: " + result.error);
      }
    } catch (error) {
      console.error("Error creating prize:", error);
      alert("Failed to create prize");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Add New Prize</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            disabled={loading}
          >
            <svg
              className="w-6 h-6"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Prize Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
              placeholder="e.g. T-SHIRT"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Prize Image *
            </label>
            <div className="space-y-3">
              <label className="block cursor-pointer">
                <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span>
                    {selectedFile ? selectedFile.name : "Choose image file"}
                  </span>
                </div>
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
                <div className="w-full h-32 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                  <Image
                    src={previewUrl}
                    width={150}
                    height={150}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Weight
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
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
                  className={`
                    px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3
                    ${
                      formData.color === color.value
                        ? "border-white bg-white/20"
                        : "border-white/20 bg-white/5 hover:bg-white/10"
                    }
                  `}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/50"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-white text-sm font-medium">
                    {color.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
