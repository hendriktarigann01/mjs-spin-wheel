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
  logo_left: "/logo/mjs_logo_text.png",
  logo_right: "/logo/arch_id.png",
  bg_color: "#0D1F3C",
  pattern_top: "/entry-top.webp",
  pattern_bottom: "/entry-bottom.webp",
  instagram: "@mjsolutionid",
  whatsapp: "+628111122492",
  website: "mjsolution.co.id",
};

// ── Reusable section card ─────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative border border-brand-primary/30 bg-[#0a192f] p-6 space-y-4">
      <div className="absolute inset-2 border border-dashed border-brand-primary/20 pointer-events-none" />
      <h3 className="relative z-10 text-xs text-brand-light/60 uppercase tracking-widest">
        {title}
      </h3>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── Reusable text input ───────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-brand-light/60 uppercase tracking-widest">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-[#0D1F3C] border border-brand-primary/30 text-brand-light text-sm placeholder-brand-primary/30 focus:outline-none focus:border-brand-primary transition-colors"
      />
    </div>
  );
}

// ── Reusable upload button ────────────────────────────────────

function UploadButton({
  label,
  preview,
  uploading,
  onFile,
}: {
  label: string;
  preview: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-brand-light/60 uppercase tracking-widest">
        {label}
      </p>
      {preview && (
        <div className="p-3 border border-brand-primary/20 bg-[#0D1F3C]">
          <img
            src={preview}
            alt={label}
            className="max-h-16 mx-auto object-contain"
          />
        </div>
      )}
      <label className="flex items-center justify-center gap-2 px-4 py-2 border border-brand-primary/40 bg-brand-primary/5 text-xs text-brand-light/70 uppercase tracking-widest cursor-pointer hover:bg-brand-primary/10 hover:border-brand-primary transition-colors">
        <Upload className="w-3 h-3" />
        {uploading ? "Uploading..." : "Upload"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

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
      if (result.success) setSettings(result.data);
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
        setSettings((prev) => ({ ...prev, [type]: result.url }));
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [type]: result.url }),
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all settings to default? This cannot be undone."))
      return;
    try {
      setResetting(true);
      await fetch("/api/settings/delete-image", { method: "DELETE" });
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEFAULT_SETTINGS),
      });
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error("Error resetting settings:", error);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-brand-light/50 uppercase tracking-widest">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-brand-light uppercase tracking-[0.3em]">
          Customization
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 border border-brand-primary/40 bg-brand-primary/5 text-xs text-brand-light/70 uppercase tracking-widest hover:bg-brand-primary/10 hover:border-brand-primary transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3 h-3" />
            {resetting ? "Resetting..." : "Reset"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border-2 border-brand-primary bg-brand-primary/10 text-xs text-brand-light uppercase tracking-widest hover:bg-brand-primary/20 transition-colors disabled:opacity-40"
          >
            <Save className="w-3 h-3" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Logos */}
      <Section title="Logos">
        <div className="grid grid-cols-2 gap-6">
          <UploadButton
            label="Logo Left"
            preview={settings.logo_left}
            uploading={uploading === "logo_left"}
            onFile={(f) => handleImageUpload(f, "logo_left")}
          />
          <UploadButton
            label="Logo Right"
            preview={settings.logo_right}
            uploading={uploading === "logo_right"}
            onFile={(f) => handleImageUpload(f, "logo_right")}
          />
        </div>
      </Section>

      {/* Background Color */}
      <Section title="Background Color">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.bg_color}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, bg_color: e.target.value }))
            }
            className="w-10 h-10 cursor-pointer border border-brand-primary/40 bg-transparent p-0"
          />
          <input
            type="text"
            value={settings.bg_color}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, bg_color: e.target.value }))
            }
            className="flex-1 px-4 py-2 bg-[#0D1F3C] border border-brand-primary/30 text-brand-light text-sm focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="#0D1F3C"
          />
        </div>
      </Section>

      {/* Background Patterns */}
      <Section title="Background Patterns">
        <div className="grid grid-cols-2 gap-6">
          <UploadButton
            label="Pattern Top"
            preview={settings.pattern_top}
            uploading={uploading === "pattern_top"}
            onFile={(f) => handleImageUpload(f, "pattern_top")}
          />
          <UploadButton
            label="Pattern Bottom"
            preview={settings.pattern_bottom}
            uploading={uploading === "pattern_bottom"}
            onFile={(f) => handleImageUpload(f, "pattern_bottom")}
          />
        </div>
      </Section>

      {/* Contact Information */}
      <Section title="Contact Information">
        <div className="space-y-4">
          <Field
            label="Instagram"
            value={settings.instagram}
            onChange={(v) => setSettings((prev) => ({ ...prev, instagram: v }))}
            placeholder="@mjsolutionid"
          />
          <Field
            label="WhatsApp"
            value={settings.whatsapp}
            onChange={(v) => setSettings((prev) => ({ ...prev, whatsapp: v }))}
            placeholder="+628111122492"
          />
          <Field
            label="Website"
            value={settings.website}
            onChange={(v) => setSettings((prev) => ({ ...prev, website: v }))}
            placeholder="mjsolution.co.id"
          />
        </div>
      </Section>
    </div>
  );
}
