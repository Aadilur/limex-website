import type { FastifyInstance, FastifyReply } from "fastify";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdminSession } from "../../shared/auth/admin-session.js";
import { prisma } from "../../shared/database/prisma.js";
import { calculateTool, defaultToolsSettings, getTool, normalizeToolsSettings, toolsSettingsSchema, toolSlugs, validateFields } from "../../../src/lib/business-tools.js";
import { createDocumentDraft, documentFields } from "../../../src/lib/business-documents.js";
import { isContactTimeSlot } from "../../../src/lib/contact-schedule.js";
import { createRateLimiter } from "../../shared/http/rate-limit.js";

const paramsSchema = z.object({ slug: z.enum(toolSlugs) });
const unsafeControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const safeText = (max: number, min = 0) => {
  return z.string().trim().min(min).max(max).refine((value) => !unsafeControlCharacters.test(value), "Remove unsupported control characters.");
};
const valuesSchema = z.record(safeText(5000)).refine((values) => Object.keys(values).length <= 80, "Too many fields were submitted.");
const inputSchema = z.object({ values: valuesSchema }).strict();
const statuses = ["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED"] as const;
const requestTypes = ["CALLBACK", "APPOINTMENT"] as const;
const requestSources = ["all", "contact", "tools"] as const;
const publicRequestToolSlugs = [...toolSlugs, "contact"] as const;
const blankToUndefined = (value: unknown) => typeof value === "string" && value.trim() === "" ? undefined : value;
const optionalPhone = z.preprocess(
  blankToUndefined,
  z.string().trim().regex(/^\+?[\d\s()-]{7,25}$/, "Enter a valid phone number.").refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, "Enter a phone number with 7 to 15 digits.").optional(),
);
const optionalEmail = z.preprocess(blankToUndefined, z.string().trim().email("Enter a valid email address.").max(200).optional());
const optionalDate = z.preprocess(
  blankToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.").refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return false;
    const today = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const earliestAllowed = today;
    const latestAllowed = new Date(Date.now() + 6 * 60 * 60 * 1000);
    latestAllowed.setUTCDate(latestAllowed.getUTCDate() + 180);
    const latestKey = latestAllowed.toISOString().slice(0, 10);
    return value >= earliestAllowed && value <= latestKey;
  }, "Choose a date within the next 180 days.").optional(),
);
const optionalTime = z.preprocess(
  blankToUndefined,
  z.string().refine((value) => isContactTimeSlot(value), "Choose a 30-minute slot between 09:00 and 18:00.").optional(),
);
const requestSchema = z.object({
  submissionId: z.string().uuid(),
  toolSlug: z.enum(publicRequestToolSlugs),
  requestType: z.enum(requestTypes).default("CALLBACK"),
  name: safeText(120, 2),
  phone: optionalPhone,
  email: optionalEmail,
  preferredDate: optionalDate,
  preferredTime: optionalTime,
  message: safeText(2000).default(""),
  services: z.array(safeText(240, 1)).max(12).refine((items) => new Set(items).size === items.length, "Choose each service only once.").optional(),
  consent: z.literal(true),
  values: valuesSchema.optional(),
  website: safeText(200).default(""),
  source: z.object({ type: z.literal("BLOG"), slug: safeText(180), service: safeText(180).optional() }).strict().optional(),
}).strict().superRefine((input, context) => {
  if (!input.phone && !input.email) context.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Add a phone number or email so we know how to reach you." });
  if (Boolean(input.preferredDate) !== Boolean(input.preferredTime)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["preferredDate"], message: "Choose both a date and time, or leave the schedule blank." });
  if (input.requestType === "APPOINTMENT" && (!input.preferredDate || !input.preferredTime)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["preferredDate"], message: "Choose a preferred date and time for an appointment request." });
  if (input.toolSlug === "contact" && (!input.services || input.services.length === 0)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["services"], message: "Choose at least one service so we can direct your request." });
  if (input.toolSlug === "contact" && input.values) context.addIssue({ code: z.ZodIssueCode.custom, path: ["values"], message: "Tool values are not accepted on a general enquiry." });
});

async function configuration() {
  const row = await prisma.businessToolSettings.upsert({ where: { id: "default" }, update: {}, create: { id: "default", settings: defaultToolsSettings as unknown as Prisma.InputJsonValue } });
  return { version: row.version, settings: normalizeToolsSettings(row.settings) };
}
function invalid(reply: FastifyReply, error: unknown) {
  if (error instanceof z.ZodError) return reply.code(400).send({ error: error.issues[0]?.message ?? "Check your entries." });
  return reply.code(400).send({ error: error instanceof Error ? error.message : "Check your entries." });
}
export async function toolsRoutes(app: FastifyInstance) {
  const calculateLimiter = createRateLimiter({ limit: 90, windowMs: 60_000 });
  const documentLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
  const enquiryLimiter = createRateLimiter({ limit: 8, windowMs: 60_000 });
  app.get("/api/tools/config", async (_request, reply) => { reply.header("Cache-Control", "no-store"); return { data: await configuration() }; });
  app.post("/api/tools/calculate/:slug", { bodyLimit: 32000 }, async (request, reply) => {
    if (!calculateLimiter(request, reply, "calculate")) return;
    const { slug } = paramsSchema.parse(request.params); const input = inputSchema.parse(request.body); const config = await configuration();
    try { return { data: { ...calculateTool(slug, input.values, config.settings), version: config.version } }; } catch (error) { return invalid(reply, error); }
  });
  app.post("/api/tools/documents/:slug", { bodyLimit: 100000 }, async (request, reply) => {
    if (!documentLimiter(request, reply, "documents")) return;
    const { slug } = paramsSchema.parse(request.params); const input = inputSchema.parse(request.body);
    if (getTool(slug)?.group !== "builder") return reply.code(400).send({ error: "Choose a document builder." });
    try {
      const values = validateFields(documentFields(slug), input.values);
      if (slug === "moa-aoa" && (Number(values.capital) <= 0 || Number(values.capital) % Number(values.shareValue) !== 0)) throw new Error("Capital must be a positive whole multiple of the share value.");
      return { data: { draft: createDocumentDraft(slug, values), values } };
    } catch (error) { return invalid(reply, error); }
  });
  app.post("/api/tools/requests", { bodyLimit: 60000 }, async (request, reply) => {
    if (!enquiryLimiter(request, reply, "enquiries")) return;
    const input = requestSchema.parse(request.body);
    if (input.website) return reply.code(400).send({ error: "Unable to submit this request." });
    const requestMeta = {
      requestType: input.requestType,
      preferredDate: input.preferredDate ?? null,
      preferredTime: input.preferredTime ?? null,
    };
    let snapshot: unknown = { type: "general-enquiry", ...requestMeta, services: input.services ?? [], source: input.source ?? null };
    try {
      if (input.toolSlug !== "contact") {
        const config = await configuration();
        if (input.values && getTool(input.toolSlug)?.group === "calculator") snapshot = { ...calculateTool(input.toolSlug, input.values, config.settings), configVersion: config.version, ...requestMeta };
        else if (input.values) {
          const values = validateFields(documentFields(input.toolSlug), input.values);
          if (input.toolSlug === "moa-aoa" && (Number(values.capital) <= 0 || Number(values.capital) % Number(values.shareValue) !== 0)) throw new Error("Check authorised capital and share value.");
          snapshot = { values, draft: createDocumentDraft(input.toolSlug, values), templateVersion: 1, ...requestMeta };
        } else snapshot = { type: "tool-enquiry", configVersion: config.version, ...requestMeta };
      }
    } catch (error) { return invalid(reply, error); }
    // A unique client key makes a retry safe after a lost network response.
    try {
      const saved = await prisma.toolServiceRequest.create({ data: { submissionId: input.submissionId, toolSlug: input.toolSlug, name: input.name, phone: input.phone ?? null, email: input.email ?? null, preferredDate: input.preferredDate ?? null, preferredTime: input.preferredTime ?? null, requestType: input.requestType, message: input.message, context: snapshot as Prisma.InputJsonValue } });
      return reply.code(201).send({ data: { reference: saved.id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existing = await prisma.toolServiceRequest.findUnique({ where: { submissionId: input.submissionId } });
        if (existing?.name === input.name && existing.phone === (input.phone ?? null) && existing.email === (input.email ?? null) && existing.toolSlug === input.toolSlug && existing.requestType === input.requestType && existing.preferredDate === (input.preferredDate ?? null) && existing.preferredTime === (input.preferredTime ?? null) && existing.message === input.message) return { data: { reference: existing.id } };
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
    const { page, status, source, search } = z.object({
      page: z.coerce.number().int().min(1).max(100000).default(1),
      status: z.enum(statuses).optional(),
      source: z.enum(requestSources).default("all"),
      search: z.preprocess(blankToUndefined, safeText(120).optional()),
    }).parse(request.query);
    const where: Prisma.ToolServiceRequestWhereInput = {};
    if (status) where.status = status;
    if (source === "contact") where.toolSlug = "contact";
    if (source === "tools") where.toolSlug = { not: "contact" };
    if (search) where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { message: { contains: search } },
    ];
    const [items, total] = await Promise.all([prisma.toolServiceRequest.findMany({ where, take: 20, skip: (page - 1) * 20, orderBy: { createdAt: "desc" } }), prisma.toolServiceRequest.count({ where })]);
    return { data: { items, total, page, pageSize: 20 } };
  });
  app.patch("/api/admin/tools/requests/:id", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { id } = z.object({ id: z.string().cuid() }).parse(request.params); const { status } = z.object({ status: z.enum(statuses) }).strict().parse(request.body);
    const updated = await prisma.toolServiceRequest.updateMany({ where: { id }, data: { status } });
    if (!updated.count) return reply.code(404).send({ error: "Request not found." }); return { data: { id, status } };
  });
}
