import { useState } from "react";
import { usePathname } from "next/navigation";

import type { MegaMenuChild, MegaMenuItem, MegaMenuTone, NavItem } from "./data";
import { WaveLabel } from "./ui";

const toneClasses: Record<MegaMenuTone, { accent: string; marker: string; badge: string }> = {
  green: {
    accent: "text-[#007ea6]",
    marker: "bg-[#e5fbff] text-[#007ea6]",
    badge: "bg-[#e5fbff] text-[#007ea6]",
  },
  violet: {
    accent: "text-[#006dce]",
    marker: "bg-[#e8f3ff] text-[#006dce]",
    badge: "bg-[#e8f3ff] text-[#006dce]",
  },
  teal: {
    accent: "text-brand-blue",
    marker: "bg-[#e9efff] text-brand-blue",
    badge: "bg-[#e9efff] text-brand-blue",
  },
  orange: {
    accent: "text-[#006dce]",
    marker: "bg-[#eaf3ff] text-[#006dce]",
    badge: "bg-[#eaf3ff] text-[#006dce]",
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

function MenuEyebrow({ item, tone }: { item: NavItem; tone: MegaMenuTone }) {
  return (
    <p className={`text-overline ${toneClasses[tone].accent}`.trim()}>{item.menuEyebrow ?? item.label}</p>
  );
}

function ChildLink({ child, onNavigate, pathname }: { child: MegaMenuChild; onNavigate: () => void; pathname: string }) {
  const href = resolveLocalHref(child.href, pathname);

  return (
    <a
      className="group flex min-w-0 items-start justify-between gap-cluster-sm rounded-control px-2 py-cluster-xs text-micro font-text text-muted transition-colors duration-200 ease-out hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-1"
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
    <div className="mb-cluster-sm break-inside-avoid rounded-control px-1 py-1">
      <a
        className="group flex min-w-0 items-start gap-cluster rounded-control px-cluster-sm py-cluster-xs text-ink transition-colors duration-200 ease-out hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-1"
        href={href}
        onClick={onNavigate}
        {...getLinkProps(href)}
      >
        <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-nav-compact font-bold ${palette.marker}`.trim()}>{item.marker}</span>
        <span className="min-w-0 flex-1">
          <span className="block break-words text-meta font-bold text-ink transition-colors duration-200 ease-out group-hover:text-pink">{item.label}</span>
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

function Spotlight({ item, tone, onNavigate, pathname }: { item: NavItem; tone: MegaMenuTone; onNavigate: () => void; pathname: string }) {
  if (!item.spotlight) return null;

  const palette = toneClasses[tone];
  const href = resolveLocalHref(item.spotlight.ctaHref, pathname);

  return (
    <aside className="relative hidden h-fit min-h-[244px] self-start overflow-hidden rounded-card border border-white/10 bg-[#071b3d] p-4 text-white wide:flex">
      <div className={`absolute inset-x-0 top-0 h-1 ${palette.badge}`.trim()} aria-hidden="true" />
      <div className="flex min-h-[212px] flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-cluster-sm">
            <WaveLabel className="text-white/85">{item.spotlight.badge}</WaveLabel>
            <span className="text-overline text-white/45">NEXT</span>
          </div>
          <h3 className="mt-section-gap-lg max-w-[200px] font-brand text-body-lg">{item.spotlight.title}</h3>
          <p className="mt-cluster-sm max-w-[200px] text-body-xs text-[#c8c4ce]">{item.spotlight.description}</p>
        </div>
        <a
          className="flex min-h-[42px] items-center justify-between gap-cluster-sm overflow-hidden rounded-pill bg-white px-3.5 text-micro font-bold text-ink transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
          href={href}
          onClick={onNavigate}
          {...getLinkProps(href)}
        >
          <span className="min-w-0 truncate whitespace-nowrap">{item.spotlight.ctaLabel}</span>
          <LinkArrow small />
        </a>
      </div>
    </aside>
  );
}

export function MegaMenuPanel({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const groups = item.megaGroups ?? [];
  const tone = item.tone ?? "green";
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState("all");
  const visibleGroups = activeGroup === "all" ? groups : groups.filter((group) => group.key === activeGroup);
  const visibleItems = visibleGroups
    .flatMap((group) => group.items)
    .sort((left, right) => Number(left.marker) - Number(right.marker));
  const isDenseMenu = visibleItems.length > 12;
  const panelHeightClass = isDenseMenu ? "h-[min(640px,calc(100vh-132px))]" : "h-fit";

  return (
    <div
      className={`absolute left-1/2 top-[calc(100%+14px)] z-40 flex ${panelHeightClass} max-h-[calc(100vh-132px)] w-[min(1240px,calc(100vw-48px))] -translate-x-1/2 flex-col overflow-hidden rounded-panel border border-warm bg-paper p-4 shadow-[0_24px_60px_rgba(20,26,46,0.14)] animate-menu-panel-in xl:p-5`.trim()}
      id={`mega-menu-${slugify(item.label)}`}
      role="dialog"
      aria-label={`${item.label} mega menu`}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border pb-3">
        <MenuEyebrow item={item} tone={tone} />
        <button
          className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-white text-icon-sm text-muted transition-colors hover:bg-soft hover:text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
          type="button"
          aria-label={`Close ${item.label} menu`}
          onClick={onNavigate}
        >
          ×
        </button>
      </div>

      <div className="mt-cluster-lg grid min-h-0 flex-1 grid-cols-[minmax(136px,164px)_minmax(0,1fr)] gap-cluster wide:grid-cols-[152px_minmax(0,1fr)_224px] wide:gap-cluster">
        <nav className="min-h-0 overflow-y-auto rounded-card border border-warm bg-cream p-2" aria-label="Browse menu categories">
          <p className="px-2 py-1.5 text-overline text-muted">Browse by need</p>
          <div className="space-y-1">
            <button
              className={`flex min-h-8 w-full items-center justify-between rounded-pill px-2.5 text-left text-micro font-semibold transition-colors ${activeGroup === "all" ? "bg-[#071b3d] text-white" : "text-ink hover:bg-white"}`.trim()}
              type="button"
              aria-pressed={activeGroup === "all"}
              onClick={() => setActiveGroup("all")}
            >
              <span>All services</span>
              <span className={activeGroup === "all" ? "text-pink" : "text-muted"} aria-hidden="true">→</span>
            </button>
            {groups.map((group) => (
              <button
                className={`flex min-h-8 w-full items-center rounded-pill px-2.5 text-left text-micro font-semibold transition-colors ${activeGroup === group.key ? "bg-white text-ink" : "text-ink hover:bg-white"}`.trim()}
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
          <div className="columns-1 gap-cluster md:columns-2 wide:columns-3">
            {visibleItems.map((menuItem) => <MegaMenuItemRow item={menuItem} key={menuItem.label} onNavigate={onNavigate} pathname={pathname} tone={tone} />)}
          </div>
        </div>

        <Spotlight item={item} onNavigate={onNavigate} pathname={pathname} tone={tone} />
      </div>

    </div>
  );
}

export function MobileMegaMenuContent({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const groups = item.megaGroups ?? [];
  const tone = item.tone ?? "green";
  const pathname = usePathname();

  return (
    <div className="flex max-h-[65vh] flex-col gap-cluster-lg overflow-y-auto px-1 pb-cluster [scrollbar-width:thin]">
      <div className="px-1">
        <MenuEyebrow item={item} tone={tone} />
      </div>
      {groups.map((group) => (
        <section className="border-b border-border pb-3 last:border-b-0" key={group.key}>
          <div className="mb-cluster-sm px-1">
            <div>
              <p className={`text-overline ${toneClasses[tone].accent}`.trim()}>{group.label}</p>
              <p className="mt-0.5 text-micro text-muted">{group.description}</p>
            </div>
          </div>
          <div className="space-y-1">
            {group.items.map((menuItem) => (
              <div className="rounded-control bg-white/70 px-2.5 py-2" key={menuItem.label}>
                    <a className="group flex min-w-0 items-start justify-between gap-cluster text-body-xs font-bold text-ink transition-colors duration-200 ease-out hover:text-pink" href={resolveLocalHref(menuItem.href, pathname)} onClick={onNavigate} {...getLinkProps(resolveLocalHref(menuItem.href, pathname))}>
                  <span className="min-w-0 break-words transition-colors duration-200 ease-out group-hover:text-pink">{menuItem.label}</span>
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
        <a className="flex min-h-12 items-center justify-between gap-cluster overflow-hidden rounded-card bg-[#071b3d] px-3.5 text-body-xs font-bold text-white" href={resolveLocalHref(item.spotlight.ctaHref, pathname)} onClick={onNavigate} {...getLinkProps(resolveLocalHref(item.spotlight.ctaHref, pathname))}>
          <span className="min-w-0 truncate whitespace-nowrap">{item.spotlight.ctaLabel}</span>
          <LinkArrow small />
        </a>
      ) : null}
    </div>
  );
}
