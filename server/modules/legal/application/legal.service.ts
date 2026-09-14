import {
  DEFAULT_LEGAL_PAGES,
  type LegalPageInput,
  type LegalPageRecord,
  type LegalSlug,
} from "../domain/legal.js";
import type { PrismaLegalRepository } from "../infrastructure/prisma-legal.repository.js";

export class LegalService {
  constructor(private readonly repository: PrismaLegalRepository) {}

  async getPage(slug: LegalSlug): Promise<LegalPageRecord> {
    const record = await this.repository.findBySlug(slug);
    if (record) {
      return {
        id: record.id,
        slug: record.slug as LegalSlug,
        title: record.title,
        contentHtml: record.contentHtml,
        contentJson: record.contentJson,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    }

    const fallback = DEFAULT_LEGAL_PAGES[slug];
    const now = new Date().toISOString();
    return {
      id: `default-${slug}`,
      slug,
      title: fallback.title,
      contentHtml: fallback.contentHtml,
      contentJson: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getAllPages(): Promise<LegalPageRecord[]> {
    const records = await this.repository.findAll();
    const recordMap = new Map(records.map((item) => [item.slug, item]));
    const slugs: LegalSlug[] = ["terms", "privacy"];

    return slugs.map((slug) => {
      const existing = recordMap.get(slug);
      if (existing) {
        return {
          id: existing.id,
          slug: existing.slug as LegalSlug,
          title: existing.title,
          contentHtml: existing.contentHtml,
          contentJson: existing.contentJson,
          createdAt: existing.createdAt.toISOString(),
          updatedAt: existing.updatedAt.toISOString(),
        };
      }

      const fallback = DEFAULT_LEGAL_PAGES[slug];
      const now = new Date().toISOString();
      return {
        id: `default-${slug}`,
        slug,
        title: fallback.title,
        contentHtml: fallback.contentHtml,
        contentJson: null,
        createdAt: now,
        updatedAt: now,
      };
    });
  }

  async savePage(
    slug: LegalSlug,
    input: LegalPageInput,
    _username?: string,
  ): Promise<LegalPageRecord> {
    const saved = await this.repository.upsert(slug, input);
    return {
      id: saved.id,
      slug: saved.slug as LegalSlug,
      title: saved.title,
      contentHtml: saved.contentHtml,
      contentJson: saved.contentJson,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  }
}
