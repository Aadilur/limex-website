"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import { ActionButton } from "./ui";
import { TopServices } from "./top-services";
import { defaultLandingContent } from "@/lib/landing-defaults";
import type { HeroContent } from "@/lib/landing-types";

export function HeroSection({
  content = defaultLandingContent.hero,
}: {
  content?: HeroContent;
}) {
  const blobWarmRef = useRef<HTMLImageElement>(null);
  const blobCoolRef = useRef<HTMLImageElement>(null);
  const blobCenterRef = useRef<HTMLImageElement>(null);

  // Organic GSAP ambient float for background glow blobs with soft, non-distracting motion
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      if (blobWarmRef.current) {
        gsap.to(blobWarmRef.current, {
          x: 24,
          y: -18,
          scale: 1.05,
          rotation: 4,
          duration: 13,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      if (blobCoolRef.current) {
        gsap.to(blobCoolRef.current, {
          x: -22,
          y: 22,
          scale: 0.95,
          rotation: -5,
          duration: 16,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.4,
        });
      }

      if (blobCenterRef.current) {
        gsap.to(blobCenterRef.current, {
          x: 16,
          y: 14,
          scale: 1.08,
          duration: 19,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.8,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Dynamic rotating phrases for titleSecondary with human typewriter cadence
  const words = useMemo(() => {
    const list =
      content.animatedWords && content.animatedWords.length > 0
        ? content.animatedWords
        : [
            content.titleSecondary || "Guaranteed",
            "Zero Delays",
            "100% Compliant",
            "End-to-End Support",
          ];
    return list.map((item) => item.trim()).filter((item) => item.length > 0);
  }, [content.animatedWords, content.titleSecondary]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState(words[0] || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    if (words.length <= 1 && currentText === words[0]) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setCurrentText(words[0] || "");
      return;
    }

    const targetWord = words[currentWordIndex] || "";

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2800);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (currentText.length === 0) {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        return;
      }
      const deleteTimer = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, 35);
      return () => clearTimeout(deleteTimer);
    }

    // Typing mode
    if (currentText === targetWord) {
      setIsPaused(true);
      return;
    }

    const typeSpeed = 55 + Math.floor(Math.random() * 25);
    const typeTimer = setTimeout(() => {
      setCurrentText(targetWord.slice(0, currentText.length + 1));
    }, typeSpeed);
    return () => clearTimeout(typeTimer);
  }, [currentText, currentWordIndex, isDeleting, isPaused, words]);

  return (
    <section
      className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-page lg:min-h-hero-home lg:rounded-[28px]"
      id="top"
      aria-labelledby="hero-title"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <img
          ref={blobWarmRef}
          className="absolute left-[10%] top-[168px] block size-[360px] opacity-35 select-none mix-blend-multiply transition-opacity duration-1000 lg:left-[33.4%] lg:top-[142px] lg:size-[441px] lg:opacity-40"
          src="/figma/warm-glow.svg"
          alt=""
        />
        <img
          ref={blobCoolRef}
          className="absolute left-[42%] top-[208px] block size-[250px] opacity-30 select-none mix-blend-multiply transition-opacity duration-1000 lg:left-[48.7%] lg:top-[184px] lg:size-[307px] lg:opacity-35"
          src="/figma/cool-glow.svg"
          alt=""
        />
        <img
          ref={blobCenterRef}
          className="absolute left-[24%] top-[246px] block size-[280px] opacity-30 select-none mix-blend-multiply transition-opacity duration-1000 lg:left-[39.1%] lg:top-[223px] lg:size-[331px] lg:opacity-35"
          src="/figma/center-glow.svg"
          alt=""
        />
      </div>

      <div className="relative z-[1] shrink-0 px-5 pt-hero-content-top-separated text-center max-[560px]:pt-hero-content-top-separated-sm lg:absolute lg:left-1/2 lg:top-hero-content-top-separated-lg lg:w-[min(930px,calc(100%-48px))] lg:-translate-x-1/2 lg:px-0 lg:pt-0">
        <p className="mx-auto max-w-[500px] text-overline text-[#52545c] max-[560px]:hidden lg:max-w-none lg:text-kicker">
          {content.eyebrow}
        </p>
        <p className="mx-auto hidden max-w-[320px] text-meta font-display uppercase tracking-[0.1em] text-[#2b5e8c] max-[560px]:block">
          {content.mobileEyebrow}
        </p>
        <h1
          className="my-5 flex flex-col font-brand text-hero-mobile text-ink max-[560px]:my-4 sm:text-hero-tablet wide:text-hero lg:my-hero-title-gap lg:mb-[22px]"
          id="hero-title"
        >
          <span className="relative inline-block select-none">
            <span className="bg-gradient-to-r from-accent via-[#ff6b8b] to-accent bg-[length:200%_auto] bg-clip-text text-transparent animate-hero-sheen">
              {content.titlePrimary}
            </span>
          </span>
          <span className="relative mt-1 inline-flex min-h-[1.25em] items-center justify-center">
            <em className="font-normal not-italic text-[#576378] underline decoration-wavy decoration-[1.5px] decoration-[#576378]/55 underline-offset-[5px] sm:underline-offset-[7px]">
              {currentText}
            </em>
            <span
              aria-hidden="true"
              className="inline-block h-[0.78em] w-[2.5px] ml-1.5 translate-y-[1px] rounded-full bg-accent animate-pulse align-middle"
            />
          </span>
        </h1>
        <p className="mx-auto max-w-[520px] text-body-sm text-[#52545c] lg:max-w-[620px] lg:text-body">
          {content.description}
        </p>
        <div className="mt-hero-action-gap grid w-full max-w-[338px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3 max-[380px]:grid-cols-1 lg:flex lg:max-w-none lg:items-center lg:justify-center lg:gap-nav lg:mt-hero-action-gap-lg">
          <ActionButton
            href={content.primaryCtaHref}
            variant="dark"
            arrow="text"
            className="min-h-control w-full min-w-0 justify-center gap-2 whitespace-nowrap border-[#071b3d] bg-[#071b3d] px-3 text-button text-white shadow-[0_10px_22px_rgba(20,19,26,0.12)] hover:border-[#25222e] hover:bg-[#25222e] hover:shadow-[0_14px_28px_rgba(20,19,26,0.16)] lg:h-button-lg lg:w-[185px] lg:gap-cluster-sm lg:px-[22px] lg:shadow-[0_12px_26px_rgba(20,19,26,0.14)] lg:hover:bg-[#25222e] lg:hover:shadow-[0_16px_32px_rgba(20,19,26,0.18)]"
          >
            {content.primaryCtaLabel}
          </ActionButton>
          <ActionButton
            href={content.secondaryCtaHref}
            variant="outline"
            arrow="none"
            className="min-h-control w-full min-w-0 justify-center whitespace-nowrap border-[#c9c0c4] bg-white/55 px-3 text-button text-ink shadow-none hover:border-accent hover:bg-white/75 hover:shadow-none lg:h-button-lg lg:w-[170px] lg:bg-white/85 lg:px-4 lg:shadow-[0_8px_20px_rgba(67,56,65,0.06)] lg:hover:bg-white lg:shadow-none lg:hover:bg-white lg:hover:shadow-[0_12px_24px_rgba(67,56,65,0.1)]"
          >
            {content.secondaryCtaLabel}
          </ActionButton>
        </div>
      </div>

      <div
        className="absolute right-[14px] top-[327px] z-[1] hidden h-[127px] w-[19px] items-center justify-center lg:flex"
        aria-hidden="true"
      >
        <span className="whitespace-nowrap text-body font-strong text-[#52545c] [transform:rotate(-90deg)]">
          Connect with us
        </span>
      </div>

      <div className="relative z-[1] mx-5 mt-hero-lower-gap mb-hero-lower-bottom-sm min-w-0 lg:absolute lg:bottom-[12px] lg:left-[78px] lg:right-[78px] lg:mx-0 lg:mb-0 lg:mt-0">
        <TopServices featuredServices={content.featuredServices} />
      </div>
    </section>
  );
}
