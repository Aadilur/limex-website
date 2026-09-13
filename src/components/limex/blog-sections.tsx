"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import {
  blogArticles,
  blogFilters,
  featuredArticle,
  getRelatedBlogArticles,
  getBlogCoverFallbackUrl,
  type BlogArticle,
  type BlogContentBlock,
} from "./blog-data";
import { getBlogToneClasses } from "./styles";
import { ContactModal } from "./contact-section";
import { ActionButton, Breadcrumbs, SearchIcon } from "./ui";
import { blogRichTextClass } from "./blog-rich-text";
import { SanitizedRichText } from "./sanitized-rich-text";
import { getPublicBlogIndex, type BlogIndexResponse, type BlogLocale } from "@/lib/blog-api";

function categoryLabel(category: string) {
  return category.toUpperCase();
}

function blogHref(slug: string, locale: BlogLocale = "en") {
  return locale === "bn" ? `/bn/blog/${slug}` : `/blog/${slug}`;
}

function BlogSearchField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">Search guides, topics or keywords</span>
      <input
        className="h-button-lg w-full rounded-control border border-[#e0e0e5] bg-[#f9f8f6] px-card-pad-sm pr-12 text-body-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-pink focus:ring-2 focus:ring-pink/15"
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search guides, topics or keywords"
      />
      <SearchIcon className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2" />
    </label>
  );
}

function BlogCover({ article, variant = "card" }: { article: BlogArticle; variant?: "card" | "featured" | "hero" | "related" | "thumb" }) {
  const tone = getBlogToneClasses(article.coverTone);
  const coverUrl = article.coverUrl || getBlogCoverFallbackUrl(article);
  const isFeatured = variant === "featured";
  const isHero = variant === "hero";
  const isThumb = variant === "thumb";
  const isCard = variant === "card";
  const isRelated = variant === "related";
  const coverWidthClass = isThumb ? "" : isCard ? "w-[112px] shrink-0 sm:w-full" : isRelated ? "w-[112px] shrink-0 lg:w-full" : "w-full";
  const coverClass = isFeatured
    ? "aspect-[2/1] rounded-[16px]"
    : isHero
      ? "aspect-[16/9] rounded-[20px] lg:aspect-[852/430] lg:rounded-[28px]"
      : isThumb
        ? "size-20 rounded-[16px]"
        : isRelated
          ? "aspect-square rounded-l-[22px] lg:aspect-[852/430] lg:rounded-l-none lg:rounded-t-[22px]"
          : isCard
            ? "aspect-square rounded-l-[22px] sm:aspect-[852/430] sm:rounded-l-none sm:rounded-t-[22px]"
            : "aspect-[852/430] rounded-t-[22px]";
  const paperClass = isThumb
    ? "left-8 top-[31px] h-[42px] w-[34px] rounded-[8px]"
      : isHero
        ? "right-[12%] top-[18%] h-[42%] w-[30%] rounded-[20px]"
      : isCard
        ? "right-3 top-3 h-[58px] w-[76px] rounded-[10px] sm:right-7 sm:top-[42px] sm:h-[82px] sm:w-[118px] sm:rounded-[16px]"
        : isRelated
          ? "right-3 top-3 h-[58px] w-[76px] rounded-[10px] lg:right-7 lg:top-[42px] lg:h-[82px] lg:w-[118px] lg:rounded-[16px]"
          : "right-7 top-[42px] h-[82px] w-[118px] rounded-[16px]";
  const lineClass = isThumb ? "left-[7px]" : isCard ? "left-3 sm:left-4" : isRelated ? "left-3 lg:left-4" : "left-4";
  const lineOneClass = isCard ? "w-[42px] sm:w-[70px]" : isRelated ? "w-[42px] lg:w-[70px]" : "w-[70px]";
  const lineTwoClass = isCard ? "w-[34px] sm:w-[54px]" : isRelated ? "w-[34px] lg:w-[54px]" : "w-[54px]";
  const lineThreeClass = isCard ? "w-[50px] sm:w-[82px]" : isRelated ? "w-[50px] lg:w-[82px]" : "w-[82px]";
  const coverSlotClass = isCard ? "hidden sm:block" : isRelated ? "hidden lg:block" : "block";
  const coverNumberClass = isCard ? "text-[34px] sm:text-page-title" : isRelated ? "text-[34px] lg:text-page-title" : "text-page-title";

  return (
    <div className={`relative shrink-0 overflow-hidden ${tone.surface} ${coverWidthClass} ${coverClass}`.trim()} aria-hidden={coverUrl ? undefined : true}>
      {coverUrl ? (
        <img
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          src={coverUrl}
          alt={article.coverAlt || article.title}
          loading={isHero || isFeatured ? "eager" : "lazy"}
          decoding="async"
        />
      ) : isFeatured ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <strong className={`text-overline ${tone.text}`.trim()}>IMAGE PLACEHOLDER</strong>
          <span className="mt-cluster-sm text-body-sm text-muted">{article.coverNote}</span>
        </div>
      ) : (
        <>
          <span className="absolute left-6 top-6 h-[3px] w-7 rounded-full bg-pink" />
          <span className="absolute left-6 top-[34px] h-0.5 w-[124px] rounded-full bg-white/70" />
          <span className="absolute left-6 top-[42px] h-0.5 w-[76px] rounded-full bg-white/55" />
          <span className={`absolute ${paperClass} overflow-hidden bg-white/80`.trim()}>
            <span className={`absolute ${lineClass} top-5 h-0.5 ${lineOneClass} rounded-full bg-pink/70`.trim()} />
            <span className={`absolute ${lineClass} top-[30px] h-0.5 ${lineTwoClass} rounded-full bg-muted/45`.trim()} />
            <span className={`absolute ${lineClass} top-10 h-0.5 ${lineThreeClass} rounded-full bg-muted/30`.trim()} />
          </span>
          {!isThumb && !isHero ? <span className={`absolute bottom-6 left-6 ${coverSlotClass} text-overline ${tone.text}`.trim()}>COVER SLOT</span> : null}
          {!isThumb ? <strong className={`absolute bottom-2 right-7 ${coverNumberClass} ${tone.text}`.trim()}>{article.coverNumber}</strong> : null}
        </>
      )}
      {isHero && !coverUrl ? <span className={`absolute bottom-7 left-7 text-meta ${tone.text}`.trim()}>ARTICLE COVER</span> : null}
    </div>
  );
}

function BlogArticleCard({ article, locale = "en" }: { article: BlogArticle; locale?: BlogLocale }) {
  return (
    <a
      className="group flex h-full min-h-0 flex-row overflow-hidden rounded-card border border-[#e5e0d6] bg-white transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 sm:flex-col"
      href={blogHref(article.slug, locale)}
    >
      <BlogCover article={article} />
      <div className="flex min-w-0 min-h-0 flex-1 flex-col items-start gap-1.5 overflow-hidden px-3.5 py-3.5 sm:gap-cluster-sm sm:px-card-pad sm:pb-5 sm:pt-cluster-lg">
        <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.1em] text-pink sm:text-overline">{categoryLabel(article.category)} <span className="px-1">·</span> {article.date}</p>
        <h3 className="line-clamp-2 font-brand text-[16px] font-bold leading-[1.22] tracking-[-0.02em] text-ink sm:text-subheading">{article.title}</h3>
        <p className="line-clamp-2 text-[13px] leading-[1.45] text-muted sm:line-clamp-3 sm:text-body-sm">{article.summary}</p>
        {article.relatedServices?.length ? <p className="hidden line-clamp-1 text-micro font-semibold text-[#6d806e] sm:block">Related: {article.relatedServices.slice(0, 2).map((service) => service.label).join(" · ")}</p> : null}
        <span className="mt-auto pt-1.5 text-[13px] font-semibold text-pink transition-transform duration-200 group-hover:translate-x-0.5 sm:pt-3 sm:text-body-sm">Read more <span aria-hidden="true">↗</span></span>
      </div>
    </a>
  );
}

export function BlogRelatedArticleCard({ article, locale = "en" }: { article: BlogArticle; locale?: BlogLocale }) {
  return (
    <a
      className="group flex h-full min-h-0 flex-row overflow-hidden rounded-card bg-white transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 lg:flex-col"
      href={blogHref(article.slug, locale)}
    >
      <BlogCover article={article} variant="related" />
      <div className="flex min-w-0 min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-3.5 py-3.5 lg:gap-cluster-xs lg:px-card-pad lg:pb-3 lg:pt-cluster-lg">
        <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.1em] text-pink lg:text-overline">{categoryLabel(article.category)} <span className="px-1">·</span> {article.date}</p>
        <h3 className="line-clamp-2 font-brand text-[16px] font-bold leading-[1.22] tracking-[-0.02em] text-ink lg:text-subheading">{article.title}</h3>
        <p className="line-clamp-2 text-[13px] leading-[1.45] text-muted lg:line-clamp-3 lg:text-body-sm">{article.summary}</p>
        <span className="mt-auto text-[13px] font-semibold text-pink lg:text-body-xs">Read more <span aria-hidden="true">↗</span></span>
      </div>
    </a>
  );
}

function BlogSidebarArticleItem({ article, locale = "en" }: { article: BlogArticle; locale?: BlogLocale }) {
  return (
    <a
      className="group flex min-h-[92px] items-start gap-3 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
      href={blogHref(article.slug, locale)}
    >
      <BlogCover article={article} variant="thumb" />
      <span className="flex min-w-0 flex-col gap-1 overflow-hidden">
        <span className="text-overline text-pink">{categoryLabel(article.category)} <span className="px-0.5">·</span> {article.date}</span>
        <span className="text-body-sm font-semibold text-ink transition-colors group-hover:text-pink">{article.title}</span>
      </span>
    </a>
  );
}

export function BlogIndexContent({ initialData, locale = "en" }: { initialData?: BlogIndexResponse; locale?: BlogLocale }) {
  const initialFeatured = initialData?.featured ?? (initialData?.fallback === false ? null : featuredArticle);
  const initialArticles = initialData?.items ?? blogArticles;
  const initialCategories = initialData?.categories ?? blogFilters.filter((filter) => filter.value !== "all").map((filter) => filter.value);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [featured, setFeatured] = useState(initialFeatured);
  const [articles, setArticles] = useState(initialArticles);
  const [categories, setCategories] = useState(initialCategories);
  const filters = useMemo(() => [
    { label: "All posts", value: "all" },
    ...categories.map((category) => ({ label: category, value: category })),
  ], [categories]);

  useEffect(() => {
    let cancelled = false;
    void getPublicBlogIndex({ locale })
      .then((nextData) => {
        if (cancelled) return;
        setFeatured(nextData.featured ?? (nextData.fallback ? initialFeatured : null));
        setArticles(nextData.items);
        setCategories(nextData.categories);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [initialFeatured, locale]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleArticles = useMemo(
    () => articles.filter((article) => {
      const matchesFilter = activeFilter === "all" || article.category === activeFilter;
      const searchableText = [article.title, article.summary, article.category, ...article.tags].join(" ").toLowerCase();
      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
    }),
    [activeFilter, articles, normalizedQuery],
  );

  return (
    <>
      <section className="bg-page px-0 pb-6 lg:px-page-gutter-lg lg:pb-10" aria-labelledby="blog-page-title">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
        <div className="mt-6 flex flex-col gap-6 lg:mt-section-y lg:flex-row lg:items-start lg:justify-between lg:gap-section-gap-lg">
          <div className="max-w-[730px]">
            <p className="text-label text-pink">INSIGHTS &amp; GUIDES</p>
            <h1 className="mt-cluster-sm max-w-[730px] font-brand text-[36px] leading-[1.04] tracking-[-0.04em] text-ink sm:text-page-title-mobile lg:text-page-title">Practical guidance for growing with confidence</h1>
            <p className="mt-3 max-w-[670px] text-body-sm text-muted sm:text-body-lg">Clear, useful articles on registration, tax, compliance and building your business.</p>
            <p className="mt-cluster hidden text-body-sm font-text text-ink sm:block">New guides added every week</p>
          </div>
          <div className="w-full rounded-nav bg-white p-3.5 lg:max-w-[440px] lg:p-card-pad">
            <div className="mb-cluster flex items-center justify-between gap-3">
              <p className="text-label text-pink">SEARCH THE JOURNAL</p>
              <a className="shrink-0 text-[13px] font-semibold text-pink hover:text-ink sm:text-body-xs" href={locale === "bn" ? "/blog" : "/bn/blog"}>{locale === "bn" ? "English" : "বাংলা"}</a>
            </div>
            <BlogSearchField id="blog-hero-search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
      </section>

      {featured ? <section className="bg-page px-0 py-6 lg:px-page-gutter-lg lg:py-10" aria-labelledby="featured-guide-title">
        <div className="flex items-center justify-between gap-5">
          <h2 className="font-brand text-section-title-mobile text-ink lg:text-section-title" id="featured-guide-title">Featured guide</h2>
          <a className="shrink-0 whitespace-nowrap text-right text-[13px] font-semibold text-pink transition-colors hover:text-ink sm:text-body-sm" href="#latest">View all posts <span aria-hidden="true">↗</span></a>
        </div>
        <a
          className="group mt-4 grid gap-4 rounded-[22px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 lg:mt-6 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-center lg:gap-8"
          href={blogHref(featured.slug, locale)}
        >
          <BlogCover article={featured} variant="featured" />
          <div className="flex min-w-0 flex-col gap-2.5 lg:gap-3">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-pink lg:text-meta">{categoryLabel(featured.category)} <span className="px-1">·</span> {featured.readTime}</p>
            <h2 className="font-brand text-[24px] font-bold leading-[1.15] tracking-[-0.03em] text-ink lg:text-section-title">{featured.title}</h2>
            <p className="max-w-[630px] text-body-sm text-muted lg:text-body-lg">{featured.summary}</p>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-body-xs lg:mt-cluster-sm lg:gap-cluster-sm lg:text-body-sm">
              <span className="text-muted">{featured.date} <span className="px-1">·</span> By {featured.author}</span>
              <span className="font-semibold text-pink transition-transform duration-200 group-hover:translate-x-0.5">Read the guide <span aria-hidden="true">↗</span></span>
            </div>
          </div>
        </a>
      </section> : null}

      <section className="bg-page px-0 py-6 lg:px-page-gutter-lg lg:py-10" id="latest" aria-labelledby="latest-journal-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-section-gap-lg">
          <div>
            <h2 className="font-brand text-section-title-mobile text-ink lg:text-section-title" id="latest-journal-title">Latest from the journal</h2>
            <p className="mt-2 text-body-sm text-muted lg:mt-cluster-sm lg:text-body-lg">Short, practical reads for your next business decision.</p>
          </div>
          <div className="hidden w-full lg:block lg:max-w-[392px]">
            <BlogSearchField id="blog-latest-search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-6 lg:gap-3" role="group" aria-label="Filter blog posts">
          {filters.map((filter) => {
            const active = activeFilter === filter.value;
            return (
              <button
                className={`inline-flex h-8 shrink-0 items-center rounded-pill border px-3 text-[13px] font-text transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 lg:h-[34px] lg:px-4 lg:text-body-xs ${active ? "border-ink bg-ink text-white" : "border-[#e0e0e5] bg-white text-muted hover:border-pink/45 hover:text-ink"}`.trim()}
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-footer font-text text-muted lg:mt-section-gap-lg" aria-live="polite">Showing {visibleArticles.length} {visibleArticles.length === 1 ? "guide" : "guides"}</p>
        {visibleArticles.length ? (
          <div className="mt-3 grid grid-cols-1 gap-3.5 sm:gap-4 lg:mt-4 lg:grid-cols-3 lg:gap-8">
            {visibleArticles.map((article) => <BlogArticleCard article={article} locale={locale} key={article.slug} />)}
          </div>
        ) : (
          <div className="mt-6 rounded-card border border-[#e5e0d6] bg-white px-4 py-8 text-center lg:mt-section-gap-lg lg:px-card-pad lg:py-10">
            <p className="text-body-lg font-semibold text-ink">No guides match that search.</p>
            <button className="mt-cluster text-body-sm font-semibold text-pink hover:text-ink" type="button" onClick={() => { setQuery(""); setActiveFilter("all"); }}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  );
}

function BlogContentBlockView({ block }: { block: BlogContentBlock }) {
  if (block.type === "heading") return <h2 className="pt-2 font-brand text-section-title text-ink">{block.text}</h2>;
  if (block.type === "paragraph") return <p className="text-body-lg text-muted">{block.text}</p>;

  return (
    <div className="relative flex gap-cluster border-b border-[#e5e3e5] py-4 last:border-b-0">
      <p className="shrink-0 text-subheading font-bold text-pink">{block.number}</p>
      <div>
        <h3 className="text-body-lg font-semibold text-ink">{block.title}</h3>
        <p className="mt-1 text-body-sm text-muted">{block.text}</p>
      </div>
    </div>
  );
}

function BlogBody({ article }: { article: BlogArticle }) {
  if (article.bodyHtml) {
    return <SanitizedRichText html={article.bodyHtml} className={blogRichTextClass} />;
  }

  return (
    <div className="mt-5 flex flex-col gap-2">
      {(article.blocks ?? []).map((block, index) => <BlogContentBlockView block={block} key={`${article.slug}-${block.type}-${index}`} />)}
    </div>
  );
}

function blogServiceHref(article: BlogArticle, service: NonNullable<BlogArticle["relatedServices"]>[number]) {
  if (service.href !== "#contact") return service.href;
  const params = new URLSearchParams({ from: "blog", article: article.slug, service: service.serviceKey });
  return `/?${params.toString()}#contact-form`;
}

function BlogRelatedServices({ article }: { article: BlogArticle }) {
  if (!article.relatedServices?.length) return null;

  return (
    <div className="mt-6 flex flex-col gap-2 lg:mt-section-gap-lg lg:gap-cluster-sm" aria-label="Related services">
      <p className="text-meta font-semibold text-pink">RELATED SERVICES</p>
      <div className="flex flex-wrap gap-2">
        {article.relatedServices.slice(0, 4).map((service) => (
          <a className="inline-flex min-h-8 items-center gap-1.5 rounded-pill border border-[#dfd8cf] bg-white px-3 text-[13px] font-semibold text-ink transition-colors hover:border-pink/50 hover:text-pink lg:min-h-9 lg:gap-2 lg:px-3.5 lg:text-body-xs" href={blogServiceHref(article, service)} key={`${service.serviceKey}-${service.sortOrder}`}>
            <span>{service.label}</span>
            <span className="text-pink" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function BlogDetailContent({ article, relatedArticles, locale = "en" }: { article: BlogArticle; relatedArticles?: BlogArticle[]; locale?: BlogLocale }) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const visibleRelatedArticles = relatedArticles ?? getRelatedBlogArticles(article.slug, 3).map((item) => ({ ...item, id: item.id ?? item.slug }));
  const primaryService = article.relatedServices?.find((service) => service.isPrimary) ?? article.relatedServices?.[0];

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.summary, url: window.location.href });
      } else {
        await navigator.clipboard?.writeText(window.location.href);
      }
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1800);
    } catch {
      setShareState("idle");
    }
  };

  return (
    <>
      <section className="bg-page px-0 pb-6 lg:px-page-gutter-lg lg:pb-10" aria-labelledby="article-title">
        <div className="flex flex-col items-start gap-2 text-footer font-text text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-cluster-lg">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: locale === "bn" ? "/bn/blog" : "/blog" }, { label: article.category }]} />
          <div className="flex flex-wrap items-center gap-3">
            <a className="shrink-0 text-body-xs font-semibold text-pink hover:text-ink" href={locale === "bn" ? "/bn/blog" : "/blog"}>← Back to all posts</a>
            <a className="shrink-0 text-body-xs font-semibold text-pink hover:text-ink" href={locale === "bn" ? "/blog" : "/bn/blog"}>{locale === "bn" ? "English" : "বাংলা"}</a>
          </div>
        </div>
        <div className="mt-6 max-w-[960px] lg:mt-section-gap-xl">
          <p className="text-[11px] font-semibold tracking-[0.04em] text-pink lg:text-meta">{categoryLabel(article.category)} <span className="px-1">·</span> {article.readTime}</p>
          <h1 className="mt-4 max-w-[950px] font-brand text-[36px] font-bold leading-[1.04] tracking-[-0.04em] text-ink sm:text-page-title-mobile lg:mt-section-gap-lg lg:text-page-title" id="article-title">{article.title}</h1>
          <p className="mt-4 max-w-[760px] text-[17px] leading-[1.58] text-muted lg:mt-section-gap-lg lg:text-body-lg">{article.summary}</p>
        </div>
        <div className="mt-6 flex flex-col items-start gap-3 border-b border-[#e5e3e5] pb-4 text-body-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:mt-section-y lg:gap-cluster lg:pb-card-pad">
          <p>{article.date} <span className="px-1">·</span> By {article.author}{article.updatedDate ? ` · Updated ${article.updatedDate}` : ""}</p>
          <button className="inline-flex min-h-10 w-full items-center justify-center rounded-pill border border-[#e5e0d6] bg-white px-4 text-[13px] font-semibold text-pink transition-colors hover:border-pink/45 hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 sm:w-auto sm:px-6 sm:text-body-xs" type="button" onClick={handleShare}>
            {shareState === "copied" ? "Link copied ✓" : "Share this guide ↗"}
          </button>
        </div>
      </section>

      <section className="bg-page px-0 py-6 lg:px-page-gutter-lg lg:py-10" aria-labelledby="article-content-label">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-pink lg:text-meta" id="article-content-label">01 <span className="px-1">/</span> ARTICLE CONTENT</p>
        <div className="mt-6 grid gap-6 lg:mt-section-gap-lg lg:grid-cols-[minmax(0,820px)_336px] lg:gap-section-gap-lg">
          <article className="min-w-0">
            <BlogCover article={article} variant="hero" />
            {article.coverCaption ? <p className="mt-cluster text-body-xs text-muted">{article.coverCaption}</p> : null}
            <BlogBody article={article} />
            <BlogRelatedServices article={article} />
            <div className="mt-8 rounded-[18px] bg-navy px-4 py-4 text-white lg:mt-section-y lg:rounded-card lg:px-card-pad lg:py-card-pad">
              <p className="text-meta font-semibold text-[#f5b8c7]">GET SUPPORT</p>
              <p className="mt-cluster-sm max-w-[620px] font-brand text-subheading">Want a clear next step for your business?</p>
              {primaryService ? <p className="mt-cluster-sm max-w-[620px] text-body-sm text-white/65">We can help with {primaryService.label.toLowerCase()} and the next steps around it.</p> : null}
              <div className="mt-cluster-lg flex flex-wrap items-center gap-cluster-sm">
                <ContactModal articleSlug={article.slug} buttonClassName="min-w-[170px]" buttonLabel="Book this service" serviceKey={primaryService?.serviceKey} />
                {primaryService && primaryService.href !== "#contact" ? <a className="text-body-xs font-semibold text-white/75 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white" href={primaryService.href}>View {primaryService.label.toLowerCase()} ↗</a> : null}
              </div>
            </div>
          </article>

          <aside className="flex min-w-0 flex-col gap-5 lg:gap-section-gap" aria-label="More from the journal">
            {article.sidebarVideo?.videoId ? (
              <div className="rounded-[18px] border border-[#e5e0d6] bg-white px-4 py-4 lg:rounded-card lg:px-card-pad lg:py-card-pad">
                <p className="text-meta font-semibold text-pink">WATCH THE TUTORIAL</p>
                <div className="mt-3 aspect-video overflow-hidden rounded-[12px] bg-[#f3f1ec] lg:mt-cluster lg:rounded-[16px]">
                  <iframe className="size-full" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(article.sidebarVideo.videoId)}?rel=0&playsinline=1`} title={article.sidebarVideo.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                <p className="mt-cluster-sm text-body-sm font-semibold text-ink">{article.sidebarVideo.title}</p>
              </div>
            ) : null}
            {visibleRelatedArticles.length ? <div className="rounded-[18px] border border-[#e5e0d6] bg-white px-4 py-4 lg:rounded-card lg:px-card-pad lg:py-card-pad">
              <h2 className="text-meta font-semibold text-pink">MORE FROM THE JOURNAL</h2>
              <div className="mt-5 flex flex-col gap-3 lg:mt-section-gap-lg lg:gap-cluster">
                {visibleRelatedArticles.map((relatedArticle, index) => (
                  <div key={relatedArticle.slug}>
                    {index ? <div className="mb-3 h-px bg-[#e5e3e5] lg:mb-4" /> : null}
                    <BlogSidebarArticleItem article={relatedArticle} locale={locale} />
                  </div>
                ))}
              </div>
            </div> : null}
            <div className="rounded-[18px] bg-navy px-4 py-4 text-white lg:rounded-card lg:px-card-pad lg:py-card-pad">
              <p className="text-meta font-semibold text-[#f5b8c7]">NEED A HAND?</p>
              <h2 className="mt-cluster font-brand text-subheading">Have a question about your next step?</h2>
              <p className="mt-cluster-sm text-body-sm text-soft-muted">Talk to our team before you move forward.</p>
              <ContactModal articleSlug={article.slug} buttonClassName="mt-5 w-full justify-center lg:mt-cluster-lg" buttonLabel="Ask a question" serviceKey={primaryService?.serviceKey} />
            </div>
          </aside>
        </div>
      </section>

      {visibleRelatedArticles.length ? <section className="bg-page px-0 py-6 lg:px-page-gutter-lg lg:py-10" aria-labelledby="more-practical-reads-title">
        <div className="flex flex-col gap-cluster-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-meta font-semibold text-pink">02 <span className="px-1">/</span> MORE TO READ</p>
            <h2 className="mt-cluster-sm font-brand text-section-title-mobile text-ink lg:text-section-title" id="more-practical-reads-title">More practical reads</h2>
            <p className="mt-cluster-sm text-body-sm text-muted lg:text-body">Keep exploring the journal for your next business decision.</p>
          </div>
          <a className="text-body-sm font-semibold text-pink hover:text-ink" href={locale === "bn" ? "/bn/blog" : "/blog"}>View all posts <span aria-hidden="true">↗</span></a>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 lg:mt-section-gap-lg lg:grid-cols-3 lg:gap-section-gap">
          {visibleRelatedArticles.map((relatedArticle) => <BlogRelatedArticleCard article={relatedArticle} locale={locale} key={relatedArticle.slug} />)}
        </div>
      </section> : null}
    </>
  );
}
