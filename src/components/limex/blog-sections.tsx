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
import { ActionButton, SearchIcon } from "./ui";
import { getPublicBlogIndex, type BlogIndexResponse, type BlogLocale } from "@/lib/blog-api";
import { sanitizeBlogHtml } from "@/lib/blog-content";

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
  const coverWidthClass = isThumb ? "" : "w-full";
  const coverClass = isFeatured
    ? "aspect-[2/1] rounded-[16px]"
    : isHero
      ? "aspect-[852/430] rounded-[28px]"
      : isThumb
        ? "size-20 rounded-[16px]"
        : variant === "related"
          ? "aspect-[852/430] rounded-t-[22px]"
          : "aspect-[852/430] rounded-t-[22px]";
  const paperClass = isThumb
    ? "left-8 top-[31px] h-[42px] w-[34px] rounded-[8px]"
    : isHero
      ? "right-[12%] top-[18%] h-[42%] w-[30%] rounded-[20px]"
      : "right-7 top-[42px] h-[82px] w-[118px] rounded-[16px]";
  const lineClass = isThumb ? "left-[7px]" : "left-4";

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
            <span className={`absolute ${lineClass} top-5 h-0.5 w-[70px] rounded-full bg-pink/70`.trim()} />
            <span className={`absolute ${lineClass} top-[30px] h-0.5 w-[54px] rounded-full bg-muted/45`.trim()} />
            <span className={`absolute ${lineClass} top-10 h-0.5 w-[82px] rounded-full bg-muted/30`.trim()} />
          </span>
          {!isThumb && !isHero ? <span className={`absolute bottom-6 left-6 text-overline ${tone.text}`.trim()}>COVER SLOT</span> : null}
          {!isThumb ? <strong className={`absolute bottom-2 right-7 text-page-title ${tone.text}`.trim()}>{article.coverNumber}</strong> : null}
        </>
      )}
      {isHero && !coverUrl ? <span className={`absolute bottom-7 left-7 text-meta ${tone.text}`.trim()}>ARTICLE COVER</span> : null}
    </div>
  );
}

function BlogArticleCard({ article, locale = "en" }: { article: BlogArticle; locale?: BlogLocale }) {
  return (
    <a
      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-[#e5e0d6] bg-white transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
      href={blogHref(article.slug, locale)}
    >
      <BlogCover article={article} />
      <div className="flex min-h-0 flex-1 flex-col items-start gap-cluster-xs overflow-hidden px-card-pad-sm pb-4 pt-cluster lg:gap-cluster-sm lg:px-card-pad lg:pb-5 lg:pt-cluster-lg">
        <p className="line-clamp-1 text-overline text-pink">{categoryLabel(article.category)} <span className="px-1">·</span> {article.date}</p>
        <h3 className="line-clamp-2 font-brand text-subheading text-ink">{article.title}</h3>
        <p className="line-clamp-3 text-body-sm text-muted">{article.summary}</p>
        {article.relatedServices?.length ? <p className="line-clamp-1 text-micro font-semibold text-[#6d806e]">Related: {article.relatedServices.slice(0, 2).map((service) => service.label).join(" · ")}</p> : null}
        <span className="mt-auto pt-3 text-body-sm font-semibold text-pink transition-transform duration-200 group-hover:translate-x-0.5">Read more <span aria-hidden="true">↗</span></span>
      </div>
    </a>
  );
}

export function BlogRelatedArticleCard({ article, locale = "en" }: { article: BlogArticle; locale?: BlogLocale }) {
  return (
    <a
      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-card bg-white transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
      href={blogHref(article.slug, locale)}
    >
      <BlogCover article={article} variant="related" />
      <div className="flex min-h-0 flex-1 flex-col gap-cluster-xs overflow-hidden px-card-pad pb-3 pt-cluster-lg">
        <p className="line-clamp-1 text-overline text-pink">{categoryLabel(article.category)} <span className="px-1">·</span> {article.date}</p>
        <h3 className="line-clamp-2 font-brand text-subheading text-ink">{article.title}</h3>
        <p className="line-clamp-3 text-body-sm text-muted">{article.summary}</p>
        <span className="mt-auto text-body-xs font-semibold text-pink">Read more <span aria-hidden="true">↗</span></span>
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
      <section className="bg-page px-page-gutter pb-section-y lg:px-page-gutter-lg lg:pb-10" aria-labelledby="blog-page-title">
        <p className="text-footer font-text text-muted">Home <span className="px-1">/</span> Blog</p>
        <div className="mt-section-y flex flex-col gap-section-gap lg:flex-row lg:items-start lg:justify-between lg:gap-section-gap-lg">
          <div className="max-w-[730px]">
            <p className="text-label text-pink">INSIGHTS &amp; GUIDES</p>
            <h1 className="mt-cluster-sm max-w-[730px] font-brand text-page-title text-ink max-lg:text-page-title-mobile">Practical guidance for growing with confidence</h1>
            <p className="mt-cluster max-w-[670px] text-body-lg text-muted">Clear, useful articles on registration, tax, compliance and building your business.</p>
            <p className="mt-cluster text-body-sm font-text text-ink">New guides added every week</p>
          </div>
          <div className="w-full rounded-nav bg-white p-card-pad-sm lg:max-w-[440px] lg:p-card-pad">
            <div className="mb-cluster flex items-center justify-between gap-3">
              <p className="text-label text-pink">SEARCH THE JOURNAL</p>
              <a className="shrink-0 text-body-xs font-semibold text-pink hover:text-ink" href={locale === "bn" ? "/blog" : "/bn/blog"}>{locale === "bn" ? "English" : "বাংলা"}</a>
            </div>
            <BlogSearchField id="blog-hero-search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
      </section>

      {featured ? <section className="bg-page px-page-gutter py-section-y lg:px-page-gutter-lg lg:py-10" aria-labelledby="featured-guide-title">
        <div className="flex items-center justify-between gap-5">
          <h2 className="font-brand text-section-title text-ink" id="featured-guide-title">Featured guide</h2>
          <a className="shrink-0 whitespace-nowrap text-right text-body-sm font-semibold text-pink transition-colors hover:text-ink" href="#latest">View all posts <span aria-hidden="true">↗</span></a>
        </div>
        <a
          className="group mt-6 grid gap-6 rounded-[22px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-center lg:gap-8"
          href={blogHref(featured.slug, locale)}
        >
          <BlogCover article={featured} variant="featured" />
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-meta font-semibold text-pink">{categoryLabel(featured.category)} <span className="px-1">·</span> {featured.readTime}</p>
            <h2 className="font-brand text-section-title text-ink">{featured.title}</h2>
            <p className="max-w-[630px] text-body-lg text-muted">{featured.summary}</p>
            <div className="mt-cluster-sm flex flex-wrap items-center justify-between gap-cluster-sm text-body-sm">
              <span className="text-muted">{featured.date} <span className="px-1">·</span> By {featured.author}</span>
              <span className="font-semibold text-pink transition-transform duration-200 group-hover:translate-x-0.5">Read the guide <span aria-hidden="true">↗</span></span>
            </div>
          </div>
        </a>
      </section> : null}

      <section className="bg-page px-page-gutter py-section-y lg:px-page-gutter-lg lg:py-10" id="latest" aria-labelledby="latest-journal-title">
        <div className="flex flex-col gap-section-gap lg:flex-row lg:items-start lg:justify-between lg:gap-section-gap-lg">
          <div>
            <h2 className="font-brand text-section-title text-ink" id="latest-journal-title">Latest from the journal</h2>
            <p className="mt-cluster-sm text-body-lg text-muted">Short, practical reads for your next business decision.</p>
          </div>
          <div className="w-full lg:max-w-[392px]">
            <BlogSearchField id="blog-latest-search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter blog posts">
          {filters.map((filter) => {
            const active = activeFilter === filter.value;
            return (
              <button
                className={`inline-flex h-[34px] shrink-0 items-center rounded-pill border px-4 text-body-xs font-text transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${active ? "border-ink bg-ink text-white" : "border-[#e0e0e5] bg-white text-muted hover:border-pink/45 hover:text-ink"}`.trim()}
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
        <p className="mt-section-gap-lg text-footer font-text text-muted" aria-live="polite">Showing {visibleArticles.length} {visibleArticles.length === 1 ? "guide" : "guides"}</p>
        {visibleArticles.length ? (
          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
            {visibleArticles.map((article) => <BlogArticleCard article={article} locale={locale} key={article.slug} />)}
          </div>
        ) : (
          <div className="mt-section-gap-lg rounded-card border border-[#e5e0d6] bg-white px-card-pad py-10 text-center">
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
    return (
      <div
        className="blog-rich-text mt-5 text-body-lg text-muted [&_a]:font-semibold [&_a]:text-pink [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-pink [&_blockquote]:pl-5 [&_blockquote]:italic [&_h2]:mt-8 [&_h2]:font-brand [&_h2]:text-section-title [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:font-brand [&_h3]:text-subheading [&_h3]:text-ink [&_hr]:my-8 [&_img]:my-6 [&_img]:max-h-[520px] [&_img]:w-full [&_img]:rounded-[20px] [&_img]:object-cover [&_li]:ml-5 [&_li]:list-disc [&_li]:py-1 [&_ol_li]:list-decimal [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_table]:my-6 [&_table]:w-full [&_td]:border [&_td]:border-[#e5e0d6] [&_td]:p-2 [&_th]:border [&_th]:border-[#e5e0d6] [&_th]:bg-[#f7f4ef] [&_th]:p-2"
        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(article.bodyHtml) }}
      />
    );
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
    <div className="mt-section-gap-lg flex flex-col gap-cluster-sm" aria-label="Related services">
      <p className="text-meta font-semibold text-pink">RELATED SERVICES</p>
      <div className="flex flex-wrap gap-2">
        {article.relatedServices.slice(0, 4).map((service) => (
          <a className="inline-flex min-h-9 items-center gap-2 rounded-pill border border-[#dfd8cf] bg-white px-3.5 text-body-xs font-semibold text-ink transition-colors hover:border-pink/50 hover:text-pink" href={blogServiceHref(article, service)} key={`${service.serviceKey}-${service.sortOrder}`}>
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
      <section className="bg-page px-page-gutter pb-section-y lg:px-page-gutter-lg lg:pb-10" aria-labelledby="article-title">
        <div className="flex flex-col items-start gap-cluster-sm text-footer font-text text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-cluster-lg">
          <p>Home <span className="px-1">/</span> Blog <span className="px-1">/</span> {article.category}</p>
          <div className="flex flex-wrap items-center gap-3">
            <a className="shrink-0 text-body-xs font-semibold text-pink hover:text-ink" href={locale === "bn" ? "/bn/blog" : "/blog"}>← Back to all posts</a>
            <a className="shrink-0 text-body-xs font-semibold text-pink hover:text-ink" href={locale === "bn" ? "/blog" : "/bn/blog"}>{locale === "bn" ? "English" : "বাংলা"}</a>
          </div>
        </div>
        <div className="mt-section-gap-xl max-w-[960px]">
          <p className="text-meta font-semibold text-pink">{categoryLabel(article.category)} <span className="px-1">·</span> {article.readTime}</p>
          <h1 className="mt-section-gap-lg max-w-[950px] font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="article-title">{article.title}</h1>
          <p className="mt-section-gap-lg max-w-[760px] text-body-lg text-muted">{article.summary}</p>
        </div>
        <div className="mt-section-y flex flex-wrap items-center justify-between gap-cluster border-b border-[#e5e3e5] pb-card-pad text-body-sm text-muted">
          <p>{article.date} <span className="px-1">·</span> By {article.author}{article.updatedDate ? ` · Updated ${article.updatedDate}` : ""}</p>
          <button className="inline-flex min-h-[44px] items-center rounded-pill border border-[#e5e0d6] bg-white px-6 text-body-xs font-semibold text-pink transition-colors hover:border-pink/45 hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2" type="button" onClick={handleShare}>
            {shareState === "copied" ? "Link copied ✓" : "Share this guide ↗"}
          </button>
        </div>
      </section>

      <section className="bg-page px-page-gutter py-section-y lg:px-page-gutter-lg lg:py-10" aria-labelledby="article-content-label">
        <p className="text-meta font-semibold text-pink" id="article-content-label">04 <span className="px-1">/</span> ARTICLE CONTENT</p>
        <div className="mt-section-gap-lg grid gap-section-gap lg:grid-cols-[minmax(0,820px)_336px] lg:gap-section-gap-lg">
          <article className="min-w-0">
            <BlogCover article={article} variant="hero" />
            {article.coverCaption ? <p className="mt-cluster text-body-xs text-muted">{article.coverCaption}</p> : null}
            <BlogRelatedServices article={article} />
            {article.intro ? <p className="mt-section-gap-lg text-subheading text-ink">{article.intro}</p> : null}
            {article.atAGlance ? <div className="mt-section-gap-lg flex gap-cluster rounded-panel-mobile border border-[#e5e0d6] bg-white px-card-pad-sm py-card-pad-sm">
              <span className="h-[70px] w-1 shrink-0 rounded-sm bg-pink" aria-hidden="true" />
              <div>
                <p className="text-meta font-semibold text-pink">AT A GLANCE</p>
                <p className="mt-cluster-sm text-body-sm font-text text-ink">{article.atAGlance}</p>
              </div>
            </div> : null}
            <BlogBody article={article} />
            <div className="mt-section-y rounded-card bg-navy px-card-pad py-card-pad text-white">
              <p className="text-meta font-semibold text-[#f5b8c7]">GET SUPPORT</p>
              <p className="mt-cluster-sm max-w-[620px] font-brand text-subheading">Want a clear next step for your business?</p>
              {primaryService ? <p className="mt-cluster-sm max-w-[620px] text-body-sm text-white/65">We can help with {primaryService.label.toLowerCase()} and the next steps around it.</p> : null}
              <div className="mt-cluster-lg flex flex-wrap items-center gap-cluster-sm">
                <ContactModal articleSlug={article.slug} buttonClassName="min-w-[170px]" buttonLabel="Book this service" serviceKey={primaryService?.serviceKey} />
                {primaryService && primaryService.href !== "#contact" ? <a className="text-body-xs font-semibold text-white/75 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white" href={primaryService.href}>View {primaryService.label.toLowerCase()} ↗</a> : null}
              </div>
            </div>
          </article>

          <aside className="flex min-w-0 flex-col gap-section-gap" aria-label="More from the journal">
            {article.sidebarVideo?.videoId ? (
              <div className="rounded-card border border-[#e5e0d6] bg-white px-card-pad py-card-pad">
                <p className="text-meta font-semibold text-pink">WATCH THE TUTORIAL</p>
                <div className="mt-cluster aspect-video overflow-hidden rounded-[16px] bg-[#f3f1ec]">
                  <iframe className="size-full" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(article.sidebarVideo.videoId)}?rel=0&playsinline=1`} title={article.sidebarVideo.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                <p className="mt-cluster-sm text-body-sm font-semibold text-ink">{article.sidebarVideo.title}</p>
              </div>
            ) : null}
            {visibleRelatedArticles.length ? <div className="rounded-card border border-[#e5e0d6] bg-white px-card-pad py-card-pad">
              <h2 className="text-meta font-semibold text-pink">MORE FROM THE JOURNAL</h2>
              <div className="mt-section-gap-lg flex flex-col gap-cluster">
                {visibleRelatedArticles.map((relatedArticle, index) => (
                  <div key={relatedArticle.slug}>
                    {index ? <div className="mb-4 h-px bg-[#e5e3e5]" /> : null}
                    <BlogSidebarArticleItem article={relatedArticle} locale={locale} />
                  </div>
                ))}
              </div>
            </div> : null}
            <div className="rounded-card bg-navy px-card-pad py-card-pad text-white">
              <p className="text-meta font-semibold text-[#f5b8c7]">NEED A HAND?</p>
              <h2 className="mt-cluster font-brand text-subheading">Have a question about your next step?</h2>
              <p className="mt-cluster-sm text-body-sm text-soft-muted">Talk to our team before you move forward.</p>
              <ContactModal articleSlug={article.slug} buttonClassName="mt-cluster-lg w-full justify-center" buttonLabel="Ask a question" serviceKey={primaryService?.serviceKey} />
            </div>
          </aside>
        </div>
      </section>

      {visibleRelatedArticles.length ? <section className="bg-page px-page-gutter py-section-y lg:px-page-gutter-lg lg:py-10" aria-labelledby="more-practical-reads-title">
        <div className="flex flex-col gap-cluster-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-meta font-semibold text-pink">05 <span className="px-1">/</span> MORE TO READ</p>
            <h2 className="mt-cluster-sm font-brand text-section-title text-ink" id="more-practical-reads-title">More practical reads</h2>
            <p className="mt-cluster-sm text-body text-muted">Keep exploring the journal for your next business decision.</p>
          </div>
          <a className="text-body-sm font-semibold text-pink hover:text-ink" href={locale === "bn" ? "/bn/blog" : "/blog"}>View all posts <span aria-hidden="true">↗</span></a>
        </div>
        <div className="mt-section-gap-lg grid grid-cols-1 gap-cluster lg:grid-cols-3 lg:gap-section-gap">
          {visibleRelatedArticles.map((relatedArticle) => <BlogRelatedArticleCard article={relatedArticle} locale={locale} key={relatedArticle.slug} />)}
        </div>
      </section> : null}
    </>
  );
}
