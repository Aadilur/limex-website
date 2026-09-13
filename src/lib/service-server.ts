import { navigation, services } from "@/components/limex/data";
import { trademarkRegistrationService } from "@/components/limex/service-page-data";
import {
  generatedServiceToPublic,
  getGeneratedService,
  mergeGeneratedServiceCatalog,
} from "./service-content";
import type {
  PublicService,
  PublicServiceCatalog,
  PublicServiceDetail,
  ServiceDestination,
  ServiceDetailContent,
  ServiceLocale,
} from "./service-types";

function fallbackDestination(href: string): ServiceDestination {
  const normalized = href.trim();
  const type = normalized.startsWith("/services/")
    ? "DETAIL"
    : normalized.startsWith("/blog/") || normalized.startsWith("/bn/blog/")
      ? "BLOG"
      : normalized.startsWith("/business-tools/")
        ? "TOOL"
        : normalized === "#contact" || normalized.startsWith("#contact-")
          ? "CONTACT"
          : /^https?:\/\//i.test(normalized)
            ? "EXTERNAL"
            : "INTERNAL";
  const label =
    type === "DETAIL"
      ? "View service"
      : type === "BLOG"
        ? "Read guide"
        : type === "TOOL"
          ? "Open tool"
          : type === "EXTERNAL"
            ? "Open website"
            : type === "CONTACT"
              ? "Contact team"
              : "Open page";
  return { type, href: normalized, label, isExternal: type === "EXTERNAL" };
}

function fallbackChildren(title: string) {
  for (const section of navigation) {
    for (const group of section.megaGroups ?? []) {
      const item = group.items.find((candidate) => candidate.label === title);
      if (item)
        return (item.children ?? []).map((child, index) => ({
          id: `${title}-${index}`,
          label: child.label,
          href: child.href,
          isVisible: true,
          sortOrder: index,
        }));
    }
  }
  return [];
}

function fallbackCategory(filter: string) {
  if (filter === "Trademark")
    return { label: "IP & Trademark", key: "ip-trademark" };
  if (filter === "Tax & compliance")
    return {
      label: "Compliance & Documentation",
      key: "compliance-documentation",
    };
  if (filter === "Business tools")
    return { label: "Business Tools", key: "business-tools" };
  return { label: "Startup & Licensing", key: "startup-licensing" };
}

function fallbackItem(
  service: (typeof services)[number],
  index: number,
): PublicService {
  const filter = service.filters[0] ?? "Startup";
  const category = fallbackCategory(filter);
  const destination = fallbackDestination(service.href);
  const slug =
    service.href.match(/^\/services\/([^/?#]+)/i)?.[1] ??
    `${category.key}-${service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return {
    id: `fallback-${index}`,
    serviceKey: service.title,
    menuItemId: null,
    menuLinkId: null,
    parentLabel: null,
    slug,
    title: service.title,
    description: service.description,
    category: category.label,
    categoryKey: category.key,
    groupLabel: category.label,
    icon: service.icon,
    color: service.color,
    surface: service.surface,
    href: destination.href,
    destination,
    children: fallbackChildren(service.title),
    status: "LINK_ONLY",
    hasDetailPage: service.title === trademarkRegistrationService.title,
    sortOrder: index,
    isVisible: true,
    updatedAt: null,
  };
}

function fallbackDetail(): PublicServiceDetail {
  const base = fallbackItem(
    services.find(
      (service) => service.title === trademarkRegistrationService.title,
    ) ?? services[0],
    0,
  );
  const detail: ServiceDetailContent = {
    ctaLabel: trademarkRegistrationService.ctaLabel,
    startingPrice: trademarkRegistrationService.startingPrice,
    deliveryTime: trademarkRegistrationService.deliveryTime,
    serviceMode: trademarkRegistrationService.serviceMode,
    mediaTitle: trademarkRegistrationService.mediaTitle,
    mediaDescription: trademarkRegistrationService.mediaDescription,
    mediaUrl: trademarkRegistrationService.mediaUrl ?? "",
    mediaAlt: trademarkRegistrationService.mediaAlt ?? "",
    overviewEyebrow: trademarkRegistrationService.overviewEyebrow,
    overviewTitle: trademarkRegistrationService.overviewTitle,
    overviewDescription: trademarkRegistrationService.overviewDescription,
    contentLabel: trademarkRegistrationService.contentLabel,
    contentTitle: trademarkRegistrationService.contentTitle,
    contentDescription: trademarkRegistrationService.contentDescription,
    contentLinkLabel: trademarkRegistrationService.contentLinkLabel ?? "",
    contentLinkHref: trademarkRegistrationService.contentLinkHref ?? "",
    benefits: trademarkRegistrationService.benefits ?? [],
    steps: trademarkRegistrationService.steps ?? [],
    facts: trademarkRegistrationService.facts,
    pricing: trademarkRegistrationService.pricing,
    faqs: trademarkRegistrationService.faqs,
  };
  return {
    ...base,
    slug: trademarkRegistrationService.slug,
    title: trademarkRegistrationService.title,
    description: trademarkRegistrationService.description,
    href: `/services/${trademarkRegistrationService.slug}`,
    destination: fallbackDestination(
      `/services/${trademarkRegistrationService.slug}`,
    ),
    status: "PUBLISHED",
    hasDetailPage: true,
    detail,
  };
}

function fallbackCatalog(locale: ServiceLocale = "en"): PublicServiceCatalog {
  return mergeGeneratedServiceCatalog(null, locale);
}

function backendUrl(path: string) {
  const base =
    process.env.BACKEND_INTERNAL_URL ??
    `http://127.0.0.1:${process.env.BACKEND_PORT ?? "4000"}`;
  return `${base.replace(/\/$/, "")}${path}`;
}

async function fetchBackend<T>(
  path: string,
): Promise<{ value: T | null; available: boolean; notFound: boolean }> {
  try {
    const response = await fetch(backendUrl(path), { cache: "no-store" });
    if (response.status === 404)
      return { value: null, available: true, notFound: true };
    if (!response.ok) return { value: null, available: true, notFound: false };
    const payload = (await response.json()) as { data?: T };
    return { value: payload.data ?? null, available: true, notFound: false };
  } catch {
    return { value: null, available: false, notFound: false };
  }
}

export async function getPublicServicesServer(locale: ServiceLocale = "en") {
  const result = await fetchBackend<PublicServiceCatalog>("/api/services");
  if (result.available && result.value)
    return mergeGeneratedServiceCatalog(result.value, locale);
  return fallbackCatalog(locale);
}

export async function getPublicServiceServer(
  slug: string,
  locale: ServiceLocale = "en",
) {
  const generated = getGeneratedService(slug);

  const result = await fetchBackend<PublicServiceDetail>(
    `/api/services/${encodeURIComponent(slug)}?locale=${locale}`,
  );
  if (result.value) return result.value;
  // A reachable backend returning 404 means the profile is not published.
  // Do not let bundled fallback content bypass the publish gate.
  if (result.notFound) return null;
  if (generated) {
    return {
      ...generatedServiceToPublic(generated, locale),
      detail: locale === "bn" ? generated.detailBn : generated.detailEn,
    };
  }
  return slug === trademarkRegistrationService.slug ? fallbackDetail() : null;
}
