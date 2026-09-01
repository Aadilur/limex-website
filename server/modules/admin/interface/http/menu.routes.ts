import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import type { MenuService } from "../../application/menu.service.js";
import { requireAdminSession } from "../../../../shared/auth/admin-session.js";

const idParamsSchema = z.object({ id: z.string().trim().min(1) });

const iconSchema = z.enum([
  "building",
  "license",
  "receipt-tax",
  "tax",
  "file-upload",
  "file-download",
  "users-group",
  "factory",
  "shield-check",
  "certificate-2",
  "leaf",
  "plane",
  "world",
  "file-check",
  "package",
  "trademark",
  "copyright",
  "lightbulb",
  "report-money",
  "contract",
  "calculator",
  "language",
  "checklist",
  "briefcase",
]);

const sectionFields = z.object({
  key: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(500),
  menuEyebrow: z.string().trim().max(150).optional().default(""),
  menuTitle: z.string().trim().max(200).optional().default(""),
  menuDescription: z.string().trim().max(500).optional().default(""),
  spotlightBadge: z.string().trim().max(100).optional().default(""),
  spotlightTitle: z.string().trim().max(200).optional().default(""),
  spotlightDescription: z.string().trim().max(500).optional().default(""),
  spotlightCtaLabel: z.string().trim().max(100).optional().default(""),
  spotlightCtaHref: z.string().trim().max(500).optional().default(""),
  tone: z.enum(["green", "violet", "teal", "orange"]).default("green"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: z.boolean().default(true),
});

const groupFields = z.object({
  key: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(100),
  railLabel: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(""),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: z.boolean().default(true),
});

const itemFields = z.object({
  label: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).default(""),
  href: z.string().trim().min(1).max(500),
  marker: z.string().trim().min(1).max(20),
  icon: iconSchema.default("briefcase"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: z.boolean().default(true),
});

const linkFields = z.object({
  label: z.string().trim().min(1).max(200),
  href: z.string().trim().min(1).max(500),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: z.boolean().default(true),
});

const createSectionSchema = sectionFields;
const updateSectionSchema = sectionFields.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required.");
const createGroupSchema = groupFields.extend({ sectionId: z.string().trim().min(1) });
const updateGroupSchema = groupFields.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required.");
const createItemSchema = itemFields.extend({ groupId: z.string().trim().min(1) });
const updateItemSchema = itemFields.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required.");
const createLinkSchema = linkFields.extend({ itemId: z.string().trim().min(1) });
const updateLinkSchema = linkFields.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required.");

type MenuRoutesOptions = {
  service: MenuService;
};

function sendKnownMenuError(error: unknown, reply: FastifyReply) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return reply.code(409).send({ error: "A menu item with those details already exists." });
    if (error.code === "P2025") return reply.code(404).send({ error: "The requested menu record was not found." });
  }

  throw error;
}

async function ensureAdmin(request: FastifyRequest, reply: FastifyReply) {
  return requireAdminSession(request, reply);
}

export async function adminMenuRoutes(app: FastifyInstance, options: MenuRoutesOptions) {
  app.get("/api/admin/menu", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    return { data: await options.service.getMenu() };
  });

  app.post("/api/admin/menu/sections", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      await options.service.createSection(createSectionSchema.parse(request.body));
      return reply.code(201).send({ data: await options.service.getMenu() });
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.put("/api/admin/menu/sections/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.updateSection(id, updateSectionSchema.parse(request.body));
      return { data: await options.service.getMenu() };
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.delete("/api/admin/menu/sections/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.deleteSection(id);
      return { data: await options.service.getMenu() };
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.post("/api/admin/menu/groups", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      await options.service.createGroup(createGroupSchema.parse(request.body));
      return reply.code(201).send({ data: await options.service.getMenu() });
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.put("/api/admin/menu/groups/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.updateGroup(id, updateGroupSchema.parse(request.body));
      return { data: await options.service.getMenu() };
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.delete("/api/admin/menu/groups/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.deleteGroup(id);
      return { data: await options.service.getMenu() };
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.post("/api/admin/menu/items", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      await options.service.createItem(createItemSchema.parse(request.body));
      return reply.code(201).send({ data: await options.service.getMenu() });
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.put("/api/admin/menu/items/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.updateItem(id, updateItemSchema.parse(request.body));
      return { data: await options.service.getMenu() };
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.delete("/api/admin/menu/items/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.deleteItem(id);
      return { data: await options.service.getMenu() };
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.post("/api/admin/menu/links", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      await options.service.createLink(createLinkSchema.parse(request.body));
      return reply.code(201).send({ data: await options.service.getMenu() });
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.put("/api/admin/menu/links/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.updateLink(id, updateLinkSchema.parse(request.body));
      return { data: await options.service.getMenu() };
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });

  app.delete("/api/admin/menu/links/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.deleteLink(id);
      return { data: await options.service.getMenu() };
    } catch (error) {
      return sendKnownMenuError(error, reply);
    }
  });
}
