"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { navigation, type NavItem } from "./data";
import { MegaMenuPanel, MobileMegaMenuContent } from "./mega-menu";
import { LogoLockup } from "./ui";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function resolveLocalHref(href: string, pathname: string) {
  if (!href.startsWith("#") || pathname === "/") return href;
  return `/${href}`;
}

function DesktopNavTrigger({
  item,
  isActive,
  isOpen,
  onToggle,
  onOpen,
}: {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const menuId = `mega-menu-${slugify(item.label)}`;

  return (
    <div className="relative" onMouseEnter={onOpen}>
      <button
        className={`relative inline-flex h-control items-center gap-cluster-xs rounded-control border-0 bg-transparent px-2 py-1 text-nav-compact text-ink whitespace-nowrap transition-colors duration-150 hover:bg-pink/10 hover:text-ink xl:text-nav-medium wide:text-nav ${
          isActive ? "bg-pink/10 font-bold text-[#de4d73]" : ""
        }`.trim()}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(event) => {
          if (event.detail === 0) onToggle();
          else onOpen();
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) onOpen();
        }}
      >
        <span>{item.label}</span>
        <img className="size-3" src={`/figma/${isActive ? "nav-chevron-active" : "nav-chevron"}.svg`} alt="" aria-hidden="true" />
        {isActive ? <span className="absolute bottom-px left-2 h-0.5 w-5 bg-pink" aria-hidden="true" /> : null}
      </button>
    </div>
  );
}

function MobileNavGroup({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const childrenId = `mobile-menu-${slugify(item.label)}`;

  return (
    <div>
      <button
        className="flex min-h-nav-row w-full items-center justify-between gap-nav border-0 border-b border-border bg-transparent px-0.5 text-left text-mobile-nav text-ink transition-colors hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
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

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

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

  const closeMobileMenu = () => setMobileOpen(false);
  const openMenuItem = navigation.find((item) => item.label === openMenu && item.megaGroups);
  const activeNavLabel = pathname === "/about"
    ? "About us"
    : pathname.startsWith("/blog")
      ? "Blog"
    : pathname.startsWith("/trademark-classes")
      ? "IP & Trademark"
    : pathname.startsWith("/services/trademark")
      ? "IP & Trademark"
      : pathname.startsWith("/services")
        ? "Startup & Licensing"
      : pathname.startsWith("/business-tools")
        ? "Business Tools"
      : navigation.find((item) => item.active)?.label;
  const homeHref = pathname === "/" ? "#top" : "/";
  const contactHref = resolveLocalHref("#contact", pathname);

  return (
    <header className="relative z-20" ref={headerRef}>
      <div
        className="absolute left-page-gutter-lg right-page-gutter-lg top-nav-top hidden min-h-nav-shell items-center gap-cluster-sm rounded-nav border border-[rgba(224,222,227,0.86)] bg-paper/80 px-cluster py-cluster shadow-nav backdrop-blur-[14px] lg:flex xl:gap-cluster-lg xl:px-4 wide:gap-cluster-xl wide:px-5"
        onMouseLeave={() => setOpenMenu(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenMenu(null);
        }}
      >
        <LogoLockup href={homeHref} className="w-[130px] min-w-[130px] xl:w-[155px] xl:min-w-[155px] wide:w-[178px] wide:min-w-[178px]" />
        <nav className="min-w-0 flex flex-1 items-center gap-0.5 xl:gap-1 wide:gap-3.5" aria-label="Primary navigation">
          {navigation.map((item) =>
            item.megaGroups ? (
              <DesktopNavTrigger
                key={item.label}
                item={item}
                isActive={item.label === activeNavLabel}
                isOpen={openMenu === item.label}
                onToggle={() => setOpenMenu((current) => (current === item.label ? null : item.label))}
                onOpen={() => setOpenMenu(item.label)}
              />
            ) : (
              <a
                key={item.label}
            className={`group relative inline-flex h-control items-center rounded-control px-2 py-1 text-nav-compact whitespace-nowrap transition-colors duration-150 hover:bg-pink/10 xl:text-nav-medium wide:text-nav ${item.label === activeNavLabel ? "bg-pink/10 font-bold text-[#de4d73]" : "text-ink"}`.trim()}
                href={resolveLocalHref(item.href, pathname)}
                onClick={() => setOpenMenu(null)}
              >
                <span>{item.label}</span>
                <span className={`absolute bottom-px h-0.5 bg-pink transition-colors ${item.label === activeNavLabel ? "left-2 w-5" : "left-2 right-2 bg-transparent group-hover:bg-pink/50"}`.trim()} aria-hidden="true" />
              </a>
            ),
          )}
        </nav>
        {openMenuItem ? (
          <>
            <span className="pointer-events-auto absolute left-0 right-0 top-full h-[14px]" aria-hidden="true" />
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
        <a className="inline-flex h-control w-[100px] min-w-[100px] items-center gap-cluster-xs rounded-pill bg-[#14131c] px-cluster-sm text-nav-medium font-bold text-[#fcfbfa] transition-all duration-200 hover:-translate-y-px hover:shadow-button-dark xl:w-[112px] xl:min-w-[112px] xl:px-2.5 wide:w-[126px] wide:min-w-[126px] wide:gap-cluster-sm wide:px-cluster wide:text-nav-medium" href={contactHref}>
          <img className="size-5" src="/figma/whatsapp-dot.svg" alt="" aria-hidden="true" />
          <span>Contact us</span>
        </a>
      </div>

      <div className="absolute left-mobile-gutter right-mobile-gutter top-nav-top-mobile flex min-h-nav-mobile-shell items-center justify-between rounded-nav border border-[rgba(224,222,227,0.86)] bg-paper/85 px-4 py-cluster shadow-nav backdrop-blur-[14px] lg:hidden">
        <LogoLockup href={homeHref} className="w-auto min-w-0" />
        <button
          className="relative grid size-[42px] place-items-center rounded-full border-0 bg-[#14131c] text-white transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
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
        <div className="fixed inset-0 z-50 block lg:hidden" id="mobile-navigation">
          <button className="absolute inset-0 h-full w-full border-0 bg-[rgba(18,20,33,0.44)]" type="button" aria-label="Close menu" onClick={closeMobileMenu} />
          <aside className="absolute bottom-cluster-sm right-cluster-sm top-cluster-sm flex w-[min(390px,calc(100%-24px))] flex-col overflow-y-auto rounded-drawer bg-paper p-drawer-pad shadow-drawer animate-menu-in" aria-label="Mobile navigation">
            <div className="flex items-center justify-between border-b border-border pb-cluster text-label uppercase text-muted">
              <span>Navigate</span>
              <button className="grid size-[34px] place-items-center rounded-full border-0 bg-[#14131c] text-icon-lg text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2" type="button" onClick={closeMobileMenu} aria-label="Close menu">
                ×
              </button>
            </div>
            <nav className="flex flex-col py-cluster-xs">
              {navigation.map((item) =>
                item.megaGroups ? (
                  <MobileNavGroup key={item.label} item={item} onNavigate={closeMobileMenu} />
                ) : (
                  <a
                    key={item.label}
                    className="flex min-h-nav-row items-center justify-between gap-nav border-b border-border px-0.5 text-mobile-nav text-ink transition-colors hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
                    href={resolveLocalHref(item.href, pathname)}
                    onClick={closeMobileMenu}
                  >
                    <span>{item.label}</span>
                    <span className="text-pink" aria-hidden="true">↗</span>
                  </a>
                ),
              )}
            </nav>
            <a className="mt-auto flex min-h-12 items-center gap-cluster-sm rounded-pill bg-[#14131c] px-3.5 text-body-xs font-bold text-white transition-transform hover:-translate-y-px" href={contactHref} onClick={closeMobileMenu}>
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
