"use client";

import React, { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  defaultBranding,
  getAdminBranding,
  updateAdminBranding,
  uploadBrandLogo,
  type SiteBranding,
} from "@/lib/branding-api";
import { useBranding } from "@/components/limex/branding-context";

const PRESET_BACKGROUNDS = [
  { name: "Limex Linen (Default)", hex: "#eeece7" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Soft Sand", hex: "#f7f5f0" },
  { name: "Warm Cream", hex: "#faf8f5" },
  { name: "Minimal Gray", hex: "#f4f5f7" },
  { name: "Cool Mist", hex: "#edf1f5" },
];

const PRESET_PRIMARIES = [
  { name: "Limex Blue (Default)", hex: "#0055ff" },
  { name: "Deep Cobalt", hex: "#003bb8" },
  { name: "Electric Indigo", hex: "#4f46e5" },
  { name: "Vibrant Sky", hex: "#008cff" },
  { name: "Teal Emerald", hex: "#0d9488" },
  { name: "Modern Ink", hex: "#0f172a" },
];

const PRESET_ACCENTS = [
  { name: "Limex Sky (Default)", hex: "#008cff" },
  { name: "Electric Cyan", hex: "#06b6d4" },
  { name: "Indigo Tint", hex: "#6366f1" },
  { name: "Mint Fresh", hex: "#10b981" },
  { name: "Amber Glow", hex: "#f59e0b" },
];

const PRESET_INKS = [
  { name: "Limex Ink (Default)", hex: "#07142e" },
  { name: "Charcoal Dark", hex: "#111827" },
  { name: "Deep Slate", hex: "#0f172a" },
  { name: "Midnight Navy", hex: "#071b3d" },
];

function ColorField({
  label,
  description,
  value,
  onChange,
  presets,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (hex: string) => void;
  presets?: { name: string; hex: string }[];
}) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-[18px] border border-[#e2dcd3] bg-[#fffdfa] p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#071b3d]">
            {label}
          </span>
          <p className="mt-0.5 text-[12px] text-[#706a62]">{description}</p>
        </div>
        <div className="mt-2 flex items-center gap-2.5 sm:mt-0">
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="group relative size-9 shrink-0 overflow-hidden rounded-[10px] border-2 border-white shadow-sm ring-1 ring-[#d4cec5] transition-transform hover:scale-105"
            style={{ backgroundColor: value }}
            title="Open color picker"
          >
            <span className="sr-only">Choose color</span>
          </button>
          <input
            ref={colorInputRef}
            type="color"
            value={
              value.startsWith("#") && value.length === 7 ? value : "#000000"
            }
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              maxLength={7}
              className="h-9 w-[96px] rounded-[10px] border border-[#d8d2c8] bg-white px-2.5 text-center font-mono text-[13px] font-semibold text-[#071b3d] outline-none transition-colors hover:border-[#b0a89d] focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/15"
            />
          </div>
        </div>
      </div>

      {presets && presets.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#ede7de]">
          <span className="text-[11px] font-semibold text-[#8b847b] mr-1">
            Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => onChange(preset.hex)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                value.toLowerCase() === preset.hex.toLowerCase()
                  ? "border-[#0055ff] bg-[#eef4ff] text-[#0055ff] font-semibold"
                  : "border-[#dfd9cf] bg-white text-[#5c554c] hover:border-[#c0b8ac] hover:bg-[#f6f3ee]"
              }`}
            >
              <span
                className="size-2.5 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: preset.hex }}
              />
              {preset.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LogoCard({
  title,
  subtitle,
  darkSurface = false,
  currentUrl,
  defaultUrl,
  onUpload,
  onRemove,
  uploading,
}: {
  title: string;
  subtitle: string;
  darkSurface?: boolean;
  currentUrl: string | null;
  defaultUrl: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  uploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const effectiveUrl = currentUrl || defaultUrl;
  const isCustom = Boolean(currentUrl);

  return (
    <div className="rounded-[20px] border border-[#e2dcd3] bg-[#fffdfa] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#071b3d]">
            {title}
          </h3>
          <p className="mt-1 text-[12px] text-[#706a62]">{subtitle}</p>
        </div>
        {isCustom && (
          <span className="rounded-full bg-[#e6f4ea] px-2.5 py-0.5 text-[10.5px] font-bold text-[#137333]">
            Custom
          </span>
        )}
      </div>

      {/* Preview box */}
      <div
        className={`mt-4 grid min-h-[110px] place-items-center rounded-[14px] border p-6 transition-colors ${
          darkSurface
            ? "border-[#1b2a47] bg-[#071b3d] text-white"
            : "border-[#dfd8cd] bg-[#eeece7] text-[#07142e]"
        }`}
      >
        <div className="relative flex max-h-14 max-w-[220px] items-center justify-center">
          <img
            src={effectiveUrl}
            alt={title}
            className="h-11 w-auto max-w-full object-contain"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-[#071b3d] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:opacity-50"
          >
            {uploading ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Uploading…
              </>
            ) : (
              <>Upload new logo</>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/svg+xml,image/png,image/webp,image/jpeg"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await onUpload(file);
                e.target.value = "";
              }
            }}
            className="sr-only"
          />
        </div>

        {isCustom && (
          <button
            type="button"
            onClick={onRemove}
            className="text-[12px] font-semibold text-[#c5221f] transition-colors hover:underline"
          >
            Reset to default
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-[#8b847b]">
        Supports SVG (recommended), PNG, WebP, JPG up to 5 MB.
      </p>
    </div>
  );
}

export function BrandingModule() {
  const { setBranding: setGlobalBranding } = useBranding();
  const [draft, setDraft] = useState<SiteBranding>(defaultBranding);
  const [initial, setInitial] = useState<SiteBranding>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getAdminBranding()
      .then((data) => {
        if (!active) return;
        const safeData = data || defaultBranding;
        setDraft(safeData);
        setInitial(safeData);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load branding.",
        );
        setDraft(defaultBranding);
        setInitial(defaultBranding);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated = await updateAdminBranding({
        backgroundColor: draft.backgroundColor,
        primaryColor: draft.primaryColor,
        accentColor: draft.accentColor,
        inkColor: draft.inkColor,
        logoUrl: draft.logoUrl,
        logoLightUrl: draft.logoLightUrl,
      });

      setDraft(updated);
      setInitial(updated);
      setGlobalBranding(updated);
      setMessage(
        "Site branding updated successfully! All pages now reflect these changes.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save branding.");
    } finally {
      setSaving(false);
    }
  }

  function handleResetToDefaults() {
    if (
      !confirm(
        "Reset all site colors and logos back to the Limex default design system values?",
      )
    )
      return;

    setDraft({
      ...defaultBranding,
    });
  }

  async function handleUploadDarkLogo(file: File) {
    try {
      setUploadingDark(true);
      setError("");
      const res = await uploadBrandLogo(file);
      setDraft((prev) => ({ ...prev, logoUrl: res.url }));
      setMessage(
        "Main logo uploaded! Click 'Save changes' to publish across the site.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo.");
    } finally {
      setUploadingDark(false);
    }
  }

  async function handleUploadLightLogo(file: File) {
    try {
      setUploadingLight(true);
      setError("");
      const res = await uploadBrandLogo(file);
      setDraft((prev) => ({ ...prev, logoLightUrl: res.url }));
      setMessage(
        "Light logo uploaded! Click 'Save changes' to publish across the site.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo.");
    } finally {
      setUploadingLight(false);
    }
  }

  const isDirty =
    draft.backgroundColor !== initial.backgroundColor ||
    draft.primaryColor !== initial.primaryColor ||
    draft.accentColor !== initial.accentColor ||
    draft.inkColor !== initial.inkColor ||
    draft.logoUrl !== initial.logoUrl ||
    draft.logoLightUrl !== initial.logoLightUrl;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-3 border-[#0055ff] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-brand text-[28px] font-bold text-[#071b3d] sm:text-[34px]">
            Branding & Theme
          </h1>
          <p className="mt-1 text-[14px] text-[#605a52]">
            Customize the global background color, primary brand colors, and
            website logos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8d2c8] bg-white px-4 text-[12.5px] font-bold text-[#5c554c] transition-colors hover:border-[#b8b0a3] hover:text-[#071b3d]"
          >
            Reset defaults
          </button>
          <button
            type="button"
            disabled={saving || !isDirty}
            onClick={() => void handleSave()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#0055ff] px-6 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#0040cc] disabled:opacity-40"
          >
            {saving ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="rounded-[16px] border border-[#a8dab5] bg-[#eef9f0] px-4 py-3 text-[13px] font-medium text-[#137333]">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-[16px] border border-[#f5c2c7] bg-[#fdf2f2] px-4 py-3 text-[13px] font-medium text-[#c5221f]">
          {error}
        </div>
      )}

      {/* Logos Section */}
      <section className="rounded-[24px] border border-[#e5dfd6] bg-white p-6 shadow-sm sm:p-8">
        <div className="border-b border-[#eee8df] pb-4">
          <h2 className="text-[17px] font-bold text-[#071b3d]">
            Website Logos
          </h2>
          <p className="mt-1 text-[13px] text-[#706a62]">
            Upload your brand logo for both light and dark backgrounds.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LogoCard
            title="Main Logo (Dark Mark)"
            subtitle="Used on light backgrounds: navbar, mobile menu, and admin login."
            darkSurface={false}
            currentUrl={draft.logoUrl}
            defaultUrl="/brand/limex-logo.png"
            onUpload={handleUploadDarkLogo}
            onRemove={() => setDraft((p) => ({ ...p, logoUrl: null }))}
            uploading={uploadingDark}
          />
          <LogoCard
            title="Light Logo (White Mark)"
            subtitle="Used on dark backgrounds: site footer and admin sidebar."
            darkSurface={true}
            currentUrl={draft.logoLightUrl}
            defaultUrl="/brand/limex-logo-light.png"
            onUpload={handleUploadLightLogo}
            onRemove={() => setDraft((p) => ({ ...p, logoLightUrl: null }))}
            uploading={uploadingLight}
          />
        </div>
      </section>

      {/* Brand Colors Section */}
      <section className="rounded-[24px] border border-[#e5dfd6] bg-white p-6 shadow-sm sm:p-8">
        <div className="border-b border-[#eee8df] pb-4">
          <h2 className="text-[17px] font-bold text-[#071b3d]">
            Main Brand Colors
          </h2>
          <p className="mt-1 text-[13px] text-[#706a62]">
            These colors are published to global CSS variables on{" "}
            <code className="rounded bg-[#f0eae1] px-1.5 py-0.5 text-[12px] font-mono">
              :root
            </code>{" "}
            and power the entire site layout.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {/* Background color */}
          <ColorField
            label="Background Canvas Color (--color-page)"
            description="The primary canvas color used behind all page sections, panels, and modals."
            value={draft.backgroundColor}
            onChange={(val) =>
              setDraft((prev) => ({ ...prev, backgroundColor: val }))
            }
            presets={PRESET_BACKGROUNDS}
          />

          {/* Primary brand color */}
          <ColorField
            label="Primary Brand Color (--color-brand-blue)"
            description="Used for main CTA action buttons, active navigation markers, key icons, and highlights."
            value={draft.primaryColor}
            onChange={(val) =>
              setDraft((prev) => ({ ...prev, primaryColor: val }))
            }
            presets={PRESET_PRIMARIES}
          />

          {/* Accent brand color */}
          <ColorField
            label="Accent Brand Color (--color-accent)"
            description="Used for secondary badges, subtle borders, focused input rings, and hover gradients."
            value={draft.accentColor}
            onChange={(val) =>
              setDraft((prev) => ({ ...prev, accentColor: val }))
            }
            presets={PRESET_ACCENTS}
          />

          {/* Ink / Typography color */}
          <ColorField
            label="Typography Ink Color (--color-ink)"
            description="The dark text color applied to headers, body titles, and main content."
            value={draft.inkColor}
            onChange={(val) => setDraft((prev) => ({ ...prev, inkColor: val }))}
            presets={PRESET_INKS}
          />
        </div>
      </section>

      {/* Real-time Component Preview */}
      <section className="rounded-[24px] border border-[#e5dfd6] bg-white p-6 shadow-sm sm:p-8">
        <div className="border-b border-[#eee8df] pb-4">
          <h2 className="text-[17px] font-bold text-[#071b3d]">
            Live Palette Preview
          </h2>
          <p className="mt-1 text-[13px] text-[#706a62]">
            Preview how your selected background canvas, brand color, and logos
            interact together in real time.
          </p>
        </div>

        <div
          className="mt-6 rounded-[22px] border border-[#d8d2c7] p-6 sm:p-8 transition-colors duration-200"
          style={{ backgroundColor: draft.backgroundColor }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-black/10 pb-5">
            <div className="flex h-9 items-center">
              <img
                src={draft.logoUrl || "/brand/limex-logo.png"}
                alt="Brand logo preview"
                className="h-8 w-auto max-w-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-full px-4 text-[12px] font-bold text-white shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: draft.primaryColor }}
              >
                Primary Button
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-[12px] font-semibold transition-colors"
                style={{
                  borderColor: draft.primaryColor,
                  color: draft.primaryColor,
                }}
              >
                Outline Action
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[16px] border border-black/10 bg-white/70 p-5 backdrop-blur-sm">
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: draft.accentColor }}
              >
                Featured Service
              </span>
              <h4
                className="mt-2 text-[17px] font-bold leading-snug"
                style={{ color: draft.inkColor }}
              >
                Private Limited Company Setup
              </h4>
              <p className="mt-1 text-[13px] text-[#635e57]">
                Fast, compliant company formation with RJSC incorporation and
                bank account opening.
              </p>
            </div>

            <div className="rounded-[16px] bg-[#071b3d] p-5 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                Dark Footer Mockup
              </span>
              <div className="mt-3 flex h-7 items-center">
                <img
                  src={draft.logoLightUrl || "/brand/limex-logo-light.png"}
                  alt="Footer logo preview"
                  className="h-6 w-auto max-w-full object-contain"
                />
              </div>
              <p className="mt-2 text-[12px] text-white/70">
                Business, made clearer. Company registration, tax and trademark
                support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
