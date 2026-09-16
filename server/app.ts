import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { ZodError } from "zod";

import { env } from "./config/env.js";
import { AboutService } from "./modules/about/application/about.service.js";
import { PrismaAboutReelRepository } from "./modules/about/infrastructure/prisma-about-reel.repository.js";
import { PrismaAboutRepository } from "./modules/about/infrastructure/prisma-about.repository.js";
import { aboutRoutes } from "./modules/about/interface/http/about.routes.js";
import { AdminAuthService } from "./modules/admin/application/admin-auth.service.js";
import { MenuService } from "./modules/admin/application/menu.service.js";
import { PrismaMenuRepository } from "./modules/admin/infrastructure/prisma-menu.repository.js";
import { adminAuthRoutes } from "./modules/admin/interface/http/admin-auth.routes.js";
import { adminMenuRoutes } from "./modules/admin/interface/http/menu.routes.js";
import { publicMenuRoutes } from "./modules/admin/interface/http/public-menu.routes.js";
import { LandingService } from "./modules/landing/application/landing.service.js";
import { PrismaLandingRepository } from "./modules/landing/infrastructure/prisma-landing.repository.js";
import { landingRoutes } from "./modules/landing/interface/http/landing.routes.js";
import { HealthService } from "./modules/health/application/health.service.js";
import { PrismaHealthCheck } from "./modules/health/infrastructure/prisma-health-check.js";
import { healthRoutes } from "./modules/health/interface/http/health.routes.js";
import { UserService } from "./modules/users/application/user.service.js";
import { PrismaUserRepository } from "./modules/users/infrastructure/prisma-user.repository.js";
import { userRoutes } from "./modules/users/interface/http/user.routes.js";
import { prisma } from "./shared/database/prisma.js";
import { toolsRoutes } from "./modules/tools/tools.routes.js";
import { templateRoutes } from "./modules/tools/template.routes.js";
import { BlogService } from "./modules/blog/application/blog.service.js";
import { PrismaBlogRepository } from "./modules/blog/infrastructure/prisma-blog.repository.js";
import { createBlogRoutes } from "./modules/blog/interface/http/blog.routes.js";
import { createRateLimiter } from "./shared/http/rate-limit.js";
import { ServiceService } from "./modules/services/application/service.service.js";
import { PrismaServiceRepository } from "./modules/services/infrastructure/prisma-service.repository.js";
import { serviceRoutes } from "./modules/services/interface/http/service.routes.js";
import { MediaService } from "./modules/media/application/media.service.js";
import { PrismaMediaRepository } from "./modules/media/infrastructure/prisma-media.repository.js";
import { mediaRoutes } from "./modules/media/interface/http/media.routes.js";
import { ContactService } from "./modules/contact/application/contact.service.js";
import { PrismaContactRepository } from "./modules/contact/infrastructure/prisma-contact.repository.js";
import { contactRoutes } from "./modules/contact/interface/http/contact.routes.js";
import { LegalService } from "./modules/legal/application/legal.service.js";
import { PrismaLegalRepository } from "./modules/legal/infrastructure/prisma-legal.repository.js";
import { legalRoutes } from "./modules/legal/interface/http/legal.routes.js";
import { BrandingService } from "./modules/branding/application/branding.service.js";
import { PrismaBrandingRepository } from "./modules/branding/infrastructure/prisma-branding.repository.js";
import { brandingRoutes } from "./modules/branding/interface/http/branding.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
    // The production gateway forwards the original client address in
    // X-Forwarded-For; use it so per-IP limits do not throttle every visitor
    // behind the gateway as one client.
    trustProxy: true,
  });
  const apiWriteLimiter = createRateLimiter({
    limit: 180,
    windowMs: 60_000,
    maxEntries: 20_000,
  });

  const corsOrigin =
    env.CORS_ORIGIN === "*"
      ? true
      : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

  await app.register(helmet);
  await app.register(cors, { origin: corsOrigin, credentials: true });
  await app.register(multipart, {
    limits: {
      files: 1,
      fileSize: 5 * 1024 * 1024,
      fields: 8,
      parts: 10,
    },
  });

  // A modest process-wide guard covers every API mutation, including admin
  // mutations. Public write routes also use tighter endpoint-specific limits.
  app.addHook("onRequest", async (request, reply) => {
    if (
      !request.url.startsWith("/api/") ||
      request.method === "GET" ||
      request.method === "HEAD" ||
      request.method === "OPTIONS"
    )
      return;
    if (!apiWriteLimiter(request, reply, request.url.split("?")[0])) return;
  });

  const healthService = new HealthService(new PrismaHealthCheck(prisma));
  const userService = new UserService(new PrismaUserRepository(prisma));
  const adminAuthService = new AdminAuthService();
  const menuService = new MenuService(new PrismaMenuRepository(prisma));
  const aboutService = new AboutService(
    new PrismaAboutRepository(prisma),
    new PrismaAboutReelRepository(prisma),
  );
  const landingService = new LandingService(
    new PrismaLandingRepository(prisma),
  );
  const blogService = new BlogService(new PrismaBlogRepository(prisma));
  const serviceService = new ServiceService(
    new PrismaServiceRepository(prisma),
  );
  const mediaService = new MediaService(new PrismaMediaRepository(prisma));
  const contactService = new ContactService(
    new PrismaContactRepository(prisma),
  );
  const legalService = new LegalService(new PrismaLegalRepository(prisma));
  const brandingService = new BrandingService(
    new PrismaBrandingRepository(prisma),
  );

  await app.register(healthRoutes, { service: healthService });
  await app.register(userRoutes, { service: userService });
  await app.register(adminAuthRoutes, { service: adminAuthService });
  await app.register(adminMenuRoutes, { service: menuService });
  await app.register(publicMenuRoutes, { service: menuService });
  await app.register(aboutRoutes, { service: aboutService });
  await app.register(landingRoutes, { service: landingService });
  await app.register(toolsRoutes);
  await app.register(templateRoutes);
  await app.register(mediaRoutes, { service: mediaService });
  await app.register(createBlogRoutes(blogService, mediaService));
  await app.register(serviceRoutes, { service: serviceService });
  await app.register(contactRoutes, { service: contactService });
  await app.register(legalRoutes, { service: legalService });
  await app.register(brandingRoutes, { service: brandingService });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: "Validation failed.",
        issues: error.issues,
      });
    }

    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
    ) {
      const statusCode = error.statusCode;
      if (statusCode === 400)
        return reply.code(400).send({
          error:
            error instanceof Error ? error.message : "The request is invalid.",
        });
      if (statusCode === 413) {
        const isMultipart = String(
          request.headers["content-type"] ?? "",
        ).startsWith("multipart/");
        return reply.code(413).send({
          error: isMultipart
            ? "The image must be 5 MB or smaller."
            : "Request payload is too large.",
        });
      }
      if (statusCode === 503)
        return reply.code(503).send({
          error:
            error instanceof Error
              ? error.message
              : "Image storage is unavailable.",
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
