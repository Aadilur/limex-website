import { isSafeBlogNavigationUrl, sanitizeBlogHtml, normalizeBlogKeywords } from "../../../../src/lib/blog-content.js";

import {
  BlogNotFoundError,
  type BlogLocale,
  type BlogPostInput,
  type BlogRepository,
  type BlogStatus,
} from "../domain/blog.js";

type TranslationRecord = {
  locale: string;
  title: string;
  subtitle: string;
  intro: string;
  atAGlance: string | null;
  bodyHtml: string;
  bodyJson: unknown;
  keywords: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  coverAlt: string | null;
  coverCaption: string | null;
};

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : null;
}

function asTranslations(value: unknown): TranslationRecord[] {
  return Array.isArray(value) ? value.filter((item): item is TranslationRecord => Boolean(asRecord(item) && typeof item.locale === "string")) : [];
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value)).toUpperCase();
}

function safeCanonicalUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function readTranslation(translations: TranslationRecord[], locale: BlogLocale) {
  return translations.find((translation) => translation.locale === locale)
    ?? translations.find((translation) => translation.locale === "en")
    ?? translations[0]
    ?? {
      locale,
      title: "Untitled article",
      subtitle: "",
      intro: "",
      atAGlance: null,
      bodyHtml: "",
      bodyJson: null,
      keywords: [],
      seoTitle: null,
      seoDescription: null,
      coverAlt: null,
      coverCaption: null,
    };
}

function snapshotOrCurrent(row: any) {
  const snapshot = asRecord(row.publishedSnapshot);
  if (row.status === "PUBLISHED" && snapshot) return snapshot;
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
    reels: Array.isArray(row.reels) ? row.reels : [],
    isFeatured: row.isFeatured,
    noIndex: row.noIndex,
    canonicalUrl: row.canonicalUrl,
    translations: row.translations,
    services: row.services,
  };
}

function toPublic(row: any, locale: BlogLocale) {
  const snapshot = snapshotOrCurrent(row);
  const translations = asTranslations(snapshot.translations ?? row.translations);
  const translation = readTranslation(translations, locale);
  const media = Array.isArray(row.media) ? row.media : [];
  const coverMediaId = typeof snapshot.coverMediaId === "string" ? snapshot.coverMediaId : null;
  const coverMedia = coverMediaId ? media.find((item: any) => item.id === coverMediaId) : null;
  const publishedAt = row.publishedAt ?? row.updatedAt;
  const canShowUpdatedDate = row.status === "PUBLISHED" && row.revision === row.publishedRevision && row.updatedAt.getTime() - new Date(publishedAt).getTime() > 86_400_000;
  const services = Array.isArray(snapshot.services) ? snapshot.services : row.services ?? [];

  return {
    id: row.id,
    contentLocale: translation.locale === "bn" ? "bn" : "en",
    slug: String(snapshot.slug ?? row.publishedSlug ?? row.slug),
    category: String(snapshot.category ?? row.category),
    date: formatDate(publishedAt),
    publishedAt: new Date(publishedAt).toISOString(),
    ...(canShowUpdatedDate ? { updatedDate: formatDate(row.updatedAt) } : {}),
    ...(canShowUpdatedDate ? { updatedAt: row.updatedAt.toISOString() } : {}),
    readTime: `${Number(snapshot.readTimeMinutes ?? row.readTimeMinutes) || 1} MIN READ`,
    author: String(snapshot.author ?? row.author),
    title: translation.title,
    summary: translation.subtitle,
    intro: translation.intro,
    atAGlance: translation.atAGlance ?? "",
    bodyHtml: sanitizeBlogHtml(translation.bodyHtml),
    coverTone: snapshot.coverTone === "violet" || snapshot.coverTone === "peach" ? snapshot.coverTone : "mint",
    coverNote: String(snapshot.coverNote ?? ""),
    coverNumber: String(snapshot.coverNumber ?? "01"),
    media: snapshot.sidebarVideoUrl ? "video" : "image",
    coverUrl: coverMedia ? (coverMedia.mediaAssetId ? "/api/media/" + coverMedia.mediaAssetId : "/api/blog/media/" + coverMedia.id) : "",
    coverAlt: translation.coverAlt ?? "",
    coverCaption: translation.coverCaption ?? "",
    noIndex: Boolean(snapshot.noIndex ?? row.noIndex),
    canonicalUrl: safeCanonicalUrl(snapshot.canonicalUrl),
    tags: normalizeBlogKeywords(translation.keywords),
    sidebarVideo: snapshot.sidebarVideoUrl ? {
      url: String(snapshot.sidebarVideoUrl),
      videoId: String(snapshot.sidebarVideoId ?? ""),
      title: String(snapshot.sidebarVideoTitle ?? "Tutorial video"),
    } : null,
    reels: Array.isArray(snapshot.reels)
      ? snapshot.reels
          .filter((reel: any) => reel && typeof reel.videoId === "string")
          .sort((a: any, b: any) => Number(a.sortOrder) - Number(b.sortOrder))
      : [],
    relatedServices: services.map((service: any) => ({ serviceKey: String(service.serviceKey), label: String(service.label), href: isSafeBlogNavigationUrl(service.href) ? String(service.href).trim() : "#contact", isPrimary: Boolean(service.isPrimary), sortOrder: Number(service.sortOrder) || 0 })),
    seoTitle: translation.seoTitle ?? translation.title,
    seoDescription: translation.seoDescription ?? translation.subtitle,
    isFeatured: Boolean(snapshot.isFeatured ?? row.isFeatured),
  };
}

function toAdmin(row: any) {
  if (!row) return null;
  const translations = Object.fromEntries(asTranslations(row.translations).map((translation) => [translation.locale, {
    locale: translation.locale,
    title: translation.title,
    subtitle: translation.subtitle,
    intro: translation.intro,
    atAGlance: translation.atAGlance ?? "",
    bodyHtml: translation.bodyHtml,
    bodyJson: translation.bodyJson ?? null,
    keywords: normalizeBlogKeywords(translation.keywords),
    seoTitle: translation.seoTitle ?? "",
    seoDescription: translation.seoDescription ?? "",
    coverAlt: translation.coverAlt ?? "",
    coverCaption: translation.coverCaption ?? "",
  }]));
  return {
    id: row.id,
    slug: row.slug,
    publishedSlug: row.publishedSlug,
    category: row.category,
    author: row.author,
    readTimeMinutes: row.readTimeMinutes,
    coverTone: row.coverTone,
    coverNote: row.coverNote ?? "",
    coverNumber: row.coverNumber ?? "01",
    coverMediaId: row.coverMediaId,
    sidebarVideoUrl: row.sidebarVideoUrl ?? "",
    sidebarVideoId: row.sidebarVideoId ?? "",
    sidebarVideoTitle: row.sidebarVideoTitle ?? "",
    reels: Array.isArray(row.reels) ? row.reels : [],
    status: row.status,
    isFeatured: row.isFeatured,
    noIndex: row.noIndex,
    canonicalUrl: row.canonicalUrl ?? "",
    sortOrder: row.sortOrder,
    revision: row.revision,
    publishedRevision: row.publishedRevision,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    translations,
    media: (row.media ?? []).map((media: any) => ({
      id: media.id,
      mediaAssetId: media.mediaAssetId ?? null,
      kind: media.kind,
      url: media.mediaAssetId ? "/api/media/" + media.mediaAssetId : "/api/blog/media/" + media.id,
      publicUrl: media.mediaAssetId ? "/api/media/" + media.mediaAssetId : "/api/blog/media/" + media.id,
      objectKey: media.objectKey,
      contentType: media.contentType,
      byteSize: media.byteSize,
      width: media.width,
      height: media.height,
      altText: media.altText ?? "",
      caption: media.caption ?? "",
    })),
    services: (row.services ?? []).map((service: any) => ({
      serviceKey: service.serviceKey,
      label: service.label,
      href: service.href,
      isPrimary: service.isPrimary,
      sortOrder: service.sortOrder,
    })),
  };
}

export class BlogService {
  public constructor(private readonly blogs: BlogRepository) {}

  public async getPublicIndex(input: { locale: BlogLocale; query?: string; category?: string; page: number; pageSize: number }) {
    const result = await this.blogs.listPublic(input);
    const articles = result.items.map((item: any) => toPublic(item.row, input.locale));
    const featured = input.page === 1 ? articles.find((article) => article.isFeatured) ?? articles[0] ?? null : null;
    return {
      featured,
      items: featured ? articles.filter((article) => article.id !== featured.id) : articles,
      categories: [...new Set(articles.map((article) => article.category))],
      total: result.total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }

  public async getPublicPost(slug: string, locale: BlogLocale) {
    const result = await this.blogs.findPublicBySlug(slug, locale);
    if (!result) return null;
    return { article: toPublic(result.row, locale), redirectTo: result.redirectTo };
  }

  public async getAdminIndex(input: { query?: string; status?: BlogStatus; page: number; pageSize: number }) {
    return this.blogs.listAdmin(input);
  }

  public async getAdminPost(id: string) {
    const row = await this.blogs.findAdminById(id);
    if (!row) throw new BlogNotFoundError();
    return toAdmin(row);
  }

  public async createPost(input: BlogPostInput, username: string) {
    return toAdmin(await this.blogs.createDraft(input, username));
  }

  public async updatePost(id: string, input: BlogPostInput, expectedRevision: number, username: string) {
    return toAdmin(await this.blogs.updateDraft(id, input, expectedRevision, username));
  }

  public async publishPost(id: string, expectedRevision: number, username: string) {
    return toAdmin(await this.blogs.publish(id, expectedRevision, username));
  }

  public async unpublishPost(id: string, expectedRevision: number, username: string) {
    return toAdmin(await this.blogs.unpublish(id, expectedRevision, username));
  }

  public async deletePost(id: string, expectedRevision: number) {
    return this.blogs.delete(id, expectedRevision);
  }

  public reorderPosts(ids: string[]) {
    return this.blogs.reorder(ids);
  }
}

export { toPublic, toAdmin };
