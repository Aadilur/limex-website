"use client";

import { useMemo, useState, type ChangeEvent } from "react";

import {
  blogArticles,
  blogFilters,
  featuredArticle,
  getRelatedBlogArticles,
  type BlogArticle,
  type BlogContentBlock,
} from "./blog-data";
import { getBlogToneClasses } from "./styles";
import { ActionButton, SearchIcon } from "./ui";

function categoryLabel(category: string) {
  return category.toUpperCase();
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
        className="h-[52px] w-full rounded-[12px] border border-[#e0e0e5] bg-[#f9f8f6] px-[17px] pr-12 text-[14px] leading-5 text-ink outline-none transition-colors placeholder:text-muted focus:border-pink focus:ring-2 focus:ring-pink/15"
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
  const isFeatured = variant === "featured";
  const isHero = variant === "hero";
  const isThumb = variant === "thumb";
  const coverWidthClass = isThumb ? "" : "w-full";
  const coverClass = isFeatured
    ? "h-[210px] rounded-[16px] sm:h-[250px]"
    : isHero
      ? "aspect-[852/430] min-h-[260px] rounded-[28px]"
      : isThumb
        ? "size-20 rounded-[16px]"
        : variant === "related"
          ? "h-[156px] rounded-t-[22px]"
          : "h-[200px] rounded-t-[22px]";
  const paperClass = isThumb
    ? "left-8 top-[31px] h-[42px] w-[34px] rounded-[8px]"
    : isHero
      ? "right-[12%] top-[18%] h-[42%] w-[30%] rounded-[20px]"
      : "right-7 top-[42px] h-[82px] w-[118px] rounded-[16px]";
  const lineClass = isThumb ? "left-[7px]" : "left-4";

  return (
    <div className={`relative shrink-0 overflow-hidden ${tone.surface} ${coverWidthClass} ${coverClass}`.trim()} aria-hidden="true">
      {isFeatured ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <strong className={`text-[11px] font-bold tracking-[1.35px] ${tone.text}`.trim()}>IMAGE PLACEHOLDER</strong>
          <span className="mt-2 text-[14px] leading-[22px] text-muted">{article.coverNote}</span>
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
          {!isThumb && !isHero ? <span className={`absolute bottom-6 left-6 text-[10px] font-semibold tracking-[0.9px] ${tone.text}`.trim()}>COVER SLOT</span> : null}
          {!isThumb ? <strong className={`absolute bottom-2 right-7 text-[40px] font-bold leading-[44px] ${tone.text}`.trim()}>{article.coverNumber}</strong> : null}
        </>
      )}
      {isHero ? <span className={`absolute bottom-7 left-7 text-[11px] font-semibold tracking-[1px] ${tone.text}`.trim()}>ARTICLE COVER</span> : null}
    </div>
  );
}

function BlogArticleCard({ article }: { article: BlogArticle }) {
  return (
    <a
      className="group flex min-h-[430px] flex-col overflow-hidden rounded-[22px] border border-[#e5e0d6] bg-white transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 lg:min-h-[470px]"
      href={`/blog/${article.slug}`}
    >
      <BlogCover article={article} />
      <div className="flex min-h-0 flex-1 flex-col items-start gap-2 overflow-hidden px-6 pb-5 pt-[18px]">
        <p className="text-[10px] font-semibold leading-[14px] tracking-[0.8px] text-pink">{categoryLabel(article.category)} <span className="px-1">·</span> {article.date}</p>
        <h3 className="text-[20px] font-bold leading-[26px] tracking-[-0.25px] text-ink">{article.title}</h3>
        <p className="text-[15px] leading-6 text-muted">{article.summary}</p>
        <span className="mt-auto pt-3 text-[14px] font-semibold text-pink transition-transform duration-200 group-hover:translate-x-0.5">Read more <span aria-hidden="true">↗</span></span>
      </div>
    </a>
  );
}

export function BlogRelatedArticleCard({ article }: { article: BlogArticle }) {
  return (
    <a
      className="group flex min-h-[320px] flex-col overflow-hidden rounded-[22px] bg-white transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
      href={`/blog/${article.slug}`}
    >
      <BlogCover article={article} variant="related" />
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-6 pb-3 pt-[18px]">
        <p className="text-[10px] font-semibold leading-[14px] tracking-[0.4px] text-pink">{categoryLabel(article.category)} <span className="px-1">·</span> {article.date}</p>
        <h3 className="text-[20px] font-bold leading-[26px] text-ink">{article.title}</h3>
        <p className="text-[14px] leading-[21px] text-muted">{article.summary}</p>
        <span className="mt-auto text-[13px] font-semibold text-pink">Read more <span aria-hidden="true">↗</span></span>
      </div>
    </a>
  );
}

function BlogSidebarArticleItem({ article }: { article: BlogArticle }) {
  return (
    <a
      className="group flex min-h-[92px] items-start gap-3 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
      href={`/blog/${article.slug}`}
    >
      <BlogCover article={article} variant="thumb" />
      <span className="flex min-w-0 flex-col gap-1 overflow-hidden">
        <span className="text-[10px] font-semibold leading-[14px] tracking-[0.4px] text-pink">{categoryLabel(article.category)} <span className="px-0.5">·</span> {article.date}</span>
        <span className="text-[14px] font-semibold leading-5 text-ink transition-colors group-hover:text-pink">{article.title}</span>
      </span>
    </a>
  );
}

export function BlogIndexContent() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof blogFilters)[number]["value"]>("all");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleArticles = useMemo(
    () => blogArticles.filter((article) => {
      const matchesFilter = activeFilter === "all" || article.category === activeFilter;
      const searchableText = [article.title, article.summary, article.category, ...article.tags].join(" ").toLowerCase();
      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
    }),
    [activeFilter, normalizedQuery],
  );

  return (
    <>
      <section className="bg-page px-5 pb-7 lg:px-[42px] lg:pb-10" aria-labelledby="blog-page-title">
        <p className="text-[12px] font-medium leading-[18px] text-muted">Home <span className="px-1">/</span> Blog</p>
        <div className="mt-7 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="max-w-[730px]">
            <p className="text-label text-pink">INSIGHTS &amp; GUIDES</p>
            <h1 className="mt-2 max-w-[730px] text-[clamp(42px,4vw,58px)] font-bold leading-[1.05] tracking-[-2.5px] text-ink">Practical guidance for growing with confidence</h1>
            <p className="mt-4 max-w-[670px] text-[17px] leading-7 text-muted">Clear, useful articles on registration, tax, compliance and building your business.</p>
            <p className="mt-4 text-[14px] font-medium leading-5 text-ink">New guides added every week</p>
          </div>
          <div className="w-full rounded-[24px] bg-white p-6 lg:max-w-[440px]">
            <p className="mb-4 text-[11px] font-semibold tracking-[1.2px] text-pink">SEARCH THE JOURNAL</p>
            <BlogSearchField id="blog-hero-search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
      </section>

      <section className="bg-page px-5 py-7 lg:px-[42px] lg:py-10" aria-labelledby="featured-guide-title">
        <div className="flex items-center justify-between gap-5">
          <h2 className="text-[28px] font-bold leading-9 tracking-[-0.8px] text-ink" id="featured-guide-title">Featured guide</h2>
          <a className="text-right text-[14px] font-semibold text-pink transition-colors hover:text-ink" href="#latest">View all posts <span aria-hidden="true">↗</span></a>
        </div>
        <a
          className="group mt-6 grid gap-6 rounded-[22px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-center lg:gap-8"
          href={`/blog/${featuredArticle.slug}`}
        >
          <BlogCover article={featuredArticle} variant="featured" />
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-[12px] font-semibold tracking-[1.1px] text-pink">{categoryLabel(featuredArticle.category)} <span className="px-1">·</span> {featuredArticle.readTime}</p>
            <h2 className="text-[clamp(28px,3vw,36px)] font-bold leading-[1.12] tracking-[-1.3px] text-ink">{featuredArticle.title}</h2>
            <p className="max-w-[630px] text-[17px] leading-7 text-muted">{featuredArticle.summary}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[14px] leading-5">
              <span className="text-muted">{featuredArticle.date} <span className="px-1">·</span> By {featuredArticle.author}</span>
              <span className="font-semibold text-pink transition-transform duration-200 group-hover:translate-x-0.5">Read the guide <span aria-hidden="true">↗</span></span>
            </div>
          </div>
        </a>
      </section>

      <section className="bg-page px-5 py-7 lg:px-[42px] lg:py-10" id="latest" aria-labelledby="latest-journal-title">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div>
            <h2 className="text-[32px] font-bold leading-10 tracking-[-1px] text-ink" id="latest-journal-title">Latest from the journal</h2>
            <p className="mt-2 text-[17px] leading-[26px] text-muted">Short, practical reads for your next business decision.</p>
          </div>
          <div className="w-full lg:max-w-[392px]">
            <BlogSearchField id="blog-latest-search" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter blog posts">
          {blogFilters.map((filter) => {
            const active = activeFilter === filter.value;
            return (
              <button
                className={`inline-flex h-[34px] shrink-0 items-center rounded-full border px-4 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${active ? "border-ink bg-ink text-white" : "border-[#e0e0e5] bg-white text-muted hover:border-pink/45 hover:text-ink"}`.trim()}
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
        <p className="mt-5 text-[12px] font-medium text-muted" aria-live="polite">Showing {visibleArticles.length} {visibleArticles.length === 1 ? "guide" : "guides"}</p>
        {visibleArticles.length ? (
          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
            {visibleArticles.map((article) => <BlogArticleCard article={article} key={article.slug} />)}
          </div>
        ) : (
          <div className="mt-6 rounded-[22px] border border-[#e5e0d6] bg-white px-6 py-10 text-center">
            <p className="text-[17px] font-semibold text-ink">No guides match that search.</p>
            <button className="mt-3 text-[14px] font-semibold text-pink hover:text-ink" type="button" onClick={() => { setQuery(""); setActiveFilter("all"); }}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  );
}

function BlogContentBlockView({ block }: { block: BlogContentBlock }) {
  if (block.type === "heading") return <h2 className="pt-2 text-[28px] font-bold leading-9 tracking-[-0.8px] text-ink">{block.text}</h2>;
  if (block.type === "paragraph") return <p className="text-[16px] leading-[26px] text-muted">{block.text}</p>;

  return (
    <div className="relative flex gap-4 border-b border-[#e5e3e5] py-4 last:border-b-0">
      <p className="shrink-0 text-[20px] font-bold leading-7 text-pink">{block.number}</p>
      <div>
        <h3 className="text-[17px] font-semibold leading-6 text-ink">{block.title}</h3>
        <p className="mt-1 text-[15px] leading-[23px] text-muted">{block.text}</p>
      </div>
    </div>
  );
}

export function BlogDetailContent({ article }: { article: BlogArticle }) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const relatedArticles = getRelatedBlogArticles(article.slug, 3);

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
      <section className="bg-page px-5 pb-7 lg:px-[42px] lg:pb-10" aria-labelledby="article-title">
        <div className="flex flex-col items-start gap-3 text-[12px] font-medium leading-[18px] text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <p>Home <span className="px-1">/</span> Blog <span className="px-1">/</span> {article.category}</p>
          <a className="shrink-0 text-[13px] font-semibold text-pink hover:text-ink" href="/blog">← Back to all posts</a>
        </div>
        <div className="mt-12 max-w-[960px]">
          <p className="text-[12px] font-semibold tracking-[1.1px] text-pink">{categoryLabel(article.category)} <span className="px-1">·</span> {article.readTime}</p>
          <h1 className="mt-5 max-w-[950px] text-[clamp(40px,4.2vw,60px)] font-bold leading-[1.05] tracking-[-2.5px] text-ink" id="article-title">{article.title}</h1>
          <p className="mt-6 max-w-[760px] text-[18px] leading-7 text-muted">{article.summary}</p>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e3e5] pb-6 text-[14px] leading-5 text-muted">
          <p>{article.date} <span className="px-1">·</span> By {article.author}{article.updatedDate ? ` · Updated ${article.updatedDate}` : ""}</p>
          <button className="inline-flex min-h-[44px] items-center rounded-full border border-[#e5e0d6] bg-white px-6 text-[13px] font-semibold text-pink transition-colors hover:border-pink/45 hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2" type="button" onClick={handleShare}>
            {shareState === "copied" ? "Link copied ✓" : "Share this guide ↗"}
          </button>
        </div>
      </section>

      <section className="bg-page px-5 py-7 lg:px-[42px] lg:py-10" aria-labelledby="article-content-label">
        <p className="text-[12px] font-semibold tracking-[1.1px] text-pink" id="article-content-label">04 <span className="px-1">/</span> ARTICLE CONTENT</p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,820px)_336px] lg:gap-11">
          <article className="min-w-0">
            <BlogCover article={article} variant="hero" />
            <p className="mt-6 text-[20px] leading-8 text-ink">{article.intro}</p>
            <div className="mt-6 flex gap-4 rounded-[20px] border border-[#e5e0d6] bg-white px-5 py-5">
              <span className="h-[70px] w-1 shrink-0 rounded-sm bg-pink" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-semibold tracking-[1.1px] text-pink">AT A GLANCE</p>
                <p className="mt-2 text-[15px] font-medium leading-[23px] text-ink">{article.atAGlance}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              {article.blocks.map((block, index) => <BlogContentBlockView block={block} key={`${article.slug}-${block.type}-${index}`} />)}
            </div>
            <div className="mt-7 rounded-[22px] bg-navy px-6 py-6 text-white">
              <p className="text-[11px] font-semibold tracking-[1.1px] text-[#f5b8c7]">GET SUPPORT</p>
              <p className="mt-2 max-w-[620px] text-[20px] font-bold leading-7">Want a clear next step for your business?</p>
              <ActionButton href="/#contact" variant="white" className="mt-5 min-w-[170px]">Talk to an advisor</ActionButton>
            </div>
          </article>

          <aside className="flex min-w-0 flex-col gap-6" aria-label="More from the journal">
            <div className="rounded-[22px] border border-[#e5e0d6] bg-white px-6 py-6">
              <h2 className="text-[11px] font-semibold tracking-[1.1px] text-pink">MORE FROM THE JOURNAL</h2>
              <div className="mt-5 flex flex-col gap-4">
                {relatedArticles.map((relatedArticle, index) => (
                  <div key={relatedArticle.slug}>
                    {index ? <div className="mb-4 h-px bg-[#e5e3e5]" /> : null}
                    <BlogSidebarArticleItem article={relatedArticle} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] bg-navy px-6 py-6 text-white">
              <p className="text-[11px] font-semibold tracking-[1.1px] text-[#f5b8c7]">NEED A HAND?</p>
              <h2 className="mt-3 text-[20px] font-bold leading-[26px]">Have a question about your next step?</h2>
              <p className="mt-2 text-[14px] leading-[21px] text-soft-muted">Talk to our team before you move forward.</p>
              <ActionButton href="/#contact" variant="white" className="mt-5 w-full justify-center" arrow="none">Ask a question</ActionButton>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-page px-5 py-7 lg:px-[42px] lg:py-10" aria-labelledby="more-practical-reads-title">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[12px] font-semibold tracking-[1.1px] text-pink">05 <span className="px-1">/</span> MORE TO READ</p>
            <h2 className="mt-2 text-[32px] font-bold leading-10 tracking-[-1px] text-ink" id="more-practical-reads-title">More practical reads</h2>
            <p className="mt-2 text-[16px] leading-6 text-muted">Keep exploring the journal for your next business decision.</p>
          </div>
          <a className="text-[14px] font-semibold text-pink hover:text-ink" href="/blog">View all posts <span aria-hidden="true">↗</span></a>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
          {relatedArticles.map((relatedArticle) => <BlogRelatedArticleCard article={relatedArticle} key={relatedArticle.slug} />)}
        </div>
      </section>
    </>
  );
}
