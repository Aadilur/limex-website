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
    <article className="flex min-w-0 min-h-[245px] flex-col gap-3.5 rounded-[18px] border border-warm bg-white p-4 animate-card-in lg:min-h-[240px] lg:rounded-3xl lg:p-6">
      <div className="flex min-h-[42px] items-center gap-2 lg:min-h-[52px] lg:gap-3">
        <span className={`inline-flex size-[42px] shrink-0 items-center justify-center rounded-[13px] text-[12px] font-bold lg:size-[52px] lg:rounded-2xl ${tone.text} ${tone.surface}`.trim()}>{number}</span>
        <span className={`text-[8px] font-[750] leading-3 lg:text-[9px] ${tone.text}`.trim()}>{label}</span>
      </div>
      <h3 className="min-h-[42px] text-[15px] font-bold leading-[18px] tracking-[-0.25px] text-[#14120f] lg:min-h-[38px] lg:text-card-title">{title}</h3>
      <p className="min-h-[34px] text-[11px] leading-[15px] text-[#63615c] lg:text-card-copy">{description}</p>
      <a className="mt-auto flex items-center gap-2 text-[11.5px] font-[650] text-[#14120f] underline-offset-4 transition-colors hover:text-pink hover:underline" href="/services">
        {action} <span className={`text-[14px] ${tone.text}`.trim()} aria-hidden="true">↗</span>
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
    <section className="bg-page px-5 py-7 pb-[26px] lg:rounded-[28px] lg:px-14 lg:py-[42px] lg:pb-10" id="services" aria-labelledby="services-title">
      <div className="flex flex-col gap-[18px] lg:flex-row lg:items-start lg:justify-between lg:gap-6">
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

      <div className="mt-6 flex min-h-12 items-start gap-3 overflow-x-auto rounded-3xl border border-warm bg-white p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-7 lg:items-center lg:justify-between">
        <div className="flex min-w-max items-center gap-1">
          {serviceFilters.map((filter) => (
            <button
              key={filter}
              className={`min-h-9 rounded-[18px] border-0 px-3.5 text-[11px] font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${
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
        <span className="hidden min-h-9 items-center rounded-[18px] bg-[#f6f2ed] px-3.5 text-[11px] font-semibold text-[#736659] whitespace-nowrap lg:inline-flex">10 services</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 max-[560px]:grid-cols-1 lg:mt-8 lg:grid-cols-4 lg:gap-[21px]" aria-live="polite">
        {filteredServices.map((service) => <ServiceCard key={service.number} {...service} />)}
      </div>

      <div className="mt-5 flex min-h-[76px] flex-col items-start justify-between gap-3.5 rounded-[20px] bg-[#14131a] p-[17px] lg:mt-[21px] lg:flex-row lg:items-center lg:gap-5 lg:px-5 lg:py-4 lg:pl-[22px]">
        <div className="flex flex-col gap-[5px]">
          <strong className="text-[13px] leading-[18px] text-white">Not sure where to begin?</strong>
          <span className="text-[11.5px] leading-4 text-[#bdb8c7]">Tell us your business stage and we will point you to the right service.</span>
        </div>
        <ActionButton href="#contact" variant="white" className="w-max min-w-0 lg:w-[224px] lg:min-w-[224px]">
          Get a recommendation
        </ActionButton>
      </div>
    </section>
  );
}
