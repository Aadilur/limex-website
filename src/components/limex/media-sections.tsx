"use client";

import { useState } from "react";

import { reels } from "./data";
import { homeArticles, type BlogArticle } from "./blog-data";
import { getBlogToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";

export function VideoReelsSection() {
  const [activeReel, setActiveReel] = useState<number | null>(null);

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
        <span className="inline-flex h-[30px] w-max items-center rounded-pill border border-warm bg-[#f5ede3] px-3 text-micro font-semibold text-[#63615c]">OPTIONAL REELS</span>
      </div>
      <div className="mt-cluster flex min-h-[480px] gap-card-gap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-proximity lg:mt-5 lg:min-h-[535px]">
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
  const tone = getBlogToneClasses(article.coverTone);

  return (
    <div className={`relative h-[190px] overflow-hidden rounded-t-[22px] ${tone.text} ${tone.surface}`.trim()}>
      <img className="absolute -right-[116px] -top-[62px] block size-[260px]" src="/figma/blog-orbit-a.svg" alt="" aria-hidden="true" />
      <img className="absolute bottom-[-2px] left-6 block size-[118px]" src="/figma/blog-orbit-b.svg" alt="" aria-hidden="true" />
      <span className={`absolute left-[22px] top-5 inline-flex min-h-6 items-center rounded-control bg-white px-2.5 text-overline ${tone.text}`.trim()}>{article.media === "video" ? "VIDEO PLACEHOLDER" : "IMAGE PLACEHOLDER"}</span>
      {article.media === "video" ? (
        <span className="absolute left-1/2 top-1/2 grid size-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-subheading text-navy" aria-hidden="true">▶</span>
      ) : (
        <strong className={`absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-overline ${tone.text}`.trim()}>VISUAL PLACEHOLDER</strong>
      )}
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
          description="Straightforward guidance on registration, tax and growth."
        />
        <ActionButton href="/blog" variant="light" className="w-max min-w-[190px] lg:mt-1">View all articles</ActionButton>
      </div>
      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {homeArticles.map((article) => (
          <article className="min-h-[430px] overflow-hidden rounded-[22px] border border-border bg-white" key={article.title}>
            <ArticleVisual article={article} />
            <p className="px-card-pad pt-6 text-overline text-muted">{article.date} <span className="px-cluster-xs">|</span> {article.category.toUpperCase()}</p>
            <h3 className="min-h-[58px] px-card-pad pt-4 font-brand text-subheading text-ink">{article.title}</h3>
            <ActionButton href={`/blog/${article.slug}`} variant="soft" className="ml-card-pad mt-section-gap-lg w-[136px] min-h-[38px]">Read more</ActionButton>
          </article>
        ))}
      </div>
    </section>
  );
}
