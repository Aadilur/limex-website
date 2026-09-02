"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getPublicAboutReels, getPublicAboutTeam, type AboutReel, type AboutTeamMember } from "@/lib/about-api";
import { ActionButton, SectionTitle } from "./ui";

const approachPoints = [
  { label: "Listen first", description: "Start with the real question." },
  { label: "Explain clearly", description: "Make the next choice easier." },
  { label: "Stay close", description: "Keep the work moving." },
];

export function AboutHero() {
  return (
    <section className="grid gap-section-gap-lg lg:grid-cols-[minmax(0,1.42fr)_minmax(340px,0.92fr)] lg:items-stretch lg:gap-section-gap" aria-labelledby="about-title">
      <div className="flex min-h-[260px] flex-col items-start justify-center">
        <h1 className="max-w-[760px] font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="about-title">
          Business clarity, built around people.
        </h1>
        <p className="mt-cluster max-w-[650px] text-body-sm text-muted">
          We make the work behind your business easier to understand—and easier to move forward.
        </p>
        <div className="mt-section-gap-lg">
          <ActionButton href="#team" variant="dark" arrow="text" className="min-h-control min-w-[148px] px-4 text-button">
            Meet the team
          </ActionButton>
        </div>
      </div>

      <aside className="rounded-card border border-white bg-white px-card-pad py-card-pad lg:min-h-[246px]" id="approach" aria-labelledby="approach-title">
        <h2 className="font-brand text-subheading text-[#393939]" id="approach-title">Clear from the first conversation.</h2>
        <ul className="mt-section-gap-lg space-y-2.5">
          {approachPoints.map((point) => (
            <li className="flex items-start gap-cluster-sm" key={point.label}>
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#fce0e3] text-[10px] font-bold text-pink" aria-hidden="true">✓</span>
              <span className="min-w-0">
                <strong className="block text-footer text-[#393939]">{point.label}</strong>
                <span className="mt-0.5 block text-micro text-muted">{point.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

const trustMetrics = [
  { value: "01", label: "Understand", description: "Start with your real goal." },
  { value: "02", label: "Guide", description: "Make the next decision clear." },
  { value: "03", label: "Stay close", description: "Keep every detail moving." },
];

export function AboutTrustStrip() {
  return (
    <section className="mt-[clamp(38px,4vw,56px)] grid gap-cluster-lg rounded-nav border border-warm bg-white px-card-pad-sm py-card-pad-sm lg:grid-cols-[240px_repeat(3,minmax(0,1fr))] lg:gap-0 lg:px-card-pad lg:py-card-pad-sm" aria-label="About Limex trust metrics">
      <div className="flex flex-col justify-center gap-cluster-xs">
        <p className="text-footer font-text text-ink">A simple rhythm for important work.</p>
      </div>
      {trustMetrics.map((metric) => (
        <div className="border-t border-warm pt-4 lg:border-l lg:border-t-0 lg:px-6 lg:pt-0" key={metric.label}>
          <p className="text-section-title font-bold text-ink">{metric.value}</p>
          <p className="mt-0.5 text-overline text-pink">{metric.label}</p>
          <p className="mt-0.5 text-micro text-muted">{metric.description}</p>
        </div>
      ))}
    </section>
  );
}

const teamPhotoTones = [
  "bg-[#d6ebde] text-[#2e6b4f]",
  "bg-[#dedbfa] text-[#5c4aa6]",
  "bg-[#fae5cc] text-[#9e5726]",
  "bg-[#d1edeb] text-[#1f6e70]",
  "bg-[#fcdbe0] text-[#b83652]",
];

function teamInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length ? words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() : "LM";
}

function TeamMemberPhoto({ member, index, onError }: { member: AboutTeamMember; index: number; onError: () => void }) {
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
    <div className={`grid size-full place-items-center ${teamPhotoTones[index % teamPhotoTones.length]}`.trim()} aria-hidden="true">
      <div className="flex flex-col items-center">
        <span className="font-brand text-[30px] font-bold leading-none tracking-[-0.07em]">{teamInitials(member.name)}</span>
        <span className="mt-1 text-[7px] font-bold uppercase tracking-[0.16em] opacity-75">Photo</span>
      </div>
    </div>
  );
}

function TeamMemberCard({ member, index, onImageError }: { member: AboutTeamMember; index: number; onImageError: () => void }) {
  return (
    <article className="group flex min-h-[104px] items-center gap-3.5 py-2 transition-transform duration-300 hover:-translate-y-0.5 sm:min-h-[112px] sm:gap-4">
      <div className="size-[80px] shrink-0 overflow-hidden rounded-[18px] sm:size-[88px]">
        <TeamMemberPhoto member={member} index={index} onError={onImageError} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-pink">{member.title}</p>
        <h3 className="mt-1 truncate font-brand text-[18px] font-bold leading-[1.1] tracking-[-0.04em] text-ink">{member.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.45] text-muted">{member.description}</p>
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
      setMembers((current) => current.map((member) => member.id === memberId ? { ...member, imageUrl: null } : member));
      return;
    }

    imageRetries.current.add(memberId);
    void loadMembers();
  }

  return (
    <section className="mt-[clamp(38px,4vw,56px)] rounded-panel border border-warm bg-white p-card-pad-sm lg:p-section-y" id="team" aria-labelledby="team-title">
      <div className="flex flex-col gap-cluster-sm sm:flex-row sm:items-start sm:justify-between">
        <SectionTitle
          id="team-title"
          title="A team that stays close to the work."
          description="Meet the people you’ll work with."
          className="max-w-[680px]"
          size="compact"
        />
      </div>
      <div className="mt-section-gap grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-8">
        {loading ? [0, 1, 2].map((index) => <div className="animate-pulse overflow-hidden rounded-[20px] border border-[#eee9e2] bg-[#faf9f6]" key={index}><div className="aspect-[1.18] bg-[#f1eee8]" /><div className="space-y-2 p-cluster"><div className="h-2.5 w-24 rounded-full bg-[#e8e1d8]" /><div className="h-5 w-36 rounded-full bg-[#e8e1d8]" /><div className="h-3 w-full rounded-full bg-[#eee9e2]" /></div></div>) : members.length ? members.map((member, index) => <TeamMemberCard key={member.id} member={member} index={index} onImageError={() => handleImageError(member.id)} />) : (
          <div className="rounded-[18px] border border-dashed border-[#d8d1c7] bg-[#faf9f6] px-5 py-10 text-center sm:col-span-2 lg:col-span-3">
            <p className="font-brand text-subheading font-bold text-ink">The people behind Limex are on their way.</p>
            <p className="mt-1.5 text-micro text-muted">{loadError ? "Please check back soon." : "Our team profiles are being updated."}</p>
          </div>
        )}
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
    return <img className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" src={reel.thumbnailUrl} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />;
  }

  return (
    <div className={`absolute inset-0 grid place-items-center ${reelFallbackTones[index % reelFallbackTones.length]}`.trim()} aria-hidden="true">
      <span className="font-brand text-5xl font-bold tracking-[-0.08em]">LIMEX</span>
    </div>
  );
}

function PlayIcon() {
  return <svg className="ml-0.5 size-5 fill-current" viewBox="0 0 20 20" aria-hidden="true"><path d="M6.6 4.3a1 1 0 0 1 1.5-.86l6.5 4.7a1 1 0 0 1 0 1.62l-6.5 4.7a1 1 0 0 1-1.5-.86V4.3Z" /></svg>;
}

function CloseIcon() {
  return <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return <svg className={`size-4 ${direction === "left" ? "rotate-180" : ""}`.trim()} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h11M10.5 4.5 16 10l-5.5 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>;
}

function AboutReelCard({ reel, index, playing, onPlay, onStop }: { reel: AboutReel; index: number; playing: boolean; onPlay: () => void; onStop: () => void }) {
  const title = reelDisplayTitle(reel);

  return (
    <article className={[
      "group relative h-[420px] min-w-[min(306px,calc(100vw-72px))] basis-[min(306px,calc(100vw-72px))] snap-start overflow-hidden rounded-[20px] border bg-[#293a40] shadow-[0_14px_34px_rgba(27,34,30,0.08)] transition-transform duration-300 hover:-translate-y-1 lg:h-[520px] lg:min-w-[306px] lg:basis-[306px]",
      playing ? "border-[#14131c]" : "border-[#d7d5d0]",
    ].join(" ")}>
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
          <button className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/20 bg-[#14131c]/80 text-white backdrop-blur-[10px] transition-colors hover:bg-[#14131c] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-white/70 focus-visible:outline-offset-2" type="button" aria-label={`Close ${title}`} onClick={onStop}><CloseIcon /></button>
        </div>
      ) : (
        <>
          <ReelThumbnail reel={reel} index={index} />
          <div className="absolute inset-x-0 bottom-0 flex min-h-[142px] flex-col justify-end gap-1.5 bg-gradient-to-b from-transparent via-[rgba(18,20,33,0.38)] to-[rgba(18,20,33,0.94)] px-5 pb-5 pt-16 text-[#ffebd7] drop-shadow-[0_1px_12px_rgba(18,20,33,0.32)]">
            <p className="text-overline text-[#fac7cc]">{reel.title ? "LIMEX STORY" : "YOUTUBE STORY"}</p>
            <h3 className="max-w-[250px] line-clamp-2 text-card-title">{title}</h3>
          </div>
          <button className="absolute left-1/2 top-1/2 z-10 grid size-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/75 bg-white/95 text-[#17151c] shadow-[0_10px_26px_rgba(18,20,33,0.22)] ring-8 ring-white/20 transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/50 focus-visible:outline-offset-3" type="button" aria-label={`Play ${title}`} onClick={onPlay}><PlayIcon /></button>
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
      const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      setCanScrollPrevious(scroller.scrollLeft > 4);
      setCanScrollNext(scroller.scrollLeft < maxScrollLeft - 4);
    };

    updateScrollState();
    scroller.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateScrollState);
    observer?.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", updateScrollState);
      observer?.disconnect();
    };
  }, [reels.length]);

  useEffect(() => {
    if (!activeReelId) return;
    document.getElementById(`about-reel-${activeReelId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeReelId]);

  function moveReels(direction: "previous" | "next") {
    reelScrollerRef.current?.scrollBy({ left: (direction === "next" ? 1 : -1) * 322, behavior: "smooth" });
  }

  return (
    <section className="mt-[clamp(38px,4vw,56px)] rounded-panel border border-[#e0dcd4] bg-[#f7f4ef] p-card-pad-sm lg:p-card-pad" aria-labelledby="about-reels-title">
      <div className="flex flex-col gap-cluster-lg sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle
          id="about-reels-title"
          title="A closer look at how we work."
          description="Short stories from our people, process and point of view."
          className="max-w-[640px]"
          size="compact"
        />
        {!loading && reels.length > 1 ? (
          <div className="flex shrink-0 items-center gap-2" aria-label="Video reel controls">
            <button className="grid size-10 place-items-center rounded-full border border-[#d2cbc0] bg-white text-[#4f4b47] transition-all hover:-translate-y-0.5 hover:border-[#14131c] hover:text-[#14131c] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/40 focus-visible:outline-offset-2" type="button" aria-label="Previous video reel" disabled={!canScrollPrevious} onClick={() => moveReels("previous")}><ArrowIcon direction="left" /></button>
            <button className="grid size-10 place-items-center rounded-full bg-[#14131c] text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2933] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/40 focus-visible:outline-offset-2" type="button" aria-label="Next video reel" disabled={!canScrollNext} onClick={() => moveReels("next")}><ArrowIcon direction="right" /></button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-section-gap-lg flex min-h-0 gap-card-gap overflow-hidden" aria-label="Loading video reels">
          {[0, 1, 2].map((index) => <div className="h-[420px] min-w-[min(306px,calc(100vw-72px))] animate-pulse rounded-[20px] border border-[#e0dcd4] bg-[#ebe7df] lg:h-[520px] lg:min-w-[306px]" key={index} />)}
        </div>
      ) : loadError ? (
        <div className="mt-section-gap-lg rounded-[18px] border border-dashed border-[#d4ccc1] bg-white/65 px-5 py-10 text-center">
          <p className="font-brand text-subheading-mobile font-bold text-ink">Our stories are taking shape.</p>
          <p className="mt-1.5 text-micro text-muted">Please check back soon for Limex on video.</p>
        </div>
      ) : reels.length ? (
        <div ref={reelScrollerRef} className="mt-section-gap-lg flex min-h-0 snap-x snap-proximity gap-card-gap overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {reels.map((reel, index) => <div className="shrink-0" id={`about-reel-${reel.id}`} key={reel.id}><AboutReelCard reel={reel} index={index} playing={activeReelId === reel.id} onPlay={() => setActiveReelId(reel.id)} onStop={() => setActiveReelId(null)} /></div>)}
        </div>
      ) : (
        <div className="mt-section-gap-lg rounded-[18px] border border-dashed border-[#d4ccc1] bg-white/65 px-5 py-10 text-center">
          <p className="font-brand text-subheading-mobile font-bold text-ink">Our story is coming soon.</p>
          <p className="mt-1.5 text-micro text-muted">New Limex video stories will appear here.</p>
        </div>
      )}
    </section>
  );
}

export function AboutContactCta() {
  return (
    <section className="mt-[clamp(38px,4vw,56px)] flex flex-col gap-cluster-lg rounded-card bg-[#14131c] px-page-gutter py-card-pad-sm text-white sm:flex-row sm:items-center sm:justify-between lg:px-section-y lg:py-card-pad-sm" id="contact" aria-labelledby="about-contact-title">
      <div>
        <h2 className="font-brand text-subheading" id="about-contact-title">Let’s make the next step simple.</h2>
      </div>
      <ActionButton href="/#contact" variant="white" arrow="text" className="min-h-control w-[176px] shrink-0 text-button">
        Talk to an expert
      </ActionButton>
    </section>
  );
}
