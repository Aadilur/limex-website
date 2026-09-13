import type { Metadata } from "next";

import { getBlogCoverFallbackUrl, type BlogArticle } from "@/components/limex/blog-data";

function publicBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function createBlogMetadata(article: BlogArticle | undefined, slug: string, locale: "en" | "bn" = "en"): Metadata {
  if (!article) return { title: "Article not found | Limex" };

  const baseUrl = publicBaseUrl();
  const isBanglaArticle = locale === "bn" && article.contentLocale === "bn";
  const pathPrefix = isBanglaArticle ? "bn/blog" : "blog";
  const canonical = article.canonicalUrl || `${baseUrl}/${pathPrefix}/${article.slug || slug}`;
  const coverUrl = article.coverUrl || getBlogCoverFallbackUrl(article);
  const image = coverUrl ? new URL(coverUrl, baseUrl).toString() : undefined;
  const title = article.seoTitle ?? `${article.title} | Limex`;
  const description = article.seoDescription ?? article.summary;

  return {
    title,
    description,
    keywords: article.tags,
    alternates: { canonical },
    robots: article.noIndex || (locale === "bn" && !isBanglaArticle) ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: article.publishedAt ?? article.date,
      modifiedTime: article.updatedAt ?? article.updatedDate,
      authors: [article.author],
      images: image ? [{ url: image, alt: article.coverAlt || article.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
