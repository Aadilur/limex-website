import type { MenuItem, MenuSection } from "../../admin/domain/menu.js";
import {
  destinationFromHref,
  isSafeServiceHref,
  isLegacySeedProfile,
  normalizeServiceDetail,
  profileStatus,
  serviceContexts,
  serviceMenuTargets,
  sectionTone,
  slugify,
  ServiceInputError,
  ServiceNotFoundError,
  type ServiceMenuContext,
  type ServiceMenuAssignment,
  type ServiceMenuTarget,
  type ServiceProfileRow,
  type ServiceRepository,
} from "../domain/service.js";
import type {
  AdminService,
  AdminServiceMenuOption,
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

function profileByMenuLinkId(profiles: ServiceProfileRow[], menuLinkId: string) {
  return profiles.find((profile) => profile.menuLinkId === menuLinkId) ?? null;
}

function targetMatchesProfile(target: ServiceMenuTarget, profile: ServiceProfileRow) {
  return (profile.menuItemId !== null && target.menuItemId === profile.menuItemId)
    || (profile.menuLinkId !== null && target.menuLinkId === profile.menuLinkId);
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
    menuLinkId: null,
    slug: serviceSlug(context, profile),
    title: locale === "bn" ? profile?.titleBn ?? context.item.label : profile?.titleEn ?? context.item.label,
    description: locale === "bn" ? profile?.descriptionBn ?? context.item.description : profile?.descriptionEn ?? context.item.description,
    category: context.section.label,
    categoryKey: slugify(context.section.key || context.section.label),
    groupLabel: context.group.label,
    icon: profile?.icon || context.item.icon || "briefcase",
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

function toPublicServiceTarget(target: ServiceMenuTarget, profile: ServiceProfileRow, locale: ServiceLocale): PublicService {
  const base = toPublicService({ section: target.section, group: target.group, item: target.item }, profile, locale);
  const hasDetailPage = hasPublishedDetail(profile);
  const destination = publicDestination(target.href, hasDetailPage);
  return {
    ...base,
    id: profile.id,
    menuItemId: null,
    menuLinkId: target.menuLinkId,
    slug: profile.slug,
    title: locale === "bn" ? profile.titleBn : profile.titleEn,
    description: locale === "bn" ? profile.descriptionBn : profile.descriptionEn,
    icon: profile.icon || target.icon,
    href: destination.href,
    destination,
    children: [],
    sortOrder: target.sortOrder,
    isVisible: target.isVisible,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

function toAdminService(target: ServiceMenuTarget, profile: ServiceProfileRow | null): AdminService {
  const tone = sectionTone(target.section);
  const destination = destinationFromHref(target.href);
  const status = profile ? profileStatus(profile.status) : "LINK_ONLY";

  return {
    id: profile?.id ?? `menu-${target.id}`,
    profileId: profile?.id ?? null,
    serviceKey: profile?.serviceKey ?? target.label,
    menuItemId: target.menuItemId,
    menuLinkId: target.menuLinkId,
    slug: profile?.slug ?? slugFromHref(target.href) ?? slugify(`${target.section.key}-${target.label}`),
    title: profile?.titleEn ?? target.label,
    description: profile?.descriptionEn ?? target.description,
    category: target.section.label,
    categoryKey: slugify(target.section.key || target.section.label),
    groupLabel: target.group.label,
    icon: profile?.icon || target.icon || "briefcase",
    color: tone.color,
    surface: tone.surface,
    href: target.href,
    destination,
    assignedMenu: profile ? {
      id: target.id,
      targetType: target.targetType,
      label: target.label,
      sectionLabel: target.section.label,
      groupLabel: target.group.label,
      parentLabel: target.parentLabel,
      href: target.href,
      isVisible: target.isVisible,
    } : null,
    children: target.targetType === "ITEM" ? target.item.links.map((link) => ({
      id: link.id,
      label: link.label,
      href: link.href,
      isVisible: link.isVisible,
      sortOrder: link.sortOrder,
    })) : [],
    status,
    hasDetailPage: Boolean(profile?.detail),
    sortOrder: target.sortOrder,
    isVisible: target.isVisible,
    updatedAt: profile?.updatedAt.toISOString() ?? target.item.updatedAt.toISOString(),
    revision: profile?.revision ?? 0,
    publishedRevision: profile?.publishedRevision ?? null,
    publishedAt: profile?.publishedAt?.toISOString() ?? null,
    createdAt: profile?.createdAt.toISOString() ?? null,
    detail: profile?.detail ? normalizeServiceDetail(profile.detail) : null,
    titleEn: profile?.titleEn ?? target.label,
    titleBn: profile?.titleBn ?? target.label,
    descriptionEn: profile?.descriptionEn ?? target.description,
    descriptionBn: profile?.descriptionBn ?? target.description,
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
    menuLinkId: null,
    assignedMenu: null,
    slug: profile.slug,
    title: profile.titleEn,
    description: profile.descriptionEn,
    category: "Unassigned services",
    categoryKey: "unassigned-services",
    groupLabel: "Ready to assign",
    icon: profile.icon || "briefcase",
    color: "#5c4aa6",
    surface: "#f2effb",
    href: destination.href,
    destination,
    children: [],
    status: profileStatus(profile.status),
    hasDetailPage: Boolean(detail),
    sortOrder: 999,
    isVisible: true,
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
    const linkServices = serviceMenuTargets(sections).flatMap((target) => {
      if (target.targetType !== "LINK") return [];
      const profile = profileByMenuLinkId(profiles, target.id);
      return profile ? [toPublicServiceTarget(target, profile, "en")] : [];
    });
    items.push(...linkServices);
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
    const targets = serviceMenuTargets(sections, true);
    const target = targets.find((candidate) => targetMatchesProfile(candidate, profile)) ?? null;
    const context = target?.targetType === "ITEM" ? contextByMenuItemId(contexts, profile.menuItemId) : null;
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
      icon: profile.icon || "briefcase",
      sortOrder: 0,
      isVisible: true,
      links: [],
      updatedAt: profile.updatedAt,
    };
    const viewContext = context ?? { section: fallbackSection, group: fallbackGroup, item: fallbackItem };
    const base = target?.targetType === "LINK" ? toPublicServiceTarget(target, profile, locale) : toPublicService(viewContext, profile, locale);
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
    const targets = serviceMenuTargets(sections, true);
    const visibleProfiles = profiles.filter((profile) => !isLegacySeedProfile(profile));
    return visibleProfiles.map((profile) => {
      const target = targets.find((candidate) => targetMatchesProfile(candidate, profile));
      return target ? withProfileFields(toAdminService(target, profile), profile) : toDetachedAdminService(profile);
    });
  }

  public async getAdminMenuOptions(): Promise<AdminServiceMenuOption[]> {
    const [sections, profiles] = await Promise.all([this.services.findMenuTree(), this.services.findProfiles()]);
    const targets = serviceMenuTargets(sections, true);
    return targets.map((target) => {
      const profile = target.targetType === "ITEM" ? profileByMenuItemId(profiles, target.id) : profileByMenuLinkId(profiles, target.id);
      return {
        id: target.id,
        targetType: target.targetType,
        label: target.label,
        sectionLabel: target.section.label,
        groupLabel: target.group.label,
        parentLabel: target.parentLabel,
        href: target.href,
        isVisible: target.isVisible,
        pathLabel: target.parentLabel ? `${target.section.label} / ${target.group.label} / ${target.parentLabel} / ${target.label}` : `${target.section.label} / ${target.group.label} / ${target.label}`,
        icon: target.icon,
        sortOrder: target.sortOrder,
        assignedProfileId: profile && !isLegacySeedProfile(profile) ? profile.id : null,
        assignedProfileTitle: profile && !isLegacySeedProfile(profile) ? profile.titleEn : null,
      };
    });
  }

  public async getAdminService(profileId: string): Promise<AdminService> {
    const [sections, profile] = await Promise.all([this.services.findMenuTree(), this.services.findProfileById(profileId)]);
    if (!profile) throw new ServiceNotFoundError();
    const target = serviceMenuTargets(sections, true).find((candidate) => targetMatchesProfile(candidate, profile));
    return target ? withProfileFields(toAdminService(target, profile), profile) : toDetachedAdminService(profile);
  }

  private validateInput(input: ServiceProfileInput) {
    if (!input.slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) throw new ServiceInputError("Use a lowercase URL slug with letters, numbers and hyphens.");
    if (!input.href.trim() || !isSafeServiceHref(input.href)) throw new ServiceInputError("Choose a valid destination for this service.");
  }

  public async createService(input: ServiceProfileInput, username: string) {
    this.validateInput(input);
    const saved = await this.services.createProfile(input, username);
    return this.getAdminService(saved.id);
  }

  public async saveService(profileId: string, input: ServiceProfileInput, expectedRevision: number, username: string) {
    this.validateInput(input);
    const saved = await this.services.updateProfile(profileId, input, expectedRevision, username);
    return this.getAdminService(saved.id);
  }

  public async assignService(profileId: string, target: ServiceMenuAssignment | null, expectedRevision: number, username: string) {
    const saved = await this.services.assignProfile(profileId, target, expectedRevision, username);
    return this.getAdminService(saved.id);
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
