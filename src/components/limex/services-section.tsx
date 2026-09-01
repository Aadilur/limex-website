"use client";

import { useEffect, useMemo, useState } from "react";

import { createServicesFromNavigation, navigation, serviceFilters, type Service, type ServiceFilter } from "./data";
import { ServiceIcon } from "./service-icons";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle, WaveLabel } from "./ui";
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
      className="group flex min-h-[168px] min-w-0 flex-col rounded-card border border-warm bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d3ccc2] hover:shadow-[0_10px_24px_rgba(20,26,46,0.08)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 sm:min-h-[180px] sm:p-3.5 lg:min-h-[184px] lg:p-4"
      href={href}
      {...getLinkProps(href)}
    >
      <div className="flex items-start justify-between gap-cluster-sm">
        <span className={`grid size-9 shrink-0 place-items-center rounded-control ${tone.text} ${tone.surface}`.trim()}>
          <ServiceIcon name={icon} className="size-[18px]" />
        </span>
        <span className={`pt-1 text-body-xs transition-transform duration-200 group-hover:translate-x-0.5 ${tone.text}`.trim()} aria-hidden="true">↗</span>
      </div>

      <h3 className="mt-cluster-sm min-w-0 break-words text-body-sm font-bold leading-snug text-[#14120f] sm:text-card-title">{title}</h3>
      <p className="mt-1.5 line-clamp-2 min-w-0 text-meta leading-relaxed text-[#77736e]">{description}</p>

      <span className={`mt-auto flex items-center gap-cluster-sm pt-cluster text-meta font-strong ${tone.text} underline-offset-4 transition-colors group-hover:underline`.trim()}>
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
    <section className="bg-page px-page-gutter py-6 pb-6 lg:rounded-panel lg:px-section-gutter-lg lg:py-10 lg:pb-8" id="services" aria-labelledby="services-title">
      <div className="flex flex-col gap-cluster lg:flex-row lg:items-start lg:justify-between lg:gap-cluster-lg">
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

      <div className="mt-cluster flex min-h-10 items-start gap-cluster-sm overflow-x-auto rounded-pill border border-warm bg-white p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:items-center lg:justify-between">
        <div className="flex min-w-max items-center gap-1" role="tablist" aria-label="Filter services">
          {serviceFilters.map((filter) => (
            <button
              key={filter}
              className={`min-h-9 whitespace-nowrap rounded-pill border-0 px-3.5 text-button font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${
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
        <WaveLabel className="hidden whitespace-nowrap text-[#736659] lg:inline-flex">
          {filteredServices.length} {filteredServices.length === MAX_FEATURED_SERVICES ? "featured" : "available"}
        </WaveLabel>
      </div>

      <div className="mt-cluster grid grid-cols-2 gap-cluster-sm lg:grid-cols-4 lg:gap-cluster" aria-live="polite">
        {filteredServices.map((service) => <ServiceCard key={`${service.filters[0]}-${service.number}-${service.title}`} {...service} />)}
      </div>

      <div className="mt-cluster flex min-h-16 flex-col items-start justify-between gap-section-gap-lg rounded-panel-mobile bg-[#14131a] p-3.5 lg:flex-row lg:items-center lg:gap-cluster-lg lg:px-4 lg:py-3">
        <div className="flex flex-col gap-cluster-xs">
          <strong className="text-body-xs text-white">Not sure where to begin?</strong>
          <span className="text-meta text-[#bdb8c7]">Tell us your business stage and we will point you to the right service.</span>
        </div>
        <ActionButton href="#contact" variant="white" className="w-full min-w-0 sm:w-max lg:w-[224px] lg:min-w-[224px]">
          Get a recommendation
        </ActionButton>
      </div>
    </section>
  );
}
