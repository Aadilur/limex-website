import { BlogDetailContent, BlogIndexContent } from "./blog-sections";
import { pageContentClass, pageLayoutClass, pageShellClass } from "./layout";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { getBlogCoverFallbackUrl, type BlogArticle } from "./blog-data";
import { getPublicBlogIndexServer } from "@/lib/blog-server";
import type { BlogLocale } from "@/lib/blog-api";

export async function BlogIndexPage({ locale = "en" }: { locale?: BlogLocale } = {}) {
  const initialData = await getPublicBlogIndexServer(locale);

  return (
    <main className={pageLayoutClass} lang={locale === "bn" ? "bn-BD" : "en-BD"}>
      <section className={pageShellClass} id="top">
        <SiteHeader fullBleed />
        <div className={pageContentClass}>
          <BlogIndexContent initialData={initialData} locale={locale} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export async function BlogDetailPage({ article, locale = "en" }: { article: BlogArticle; locale?: BlogLocale }) {
  const relatedIndex = await getPublicBlogIndexServer(locale);
  const relatedArticles = [relatedIndex.featured, ...relatedIndex.items]
    .filter((item): item is BlogArticle => Boolean(item && item.slug !== article.slug))
    .slice(0, 3);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const localizedPath = locale === "bn" && article.contentLocale === "bn" ? "bn/blog" : "blog";
  const canonical = article.canonicalUrl || `${baseUrl}/${localizedPath}/${article.slug}`;
  const coverUrl = article.coverUrl || getBlogCoverFallbackUrl(article);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    inLanguage: article.contentLocale === "bn" ? "bn-BD" : "en-BD",
    description: article.seoDescription || article.summary,
    articleSection: article.category,
    keywords: article.tags.join(", "),
    datePublished: article.publishedAt ?? article.date,
    ...(article.updatedAt || article.updatedDate ? { dateModified: article.updatedAt ?? article.updatedDate } : {}),
    author: { "@type": "Person", name: article.author },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    ...(coverUrl ? { image: [new URL(coverUrl, baseUrl).toString()] } : {}),
    publisher: {
      "@type": "Organization",
      name: "Limex",
      logo: { "@type": "ImageObject", url: new URL("/brand/limex-logo.png", baseUrl).toString() },
    },
  };
  const structuredDataJson = JSON.stringify(structuredData).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson }} />
      <main className={pageLayoutClass} lang={article.contentLocale === "bn" ? "bn-BD" : "en-BD"}>
      <section className={pageShellClass} id="top">
        <SiteHeader fullBleed />
        <div className={pageContentClass}>
          <BlogDetailContent article={article} relatedArticles={relatedArticles} locale={locale} />
        </div>
      </section>
      <SiteFooter />
      </main>
    </>
  );
}
