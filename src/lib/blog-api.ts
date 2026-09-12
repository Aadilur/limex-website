import { ApiError, request } from "./menu-api";
import type { BlogArticle } from "@/components/limex/blog-data";
export type { BlogArticle } from "@/components/limex/blog-data";

export type BlogLocale = "en" | "bn";
export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BlogServiceLink = {
  serviceKey: string;
  label: string;
  href: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type BlogTranslation = {
  locale: BlogLocale;
  title: string;
  subtitle: string;
  intro: string;
  atAGlance: string;
  bodyHtml: string;
  bodyJson: unknown;
  keywords: string[];
  seoTitle: string;
  seoDescription: string;
  coverAlt: string;
  coverCaption: string;
};

export type BlogMedia = {
  id: string;
  mediaAssetId?: string | null;
  kind: "IMAGE" | string;
  url: string;
  publicUrl?: string;
  objectKey?: string;
  contentType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string;
};

export type BlogIndexResponse = {
  featured: BlogArticle | null;
  items: BlogArticle[];
  categories: string[];
  total: number;
  page: number;
  pageSize: number;
  fallback?: boolean;
};

export type AdminBlogSummary = {
  id: string;
  slug: string;
  category: string;
  author: string;
  readTimeMinutes: number;
  status: BlogStatus;
  isFeatured: boolean;
  publishedAt: string | null;
  updatedAt: string;
  revision: number;
  title: string;
  subtitle: string;
};

export type AdminBlogPost = {
  id: string;
  slug: string;
  publishedSlug: string | null;
  category: string;
  author: string;
  readTimeMinutes: number;
  coverTone: "mint" | "violet" | "peach";
  coverNote: string;
  coverNumber: string;
  coverMediaId: string | null;
  sidebarVideoUrl: string;
  sidebarVideoId: string;
  sidebarVideoTitle: string;
  status: BlogStatus;
  isFeatured: boolean;
  noIndex: boolean;
  canonicalUrl: string;
  sortOrder: number;
  revision: number;
  publishedRevision: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  translations: Partial<Record<BlogLocale, BlogTranslation>>;
  media: BlogMedia[];
  services: BlogServiceLink[];
};

export type BlogRevision = {
  id: string;
  version: number;
  kind: "DRAFT" | "PUBLISHED" | string;
  createdBy: string | null;
  createdAt: string;
};

export type BlogPostInput = {
  slug: string;
  category: string;
  author: string;
  readTimeMinutes: number;
  coverTone: "mint" | "violet" | "peach";
  coverNote: string;
  coverNumber: string;
  coverMediaId: string | null;
  sidebarVideoUrl: string;
  sidebarVideoTitle: string;
  isFeatured: boolean;
  noIndex: boolean;
  canonicalUrl: string;
  translations: BlogTranslation[];
  services: BlogServiceLink[];
};

export function getPublicBlogIndex(params?: { locale?: BlogLocale; query?: string; category?: string }): Promise<BlogIndexResponse> {
  const search = new URLSearchParams();
  if (params?.locale) search.set("locale", params.locale);
  if (params?.query) search.set("query", params.query);
  if (params?.category) search.set("category", params.category);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<BlogIndexResponse>(`/api/blog/posts${suffix}`, { cache: "no-store" });
}

export async function getPublicBlogPost(slug: string, locale: BlogLocale = "en") {
  const result = await request<{ article: BlogArticle; redirectTo: string | null }>(`/api/blog/posts/${encodeURIComponent(slug)}?locale=${locale}`, { cache: "no-store" });
  return result;
}

export function getAdminBlogPosts(params?: { query?: string; status?: BlogStatus }): Promise<{ items: AdminBlogSummary[]; total: number }> {
  const search = new URLSearchParams();
  if (params?.query) search.set("query", params.query);
  if (params?.status) search.set("status", params.status);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  return request<{ items: AdminBlogSummary[]; total: number }>(`/api/admin/blog/posts${suffix}`, { cache: "no-store" });
}

export function getAdminBlogPost(id: string): Promise<AdminBlogPost> {
  return request<AdminBlogPost>(`/api/admin/blog/posts/${id}`, { cache: "no-store" });
}

export function createAdminBlogPost(input: BlogPostInput): Promise<AdminBlogPost> {
  return request<AdminBlogPost>("/api/admin/blog/posts", { method: "POST", body: JSON.stringify(input) });
}

export function updateAdminBlogPost(id: string, post: BlogPostInput, expectedRevision: number): Promise<AdminBlogPost> {
  return request<AdminBlogPost>(`/api/admin/blog/posts/${id}`, { method: "PUT", body: JSON.stringify({ post, expectedRevision }) });
}

export function publishAdminBlogPost(id: string, expectedRevision: number): Promise<AdminBlogPost> {
  return request<AdminBlogPost>(`/api/admin/blog/posts/${id}/publish`, { method: "POST", body: JSON.stringify({ expectedRevision }) });
}

export function unpublishAdminBlogPost(id: string, expectedRevision: number): Promise<AdminBlogPost> {
  return request<AdminBlogPost>(`/api/admin/blog/posts/${id}/unpublish`, { method: "POST", body: JSON.stringify({ expectedRevision }) });
}

export function getAdminBlogRevisions(id: string): Promise<BlogRevision[]> {
  return request<BlogRevision[]>(`/api/admin/blog/posts/${id}/revisions`, { cache: "no-store" });
}

export function restoreAdminBlogPost(id: string, expectedRevision: number, version: number): Promise<AdminBlogPost> {
  return request<AdminBlogPost>(`/api/admin/blog/posts/${id}/restore`, { method: "POST", body: JSON.stringify({ expectedRevision, version }) });
}

export function reorderAdminBlogPosts(ids: string[]): Promise<AdminBlogSummary[]> {
  return request<AdminBlogSummary[]>("/api/admin/blog/posts/order", { method: "PUT", body: JSON.stringify({ ids }) });
}

export function checkAdminBlogSlug(slug: string, excludeId?: string): Promise<{ slug: string; available: boolean }> {
  const search = new URLSearchParams({ slug });
  if (excludeId) search.set("excludeId", excludeId);
  return request<{ slug: string; available: boolean }>(`/api/admin/blog/slug-availability?${search.toString()}`, { cache: "no-store" });
}

export function uploadAdminBlogImage(postId: string, file: File, metadata?: { width?: number; height?: number; altText?: string; caption?: string }): Promise<BlogMedia> {
  const formData = new FormData();
  formData.append("image", file);
  if (metadata?.width) formData.append("width", String(metadata.width));
  if (metadata?.height) formData.append("height", String(metadata.height));
  if (metadata?.altText) formData.append("altText", metadata.altText);
  if (metadata?.caption) formData.append("caption", metadata.caption);
  return request<BlogMedia>(`/api/admin/blog/posts/${postId}/media`, { method: "POST", body: formData });
}

export function isUnauthorizedBlogError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function isBlogConflictError(error: unknown) {
  return error instanceof ApiError && error.status === 409;
}
