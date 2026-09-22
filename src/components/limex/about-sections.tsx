"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getPublicAboutReels,
  getPublicAboutTeam,
  type AboutReel,
  type AboutTeamMember,
} from "@/lib/about-api";
import { ContactModal } from "./contact-section";
import { ActionButton, SectionTitle } from "./ui";

const approachPoints = [
  { label: "Listen first", description: "Start with the real question." },
  { label: "Explain clearly", description: "Make the next choice easier." },
  { label: "Stay close", description: "Keep the work moving." },
];

export function AboutHero() {
  return (
    <section
      className="grid gap-cluster-lg lg:grid-cols-[minmax(0,1.42fr)_minmax(340px,0.92fr)] lg:items-stretch lg:gap-section-gap"
      aria-labelledby="about-title"
    >
      <div className="flex min-h-[224px] flex-col items-start justify-center lg:min-h-[236px]">
        <h1
          className="max-w-[760px] font-brand text-page-title text-ink max-lg:text-page-title-mobile"
          id="about-title"
        >
          Business clarity, built around people.
        </h1>
        <p className="mt-cluster max-w-[650px] text-body-sm text-muted">
          We make the work behind your business easier to understand and simpler
          to navigate.
        </p>
        <div className="mt-cluster-lg">
          <ActionButton
            href="#team"
            variant="dark"
            arrow="text"
            className="min-h-control min-w-[148px] px-4 text-button"
          >
            Meet the team
          </ActionButton>
        </div>
      </div>

      <aside
        className="rounded-card border border-warm bg-[#faf9f6] px-card-pad-sm py-card-pad-sm lg:min-h-[236px] lg:px-card-pad"
        id="approach"
        aria-labelledby="approach-title"
      >
        <h2 className="font-brand text-subheading text-ink" id="approach-title">
          Clear from the first conversation.
        </h2>
        <ul className="mt-cluster-lg space-y-2.5">
          {approachPoints.map((point) => (
            <li className="flex items-start gap-cluster-sm" key={point.label}>
              <span
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#071b3d]/[0.07] text-[#071b3d]"
                aria-hidden="true"
              >
                <svg
                  className="size-3"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                </svg>
              </span>
              <span className="min-w-0">
                <strong className="block text-footer font-semibold text-ink">
                  {point.label}
                </strong>
                <span className="mt-0.5 block text-micro text-muted">
                  {point.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

const trustMetrics = [
  {
    value: "01",
    label: "Understand",
    description: "Start with your real goal.",
  },
  { value: "02", label: "Guide", description: "Make the next decision clear." },
  {
    value: "03",
    label: "Stay close",
    description: "Keep every detail moving.",
  },
];

export function AboutTrustStrip() {
  return (
    <section
      className="mt-[clamp(28px,3vw,44px)] grid gap-cluster-lg rounded-nav border border-warm bg-[#f7f4ef] px-card-pad-sm py-card-pad-sm lg:grid-cols-[220px_repeat(3,minmax(0,1fr))] lg:gap-0 lg:px-6 lg:py-5"
      aria-label="About Limex working principles"
    >
      <div className="flex flex-col justify-center gap-1 lg:pr-6">
        <p className="font-brand text-footer font-semibold text-ink">
          A simple rhythm
        </p>
        <p className="text-micro text-muted">
          Clear principles for every engagement.
        </p>
      </div>
      {trustMetrics.map((metric) => (
        <div
          className="border-t border-warm/80 pt-4 lg:border-l lg:border-t-0 lg:px-6 lg:pt-0"
          key={metric.label}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-muted/60">
              {metric.value}
            </span>
            <h3 className="font-semibold text-footer text-ink">
              {metric.label}
            </h3>
          </div>
          <p className="mt-1 text-micro text-muted leading-relaxed">
            {metric.description}
          </p>
        </div>
      ))}
    </section>
  );
}

const teamPhotoTones = [
  "bg-[#e8f1f5] text-[#071b3d]",
  "bg-[#eef2f6] text-[#006dce]",
  "bg-[#ebf4f5] text-[#007ea6]",
  "bg-[#f0edf7] text-[#4d4870]",
  "bg-[#e8eff4] text-[#071b3d]",
];

function teamInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length
    ? words
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "LM";
}

function TeamMemberPhoto({
  member,
  index,
  onError,
}: {
  member: AboutTeamMember;
  index: number;
  onError: () => void;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [member.imageUrl]);

  if (member.imageUrl && !failed) {
    return (
      <img
        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        src={member.imageUrl}
        alt={`${member.name}, ${member.title}`}
        loading="lazy"
        decoding="async"
        onError={() => {
          setFailed(true);
          onError();
        }}
      />
    );
  }

  return (
    <div
      className={`grid size-full place-items-center ${teamPhotoTones[index % teamPhotoTones.length]}`.trim()}
      aria-hidden="true"
    >
      <span className="font-brand text-3xl font-bold leading-none tracking-tight sm:text-4xl">
        {teamInitials(member.name)}
      </span>
    </div>
  );
}

function TeamMemberCard({
  member,
  index,
  onImageError,
}: {
  member: AboutTeamMember;
  index: number;
  onImageError: () => void;
}) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-[18px] border border-[#e6e1d8] bg-[#fffdfa] transition-all duration-300 hover:-translate-y-1 hover:border-[#d9d2c6] hover:shadow-[0_14px_30px_rgba(7,27,61,0.08)]">
      <div className="aspect-[0.92] overflow-hidden border-b border-[#eee9e2] bg-[#ece7df]">
        <TeamMemberPhoto member={member} index={index} onError={onImageError} />
      </div>
      <div className="min-w-0 px-3 py-3.5 sm:px-4 sm:py-4">
        <h3 className="line-clamp-2 font-brand text-[13px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[16px]">
          {member.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-[1.25] text-[#008a9a] sm:text-[11px]">
          {member.title}
        </p>
        <p className="mt-2 line-clamp-3 text-[10px] leading-[1.5] text-muted sm:text-[11px]">
          {member.description}
        </p>
      </div>
    </article>
  );
}

export function AboutTeamSection() {
  const [members, setMembers] = useState<AboutTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const imageRetries = useRef(new Set<string>());

  const loadMembers = useCallback(async () => {
    try {
      const nextMembers = await getPublicAboutTeam();
      setMembers(nextMembers);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  function handleImageError(memberId: string) {
    if (imageRetries.current.has(memberId)) {
      setMembers((current) =>
        current.map((member) =>
          member.id === memberId ? { ...member, imageUrl: null } : member,
        ),
      );
      return;
    }

    imageRetries.current.add(memberId);
    void loadMembers();
  }

  return (
    <section
      className="mt-[clamp(36px,5vw,76px)] bg-page px-0 py-1"
      id="team"
      aria-labelledby="team-title"
    >
      <div className="mx-auto max-w-[1120px]">
        <SectionTitle
          eyebrow="OUR TEAM"
          id="team-title"
          title="The people behind every clear next step."
          description="A thoughtful team for the important work behind your business."
          className="mx-auto max-w-[680px] text-center"
          size="large"
        />
        <div className="mt-section-gap-lg grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {loading ? (
            [0, 1, 2, 3].map((index) => (
              <div
                className="animate-pulse overflow-hidden rounded-[18px] border border-[#e6e1d8] bg-[#fffdfa]"
                key={index}
              >
                <div className="aspect-[0.92] bg-[#ebe7df]" />
                <div className="space-y-2 px-3 py-3.5 sm:px-4 sm:py-4">
                  <div className="h-4 w-4/5 rounded-full bg-[#e8e1d8]" />
                  <div className="h-3 w-3/5 rounded-full bg-[#e8e1d8]" />
                  <div className="h-3 w-full rounded-full bg-[#eee9e2]" />
                  <div className="h-3 w-4/5 rounded-full bg-[#eee9e2]" />
                </div>
              </div>
            ))
          ) : members.length ? (
            members.map((member, index) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                index={index}
                onImageError={() => handleImageError(member.id)}
              />
            ))
          ) : (
            <div className="col-span-2 rounded-[18px] border border-dashed border-[#d8d1c7] bg-[#fffdfa] px-5 py-10 text-center lg:col-span-4">
              <p className="font-brand text-subheading font-bold text-ink">
                The people behind Limex are on their way.
              </p>
              <p className="mt-1.5 text-micro text-muted">
                {loadError
                  ? "Please check back soon."
                  : "Our team profiles are being updated."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const reelFallbackTones = [
  "bg-[#e9f0ec] text-[#32614e]",
  "bg-[#ececf5] text-[#5c5788]",
  "bg-[#f2ece4] text-[#876344]",
  "bg-[#e7eff0] text-[#3a6a6d]",
];

function reelDisplayTitle(reel: AboutReel) {
  return reel.title?.trim() || reel.youtubeTitle || "Watch on YouTube";
}

function ReelThumbnail({ reel, index }: { reel: AboutReel; index: number }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [reel.thumbnailUrl]);

  if (reel.thumbnailUrl && !failed) {
    return (
      <img
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
        src={reel.thumbnailUrl}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 grid place-items-center ${reelFallbackTones[index % reelFallbackTones.length]}`.trim()}
      aria-hidden="true"
    >
      <span className="font-brand text-5xl font-bold tracking-[-0.08em]">
        LIMEX
      </span>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      className="ml-0.5 size-5 fill-current"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M6.6 4.3a1 1 0 0 1 1.5-.86l6.5 4.7a1 1 0 0 1 0 1.62l-6.5 4.7a1 1 0 0 1-1.5-.86V4.3Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className={`size-4 ${direction === "left" ? "rotate-180" : ""}`.trim()}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10h11M10.5 4.5 16 10l-5.5 5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function AboutReelCard({
  reel,
  index,
  playing,
  onPlay,
  onStop,
}: {
  reel: AboutReel;
  index: number;
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
}) {
  const title = reelDisplayTitle(reel);

  return (
    <article
      className={[
        "group relative aspect-[9/16] min-w-[min(224px,calc(100vw-64px))] basis-[min(224px,calc(100vw-64px))] snap-start overflow-hidden rounded-[20px] border bg-[#1c282e] shadow-[0_14px_34px_rgba(27,34,30,0.08)] transition-all duration-300 hover:-translate-y-1 lg:min-w-[232px] lg:basis-[232px]",
        playing
          ? "border-[#071b3d]"
          : "border-[#d7d5d0] hover:border-[#b8b3a8]",
      ].join(" ")}
    >
      {playing ? (
        <div className="absolute inset-0 bg-[#11141a]">
          <iframe
            className="size-full"
            src={reel.embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <button
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/20 bg-[#071b3d]/80 text-white backdrop-blur-[10px] transition-colors hover:bg-[#071b3d] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white/70 focus-visible:outline-offset-2"
            type="button"
            aria-label={`Close ${title}`}
            onClick={onStop}
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <>
          <ReelThumbnail reel={reel} index={index} />
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-3.5 pt-3.5">
            <span className="rounded-full bg-[#071b3d]/75 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-[8px]">
              Video story
            </span>
            <span className="max-w-[112px] truncate rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-[#071b3d] backdrop-blur-[8px]">
              {reel.title ? "Featured" : "YouTube"}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex min-h-[138px] flex-col justify-end gap-1.5 bg-gradient-to-b from-transparent via-[rgba(18,20,33,0.45)] to-[rgba(18,20,33,0.96)] px-4 pb-4 pt-16 text-white drop-shadow-[0_1px_12px_rgba(18,20,33,0.32)] sm:px-5 sm:pb-5">
            <h3 className="max-w-[250px] line-clamp-2 font-brand text-[16px] font-bold leading-[1.15] text-white sm:text-card-title">
              {title}
            </h3>
            <p className="line-clamp-2 text-[10px] leading-[1.45] text-white/75 sm:text-[11px]">
              {reel.youtubeTitle && reel.youtubeTitle !== title
                ? reel.youtubeTitle
                : "A story from the people we support."}
            </p>
          </div>
          <button
            className="absolute left-1/2 top-1/2 z-10 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/95 text-[#071b3d] shadow-[0_10px_26px_rgba(18,20,33,0.22)] ring-4 ring-white/20 transition-transform duration-200 group-hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/50 focus-visible:outline-offset-3 sm:size-[62px]"
            type="button"
            aria-label={`Play ${title}`}
            onClick={onPlay}
          >
            <PlayIcon />
          </button>
        </>
      )}
    </article>
  );
}

export function AboutReelsSection() {
  const [reels, setReels] = useState<AboutReel[]>([]);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const reelScrollerRef = useRef<HTMLDivElement>(null);

  const loadReels = useCallback(async () => {
    try {
      setReels(await getPublicAboutReels());
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReels();
  }, [loadReels]);

  useEffect(() => {
    const scroller = reelScrollerRef.current;
    if (!scroller) return;

    const updateScrollState = () => {
      const maxScrollLeft = Math.max(
        0,
        scroller.scrollWidth - scroller.clientWidth,
      );
      setCanScrollPrevious(scroller.scrollLeft > 4);
      setCanScrollNext(scroller.scrollLeft < maxScrollLeft - 4);
    };

    updateScrollState();
    scroller.addEventListener("scroll", updateScrollState, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateScrollState);
    observer?.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", updateScrollState);
      observer?.disconnect();
    };
  }, [reels.length]);

  useEffect(() => {
    if (!activeReelId) return;
    document
      .getElementById(`about-reel-${activeReelId}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }, [activeReelId]);

  function moveReels(direction: "previous" | "next") {
    reelScrollerRef.current?.scrollBy({
      left: (direction === "next" ? 1 : -1) * 252,
      behavior: "smooth",
    });
  }

  return (
    <section
      className="mt-[clamp(40px,5vw,80px)] bg-page px-0 py-1"
      aria-labelledby="about-reels-title"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="relative">
          <SectionTitle
            eyebrow="VIDEO STORIES"
            id="about-reels-title"
            title="Real stories. Clearer futures."
            description="See the people, progress and partnerships behind the work."
            className="mx-auto max-w-[700px] text-center"
            size="large"
          />
          {!loading && reels.length > 1 ? (
            <div
              className="hidden shrink-0 items-center gap-2 lg:absolute lg:bottom-1 lg:right-0 lg:flex"
              aria-label="Video reel controls"
            >
              <button
                className="grid size-10 place-items-center rounded-full border border-[#d2cbc0] bg-white text-[#4f4b47] transition-all hover:-translate-y-0.5 hover:border-[#071b3d] hover:text-[#071b3d] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/40 focus-visible:outline-offset-2"
                type="button"
                aria-label="Previous video reel"
                disabled={!canScrollPrevious}
                onClick={() => moveReels("previous")}
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                className="grid size-10 place-items-center rounded-full bg-[#071b3d] text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2933] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/40 focus-visible:outline-offset-2"
                type="button"
                aria-label="Next video reel"
                disabled={!canScrollNext}
                onClick={() => moveReels("next")}
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          ) : null}
        </div>

      {loading ? (
        <div
          className="mt-section-gap-lg flex min-h-0 justify-center gap-card-gap overflow-hidden"
          aria-label="Loading video reels"
        >
          {[0, 1, 2].map((index) => (
            <div
              className="aspect-[9/16] min-w-[min(224px,calc(100vw-64px))] animate-pulse rounded-[20px] border border-[#e0dcd4] bg-[#ebe7df] lg:min-w-[232px]"
              key={index}
            />
          ))}
        </div>
      ) : loadError ? (
        <div className="mt-section-gap-lg rounded-[18px] border border-dashed border-[#d4ccc1] bg-[#fffdfa] px-5 py-10 text-center">
          <p className="font-brand text-subheading-mobile font-bold text-ink">
            Our stories are taking shape.
          </p>
          <p className="mt-1.5 text-micro text-muted">
            Please check back soon for Limex on video.
          </p>
        </div>
      ) : reels.length ? (
        <div
          ref={reelScrollerRef}
          className="mt-section-gap-lg flex min-h-0 snap-x snap-proximity justify-start gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center lg:gap-5"
        >
          {reels.map((reel, index) => (
            <div
              className="shrink-0"
              id={`about-reel-${reel.id}`}
              key={reel.id}
            >
              <AboutReelCard
                reel={reel}
                index={index}
                playing={activeReelId === reel.id}
                onPlay={() => setActiveReelId(reel.id)}
                onStop={() => setActiveReelId(null)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-section-gap-lg rounded-[18px] border border-dashed border-[#d4ccc1] bg-[#fffdfa] px-5 py-10 text-center">
          <p className="font-brand text-subheading-mobile font-bold text-ink">
            Our story is coming soon.
          </p>
          <p className="mt-1.5 text-micro text-muted">
            New Limex video stories will appear here.
          </p>
        </div>
      )}
      </div>
    </section>
  );
}

export function AboutContactCta() {
  return (
    <section
      className="mt-[clamp(28px,3vw,44px)] flex flex-col gap-cluster-lg rounded-card bg-[#071b3d] px-page-gutter py-card-pad-sm text-white sm:flex-row sm:items-center sm:justify-between lg:px-section-y lg:py-card-pad-sm"
      id="contact"
      aria-labelledby="about-contact-title"
    >
      <div>
        <h2 className="font-brand text-subheading" id="about-contact-title">
          Let’s make the next step simple.
        </h2>
        <p className="mt-1 text-micro text-white/70">
          Connect with an advisor for clear guidance on your business goals.
        </p>
      </div>
      <ContactModal
        variant="white"
        buttonClassName="min-h-control w-[176px] shrink-0 text-button"
        buttonLabel="Talk to an advisor"
      />
    </section>
  );
}
