"use client";

import { useMemo, useState } from "react";

import { serviceFilters, services, type ServiceFilter } from "./data";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";

function ServiceCard({
  number,
  label,
  title,
  description,
  action,
  color,
  surface,
}: (typeof services)[number]) {
  const tone = getToneClasses(color, surface);

  return (
    <article className="flex min-w-0 min-h-[245px] flex-col gap-cluster-sm rounded-card border border-warm bg-white p-card-pad-sm animate-card-in lg:min-h-[240px] lg:p-card-pad">
      <div className="flex min-h-[42px] items-center gap-cluster-sm lg:min-h-[52px] lg:gap-cluster">
        <span className={`inline-flex size-[42px] shrink-0 items-center justify-center rounded-control text-button font-bold lg:size-[52px] lg:rounded-2xl ${tone.text} ${tone.surface}`.trim()}>{number}</span>
        <span className={`text-nav-compact font-display lg:text-nav-compact ${tone.text}`.trim()}>{label}</span>
      </div>
      <h3 className="min-h-[42px] text-body-sm font-bold text-[#14120f] lg:min-h-[38px] lg:text-card-title">{title}</h3>
      <p className="min-h-[34px] text-meta text-[#63615c] lg:text-card-copy">{description}</p>
      <a className="mt-auto flex items-center gap-cluster-sm text-meta font-strong text-[#14120f] underline-offset-4 transition-colors hover:text-pink hover:underline" href="/services">
        {action} <span className={`text-body-sm ${tone.text}`.trim()} aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

export function ServicesSection() {
  const [selectedFilter, setSelectedFilter] = useState<ServiceFilter>("All services");
  const filteredServices = useMemo(
    () => selectedFilter === "All services" ? services : services.filter((service) => service.filters.includes(selectedFilter)),
    [selectedFilter],
  );

  return (
    <section className="bg-page px-page-gutter py-section-y pb-section-y lg:rounded-panel lg:px-section-gutter-lg lg:py-section-y-xl lg:pb-10" id="services" aria-labelledby="services-title">
      <div className="flex flex-col gap-section-gap lg:flex-row lg:items-start lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="services-title"
          eyebrow="WHAT WE CAN HELP YOU WITH"
          title="Start, protect and grow with clarity."
          description="A focused set of services for the moments that matter most in your business journey."
        />
        <ActionButton href="/services" variant="light" className="w-max min-w-[190px] lg:mt-1">
          View all services
        </ActionButton>
      </div>

      <div className="mt-section-gap-lg flex min-h-12 items-start gap-cluster-sm overflow-x-auto rounded-pill border border-warm bg-white p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-section-gap-lg lg:items-center lg:justify-between">
        <div className="flex min-w-max items-center gap-1">
          {serviceFilters.map((filter) => (
            <button
              key={filter}
              className={`min-h-9 rounded-pill border-0 px-3.5 text-button font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${
                selectedFilter === filter ? "bg-[#14131a] text-white" : "bg-white text-[#544f4a] hover:bg-[#f6f2ed]"
              }`.trim()}
              type="button"
              role="tab"
              aria-selected={selectedFilter === filter}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <span className="hidden min-h-9 items-center rounded-pill bg-[#f6f2ed] px-3.5 text-button font-semibold text-[#736659] whitespace-nowrap lg:inline-flex">10 services</span>
      </div>

      <div className="mt-section-gap-lg grid grid-cols-2 gap-cluster-sm max-[560px]:grid-cols-1 lg:mt-section-gap-lg lg:grid-cols-4 lg:gap-cluster-lg" aria-live="polite">
        {filteredServices.map((service) => <ServiceCard key={service.number} {...service} />)}
      </div>

      <div className="mt-section-gap-lg flex min-h-[76px] flex-col items-start justify-between gap-section-gap-lg rounded-panel-mobile bg-[#14131a] p-card-pad-sm lg:mt-section-gap-lg lg:flex-row lg:items-center lg:gap-cluster-lg lg:px-5 lg:py-4 lg:pl-[22px]">
        <div className="flex flex-col gap-cluster-xs">
          <strong className="text-body-xs text-white">Not sure where to begin?</strong>
          <span className="text-meta text-[#bdb8c7]">Tell us your business stage and we will point you to the right service.</span>
        </div>
        <ActionButton href="#contact" variant="white" className="w-max min-w-0 lg:w-[224px] lg:min-w-[224px]">
          Get a recommendation
        </ActionButton>
      </div>
    </section>
  );
}
