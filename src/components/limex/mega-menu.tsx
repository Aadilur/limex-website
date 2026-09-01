import { useState } from "react";
import { usePathname } from "next/navigation";

import type { MegaMenuChild, MegaMenuGroup, MegaMenuItem, MegaMenuTone, NavItem } from "./data";

const toneClasses: Record<MegaMenuTone, { accent: string; marker: string; markerHover: string; badge: string }> = {
  green: {
    accent: "text-[#2e6b4f]",
    marker: "bg-[#d6edde] text-[#2e6b4f]",
    markerHover: "group-hover:bg-[#c6e5d3]",
    badge: "bg-[#d6edde] text-[#2e6b4f]",
  },
  violet: {
    accent: "text-[#5c4aa6]",
    marker: "bg-[#dedbfa] text-[#5c4aa6]",
    markerHover: "group-hover:bg-[#d1cdf5]",
    badge: "bg-[#dedbfa] text-[#5c4aa6]",
  },
  teal: {
    accent: "text-[#1f6e70]",
    marker: "bg-[#d1edeb] text-[#1f6e70]",
    markerHover: "group-hover:bg-[#c3e5e3]",
    badge: "bg-[#d1edeb] text-[#1f6e70]",
  },
  orange: {
    accent: "text-[#9e5726]",
    marker: "bg-[#fae5cc] text-[#9e5726]",
    markerHover: "group-hover:bg-[#f5d8bd]",
    badge: "bg-[#fae5cc] text-[#9e5726]",
  },
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getLinkProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};
}

function resolveLocalHref(href: string, pathname: string) {
  if (!href.startsWith("#") || pathname === "/") return href;
  return `/${href}`;
}

function LinkArrow({ small = false }: { small?: boolean }) {
  return <img className={small ? "size-3 shrink-0" : "size-3.5 shrink-0"} src="/figma/arrow-up-right.svg" alt="" aria-hidden="true" />;
}

function ChildLink({ child, onNavigate, pathname }: { child: MegaMenuChild; onNavigate: () => void; pathname: string }) {
  const href = resolveLocalHref(child.href, pathname);

  return (
    <a
      className="group flex min-w-0 items-start justify-between gap-cluster-sm rounded-control px-2 py-cluster-xs text-micro font-text text-muted transition-colors hover:bg-soft hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-1"
      href={href}
      onClick={onNavigate}
      {...getLinkProps(href)}
    >
      <span className="min-w-0 break-words">{child.label}</span>
      <LinkArrow small />
    </a>
  );
}

function MegaMenuItemRow({ item, tone, onNavigate, pathname }: { item: MegaMenuItem; tone: MegaMenuTone; onNavigate: () => void; pathname: string }) {
  const palette = toneClasses[tone];
  const href = resolveLocalHref(item.href, pathname);

  return (
    <div className="rounded-control px-1 py-1 transition-colors hover:bg-soft/70">
      <a
        className="group flex min-w-0 items-start gap-cluster rounded-control px-cluster-sm py-cluster-xs focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-1"
        href={href}
        onClick={onNavigate}
        {...getLinkProps(href)}
      >
        <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-nav-compact font-bold ${palette.marker} ${palette.markerHover}`.trim()}>{item.marker}</span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-meta font-bold text-ink">{item.label}</span>
          <span className="mt-0.5 block break-words text-micro text-muted">{item.description}</span>
        </span>
        <LinkArrow />
      </a>
      {item.children?.length ? (
        <div className="ml-[43px] mt-1 space-y-0.5 border-l border-border pl-2">
          {item.children.map((child) => <ChildLink child={child} key={child.label} onNavigate={onNavigate} pathname={pathname} />)}
        </div>
      ) : null}
    </div>
  );
}

function GroupHeader({ group, tone }: { group: MegaMenuGroup; tone: MegaMenuTone }) {
  return (
    <div className="mb-cluster-sm flex items-start justify-between gap-cluster-sm">
      <div className="min-w-0">
        <p className={`text-overline ${toneClasses[tone].accent}`.trim()}>{group.label}</p>
        <p className="mt-1 max-w-[270px] text-micro text-muted">{group.description}</p>
      </div>
      <span className="shrink-0 rounded-full bg-soft px-2 py-1 text-nav-compact font-semibold text-muted">{group.items.length} {group.items.length === 1 ? "area" : "areas"}</span>
    </div>
  );
}

function Spotlight({ item, tone, onNavigate, pathname }: { item: NavItem; tone: MegaMenuTone; onNavigate: () => void; pathname: string }) {
  if (!item.spotlight) return null;

  const palette = toneClasses[tone];
  const href = resolveLocalHref(item.spotlight.ctaHref, pathname);

  return (
    <aside className="hidden min-h-[260px] flex-col justify-between rounded-card bg-[#14131c] p-card-pad text-white wide:flex">
      <div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-overline ${palette.badge}`.trim()}>{item.spotlight.badge}</span>
        <h3 className="mt-cluster font-brand text-subheading">{item.spotlight.title}</h3>
        <p className="mt-cluster-sm max-w-[190px] text-micro text-[#c8c4ce]">{item.spotlight.description}</p>
      </div>
      <a
        className="flex min-h-[38px] items-center justify-between gap-cluster-sm rounded-pill bg-white px-3.5 text-micro font-bold text-ink transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
        href={href}
        onClick={onNavigate}
        {...getLinkProps(href)}
      >
        <span>{item.spotlight.ctaLabel}</span>
        <LinkArrow small />
      </a>
    </aside>
  );
}

export function MegaMenuPanel({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const groups = item.megaGroups ?? [];
  const tone = item.tone ?? "green";
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState("all");
  const visibleGroups = activeGroup === "all" ? groups : groups.filter((group) => group.key === activeGroup);

  return (
    <div
      className="absolute left-1/2 top-[calc(100%+14px)] z-40 flex max-h-[calc(100vh-132px)] w-[min(1240px,calc(100vw-48px))] -translate-x-1/2 flex-col overflow-hidden rounded-panel border border-warm bg-paper p-card-pad shadow-[0_24px_60px_rgba(20,26,46,0.14)] animate-menu-panel-in xl:p-card-pad"
      id={`mega-menu-${slugify(item.label)}`}
      role="dialog"
      aria-label={`${item.label} mega menu`}
    >
      <div className="flex shrink-0 items-start justify-between gap-5 border-b border-border pb-4">
        <div className="min-w-0">
          <p className={`text-overline ${toneClasses[tone].accent}`.trim()}>{item.menuEyebrow ?? item.label}</p>
          <h2 className="mt-1 font-brand text-subheading text-ink">{item.menuTitle ?? item.label}</h2>
          <p className="mt-cluster-sm max-w-[640px] text-meta text-muted">{item.menuDescription}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-warm bg-[#f5ede3] px-3 py-1.5 text-overline text-muted sm:inline-flex">Open state</span>
          <button
            className="grid size-8 place-items-center rounded-full border border-border bg-white text-icon-sm text-muted transition-colors hover:bg-soft hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
            type="button"
            aria-label={`Close ${item.label} menu`}
            onClick={onNavigate}
          >
            ×
          </button>
        </div>
      </div>

      <div className="mt-section-gap-lg grid min-h-0 flex-1 grid-cols-[minmax(140px,170px)_minmax(0,1fr)] gap-cluster wide:grid-cols-[190px_minmax(0,1fr)_224px] wide:gap-cluster-sm">
        <nav className="min-h-0 overflow-y-auto rounded-card border border-warm bg-cream p-cluster" aria-label="Browse menu categories">
          <p className="px-2 py-2 text-overline text-muted">Browse by need</p>
          <div className="space-y-1">
            <button
              className={`flex min-h-8 w-full items-center justify-between rounded-pill px-3 text-left text-micro font-semibold transition-colors ${activeGroup === "all" ? "bg-[#14131c] text-white" : "text-ink hover:bg-white"}`.trim()}
              type="button"
              aria-pressed={activeGroup === "all"}
              onClick={() => setActiveGroup("all")}
            >
              <span>All services</span>
              <span className={activeGroup === "all" ? "text-pink" : "text-muted"} aria-hidden="true">→</span>
            </button>
            {groups.map((group) => (
              <button
                className={`flex min-h-8 w-full items-center rounded-pill px-3 text-left text-micro font-semibold transition-colors ${activeGroup === group.key ? "bg-white text-ink" : "text-ink hover:bg-white"}`.trim()}
                type="button"
                aria-pressed={activeGroup === group.key}
                key={group.key}
                onClick={() => setActiveGroup(group.key)}
              >
                <span className="break-words">{group.railLabel}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="min-h-0 overflow-y-auto pr-1 [scrollbar-width:thin]">
          <div className="grid gap-x-5 gap-y-8 md:grid-cols-2 wide:grid-cols-3">
            {visibleGroups.map((group) => (
              <section className="min-w-0" id={`mega-${group.key}`} key={group.key}>
                <GroupHeader group={group} tone={tone} />
                <div className="space-y-1">
                  {group.items.map((menuItem) => <MegaMenuItemRow item={menuItem} key={menuItem.label} onNavigate={onNavigate} pathname={pathname} tone={tone} />)}
                </div>
              </section>
            ))}
          </div>
        </div>

        <Spotlight item={item} onNavigate={onNavigate} pathname={pathname} tone={tone} />
      </div>

      <div className="mt-section-gap-lg grid shrink-0 gap-cluster-sm border-t border-border pt-4 text-micro text-muted sm:grid-cols-3">
        <span><strong className="font-bold text-ink">Group by intent</strong> · find the right area quickly.</span>
        <span><strong className="font-bold text-ink">Surface the detail</strong> · keep every next step close.</span>
        <span><strong className="font-bold text-ink">One clear action</strong> · ask when you need help.</span>
      </div>
    </div>
  );
}

export function MobileMegaMenuContent({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const groups = item.megaGroups ?? [];
  const tone = item.tone ?? "green";
  const pathname = usePathname();

  return (
    <div className="flex max-h-[65vh] flex-col gap-section-gap-lg overflow-y-auto px-1 pb-cluster [scrollbar-width:thin]">
      <div className="rounded-card border border-warm bg-cream px-card-pad-sm py-cluster">
        <p className={`text-overline ${toneClasses[tone].accent}`.trim()}>{item.menuEyebrow ?? item.label}</p>
        <p className="mt-1 text-body-xs font-bold text-ink">{item.menuTitle ?? item.label}</p>
        <p className="mt-1 text-meta text-muted">{item.menuDescription}</p>
      </div>
      {groups.map((group) => (
        <section className="border-b border-border pb-3 last:border-b-0" key={group.key}>
          <div className="mb-cluster-sm flex items-center justify-between gap-cluster-sm px-1">
            <div>
              <p className={`text-overline ${toneClasses[tone].accent}`.trim()}>{group.label}</p>
              <p className="mt-0.5 text-micro text-muted">{group.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-soft px-2 py-1 text-nav-compact font-semibold text-muted">{group.items.length}</span>
          </div>
          <div className="space-y-1">
            {group.items.map((menuItem) => (
              <div className="rounded-control bg-white/70 px-2.5 py-2" key={menuItem.label}>
                    <a className="flex min-w-0 items-start justify-between gap-cluster text-body-xs font-bold text-ink" href={resolveLocalHref(menuItem.href, pathname)} onClick={onNavigate} {...getLinkProps(resolveLocalHref(menuItem.href, pathname))}>
                  <span className="min-w-0 break-words">{menuItem.label}</span>
                  <LinkArrow />
                </a>
                <p className="mt-0.5 text-micro text-muted">{menuItem.description}</p>
                {menuItem.children?.length ? (
                  <div className="mt-2 space-y-0.5 border-l border-border pl-2">
                    {menuItem.children.map((child) => <ChildLink child={child} key={child.label} onNavigate={onNavigate} pathname={pathname} />)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
      {item.spotlight ? (
        <a className="flex min-h-12 items-center justify-between gap-cluster rounded-card bg-[#14131c] px-3.5 text-body-xs font-bold text-white" href={resolveLocalHref(item.spotlight.ctaHref, pathname)} onClick={onNavigate} {...getLinkProps(resolveLocalHref(item.spotlight.ctaHref, pathname))}>
          <span>{item.spotlight.ctaLabel}</span>
          <LinkArrow small />
        </a>
      ) : null}
    </div>
  );
}
