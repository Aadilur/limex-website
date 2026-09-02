"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type PendingHashNavigation = {
  pathname: string;
  hash: string;
};

function getHashId(hash: string) {
  if (!hash || hash === "#") return null;

  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

function getHashTarget(hash: string) {
  const id = getHashId(hash);
  return id ? document.getElementById(id) : null;
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function scrollToHash(hash: string, lenis: Lenis | null = null) {
  const target = getHashTarget(hash);
  if (!target) return false;

  if (lenis) {
    lenis.scrollTo(target, { force: true });
  } else {
    target.scrollIntoView({ behavior: getScrollBehavior(), block: "start", inline: "nearest" });
  }

  return true;
}

export function SmoothScroll() {
  const pathname = usePathname();
  const router = useRouter();
  const lenisRef = useRef<Lenis | null>(null);
  const pendingNavigationRef = useRef<PendingHashNavigation | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      overscroll: false,
      anchors: false,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    });

    lenisRef.current = lenis;

    let animationFrame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      animationFrame = window.requestAnimationFrame(raf);
    };

    animationFrame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scheduleHashScroll = (hash: string) => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);

      let attempts = 0;
      const tryScroll = () => {
        if (scrollToHash(hash, lenisRef.current) || attempts >= 90) {
          frameRef.current = null;
          return;
        }

        attempts += 1;
        frameRef.current = window.requestAnimationFrame(tryScroll);
      };

      frameRef.current = window.requestAnimationFrame(tryScroll);
    };

    const handleAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const clickedElement = event.target instanceof Element ? event.target : null;
      const anchor = clickedElement?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin || !url.hash) return;

      const destination = `${url.pathname}${url.search}`;
      const current = `${window.location.pathname}${window.location.search}`;

      if (destination === current) {
        if (!getHashTarget(url.hash)) return;

        event.preventDefault();
        if (window.location.href !== url.href) window.history.pushState({}, "", `${destination}${url.hash}`);
        scrollToHash(url.hash, lenisRef.current);
        return;
      }

      event.preventDefault();
      pendingNavigationRef.current = { pathname: url.pathname, hash: url.hash };
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      router.push(destination);
    };

    const handleHashChange = () => {
      if (window.location.hash) scheduleHashScroll(window.location.hash);
    };

    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("hashchange", handleHashChange);

    if (window.location.hash) scheduleHashScroll(window.location.hash);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("hashchange", handleHashChange);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [router, pathname]);

  useEffect(() => {
    const pendingNavigation = pendingNavigationRef.current;
    if (!pendingNavigation || pendingNavigation.pathname !== pathname) return;

    pendingNavigationRef.current = null;
    let attempts = 0;
    const tryScroll = () => {
      if (attempts < 6) {
        attempts += 1;
        frameRef.current = window.requestAnimationFrame(tryScroll);
        return;
      }

      lenisRef.current?.resize();
      if (scrollToHash(pendingNavigation.hash, lenisRef.current)) {
        window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}${pendingNavigation.hash}`);
        frameRef.current = null;
        return;
      }

      if (attempts >= 90) {
        frameRef.current = null;
        return;
      }

      attempts += 1;
      frameRef.current = window.requestAnimationFrame(tryScroll);
    };

    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = window.requestAnimationFrame(tryScroll);
  }, [pathname]);

  return null;
}
