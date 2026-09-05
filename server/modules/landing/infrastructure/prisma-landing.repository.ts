import { Prisma, type PrismaClient } from "@prisma/client";

import type { LandingPageRecord, LandingRepository } from "../domain/landing.js";

export class PrismaLandingRepository implements LandingRepository {
  public constructor(private readonly client: PrismaClient) {}

  public find(): Promise<LandingPageRecord | null> {
    return this.client.landingPage.findUnique({ where: { id: "home" } });
  }

  public upsert(content: unknown): Promise<LandingPageRecord> {
    return this.client.landingPage.upsert({
      where: { id: "home" },
      update: { content: content as Prisma.InputJsonValue },
      create: { id: "home", content: content as Prisma.InputJsonValue },
    });
  }

  public async updateIfUnchanged(expectedUpdatedAt: Date, content: unknown): Promise<LandingPageRecord | null> {
    const result = await this.client.landingPage.updateMany({
      where: { id: "home", updatedAt: expectedUpdatedAt },
      data: { content: content as Prisma.InputJsonValue },
    });

    if (result.count !== 1) return null;
    return this.find();
  }
}
