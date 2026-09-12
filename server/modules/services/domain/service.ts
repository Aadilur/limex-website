import type {
  AdminService,
  PublicService,
  PublicServiceCatalog,
  PublicServiceDetail,
  ServiceDetailContent,
  ServiceDestination,
  ServiceDestinationType,
  ServiceProfileInput,
} from "../../../../src/lib/service-types.js";
import type { MenuItem, MenuSection } from "../../admin/domain/menu.js";

export type ServiceProfileStatus = "LINK_ONLY" | "DRAFT" | "PUBLISHED";

export type ServiceProfileRow = {
  id: string;
  serviceKey: string;
  slug: string;
  menuItemId: string | null;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  detail: unknown;
  publishedDetail: unknown;
  status: string;
  revision: number;
  publishedRevision: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceMenuContext = {
  section: MenuSection;
  group: MenuSection["groups"][number];
  item: MenuItem;
};

export type ServiceRepository = {
  findMenuTree(): Promise<MenuSection[]>;
  findProfiles(): Promise<ServiceProfileRow[]>;
  findProfileByMenuItemId(menuItemId: string): Promise<ServiceProfileRow | null>;
  findProfileById(id: string): Promise<ServiceProfileRow | null>;
  findProfileBySlug(slug: string): Promise<ServiceProfileRow | null>;
  upsertProfile(menuItemId: string, input: ServiceProfileInput, expectedRevision: number | null, updatedBy: string): Promise<ServiceProfileRow>;
  publishProfile(id: string, expectedRevision: number, updatedBy: string): Promise<ServiceProfileRow>;
  unpublishProfile(id: string, expectedRevision: number, updatedBy: string): Promise<ServiceProfileRow>;
};

export class ServiceConflictError extends Error {
  public readonly statusCode = 409;

  public constructor(message = "This service changed in another session. Reload before saving.") {
    super(message);
    this.name = "ServiceConflictError";
  }
}

export class ServiceSafetyError extends Error {
  public readonly statusCode = 422;

  public constructor(message = "The service update is incomplete and was not saved. Reload before trying again.") {
    super(message);
    this.name = "ServiceSafetyError";
  }
}

export class ServiceNotFoundError extends Error {
  public readonly statusCode = 404;

  public constructor(message = "Service not found.") {
    super(message);
    this.name = "ServiceNotFoundError";
  }
}

export class ServiceInputError extends Error {
  public readonly statusCode = 400;

  public constructor(message: string) {
    super(message);
    this.name = "ServiceInputError";
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160) || "service";
}

export function isSafeServiceHref(value: string) {
  const href = value.trim();
  if (href.startsWith("/") || href.startsWith("#")) return true;

  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function destinationFromHref(href: string): ServiceDestination {
  const normalizedHref = href.trim();
  let type: ServiceDestinationType = "INTERNAL";

  if (normalizedHref.startsWith("/services/")) type = "DETAIL";
  else if (normalizedHref.startsWith("/blog/") || normalizedHref.startsWith("/bn/blog/")) type = "BLOG";
  else if (normalizedHref.startsWith("/business-tools/")) type = "TOOL";
  else if (normalizedHref === "#contact" || normalizedHref.startsWith("#contact-")) type = "CONTACT";
  else if (/^https?:\/\//i.test(normalizedHref)) type = "EXTERNAL";

  const labels: Record<ServiceDestinationType, string> = {
    DETAIL: "View service",
    BLOG: "Read guide",
    TOOL: "Open tool",
    INTERNAL: "Open page",
    EXTERNAL: "Open website",
    CONTACT: "Contact team",
  };

  return {
    type,
    href: normalizedHref,
    label: labels[type],
    isExternal: type === "EXTERNAL",
  };
}

export function emptyServiceDetail(): ServiceDetailContent {
  return {
    ctaLabel: "Talk to an advisor",
    startingPrice: "Let's talk",
    deliveryTime: "Confirmed after review",
    serviceMode: "Online or offline",
    mediaTitle: "A clearer next step",
    mediaDescription: "Add an optional image or video to introduce this service.",
    mediaUrl: "",
    mediaAlt: "",
    overviewEyebrow: "OVERVIEW",
    overviewTitle: "A practical path forward",
    overviewDescription: "Share the scope of this service and the next step your customer should take.",
    contentLabel: "THE LIMEX APPROACH",
    contentTitle: "Make the next step easier to understand.",
    contentDescription: "Add the key guidance, inclusions and expectations for this service.",
    contentLinkLabel: "Talk to an advisor",
    contentLinkHref: "#service-contact",
    benefits: [],
    steps: [],
    facts: [],
    pricing: [],
    faqs: [],
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function cleanString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function cleanStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 30) : [];
}

function cleanFacts(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    const label = cleanString(record?.label);
    const factValue = cleanString(record?.value);
    return label && factValue ? [{ label, value: factValue }] : [];
  }).slice(0, 12);
}

function cleanSteps(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    const title = cleanString(record?.title);
    const description = cleanString(record?.description);
    return title ? [{ title, description }] : [];
  }).slice(0, 12);
}

function cleanPricing(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    const name = cleanString(record?.name);
    const price = cleanString(record?.price);
    if (!name || !price) return [];
    return [{
      name,
      price,
      description: cleanString(record?.description),
      features: cleanStringList(record?.features).slice(0, 12),
      action: cleanString(record?.action, "Get started"),
      ...(record?.featured === true ? { featured: true } : {}),
    }];
  }).slice(0, 6);
}

function cleanFaqs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    const question = cleanString(record?.question);
    const answer = cleanString(record?.answer);
    return question && answer ? [{ question, answer }] : [];
  }).slice(0, 30);
}

export function normalizeServiceDetail(value: unknown): ServiceDetailContent {
  const base = emptyServiceDetail();
  const record = asRecord(value);
  if (!record) return base;

  return {
    ctaLabel: cleanString(record.ctaLabel, base.ctaLabel),
    startingPrice: cleanString(record.startingPrice, base.startingPrice),
    deliveryTime: cleanString(record.deliveryTime, base.deliveryTime),
    serviceMode: cleanString(record.serviceMode, base.serviceMode),
    mediaTitle: cleanString(record.mediaTitle, base.mediaTitle),
    mediaDescription: cleanString(record.mediaDescription, base.mediaDescription),
    mediaUrl: cleanString(record.mediaUrl),
    mediaAlt: cleanString(record.mediaAlt),
    overviewEyebrow: cleanString(record.overviewEyebrow, base.overviewEyebrow),
    overviewTitle: cleanString(record.overviewTitle, base.overviewTitle),
    overviewDescription: cleanString(record.overviewDescription, base.overviewDescription),
    contentLabel: cleanString(record.contentLabel, base.contentLabel),
    contentTitle: cleanString(record.contentTitle, base.contentTitle),
    contentDescription: cleanString(record.contentDescription, base.contentDescription),
    contentLinkLabel: cleanString(record.contentLinkLabel, base.contentLinkLabel),
    contentLinkHref: cleanString(record.contentLinkHref, base.contentLinkHref),
    benefits: cleanStringList(record.benefits),
    steps: cleanSteps(record.steps),
    facts: cleanFacts(record.facts),
    pricing: cleanPricing(record.pricing),
    faqs: cleanFaqs(record.faqs),
  };
}

export function profileStatus(value: unknown): ServiceProfileStatus {
  return value === "DRAFT" || value === "PUBLISHED" ? value : "LINK_ONLY";
}

export function serviceContexts(sections: MenuSection[], includeHidden = false): ServiceMenuContext[] {
  return sections.flatMap((section) => {
    if (!includeHidden && !section.isVisible) return [];
    return section.groups.flatMap((group) => {
      if (!includeHidden && !group.isVisible) return [];
      return group.items.flatMap((item) => {
        if (!includeHidden && !item.isVisible) return [];
        return [{ section, group, item }];
      });
    });
  });
}

export function sectionTone(section: MenuSection) {
  const label = `${section.key} ${section.label}`.toLowerCase();
  if (label.includes("trademark") || label.includes("intellectual")) return { color: "#b83652", surface: "#fff0f2" };
  if (label.includes("compliance") || label.includes("documentation") || label.includes("tax")) return { color: "#5c4aa6", surface: "#f2effb" };
  if (label.includes("tool")) return { color: "#1f6e70", surface: "#edf9f8" };
  return { color: "#2e6b4f", surface: "#edf7f0" };
}

export function profileSnapshot(row: ServiceProfileRow, detail: ServiceDetailContent | null) {
  return {
    serviceKey: row.serviceKey,
    slug: row.slug,
    menuItemId: row.menuItemId,
    titleEn: row.titleEn,
    titleBn: row.titleBn,
    descriptionEn: row.descriptionEn,
    descriptionBn: row.descriptionBn,
    detail,
  };
}

export type ServiceView = PublicService | AdminService;
export type ServiceCatalogView = PublicServiceCatalog;
export type ServiceDetailView = PublicServiceDetail;
