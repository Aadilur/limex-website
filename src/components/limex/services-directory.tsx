"use client";

import { useMemo, useState } from "react";

import type { PublicService, PublicServiceCatalog } from "@/lib/service-types";
import { ServiceIcon } from "./service-icons";
import type { ServiceIconName } from "./data";
import { getToneClasses } from "./styles";

function iconName(value: string) {
  return value as ServiceIconName;
}

function linkProps(service: PublicService) {
  if (service.destination.isExternal) return { target: "_blank", rel: "noreferrer" };
  return {};
}

function destinationHref(service: PublicService) {
  if (service.destination.type === "CONTACT") {
    return `/?service=${encodeURIComponent(service.title)}#contact`;
  }
  return service.destination.href;
}

function ServiceCard({ service }: { service: PublicService }) {
  const action = service.hasDetailPage && service.destination.type === "DETAIL" ? "View service" : service.destination.label;
  const tone = getToneClasses(service.color, service.surface);

  return (
    <a
      className="group relative flex min-h-[184px] min-w-0 flex-col overflow-hidden rounded-[22px] bg-white/35 p-5 ring-1 ring-[#ddd8cf]/75 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:ring-[#c9c1b6] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 sm:min-h-[196px] sm:p-6"
      href={destinationHref(service)}
      {...linkProps(service)}
    >
      <span className="absolute right-5 top-5 text-[18px] text-[#a59d93] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true">↗</span>
      <span className={`grid size-10 shrink-0 place-items-center rounded-[13px] ${tone.text} ${tone.surface}`.trim()}>
        <ServiceIcon name={iconName(service.icon)} className="size-[19px]" />
      </span>
      <span className="mt-5 min-w-0 text-overline text-[#8b8278]">{service.category}</span>
      <h2 className="mt-2 line-clamp-2 min-w-0 font-brand text-card-title text-ink transition-colors group-hover:text-accent">{service.title}</h2>
      <p className="mt-2 line-clamp-2 min-w-0 text-card-copy text-muted">{service.description}</p>
      <span className="mt-auto pt-5 text-button font-semibold text-ink transition-colors group-hover:text-accent">{action}</span>
    </a>
  );
}

export function ServiceDirectoryContent({ initialData }: { initialData: PublicServiceCatalog }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => initialData.items.filter((service) => {
    const matchesCategory = category === "all" || service.categoryKey === category;
    const matchesQuery = !normalizedQuery || `${service.title} ${service.description} ${service.category} ${service.groupLabel}`.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  }), [category, initialData.items, normalizedQuery]);

  return (
    <div className="pb-section-gap-xl">
      <header className="grid gap-6 border-b border-[#d8d3ca] pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,390px)] lg:items-end lg:gap-10 lg:pb-10">
        <div>
          <p className="text-overline text-accent">LIMEX SERVICES</p>
          <h1 className="mt-3 max-w-[760px] font-brand text-page-title text-ink max-lg:text-page-title-mobile">Practical support for the work that matters.</h1>
          <p className="mt-4 max-w-[650px] text-body-lg text-muted">From setting up your company to protecting your brand, choose a clear next step and move forward with confidence.</p>
        </div>
        <label className="relative block w-full lg:justify-self-end">
          <span className="sr-only">Search services</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[17px] text-[#8c857c]" aria-hidden="true">⌕</span>
          <input
            className="h-12 w-full rounded-full border border-[#d4cec4] bg-white/45 pl-11 pr-4 text-body-sm text-ink outline-none transition-colors placeholder:text-[#9b948b] focus:border-accent focus:bg-white/70 focus:ring-4 focus:ring-pink/10"
            type="search"
            placeholder="Find a service…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </header>

      <div className="mt-7 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter services">
        <button
          className={`min-h-10 rounded-full px-4 text-button font-semibold transition-colors ${category === "all" ? "bg-ink text-white" : "bg-white/45 text-muted ring-1 ring-[#d4cec4] hover:bg-white/75 hover:text-ink"}`.trim()}
          type="button"
          role="tab"
          aria-selected={category === "all"}
          onClick={() => setCategory("all")}
        >
          All services <span className="ml-1 text-[11px] opacity-60">{initialData.items.length}</span>
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
            {item.label} <span className="ml-1 text-[11px] opacity-60">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-body-sm text-muted" role="status">
          {filteredItems.length} {filteredItems.length === 1 ? "service" : "services"}
          {normalizedQuery ? ` matching “${query.trim()}”` : " available"}
        </p>
        {category !== "all" || query ? <button className="text-button font-semibold text-accent" type="button" onClick={() => { setCategory("all"); setQuery(""); }}>Clear filters</button> : null}
      </div>

      {filteredItems.length ? (
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      ) : (
        <div className="mt-4 rounded-[22px] bg-white/35 px-6 py-12 text-center ring-1 ring-[#ddd8cf]/75">
          <p className="font-brand text-subheading text-ink">No matching services</p>
          <p className="mt-2 text-body-sm text-muted">Try another phrase or clear the filters to see the full catalogue.</p>
        </div>
      )}
    </div>
  );
}
