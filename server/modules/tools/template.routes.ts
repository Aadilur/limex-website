import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";

import {
  documentTemplateDraftSchema,
  templateSettingsSchema,
  type AdminDocumentTemplate,
  type DocumentTemplateSummary,
  type PublicDocumentTemplate,
} from "../../../src/lib/document-templates.js";
import { requireAdminSession } from "../../shared/auth/admin-session.js";
import { prisma } from "../../shared/database/prisma.js";

const idParamsSchema = z.object({ id: z.string().cuid() });
const slugParamsSchema = z.object({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
const revisionBodySchema = z.object({ expectedRevision: z.number().int().positive() }).strict();
const templateBodySchema = z.object({ template: documentTemplateDraftSchema, expectedRevision: z.number().int().positive().optional() }).strict();

function asJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

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
  updatedAt: Date;
}): DocumentTemplateSummary {
  const settings = templateSettingsSchema.parse(row.settings);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    paperSize: settings.paperSize,
    status: row.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    revision: row.revision,
    publishedRevision: row.publishedRevision,
    publishedAt: row.publishedAt?.toISOString() ?? null,
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
  status: string;
  revision: number;
  publishedRevision: number | null;
  publishedAt: Date | null;
  updatedAt: Date;
}): AdminDocumentTemplate {
  const draft = documentTemplateDraftSchema.parse({
    title: row.title,
    slug: row.slug,
    description: row.description,
    settings: row.settings,
    fields: row.fields,
    blocks: row.blocks,
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
  publishedAt: Date | null;
}): PublicDocumentTemplate | null {
  if (!row.publishedAt || row.publishedSettings === null || row.publishedFields === null || row.publishedBlocks === null) return null;
  const published = documentTemplateDraftSchema.parse({
    title: row.title,
    slug: row.slug,
    description: row.description,
    settings: row.publishedSettings,
    fields: row.publishedFields,
    blocks: row.publishedBlocks,
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
    const rows = await prisma.documentTemplate.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ publishedAt: "desc" }, { title: "asc" }] });
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
    const rows = await prisma.documentTemplate.findMany({ orderBy: { updatedAt: "desc" } });
    return { data: rows.map(toAdminTemplate) };
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
    const template = documentTemplateDraftSchema.parse(request.body);
    try {
      const row = await prisma.documentTemplate.create({
        data: {
          title: template.title,
          slug: template.slug,
          description: template.description,
          settings: asJson(template.settings),
          fields: asJson(template.fields),
          blocks: asJson(template.blocks),
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

    let result;
    try {
      result = await prisma.documentTemplate.updateMany({
        where: { id, revision: input.expectedRevision },
        data: {
          title: input.template.title,
          slug: input.template.slug,
          description: input.template.description,
          settings: asJson(input.template.settings),
          fields: asJson(input.template.fields),
          blocks: asJson(input.template.blocks),
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

  app.post("/api/admin/tools/templates/:id/publish", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const { id } = idParamsSchema.parse(request.params);
    const { expectedRevision } = revisionBodySchema.parse(request.body);
    const current = await findAdminTemplate(id);
    if (!current) return reply.code(404).send({ error: "Template not found." });
    if (current.revision !== expectedRevision) return sendConflict(reply, "This template changed in another session. Reload before publishing.");

    const nextRevision = current.revision + 1;
    const result = await prisma.documentTemplate.updateMany({
      where: { id, revision: expectedRevision },
      data: {
        publishedSettings: asJson(current.settings),
        publishedFields: asJson(current.fields),
        publishedBlocks: asJson(current.blocks),
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
