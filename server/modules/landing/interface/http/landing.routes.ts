import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createHash } from "node:crypto";
import { z } from "zod";

import { requireAdminSession } from "../../../../shared/auth/admin-session.js";
import {
  createLandingLogoAsset,
  createLandingLogoKey,
  getStoredObject,
  isSupportedLandingLogoType,
  LANDING_LOGO_CACHE_CONTROL,
  MEDIA_REDIRECT_CACHE_CONTROL,
  MAX_LANDING_LOGO_BYTES,
  signStoredObject,
  uploadStoredObject,
  type ImageUpload,
} from "../../../../shared/storage/object-storage.js";
import { getYouTubeVideoId } from "../../../about/domain/youtube.js";
import {
  LandingConflictError,
  LandingSafetyError,
  LandingService,
} from "../../application/landing.service.js";
import {
  landingSectionKeys,
  type LandingSectionKey,
} from "../../domain/landing.js";

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

const filterSchema = z.enum([
  "Startup",
  "Tax & compliance",
  "Trademark",
  "Business tools",
]);
const nonEmptyText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().max(max).default("");
const hrefSchema = z.string().trim().min(1).max(1000);
const visibleSchema = z.boolean().default(true);
const youtubeUrlSchema = optionalText(1000).refine(
  (value) => !value || Boolean(getYouTubeVideoId(value)),
  "Use a valid YouTube link or leave it blank.",
);

const serviceItemSchema = z.object({
  id: nonEmptyText(120),
  isVisible: visibleSchema,
  serviceKey: nonEmptyText(180),
  title: nonEmptyText(180),
  description: optionalText(500),
  href: hrefSchema,
  icon: iconSchema.default("briefcase"),
  filter: filterSchema,
});

const heroSchema = z.object({
  eyebrow: nonEmptyText(300),
  mobileEyebrow: nonEmptyText(150),
  titlePrimary: nonEmptyText(160),
  titleSecondary: nonEmptyText(160),
  animatedWords: z.array(nonEmptyText(80)).max(10).optional().default([]),
  description: nonEmptyText(500),
  primaryCtaLabel: nonEmptyText(100),
  primaryCtaHref: hrefSchema,
  secondaryCtaLabel: nonEmptyText(100),
  secondaryCtaHref: hrefSchema,
  featuredServices: z.array(serviceItemSchema).max(8),
});

const clientsSchema = z.object({
  title: nonEmptyText(100),
  logos: z
    .array(
      z.object({
        id: nonEmptyText(120),
        isVisible: visibleSchema,
        name: nonEmptyText(120),
        logoUrl: optionalText(1000),
        textColor: nonEmptyText(40),
      }),
    )
    .max(30),
});

const metricsSchema = z.object({
  title: nonEmptyText(120),
  items: z
    .array(
      z.object({
        id: nonEmptyText(120),
        isVisible: visibleSchema,
        value: nonEmptyText(80),
        label: nonEmptyText(120),
      }),
    )
    .max(12),
});

const servicesSchema = z.object({
  title: nonEmptyText(160),
  description: nonEmptyText(500),
  ctaLabel: nonEmptyText(100),
  ctaHref: hrefSchema,
  items: z.array(serviceItemSchema).max(24),
});

const processStepSchema = z.object({
  id: nonEmptyText(120),
  isVisible: visibleSchema,
  number: nonEmptyText(20),
  title: nonEmptyText(160),
  description: optionalText(500),
});

const processSchema = z.object({
  title: nonEmptyText(160),
  description: nonEmptyText(500),
  helperEyebrow: nonEmptyText(120),
  helperTitle: nonEmptyText(160),
  helperDescription: nonEmptyText(500),
  helperCtaLabel: nonEmptyText(100),
  helperCtaHref: hrefSchema,
  items: z.array(processStepSchema).max(12),
});

const testimonialsSchema = z.object({
  title: nonEmptyText(160),
  description: nonEmptyText(500),
  items: z
    .array(
      z.object({
        id: nonEmptyText(120),
        isVisible: visibleSchema,
        imageUrl: optionalText(1000),
        title: nonEmptyText(240),
        subtitle: nonEmptyText(240),
        youtubeUrl: youtubeUrlSchema,
      }),
    )
    .max(20),
});

const packagesSchema = z.object({
  title: nonEmptyText(160),
  description: nonEmptyText(500),
  customPlanLabel: nonEmptyText(160),
  customPlanCtaLabel: nonEmptyText(100),
  customPlanCtaHref: hrefSchema,
  items: z
    .array(
      z.object({
        id: nonEmptyText(120),
        isVisible: visibleSchema,
        tag: nonEmptyText(100),
        title: nonEmptyText(160),
        description: nonEmptyText(300),
        price: nonEmptyText(120),
        features: z.array(nonEmptyText(180)).max(12),
        color: nonEmptyText(40),
        surface: nonEmptyText(40),
        href: hrefSchema,
        action: nonEmptyText(100),
        isFeatured: z.boolean().default(false),
      }),
    )
    .max(12),
});

const toolsSchema = z.object({
  title: nonEmptyText(160),
  description: nonEmptyText(500),
  ctaLabel: nonEmptyText(100),
  ctaHref: hrefSchema,
  items: z
    .array(
      z.object({
        id: nonEmptyText(120),
        isVisible: visibleSchema,
        mark: nonEmptyText(40),
        tag: nonEmptyText(100),
        title: nonEmptyText(160),
        description: nonEmptyText(500),
        rows: z
          .array(
            z.object({
              id: nonEmptyText(120),
              label: nonEmptyText(120),
              value: nonEmptyText(160),
            }),
          )
          .max(8),
        action: nonEmptyText(100),
        href: hrefSchema,
        color: nonEmptyText(40),
        surface: nonEmptyText(40),
      }),
    )
    .max(24),
});

const articlesSchema = z.object({
  title: nonEmptyText(160),
  description: nonEmptyText(500),
  ctaLabel: nonEmptyText(100),
  ctaHref: hrefSchema,
  items: z
    .array(
      z.object({
        id: nonEmptyText(160),
        isVisible: visibleSchema,
        slug: nonEmptyText(180),
        category: nonEmptyText(100),
        date: nonEmptyText(80),
        readTime: nonEmptyText(80),
        title: nonEmptyText(240),
        subtitle: nonEmptyText(500),
        coverTone: z.enum(["mint", "violet", "peach"]),
        coverNumber: nonEmptyText(20),
        media: z.enum(["image", "video"]),
        href: hrefSchema,
      }),
    )
    .max(20),
});

const faqSchema = z.object({
  title: nonEmptyText(160),
  description: nonEmptyText(500),
  ctaLabel: nonEmptyText(100),
  ctaHref: hrefSchema,
  items: z
    .array(
      z.object({
        id: nonEmptyText(120),
        isVisible: visibleSchema,
        question: nonEmptyText(300),
        answer: nonEmptyText(1200),
      }),
    )
    .max(30),
});

const contactSchema = z.object({
  title: nonEmptyText(200),
  description: nonEmptyText(500),
  startEyebrow: nonEmptyText(120),
  startDescription: nonEmptyText(300),
  directLineLabel: nonEmptyText(160),
  directCtaLabel: nonEmptyText(100),
  whatsapp: nonEmptyText(100),
  email: nonEmptyText(200),
  formEyebrow: nonEmptyText(120),
  formTitle: nonEmptyText(160),
  formDescription: nonEmptyText(500),
  serviceHelper: nonEmptyText(300),
  contactMethodHelper: nonEmptyText(300),
  scheduleHelper: nonEmptyText(300),
  privacyNote: nonEmptyText(200),
  submitLabel: nonEmptyText(100),
  submittedNote: nonEmptyText(300),
});

const footerLinkSchema = z.object({
  id: nonEmptyText(120),
  isVisible: visibleSchema,
  label: nonEmptyText(160),
  href: hrefSchema,
});

const footerSchema = z.object({
  tagline: nonEmptyText(300),
  ctaLabel: nonEmptyText(100),
  ctaHref: hrefSchema,
  title: nonEmptyText(240),
  columns: z
    .array(
      z.object({
        id: nonEmptyText(120),
        isVisible: visibleSchema,
        title: nonEmptyText(120),
        links: z.array(footerLinkSchema).max(20),
      }),
    )
    .max(12),
  contactTitle: nonEmptyText(120),
  contactEmail: nonEmptyText(200),
  contactPhone: nonEmptyText(100),
  location: nonEmptyText(200),
  copyright: nonEmptyText(200),
  legalLinks: z.array(footerLinkSchema).max(10),
});

const sectionSchemas = {
  hero: heroSchema,
  clients: clientsSchema,
  metrics: metricsSchema,
  services: servicesSchema,
  process: processSchema,
  testimonials: testimonialsSchema,
  packages: packagesSchema,
  tools: toolsSchema,
  articles: articlesSchema,
  faq: faqSchema,
  contact: contactSchema,
  footer: footerSchema,
} satisfies Record<LandingSectionKey, z.ZodTypeAny>;

const sectionParamsSchema = z.object({ section: z.enum(landingSectionKeys) });
const contentBodySchema = z.object({
  content: z.unknown(),
  expectedUpdatedAt: z.string().datetime(),
});
const landingLogoAssetSchema = z
  .string()
  .regex(/^[a-f0-9]{64}\.(?:jpg|png|webp)$/i);

class InvalidLandingLogoError extends Error {
  public readonly statusCode = 400;

  public constructor(message: string) {
    super(message);
    this.name = "InvalidLandingLogoError";
  }
}

async function readLandingLogo(request: FastifyRequest): Promise<ImageUpload> {
  if (!request.isMultipart())
    throw new InvalidLandingLogoError("Choose a logo image to upload.");

  let image: ImageUpload | undefined;
  for await (const part of request.parts()) {
    if (part.type !== "file") continue;
    const body = await part.toBuffer();
    if (part.fieldname !== "image") continue;
    if (!isSupportedLandingLogoType(part.mimetype)) {
      throw new InvalidLandingLogoError("Use a JPG, PNG or WebP image.");
    }
    if (!body.byteLength)
      throw new InvalidLandingLogoError("The selected image is empty.");
    if (body.byteLength > MAX_LANDING_LOGO_BYTES) {
      throw new InvalidLandingLogoError("The logo must be 5 MB or smaller.");
    }
    image = { body, contentType: part.mimetype };
  }

  if (!image)
    throw new InvalidLandingLogoError("Choose a logo image to upload.");
  return image;
}

async function ensureAdmin(request: FastifyRequest, reply: FastifyReply) {
  return requireAdminSession(request, reply);
}

export async function landingRoutes(
  app: FastifyInstance,
  options: { service: LandingService },
) {
  app.get("/api/landing", async () => ({
    data: await options.service.getContent(),
  }));

  app.get("/api/landing/logos/:asset", async (request, reply) => {
    const parsed = landingLogoAssetSchema.safeParse(
      (request.params as { asset?: unknown }).asset,
    );
    if (!parsed.success)
      return reply.code(404).send({ error: "Logo not found." });

    const asset = parsed.data;
    const signedUrl = await signStoredObject(createLandingLogoKey(asset));
    if (signedUrl) {
      reply.header("Cache-Control", MEDIA_REDIRECT_CACHE_CONTROL);
      return reply.code(302).redirect(signedUrl);
    }
    const stored = await getStoredObject(createLandingLogoKey(asset));
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

  app.get("/api/admin/landing", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;
    const snapshot = await options.service.getSnapshot();
    return {
      data: {
        content: snapshot.content,
        updatedAt: snapshot.updatedAt?.toISOString() ?? null,
      },
    };
  });

  app.post("/api/admin/landing/logos", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    const image = await readLandingLogo(request);
    const hash = createHash("sha256").update(image.body).digest("hex");
    const asset = createLandingLogoAsset(hash, image.contentType);
    await uploadStoredObject(createLandingLogoKey(asset), image, {
      cacheControl: LANDING_LOGO_CACHE_CONTROL,
    });

    reply.header("Cache-Control", "no-store");
    return reply.code(201).send({
      data: {
        asset,
        url: `/api/landing/logos/${asset}`,
        bytes: image.body.byteLength,
        contentType: image.contentType,
      },
    });
  });

  app.put("/api/admin/landing/:section", async (request, reply) => {
    if (!(await ensureAdmin(request, reply))) return;

    const { section } = sectionParamsSchema.parse(request.params);
    const { content, expectedUpdatedAt } = contentBodySchema.parse(
      request.body,
    );
    const validated = sectionSchemas[section].parse(content);
    try {
      const snapshot = await options.service.updateSection(
        section,
        validated,
        new Date(expectedUpdatedAt),
      );
      return {
        data: {
          content: snapshot.content,
          updatedAt: snapshot.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      if (
        error instanceof LandingConflictError ||
        error instanceof LandingSafetyError
      ) {
        return reply.code(error.statusCode).send({ error: error.message });
      }
      throw error;
    }
  });
}
