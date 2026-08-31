import type { PrismaClient } from "@prisma/client";

import type { DatabaseHealthCheck } from "../application/health.service.js";

export class PrismaHealthCheck implements DatabaseHealthCheck {
  public constructor(private readonly client: PrismaClient) {}

  public async ping() {
    await this.client.$queryRaw`SELECT 1`;
  }
}
