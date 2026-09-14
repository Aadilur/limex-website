import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { requireAdminSession } from "../../../../shared/auth/admin-session.js";
import {
  legalPageInputSchema,
  legalSlugSchema,
  type LegalSlug,
} from "../../domain/legal.js";
import type { LegalService } from "../../application/legal.service.js";

const paramsSchema = z.object({
  slug: legalSlugSchema,
});

function ensureAdmin(request: FastifyRequest, reply: FastifyReply) {
  return requireAdminSession(request, reply);
}

export async function legalRoutes(
  app: FastifyInstance,
  options: { service: LegalService },
) {
  // Public route to view terms or privacy
  app.get<{ Params: { slug: string } }>(
    "/api/legal/:slug",
    async (request, reply) => {
      const parsed = paramsSchema.safeParse(request.params);
      if (!parsed.success) {
        return reply.code(404).send({ error: "Legal page not found." });
      }

      reply.header(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=300",
      );
      const data = await options.service.getPage(parsed.data.slug);
      return { data };
    },
  );

  // Admin list all legal pages
  app.get("/api/admin/legal", async (request, reply) => {
    if (!ensureAdmin(request, reply)) return;
    reply.header("Cache-Control", "no-store");
    const data = await options.service.getAllPages();
    return { data };
  });

  // Admin get single legal page
  app.get<{ Params: { slug: string } }>(
    "/api/admin/legal/:slug",
    async (request, reply) => {
      if (!ensureAdmin(request, reply)) return;
      const parsed = paramsSchema.safeParse(request.params);
      if (!parsed.success) {
        return reply.code(404).send({ error: "Legal page not found." });
      }

      reply.header("Cache-Control", "no-store");
      const data = await options.service.getPage(parsed.data.slug);
      return { data };
    },
  );

  // Admin update legal page
  app.put<{ Params: { slug: string } }>(
    "/api/admin/legal/:slug",
    async (request, reply) => {
      const session = ensureAdmin(request, reply);
      if (!session) return;

      const parsedParams = paramsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.code(404).send({ error: "Legal page not found." });
      }

      const parsedBody = legalPageInputSchema.parse(request.body);
      reply.header("Cache-Control", "no-store");
      const data = await options.service.savePage(
        parsedParams.data.slug,
        parsedBody,
        session.username,
      );
      return { data };
    },
  );
}
