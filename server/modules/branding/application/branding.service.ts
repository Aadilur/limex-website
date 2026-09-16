import type {
  SiteBrandingInput,
  SiteBrandingRecord,
} from "../domain/branding.js";
import { siteBrandingSchema } from "../domain/branding.js";
import type { PrismaBrandingRepository } from "../infrastructure/prisma-branding.repository.js";

export class BrandingService {
  public constructor(private readonly repository: PrismaBrandingRepository) {}

  public async getPublicBranding(): Promise<SiteBrandingRecord> {
    return this.repository.getBranding();
  }

  public async getAdminBranding(): Promise<SiteBrandingRecord> {
    return this.repository.getBranding();
  }

  public async saveBranding(input: unknown): Promise<SiteBrandingRecord> {
    const validated = siteBrandingSchema.parse(input);
    return this.repository.saveBranding(validated);
  }
}
