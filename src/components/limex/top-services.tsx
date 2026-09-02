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

function TopServiceLink({ service, index }: { service: PriorityService; index: number }) {
  return (
    <a
      className="group flex min-w-max shrink-0 items-center gap-2 rounded-pill bg-white/30 px-3 py-2 text-ink transition-colors duration-200 hover:bg-white/60 hover:text-accent lg:min-w-0 lg:shrink lg:rounded-none lg:bg-transparent lg:px-3 lg:py-2 lg:pl-4 lg:first:border-l-0"
      href={service.href}
      {...getLinkProps(service.href)}
    >
      <span className="shrink-0 text-micro font-bold text-[#2b5e8c]" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <span className="min-w-0 flex-1 truncate text-body-xs font-semibold lg:text-button">{service.displayTitle}</span>
      <span className="shrink-0 text-icon-action text-[#de4d73] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">↗</span>
    </a>
  );
}

function MobileServiceRow({ service }: { service: PriorityService }) {
  const tone = getToneClasses(service.color, service.surface);

  return (
    <a
      className="group flex min-h-[50px] min-w-0 items-center gap-3 border-b border-[#e4e2dc] px-0.5 py-1.5 text-ink transition-colors duration-200 last:border-b-0 hover:bg-white/35"
      href={service.href}
      {...getLinkProps(service.href)}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-[10px] ${tone.text} ${tone.surface}`.trim()}>
        <ServiceIcon name={service.icon} className="size-[17px]" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-body-xs font-semibold leading-tight">{service.displayTitle}</span>
        <span className="mt-0.5 block truncate text-micro text-muted">{service.description}</span>
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
      <nav className="flex flex-col rounded-[16px] bg-white/15 px-1 lg:hidden" aria-label="Popular services">
        {mobileServices.map((service) => (
          <MobileServiceRow key={service.title} service={service} />
        ))}
      </nav>
      <nav className="hidden min-w-0 gap-3 overflow-visible lg:grid lg:grid-cols-5 lg:gap-2" aria-label="Popular services">
        {topServices.map((service, index) => (
          <TopServiceLink key={service.title} service={service} index={index} />
        ))}
      </nav>
    </>
  );
}
