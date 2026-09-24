import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import {
  AboutService,
  InvalidAboutReelOrderError,
  AboutReelNotFoundError,
  AboutTeamMemberNotFoundError,
  InvalidYouTubeUrlError,
} from "../../application/about.service.js";
import {
  MAX_TEAM_IMAGE_BYTES,
  MEDIA_REDIRECT_CACHE_CONTROL,
  getStoredObject,
  isSupportedTeamImageType,
  signStoredObject,
  type ImageUpload,
} from "../../../../shared/storage/object-storage.js";
import { requireAdminSession } from "../../../../shared/auth/admin-session.js";
import { getYouTubeVideoId } from "../../domain/youtube.js";

const idParamsSchema = z.object({ id: z.string().trim().min(1) });
const booleanField = z.preprocess(
  (value) => value === "true" ? true : value === "false" ? false : value,
  z.boolean(),
);

const memberFields = z.object({
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(2000),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: booleanField.default(true),
});

const createMemberSchema = memberFields;
const updateMemberSchema = memberFields
  .partial()
  .extend({ removeImage: booleanField.optional() })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

const optionalReelTitle = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().max(160).nullable().optional(),
);

const reelFields = z.object({
  youtubeUrl: z.string().trim().url().refine((value) => Boolean(getYouTubeVideoId(value)), "Paste a valid YouTube video link."),
  title: optionalReelTitle,
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isVisible: booleanField.default(true),
});

const createReelSchema = reelFields;
const updateReelSchema = reelFields
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");
const reelOrderSchema = z.object({
  ids: z.array(z.string().trim().min(1)).max(100).refine(
    (ids) => new Set(ids).size === ids.length,
    "Reel IDs must be unique.",
  ),
});

class InvalidTeamImageError extends Error {
  public readonly statusCode = 400;

  public constructor(message: string) {
    super(message);
    this.name = "InvalidTeamImageError";
  }
}

type ParsedRequest = {
  fields: Record<string, unknown>;
  image?: ImageUpload;
};

async function readRequest(request: FastifyRequest): Promise<ParsedRequest> {
  if (!request.isMultipart()) {
    return {
      fields: (request.body ?? {}) as Record<string, unknown>,
    };
  }

  const fields: Record<string, unknown> = {};
  let image: ImageUpload | undefined;

  for await (const part of request.parts()) {
    if (part.type === "file") {
      const body = await part.toBuffer();
      if (!body.byteLength) continue;
      if (part.fieldname !== "image") continue;
      if (!isSupportedTeamImageType(part.mimetype)) {
        throw new InvalidTeamImageError("Use a JPG, PNG or WebP image.");
      }
      if (body.byteLength > MAX_TEAM_IMAGE_BYTES) {
        throw new InvalidTeamImageError("The image must be 5 MB or smaller.");
      }
      image = { body, contentType: part.mimetype };
      continue;
    }

    fields[part.fieldname] = part.value;
  }

  return { fields, image };
}

type AboutRoutesOptions = {
  service: AboutService;
};

function sendKnownAboutError(error: unknown, reply: FastifyReply) {
  if (error instanceof InvalidYouTubeUrlError) {
    return reply.code(400).send({ error: error.message });
  }

  if (error instanceof InvalidAboutReelOrderError) {
    return reply.code(400).send({ error: error.message });
  }

  if (error instanceof AboutTeamMemberNotFoundError || error instanceof AboutReelNotFoundError) {
    return reply.code(404).send({ error: error.message });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return reply.code(404).send({ error: "The requested About record was not found." });
  }

  throw error;
}

async function ensureAdmin(request: FastifyRequest, reply: FastifyReply) {
  return requireAdminSession(request, reply);
}

export async function aboutRoutes(app: FastifyInstance, options: AboutRoutesOptions) {
  app.get("/api/about/team/:id/image", async (request, reply) => {
    try {
      const { id } = idParamsSchema.parse(request.params);
      const imageKey = await options.service.getTeamImageKey(id);
      if (!imageKey) return reply.code(404).send({ error: "Profile image not found." });
      const signedUrl = await signStoredObject(imageKey);
      if (signedUrl) {
        reply.header("Cache-Control", MEDIA_REDIRECT_CACHE_CONTROL);
        return reply.code(302).redirect(signedUrl);
      }
      const stored = await getStoredObject(imageKey);
      if (!stored) return reply.code(404).send({ error: "Profile image not found." });
      reply.header("Cache-Control", "private, no-store");
      reply.header("Content-Type", stored.contentType);
      if (stored.contentLength !== undefined) reply.header("Content-Length", String(stored.contentLength));
      return reply.send(stored.body);
    } catch (error) {
      return sendKnownAboutError(error, reply);
    }
  });

  app.get("/api/about/team", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    return { data: await options.service.getPublicTeam() };
  });

  app.get("/api/admin/about/team", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    reply.header("Cache-Control", "no-store");
    return { data: await options.service.getAdminTeam() };
  });

  app.post("/api/admin/about/team", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    try {
      const { fields, image } = await readRequest(request);
      await options.service.createTeamMember(createMemberSchema.parse(fields), image);
      reply.header("Cache-Control", "no-store");
      return reply.code(201).send({ data: await options.service.getAdminTeam() });
    } catch (error) {
      return sendKnownAboutError(error, reply);
    }
  });

  app.put("/api/admin/about/team/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    try {
      const { id } = idParamsSchema.parse(request.params);
      const { fields, image } = await readRequest(request);
      const { removeImage, ...input } = updateMemberSchema.parse(fields);
      await options.service.updateTeamMember(id, input, image, removeImage ?? false);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.getAdminTeam() };
    } catch (error) {
      return sendKnownAboutError(error, reply);
    }
  });

  app.delete("/api/admin/about/team/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.deleteTeamMember(id);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.getAdminTeam() };
    } catch (error) {
      return sendKnownAboutError(error, reply);
    }
  });

  app.get("/api/about/reels", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    return { data: await options.service.getPublicReels() };
  });

  app.get("/api/admin/about/reels", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    reply.header("Cache-Control", "no-store");
    return { data: await options.service.getAdminReels() };
  });

  app.post("/api/admin/about/reels", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    try {
      await options.service.createReel(createReelSchema.parse(request.body));
      reply.header("Cache-Control", "no-store");
      return reply.code(201).send({ data: await options.service.getAdminReels() });
    } catch (error) {
      return sendKnownAboutError(error, reply);
    }
  });

  app.put("/api/admin/about/reels/order", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    try {
      const { ids } = reelOrderSchema.parse(request.body);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.reorderReels(ids) };
    } catch (error) {
      return sendKnownAboutError(error, reply);
    }
  });

  app.put("/api/admin/about/reels/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.updateReel(id, updateReelSchema.parse(request.body));
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.getAdminReels() };
    } catch (error) {
      return sendKnownAboutError(error, reply);
    }
  });

  app.delete("/api/admin/about/reels/:id", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    try {
      const { id } = idParamsSchema.parse(request.params);
      await options.service.deleteReel(id);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.getAdminReels() };
    } catch (error) {
      return sendKnownAboutError(error, reply);
    }
  });
}
