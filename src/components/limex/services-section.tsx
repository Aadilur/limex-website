"use client";

import { useEffect, useMemo, useState } from "react";

import { createServicesFromNavigation, navigation, serviceFilters, type Service, type ServiceFilter } from "./data";
import { ServiceIcon } from "./service-icons";
import { getToneClasses } from "./styles";
import { ActionButton, SectionTitle } from "./ui";
import { getPublicMenu } from "@/lib/menu-api";

const MAX_VISIBLE_SERVICES = 8;

function getLinkProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};
}

function selectBalancedServices(availableServices: Service[]): Service[] {
  const categoryFilters = serviceFilters.filter(
    (filter): filter is Exclude<ServiceFilter, "All services"> => filter !== "All services",
  );
  const visibleServices: Service[] = [];

  for (let round = 0; visibleServices.length < MAX_VISIBLE_SERVICES; round += 1) {
    let addedService = false;

    for (const filter of categoryFilters) {
      const service = availableServices.filter((item) => item.filters.includes(filter))[round];
      if (service) {
        visibleServices.push(service);
        addedService = true;
      }

      if (visibleServices.length === MAX_VISIBLE_SERVICES) break;
    }

    if (!addedService) break;
  }

  return visibleServices;
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
      className="group flex min-h-[158px] min-w-0 flex-col rounded-[16px] border border-[#d9d5cb] bg-transparent p-3 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfc8bd] hover:bg-[#fbfaf7] hover:shadow-[0_8px_20px_rgba(20,26,46,0.06)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-3 sm:min-h-[168px] sm:rounded-[20px] lg:min-h-[184px] lg:rounded-card lg:p-4"
      href={href}
      {...getLinkProps(href)}
    >
      <div className="flex items-start justify-between gap-cluster-sm">
        <span className={`grid size-8 shrink-0 place-items-center rounded-[10px] border border-white/80 ${tone.text} ${tone.surface} lg:size-10 lg:rounded-[12px]`.trim()}>
          <ServiceIcon name={icon} className="size-[17px] lg:size-[19px]" />
        </span>
      </div>

      <h3 className="mt-2 min-h-[36px] min-w-0 line-clamp-2 break-words text-body-sm font-bold leading-[1.2] text-[#14120f] transition-colors duration-200 group-hover:text-accent lg:mt-cluster lg:min-h-0 lg:text-card-title lg:leading-tight">{title}</h3>
      <p className="mt-1 min-h-[34px] line-clamp-2 min-w-0 text-micro leading-[1.4] text-[#77736e] lg:mt-1.5 lg:min-h-0 lg:text-body-xs lg:leading-relaxed">{description}</p>

      <span className={`mt-auto flex min-h-7 items-center gap-1 pt-1 text-micro font-strong ${tone.text} underline-offset-4 transition-colors group-hover:underline lg:min-h-8 lg:gap-cluster-sm lg:pt-cluster lg:text-button`.trim()}>
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
    if (selectedFilter === "All services") return selectBalancedServices(availableServices);

    return availableServices
      .filter((service) => service.filters.includes(selectedFilter))
      .slice(0, MAX_VISIBLE_SERVICES);
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

      <div className="relative mt-section-gap-lg overflow-hidden rounded-[18px] border border-[#ded9d0] bg-[#f7f4ef] p-1.5 shadow-none">
        <div className="flex min-w-0 overflow-x-auto pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filter services">
          <div className="flex min-w-max items-center gap-1">
            {serviceFilters.map((filter) => (
              <button
                key={filter}
                className={`min-h-10 whitespace-nowrap rounded-[13px] border-0 px-4 text-button font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-pink/35 focus-visible:outline-offset-2 ${
                  selectedFilter === filter ? "bg-[#14131a] text-white" : "bg-transparent text-[#544f4a] hover:bg-white/70"
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
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f7f4ef] via-[#f7f4ef]/90 to-transparent" aria-hidden="true" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:mt-cluster lg:grid-cols-4 lg:gap-cluster" aria-live="polite">
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
