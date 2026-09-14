import type { PrismaClient } from "@prisma/client";
import type { LegalPageInput, LegalSlug } from "../domain/legal.js";

export class PrismaLegalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: LegalSlug) {
    return this.prisma.legalPage.findUnique({
      where: { slug },
    });
  }

  async findAll() {
    return this.prisma.legalPage.findMany({
      orderBy: { slug: "asc" },
    });
  }

  async upsert(slug: LegalSlug, input: LegalPageInput) {
    return this.prisma.legalPage.upsert({
      where: { slug },
      create: {
        slug,
        title: input.title,
        contentHtml: input.contentHtml,
        contentJson: input.contentJson ? JSON.parse(JSON.stringify(input.contentJson)) : undefined,
      },
      update: {
        title: input.title,
        contentHtml: input.contentHtml,
        contentJson: input.contentJson ? JSON.parse(JSON.stringify(input.contentJson)) : undefined,
      },
    });
  }
}
