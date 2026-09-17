import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { requireAdminSession } from "../../../../shared/auth/admin-session.js";
import {
  MAX_BLOG_IMAGE_BYTES,
  MEDIA_ASSET_CACHE_CONTROL,
  MEDIA_REDIRECT_CACHE_CONTROL,
  getStoredObject,
  isSupportedBlogImageType,
  signStoredObject,
  type ImageUpload,
} from "../../../../shared/storage/object-storage.js";
import {
  MediaConflictError,
  MediaInUseError,
  MediaInputError,
  MediaNotFoundError,
} from "../../domain/media.js";
import { MediaService } from "../../application/media.service.js";

const idSchema = z.object({ id: z.string().trim().min(1).max(191) });
const blankToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;
const optionalText = (max: number) =>
  z.preprocess(blankToNull, z.string().trim().max(max).nullable().optional());

type ParsedMediaUpload = {
  folderId: string;
  image: ImageUpload;
  originalName: string;
  displayName?: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
};

async function readMediaUpload(
  request: FastifyRequest,
): Promise<ParsedMediaUpload> {
  if (!request.isMultipart())
    throw new MediaInputError("Choose an image to upload.");

  let image: ImageUpload | undefined;
  let folderId = "";
  let originalName = "";
  let displayName: string | undefined;
  let width: number | undefined;
  let height: number | undefined;
  let altText: string | undefined;
  let caption: string | undefined;

  for await (const part of request.parts()) {
    if (part.type === "file") {
      if (part.fieldname !== "image") continue;
      const body = await part.toBuffer();
      if (!isSupportedBlogImageType(part.mimetype))
        throw new MediaInputError("Use a JPG, PNG or WebP image.");
      if (!body.byteLength)
        throw new MediaInputError("The selected image is empty.");
      if (body.byteLength > MAX_BLOG_IMAGE_BYTES)
        throw new MediaInputError("The image must be 5 MB or smaller.");
      image = { body, contentType: part.mimetype };
      originalName = part.filename || "uploaded-image";
      continue;
    }

    if (part.fieldname === "folderId") folderId = String(part.value).trim();
    if (part.fieldname === "displayName")
      displayName = String(part.value).trim();
    if (part.fieldname === "width") width = Number(part.value) || undefined;
    if (part.fieldname === "height") height = Number(part.value) || undefined;
    if (part.fieldname === "altText") altText = String(part.value).trim();
    if (part.fieldname === "caption") caption = String(part.value).trim();
  }

  if (!folderId) throw new MediaInputError("Choose a destination folder.");
  if (!image) throw new MediaInputError("Choose an image to upload.");
  return {
    folderId,
    image,
    originalName,
    displayName,
    width,
    height,
    altText,
    caption,
  };
}

function sendKnownError(error: unknown, reply: FastifyReply) {
  if (
    error instanceof MediaConflictError ||
    error instanceof MediaInUseError ||
    error instanceof MediaInputError ||
    error instanceof MediaNotFoundError
  ) {
    return reply.code(error.statusCode).send({ error: error.message });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return reply.code(409).send({ error: "That media item already exists." });
    if (error.code === "P2025")
      return reply.code(404).send({ error: "Media was not found." });
  }
  if (error instanceof z.ZodError)
    return reply
      .code(400)
      .send({ error: error.issues[0]?.message ?? "Check the media details." });
  throw error;
}

export function mediaRoutes(
  app: FastifyInstance,
  options: { service: MediaService },
) {
  app.get("/api/media/:id", async (request, reply) => {
    try {
      const { id } = idSchema.parse(request.params);
      const asset = await options.service.getAsset(id);

      try {
        const stored = await getStoredObject(asset.objectKey);
        if (stored) {
          const etag =
            '"' +
            createHash("sha1")
              .update(asset.objectKey)
              .digest("hex")
              .slice(0, 24) +
            '"';
          reply.header("Cache-Control", MEDIA_ASSET_CACHE_CONTROL);
          reply.header("Content-Type", stored.contentType);
          reply.header("ETag", etag);
          if (stored.contentLength !== undefined)
            reply.header("Content-Length", String(stored.contentLength));
          if (
            (
              request.headers["if-none-match"]
                ?.split(",")
                .map((value) => value.trim()) ?? []
            ).includes(etag)
          ) {
            return reply.code(304).send();
          }
          return reply.send(stored.body);
        }
      } catch (streamError) {
        console.warn(
          `Direct streaming for media asset ${id} failed, falling back to signed URL:`,
          streamError,
        );
      }

      const signedUrl = await options.service.getSignedAssetUrl(id);
      if (signedUrl) {
        reply.header("Cache-Control", MEDIA_REDIRECT_CACHE_CONTROL);
        return reply.code(302).redirect(signedUrl);
      }

      return reply.code(404).send({ error: "Media was not found." });
    } catch (error) {
      return sendKnownError(error, reply);
    }
  });

  app.get("/api/admin/media", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    try {
      const input = z
        .object({
          folderId: z.preprocess(
            blankToNull,
            z.string().trim().min(1).max(191).nullable().optional(),
          ),
        })
        .parse(request.query);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.list(input.folderId ?? null) };
    } catch (error) {
      return sendKnownError(error, reply);
    }
  });

  app.post("/api/admin/media/folders", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    try {
      const input = z
        .object({
          name: z.string().trim().min(1).max(120),
          parentId: z.preprocess(
            blankToNull,
            z.string().trim().min(1).max(191).nullable().optional(),
          ),
        })
        .strict()
        .parse(request.body);
      reply.header("Cache-Control", "no-store");
      return reply
        .code(201)
        .send({
          data: await options.service.createFolder(
            input.name,
            input.parentId ?? null,
          ),
        });
    } catch (error) {
      return sendKnownError(error, reply);
    }
  });

  app.post("/api/admin/media/assets", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    try {
      const input = await readMediaUpload(request);
      const asset = await options.service.uploadAsset(input);
      reply.header("Cache-Control", "no-store");
      return reply.code(201).send({ data: asset });
    } catch (error) {
      return sendKnownError(error, reply);
    }
  });

  app.get("/api/admin/media/assets/:id", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    try {
      const { id } = idSchema.parse(request.params);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.getAssetResponse(id) };
    } catch (error) {
      return sendKnownError(error, reply);
    }
  });

  app.patch("/api/admin/media/assets/:id", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    try {
      const { id } = idSchema.parse(request.params);
      const input = z
        .object({
          displayName: optionalText(255),
          altText: optionalText(240),
          caption: optionalText(300),
          folderId: optionalText(191),
        })
        .strict()
        .parse(request.body);
      const asset = await options.service.updateAsset(id, {
        ...(input.displayName === undefined
          ? {}
          : { displayName: input.displayName ?? undefined }),
        ...(input.altText === undefined
          ? {}
          : { altText: input.altText ?? undefined }),
        ...(input.caption === undefined
          ? {}
          : { caption: input.caption ?? undefined }),
        ...(input.folderId === undefined
          ? {}
          : { folderId: input.folderId ?? undefined }),
      });
      reply.header("Cache-Control", "no-store");
      return { data: asset };
    } catch (error) {
      return sendKnownError(error, reply);
    }
  });

  app.delete("/api/admin/media/assets/:id", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    try {
      const { id } = idSchema.parse(request.params);
      reply.header("Cache-Control", "no-store");
      return { data: await options.service.deleteAsset(id) };
    } catch (error) {
      return sendKnownError(error, reply);
    }
  });
}
