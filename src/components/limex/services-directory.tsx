"use client";

import { useMemo, useState } from "react";

import type { PublicService, PublicServiceCatalog } from "@/lib/service-types";
import type { ServiceLocale } from "@/lib/service-types";
import { ServiceIcon } from "./service-icons";
import type { ServiceIconName } from "./data";
import { getToneClasses } from "./styles";

function iconName(value: string) {
  return value as ServiceIconName;
}

function linkProps(href: string) {
  if (/^https?:\/\//i.test(href)) return { target: "_blank", rel: "noreferrer" };
  return {};
}

function destinationHref(service: PublicService) {
  if (service.destination.type === "CONTACT") {
    return `/?service=${encodeURIComponent(service.title)}#contact`;
  }
  return service.destination.href;
}

function childDestinationHref(child: PublicService["children"][number]) {
  if (child.href === "#contact" || child.href.startsWith("#contact-")) {
    return `/?service=${encodeURIComponent(child.label)}#contact`;
  }
  return child.href;
}

function isTopLevelService(service: PublicService) {
  return service.parentLabel == null && service.menuLinkId == null;
}

function visibleChildren(service: PublicService) {
  return service.children.filter((child) => child.isVisible).sort((left, right) => left.sortOrder - right.sortOrder);
}

function optionCount(service: PublicService) {
  return 1 + visibleChildren(service).length;
}

function ServiceCard({ service, locale }: { service: PublicService; locale: ServiceLocale }) {
  const action = service.hasDetailPage && service.destination.type === "DETAIL" ? "View service" : service.destination.label;
  const tone = getToneClasses(service.color, service.surface);
  const children = visibleChildren(service);

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[22px] bg-white/35 ring-1 ring-[#ddd8cf]/75 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:ring-[#c9c1b6]">
      <a
        className="group/card relative flex min-h-[184px] min-w-0 flex-col p-5 focus-visible:z-10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-[-3px] sm:min-h-[196px] sm:p-6"
        href={destinationHref(service)}
        {...linkProps(destinationHref(service))}
      >
        <span className="absolute right-5 top-5 text-[18px] text-[#a59d93] transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:text-accent" aria-hidden="true">↗</span>
        <span className={`grid size-10 shrink-0 place-items-center rounded-[13px] ${tone.text} ${tone.surface}`.trim()}>
          <ServiceIcon name={iconName(service.icon)} className="size-[19px]" />
        </span>
        <span className="mt-5 min-w-0 text-overline text-[#8b8278]">{service.groupLabel || service.category}</span>
        <h2 className="mt-2 line-clamp-2 min-w-0 font-brand text-card-title text-ink transition-colors group-hover/card:text-accent">{service.title}</h2>
        {service.description ? <p className="mt-2 line-clamp-2 min-w-0 text-card-copy text-muted">{service.description}</p> : null}
        <span className="mt-auto pt-5 text-button font-semibold text-ink transition-colors group-hover/card:text-accent">{locale === "bn" ? "সেবা দেখুন" : action}</span>
      </a>

      {children.length ? (
        <div className="border-t border-[#e4dfd7] px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-overline text-[#8b8278]">{locale === "bn" ? "সাব-সেবা" : "SUB-SERVICES"}</span>
            <span className="rounded-full bg-[#eeeae3] px-2 py-1 text-[10px] font-semibold text-[#756e65]">{children.length}</span>
          </div>
          <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {children.map((child) => {
              const href = childDestinationHref(child);
              return (
                <li key={child.id} className="min-w-0">
                  <a
                    className="group/child flex min-w-0 items-start justify-between gap-2 rounded-[10px] px-2 py-1.5 text-body-xs text-muted transition-colors hover:bg-[#f1eee8] hover:text-ink focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-accent/50"
                    href={href}
                    {...linkProps(href)}
                  >
                    <span className="min-w-0 break-words leading-snug">{child.label}</span>
                    <span className="shrink-0 pt-px text-[13px] text-[#a59d93] transition-transform group-hover/child:translate-x-0.5 group-hover/child:text-accent" aria-hidden="true">↗</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function ServiceDirectoryContent({ initialData, locale = "en" }: { initialData: PublicServiceCatalog; locale?: ServiceLocale }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const directoryItems = useMemo(() => initialData.items.filter(isTopLevelService), [initialData.items]);
  const totalOptionCount = useMemo(() => directoryItems.reduce((total, service) => total + optionCount(service), 0), [directoryItems]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const service of directoryItems) counts.set(service.categoryKey, (counts.get(service.categoryKey) ?? 0) + optionCount(service));
    return counts;
  }, [directoryItems]);
  const filteredItems = useMemo(() => directoryItems.filter((service) => {
    const matchesCategory = category === "all" || service.categoryKey === category;
    const matchesQuery = !normalizedQuery || `${service.title} ${service.description} ${service.category} ${service.groupLabel} ${service.children.map((child) => child.label).join(" ")}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  }), [category, directoryItems, normalizedQuery]);
  const categoryGroups = useMemo(() => initialData.categories
    .map((item) => {
      const items = filteredItems.filter((service) => service.categoryKey === item.key);
      return { item, items, optionCount: items.reduce((total, service) => total + optionCount(service), 0) };
    })
    .filter((group) => group.items.length > 0), [filteredItems, initialData.categories]);
  const filteredOptionCount = filteredItems.reduce((total, service) => total + optionCount(service), 0);

  return (
    <div className="pb-section-gap-xl">
      <header className="grid gap-6 border-b border-[#d8d3ca] pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,390px)] lg:items-end lg:gap-10 lg:pb-10">
        <div>
          <p className="text-overline text-accent">{locale === "bn" ? "LIMEX সেবা" : "LIMEX SERVICES"}</p>
          <h1 className="mt-3 max-w-[760px] font-brand text-page-title text-ink max-lg:text-page-title-mobile">{locale === "bn" ? "গুরুত্বপূর্ণ কাজের জন্য ব্যবহারিক সহায়তা।" : "Practical support for the work that matters."}</h1>
          <p className="mt-4 max-w-[650px] text-body-lg text-muted">{locale === "bn" ? "কোম্পানি গঠন থেকে ব্র্যান্ড সুরক্ষা পর্যন্ত পরিষ্কার পরবর্তী ধাপ বেছে নিয়ে আত্মবিশ্বাসের সঙ্গে এগিয়ে যান।" : "From setting up your company to protecting your brand, choose a clear next step and move forward with confidence."}</p>
        </div>
        <label className="relative block w-full lg:justify-self-end">
          <span className="sr-only">{locale === "bn" ? "সেবা খুঁজুন" : "Search services"}</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[17px] text-[#8c857c]" aria-hidden="true">⌕</span>
          <input
            className="h-12 w-full rounded-full border border-[#d4cec4] bg-white/45 pl-11 pr-4 text-body-sm text-ink outline-none transition-colors placeholder:text-[#9b948b] focus:border-accent focus:bg-white/70 focus:ring-4 focus:ring-pink/10"
            type="search"
            placeholder={locale === "bn" ? "সেবা খুঁজুন…" : "Find a service…"}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </header>

      <div className="mt-7 flex flex-wrap items-center gap-2" role="tablist" aria-label={locale === "bn" ? "সেবা ফিল্টার" : "Filter services"}>
        <button
          className={`min-h-10 rounded-full px-4 text-button font-semibold transition-colors ${category === "all" ? "bg-ink text-white" : "bg-white/45 text-muted ring-1 ring-[#d4cec4] hover:bg-white/75 hover:text-ink"}`.trim()}
          type="button"
          role="tab"
          aria-selected={category === "all"}
          onClick={() => setCategory("all")}
        >
          {locale === "bn" ? "সব সেবা" : "All services"} <span className="ml-1 text-[11px] opacity-60">{totalOptionCount}</span>
        </button>
        {initialData.categories.map((item) => (
          <button
            className={`min-h-10 rounded-full px-4 text-button font-semibold transition-colors ${category === item.key ? "bg-ink text-white" : "bg-white/45 text-muted ring-1 ring-[#d4cec4] hover:bg-white/75 hover:text-ink"}`.trim()}
            type="button"
            role="tab"
            aria-selected={category === item.key}
            key={item.key}
            onClick={() => setCategory(item.key)}
          >
            {item.label} <span className="ml-1 text-[11px] opacity-60">{categoryCounts.get(item.key) ?? item.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-body-sm text-muted" role="status">
          {filteredItems.length} {locale === "bn" ? "টি সেবা বিভাগ" : filteredItems.length === 1 ? "service family" : "service families"} · {filteredOptionCount} {locale === "bn" ? "টি সেবা অপশন" : filteredOptionCount === 1 ? "service option" : "service options"}
          {normalizedQuery ? ` ${locale === "bn" ? "মিলেছে" : "matching"} “${query.trim()}”` : locale === "bn" ? " উপলব্ধ" : " available"}
        </p>
        {category !== "all" || query ? <button className="text-button font-semibold text-accent" type="button" onClick={() => { setCategory("all"); setQuery(""); }}>{locale === "bn" ? "ফিল্টার মুছুন" : "Clear filters"}</button> : null}
      </div>

      {categoryGroups.length ? (
        <div className="mt-10 space-y-12">
          {categoryGroups.map(({ item, items, optionCount: groupOptionCount }) => (
            <section key={item.key} aria-labelledby={`services-category-${item.key}`}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#ded9d0] pb-3">
                <h2 id={`services-category-${item.key}`} className="font-brand text-subheading text-ink">{item.label}</h2>
                <span className="text-body-xs text-muted">{groupOptionCount} {locale === "bn" ? "টি অপশন" : groupOptionCount === 1 ? "option" : "options"}</span>
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((service) => <ServiceCard key={service.id} service={service} locale={locale} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[22px] bg-white/35 px-6 py-12 text-center ring-1 ring-[#ddd8cf]/75">
          <p className="font-brand text-subheading text-ink">{locale === "bn" ? "কোনো মিল পাওয়া যায়নি" : "No matching services"}</p>
          <p className="mt-2 text-body-sm text-muted">{locale === "bn" ? "অন্য শব্দ দিয়ে খুঁজুন অথবা সব সেবা দেখতে ফিল্টার মুছে দিন।" : "Try another phrase or clear the filters to see the full catalogue."}</p>
        </div>
      )}
    </div>
  );
}
