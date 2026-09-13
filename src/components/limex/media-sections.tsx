"use client";

import { useRef, useState } from "react";

import type { BlogTone } from "./blog-data";
import { ActionButton, SectionTitle } from "./ui";
import { defaultLandingContent } from "@/lib/landing-defaults";
import type {
  ArticleItem,
  ArticlesContent,
  TestimonialItem,
  TestimonialsContent,
} from "@/lib/landing-types";

const blogVisuals: Record<
  BlogTone,
  { surface: string; text: string; glow: string }
> = {
  mint: {
    surface: "bg-[#effbff]",
    text: "text-[#007ea6]",
    glow: "bg-[#c9f5ff]",
  },
  violet: {
    surface: "bg-[#edf4ff]",
    text: "text-[#006dce]",
    glow: "bg-[#cbe3ff]",
  },
  peach: {
    surface: "bg-[#e9efff]",
    text: "text-brand-blue",
    glow: "bg-[#cad9ff]",
  },
};

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const candidate =
      host === "youtu.be"
        ? parsed.pathname.slice(1).split("/")[0]
        : (parsed.searchParams.get("v") ??
          parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ??
          "");
    return /^[\w-]{11}$/.test(candidate) ? candidate : "";
  } catch {
    return "";
  }
}

function PlayIcon() {
  return (
    <svg className="ml-0.5 size-5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6.6 4.3a1 1 0 0 1 1.5-.86l6.5 4.7a1 1 0 0 1 0 1.62l-6.5 4.7a1 1 0 0 1-1.5-.86V4.3Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

export function VideoReelsSection({
  content = defaultLandingContent.testimonials,
}: {
  content?: TestimonialsContent;
}) {
  const [activeReel, setActiveReel] = useState<number | null>(null);
  const reelsViewportRef = useRef<HTMLDivElement>(null);

  const scrollReels = (direction: "previous" | "next") => {
    reelsViewportRef.current?.scrollBy({
      left: direction === "next" ? 330 : -330,
      behavior: "smooth",
    });
  };

  return (
    <section
      className="min-h-0 bg-page px-card-pad-sm py-reels-y pb-reels-bottom lg:min-h-[669px] lg:rounded-panel lg:p-section-y"
      aria-labelledby="reels-title"
    >
      <div className="flex flex-col gap-cluster-sm lg:min-h-[58px] lg:flex-row lg:items-center lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="reels-title"
          title={content.title}
          description={content.description}
          className="max-w-none"
          size="compact"
        />
        <div className="flex flex-wrap items-center gap-cluster-sm">
          <div
            className="hidden items-center gap-cluster-xs wide:flex"
            aria-label="Business stories controls"
          >
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
      <div
        ref={reelsViewportRef}
        className="mt-cluster flex min-h-[480px] gap-card-gap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-proximity lg:mt-5 lg:min-h-[535px]"
        id="stories-carousel"
      >
        {content.items
          .filter((reel) => reel.isVisible)
          .map((reel, index) => {
            const selected = activeReel === index;
            const videoId = getYouTubeVideoId(reel.youtubeUrl);

            return (
              <article
                className={`group relative min-h-[480px] min-w-[min(306px,calc(100vw-56px))] basis-[min(306px,calc(100vw-56px))] snap-start overflow-hidden rounded-3xl border ${
                  selected ? "border-[#071b3d] -translate-y-1" : "border-[#d7d5d0]"
                } bg-[#293a40] shadow-[0_14px_34px_rgba(27,34,30,0.08)] transition-transform duration-300 hover:-translate-y-1 lg:min-h-[535px] lg:min-w-[306px] lg:basis-[306px]`.trim()}
                key={reel.id}
              >
                {selected && videoId ? (
                  <div className="absolute inset-0 z-[5] bg-[#11141a]">
                    <iframe
                      className="size-full"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
                      title={reel.title}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                    <button
                      className="absolute right-3.5 top-3.5 z-20 grid size-9 place-items-center rounded-full border border-white/20 bg-[#071b3d]/80 text-white backdrop-blur-[10px] transition-all duration-200 hover:scale-105 hover:bg-[#071b3d] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white/70 focus-visible:outline-offset-2"
                      type="button"
                      aria-label={`Close ${reel.title} video`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveReel(null);
                      }}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      src={
                        reel.imageUrl ||
                        (videoId
                          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                          : "/figma/reel-1.png")
                      }
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex min-h-24 flex-col justify-end gap-1.5 bg-gradient-to-b from-transparent via-[rgba(18,20,33,0.38)] to-[rgba(18,20,33,0.94)] px-5 pb-5 pt-16 text-[#ffebd7] drop-shadow-[0_1px_12px_rgba(18,20,33,0.32)]">
                      <p className="text-overline text-brand-cyan">LIMEX STORY</p>
                      <h3 className="max-w-[250px] line-clamp-2 text-card-title">
                        {reel.title}
                      </h3>
                      {reel.subtitle ? (
                        <p className="text-micro text-[#ffebd7]/80">{reel.subtitle}</p>
                      ) : null}
                    </div>
                    {videoId ? (
                      <button
                        className="absolute left-1/2 top-1/2 z-10 grid size-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/75 bg-white/95 text-[#071b3d] shadow-[0_10px_26px_rgba(18,20,33,0.22)] ring-8 ring-white/20 transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/50 focus-visible:outline-offset-3"
                        type="button"
                        aria-label={`Play ${reel.title}`}
                        onClick={() => setActiveReel(index)}
                      >
                        <PlayIcon />
                      </button>
                    ) : null}
                  </>
                )}
              </article>
            );
          })}
      </div>
    </section>
  );
}

function ArticleVisual({ article }: { article: ArticleItem }) {
  const tone = blogVisuals[article.coverTone];

  return (
    <div
      className={`relative aspect-[852/430] overflow-hidden rounded-t-[22px] ${tone.text} ${tone.surface}`.trim()}
    >
      {article.coverUrl ? (
        <img
          className="absolute inset-0 size-full object-cover"
          src={article.coverUrl}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <div
        className={`pointer-events-none absolute inset-0 ${article.coverUrl ? "bg-gradient-to-t from-[#071b3d]/35 via-transparent to-white/10" : ""}`.trim()}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute -right-14 -top-16 size-48 rounded-full opacity-60 blur-2xl ${tone.glow}`.trim()}
        aria-hidden="true"
      />
      {!article.coverUrl ? (
        <>
          <img
            className="absolute -right-[116px] -top-[62px] block size-[260px] opacity-60"
            src="/figma/blog-orbit-a.svg"
            alt=""
            aria-hidden="true"
          />
          <img
            className="absolute bottom-[-2px] left-6 block size-[118px] opacity-60"
            src="/figma/blog-orbit-b.svg"
            alt=""
            aria-hidden="true"
          />
        </>
      ) : null}
      <span
        className={`absolute bottom-5 right-6 font-brand text-section-title opacity-50 ${article.coverUrl ? "text-white" : tone.text}`.trim()}
        aria-hidden="true"
      >
        {article.coverNumber}
      </span>
      {article.media === "video" ? (
        <span
          className="absolute left-1/2 top-1/2 grid size-[60px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/75 text-body-sm text-ink shadow-[0_10px_24px_rgba(49,42,35,0.08)]"
          aria-hidden="true"
        >
          ▶
        </span>
      ) : null}
    </div>
  );
}

export function BlogSection({
  content = defaultLandingContent.articles,
}: {
  content?: ArticlesContent;
}) {
  return (
    <section
      className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-page-gutter-lg lg:py-section-y-lg lg:pb-10"
      id="journal"
      aria-labelledby="journal-title"
    >
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-start lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="journal-title"
          title={content.title}
          description={content.description}
        />
        <ActionButton
          href={content.ctaHref}
          variant="light"
          className="w-max min-w-[164px] lg:mt-1"
        >
          {content.ctaLabel}
        </ActionButton>
      </div>
      <div className="mt-section-y grid grid-cols-1 gap-cluster-sm lg:mt-section-y-xl lg:grid-cols-3 lg:gap-cluster-lg">
        {content.items
          .filter((article) => article.isVisible)
          .map((article) => (
            <article
              className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-[#ded9d0] bg-[#faf9f6] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(49,42,35,0.07)]"
              key={article.id}
            >
              <ArticleVisual article={article} />
              <div className="flex min-h-0 flex-1 flex-col p-card-pad">
                <p className="text-overline text-[#958b80]">
                  {article.date} <span className="px-cluster-xs">·</span>{" "}
                  {article.readTime}
                </p>
                <h3 className="mt-cluster-lg line-clamp-2 font-brand text-subheading text-ink">
                  {article.title}
                </h3>
                <p className="mt-cluster-sm line-clamp-2 text-body-xs text-muted">
                  {article.subtitle}
                </p>
                <a
                  className="mt-auto inline-flex w-max items-center gap-cluster-sm border-b border-[#9d948a] pb-1 pt-section-gap-lg text-meta font-semibold text-ink transition-colors hover:border-ink hover:text-[#5e554d] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
                  href={article.href}
                >
                  Read article <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
