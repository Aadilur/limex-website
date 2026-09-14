"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { getAdminSession, logoutAdmin } from "@/lib/menu-api";

const adminNavigation = [
  { label: "Overview", href: "/admin" },
  { label: "Landing", href: "/admin/landing" },
  { label: "Menu structure", href: "/admin/services" },
  { label: "Service pages", href: "/admin/services/pages" },
  { label: "About us", href: "/admin/about" },
  { label: "Media library", href: "/admin/media" },
  { label: "Business tools", href: "/admin/tools" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Enquiries & bookings", href: "/admin/inquiries" },
  { label: "Contact settings", href: "/admin/contact" },
  { label: "Legal pages", href: "/admin/legal" },
];

function LimexMark() {
  return (
    <Image
      className="h-auto w-[142px] object-contain object-left"
      src="/brand/limex-logo-light.png"
      alt="Limex Consultancy Firm"
      width={1600}
      height={474}
    />
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <LimexMark />
        </div>
        <span className="grid size-9 place-items-center rounded-full bg-[#e5fbff] text-[12px] font-bold text-[#007ea6]">
          A
        </span>
      </div>

      <div className="pt-7">
        <nav className="mt-3 space-y-1" aria-label="Admin navigation">
          {adminNavigation.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : item.href === "/admin/services"
                  ? pathname === "/admin/services"
                  : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={`group flex items-center gap-3 rounded-[16px] px-3 py-3 transition-colors ${active ? "bg-white text-[#071b3d]" : "text-white/65 hover:bg-white/10 hover:text-white"}`.trim()}
                href={item.href}
                onClick={onNavigate}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-[11px] text-[13px] font-bold ${active ? "bg-[#e8efff] text-[#0055ff]" : "bg-white/10 text-white/70 group-hover:bg-white/15"}`.trim()}
                  aria-hidden="true"
                >
                  {String(
                    adminNavigation.findIndex(
                      (navigationItem) => navigationItem.href === item.href,
                    ) + 1,
                  ).padStart(2, "0")}
                </span>
                <span className="min-w-0 truncate text-[14px] font-semibold">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/10 pt-5">
        <div className="flex items-center gap-3 rounded-[16px] bg-white/[0.08] p-3.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e5fbff] text-[11px] font-bold text-[#007ea6]">
            A
          </span>
          <p className="truncate text-[13px] font-semibold text-white">
            Limex administrator
          </p>
        </div>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void getAdminSession()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logoutAdmin();
    } finally {
      router.replace("/admin/login");
      setSigningOut(false);
    }
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f3f1ec] px-5">
        <div className="flex items-center gap-3 rounded-full border border-[#e4dfd7] bg-white px-5 py-3 text-[13px] font-semibold text-[#6c6863]">
          <span
            className="size-2 animate-pulse rounded-full bg-[#008cff]"
            aria-hidden="true"
          />
          Preparing your workspace…
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#071b3d]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[276px] flex-col bg-[#071b3d] px-5 py-6 lg:flex">
        <SidebarContent />
        <button
          className="mt-5 flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          type="button"
          onClick={() => void handleLogout()}
          disabled={signingOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </aside>

      <div className="lg:pl-[276px]">
        <header className="sticky top-0 z-30 border-b border-[#e4dfd7]/90 bg-[#f3f1ec]/90 px-4 py-4 backdrop-blur-[16px] sm:px-6 lg:px-10 lg:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                className="grid size-10 place-items-center rounded-full bg-[#071b3d] text-white lg:hidden"
                type="button"
                aria-label="Open admin navigation"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <span className="flex w-4 flex-col gap-1" aria-hidden="true">
                  <span className="h-0.5 rounded-full bg-current" />
                  <span className="h-0.5 rounded-full bg-current" />
                  <span className="h-0.5 rounded-full bg-current" />
                </span>
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0055ff]">
                  Limex
                </p>
                <p className="mt-1 text-[15px] font-semibold text-[#071b3d]">
                  Admin
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <a
                className="rounded-full border border-[#d8d2c8] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#4f4b47] transition-colors hover:border-[#bdb5aa] hover:text-[#071b3d]"
                href="/"
                target="_blank"
                rel="noreferrer"
              >
                View website ↗
              </a>
              <span className="grid size-10 place-items-center rounded-full bg-[#e5fbff] text-[12px] font-bold text-[#007ea6]">
                TA
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 h-full w-full border-0 bg-[#071b3d]/55"
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute bottom-3 left-3 top-3 flex w-[min(330px,calc(100%-24px))] flex-col rounded-[24px] bg-[#071b3d] p-5 shadow-[0_20px_60px_rgba(20,20,28,0.28)]">
            <div className="mb-4 flex justify-end">
              <button
                className="grid size-9 place-items-center rounded-full bg-white/10 text-[22px] leading-none text-white"
                type="button"
                aria-label="Close admin navigation"
                onClick={() => setMobileOpen(false)}
              >
                ×
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <button
              className="mt-5 flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              type="button"
              onClick={() => void handleLogout()}
              disabled={signingOut}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
