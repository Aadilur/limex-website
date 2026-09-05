import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdminSession } from "../../shared/auth/admin-session.js";
import { prisma } from "../../shared/database/prisma.js";
import { calculateTool, defaultToolsSettings, getTool, toolsSettingsSchema, toolSlugs, validateFields } from "../../../src/lib/business-tools.js";
import { createDocumentDraft, documentFields } from "../../../src/lib/business-documents.js";

const paramsSchema = z.object({ slug: z.enum(toolSlugs) });
const inputSchema = z.object({ values: z.record(z.string().max(5000)) }).strict();
const statuses = ["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED"] as const;
const requestSchema = z.object({
  submissionId: z.string().uuid(), toolSlug: z.enum(toolSlugs), name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{7,25}$/, "Enter a valid phone number.").refine((value) => { const digits = value.replace(/\D/g, ""); return digits.length >= 7 && digits.length <= 15; }, "Enter a phone number with 7 to 15 digits."), message: z.string().trim().max(2000).default(""),
  consent: z.literal(true), values: z.record(z.string().max(5000)).optional(), website: z.string().max(200).default(""),
}).strict();

async function configuration() {
  const row = await prisma.businessToolSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default", settings: defaultToolsSettings as unknown as Prisma.InputJsonValue } });
  return { version: row.version, settings: toolsSettingsSchema.parse(row.settings) };
}
function invalid(reply: FastifyReply, error: unknown) {
  if (error instanceof z.ZodError) return reply.code(400).send({ error: error.issues[0]?.message ?? "Check your entries." });
  return reply.code(400).send({ error: error instanceof Error ? error.message : "Check your entries." });
}
export async function toolsRoutes(app: FastifyInstance) {
  // Short-lived, bounded buckets: no persistent IP tracking or submitted form contents.
  const buckets = new Map<string, { count: number; until: number }>();
  function throttle(request: FastifyRequest, reply: FastifyReply, limit: number) {
    const now = Date.now();
    for (const [key, entry] of buckets) if (entry.until <= now) buckets.delete(key);
    const key = `${request.ip}:${request.routeOptions.url}`;
    const bucket = buckets.get(key) ?? { count: 0, until: now + 60000 };
    if (bucket.count >= limit || (!buckets.has(key) && buckets.size >= 10000)) { reply.header("Retry-After", "60").code(429).send({ error: "Please wait a minute before trying again." }); return false; }
    bucket.count++; buckets.set(key, bucket); return true;
  }
  app.get("/api/tools/config", async (_request, reply) => { reply.header("Cache-Control", "no-store"); return { data: await configuration() }; });
  app.post("/api/tools/calculate/:slug", { bodyLimit: 32000 }, async (request, reply) => {
    if (!throttle(request, reply, 90)) return;
    const { slug } = paramsSchema.parse(request.params); const input = inputSchema.parse(request.body); const config = await configuration();
    try { return { data: { ...calculateTool(slug, input.values, config.settings), version: config.version } }; } catch (error) { return invalid(reply, error); }
  });
  app.post("/api/tools/documents/:slug", { bodyLimit: 100000 }, async (request, reply) => {
    if (!throttle(request, reply, 30)) return;
    const { slug } = paramsSchema.parse(request.params); const input = inputSchema.parse(request.body);
    if (getTool(slug)?.group !== "builder") return reply.code(400).send({ error: "Choose a document builder." });
    try {
      const values = validateFields(documentFields(slug), input.values);
      if (slug === "moa-aoa" && (Number(values.capital) <= 0 || Number(values.capital) % Number(values.shareValue) !== 0)) throw new Error("Capital must be a positive whole multiple of the share value.");
      return { data: { draft: createDocumentDraft(slug, values), values } };
    } catch (error) { return invalid(reply, error); }
  });
  app.post("/api/tools/requests", { bodyLimit: 100000 }, async (request, reply) => {
    if (!throttle(request, reply, 8)) return;
    const input = requestSchema.parse(request.body);
    if (input.website) return reply.code(400).send({ error: "Unable to submit this request." });
    const config = await configuration();
    let snapshot: unknown = { type: "general-enquiry", configVersion: config.version };
    try {
      if (input.values) {
        if (getTool(input.toolSlug)?.group === "calculator") snapshot = { ...calculateTool(input.toolSlug, input.values, config.settings), configVersion: config.version };
        else {
          const values = validateFields(documentFields(input.toolSlug), input.values);
          if (input.toolSlug === "moa-aoa" && (Number(values.capital) <= 0 || Number(values.capital) % Number(values.shareValue) !== 0)) throw new Error("Check authorised capital and share value.");
          snapshot = { values, draft: createDocumentDraft(input.toolSlug, values), templateVersion: 1 };
        }
      }
    } catch (error) { return invalid(reply, error); }
    // A unique client key makes a retry safe after a lost network response.
    try {
      const saved = await prisma.toolServiceRequest.create({ data: { submissionId: input.submissionId, toolSlug: input.toolSlug, name: input.name, phone: input.phone, message: input.message, context: snapshot as Prisma.InputJsonValue } });
      return reply.code(201).send({ data: { reference: saved.id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existing = await prisma.toolServiceRequest.findUnique({ where: { submissionId: input.submissionId } });
        if (existing?.name === input.name && existing.phone === input.phone && existing.toolSlug === input.toolSlug && existing.message === input.message) return { data: { reference: existing.id } };
        return reply.code(409).send({ error: "This submission key was already used. Start a new request." });
      }
      throw error;
    }
  });
  app.get("/api/admin/tools/config", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return; reply.header("Cache-Control", "no-store"); return { data: await configuration() };
  });
  app.put("/api/admin/tools/config", { bodyLimit: 100000 }, async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const input = z.object({ version: z.number().int().positive(), settings: toolsSettingsSchema }).strict().parse(request.body);
    const result = await prisma.businessToolSettings.updateMany({ where: { id: "default", version: input.version }, data: { settings: input.settings as unknown as Prisma.InputJsonValue, version: { increment: 1 } } });
    if (!result.count) return reply.code(409).send({ error: "Settings changed in another session. Reload before saving." });
    return { data: await configuration() };
  });
  app.get("/api/admin/tools/requests", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return; reply.header("Cache-Control", "no-store");
    const { page, status } = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), status: z.enum(statuses).optional() }).parse(request.query);
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([prisma.toolServiceRequest.findMany({ where, take: 20, skip: (page - 1) * 20, orderBy: { createdAt: "desc" } }), prisma.toolServiceRequest.count({ where })]);
    return { data: { items, total, page } };
  });
  app.patch("/api/admin/tools/requests/:id", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { id } = z.object({ id: z.string().cuid() }).parse(request.params); const { status } = z.object({ status: z.enum(statuses) }).strict().parse(request.body);
    const updated = await prisma.toolServiceRequest.updateMany({ where: { id }, data: { status } });
    if (!updated.count) return reply.code(404).send({ error: "Request not found." }); return { data: { id, status } };
  });
}
