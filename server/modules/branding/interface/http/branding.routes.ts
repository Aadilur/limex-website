import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createHash } from "node:crypto";
import { z } from "zod";

import { requireAdminSession } from "../../../../shared/auth/admin-session.js";
import {
  createBrandLogoAsset,
  createBrandLogoKey,
  getStoredObject,
  isSupportedBrandLogoType,
  signStoredObject,
  uploadStoredObject,
  LANDING_LOGO_CACHE_CONTROL,
  MEDIA_REDIRECT_CACHE_CONTROL,
  type BrandLogoUpload,
} from "../../../../shared/storage/object-storage.js";
import type { BrandingService } from "../../application/branding.service.js";

const MAX_BRAND_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB

class InvalidBrandLogoError extends Error {
  public readonly statusCode = 400;
  public constructor(message: string) {
    super(message);
    this.name = "InvalidBrandLogoError";
  }
}

async function readBrandLogo(
  request: FastifyRequest,
): Promise<BrandLogoUpload> {
  if (!request.isMultipart())
    throw new InvalidBrandLogoError("Choose a logo image to upload.");

  let image: BrandLogoUpload | undefined;
  for await (const part of request.parts()) {
    if (part.type !== "file") continue;
    const body = await part.toBuffer();
    if (part.fieldname !== "image") continue;
    if (!isSupportedBrandLogoType(part.mimetype)) {
      throw new InvalidBrandLogoError("Use an SVG, PNG, WebP, or JPG image.");
    }
    if (!body.byteLength)
      throw new InvalidBrandLogoError("The selected image is empty.");
    if (body.byteLength > MAX_BRAND_LOGO_BYTES) {
      throw new InvalidBrandLogoError("The logo must be 5 MB or smaller.");
    }
    image = { body, contentType: part.mimetype };
  }

  if (!image) throw new InvalidBrandLogoError("Choose a logo image to upload.");
  return image;
}

const brandLogoAssetSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}\.(jpg|png|webp|svg)$/i);

export async function brandingRoutes(
  app: FastifyInstance,
  options: { service: BrandingService },
) {
  // Public cached branding endpoint
  app.get("/api/branding", async (_request, reply) => {
    reply.header(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    const branding = await options.service.getPublicBranding();
    return { data: branding };
  });

  // Public brand logo asset serving
  app.get("/api/branding/logos/:asset", async (request, reply) => {
    const parsed = brandLogoAssetSchema.safeParse(
      (request.params as { asset?: unknown }).asset,
    );
    if (!parsed.success)
      return reply.code(404).send({ error: "Logo not found." });

    const asset = parsed.data;
    const key = createBrandLogoKey(asset);

    const signedUrl = await signStoredObject(key);
    if (signedUrl) {
      reply.header("Cache-Control", MEDIA_REDIRECT_CACHE_CONTROL);
      return reply.code(302).redirect(signedUrl);
    }

    const stored = await getStoredObject(key);
    if (!stored) return reply.code(404).send({ error: "Logo not found." });

    const hash = asset.slice(0, asset.lastIndexOf("."));
    const etag = `"${hash}"`;
    reply.header("Cache-Control", LANDING_LOGO_CACHE_CONTROL);
    reply.header("Content-Type", stored.contentType);
    reply.header("ETag", etag);
    if (stored.contentLength !== undefined)
      reply.header("Content-Length", String(stored.contentLength));

    const requestEtags =
      request.headers["if-none-match"]
        ?.split(",")
        .map((value) => value.trim()) ?? [];
    if (requestEtags.includes(etag)) return reply.code(304).send();

    return reply.send(stored.body);
  });

  // Admin get branding
  app.get("/api/admin/branding", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    reply.header("Cache-Control", "no-store");
    const branding = await options.service.getAdminBranding();
    return { data: branding };
  });

  // Admin save branding
  app.put("/api/admin/branding", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    try {
      reply.header("Cache-Control", "no-store");
      const branding = await options.service.saveBranding(request.body);
      return { data: branding };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return reply
          .code(400)
          .send({ error: err.issues[0]?.message || "Invalid input." });
      }
      throw err;
    }
  });

  // Admin upload logo
  app.post("/api/admin/branding/logo", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    try {
      const image = await readBrandLogo(request);
      const hash = createHash("sha256").update(image.body).digest("hex");
      const asset = createBrandLogoAsset(hash, image.contentType as any);
      await uploadStoredObject(createBrandLogoKey(asset), image, {
        cacheControl: LANDING_LOGO_CACHE_CONTROL,
      });

      reply.header("Cache-Control", "no-store");
      return reply.code(201).send({
        data: {
          asset,
          url: `/api/branding/logos/${asset}`,
          bytes: image.body.byteLength,
          contentType: image.contentType,
        },
      });
    } catch (err: any) {
      if (err instanceof InvalidBrandLogoError) {
        return reply.code(err.statusCode).send({ error: err.message });
      }
      throw err;
    }
  });
}
