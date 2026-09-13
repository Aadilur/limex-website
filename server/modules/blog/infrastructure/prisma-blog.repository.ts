import { Prisma, type PrismaClient } from "@prisma/client";

import {
  BlogConflictError,
  BlogNotFoundError,
  BlogSafetyError,
  type BlogPostInput,
  type BlogPostSummary,
  type BlogRepository,
} from "../domain/blog.js";

const treeInclude: Prisma.BlogPostInclude = {
  translations: { orderBy: { locale: "asc" as const } },
  media: { orderBy: { createdAt: "asc" as const }, include: { mediaAsset: true } },
  services: { orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }] },
};

function asJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function snapshotFromInput(input: BlogPostInput) {
  return {
    slug: input.slug,
    category: input.category,
    author: input.author,
    readTimeMinutes: input.readTimeMinutes,
    coverTone: input.coverTone,
    coverNote: input.coverNote ?? null,
    coverNumber: input.coverNumber ?? null,
    coverMediaId: input.coverMediaId ?? null,
    sidebarVideoUrl: input.sidebarVideoUrl ?? null,
    sidebarVideoId: input.sidebarVideoId ?? null,
    sidebarVideoTitle: input.sidebarVideoTitle ?? null,
    isFeatured: input.isFeatured,
    noIndex: input.noIndex,
    canonicalUrl: input.canonicalUrl ?? null,
    translations: input.translations,
    services: input.services,
  };
}

function snapshotFromRow(row: any) {
  return {
    slug: row.slug,
    category: row.category,
    author: row.author,
    readTimeMinutes: row.readTimeMinutes,
    coverTone: row.coverTone,
    coverNote: row.coverNote,
    coverNumber: row.coverNumber,
    coverMediaId: row.coverMediaId,
    sidebarVideoUrl: row.sidebarVideoUrl,
    sidebarVideoId: row.sidebarVideoId,
    sidebarVideoTitle: row.sidebarVideoTitle,
    isFeatured: row.isFeatured,
    noIndex: row.noIndex,
    canonicalUrl: row.canonicalUrl,
    translations: (row.translations ?? []).map((translation: any) => ({
      locale: translation.locale,
      title: translation.title,
      subtitle: translation.subtitle,
      intro: translation.intro,
      atAGlance: translation.atAGlance ?? null,
      bodyHtml: translation.bodyHtml,
      bodyJson: translation.bodyJson ?? null,
      keywords: translation.keywords ?? [],
      seoTitle: translation.seoTitle ?? null,
      seoDescription: translation.seoDescription ?? null,
      coverAlt: translation.coverAlt ?? null,
      coverCaption: translation.coverCaption ?? null,
    })),
    services: (row.services ?? []).map((service: any) => ({
      serviceKey: service.serviceKey,
      label: service.label,
      href: service.href,
      isPrimary: Boolean(service.isPrimary),
      sortOrder: Number(service.sortOrder) || 0,
    })),
  };
}

function rowTitle(row: { translations?: Array<{ locale: string; title: string }> }) {
  return row.translations?.find((translation) => translation.locale === "en")?.title
    ?? row.translations?.[0]?.title
    ?? "Untitled article";
}

function rowSubtitle(row: { translations?: Array<{ locale: string; subtitle: string }> }) {
  return row.translations?.find((translation) => translation.locale === "en")?.subtitle
    ?? row.translations?.[0]?.subtitle
    ?? "";
}

function toSummary(row: any): BlogPostSummary {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    author: row.author,
    readTimeMinutes: row.readTimeMinutes,
    status: row.status,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    revision: row.revision,
    title: rowTitle(row),
    subtitle: rowSubtitle(row),
  };
}

function translationData(input: BlogPostInput["translations"]) {
  return input.map((translation) => ({
    locale: translation.locale,
    title: translation.title,
    subtitle: translation.subtitle,
    intro: translation.intro,
    atAGlance: translation.atAGlance ?? null,
    bodyHtml: translation.bodyHtml,
    bodyJson: translation.bodyJson === undefined ? undefined : asJson(translation.bodyJson),
    keywords: asJson(translation.keywords),
    seoTitle: translation.seoTitle ?? null,
    seoDescription: translation.seoDescription ?? null,
    coverAlt: translation.coverAlt ?? null,
    coverCaption: translation.coverCaption ?? null,
  }));
}

function serviceData(input: BlogPostInput["services"]) {
  return input.map((service, index) => ({
    serviceKey: service.serviceKey,
    label: service.label,
    href: service.href,
    isPrimary: service.isPrimary ?? index === 0,
    sortOrder: service.sortOrder ?? index,
  }));
}

export class PrismaBlogRepository implements BlogRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async listPublic({ locale, query, category, page, pageSize }: { locale: "en" | "bn"; query?: string; category?: string; page: number; pageSize: number }) {
    const where: Prisma.BlogPostWhereInput = {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(query ? {
        OR: [
          { category: { contains: query } },
          { translations: { some: { title: { contains: query } } } },
          { translations: { some: { subtitle: { contains: query } } } },
          { translations: { some: { intro: { contains: query } } } },
        ],
      } : {}),
    };
    const [total, rows] = await Promise.all([
      this.client.blogPost.count({ where }),
      this.client.blogPost.findMany({
        where,
        include: treeInclude,
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { total, items: rows.map((row) => ({ row, locale })) };
  }

  public async findPublicBySlug(slug: string, locale: "en" | "bn") {
    const row = await this.client.blogPost.findFirst({
      where: { status: "PUBLISHED", publishedSlug: slug },
      include: treeInclude,
    });
    if (row) return { row, locale, redirectTo: null };

    const redirect = await this.client.blogPostRedirect.findUnique({
      where: { fromSlug: slug },
      include: { post: { include: treeInclude } },
    });
    if (!redirect || redirect.post.status !== "PUBLISHED") return null;
    return { row: redirect.post, locale, redirectTo: redirect.toSlug };
  }

  public async listAdmin({ query, status, page, pageSize }: { query?: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"; page: number; pageSize: number }) {
    const where: Prisma.BlogPostWhereInput = {
      ...(status ? { status } : {}),
      ...(query ? {
        OR: [
          { slug: { contains: query } },
          { category: { contains: query } },
          { translations: { some: { title: { contains: query } } } },
        ],
      } : {}),
    };
    const [total, rows] = await Promise.all([
      this.client.blogPost.count({ where }),
      this.client.blogPost.findMany({
        where,
        select: {
          id: true,
          slug: true,
          category: true,
          author: true,
          readTimeMinutes: true,
          status: true,
          isFeatured: true,
          publishedAt: true,
          updatedAt: true,
          revision: true,
          translations: { select: { locale: true, title: true, subtitle: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, items: rows.map(toSummary) };
  }

  public findAdminById(id: string) {
    return this.client.blogPost.findUnique({ where: { id }, include: treeInclude });
  }

  public async createDraft(input: BlogPostInput, createdBy: string) {
    const snapshot = snapshotFromInput(input);
    return this.client.blogPost.create({
      data: {
        slug: input.slug,
        category: input.category,
        author: input.author,
        readTimeMinutes: input.readTimeMinutes,
        coverTone: input.coverTone,
        coverNote: input.coverNote ?? null,
        coverNumber: input.coverNumber ?? null,
        coverMediaId: input.coverMediaId ?? null,
        sidebarVideoUrl: input.sidebarVideoUrl ?? null,
        sidebarVideoId: input.sidebarVideoId ?? null,
        sidebarVideoTitle: input.sidebarVideoTitle ?? null,
        isFeatured: input.isFeatured,
        noIndex: input.noIndex,
        canonicalUrl: input.canonicalUrl ?? null,
        translations: { create: translationData(input.translations) },
        services: { create: serviceData(input.services) },
        revisions: { create: { version: 1, kind: "DRAFT", snapshot: asJson(snapshot), createdBy } },
      },
      include: treeInclude,
    });
  }

  public async updateDraft(id: string, input: BlogPostInput, expectedRevision: number, updatedBy: string) {
    return this.client.$transaction(async (transaction) => {
      const current = await transaction.blogPost.findUnique({ where: { id }, include: treeInclude });
      if (!current) throw new BlogNotFoundError();
      if (current.revision !== expectedRevision) throw new BlogConflictError();
      if (input.coverMediaId && !current.media.some((media) => media.id === input.coverMediaId)) {
        throw new BlogSafetyError("Choose an image uploaded to this article before saving.");
      }
      const currentEnglish = current.translations.find((translation) => translation.locale === "en");
      const nextEnglish = input.translations.find((translation) => translation.locale === "en");
      if (currentEnglish && nextEnglish && currentEnglish.bodyHtml.trim() && !nextEnglish.bodyHtml.trim()) {
        throw new BlogSafetyError("The article body became empty, so the existing content was kept safe. Reload before clearing it intentionally.");
      }
      if (currentEnglish && nextEnglish && currentEnglish.title.trim() && !nextEnglish.title.trim()) {
        throw new BlogSafetyError("The article title became empty, so the existing content was kept safe.");
      }

      const nextRevision = current.revision + 1;
      const updated = await transaction.blogPost.updateMany({
        where: { id, revision: expectedRevision },
        data: {
          slug: input.slug,
          category: input.category,
          author: input.author,
          readTimeMinutes: input.readTimeMinutes,
          coverTone: input.coverTone,
          coverNote: input.coverNote ?? null,
          coverNumber: input.coverNumber ?? null,
          coverMediaId: input.coverMediaId ?? null,
          sidebarVideoUrl: input.sidebarVideoUrl ?? null,
          sidebarVideoId: input.sidebarVideoId ?? null,
          sidebarVideoTitle: input.sidebarVideoTitle ?? null,
          isFeatured: input.isFeatured,
          noIndex: input.noIndex,
          canonicalUrl: input.canonicalUrl ?? null,
          revision: nextRevision,
        },
      });
      if (!updated.count) throw new BlogConflictError();

      await transaction.blogPostTranslation.deleteMany({ where: { postId: id } });
      await transaction.blogPostTranslation.createMany({ data: translationData(input.translations).map((translation) => ({ ...translation, postId: id })) });
      await transaction.blogPostService.deleteMany({ where: { postId: id } });
      if (input.services.length) {
        await transaction.blogPostService.createMany({ data: serviceData(input.services).map((service) => ({ ...service, postId: id })) });
      }
      await transaction.blogPostRevision.create({ data: { postId: id, version: nextRevision, kind: "DRAFT", snapshot: asJson(snapshotFromInput(input)), createdBy: updatedBy } });

      const saved = await transaction.blogPost.findUnique({ where: { id }, include: treeInclude });
      if (!saved) throw new BlogNotFoundError();
      return saved;
    });
  }

  public async publish(id: string, expectedRevision: number, updatedBy: string) {
    return this.client.$transaction(async (transaction) => {
      const current = await transaction.blogPost.findUnique({ where: { id }, include: treeInclude });
      if (!current) throw new BlogNotFoundError();
      if (current.revision !== expectedRevision) throw new BlogConflictError("This article changed in another session. Reload before publishing.");
      const english = current.translations.find((translation) => translation.locale === "en");
      if (!english?.title.trim() || !english.subtitle.trim() || !english.bodyHtml.trim()) {
        throw new BlogSafetyError("Add an English title, subtitle and article body before publishing.");
      }
      const nextRevision = current.revision + 1;
      const snapshot = snapshotFromRow(current);
      if (current.publishedSlug && current.publishedSlug !== current.slug) {
        await transaction.blogPostRedirect.upsert({
          where: { fromSlug: current.publishedSlug },
          update: { toSlug: current.slug, postId: id },
          create: { fromSlug: current.publishedSlug, toSlug: current.slug, postId: id },
        });
        await transaction.blogPostRedirect.updateMany({
          where: { postId: id },
          data: { toSlug: current.slug },
        });
      }
      const updated = await transaction.blogPost.updateMany({
        where: { id, revision: expectedRevision },
        data: {
          status: "PUBLISHED",
          publishedSlug: current.slug,
          publishedRevision: nextRevision,
          publishedSnapshot: asJson(snapshot),
          publishedAt: new Date(),
          revision: nextRevision,
        },
      });
      if (!updated.count) throw new BlogConflictError("This article changed in another session. Reload before publishing.");
      await transaction.blogPostRevision.create({ data: { postId: id, version: nextRevision, kind: "PUBLISHED", snapshot: asJson(snapshot), createdBy: updatedBy } });
      const saved = await transaction.blogPost.findUnique({ where: { id }, include: treeInclude });
      if (!saved) throw new BlogNotFoundError();
      return saved;
    });
  }

  public async unpublish(id: string, expectedRevision: number, updatedBy: string) {
    return this.client.$transaction(async (transaction) => {
      const current = await transaction.blogPost.findUnique({ where: { id } });
      if (!current) throw new BlogNotFoundError();
      if (current.revision !== expectedRevision) throw new BlogConflictError("This article changed in another session. Reload before unpublishing.");
      const nextRevision = current.revision + 1;
      const updated = await transaction.blogPost.updateMany({ where: { id, revision: expectedRevision }, data: { status: "DRAFT", revision: nextRevision } });
      if (!updated.count) throw new BlogConflictError("This article changed in another session. Reload before unpublishing.");
      await transaction.blogPostRevision.create({ data: { postId: id, version: nextRevision, kind: "DRAFT", snapshot: asJson({ status: "DRAFT" }), createdBy: updatedBy } });
      const saved = await transaction.blogPost.findUnique({ where: { id }, include: treeInclude });
      if (!saved) throw new BlogNotFoundError();
      return saved;
    });
  }

  public async delete(id: string, expectedRevision: number) {
    await this.client.$transaction(async (transaction) => {
      const current = await transaction.blogPost.findUnique({
        where: { id },
        select: { id: true, revision: true },
      });
      if (!current) throw new BlogNotFoundError();
      if (current.revision !== expectedRevision) {
        throw new BlogConflictError("This article changed in another session. Reload it before deleting.");
      }

      // Blog translations, revisions, service connections, media links and
      // redirects cascade from BlogPost. Reusable MediaAsset records remain
      // in the media library so deleting an article cannot destroy shared media.
      const deleted = await transaction.blogPost.deleteMany({
        where: { id, revision: expectedRevision },
      });
      if (!deleted.count) {
        throw new BlogConflictError("This article changed in another session. Reload it before deleting.");
      }
    });
  }

  public async reorder(ids: string[]) {
    const current = await this.client.blogPost.findMany({ select: { id: true } });
    const currentIds = new Set(current.map((item) => item.id));
    if (ids.length !== current.length || new Set(ids).size !== ids.length || ids.some((id) => !currentIds.has(id))) {
      throw new BlogConflictError("The article order is out of date. Reload the list and try again.");
    }
    await this.client.$transaction(ids.map((id, sortOrder) => this.client.blogPost.update({ where: { id }, data: { sortOrder } })));
    const rows = await this.client.blogPost.findMany({
      select: { id: true, slug: true, category: true, author: true, readTimeMinutes: true, status: true, isFeatured: true, publishedAt: true, updatedAt: true, revision: true, translations: { select: { locale: true, title: true, subtitle: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    });
    return rows.map(toSummary);
  }

  public async createRedirect(fromSlug: string, toSlug: string, postId: string) {
    await this.client.blogPostRedirect.upsert({ where: { fromSlug }, update: { toSlug, postId }, create: { fromSlug, toSlug, postId } });
  }
}
