import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";

import {
  flattenTemplatePages,
  normalizeDocumentTemplateDraft,
  templateSettingsSchema,
  type AdminDocumentTemplate,
  type DocumentTemplateSummary,
  type PublicDocumentTemplate,
} from "../../../src/lib/document-templates.js";
import { requireAdminSession } from "../../shared/auth/admin-session.js";
import { prisma } from "../../shared/database/prisma.js";

const idParamsSchema = z.object({ id: z.string().cuid() });
const slugParamsSchema = z.object({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
const slugAvailabilitySchema = z.object({ slug: z.string().trim().min(1).max(180), excludeId: z.string().cuid().optional() });
const revisionBodySchema = z.object({ expectedRevision: z.number().int().positive() }).strict();
const templateBodySchema = z.object({ template: z.unknown(), expectedRevision: z.number().int().positive().optional() }).strict();
const templateOrderBodySchema = z.object({ ids: z.array(z.string().cuid()).max(200) }).strict();

function asJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

const templateSummarySelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  settings: true,
  status: true,
  revision: true,
  publishedRevision: true,
  publishedAt: true,
  sortOrder: true,
  updatedAt: true,
} as const;

function toSummary(row: {
  id: string;
  slug: string;
  title: string;
  description: string;
  settings: unknown;
  status: string;
  revision: number;
  publishedRevision: number | null;
  publishedAt: Date | null;
  sortOrder: number;
  updatedAt: Date;
}): DocumentTemplateSummary {
  const settings = templateSettingsSchema.parse(row.settings);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    icon: settings.icon,
    paperSize: settings.paperSize,
    status: row.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    revision: row.revision,
    publishedRevision: row.publishedRevision,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toAdminTemplate(row: {
  id: string;
  slug: string;
  title: string;
  description: string;
  settings: unknown;
  fields: unknown;
  blocks: unknown;
  pages: unknown;
  status: string;
  revision: number;
  publishedRevision: number | null;
  publishedAt: Date | null;
  sortOrder: number;
  updatedAt: Date;
}): AdminDocumentTemplate {
  const draft = normalizeDocumentTemplateDraft({
    title: row.title,
    slug: row.slug,
    description: row.description,
    settings: row.settings,
    fields: row.fields,
    ...(row.pages === null || row.pages === undefined ? { blocks: row.blocks } : { pages: row.pages }),
  });
  return { ...toSummary(row), ...draft };
}

function toPublicTemplate(row: {
  slug: string;
  title: string;
  description: string;
  publishedSettings: unknown;
  publishedFields: unknown;
  publishedBlocks: unknown;
  publishedPages: unknown;
  publishedAt: Date | null;
}): PublicDocumentTemplate | null {
  if (!row.publishedAt || row.publishedSettings === null || row.publishedFields === null || row.publishedBlocks === null) return null;
  const published = normalizeDocumentTemplateDraft({
    title: row.title,
    slug: row.slug,
    description: row.description,
    settings: row.publishedSettings,
    fields: row.publishedFields,
    ...(row.publishedPages === null || row.publishedPages === undefined ? { blocks: row.publishedBlocks } : { pages: row.publishedPages }),
  });
  return { ...published, publishedAt: row.publishedAt.toISOString() };
}

function sendConflict(reply: FastifyReply, message: string) {
  return reply.code(409).send({ error: message });
}

async function findAdminTemplate(id: string) {
  return prisma.documentTemplate.findUnique({ where: { id } });
}

export async function templateRoutes(app: FastifyInstance) {
  app.get("/api/tools/templates", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    const rows = await prisma.documentTemplate.findMany({
      where: { status: "PUBLISHED" },
      select: templateSummarySelect,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { title: "asc" }],
    });
    return { data: rows.map(toSummary) };
  });

  app.get("/api/tools/templates/:slug", async (request, reply) => {
    const { slug } = slugParamsSchema.parse(request.params);
    const row = await prisma.documentTemplate.findUnique({ where: { slug } });
    const template = row && row.status === "PUBLISHED" ? toPublicTemplate(row) : null;
    if (!template) return reply.code(404).send({ error: "This document template is not published." });
    reply.header("Cache-Control", "no-store");
    return { data: template };
  });

  app.get("/api/admin/tools/templates", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    reply.header("Cache-Control", "no-store");
    // The editor list only needs metadata. Loading every draft's JSON page tree
    // here makes MySQL sort/fetch large values before the admin screen can open.
    const rows = await prisma.documentTemplate.findMany({
      select: templateSummarySelect,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { title: "asc" }],
    });
    return { data: rows.map(toSummary) };
  });

  app.put("/api/admin/tools/templates/order", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { ids } = templateOrderBodySchema.parse(request.body);
    const current = await prisma.documentTemplate.findMany({ select: { id: true } });
    const currentIds = new Set(current.map((template) => template.id));
    const nextIds = new Set(ids);
    if (ids.length !== current.length || nextIds.size !== ids.length || ids.some((id) => !currentIds.has(id))) {
      return reply.code(400).send({ error: "The template order is out of date. Reload the template list and try again." });
    }
    await prisma.$transaction(ids.map((id, sortOrder) => prisma.documentTemplate.update({ where: { id }, data: { sortOrder } })));
    const rows = await prisma.documentTemplate.findMany({
      select: templateSummarySelect,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { title: "asc" }],
    });
    return { data: rows.map(toSummary) };
  });

  app.get("/api/admin/tools/templates/slug-availability", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { slug, excludeId } = slugAvailabilitySchema.parse(request.query);
    const existing = await prisma.documentTemplate.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } });
    return { data: { slug, available: !existing } };
  });

  app.get("/api/admin/tools/templates/preview/:slug", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { slug } = slugParamsSchema.parse(request.params);
    const row = await prisma.documentTemplate.findUnique({ where: { slug } });
    if (!row) return reply.code(404).send({ error: "Template not found." });
    reply.header("Cache-Control", "no-store");
    return { data: toAdminTemplate(row) };
  });

  app.get("/api/admin/tools/templates/:id", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { id } = idParamsSchema.parse(request.params);
    const row = await findAdminTemplate(id);
    if (!row) return reply.code(404).send({ error: "Template not found." });
    reply.header("Cache-Control", "no-store");
    return { data: toAdminTemplate(row) };
  });

  app.post("/api/admin/tools/templates", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const template = normalizeDocumentTemplateDraft(request.body);
    const lastTemplate = await prisma.documentTemplate.findFirst({ select: { sortOrder: true }, orderBy: { sortOrder: "desc" } });
    try {
      const row = await prisma.documentTemplate.create({
        data: {
          title: template.title,
          slug: template.slug,
          description: template.description,
          settings: asJson(template.settings),
          fields: asJson(template.fields),
          blocks: asJson(flattenTemplatePages(template.pages)),
          pages: asJson(template.pages),
          sortOrder: (lastTemplate?.sortOrder ?? -1) + 1,
        },
      });
      return reply.code(201).send({ data: toAdminTemplate(row) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return sendConflict(reply, "A template with this slug already exists.");
      throw error;
    }
  });

  app.put("/api/admin/tools/templates/:id", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { id } = idParamsSchema.parse(request.params);
    const input = templateBodySchema.parse(request.body);
    if (input.expectedRevision === undefined) return sendConflict(reply, "Reload the template before saving it.");
    const template = normalizeDocumentTemplateDraft(input.template);

    let result;
    try {
      result = await prisma.documentTemplate.updateMany({
        where: { id, revision: input.expectedRevision },
        data: {
          title: template.title,
          slug: template.slug,
          description: template.description,
          settings: asJson(template.settings),
          fields: asJson(template.fields),
          blocks: asJson(flattenTemplatePages(template.pages)),
          pages: asJson(template.pages),
          revision: { increment: 1 },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return sendConflict(reply, "A template with this slug already exists.");
      throw error;
    }
    if (!result.count) return sendConflict(reply, "This template changed in another session. Reload before saving.");

    const row = await findAdminTemplate(id);
    if (!row) return reply.code(404).send({ error: "Template not found." });
    return { data: toAdminTemplate(row) };
  });

  app.delete("/api/admin/tools/templates/:id", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { id } = idParamsSchema.parse(request.params);
    try {
      await prisma.documentTemplate.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return reply.code(404).send({ error: "Template not found." });
      throw error;
    }
    return { data: { id } };
  });

  app.post("/api/admin/tools/templates/:id/publish", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { id } = idParamsSchema.parse(request.params);
    const { expectedRevision } = revisionBodySchema.parse(request.body);
    const current = await findAdminTemplate(id);
    if (!current) return reply.code(404).send({ error: "Template not found." });
    if (current.revision !== expectedRevision) return sendConflict(reply, "This template changed in another session. Reload before publishing.");
    const currentTemplate = normalizeDocumentTemplateDraft({
      title: current.title,
      slug: current.slug,
      description: current.description,
      settings: current.settings,
      fields: current.fields,
      ...(current.pages === null || current.pages === undefined ? { blocks: current.blocks } : { pages: current.pages }),
    });

    const nextRevision = current.revision + 1;
    const result = await prisma.documentTemplate.updateMany({
      where: { id, revision: expectedRevision },
      data: {
        settings: asJson(currentTemplate.settings),
        fields: asJson(currentTemplate.fields),
        blocks: asJson(flattenTemplatePages(currentTemplate.pages)),
        pages: asJson(currentTemplate.pages),
        publishedSettings: asJson(currentTemplate.settings),
        publishedFields: asJson(currentTemplate.fields),
        publishedBlocks: asJson(flattenTemplatePages(currentTemplate.pages)),
        publishedPages: asJson(currentTemplate.pages),
        status: "PUBLISHED",
        publishedRevision: nextRevision,
        publishedAt: new Date(),
        revision: nextRevision,
      },
    });
    if (!result.count) return sendConflict(reply, "This template changed in another session. Reload before publishing.");

    const row = await findAdminTemplate(id);
    if (!row) return reply.code(404).send({ error: "Template not found." });
    return { data: toAdminTemplate(row) };
  });

  app.post("/api/admin/tools/templates/:id/unpublish", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { id } = idParamsSchema.parse(request.params);
    const { expectedRevision } = revisionBodySchema.parse(request.body);
    const result = await prisma.documentTemplate.updateMany({ where: { id, revision: expectedRevision }, data: { status: "DRAFT", revision: { increment: 1 } } });
    if (!result.count) return sendConflict(reply, "This template changed in another session. Reload before unpublishing.");
    const row = await findAdminTemplate(id);
    if (!row) return reply.code(404).send({ error: "Template not found." });
    return { data: toAdminTemplate(row) };
  });
}
