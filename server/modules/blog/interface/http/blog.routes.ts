import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import {
  blogContentJson,
  estimateReadTime,
  isSafeBlogNavigationUrl,
  normalizeBlogKeywords,
  normalizeBlogSlug,
  sanitizeBlogHtml,
} from "../../../../../src/lib/blog-content.js";
import {
  BLOG_MEDIA_CACHE_CONTROL,
  MEDIA_REDIRECT_CACHE_CONTROL,
  MAX_BLOG_IMAGE_BYTES,
  getStoredObject,
  isSupportedBlogImageType,
  signStoredObject,
  type ImageUpload,
} from "../../../../shared/storage/object-storage.js";
import { getYouTubeVideoId } from "../../../about/domain/youtube.js";
import { getAdminSession, requireAdminSession } from "../../../../shared/auth/admin-session.js";
import { prisma } from "../../../../shared/database/prisma.js";
import { BlogConflictError, BlogInputError, BlogNotFoundError, BlogSafetyError, type BlogPostInput } from "../../domain/blog.js";
import { BlogService } from "../../application/blog.service.js";
import { MediaService } from "../../../media/application/media.service.js";

const blankToNull = (value: unknown) => typeof value === "string" && value.trim() === "" ? null : value;
const idSchema = z.object({ id: z.string().trim().min(1).max(191) });
const slugParamsSchema = z.object({ slug: z.string().trim().min(1).max(180) });
const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const localeSchema = z.enum(["en", "bn"]);
const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number) => text(max).min(1);
const httpUrl = (max: number) => text(max).url().refine((value) => /^https?:\/\//i.test(value), "Use an http(s) URL.");

const translationSchema = z.object({
  locale: localeSchema,
  title: text(240),
  subtitle: text(500),
  intro: text(10000),
  atAGlance: z.preprocess(blankToNull, text(10000).nullable().optional()),
  bodyHtml: text(300000),
  bodyJson: z.unknown().optional(),
  keywords: z.union([z.string(), z.array(text(100))]).default([]),
  seoTitle: z.preprocess(blankToNull, text(240).nullable().optional()),
  seoDescription: z.preprocess(blankToNull, text(320).nullable().optional()),
  coverAlt: z.preprocess(blankToNull, text(240).nullable().optional()),
  coverCaption: z.preprocess(blankToNull, text(300).nullable().optional()),
}).strict();

const serviceSchema = z.object({
  serviceKey: requiredText(180),
  label: requiredText(180),
  href: requiredText(1000).refine(isSafeBlogNavigationUrl, "Use a relative or http(s) service link."),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(999).default(0),
}).strict();

const postSchema = z.object({
  slug: requiredText(180),
  category: requiredText(100),
  author: requiredText(120),
  readTimeMinutes: z.number().int().min(1).max(180).default(6),
  coverTone: z.enum(["mint", "violet", "peach"]).default("mint"),
  coverNote: z.preprocess(blankToNull, text(240).nullable().optional()),
  coverNumber: z.preprocess(blankToNull, text(20).nullable().optional()),
  coverMediaId: z.preprocess(blankToNull, text(191).nullable().optional()),
  sidebarVideoUrl: z.preprocess(blankToNull, text(500).url().nullable().optional()),
  sidebarVideoTitle: z.preprocess(blankToNull, text(240).nullable().optional()),
  isFeatured: z.boolean().default(false),
  noIndex: z.boolean().default(false),
  canonicalUrl: z.preprocess(blankToNull, httpUrl(500).nullable().optional()),
  translations: z.array(translationSchema).min(1).max(2).refine((items) => items.some((item) => item.locale === "en"), "Keep an English version for the public article."),
  services: z.array(serviceSchema).max(12).default([]),
}).strict();

const updateSchema = z.object({ expectedRevision: z.number().int().positive(), post: postSchema }).strict();
const revisionSchema = z.object({ expectedRevision: z.number().int().positive() }).strict();
const restoreSchema = z.object({ expectedRevision: z.number().int().positive(), version: z.number().int().positive() }).strict();
const orderSchema = z.object({ ids: z.array(z.string().trim().min(1).max(191)).min(1).max(500) }).strict();

function normalizeInput(input: z.infer<typeof postSchema>): BlogPostInput {
  const translations = input.translations.map((translation) => {
    const bodyHtml = sanitizeBlogHtml(translation.bodyHtml);
    return {
      locale: translation.locale,
      title: translation.title.trim(),
      subtitle: translation.subtitle.trim(),
      intro: translation.intro.trim(),
      atAGlance: translation.atAGlance ?? null,
      bodyHtml,
      bodyJson: translation.bodyJson ?? blogContentJson(bodyHtml),
      keywords: normalizeBlogKeywords(translation.keywords),
      seoTitle: translation.seoTitle ?? null,
      seoDescription: translation.seoDescription ?? null,
      coverAlt: translation.coverAlt ?? null,
      coverCaption: translation.coverCaption ?? null,
    };
  });
  const english = translations.find((translation) => translation.locale === "en") ?? translations[0];
  const explicitPrimaryIndex = input.services.findIndex((service) => service.isPrimary);
  const primaryIndex = explicitPrimaryIndex >= 0 ? explicitPrimaryIndex : input.services.length ? 0 : -1;
  const services = input.services.map((service, index) => ({ ...service, isPrimary: index === primaryIndex, sortOrder: service.sortOrder ?? index }));
  const videoId = input.sidebarVideoUrl ? getYouTubeVideoId(input.sidebarVideoUrl) : null;
  if (input.sidebarVideoUrl && !videoId) throw new Error("Paste a valid YouTube video link for the sidebar tutorial.");
  return {
    slug: normalizeBlogSlug(input.slug),
    category: input.category.trim(),
    author: input.author.trim(),
    readTimeMinutes: input.readTimeMinutes || estimateReadTime(english?.bodyHtml ?? ""),
    coverTone: input.coverTone,
    coverNote: input.coverNote ?? null,
    coverNumber: input.coverNumber ?? null,
    coverMediaId: input.coverMediaId ?? null,
    sidebarVideoUrl: input.sidebarVideoUrl ?? null,
    sidebarVideoId: videoId,
    sidebarVideoTitle: input.sidebarVideoTitle ?? null,
    isFeatured: input.isFeatured,
    noIndex: input.noIndex,
    canonicalUrl: input.canonicalUrl ?? null,
    translations,
    services,
  };
}

function sendKnownError(error: unknown, reply: FastifyReply) {
  if (error instanceof BlogConflictError || error instanceof BlogSafetyError || error instanceof BlogNotFoundError) {
    return reply.code(error.statusCode).send({ error: error.message });
  }
  if (error instanceof BlogInputError) return reply.code(error.statusCode).send({ error: error.message });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return reply.code(409).send({ error: "An article with this slug already exists." });
    if (error.code === "P2025") return reply.code(404).send({ error: "Article not found." });
  }
  if (error instanceof z.ZodError) return reply.code(400).send({ error: error.issues[0]?.message ?? "Check the article details." });
  if (error instanceof Error && error.message.startsWith("Paste a valid YouTube")) return reply.code(400).send({ error: error.message });
  throw error;
}

type ParsedBlogImage = { image: ImageUpload; originalName: string; width?: number; height?: number; altText?: string; caption?: string };

async function readBlogImage(request: FastifyRequest): Promise<ParsedBlogImage> {
  if (!request.isMultipart()) throw new BlogInputError("Choose an image to upload.");
  let image: ImageUpload | undefined;
  let originalName = "uploaded-image";
  let width: number | undefined;
  let height: number | undefined;
  let altText: string | undefined;
  let caption: string | undefined;
  for await (const part of request.parts()) {
    if (part.type === "file") {
      const body = await part.toBuffer();
      if (part.fieldname !== "image") continue;
      if (!isSupportedBlogImageType(part.mimetype)) throw new BlogInputError("Use a JPG, PNG or WebP image.");
      if (!body.byteLength) throw new BlogInputError("The selected image is empty.");
      if (body.byteLength > MAX_BLOG_IMAGE_BYTES) throw new BlogInputError("The image must be 5 MB or smaller.");
      image = { body, contentType: part.mimetype };
      originalName = part.filename || originalName;
      continue;
    }
    if (part.fieldname === "width") width = Number(part.value) || undefined;
    if (part.fieldname === "height") height = Number(part.value) || undefined;
    if (part.fieldname === "altText") altText = String(part.value).trim().slice(0, 240);
    if (part.fieldname === "caption") caption = String(part.value).trim().slice(0, 300);
  }
  if (!image) throw new BlogInputError("Choose an image to upload.");
  return { image, originalName, width, height, altText, caption };
}

export function createBlogRoutes(blogService: BlogService, mediaService: MediaService) {
  return async function blogRoutes(app: FastifyInstance) {
    app.get("/api/blog/posts", async (request, reply) => {
      const input = z.object({
        locale: localeSchema.default("en"),
        query: z.preprocess(blankToNull, text(120).nullable().optional()),
        category: z.preprocess(blankToNull, text(100).nullable().optional()),
        page: z.coerce.number().int().min(1).max(1000).default(1),
        pageSize: z.coerce.number().int().min(1).max(30).default(30),
      }).parse(request.query);
      reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return { data: await blogService.getPublicIndex({ ...input, query: input.query ?? undefined, category: input.category ?? undefined }) };
    });

    app.get("/api/blog/posts/:slug", async (request, reply) => {
      const { slug } = slugParamsSchema.parse(request.params);
      const { locale } = z.object({ locale: localeSchema.default("en") }).parse(request.query);
      const result = await blogService.getPublicPost(slug, locale);
      if (!result) return reply.code(404).send({ error: "Article not found." });
      reply.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return { data: result };
    });

    app.get("/api/blog/media/:id", async (request, reply) => {
      const { id } = idSchema.parse(request.params);
      const media = await prisma.blogPostMedia.findUnique({ where: { id }, include: { post: { select: { status: true } } } });
      if (!media || media.kind !== "IMAGE") return reply.code(404).send({ error: "Image not found." });
      if (media.post.status !== "PUBLISHED" && !getAdminSession(request)) return reply.code(404).send({ error: "Image not found." });
      const signedUrl = await signStoredObject(media.objectKey);
      if (signedUrl) {
        reply.header("Cache-Control", MEDIA_REDIRECT_CACHE_CONTROL);
        return reply.code(302).redirect(signedUrl);
      }
      const stored = await getStoredObject(media.objectKey);
      if (!stored) return reply.code(404).send({ error: "Image not found." });
      const etag = `"${createHash("sha1").update(media.objectKey).digest("hex").slice(0, 24)}"`;
      reply.header("Cache-Control", BLOG_MEDIA_CACHE_CONTROL);
      reply.header("Content-Type", stored.contentType);
      reply.header("ETag", etag);
      if (stored.contentLength !== undefined) reply.header("Content-Length", String(stored.contentLength));
      if ((request.headers["if-none-match"]?.split(",").map((value) => value.trim()) ?? []).includes(etag)) return reply.code(304).send();
      return reply.send(stored.body);
    });

    app.get("/api/admin/blog/posts", async (request, reply) => {
      if (!requireAdminSession(request, reply)) return;
      const input = z.object({
        query: z.preprocess(blankToNull, text(120).nullable().optional()),
        status: statusSchema.optional(),
        page: z.coerce.number().int().min(1).max(1000).default(1),
        pageSize: z.coerce.number().int().min(1).max(100).default(50),
      }).parse(request.query);
      reply.header("Cache-Control", "no-store");
      return { data: await blogService.getAdminIndex({ ...input, query: input.query ?? undefined, page: input.page, pageSize: input.pageSize }) };
    });

    app.get("/api/admin/blog/posts/:id", async (request, reply) => {
      if (!requireAdminSession(request, reply)) return;
      try {
        const { id } = idSchema.parse(request.params);
        reply.header("Cache-Control", "no-store");
        return { data: await blogService.getAdminPost(id) };
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.get("/api/admin/blog/slug-availability", async (request, reply) => {
      if (!requireAdminSession(request, reply)) return;
      const input = z.object({ slug: requiredText(180), excludeId: z.preprocess(blankToNull, text(191).nullable().optional()) }).parse(request.query);
      const normalized = normalizeBlogSlug(input.slug);
      const existing = await prisma.blogPost.findFirst({ where: { slug: normalized, ...(input.excludeId ? { NOT: { id: input.excludeId } } : {}) }, select: { id: true } });
      return { data: { slug: normalized, available: !existing } };
    });

    app.post("/api/admin/blog/posts", async (request, reply) => {
      const session = requireAdminSession(request, reply);
      if (!session) return;
      try {
        const input = normalizeInput(postSchema.parse(request.body));
        return reply.code(201).send({ data: await blogService.createPost(input, session.username) });
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.put("/api/admin/blog/posts/:id", async (request, reply) => {
      const session = requireAdminSession(request, reply);
      if (!session) return;
      try {
        const { id } = idSchema.parse(request.params);
        const input = updateSchema.parse(request.body);
        return { data: await blogService.updatePost(id, normalizeInput(input.post), input.expectedRevision, session.username) };
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.post("/api/admin/blog/posts/:id/publish", async (request, reply) => {
      const session = requireAdminSession(request, reply);
      if (!session) return;
      try {
        const { id } = idSchema.parse(request.params);
        const { expectedRevision } = revisionSchema.parse(request.body);
        return { data: await blogService.publishPost(id, expectedRevision, session.username) };
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.post("/api/admin/blog/posts/:id/unpublish", async (request, reply) => {
      const session = requireAdminSession(request, reply);
      if (!session) return;
      try {
        const { id } = idSchema.parse(request.params);
        const { expectedRevision } = revisionSchema.parse(request.body);
        return { data: await blogService.unpublishPost(id, expectedRevision, session.username) };
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.put("/api/admin/blog/posts/order", async (request, reply) => {
      if (!requireAdminSession(request, reply)) return;
      try {
        const { ids } = orderSchema.parse(request.body);
        return { data: await blogService.reorderPosts(ids) };
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.get("/api/admin/blog/posts/:id/revisions", async (request, reply) => {
      if (!requireAdminSession(request, reply)) return;
      try {
        const { id } = idSchema.parse(request.params);
        const rows = await prisma.blogPostRevision.findMany({ where: { postId: id }, select: { id: true, version: true, kind: true, createdBy: true, createdAt: true }, orderBy: [{ version: "desc" }], take: 50 });
        return { data: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })) };
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.post("/api/admin/blog/posts/:id/restore", async (request, reply) => {
      const session = requireAdminSession(request, reply);
      if (!session) return;
      try {
        const { id } = idSchema.parse(request.params);
        const { expectedRevision, version } = restoreSchema.parse(request.body);
        const revision = await prisma.blogPostRevision.findUnique({ where: { postId_version: { postId: id, version } }, select: { snapshot: true } });
        if (!revision) throw new BlogNotFoundError("That revision is no longer available.");
        const input = normalizeInput(postSchema.parse(revision.snapshot));
        return { data: await blogService.updatePost(id, input, expectedRevision, session.username) };
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.post("/api/admin/blog/posts/:id/media", async (request, reply) => {
      if (!requireAdminSession(request, reply)) return;
      try {
        const { id } = idSchema.parse(request.params);
        const post = await prisma.blogPost.findUnique({
          where: { id },
          select: {
            id: true,
            slug: true,
          },
        });
        if (!post) return reply.code(404).send({ error: "Article not found." });
        const parsed = await readBlogImage(request);
        const uploaded = await mediaService.uploadBlogImage({
          postId: id,
          postSlug: post.slug,
          image: parsed.image,
          originalName: parsed.originalName,
          width: parsed.width,
          height: parsed.height,
          altText: parsed.altText,
          caption: parsed.caption,
        });
        const asset = uploaded.asset;
        return reply.code(201).send({
          data: {
            id: uploaded.blogMediaId,
            mediaAssetId: asset.id,
            url: asset.url,
            publicUrl: asset.publicUrl,
            kind: "IMAGE",
            contentType: asset.contentType,
            byteSize: asset.byteSize,
            width: asset.width,
            height: asset.height,
            altText: asset.altText,
            caption: asset.caption,
          },
        });
      } catch (error) { return sendKnownError(error, reply); }
    });

    app.delete("/api/admin/blog/media/:id", async (request, reply) => {
      if (!requireAdminSession(request, reply)) return;
      try {
        const { id } = idSchema.parse(request.params);
        const media = await prisma.blogPostMedia.findUnique({
          where: { id },
          select: { id: true, postId: true, mediaAssetId: true, objectKey: true },
        });
        if (!media) return reply.code(404).send({ error: "Image not found." });
        const post = await prisma.blogPost.findUnique({ where: { id: media.postId }, select: { coverMediaId: true, publishedSnapshot: true } });
        const publishedSnapshot = post?.publishedSnapshot && typeof post.publishedSnapshot === "object" && !Array.isArray(post.publishedSnapshot)
          ? post.publishedSnapshot as Record<string, unknown>
          : null;
        if (post?.coverMediaId === id || publishedSnapshot?.coverMediaId === id) return reply.code(400).send({ error: "Choose another cover image before removing this one." });
        await mediaService.deleteBlogMedia(id);
        return { data: { deleted: true } };
      } catch (error) { return sendKnownError(error, reply); }
    });
  };
}
