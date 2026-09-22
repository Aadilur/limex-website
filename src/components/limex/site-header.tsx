"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation, type NavItem } from "./data";
import { MegaMenuPanel, MobileMegaMenuContent } from "./mega-menu";
import { LogoLockup } from "./ui";
import { getPublicMenu } from "@/lib/menu-api";
import {
  getPublishedTemplates,
  type DocumentTemplateSummary,
} from "@/lib/template-api";
import {
  getGeneratedService,
  hydrateServiceNavigation,
} from "@/lib/service-content";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function resolveLocalHref(href: string, pathname: string) {
  if (!href.startsWith("#") || pathname === "/") return href;
  return `/${href}`;
}

function normalizedPath(value: string) {
  const path = value.trim().split(/[?#]/, 1)[0] ?? "";
  if (!path.startsWith("/")) return null;
  const withoutTrailingSlash = path.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
}

function pathMatchesHref(href: string, pathname: string) {
  const targetPath = normalizedPath(href);
  const currentPath = normalizedPath(pathname);
  if (!targetPath || !currentPath) return false;
  return (
    targetPath === currentPath ||
    (targetPath !== "/" && currentPath.startsWith(`${targetPath}/`))
  );
}

function findSectionForPath(items: NavItem[], pathname: string) {
  for (const section of items) {
    if (!hasMegaMenu(section)) continue;

    if (pathMatchesHref(section.href, pathname)) return section.label;

    for (const group of section.megaGroups ?? []) {
      for (const item of group.items) {
        if (pathMatchesHref(item.href, pathname)) return section.label;
        if (
          item.children?.some((child) =>
            pathMatchesHref(child.href, pathname),
          )
        ) {
          return section.label;
        }
      }
    }
  }

  return null;
}

function findSectionForServiceSlug(
  items: NavItem[],
  serviceSlug: string | undefined,
) {
  const normalizedSlug = serviceSlug?.toLowerCase();
  if (!normalizedSlug) return null;

  return (
    items.find((section) => {
      if (!hasMegaMenu(section)) return false;
      const sectionKey = (section.key ?? slugify(section.label)).toLowerCase();
      return (
        normalizedSlug === sectionKey ||
        normalizedSlug.startsWith(`${sectionKey}-`)
      );
    })?.label ?? null
  );
}

function hasMegaMenu(item: NavItem) {
  return Boolean(item.megaGroups?.some((group) => group.items?.length));
}

function attachPublishedTemplateLinks(
  items: NavItem[],
  templates: DocumentTemplateSummary[],
) {
  const children = templates.map((template) => ({
    label: template.title,
    href: `/business-tools/templates/${template.slug}`,
  }));
  return items.map((item) => {
    if (item.label !== "Business Tools" || !item.megaGroups) return item;
    return {
      ...item,
      megaGroups: item.megaGroups.flatMap((group) => {
        if (group.key !== "agreement-builders") return [group];
        const items = group.items
          .map((menuItem) =>
            menuItem.label !== "Business Agreement Builder"
              ? menuItem
              : { ...menuItem, children },
          )
          .filter(
            (menuItem) =>
              menuItem.label !== "Business Agreement Builder" ||
              children.length > 0,
          );
        return items.length ? [{ ...group, items }] : [];
      }),
    };
  });
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
        className={`group relative inline-flex h-control items-center gap-cluster-xs rounded-control border-0 bg-transparent px-1.5 py-1 text-nav-compact whitespace-nowrap transition-colors duration-200 ease-out hover:text-pink xl:px-2 xl:text-nav-medium ${
          isActive ? "bg-pink/10 font-bold text-[#0055ff]" : "text-ink"
        }`.trim()}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={onToggle}
      >
        <span>{item.label}</span>
        <img
          className="size-3 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          src={`/figma/${isActive ? "nav-chevron-active" : "nav-chevron"}.svg`}
          alt=""
          aria-hidden="true"
        />
        {isActive ? (
          <span
            className="absolute bottom-px left-2 h-0.5 w-5 bg-pink"
            aria-hidden="true"
          />
        ) : null}
      </button>
    </div>
  );
}

function MobileNavGroup({
  item,
  onNavigate,
  isActive,
}: {
  item: NavItem;
  onNavigate: () => void;
  isActive: boolean;
}) {
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
        <span
          className={`text-icon font-normal text-pink transition-transform duration-200 ${open ? "rotate-45" : ""}`.trim()}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-[70vh]" : "max-h-0"}`.trim()}
        id={childrenId}
      >
        {open ? (
          <MobileMegaMenuContent item={item} onNavigate={onNavigate} />
        ) : null}
      </div>
    </div>
  );
}

export function SiteHeader({ fullBleed = false }: { fullBleed?: boolean }) {
  const pathname = usePathname();
  const navigationLocale = pathname.startsWith("/bn/")
    ? ("bn" as const)
    : ("en" as const);
  const [menuNavigation, setMenuNavigation] = useState<NavItem[]>(() =>
    hydrateServiceNavigation(navigation, navigationLocale),
  );
  const [publishedTemplates, setPublishedTemplates] = useState<
    DocumentTemplateSummary[]
  >([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let templatesForMenu: DocumentTemplateSummary[] = [];

    void getPublishedTemplates()
      .then((templates) => {
        if (cancelled) return;
        templatesForMenu = templates;
        setPublishedTemplates(templates);
        setMenuNavigation((current) =>
          attachPublishedTemplateLinks(current, templates),
        );
      })
      .catch(() => {
        // A menu without document-builder links is safer than showing stale templates.
        if (!cancelled)
          setMenuNavigation((current) =>
            attachPublishedTemplateLinks(current, []),
          );
      });

    void getPublicMenu()
      .then((managedItems) => {
        if (cancelled) return;

        const managedByKey = new Map(
          managedItems.map((item) => [item.key ?? slugify(item.label), item]),
        );
        const managedByLabel = new Map(
          managedItems.map((item) => [slugify(item.label), item]),
        );
        const staticManagedKeys = new Set(
          navigation
            .filter(hasMegaMenu)
            .map((item) => item.key ?? slugify(item.label)),
        );
        const mergedNavigation = navigation.flatMap((item) => {
          if (!hasMegaMenu(item)) return [item];

          const managedItem =
            managedByKey.get(item.key ?? slugify(item.label)) ??
            managedByLabel.get(slugify(item.label));
          return managedItem ? [managedItem] : [];
        });
        const newManagedItems = managedItems.filter(
          (item) =>
            !staticManagedKeys.has(item.key ?? slugify(item.label)) &&
            !navigation.some(
              (staticItem) =>
                hasMegaMenu(staticItem) &&
                slugify(staticItem.label) === slugify(item.label),
            ),
        );
        const nextNavigation = [
          ...mergedNavigation.filter((item) => item.label === "Home"),
          ...mergedNavigation.filter(hasMegaMenu),
          ...newManagedItems,
          ...mergedNavigation.filter(
            (item) => !hasMegaMenu(item) && item.label !== "Home",
          ),
        ];
        setMenuNavigation(
          attachPublishedTemplateLinks(nextNavigation, templatesForMenu),
        );
      })
      .catch(() => {
        // Keep the bundled navigation available when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [navigationLocale]);

  useEffect(() => {
    setMenuNavigation((current) =>
      attachPublishedTemplateLinks(current, publishedTemplates),
    );
  }, [publishedTemplates]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      )
        setOpenMenu(null);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
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
  const menuIdentity = (item: NavItem) => item.key ?? slugify(item.label);
  const openMenuItem = menuNavigation.find(
    (item) => menuIdentity(item) === openMenu && hasMegaMenu(item),
  );
  const serviceSlug = pathname.match(/^\/(?:bn\/)?services\/([^/]+)/)?.[1];
  const generatedService = serviceSlug
    ? getGeneratedService(serviceSlug)
    : null;
  const menuSectionForPath = findSectionForPath(menuNavigation, pathname);
  const menuSectionForServiceSlug = findSectionForServiceSlug(
    menuNavigation,
    serviceSlug,
  );
  const activeNavLabel =
    pathname === "/"
      ? "Home"
      : pathname === "/about" || pathname.startsWith("/about/")
        ? "About us"
        : pathname.startsWith("/blog") || pathname.startsWith("/bn/blog")
          ? "Blog"
          : pathname.startsWith("/trademark-classes")
            ? "IP & Trademark"
            : (menuSectionForPath ??
              menuSectionForServiceSlug ??
              generatedService?.sectionLabel ??
              (pathname.startsWith("/services/trademark") ||
              pathname.startsWith("/bn/services/trademark")
                ? "IP & Trademark"
                : pathname.startsWith("/services") ||
                    pathname.startsWith("/bn/services")
                  ? "Startup & Licensing"
                  : pathname.startsWith("/business-tools")
                    ? "Business Tools"
                    : menuNavigation.find((item) => item.active)?.label));
  const homeHref = pathname === "/" ? "#top" : "/";
  const contactHref = resolveLocalHref("#contact", pathname);
  const navMotionClassName =
    `transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isHidden && !mobileOpen ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`.trim();

  return (
    <header
      className={`sticky top-0 z-40 min-h-[60px] lg:min-h-[68px] ${fullBleed ? "-mx-page-gutter lg:-mx-page-gutter-lg" : ""}`.trim()}
      ref={headerRef}
    >
      <div
        className={`relative mx-mobile-gutter hidden min-h-[60px] grid-cols-[90px_minmax(0,1fr)_90px] items-center rounded-nav border border-[rgba(224,222,227,0.86)] bg-page px-cluster py-cluster nav:mx-mobile-gutter nav:grid nav:min-h-[68px] nav:grid-cols-[76px_minmax(0,1fr)_76px] nav:gap-x-cluster nav:px-3 xl:grid-cols-[90px_minmax(0,1fr)_90px] xl:gap-x-cluster-xl xl:px-5 ${navMotionClassName}`.trim()}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setOpenMenu(null);
        }}
      >
        <LogoLockup
          href={homeHref}
          className="w-[68px] min-w-[68px] nav:w-[76px] nav:min-w-[76px] xl:w-[80px] xl:min-w-[80px]"
        />
        <nav
          className="min-w-0 flex items-center justify-center gap-0.5 nav:gap-1 xl:gap-1"
          aria-label="Primary navigation"
        >
          {menuNavigation.map((item) =>
            hasMegaMenu(item) ? (
              <DesktopNavTrigger
                key={menuIdentity(item)}
                item={item}
                isActive={item.label === activeNavLabel}
                isOpen={openMenu === menuIdentity(item)}
                onToggle={() =>
                  setOpenMenu((current) =>
                    current === menuIdentity(item) ? null : menuIdentity(item),
                  )
                }
              />
            ) : (
              (() => {
                const href = resolveLocalHref(item.href, pathname);
                const isInternal =
                  href.startsWith("/") && !href.startsWith("//");
                const linkClasses =
                  `group relative inline-flex h-control items-center rounded-control px-1.5 py-1 text-nav-compact whitespace-nowrap transition-colors duration-200 ease-out hover:text-pink xl:px-2 xl:text-nav-medium ${item.label === activeNavLabel ? "bg-pink/10 font-bold text-[#0055ff]" : "text-ink"}`.trim();
                const linkContent = (
                  <>
                    <span>{item.label}</span>
                    <span
                      className={`absolute bottom-px h-0.5 bg-pink transition-colors ${item.label === activeNavLabel ? "left-2 w-5" : "left-2 right-2 bg-transparent group-hover:bg-pink/50"}`.trim()}
                      aria-hidden="true"
                    />
                  </>
                );

                return isInternal ? (
                  <Link
                    key={item.label}
                    className={linkClasses}
                    href={href}
                    onClick={() => setOpenMenu(null)}
                    aria-current={
                      item.label === activeNavLabel ? "page" : undefined
                    }
                  >
                    {linkContent}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    className={linkClasses}
                    href={href}
                    onClick={() => setOpenMenu(null)}
                    aria-current={
                      item.label === activeNavLabel ? "page" : undefined
                    }
                  >
                    {linkContent}
                  </a>
                );
              })()
            ),
          )}
        </nav>
        {openMenuItem ? (
          <>
            <MegaMenuPanel
              key={menuIdentity(openMenuItem)}
              item={openMenuItem}
              onNavigate={() => {
                setOpenMenu(null);
                closeMobileMenu();
              }}
            />
          </>
        ) : null}
        <a
          className="group inline-flex h-10 w-[76px] items-center justify-center rounded-pill border border-brand-blue bg-brand-blue px-2 text-button font-bold text-white transition-all duration-200 hover:-translate-y-px hover:border-brand-deep hover:bg-brand-deep hover:shadow-[0_8px_18px_rgba(0,85,255,0.2)] xl:w-[90px] xl:px-4"
          href={contactHref}
        >
          <span>Contact</span>
        </a>
      </div>

      <div
        className={`relative mx-mobile-gutter flex min-h-[60px] items-center justify-between rounded-nav border border-[rgba(224,222,227,0.86)] bg-page px-4 py-cluster nav:hidden ${navMotionClassName}`.trim()}
      >
        <LogoLockup
          href={homeHref}
          className="w-[68px] min-w-[68px] sm:w-[72px] sm:min-w-[72px]"
        />
        <button
          className="relative grid size-[42px] place-items-center rounded-full border-0 bg-brand-blue text-white transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((current) => !current)}
        >
          <span className="sr-only">
            {mobileOpen ? "Close menu" : "Open menu"}
          </span>
          <span className="relative h-3.5 w-[17px]" aria-hidden="true">
            <span
              className={`absolute left-0 right-0 top-[3px] h-0.5 rounded-full bg-current transition-[top,transform] duration-200 ${mobileOpen ? "top-1/2 rotate-45" : ""}`.trim()}
            />
            <span
              className={`absolute left-0 right-0 top-[10px] h-0.5 rounded-full bg-current transition-[top,transform] duration-200 ${mobileOpen ? "top-1/2 -rotate-45" : ""}`.trim()}
            />
          </span>
        </button>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 block nav:hidden"
          id="mobile-navigation"
        >
          <button
            className="absolute inset-0 h-full w-full border-0 bg-[rgba(18,20,33,0.44)]"
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          />
          <aside
            className="absolute bottom-cluster-sm right-cluster-sm top-cluster-sm flex w-[min(390px,calc(100%-24px))] flex-col overflow-y-auto rounded-drawer bg-paper p-drawer-pad shadow-drawer animate-menu-in"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b border-border pb-cluster text-label uppercase text-muted">
              <span>Navigate</span>
              <button
                className="grid size-[34px] place-items-center rounded-full border-0 bg-[#071b3d] text-icon-lg text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2"
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col py-cluster-xs">
              {menuNavigation.map((item) =>
                hasMegaMenu(item) ? (
                  <MobileNavGroup
                    key={item.label}
                    item={item}
                    isActive={item.label === activeNavLabel}
                    onNavigate={closeMobileMenu}
                  />
                ) : (
                  (() => {
                    const href = resolveLocalHref(item.href, pathname);
                    const isInternal =
                      href.startsWith("/") && !href.startsWith("//");
                    const linkClasses =
                      `flex min-h-nav-row items-center justify-between gap-nav rounded-control border-b border-border px-0.5 text-mobile-nav transition-colors duration-200 ease-out hover:text-pink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${item.label === activeNavLabel ? "bg-pink/10 font-bold text-[#0055ff]" : "text-ink"}`.trim();
                    const linkContent = (
                      <>
                        <span>{item.label}</span>
                        <span className="text-pink" aria-hidden="true">
                          ↗
                        </span>
                      </>
                    );

                    return isInternal ? (
                      <Link
                        key={item.label}
                        className={linkClasses}
                        href={href}
                        onClick={closeMobileMenu}
                        aria-current={
                          item.label === activeNavLabel ? "page" : undefined
                        }
                      >
                        {linkContent}
                      </Link>
                    ) : (
                      <a
                        key={item.label}
                        className={linkClasses}
                        href={href}
                        onClick={closeMobileMenu}
                        aria-current={
                          item.label === activeNavLabel ? "page" : undefined
                        }
                      >
                        {linkContent}
                      </a>
                    );
                  })()
                ),
              )}
            </nav>
            <a
              className="mt-auto flex min-h-12 items-center justify-center rounded-pill bg-[#071b3d] px-3.5 text-body-xs font-bold text-white transition-transform hover:-translate-y-px"
              href={contactHref}
              onClick={closeMobileMenu}
            >
              <span>Contact</span>
            </a>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
