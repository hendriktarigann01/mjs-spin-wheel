import { useState, useEffect } from "react";
import { Upload, Save, RotateCcw } from "lucide-react";

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

const DEFAULT_SETTINGS: Settings = {
  logo_left: "/logo/tei_logo.png",
  logo_right: "/logo/mjs_logo_text.png",
  bg_color: "#17242B",
  pattern_top: "/entry-top.webp",
  pattern_bottom: "/entry-bottom.webp",
  instagram: "@mjsolutionid",
  whatsapp: "+628111122492",
  website: "mjsolution.co.id",
};

export function CustomizationPanel() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    type: "logo_left" | "logo_right" | "pattern_top" | "pattern_bottom",
  ) => {
    try {
      setUploading(type);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/settings/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        // Update state
        setSettings((prev) => ({ ...prev, [type]: result.url }));

        // Auto-save to database
        const saveResponse = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [type]: result.url }),
        });

        const saveResult = await saveResponse.json();
        if (saveResult.success) {
          alert("Image uploaded and saved successfully!");
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      if (result.success) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all settings to default? This will delete all uploaded files. This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setResetting(true);

      // First, delete all uploaded files
      const deleteResponse = await fetch("/api/settings/delete-image", {
        method: "DELETE",
      });

      const deleteResult = await deleteResponse.json();
      if (!deleteResult.success) {
        console.error("Failed to delete uploads:", deleteResult.error);
      }

      // Then reset settings to default
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEFAULT_SETTINGS),
      });

      const result = await response.json();
      if (result.success) {
        setSettings(DEFAULT_SETTINGS);
        alert(
          "Settings reset to default successfully! All uploaded files have been deleted.",
        );
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      alert("Failed to reset settings");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Customization</h2>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            {resetting ? "Resetting..." : "Reset to Default"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Logo Section */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Logos</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Left */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo Left
            </label>
            {settings.logo_left && (
              <div className="mb-2 p-4 bg-gray-700 rounded-lg">
                <img
                  src={settings.logo_left}
                  alt="Logo Left"
                  className="max-h-20 mx-auto"
                />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading === "logo_left" ? "Uploading..." : "Upload Logo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading === "logo_left"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "logo_left");
                }}
              />
            </label>
          </div>

          {/* Logo Right */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo Right
            </label>
            {settings.logo_right && (
              <div className="mb-2 p-4 bg-gray-700 rounded-lg">
                <img
                  src={settings.logo_right}
                  alt="Logo Right"
                  className="max-h-20 mx-auto"
                />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading === "logo_right" ? "Uploading..." : "Upload Logo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading === "logo_right"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "logo_right");
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Background Color */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Background Color
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={settings.bg_color}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, bg_color: e.target.value }))
            }
            className="w-20 h-12 rounded cursor-pointer"
          />
          <input
            type="text"
            value={settings.bg_color}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, bg_color: e.target.value }))
            }
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
            placeholder="#17242B"
          />
        </div>
      </div>

      {/* Patterns */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Background Patterns
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pattern Top */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pattern Top
            </label>
            {settings.pattern_top && (
              <div className="mb-2 p-4 bg-gray-700 rounded-lg">
                <img
                  src={settings.pattern_top}
                  alt="Pattern Top"
                  className="max-h-32 mx-auto"
                />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading === "pattern_top" ? "Uploading..." : "Upload Pattern"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading === "pattern_top"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "pattern_top");
                }}
              />
            </label>
          </div>

          {/* Pattern Bottom */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pattern Bottom
            </label>
            {settings.pattern_bottom && (
              <div className="mb-2 p-4 bg-gray-700 rounded-lg">
                <img
                  src={settings.pattern_bottom}
                  alt="Pattern Bottom"
                  className="max-h-32 mx-auto"
                />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading === "pattern_bottom"
                ? "Uploading..."
                : "Upload Pattern"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading === "pattern_bottom"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "pattern_bottom");
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Contact Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={settings.instagram}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, instagram: e.target.value }))
              }
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="@mjsolutionid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              value={settings.whatsapp}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, whatsapp: e.target.value }))
              }
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="+628111122492"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="text"
              value={settings.website}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, website: e.target.value }))
              }
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="mjsolution.co.id"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
