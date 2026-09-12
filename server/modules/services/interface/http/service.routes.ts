import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { requireAdminSession } from "../../../../shared/auth/admin-session.js";
import {
  ServiceConflictError,
  ServiceInputError,
  ServiceNotFoundError,
  ServiceSafetyError,
  isSafeServiceHref,
} from "../../domain/service.js";
import type { ServiceService } from "../../application/service.service.js";

const idParamsSchema = z.object({ id: z.string().trim().min(1).max(191) });
const slugParamsSchema = z.object({ slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
const hrefSchema = z.string().trim().min(1).max(1000).refine(isSafeServiceHref, "Use an internal path, hash link, HTTP or HTTPS URL.");
const optionalHrefSchema = z.string().trim().max(1000).refine((value) => !value || isSafeServiceHref(value), "Use an internal path, hash link, HTTP or HTTPS URL.").default("");
const iconSchema = z.string().trim().min(1).max(80).default("briefcase");
const text = (max: number) => z.string().trim().max(max).default("");
const requiredText = (max: number) => z.string().trim().min(1).max(max);
const localeQuerySchema = z.object({ locale: z.enum(["en", "bn"]).default("en") }).strict();

const detailSchema = z.object({
  ctaLabel: text(100),
  startingPrice: text(120),
  deliveryTime: text(120),
  serviceMode: text(120),
  mediaTitle: text(180),
  mediaDescription: text(500),
  mediaUrl: optionalHrefSchema,
  mediaAlt: text(240),
  overviewEyebrow: text(120),
  overviewTitle: text(240),
  overviewDescription: text(1200),
  contentLabel: text(120),
  contentTitle: text(240),
  contentDescription: text(1600),
  contentLinkLabel: text(120),
  contentLinkHref: optionalHrefSchema,
  benefits: z.array(requiredText(240)).max(30).default([]),
  steps: z.array(z.object({ title: requiredText(180), description: text(500) })).max(12).default([]),
  facts: z.array(z.object({ label: requiredText(120), value: requiredText(180) })).max(12).default([]),
  pricing: z.array(z.object({
    name: requiredText(120),
    price: requiredText(120),
    description: text(500),
    features: z.array(requiredText(180)).max(12).default([]),
    action: requiredText(100),
    whatsappLabel: text(100),
    featured: z.boolean().optional(),
  })).max(6).default([]),
  faqs: z.array(z.object({ question: requiredText(300), answer: requiredText(1600) })).max(30).default([]),
}).strict();

const profileSchema = z.object({
  serviceKey: z.string().trim().max(180).optional(),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: requiredText(180),
  description: text(500),
  href: hrefSchema,
  icon: iconSchema,
  titleEn: requiredText(180),
  titleBn: requiredText(180),
  descriptionEn: requiredText(500),
  descriptionBn: requiredText(500),
  detail: detailSchema.nullable().default(null),
}).strict();

const updateBodySchema = z.object({
  profile: profileSchema,
  expectedRevision: z.number().int().positive(),
}).strict();

const createBodySchema = z.object({ profile: profileSchema }).strict();
const revisionBodySchema = z.object({ expectedRevision: z.number().int().positive() }).strict();
const assignmentBodySchema = z.object({
  menuTarget: z.object({ targetType: z.enum(["ITEM", "LINK"]), targetId: z.string().trim().min(1).max(191) }).nullable(),
  expectedRevision: z.number().int().positive(),
}).strict();

function sendKnownServiceError(error: unknown, reply: FastifyReply) {
  if (error instanceof ServiceConflictError) return reply.code(409).send({ error: error.message });
  if (error instanceof ServiceSafetyError) return reply.code(422).send({ error: error.message });
  if (error instanceof ServiceInputError) return reply.code(400).send({ error: error.message });
  if (error instanceof ServiceNotFoundError) return reply.code(404).send({ error: error.message });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return reply.code(409).send({ error: "A service with that key or URL slug already exists." });
    if (error.code === "P2025") return reply.code(404).send({ error: "The requested service was not found." });
  }
  throw error;
}

function adminSession(request: FastifyRequest, reply: FastifyReply) {
  return requireAdminSession(request, reply);
}

export async function serviceRoutes(app: FastifyInstance, options: { service: ServiceService }) {
  app.get("/api/services", async (_request, reply) => {
    reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return { data: await options.service.getPublicCatalog() };
  });

  app.get("/api/services/:slug", async (request, reply) => {
    const { slug } = slugParamsSchema.parse(request.params);
    const { locale } = localeQuerySchema.parse(request.query);
    const service = await options.service.getPublicService(slug, locale);
    if (!service) return reply.code(404).send({ error: "This service page is not published." });
    reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return { data: service };
  });

  app.get("/api/admin/services", async (request, reply) => {
    if (!adminSession(request, reply)) return;
    reply.header("Cache-Control", "no-store");
    return { data: await options.service.getAdminCatalog() };
  });

  app.get("/api/admin/services/menu-options", async (request, reply) => {
    if (!adminSession(request, reply)) return;
    reply.header("Cache-Control", "no-store");
    try {
      return { data: await options.service.getAdminMenuOptions() };
    } catch (error) {
      return sendKnownServiceError(error, reply);
    }
  });

  app.post("/api/admin/services", async (request, reply) => {
    const session = adminSession(request, reply);
    if (!session) return;
    try {
      const input = createBodySchema.parse(request.body);
      return { data: await options.service.createService(input.profile, session.username) };
    } catch (error) {
      return sendKnownServiceError(error, reply);
    }
  });

  app.get("/api/admin/services/:id", async (request, reply) => {
    if (!adminSession(request, reply)) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.getAdminService(id) };
    } catch (error) {
      return sendKnownServiceError(error, reply);
    }
  });

  app.put("/api/admin/services/:id", async (request, reply) => {
    const session = adminSession(request, reply);
    if (!session) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      const input = updateBodySchema.parse(request.body);
      const data = await options.service.saveService(id, input.profile, input.expectedRevision, session.username);
      return { data };
    } catch (error) {
      return sendKnownServiceError(error, reply);
    }
  });

  app.post("/api/admin/services/:id/assignment", async (request, reply) => {
    const session = adminSession(request, reply);
    if (!session) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      const input = assignmentBodySchema.parse(request.body);
      return { data: await options.service.assignService(id, input.menuTarget, input.expectedRevision, session.username) };
    } catch (error) {
      return sendKnownServiceError(error, reply);
    }
  });

  app.post("/api/admin/services/profile/:id/publish", async (request, reply) => {
    const session = adminSession(request, reply);
    if (!session) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      const { expectedRevision } = revisionBodySchema.parse(request.body);
      return { data: await options.service.publishService(id, expectedRevision, session.username) };
    } catch (error) {
      return sendKnownServiceError(error, reply);
    }
  });

  app.post("/api/admin/services/profile/:id/unpublish", async (request, reply) => {
    const session = adminSession(request, reply);
    if (!session) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      const { expectedRevision } = revisionBodySchema.parse(request.body);
      return { data: await options.service.unpublishService(id, expectedRevision, session.username) };
    } catch (error) {
      return sendKnownServiceError(error, reply);
    }
  });
}
