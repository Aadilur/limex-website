"use client";

import { useRef, useState } from "react";

import { reels } from "./data";
import { homeArticles, type BlogArticle, type BlogTone } from "./blog-data";
import { ActionButton, SectionTitle, WaveLabel } from "./ui";

const blogVisuals: Record<BlogTone, { surface: string; text: string; glow: string }> = {
  mint: { surface: "bg-[#eef3ee]", text: "text-[#6b806f]", glow: "bg-[#dce9df]" },
  violet: { surface: "bg-[#f1eff5]", text: "text-[#766e84]", glow: "bg-[#e5dfed]" },
  peach: { surface: "bg-[#f6efeb]", text: "text-[#92796b]", glow: "bg-[#edddd4]" },
};

export function VideoReelsSection() {
  const [activeReel, setActiveReel] = useState<number | null>(null);
  const reelsViewportRef = useRef<HTMLDivElement>(null);

  const scrollReels = (direction: "previous" | "next") => {
    reelsViewportRef.current?.scrollBy({ left: direction === "next" ? 330 : -330, behavior: "smooth" });
  };

  return (
    <section className="min-h-0 bg-page px-card-pad-sm py-reels-y pb-reels-bottom lg:min-h-[669px] lg:rounded-panel lg:p-section-y" aria-labelledby="reels-title">
      <div className="flex flex-col gap-cluster-sm lg:min-h-[58px] lg:flex-row lg:items-center lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="reels-title"
          eyebrow="VIDEO REELS"
          title="Stories from the businesses we support."
          description="Optional video stories that make the work feel human."
          className="max-w-none"
          size="compact"
        />
        <div className="flex flex-wrap items-center gap-cluster-sm">
          <WaveLabel className="text-[#63615c]">OPTIONAL REELS</WaveLabel>
          <div className="hidden items-center gap-cluster-xs wide:flex" aria-label="Business stories controls">
            <button
              className="grid size-[42px] place-items-center rounded-full border border-warm bg-white text-[18px] font-semibold leading-none text-ink transition-colors hover:border-pink hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
              type="button"
              aria-label="Show previous business story"
              aria-controls="stories-carousel"
              onClick={() => scrollReels("previous")}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              className="grid size-[42px] place-items-center rounded-full border border-warm bg-white text-[18px] font-semibold leading-none text-ink transition-colors hover:border-pink hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
              type="button"
              aria-label="Show next business story"
              aria-controls="stories-carousel"
              onClick={() => scrollReels("next")}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
      <div ref={reelsViewportRef} className="mt-cluster flex min-h-[480px] gap-card-gap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-proximity lg:mt-5 lg:min-h-[535px]" id="stories-carousel">
        {reels.map((reel, index) => {
          const selected = activeReel === index;

          return (
            <article className={`group relative min-h-[480px] min-w-[min(306px,calc(100vw-56px))] basis-[min(306px,calc(100vw-56px))] snap-start overflow-hidden rounded-3xl border ${selected ? "border-white/90 -translate-y-1" : "border-white/35"} bg-[#293a40] transition-transform duration-200 lg:min-h-[535px] lg:min-w-[306px] lg:basis-[306px] hover:-translate-y-1`.trim()} key={reel.title}>
              <img className={`absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${selected ? "scale-[1.04]" : ""}`.trim()} src={reel.image} alt="" />
              <div className="absolute inset-x-0 bottom-0 flex min-h-24 flex-col justify-end gap-1.5 bg-gradient-to-b from-transparent to-[rgba(18,20,33,0.88)] px-5 pb-[18px] pt-[54px] text-[#ffebd7] drop-shadow-[0_1px_12px_rgba(18,20,33,0.32)]">
                <h3 className="max-w-[250px] text-card-title">{reel.title}</h3>
                <p className="text-micro">{reel.meta}</p>
              </div>
              <button
                className="absolute left-1/2 top-1/2 z-10 grid size-[240px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-0 bg-transparent transition-transform duration-200 hover:scale-[1.04] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
                type="button"
                aria-label={`${selected ? "Pause" : "Play"} ${reel.title}`}
                aria-pressed={selected}
                onClick={() => setActiveReel((current) => (current === index ? null : index))}
              >
                <img className="absolute inset-0 size-full" src="/figma/play-overlay.svg" alt="" aria-hidden="true" />
                <span className="relative z-10 size-[58px] rounded-full bg-[rgba(252,251,250,0.96)] shadow-play" aria-hidden="true" />
                <span className="absolute left-1/2 top-1/2 z-20 h-0 w-0 -translate-y-1/2 translate-x-[-34%] border-y-[12px] border-y-transparent border-l-[18px] border-l-[#17151c]" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ArticleVisual({ article }: { article: BlogArticle }) {
  const tone = blogVisuals[article.coverTone];

  return (
    <div className={`relative h-[190px] overflow-hidden rounded-t-[22px] ${tone.text} ${tone.surface}`.trim()}>
      <div className={`pointer-events-none absolute -right-14 -top-16 size-48 rounded-full opacity-60 blur-2xl ${tone.glow}`.trim()} aria-hidden="true" />
      <img className="absolute -right-[116px] -top-[62px] block size-[260px] opacity-60" src="/figma/blog-orbit-a.svg" alt="" aria-hidden="true" />
      <img className="absolute bottom-[-2px] left-6 block size-[118px] opacity-60" src="/figma/blog-orbit-b.svg" alt="" aria-hidden="true" />
      <WaveLabel className={`absolute left-[22px] top-5 ${tone.text}`.trim()}>{article.media === "video" ? "VIDEO" : "GUIDE"}</WaveLabel>
      <span className={`absolute bottom-5 right-6 font-brand text-section-title opacity-50 ${tone.text}`.trim()} aria-hidden="true">{article.coverNumber}</span>
      {article.media === "video" ? (
        <span className="absolute left-1/2 top-1/2 grid size-[60px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/75 text-body-sm text-ink shadow-[0_10px_24px_rgba(49,42,35,0.08)]" aria-hidden="true">▶</span>
      ) : null}
    </div>
  );
}

export function BlogSection() {
  return (
    <section className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg lg:pb-10" id="journal" aria-labelledby="journal-title">
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-start lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="journal-title"
          eyebrow="FROM THE JOURNAL"
          title="Small insights for big decisions."
          description="Clear guidance for the decisions ahead."
        />
        <ActionButton href="/blog" variant="light" className="w-max min-w-[164px] lg:mt-1">All articles</ActionButton>
      </div>
      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {homeArticles.map((article) => (
          <article className="group flex min-h-[410px] flex-col overflow-hidden rounded-[26px] border border-[#ded9d0] bg-[#faf9f6] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(49,42,35,0.07)]" key={article.title}>
            <ArticleVisual article={article} />
            <div className="flex flex-1 flex-col p-card-pad">
              <p className="text-overline text-[#958b80]">{article.date} <span className="px-cluster-xs">·</span> {article.readTime}</p>
              <h3 className="mt-cluster-lg font-brand text-subheading text-ink">{article.title}</h3>
              <a className="mt-auto inline-flex w-max items-center gap-cluster-sm border-b border-[#9d948a] pb-1 pt-section-gap-lg text-meta font-semibold text-ink transition-colors hover:border-ink hover:text-[#5e554d] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href={`/blog/${article.slug}`}>
                Read article <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
