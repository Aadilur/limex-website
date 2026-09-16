import { ApiError, request } from "./menu-api";

export type SiteBranding = {
  id: string;
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  inkColor: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  updatedAt?: string | null;
};

export const defaultBranding: SiteBranding = {
  id: "default",
  backgroundColor: "#eeece7",
  primaryColor: "#0055ff",
  accentColor: "#008cff",
  inkColor: "#07142e",
  logoUrl: null,
  logoLightUrl: null,
};

export function hexToRgb(hex: string, fallback = "0, 0, 0"): string {
  if (!hex || typeof hex !== "string") return fallback;
  const cleaned = hex.trim().replace(/^#/, "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return fallback;
    return `${r}, ${g}, ${b}`;
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return fallback;
    return `${r}, ${g}, ${b}`;
  }
  return fallback;
}

export function generateThemeCss(branding: SiteBranding): string {
  const bg = branding.backgroundColor || defaultBranding.backgroundColor;
  const primary = branding.primaryColor || defaultBranding.primaryColor;
  const accent = branding.accentColor || defaultBranding.accentColor;
  const ink = branding.inkColor || defaultBranding.inkColor;

  return `:root {
  --color-page: ${bg};
  --color-page-rgb: ${hexToRgb(bg, "238, 236, 231")};
  --color-brand-blue: ${primary};
  --color-brand-blue-rgb: ${hexToRgb(primary, "0, 85, 255")};
  --color-accent: ${accent};
  --color-accent-rgb: ${hexToRgb(accent, "0, 140, 255")};
  --color-ink: ${ink};
  --color-ink-rgb: ${hexToRgb(ink, "7, 20, 46")};
}`;
}

export async function getPublicBranding(): Promise<SiteBranding> {
  try {
    const res = await request<{ data: SiteBranding }>("/api/branding", {
      cache: "no-store",
    });
    return res.data;
  } catch {
    return defaultBranding;
  }
}

export async function getAdminBranding(): Promise<SiteBranding> {
  const res = await request<{ data: SiteBranding }>("/api/admin/branding", {
    cache: "no-store",
  });
  return res.data;
}

export async function updateAdminBranding(
  input: Partial<Omit<SiteBranding, "id" | "updatedAt">>,
): Promise<SiteBranding> {
  const res = await request<{ data: SiteBranding }>("/api/admin/branding", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function uploadBrandLogo(file: File): Promise<{
  asset: string;
  url: string;
  bytes: number;
  contentType: string;
}> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await request<{
    data: {
      asset: string;
      url: string;
      bytes: number;
      contentType: string;
    };
  }>("/api/admin/branding/logo", {
    method: "POST",
    body: formData,
  });
  return res.data;
}
