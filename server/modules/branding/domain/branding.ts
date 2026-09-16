import { z } from "zod";

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const hexColorSchema = z
  .string()
  .trim()
  .regex(
    hexColorRegex,
    "Must be a valid hex color code (e.g. #0055ff or #fff)",
  );

export const siteBrandingSchema = z
  .object({
    backgroundColor: hexColorSchema.default("#eeece7"),
    primaryColor: hexColorSchema.default("#0055ff"),
    accentColor: hexColorSchema.default("#008cff"),
    inkColor: hexColorSchema.default("#07142e"),
    logoUrl: z.string().trim().max(500).nullable().optional(),
    logoLightUrl: z.string().trim().max(500).nullable().optional(),
  })
  .strict();

export type SiteBrandingInput = z.infer<typeof siteBrandingSchema>;

export type SiteBrandingRecord = {
  id: string;
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  inkColor: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  updatedAt: Date;
};

export const DEFAULT_SITE_BRANDING: Omit<
  SiteBrandingRecord,
  "id" | "updatedAt"
> = {
  backgroundColor: "#eeece7",
  primaryColor: "#0055ff",
  accentColor: "#008cff",
  inkColor: "#07142e",
  logoUrl: null,
  logoLightUrl: null,
};
