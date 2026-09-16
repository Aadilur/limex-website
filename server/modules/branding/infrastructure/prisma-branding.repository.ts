import type { PrismaClient } from "@prisma/client";

import type {
  SiteBrandingInput,
  SiteBrandingRecord,
} from "../domain/branding.js";
import { DEFAULT_SITE_BRANDING } from "../domain/branding.js";

export class PrismaBrandingRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async getBranding(): Promise<SiteBrandingRecord> {
    const record = await this.prisma.siteBranding.findUnique({
      where: { id: "default" },
    });

    if (record) {
      return {
        id: record.id,
        backgroundColor: record.backgroundColor,
        primaryColor: record.primaryColor,
        accentColor: record.accentColor,
        inkColor: record.inkColor,
        logoUrl: record.logoUrl,
        logoLightUrl: record.logoLightUrl,
        updatedAt: record.updatedAt,
      };
    }

    // Upsert default if not found
    const created = await this.prisma.siteBranding.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...DEFAULT_SITE_BRANDING,
      },
      update: {},
    });

    return {
      id: created.id,
      backgroundColor: created.backgroundColor,
      primaryColor: created.primaryColor,
      accentColor: created.accentColor,
      inkColor: created.inkColor,
      logoUrl: created.logoUrl,
      logoLightUrl: created.logoLightUrl,
      updatedAt: created.updatedAt,
    };
  }

  public async saveBranding(
    input: SiteBrandingInput,
  ): Promise<SiteBrandingRecord> {
    const updated = await this.prisma.siteBranding.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        backgroundColor: input.backgroundColor,
        primaryColor: input.primaryColor,
        accentColor: input.accentColor,
        inkColor: input.inkColor,
        logoUrl: input.logoUrl ?? null,
        logoLightUrl: input.logoLightUrl ?? null,
      },
      update: {
        backgroundColor: input.backgroundColor,
        primaryColor: input.primaryColor,
        accentColor: input.accentColor,
        inkColor: input.inkColor,
        logoUrl: input.logoUrl ?? null,
        logoLightUrl: input.logoLightUrl ?? null,
      },
    });

    return {
      id: updated.id,
      backgroundColor: updated.backgroundColor,
      primaryColor: updated.primaryColor,
      accentColor: updated.accentColor,
      inkColor: updated.inkColor,
      logoUrl: updated.logoUrl,
      logoLightUrl: updated.logoLightUrl,
      updatedAt: updated.updatedAt,
    };
  }
}
