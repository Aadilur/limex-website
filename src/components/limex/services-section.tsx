"use client";

import { useEffect, useMemo, useState } from "react";

import { createServicesFromNavigation, navigation, serviceFilters, type Service, type ServiceFilter } from "./data";
import { ServiceIcon } from "./service-icons";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";
import { getPublicMenu } from "@/lib/menu-api";

const MAX_FEATURED_SERVICES = 8;

function getLinkProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};
}

function ServiceCard({
  title,
  description,
  action,
  href,
  icon,
  color,
  surface,
}: Service) {
  const tone = getToneClasses(color, surface);

  return (
    <a
      className="group flex min-h-[156px] min-w-0 flex-col rounded-[20px] border border-[#ddd9d1] bg-white p-4 shadow-[0_2px_0_rgba(27,34,30,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfc8bd] hover:shadow-[0_10px_24px_rgba(20,26,46,0.08)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 sm:min-h-[180px] sm:rounded-card sm:p-3.5 lg:min-h-[184px] lg:p-4"
      href={href}
      {...getLinkProps(href)}
    >
      <div className="flex items-start justify-between gap-cluster-sm">
        <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${tone.text} ${tone.surface}`.trim()}>
          <ServiceIcon name={icon} className="size-[20px]" />
        </span>
        <span className={`pt-1 text-body-sm transition-transform duration-200 group-hover:translate-x-0.5 ${tone.text}`.trim()} aria-hidden="true">↗</span>
      </div>

      <h3 className="mt-cluster min-w-0 break-words text-card-title leading-tight text-[#14120f]">{title}</h3>
      <p className="mt-1.5 line-clamp-2 min-w-0 text-body-xs leading-relaxed text-[#77736e] sm:text-meta">{description}</p>

      <span className={`mt-auto flex min-h-8 items-center gap-cluster-sm pt-cluster text-button font-strong ${tone.text} underline-offset-4 transition-colors group-hover:underline`.trim()}>
        {action}
        <span aria-hidden="true">↗</span>
      </span>
    </a>
  );
}

export function ServicesSection() {
  const [menuNavigation, setMenuNavigation] = useState(navigation);
  const [selectedFilter, setSelectedFilter] = useState<ServiceFilter>("All services");
  const availableServices = useMemo(() => createServicesFromNavigation(menuNavigation), [menuNavigation]);
  const filteredServices = useMemo(() => {
    const matchingServices = selectedFilter === "All services"
      ? availableServices
      : availableServices.filter((service) => service.filters.includes(selectedFilter));

    return matchingServices.slice(0, MAX_FEATURED_SERVICES);
  }, [availableServices, selectedFilter]);

  useEffect(() => {
    let cancelled = false;

    void getPublicMenu()
      .then((managedItems) => {
        if (!cancelled) setMenuNavigation(managedItems);
      })
      .catch(() => {
        // Keep the bundled service data available when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="scroll-mt-5 bg-page px-4 py-8 pb-8 sm:px-page-gutter sm:py-section-y lg:rounded-panel lg:px-section-gutter-lg lg:py-10 lg:pb-8" id="services" aria-labelledby="services-title">
      <div className="flex flex-col gap-cluster-lg lg:flex-row lg:items-start lg:justify-between lg:gap-cluster-lg">
        <SectionTitle
          id="services-title"
          title="Start, protect and grow with clarity."
          description="A focused set of services for the moments that matter most in your business journey."
        />
        <ActionButton href="/services" variant="light" className="w-full justify-between sm:w-max sm:min-w-[190px] lg:mt-1">
          View all services
        </ActionButton>
      </div>

      <div className="relative mt-section-gap-lg overflow-hidden rounded-[18px] border border-[#ded9d0] bg-white p-1.5 shadow-[0_2px_0_rgba(27,34,30,0.02)]">
        <div className="flex min-w-0 overflow-x-auto pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filter services">
          <div className="flex min-w-max items-center gap-1">
            {serviceFilters.map((filter) => (
              <button
                key={filter}
                className={`min-h-10 whitespace-nowrap rounded-[13px] border-0 px-4 text-button font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${
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
        </div>
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/90 to-transparent" aria-hidden="true" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-cluster lg:grid-cols-4 lg:gap-cluster" aria-live="polite">
        {filteredServices.map((service) => <ServiceCard key={`${service.filters[0]}-${service.number}-${service.title}`} {...service} />)}
      </div>

      <div className="mt-4 flex min-h-16 flex-col items-start justify-between gap-4 rounded-[20px] bg-[#14131a] p-4 sm:mt-cluster sm:p-5 lg:flex-row lg:items-center lg:gap-cluster-lg lg:px-4 lg:py-3">
        <div className="flex flex-col gap-cluster-xs">
          <strong className="text-body-sm text-white">Not sure where to begin?</strong>
          <span className="max-w-[520px] text-body-xs leading-relaxed text-[#bdb8c7]">Tell us your business stage and we will point you to the right service.</span>
        </div>
        <ActionButton href="#contact" variant="white" className="min-h-12 w-full min-w-0 sm:w-max lg:w-[224px] lg:min-w-[224px]">
          Get a recommendation
        </ActionButton>
      </div>
    </section>
  );
}
