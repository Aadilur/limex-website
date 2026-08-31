"use client";

import { useMemo, useState } from "react";

import { trademarkClasses, trademarkClassStats, type TrademarkClass, type TrademarkClassType } from "./trademark-class-data";
import { SearchIcon } from "./ui";

type ClassFilter = "all" | TrademarkClassType;

function typeLabel(type: TrademarkClassType) {
  return type === "goods" ? "Goods" : "Services";
}

function classNumberClasses(item: TrademarkClass, selected: boolean) {
  if (item.type === "services") return selected ? "bg-[#c74d63] text-white" : "bg-[#f5e5e8] text-[#c74d63]";
  return selected ? "bg-[#296666] text-white" : "bg-[#e5f2f0] text-[#296666]";
}

function classTypeClasses(type: TrademarkClassType) {
  return type === "services" ? "bg-[#f5e5e8] text-[#c74d63]" : "bg-[#f7f5f0] text-[#6e6963]";
}

function filterButtonClasses(active: boolean, type: ClassFilter) {
  if (!active) return "border-warm bg-white text-muted hover:border-[#c74d63]/40 hover:text-ink";
  if (type === "services") return "border-[#c74d63] bg-[#c74d63] text-white";
  if (type === "goods") return "border-[#296666] bg-[#296666] text-white";
  return "border-[#171412] bg-[#171412] text-white";
}

export function TrademarkHero() {
  return (
    <section className="grid gap-7 bg-page py-2 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-12 lg:py-4" aria-labelledby="trademark-page-title">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[1.35px] text-[#c74d63]">Trademark class finder</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(43px,3.25vw,56px)] font-bold leading-[0.98] tracking-[-2.8px] text-ink" id="trademark-page-title">
          Find the right class
          <span className="block">for your brand.</span>
        </h1>
        <p className="mt-4 max-w-[600px] text-[15px] leading-6 text-muted">Search by product, service, or class number.</p>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Trademark class totals">
          <span className="inline-flex min-h-8 items-center rounded-full bg-[#171412] px-4 text-[10px] font-semibold text-white">{trademarkClassStats.total} classes</span>
          <span className="inline-flex min-h-8 items-center rounded-full bg-[#faf2e3] px-4 text-[10px] font-semibold text-[#171412]">{trademarkClassStats.goods} goods</span>
          <span className="inline-flex min-h-8 items-center rounded-full bg-[#e5f2f0] px-4 text-[10px] font-semibold text-[#296666]">{trademarkClassStats.services} services</span>
        </div>
      </div>

      <aside className="min-h-[184px] rounded-[22px] bg-[#1a2929] px-6 py-6 text-white lg:min-h-[190px]" aria-label="Nice classification summary">
        <p className="text-[9px] font-bold uppercase tracking-[1.15px] text-[#bdd9d4]">Nice classification</p>
        <p className="mt-3 text-[48px] font-bold leading-none tracking-[-2px]">{trademarkClassStats.total}</p>
        <p className="mt-3 max-w-[250px] text-[12px] leading-[17px] text-white">One simple directory for goods and services.</p>
        <div className="mt-5 h-px bg-[#47615e]" />
        <p className="mt-3 text-[10px] font-semibold text-[#c9e0db]">01–34 Goods&nbsp;&nbsp;&nbsp; 35–45 Services</p>
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
    <section className="mt-7 grid gap-4 border-t border-[#e3ded4] pt-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" aria-label="Trademark basics">
      <article className="rounded-[24px] border border-[#e3ded4] bg-white px-6 py-6">
        <p className="text-[9px] font-bold uppercase tracking-[1.3px] text-[#c74d63]">Trademark basics</p>
        <h2 className="mt-2.5 text-[24px] font-bold leading-7 tracking-[-0.6px] text-ink">What is a trademark?</h2>
        <p className="mt-2.5 max-w-[560px] text-[12px] leading-[17px] text-muted">A trademark is a name, logo, word, or symbol that helps people recognise your business and separates it from others.</p>
        <p className="mt-4 text-[11px] font-semibold text-[#c74d63]">Think of it as your brand&apos;s signature.</p>
      </article>

      <article className="rounded-[24px] bg-[#173838] px-6 py-6 text-white">
        <p className="text-[9px] font-bold uppercase tracking-[1.3px] text-[#c7e5e0]">Why register it?</p>
        <h2 className="mt-2.5 max-w-[680px] text-[17px] font-bold leading-6">Make your brand easier to remember, protect, and grow.</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {benefits.map(([number, title, description]) => (
            <div className="min-h-[106px] rounded-[14px] bg-[#1f4a4a] px-3.5 py-3" key={number}>
              <p className="text-[10px] font-bold text-[#f7a3ad]">{number}</p>
              <h3 className="mt-1 text-[11px] font-bold">{title}</h3>
              <p className="mt-1 text-[10px] leading-[14px] text-[#c7e5e0]">{description}</p>
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
    <article className={`rounded-[18px] px-4 py-4 sm:px-5 ${service ? "bg-[#ffe9e9]" : "bg-[#e5f2f0]"}`.trim()} aria-live="polite">
      <div className="flex items-start gap-4 sm:items-center">
        <div className={`grid size-[68px] shrink-0 place-items-center rounded-[19px] text-[23px] font-bold ${service ? "bg-[#c74d63]" : "bg-[#296666]"}`.trim()}>
          {item.number}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[9px] font-bold uppercase tracking-[1.15px] ${service ? "text-[#c74d63]" : "text-[#296666]"}`.trim()}>Active class {item.number}</p>
          <h3 className="mt-1 text-[18px] font-bold leading-6 tracking-[-0.35px] text-ink sm:text-[20px]">Class {item.number}: {item.name}</h3>
          <p className="mt-1.5 text-[11px] leading-[15px] text-muted">{item.description}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 sm:pl-[84px]">
        {item.examples.map((example) => (
          <div className="rounded-[13px] bg-white/55 px-2.5 py-2" key={example.label}>
            <p className="text-[10.5px] font-bold leading-[14px] text-ink">{example.label}</p>
            <p className="mt-0.5 text-[9px] leading-3 text-muted">{example.detail}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ClassCard({ item, selected, onSelect }: { item: TrademarkClass; selected: boolean; onSelect: () => void }) {
  return (
    <button
      className={`group flex min-h-[54px] min-w-0 items-center gap-2.5 rounded-[16px] border px-2.5 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c74d63]/45 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${selected ? (item.type === "services" ? "border-[#f1c4ca] bg-[#f5e5e8]" : "border-[#b9d8d4] bg-[#e5f2f0]") : "border-transparent bg-white"}`.trim()}
      type="button"
      aria-pressed={selected}
      aria-label={`Select class ${item.number}: ${item.name}`}
      onClick={onSelect}
    >
      <span className={`grid size-7 shrink-0 place-items-center rounded-[10px] text-[10px] font-bold ${classNumberClasses(item, selected)}`.trim()}>{item.number}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] font-bold leading-4 text-ink sm:text-[12px]">{item.name}</span>
      <span className={`inline-flex shrink-0 items-center justify-center rounded-full px-2 py-1 text-[9px] font-semibold ${classTypeClasses(item.type)}`.trim()}>{typeLabel(item.type)}</span>
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
    <section className="mt-8" id="trademark-finder" aria-labelledby="finder-title">
      <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[1.4px] text-[#c74d63]">Class finder</p>
          <h2 className="mt-1.5 text-[19px] font-bold leading-6 tracking-[-0.3px] text-ink" id="finder-title">Find the class that fits your offering</h2>
          <label className="sr-only" htmlFor="trademark-class-search">Search products, services, or class number</label>
          <div className="relative mt-4">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"><SearchIcon /></span>
            <input
              className="h-[50px] w-full rounded-[14px] border border-[#e3ded4] bg-cream pl-12 pr-4 text-[12px] text-ink outline-none transition-colors placeholder:text-muted focus:border-[#c74d63] focus:ring-2 focus:ring-[#c74d63]/15"
              id="trademark-class-search"
              type="search"
              value={query}
              placeholder="Search products, services, or class number"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter classes by type">
            {(["all", "goods", "services"] as const).map((option) => {
              const label = option === "all" ? `All ${trademarkClassStats.total}` : option === "goods" ? `Goods ${trademarkClassStats.goods}` : `Services ${trademarkClassStats.services}`;
              return (
                <button
                  className={`rounded-full border px-3 py-1.5 text-[9px] font-semibold transition-colors ${filterButtonClasses(filter === option, option)}`.trim()}
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

      <div className="mt-8 border-t border-[#e3ded4] pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#c74d63]">All classes</p>
            <h2 className="mt-1 text-[22px] font-bold leading-7 tracking-[-0.45px] text-ink">Browse the 45 classes</h2>
          </div>
          <span className="inline-flex min-h-[34px] w-fit items-center rounded-[14px] border border-[#e5dfd4] bg-white px-4 text-[10px] font-semibold text-muted">{filteredClasses.length} {filteredClasses.length === 1 ? "class" : "classes"}</span>
        </div>

        {filteredClasses.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((item) => (
              <ClassCard item={item} key={item.number} selected={item.number === selectedNumber} onSelect={() => setSelectedNumber(item.number)} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[16px] border border-dashed border-[#cfc8bc] bg-white px-5 py-8 text-center">
            <p className="text-[14px] font-bold text-ink">No class matches that search.</p>
            <p className="mt-1 text-[12px] text-muted">Try a product, service, or class number such as 35.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function TrademarkFilingNote() {
  return (
    <section className="mt-8 flex flex-col gap-5 rounded-[20px] border border-[#e5dfd4] bg-white px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-7" aria-label="Trademark filing guidance">
      <div className="max-w-[880px]">
        <p className="text-[10px] font-bold uppercase tracking-[1.15px] text-[#c74d63]">Before you file</p>
        <p className="mt-2 text-[12px] font-semibold leading-[17px] text-ink">Use the directory as a starting point. Confirm the final goods or services wording with DPDT.</p>
        <p className="mt-1 text-[11px] leading-4 text-muted">Need help with the right class? Our team can guide you.</p>
      </div>
      <a className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-[#171412] px-6 text-[10px] font-bold text-white transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3" href="/#contact">Get guidance</a>
    </section>
  );
}
