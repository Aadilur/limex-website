"use client";

import { useMemo, useState } from "react";

import { trademarkClasses, trademarkClassStats, type TrademarkClass, type TrademarkClassType } from "./trademark-class-data";
import { SearchIcon } from "./ui";

type ClassFilter = "all" | TrademarkClassType;

function typeLabel(type: TrademarkClassType) {
  return type === "goods" ? "Goods" : "Services";
}

function classNumberClasses(item: TrademarkClass, selected: boolean) {
  if (item.type === "services") return selected ? "bg-[#0055ff] text-white" : "bg-[#e8efff] text-[#0055ff]";
  return selected ? "bg-[#007ea6] text-white" : "bg-[#e5fbff] text-[#007ea6]";
}

function classTypeClasses(type: TrademarkClassType) {
  return type === "services" ? "bg-[#e8efff] text-[#0055ff]" : "bg-[#e5fbff] text-[#007ea6]";
}

function filterButtonClasses(active: boolean, type: ClassFilter) {
  if (!active) return "border-warm bg-white text-muted hover:border-[#0055ff]/40 hover:text-ink";
  if (type === "services") return "border-[#0055ff] bg-[#0055ff] text-white";
  if (type === "goods") return "border-[#007ea6] bg-[#007ea6] text-white";
  return "border-[#071b3d] bg-[#071b3d] text-white";
}

export function TrademarkHero() {
  return (
    <section className="grid gap-section-gap-lg bg-page py-cluster-sm lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-section-gap-xl lg:py-cluster" aria-labelledby="trademark-page-title">
      <div className="min-w-0">
        <p className="text-overline text-[#0055ff]">Trademark class finder</p>
        <h1 className="mt-cluster max-w-[760px] font-brand text-page-title text-ink max-lg:text-page-title-mobile" id="trademark-page-title">
          Find the right class
          <span className="block">for your brand.</span>
        </h1>
        <p className="mt-cluster max-w-[600px] text-body-sm text-muted">Search by product, service, or class number.</p>
        <div className="mt-section-gap-lg flex flex-wrap gap-cluster-sm" aria-label="Trademark class totals">
          <span className="inline-flex min-h-8 items-center rounded-pill bg-[#071b3d] px-4 text-button font-semibold text-white">{trademarkClassStats.total} classes</span>
          <span className="inline-flex min-h-8 items-center rounded-pill bg-[#faf2e3] px-4 text-button font-semibold text-[#071b3d]">{trademarkClassStats.goods} goods</span>
          <span className="inline-flex min-h-8 items-center rounded-pill bg-[#e5fbff] px-4 text-button font-semibold text-[#007ea6]">{trademarkClassStats.services} services</span>
        </div>
      </div>

      <aside className="min-h-[184px] rounded-card bg-[#071b3d] px-card-pad py-card-pad text-white lg:min-h-[190px]" aria-label="Nice classification summary">
        <p className="text-overline text-[#d5f8ff]">Nice classification</p>
        <p className="mt-cluster text-page-title">{trademarkClassStats.total}</p>
        <p className="mt-cluster max-w-[250px] text-body-xs text-white">One simple directory for goods and services.</p>
        <div className="mt-section-gap-lg h-px bg-[#47615e]" />
        <p className="mt-cluster text-micro font-semibold text-[#d5f8ff]">01–34 Goods&nbsp;&nbsp;&nbsp; 35–45 Services</p>
      </aside>
    </section>
  );
}

export function TrademarkExplainer() {
  const benefits = [
    ["01", "Recognition", "Build a mark people remember."],
    ["02", "Protection", "Reduce confusion with similar brands."],
    ["03", "Value", "Turn your brand into a business asset."],
  ];

  return (
    <section className="mt-section-gap-lg grid gap-cluster border-t border-[#e3ded4] pt-card-pad-sm lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" aria-label="Trademark basics">
      <article className="rounded-nav border border-[#e3ded4] bg-white px-card-pad py-card-pad">
        <p className="text-overline text-[#0055ff]">Trademark basics</p>
        <h2 className="mt-cluster-sm font-brand text-section-title text-ink">What is a trademark?</h2>
        <p className="mt-cluster-sm max-w-[560px] text-body-xs text-muted">A trademark is a name, logo, word, or symbol that helps people recognise your business and separates it from others.</p>
        <p className="mt-cluster text-meta font-semibold text-[#0055ff]">Think of it as your brand&apos;s signature.</p>
      </article>

      <article className="rounded-nav bg-[#071b3d] px-card-pad py-card-pad text-white">
        <p className="text-overline text-[#d5f8ff]">Why register it?</p>
        <h2 className="mt-cluster-sm max-w-[680px] text-body-lg font-bold">Make your brand easier to remember, protect, and grow.</h2>
        <div className="mt-cluster grid gap-cluster-sm sm:grid-cols-3">
          {benefits.map(([number, title, description]) => (
            <div className="min-h-[106px] rounded-control bg-[#0039b8] px-3.5 py-3" key={number}>
              <p className="text-micro font-bold text-[#14dcff]">{number}</p>
              <h3 className="mt-1 text-nav-compact font-bold">{title}</h3>
              <p className="mt-1 text-micro text-[#d5f8ff]">{description}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function SelectedClassPreview({ item }: { item: TrademarkClass }) {
  const service = item.type === "services";
  return (
    <article className={`rounded-card px-card-pad-sm py-card-pad-sm sm:px-card-pad ${service ? "bg-[#e9efff]" : "bg-[#e5fbff]"}`.trim()} aria-live="polite">
      <div className="flex items-start gap-cluster sm:items-center">
        <div className={`grid size-[68px] shrink-0 place-items-center rounded-card text-subheading font-bold ${service ? "bg-[#0055ff]" : "bg-[#007ea6]"}`.trim()}>
          {item.number}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-overline ${service ? "text-[#0055ff]" : "text-[#007ea6]"}`.trim()}>Active class {item.number}</p>
          <h3 className="mt-1 font-brand text-subheading text-ink">Class {item.number}: {item.name}</h3>
          <p className="mt-cluster-sm text-meta text-muted">{item.description}</p>
        </div>
      </div>
      <div className="mt-cluster grid gap-cluster-sm sm:grid-cols-3 sm:pl-[84px]">
        {item.examples.map((example) => (
          <div className="rounded-control bg-white/55 px-2.5 py-2" key={example.label}>
            <p className="text-micro font-bold text-ink">{example.label}</p>
            <p className="mt-0.5 text-nav-compact text-muted">{example.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ClassCard({ item, selected, onSelect }: { item: TrademarkClass; selected: boolean; onSelect: () => void }) {
  return (
    <button
      className={`group flex min-h-[54px] min-w-0 items-center gap-cluster-sm rounded-control border px-2.5 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0055ff]/45 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${selected ? (item.type === "services" ? "border-[#9bb8ff] bg-[#e8efff]" : "border-[#8bdcf0] bg-[#e5fbff]") : "border-transparent bg-white"}`.trim()}
      type="button"
      aria-pressed={selected}
      aria-label={`Select class ${item.number}: ${item.name}`}
      onClick={onSelect}
    >
      <span className={`grid size-7 shrink-0 place-items-center rounded-control text-nav-compact font-bold ${classNumberClasses(item, selected)}`.trim()}>{item.number}</span>
      <span className="min-w-0 flex-1 truncate text-meta font-bold text-ink">{item.name}</span>
      <span className={`inline-flex shrink-0 items-center justify-center rounded-pill px-2 py-1 text-nav-compact font-semibold ${classTypeClasses(item.type)}`.trim()}>{typeLabel(item.type)}</span>
    </button>
  );
}

export function TrademarkFinder() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ClassFilter>("all");
  const [selectedNumber, setSelectedNumber] = useState(35);

  const selectedClass = trademarkClasses.find((item) => item.number === selectedNumber) ?? trademarkClasses[34];
  const filteredClasses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return trademarkClasses.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;
      const searchableText = [item.number, item.name, item.description, ...item.examples.flatMap((example) => [example.label, example.detail])].join(" ").toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [filter, query]);

  const selectFilter = (nextFilter: ClassFilter) => {
    setFilter(nextFilter);
    if (nextFilter === "goods" && selectedClass.type !== "goods") setSelectedNumber(1);
    if (nextFilter === "services" && selectedClass.type !== "services") setSelectedNumber(35);
  };

  return (
    <section className="mt-section-gap-lg" id="trademark-finder" aria-labelledby="finder-title">
      <div className="grid items-end gap-cluster lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="min-w-0">
          <p className="text-overline text-[#0055ff]">Class finder</p>
          <h2 className="mt-cluster-xs font-brand text-subheading text-ink" id="finder-title">Find the class that fits your offering</h2>
          <label className="sr-only" htmlFor="trademark-class-search">Search products, services, or class number</label>
          <div className="relative mt-cluster">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"><SearchIcon /></span>
            <input
              className="h-[50px] w-full rounded-control border border-[#e3ded4] bg-cream pl-12 pr-4 text-button text-ink outline-none transition-colors placeholder:text-muted focus:border-[#0055ff] focus:ring-2 focus:ring-[#0055ff]/15"
              id="trademark-class-search"
              type="search"
              value={query}
              placeholder="Search products, services, or class number"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="mt-cluster-sm flex flex-wrap gap-cluster-sm" aria-label="Filter classes by type">
            {(["all", "goods", "services"] as const).map((option) => {
              const label = option === "all" ? `All ${trademarkClassStats.total}` : option === "goods" ? `Goods ${trademarkClassStats.goods}` : `Services ${trademarkClassStats.services}`;
              return (
                <button
                  className={`rounded-pill border px-3 py-1.5 text-nav-compact font-semibold transition-colors ${filterButtonClasses(filter === option, option)}`.trim()}
                  type="button"
                  aria-pressed={filter === option}
                  key={option}
                  onClick={() => selectFilter(option)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <SelectedClassPreview item={selectedClass} />
      </div>

      <div className="mt-section-gap-lg border-t border-[#e3ded4] pt-card-pad-sm">
        <div className="flex flex-col gap-cluster-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-overline text-[#0055ff]">All classes</p>
            <h2 className="mt-1 font-brand text-section-title text-ink">Browse the 45 classes</h2>
          </div>
          <span className="inline-flex min-h-[34px] w-fit items-center rounded-control border border-[#e5dfd4] bg-white px-4 text-micro font-semibold text-muted">{filteredClasses.length} {filteredClasses.length === 1 ? "class" : "classes"}</span>
        </div>

        {filteredClasses.length ? (
          <div className="mt-cluster grid gap-cluster-sm sm:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((item) => (
              <ClassCard item={item} key={item.number} selected={item.number === selectedNumber} onSelect={() => setSelectedNumber(item.number)} />
            ))}
          </div>
        ) : (
          <div className="mt-cluster rounded-control border border-dashed border-[#cfc8bc] bg-white px-5 py-8 text-center">
            <p className="text-body-sm font-bold text-ink">No class matches that search.</p>
            <p className="mt-1 text-body-xs text-muted">Try a product, service, or class number such as 35.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function TrademarkFilingNote() {
  return (
    <section className="mt-section-gap-lg flex flex-col gap-cluster-lg rounded-panel-mobile border border-[#e5dfd4] bg-white px-page-gutter py-card-pad-sm sm:px-card-pad lg:flex-row lg:items-center lg:justify-between lg:px-section-y" aria-label="Trademark filing guidance">
      <div className="max-w-[880px]">
        <p className="text-overline text-[#0055ff]">Before you file</p>
        <p className="mt-cluster-sm text-body-xs font-semibold text-ink">Use the directory as a starting point. Confirm the final goods or services wording with DPDT.</p>
        <p className="mt-1 text-meta text-muted">Need help with the right class? Our team can guide you.</p>
      </div>
      <a className="inline-flex min-h-control shrink-0 items-center justify-center rounded-pill bg-[#071b3d] px-6 text-button font-bold text-white transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href="/#contact">Get guidance</a>
    </section>
  );
}
