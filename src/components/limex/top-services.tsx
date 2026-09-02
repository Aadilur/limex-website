"use client";

import { useEffect, useMemo, useState } from "react";

import { createServicesFromNavigation, navigation, type NavItem, type Service } from "./data";
import { ServiceIcon } from "./service-icons";
import { getToneClasses } from "./styles";
import { getPublicMenu } from "@/lib/menu-api";

const priorityServices = [
  { title: "Company Formation", displayTitle: "Company registration" },
  { title: "Trade License", displayTitle: "Trade license" },
  { title: "Income Tax", displayTitle: "Income tax filing" },
  { title: "VAT / BIN Registration", displayTitle: "VAT / BIN registration" },
  { title: "Trademark", displayTitle: "Trademark protection" },
] as const;

const mobilePriorityServices = [
  { title: "Company Formation", displayTitle: "Company Formation" },
  { title: "VAT / BIN Registration", displayTitle: "VAT / BIN Registration" },
  { title: "RJSC Compliance", displayTitle: "RJSC Compliance" },
  { title: "Income Tax", displayTitle: "Income Tax Filing" },
  { title: "Trademark", displayTitle: "Trademark" },
] as const;

type PriorityService = Service & { displayTitle: string };

function getLinkProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};
}

function selectPriorityServices(
  menuNavigation: NavItem[],
  priorities: ReadonlyArray<{ title: string; displayTitle: string }> = priorityServices,
): PriorityService[] {
  const availableServices = createServicesFromNavigation(menuNavigation);

  return priorities.flatMap(({ title, displayTitle }) => {
    const service = availableServices.find((item) => item.title === title);
    return service ? [{ ...service, displayTitle }] : [];
  });
}

function FeaturedServiceLink({ service }: { service: PriorityService }) {
  const tone = getToneClasses(service.color, service.surface);

  return (
    <a
      className="group flex min-h-[68px] min-w-0 items-center gap-3 border-b border-[#e4e2dc] px-0.5 py-1.5 text-ink transition-colors duration-200 last:border-b-0 hover:bg-transparent lg:min-h-[82px] lg:items-start lg:gap-3 lg:border-b-0 lg:px-3 lg:py-2"
      href={service.href}
      {...getLinkProps(service.href)}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-[10px] ${tone.text} ${tone.surface} lg:size-9 lg:rounded-[11px]`.trim()}>
        <ServiceIcon name={service.icon} className="size-[17px] lg:size-[18px]" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-body-xs font-semibold leading-tight transition-colors duration-200 group-hover:text-accent lg:text-button">{service.displayTitle}</span>
        <span className="mt-0.5 block min-h-[34px] line-clamp-2 text-micro leading-[1.4] text-muted lg:text-meta lg:leading-[1.4]">{service.description}</span>
      </span>
      <span className="shrink-0 pr-1 text-icon-action text-[#de4d73] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">↗</span>
    </a>
  );
}

export function TopServices() {
  const [menuNavigation, setMenuNavigation] = useState(navigation);
  const topServices = useMemo(() => selectPriorityServices(menuNavigation), [menuNavigation]);
  const mobileServices = useMemo(() => selectPriorityServices(menuNavigation, mobilePriorityServices), [menuNavigation]);

  useEffect(() => {
    let cancelled = false;

    void getPublicMenu()
      .then((managedItems) => {
        if (!cancelled) setMenuNavigation(managedItems);
      })
      .catch(() => {
        // Keep the bundled menu available when the API is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <nav className="flex flex-col bg-transparent lg:hidden" aria-label="Popular services">
        {mobileServices.map((service) => <FeaturedServiceLink key={service.title} service={service} />)}
      </nav>
      <nav className="hidden min-w-0 gap-3 overflow-visible lg:grid lg:grid-cols-5 lg:gap-2" aria-label="Popular services">
        {topServices.map((service) => <FeaturedServiceLink key={service.title} service={service} />)}
      </nav>
    </>
  );
}
