import { allBlogArticles, blogArticles, featuredArticle, getBlogArticle, type BlogArticle } from "@/components/limex/blog-data";
import { blogBlocksToHtml } from "./blog-content";
import type { BlogIndexResponse, BlogLocale } from "./blog-api";

function fallbackArticle(article: BlogArticle): BlogArticle {
  return {
    ...article,
    id: article.id ?? article.slug,
    contentLocale: article.contentLocale ?? "en",
    bodyHtml: article.bodyHtml ?? blogBlocksToHtml(article.blocks ?? []),
    coverUrl: article.coverUrl ?? "",
    coverAlt: article.coverAlt ?? `${article.title} cover`,
    coverCaption: article.coverCaption ?? "",
    noIndex: article.noIndex ?? false,
    canonicalUrl: article.canonicalUrl ?? null,
    sidebarVideo: article.sidebarVideo ?? null,
    relatedServices: article.relatedServices ?? [],
    isFeatured: article.isFeatured ?? article.slug === featuredArticle.slug,
    seoTitle: article.seoTitle ?? `${article.title} | Limex`,
    seoDescription: article.seoDescription ?? article.summary,
  };
}

function fallbackIndex(): BlogIndexResponse {
  const featured = fallbackArticle(featuredArticle);
  return {
    featured,
    items: blogArticles.map(fallbackArticle),
    categories: [...new Set(allBlogArticles.map((article) => article.category))],
    total: allBlogArticles.length,
    page: 1,
    pageSize: allBlogArticles.length,
    fallback: true,
  };
}

function backendUrl(path: string) {
  const base = process.env.BACKEND_INTERNAL_URL ?? `http://127.0.0.1:${process.env.BACKEND_PORT ?? "4000"}`;
  return `${base.replace(/\/$/, "")}${path}`;
}

async function fetchBackend<T>(path: string): Promise<{ value: T | null; available: boolean }> {
  try {
    const response = await fetch(backendUrl(path), { cache: "no-store" });
    if (!response.ok) return { value: null, available: response.status === 404 };
    const payload = await response.json() as { data?: T };
    return { value: payload.data ?? null, available: true };
  } catch {
    return { value: null, available: false };
  }
}

export async function getPublicBlogIndexServer(locale: BlogLocale = "en", page = 1, pageSize = 30) {
  const result = await fetchBackend<BlogIndexResponse>(`/api/blog/posts?locale=${locale}&page=${page}&pageSize=${pageSize}`);
  if (result.available && result.value) return result.value;
  if (result.available) return { featured: null, items: [], categories: [], total: 0, page, pageSize, fallback: false } satisfies BlogIndexResponse;
  if (page === 1) return fallbackIndex();
  return { featured: null, items: [], categories: [], total: 0, page, pageSize, fallback: true } satisfies BlogIndexResponse;
}

export async function getPublicBlogPostServer(slug: string, locale: BlogLocale = "en") {
  const result = await fetchBackend<{ article: BlogArticle; redirectTo: string | null }>(`/api/blog/posts/${encodeURIComponent(slug)}?locale=${locale}`);
  if (result.available) return result.value;
  const article = getBlogArticle(slug);
  return article ? { article: fallbackArticle(article), redirectTo: null } : null;
}
