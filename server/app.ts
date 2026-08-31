import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { ZodError } from "zod";

import { env } from "./config/env.js";
import { HealthService } from "./modules/health/application/health.service.js";
import { PrismaHealthCheck } from "./modules/health/infrastructure/prisma-health-check.js";
import { healthRoutes } from "./modules/health/interface/http/health.routes.js";
import { UserService } from "./modules/users/application/user.service.js";
import { PrismaUserRepository } from "./modules/users/infrastructure/prisma-user.repository.js";
import { userRoutes } from "./modules/users/interface/http/user.routes.js";
import { prisma } from "./shared/database/prisma.js";

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
  });

  const corsOrigin =
    env.CORS_ORIGIN === "*"
      ? true
      : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

  await app.register(helmet);
  await app.register(cors, { origin: corsOrigin });

  const healthService = new HealthService(new PrismaHealthCheck(prisma));
  const userService = new UserService(new PrismaUserRepository(prisma));

  await app.register(healthRoutes, { service: healthService });
  await app.register(userRoutes, { service: userService });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: "Validation failed.",
        issues: error.issues,
      });
    }

    request.log.error(error);

    return reply.code(500).send({
      error: "Internal server error.",
    });
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
