"use client";

import { useEffect, useMemo, useState } from "react";

import { createServicesFromNavigation, navigation, type NavItem, type Service } from "./data";
import { getPublicMenu } from "@/lib/menu-api";

const priorityServices = [
  { title: "Company Formation", displayTitle: "Company registration" },
  { title: "Trade License", displayTitle: "Trade license" },
  { title: "Income Tax", displayTitle: "Income tax filing" },
  { title: "VAT / BIN Registration", displayTitle: "VAT / BIN registration" },
  { title: "Trademark", displayTitle: "Trademark protection" },
] as const;

function getLinkProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {};
}

function selectPriorityServices(menuNavigation: NavItem[]) {
  const availableServices = createServicesFromNavigation(menuNavigation);

  return priorityServices.flatMap(({ title, displayTitle }) => {
    const service = availableServices.find((item) => item.title === title);
    return service ? [{ ...service, displayTitle }] : [];
  });
}

function TopServiceLink({ service, index }: { service: Service & { displayTitle: string }; index: number }) {
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

export function TopServices() {
  const [menuNavigation, setMenuNavigation] = useState(navigation);
  const topServices = useMemo(() => selectPriorityServices(menuNavigation), [menuNavigation]);

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
    <nav className="flex min-w-0 gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:gap-2 lg:overflow-visible" aria-label="Popular services">
      {topServices.map((service, index) => (
        <TopServiceLink key={service.title} service={service} index={index} />
      ))}
    </nav>
  );
}
