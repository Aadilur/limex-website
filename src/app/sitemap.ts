import type { MetadataRoute } from "next";

import { getPublicBlogIndexServer } from "@/lib/blog-server";
import { getPublicServicesServer } from "@/lib/service-server";

export const dynamic = "force-dynamic";

async function loadAllBlogPages(locale: "en" | "bn") {
  const first = await getPublicBlogIndexServer(locale, 1, 30);
  const pages = [first];
  const pageCount = Math.ceil(first.total / Math.max(first.pageSize, 1));
  for (let page = 2; page <= pageCount; page += 1) pages.push(await getPublicBlogIndexServer(locale, page, 30));
  return pages.flatMap((page) => [page.featured, ...page.items]).filter(Boolean);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const [articles, banglaArticles, services] = await Promise.all([loadAllBlogPages("en"), loadAllBlogPages("bn"), getPublicServicesServer()]);
  const allArticles = [...articles, ...banglaArticles];
  const uniqueArticles = allArticles
    .filter(Boolean)
    .filter((article) => !article!.noIndex)
    .filter((article, index, all) => all.findIndex((item) => item!.slug === article!.slug && item!.contentLocale === article!.contentLocale) === index);
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/services`, changeFrequency: "weekly", priority: 0.8 },
    ...services.items.filter((service) => service.hasDetailPage).map((service) => ({ url: `${baseUrl}/services/${service.slug}`, changeFrequency: "monthly" as const, priority: 0.75 })),
    { url: `${baseUrl}/bn/services`, changeFrequency: "weekly", priority: 0.7 },
    ...services.items.filter((service) => service.hasDetailPage).map((service) => ({ url: `${baseUrl}/bn/services/${service.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${baseUrl}/business-tools`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/bn/blog`, changeFrequency: "weekly", priority: 0.75 },
    ...uniqueArticles.map((article) => {
      const pathPrefix = article!.contentLocale === "bn" ? "bn/blog" : "blog";
      return { url: `${baseUrl}/${pathPrefix}/${article!.slug}`, lastModified: article!.updatedAt ?? article!.publishedAt ?? undefined, changeFrequency: "monthly" as const, priority: 0.7 };
    }),
  ];
}
