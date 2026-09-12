import type { MenuItem, MenuSection } from "../../admin/domain/menu.js";
import {
  destinationFromHref,
  normalizeServiceDetail,
  profileStatus,
  serviceContexts,
  sectionTone,
  slugify,
  ServiceInputError,
  ServiceNotFoundError,
  type ServiceMenuContext,
  type ServiceProfileRow,
  type ServiceRepository,
} from "../domain/service.js";
import type {
  AdminService,
  PublicService,
  PublicServiceCatalog,
  PublicServiceDetail,
  ServiceDetailContent,
  ServiceLocale,
  ServiceProfileInput,
} from "../../../../src/lib/service-types.js";

function slugFromHref(href: string) {
  const match = href.match(/^\/services\/([^/?#]+)/i);
  return match?.[1] ? slugify(match[1]) : null;
}

function contextByMenuItemId(contexts: ServiceMenuContext[], menuItemId: string | null) {
  return menuItemId ? contexts.find((context) => context.item.id === menuItemId) ?? null : null;
}

function profileByMenuItemId(profiles: ServiceProfileRow[], menuItemId: string) {
  return profiles.find((profile) => profile.menuItemId === menuItemId) ?? null;
}

function hasPublishedDetail(profile: ServiceProfileRow | null) {
  // Draft edits keep the last published snapshot online until an explicit
  // publish replaces it or an unpublish clears it.
  return Boolean(profile?.publishedDetail);
}

function serviceSlug(context: ServiceMenuContext, profile: ServiceProfileRow | null) {
  return profile?.slug ?? slugFromHref(context.item.href) ?? slugify(`${context.section.key}-${context.item.label}`);
}

function publicDestination(href: string, hasDetailPage: boolean) {
  const destination = destinationFromHref(href);
  // A draft detail page must never create a public dead link. The menu item
  // remains editable, but visitors get a safe contact path until publishing.
  if (destination.type === "DETAIL" && !hasDetailPage) return destinationFromHref("#contact");
  return destination;
}

function toPublicService(context: ServiceMenuContext, profile: ServiceProfileRow | null, locale: ServiceLocale = "en"): PublicService {
  const tone = sectionTone(context.section);
  const hasDetailPage = hasPublishedDetail(profile);
  const destination = publicDestination(context.item.href, hasDetailPage);

  return {
    id: profile?.id ?? `menu-${context.item.id}`,
    serviceKey: profile?.serviceKey ?? context.item.label,
    menuItemId: context.item.id,
    slug: serviceSlug(context, profile),
    title: locale === "bn" ? profile?.titleBn ?? context.item.label : profile?.titleEn ?? context.item.label,
    description: locale === "bn" ? profile?.descriptionBn ?? context.item.description : profile?.descriptionEn ?? context.item.description,
    category: context.section.label,
    categoryKey: slugify(context.section.key || context.section.label),
    groupLabel: context.group.label,
    icon: context.item.icon || "briefcase",
    color: tone.color,
    surface: tone.surface,
    href: destination.href,
    destination,
    children: context.item.links.filter((link) => link.isVisible).map((link) => ({
      id: link.id,
      label: link.label,
      href: link.href,
      isVisible: link.isVisible,
      sortOrder: link.sortOrder,
    })),
    status: hasDetailPage ? "PUBLISHED" : "LINK_ONLY",
    hasDetailPage,
    sortOrder: context.item.sortOrder,
    isVisible: context.item.isVisible,
    updatedAt: profile?.updatedAt.toISOString() ?? context.item.updatedAt.toISOString(),
  };
}

function toAdminService(context: ServiceMenuContext, profile: ServiceProfileRow | null): AdminService {
  const tone = sectionTone(context.section);
  const destination = destinationFromHref(context.item.href);
  const status = profile ? profileStatus(profile.status) : "LINK_ONLY";

  return {
    id: profile?.id ?? `menu-${context.item.id}`,
    profileId: profile?.id ?? null,
    serviceKey: profile?.serviceKey ?? context.item.label,
    menuItemId: context.item.id,
    slug: profile?.slug ?? serviceSlug(context, profile),
    title: context.item.label,
    description: context.item.description,
    category: context.section.label,
    categoryKey: slugify(context.section.key || context.section.label),
    groupLabel: context.group.label,
    icon: context.item.icon || "briefcase",
    color: tone.color,
    surface: tone.surface,
    href: context.item.href,
    destination,
    children: context.item.links.map((link) => ({
      id: link.id,
      label: link.label,
      href: link.href,
      isVisible: link.isVisible,
      sortOrder: link.sortOrder,
    })),
    status,
    hasDetailPage: Boolean(profile?.detail),
    sortOrder: context.item.sortOrder,
    isVisible: context.item.isVisible,
    updatedAt: profile?.updatedAt.toISOString() ?? context.item.updatedAt.toISOString(),
    revision: profile?.revision ?? 0,
    publishedRevision: profile?.publishedRevision ?? null,
    publishedAt: profile?.publishedAt?.toISOString() ?? null,
    createdAt: profile?.createdAt.toISOString() ?? null,
    detail: profile?.detail ? normalizeServiceDetail(profile.detail) : null,
    titleEn: profile?.titleEn ?? context.item.label,
    titleBn: profile?.titleBn ?? context.item.label,
    descriptionEn: profile?.descriptionEn ?? context.item.description,
    descriptionBn: profile?.descriptionBn ?? context.item.description,
  } as AdminService & { titleEn: string; titleBn: string; descriptionEn: string; descriptionBn: string };
}

function toDetachedAdminService(profile: ServiceProfileRow): AdminService {
  const detail = profile.detail ? normalizeServiceDetail(profile.detail) : null;
  const destination = destinationFromHref(`/services/${profile.slug}`);
  return {
    id: profile.id,
    profileId: profile.id,
    serviceKey: profile.serviceKey,
    menuItemId: null,
    slug: profile.slug,
    title: profile.titleEn,
    description: profile.descriptionEn,
    category: "Archived menu services",
    categoryKey: "archived-menu-services",
    groupLabel: "Detached",
    icon: "briefcase",
    color: "#5c4aa6",
    surface: "#f2effb",
    href: destination.href,
    destination,
    children: [],
    status: profileStatus(profile.status),
    hasDetailPage: Boolean(detail),
    sortOrder: 999,
    isVisible: false,
    updatedAt: profile.updatedAt.toISOString(),
    revision: profile.revision,
    publishedRevision: profile.publishedRevision,
    publishedAt: profile.publishedAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    detail,
    titleEn: profile.titleEn,
    titleBn: profile.titleBn,
    descriptionEn: profile.descriptionEn,
    descriptionBn: profile.descriptionBn,
  } as AdminService & { titleEn: string; titleBn: string; descriptionEn: string; descriptionBn: string };
}

function withProfileFields(service: AdminService, profile: ServiceProfileRow | null) {
  return {
    ...service,
    // These fields are intentionally included for the admin editor but kept
    // out of the public DTO shape.
    titleEn: profile?.titleEn ?? service.title,
    titleBn: profile?.titleBn ?? service.title,
    descriptionEn: profile?.descriptionEn ?? service.description,
    descriptionBn: profile?.descriptionBn ?? service.description,
  };
}

export class ServiceService {
  public constructor(private readonly services: ServiceRepository) {}

  public async getPublicCatalog(): Promise<PublicServiceCatalog> {
    const [sections, profiles] = await Promise.all([this.services.findMenuTree(), this.services.findProfiles()]);
    const contexts = serviceContexts(sections);
    const items = contexts.map((context) => toPublicService(context, profileByMenuItemId(profiles, context.item.id)));
    const categoryMap = new Map<string, { key: string; label: string; count: number }>();

    for (const item of items) {
      const current = categoryMap.get(item.categoryKey);
      if (current) current.count += 1;
      else categoryMap.set(item.categoryKey, { key: item.categoryKey, label: item.category, count: 1 });
    }

    return { categories: [...categoryMap.values()], items };
  }

  public async getPublicService(slug: string, locale: ServiceLocale = "en"): Promise<PublicServiceDetail | null> {
    const profile = await this.services.findProfileBySlug(slug);
    if (!profile || !hasPublishedDetail(profile)) return null;

    const sections = await this.services.findMenuTree();
    const contexts = serviceContexts(sections, true);
    const context = contextByMenuItemId(contexts, profile.menuItemId);
    const fallbackSection = sections[0] ?? {
      id: "services",
      key: "services",
      label: "Services",
      href: "/services",
      menuEyebrow: null,
      menuTitle: null,
      menuDescription: null,
      spotlightBadge: null,
      spotlightTitle: null,
      spotlightDescription: null,
      spotlightCtaLabel: null,
      spotlightCtaHref: null,
      tone: "green",
      sortOrder: 0,
      isVisible: true,
      groups: [],
    } satisfies MenuSection;
    const fallbackGroup = fallbackSection.groups[0] ?? {
      id: "services",
      key: "services",
      label: "Services",
      railLabel: "Services",
      description: "",
      sortOrder: 0,
      isVisible: true,
      items: [],
    } satisfies MenuSection["groups"][number];
    const fallbackItem: MenuItem = {
      id: profile.menuItemId ?? `profile-${profile.id}`,
      label: profile.titleEn,
      description: profile.descriptionEn,
      href: `/services/${profile.slug}`,
      marker: "",
      icon: "briefcase",
      sortOrder: 0,
      isVisible: true,
      links: [],
      updatedAt: profile.updatedAt,
    };
    const viewContext = context ?? { section: fallbackSection, group: fallbackGroup, item: fallbackItem };
    const base = toPublicService(viewContext, profile, locale);
    const detail = normalizeServiceDetail(profile.publishedDetail);
    const title = locale === "bn" ? profile.titleBn : profile.titleEn;
    const description = locale === "bn" ? profile.descriptionBn : profile.descriptionEn;

    return {
      ...base,
      title,
      description,
      href: `/services/${profile.slug}`,
      destination: destinationFromHref(`/services/${profile.slug}`),
      status: "PUBLISHED",
      hasDetailPage: true,
      detail,
    };
  }

  public async getAdminCatalog(): Promise<AdminService[]> {
    const [sections, profiles] = await Promise.all([this.services.findMenuTree(), this.services.findProfiles()]);
    const contexts = serviceContexts(sections, true);
    const knownProfileIds = new Set<string>();
    const items = contexts.map((context) => {
      const profile = profileByMenuItemId(profiles, context.item.id);
      if (profile) knownProfileIds.add(profile.id);
      return withProfileFields(toAdminService(context, profile), profile);
    });
    const detached = profiles.filter((profile) => !knownProfileIds.has(profile.id) && profile.menuItemId === null).map(toDetachedAdminService);
    return [...items, ...detached];
  }

  public async getAdminService(menuItemId: string): Promise<AdminService> {
    const [sections, profile] = await Promise.all([this.services.findMenuTree(), this.services.findProfileByMenuItemId(menuItemId)]);
    const context = serviceContexts(sections, true).find((candidate) => candidate.item.id === menuItemId);
    if (!context) throw new ServiceNotFoundError();
    return withProfileFields(toAdminService(context, profile), profile);
  }

  public async saveService(menuItemId: string, input: ServiceProfileInput, expectedRevision: number | null, username: string) {
    if (!input.slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) throw new ServiceInputError("Use a lowercase URL slug with letters, numbers and hyphens.");
    if (!input.href.trim()) throw new ServiceInputError("Choose a destination for this service.");
    await this.services.upsertProfile(menuItemId, input, expectedRevision, username);
    return this.getAdminService(menuItemId);
  }

  public async publishService(profileId: string, expectedRevision: number, username: string) {
    const saved = await this.services.publishProfile(profileId, expectedRevision, username);
    const service = await this.getAdminCatalog();
    return service.find((item) => item.profileId === saved.id) ?? toDetachedAdminService(saved);
  }

  public async unpublishService(profileId: string, expectedRevision: number, username: string) {
    const saved = await this.services.unpublishProfile(profileId, expectedRevision, username);
    const service = await this.getAdminCatalog();
    return service.find((item) => item.profileId === saved.id) ?? toDetachedAdminService(saved);
  }
}

export { toAdminService, toPublicService };
