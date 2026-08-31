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
      className="group flex min-w-0 items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-[10px] font-[550] leading-[14px] text-muted transition-colors hover:bg-soft hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-1"
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
    <div className="rounded-[14px] px-1 py-1 transition-colors hover:bg-soft/70">
      <a
        className="group flex min-w-0 items-start gap-2.5 rounded-[10px] px-1.5 py-1.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-1"
        href={href}
        onClick={onNavigate}
        {...getLinkProps(href)}
      >
        <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-[9px] font-bold ${palette.marker} ${palette.markerHover}`.trim()}>{item.marker}</span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-[11px] font-bold leading-[15px] text-ink">{item.label}</span>
          <span className="mt-0.5 block break-words text-[9px] leading-[13px] text-muted">{item.description}</span>
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
    <div className="mb-2.5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={`text-[9px] font-bold uppercase tracking-[0.9px] ${toneClasses[tone].accent}`.trim()}>{group.label}</p>
        <p className="mt-1 max-w-[270px] text-[10px] leading-[14px] text-muted">{group.description}</p>
      </div>
      <span className="shrink-0 rounded-full bg-soft px-2 py-1 text-[9px] font-semibold text-muted">{group.items.length} {group.items.length === 1 ? "area" : "areas"}</span>
    </div>
  );
}

function Spotlight({ item, tone, onNavigate, pathname }: { item: NavItem; tone: MegaMenuTone; onNavigate: () => void; pathname: string }) {
  if (!item.spotlight) return null;

  const palette = toneClasses[tone];
  const href = resolveLocalHref(item.spotlight.ctaHref, pathname);

  return (
    <aside className="hidden min-h-[260px] flex-col justify-between rounded-[22px] bg-[#14131c] p-5 text-white wide:flex">
      <div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.5px] ${palette.badge}`.trim()}>{item.spotlight.badge}</span>
        <h3 className="mt-4 max-w-[185px] text-[20px] font-bold leading-[23px] tracking-[-0.4px]">{item.spotlight.title}</h3>
        <p className="mt-2.5 max-w-[190px] text-[10px] leading-[14px] text-[#c8c4ce]">{item.spotlight.description}</p>
      </div>
      <a
        className="flex min-h-[38px] items-center justify-between gap-2 rounded-full bg-white px-3.5 text-[10px] font-bold text-ink transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
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
      className="absolute left-1/2 top-[calc(100%+14px)] z-40 flex max-h-[calc(100vh-132px)] w-[min(1240px,calc(100vw-48px))] -translate-x-1/2 flex-col overflow-hidden rounded-[28px] border border-warm bg-paper p-5 shadow-[0_24px_60px_rgba(20,26,46,0.14)] animate-menu-panel-in xl:p-6"
      id={`mega-menu-${slugify(item.label)}`}
      role="dialog"
      aria-label={`${item.label} mega menu`}
    >
      <div className="flex shrink-0 items-start justify-between gap-5 border-b border-border pb-4">
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-[1.2px] ${toneClasses[tone].accent}`.trim()}>{item.menuEyebrow ?? item.label}</p>
          <h2 className="mt-1 text-[21px] font-bold leading-6 tracking-[-0.35px] text-ink">{item.menuTitle ?? item.label}</h2>
          <p className="mt-1.5 max-w-[640px] text-[11px] leading-[15px] text-muted">{item.menuDescription}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-warm bg-[#f5ede3] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.7px] text-muted sm:inline-flex">Open state</span>
          <button
            className="grid size-8 place-items-center rounded-full border border-border bg-white text-[18px] leading-none text-muted transition-colors hover:bg-soft hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
            type="button"
            aria-label={`Close ${item.label} menu`}
            onClick={onNavigate}
          >
            ×
          </button>
        </div>
      </div>

      <div className="mt-5 grid min-h-0 flex-1 grid-cols-[minmax(140px,170px)_minmax(0,1fr)] gap-4 wide:grid-cols-[190px_minmax(0,1fr)_224px] wide:gap-5">
        <nav className="min-h-0 overflow-y-auto rounded-[20px] border border-warm bg-cream p-3" aria-label="Browse menu categories">
          <p className="px-2 py-2 text-[9px] font-bold uppercase tracking-[0.9px] text-muted">Browse by need</p>
          <div className="space-y-1">
            <button
              className={`flex min-h-8 w-full items-center justify-between rounded-full px-3 text-left text-[10px] font-semibold transition-colors ${activeGroup === "all" ? "bg-[#14131c] text-white" : "text-ink hover:bg-white"}`.trim()}
              type="button"
              aria-pressed={activeGroup === "all"}
              onClick={() => setActiveGroup("all")}
            >
              <span>All services</span>
              <span className={activeGroup === "all" ? "text-pink" : "text-muted"} aria-hidden="true">→</span>
            </button>
            {groups.map((group) => (
              <button
                className={`flex min-h-8 w-full items-center rounded-full px-3 text-left text-[10px] font-semibold transition-colors ${activeGroup === group.key ? "bg-white text-ink" : "text-ink hover:bg-white"}`.trim()}
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

      <div className="mt-5 grid shrink-0 gap-3 border-t border-border pt-4 text-[10px] text-muted sm:grid-cols-3">
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
    <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto px-1 pb-2 [scrollbar-width:thin]">
      <div className="rounded-2xl border border-warm bg-cream px-3.5 py-3">
        <p className={`text-[9px] font-bold uppercase tracking-[0.9px] ${toneClasses[tone].accent}`.trim()}>{item.menuEyebrow ?? item.label}</p>
        <p className="mt-1 text-[13px] font-bold leading-[17px] text-ink">{item.menuTitle ?? item.label}</p>
        <p className="mt-1 text-[11px] leading-[15px] text-muted">{item.menuDescription}</p>
      </div>
      {groups.map((group) => (
        <section className="border-b border-border pb-3 last:border-b-0" key={group.key}>
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div>
              <p className={`text-[9px] font-bold uppercase tracking-[0.85px] ${toneClasses[tone].accent}`.trim()}>{group.label}</p>
              <p className="mt-0.5 text-[10px] leading-[14px] text-muted">{group.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-soft px-2 py-1 text-[9px] font-semibold text-muted">{group.items.length}</span>
          </div>
          <div className="space-y-1">
            {group.items.map((menuItem) => (
              <div className="rounded-xl bg-white/70 px-2.5 py-2" key={menuItem.label}>
                    <a className="flex min-w-0 items-start justify-between gap-3 text-[12px] font-bold leading-[16px] text-ink" href={resolveLocalHref(menuItem.href, pathname)} onClick={onNavigate} {...getLinkProps(resolveLocalHref(menuItem.href, pathname))}>
                  <span className="min-w-0 break-words">{menuItem.label}</span>
                  <LinkArrow />
                </a>
                <p className="mt-0.5 text-[10px] leading-[14px] text-muted">{menuItem.description}</p>
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
        <a className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-[#14131c] px-3.5 text-[12px] font-bold text-white" href={resolveLocalHref(item.spotlight.ctaHref, pathname)} onClick={onNavigate} {...getLinkProps(resolveLocalHref(item.spotlight.ctaHref, pathname))}>
          <span>{item.spotlight.ctaLabel}</span>
          <LinkArrow small />
        </a>
      ) : null}
    </div>
  );
}
