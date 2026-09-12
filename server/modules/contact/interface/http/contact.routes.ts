import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { requireAdminSession } from "../../../../shared/auth/admin-session.js";
import { ContactConflictError, ContactSafetyError } from "../../domain/contact.js";
import type { ContactService } from "../../application/contact.service.js";

const contactInputSchema = z.object({
  whatsappNumber: z.string().trim().max(40),
  whatsappDisplay: z.string().trim().min(1).max(80),
  whatsappMessage: z.string().trim().min(1).max(500),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40),
  address: z.string().trim().max(300),
  businessHours: z.string().trim().max(240),
}).strict();

const updateBodySchema = z.object({
  settings: contactInputSchema,
  expectedRevision: z.number().int().nonnegative(),
}).strict();

function sendKnownContactError(error: unknown, reply: FastifyReply) {
  if (error instanceof ContactConflictError) return reply.code(409).send({ error: error.message });
  if (error instanceof ContactSafetyError) return reply.code(422).send({ error: error.message });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return reply.code(404).send({ error: "Contact settings were not found." });
  throw error;
}

function ensureAdmin(request: FastifyRequest, reply: FastifyReply) {
  return requireAdminSession(request, reply);
}

export async function contactRoutes(app: FastifyInstance, options: { service: ContactService }) {
  app.get("/api/contact-settings", async (_request, reply) => {
    reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return { data: await options.service.getPublicSettings() };
  });

  app.get("/api/admin/contact-settings", async (request, reply) => {
    if (!ensureAdmin(request, reply)) return;
    reply.header("Cache-Control", "no-store");
    return { data: await options.service.getAdminSettings() };
  });

  app.put("/api/admin/contact-settings", async (request, reply) => {
    const session = ensureAdmin(request, reply);
    if (!session) return;
    try {
      const input = updateBodySchema.parse(request.body);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.saveSettings(input.settings, input.expectedRevision, session.username) };
    } catch (error) {
      return sendKnownContactError(error, reply);
    }
  });
}
