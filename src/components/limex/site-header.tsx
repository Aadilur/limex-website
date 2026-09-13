"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { navigation, type NavItem } from "./data";
import { MegaMenuPanel, MobileMegaMenuContent } from "./mega-menu";
import { LogoLockup } from "./ui";
import { getPublicMenu } from "@/lib/menu-api";
import { getGeneratedService, hydrateServiceNavigation } from "@/lib/service-content";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function resolveLocalHref(href: string, pathname: string) {
  if (!href.startsWith("#") || pathname === "/") return href;
  return `/${href}`;
}

function hasMegaMenu(item: NavItem) {
  return Boolean(item.megaGroups?.some((group) => group.items?.length));
}

function DesktopNavTrigger({
  item,
  isActive,
  isOpen,
  onToggle,
}: {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const menuId = `mega-menu-${slugify(item.label)}`;

  return (
    <div className="relative">
      <button
        className={`group relative inline-flex h-control items-center gap-cluster-xs rounded-control border-0 bg-transparent px-2 py-1 text-nav-compact whitespace-nowrap transition-colors duration-200 ease-out hover:text-pink xl:text-nav-medium wide:text-nav ${
          isActive ? "bg-pink/10 font-bold text-[#0055ff]" : "text-ink"
        }`.trim()}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={onToggle}
      >
        <span>{item.label}</span>
        <img className="size-3 transition-transform duration-200 ease-out group-hover:translate-x-0.5" src={`/figma/${isActive ? "nav-chevron-active" : "nav-chevron"}.svg`} alt="" aria-hidden="true" />
        {isActive ? <span className="absolute bottom-px left-2 h-0.5 w-5 bg-pink" aria-hidden="true" /> : null}
      </button>
    </div>
  );
}

function MobileNavGroup({ item, onNavigate, isActive }: { item: NavItem; onNavigate: () => void; isActive: boolean }) {
  const [open, setOpen] = useState(isActive);
  const childrenId = `mobile-menu-${slugify(item.label)}`;

  return (
    <div>
      <button
        className={`flex min-h-nav-row w-full items-center justify-between gap-nav rounded-control border-0 border-b border-border px-0.5 text-left text-mobile-nav transition-colors duration-200 ease-out hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${isActive ? "bg-pink/10 font-bold text-[#0055ff]" : "bg-transparent text-ink"}`.trim()}
        type="button"
        aria-expanded={open}
        aria-controls={childrenId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{item.label}</span>
        <span className={`text-icon font-normal text-pink transition-transform duration-200 ${open ? "rotate-45" : ""}`.trim()} aria-hidden="true">
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-[70vh]" : "max-h-0"}`.trim()}
        id={childrenId}
      >
        {open ? <MobileMegaMenuContent item={item} onNavigate={onNavigate} /> : null}
      </div>
    </div>
  );
}

export function SiteHeader({ fullBleed = false }: { fullBleed?: boolean }) {
  const pathname = usePathname();
  const navigationLocale = pathname.startsWith("/bn/") ? "bn" as const : "en" as const;
  const [menuNavigation, setMenuNavigation] = useState<NavItem[]>(() => hydrateServiceNavigation(navigation, navigationLocale));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    void getPublicMenu()
      .then((managedItems) => {
        if (cancelled) return;

        const managedByKey = new Map(managedItems.map((item) => [item.key ?? slugify(item.label), item]));
        const staticManagedKeys = new Set(navigation.filter(hasMegaMenu).map((item) => slugify(item.label)));
        const mergedNavigation = navigation.flatMap((item) => {
          if (!hasMegaMenu(item)) return [item];

          const managedItem = managedByKey.get(slugify(item.label));
          return managedItem ? [managedItem] : [];
        });
        const newManagedItems = managedItems.filter((item) => !staticManagedKeys.has(item.key ?? slugify(item.label)));
        setMenuNavigation([...mergedNavigation.filter((item) => item.label === "Home"), ...mergedNavigation.filter(hasMegaMenu), ...newManagedItems, ...mergedNavigation.filter((item) => !hasMegaMenu(item) && item.label !== "Home")]);
      })
      .catch(() => {
        // Keep the bundled navigation available when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [navigationLocale]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenMenu(null);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("overflow-hidden");
    };
  }, [mobileOpen]);

  useEffect(() => {
    const revealAtTop = 16;
    const directionThreshold = 6;

    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const previousScrollY = lastScrollYRef.current;

      if (currentScrollY <= revealAtTop) {
        setIsHidden(false);
      } else if (currentScrollY > previousScrollY + directionThreshold) {
        setIsHidden(true);
        setOpenMenu(null);
      } else if (currentScrollY < previousScrollY - directionThreshold) {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = Math.max(window.scrollY, 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileOpen(false);
  const openMenuItem = menuNavigation.find((item) => item.label === openMenu && hasMegaMenu(item));
  const serviceSlug = pathname.match(/^\/(?:bn\/)?services\/([^/]+)/)?.[1];
  const generatedService = serviceSlug ? getGeneratedService(serviceSlug) : null;
  const activeNavLabel = pathname === "/"
    ? "Home"
    : pathname === "/about" || pathname.startsWith("/about/")
      ? "About us"
      : pathname.startsWith("/blog") || pathname.startsWith("/bn/blog")
        ? "Blog"
        : pathname.startsWith("/trademark-classes")
          ? "IP & Trademark"
          : generatedService?.sectionLabel ?? (pathname.startsWith("/services/trademark") || pathname.startsWith("/bn/services/trademark")
            ? "IP & Trademark"
            : pathname.startsWith("/services") || pathname.startsWith("/bn/services")
              ? "Startup & Licensing"
              : pathname.startsWith("/business-tools")
                ? "Business Tools"
                : menuNavigation.find((item) => item.active)?.label);
  const homeHref = pathname === "/" ? "#top" : "/";
  const contactHref = resolveLocalHref("#contact", pathname);
  const navMotionClassName = `transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isHidden && !mobileOpen ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`.trim();

  return (
    <header
      className={`sticky top-0 z-40 min-h-[60px] lg:min-h-[68px] ${fullBleed ? "-mx-page-gutter lg:-mx-page-gutter-lg" : ""}`.trim()}
      ref={headerRef}
    >
      <div
        className={`relative mx-mobile-gutter hidden min-h-[60px] items-center gap-cluster-sm rounded-nav border border-[rgba(224,222,227,0.86)] bg-page px-cluster py-cluster wide:mx-page-gutter-lg wide:flex wide:min-h-[68px] wide:gap-cluster-xl wide:px-5 ${navMotionClassName}`.trim()}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenMenu(null);
        }}
      >
        <LogoLockup href={homeHref} className="w-[112px] min-w-[112px] xl:w-[132px] xl:min-w-[132px] wide:w-[150px] wide:min-w-[150px]" />
        <nav className="min-w-0 flex flex-1 items-center gap-0.5 xl:gap-1 wide:gap-3.5" aria-label="Primary navigation">
          {menuNavigation.map((item) =>
            hasMegaMenu(item) ? (
              <DesktopNavTrigger
                key={item.label}
                item={item}
                isActive={item.label === activeNavLabel}
                isOpen={openMenu === item.label}
                onToggle={() => setOpenMenu((current) => (current === item.label ? null : item.label))}
              />
            ) : (
              <a
                key={item.label}
                className={`group relative inline-flex h-control items-center rounded-control px-2 py-1 text-nav-compact whitespace-nowrap transition-colors duration-200 ease-out hover:text-pink xl:text-nav-medium wide:text-nav ${item.label === activeNavLabel ? "bg-pink/10 font-bold text-[#0055ff]" : "text-ink"}`.trim()}
                href={resolveLocalHref(item.href, pathname)}
                onClick={() => setOpenMenu(null)}
                aria-current={item.label === activeNavLabel ? "page" : undefined}
              >
                <span>{item.label}</span>
                <span className={`absolute bottom-px h-0.5 bg-pink transition-colors ${item.label === activeNavLabel ? "left-2 w-5" : "left-2 right-2 bg-transparent group-hover:bg-pink/50"}`.trim()} aria-hidden="true" />
              </a>
            ),
          )}
        </nav>
        {openMenuItem ? (
          <>
            <MegaMenuPanel
              key={openMenuItem.label}
              item={openMenuItem}
              onNavigate={() => {
                setOpenMenu(null);
                closeMobileMenu();
              }}
            />
          </>
        ) : null}
        <a className="group inline-flex h-11 w-[136px] min-w-[136px] items-center gap-cluster-xs rounded-pill border border-brand-blue bg-brand-blue px-1.5 text-button font-bold text-white transition-all duration-200 hover:-translate-y-px hover:border-brand-deep hover:bg-brand-deep hover:shadow-[0_8px_18px_rgba(0,85,255,0.2)] wide:gap-cluster-sm wide:px-1.5" href={contactHref}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 transition-colors duration-200 group-hover:bg-white/20">
            <img className="size-5" src="/figma/whatsapp-dot.svg" alt="" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 whitespace-nowrap text-left">Contact us</span>
          <span className="mr-1 text-icon-action transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">↗</span>
        </a>
      </div>

      <div className={`relative mx-mobile-gutter flex min-h-[60px] items-center justify-between rounded-nav border border-[rgba(224,222,227,0.86)] bg-page px-4 py-cluster wide:hidden ${navMotionClassName}`.trim()}>
        <LogoLockup href={homeHref} className="w-[112px] min-w-[112px] sm:w-[120px] sm:min-w-[120px]" />
        <button
          className="relative grid size-[42px] place-items-center rounded-full border-0 bg-brand-blue text-white transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((current) => !current)}
        >
          <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          <span className="relative h-3.5 w-[17px]" aria-hidden="true">
            <span className={`absolute left-0 right-0 top-[3px] h-0.5 rounded-full bg-current transition-[top,transform] duration-200 ${mobileOpen ? "top-1/2 rotate-45" : ""}`.trim()} />
            <span className={`absolute left-0 right-0 top-[10px] h-0.5 rounded-full bg-current transition-[top,transform] duration-200 ${mobileOpen ? "top-1/2 -rotate-45" : ""}`.trim()} />
          </span>
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 block wide:hidden" id="mobile-navigation">
          <button className="absolute inset-0 h-full w-full border-0 bg-[rgba(18,20,33,0.44)]" type="button" aria-label="Close menu" onClick={closeMobileMenu} />
          <aside className="absolute bottom-cluster-sm right-cluster-sm top-cluster-sm flex w-[min(390px,calc(100%-24px))] flex-col overflow-y-auto rounded-drawer bg-paper p-drawer-pad shadow-drawer animate-menu-in" aria-label="Mobile navigation">
            <div className="flex items-center justify-between border-b border-border pb-cluster text-label uppercase text-muted">
              <span>Navigate</span>
              <button className="grid size-[34px] place-items-center rounded-full border-0 bg-[#071b3d] text-icon-lg text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2" type="button" onClick={closeMobileMenu} aria-label="Close menu">
                ×
              </button>
            </div>
            <nav className="flex flex-col py-cluster-xs">
              {menuNavigation.map((item) =>
                hasMegaMenu(item) ? (
                  <MobileNavGroup key={item.label} item={item} isActive={item.label === activeNavLabel} onNavigate={closeMobileMenu} />
                ) : (
                  <a
                    key={item.label}
                    className={`flex min-h-nav-row items-center justify-between gap-nav rounded-control border-b border-border px-0.5 text-mobile-nav transition-colors duration-200 ease-out hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${item.label === activeNavLabel ? "bg-pink/10 font-bold text-[#0055ff]" : "text-ink"}`.trim()}
                    href={resolveLocalHref(item.href, pathname)}
                    onClick={closeMobileMenu}
                    aria-current={item.label === activeNavLabel ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <span className="text-pink" aria-hidden="true">↗</span>
                  </a>
                ),
              )}
            </nav>
            <a className="mt-auto flex min-h-12 items-center gap-cluster-sm rounded-pill bg-[#071b3d] px-3.5 text-body-xs font-bold text-white transition-transform hover:-translate-y-px" href={contactHref} onClick={closeMobileMenu}>
              <img className="size-5" src="/figma/whatsapp-dot.svg" alt="" aria-hidden="true" />
              <span className="flex-1">Contact us</span>
              <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
