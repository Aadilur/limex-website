import "dotenv/config";

import { Prisma, PrismaClient } from "@prisma/client";

import { trademarkRegistrationService } from "../src/components/limex/service-page-data.js";
import { generatedServices } from "../src/lib/service-content.js";
import {
  normalizeServiceDetail,
  slugify,
} from "../server/modules/services/domain/service.js";
import type { ServiceDetailContent } from "../src/lib/service-types.js";

/**
 * Materialize the service content that already exists in the application into
 * the database-backed service workspace.
 *
 * This is intentionally a separate, idempotent command rather than part of
 * db:seed. Menu and blog data are editorial records; running the normal seed
 * must never overwrite a service that an administrator has started editing.
 * The command only upgrades untouched menu placeholders and creates missing
 * profiles for known non-tool menu targets. Tool and external destinations
 * keep their original hrefs, while contact-only service targets become real
 * service URLs.
 */

const prisma = new PrismaClient();
const ACTOR = "menu-sync-v1";
const MAX_SLUG_LENGTH = 160;

type TargetType = "ITEM" | "LINK";

type Target = {
  targetType: TargetType;
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  sectionLabel: string;
  groupLabel: string;
  parentLabel: string | null;
};

type ExistingProfile = {
  id: string;
  serviceKey: string;
  slug: string;
  menuItemId: string | null;
  menuLinkId: string | null;
  menuSnapshot: Prisma.JsonValue | null;
  icon: string;
  origin: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  detail: Prisma.JsonValue | null;
  publishedDetail: Prisma.JsonValue | null;
  status: string;
  revision: number;
  publishedRevision: number | null;
};

function asJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function identity(
  target: Pick<Target, "sectionLabel" | "groupLabel" | "parentLabel" | "label">,
) {
  return `${target.sectionLabel}|${target.groupLabel}|${target.parentLabel ?? ""}|${target.label}`;
}

function isContactOnlyHref(href: string) {
  const normalized = href.trim();
  return (
    normalized === "#" ||
    normalized === "#contact" ||
    normalized.startsWith("#contact-")
  );
}

function isUntouchedPlaceholder(profile: ExistingProfile) {
  return (
    profile.origin === "ADMIN" &&
    profile.status === "LINK_ONLY" &&
    profile.detail === null &&
    profile.publishedDetail === null &&
    profile.revision === 1 &&
    profile.publishedRevision === null
  );
}

function shouldUpdateTemplate(
  profile: ExistingProfile,
  sourceOverviewHtml?: string,
) {
  if (!sourceOverviewHtml) return false;
  const d = (profile.publishedDetail ??
    profile.detail) as ServiceDetailContent | null;
  const currentHtml = d?.overviewHtml?.trim() ?? "";
  if (!currentHtml) return true;
  if (currentHtml.includes("<a ") || currentHtml.includes("href=")) return true;
  if (currentHtml.includes("View full requirements")) return true;
  return false;
}

function detailFromLegacyPage(): ServiceDetailContent {
  const source = trademarkRegistrationService;
  return normalizeServiceDetail({
    ctaLabel: source.ctaLabel,
    startingPrice: source.startingPrice,
    deliveryTime: source.deliveryTime,
    serviceMode: source.serviceMode,
    mediaTitle: source.mediaTitle,
    mediaDescription: source.mediaDescription,
    mediaUrl: source.mediaUrl ?? "",
    mediaAlt: source.mediaAlt ?? "",
    overviewEyebrow: source.overviewEyebrow,
    overviewTitle: source.overviewTitle,
    overviewDescription: source.overviewDescription,
    overviewHtml: source.overviewHtml,
    overviewDescriptionHtml: source.overviewDescriptionHtml,
    contentLabel: source.contentLabel,
    contentTitle: source.contentTitle,
    contentDescription: source.contentDescription,
    contentDescriptionHtml: source.contentDescriptionHtml,
    contentLinkLabel: "",
    contentLinkHref: "",
    keyFactsLabel: source.keyFactsLabel,
    relatedOptionsLabel: source.relatedOptionsLabel,
    toolsEyebrow: source.toolsEyebrow,
    toolsTitle: source.toolsTitle,
    toolsDescription: source.toolsDescription,
    pricingEyebrow: source.pricingEyebrow,
    pricingTitle: source.pricingTitle,
    pricingDescription: source.pricingDescription,
    mostPopularLabel: source.mostPopularLabel,
    faqEyebrow: source.faqEyebrow,
    faqTitle: source.faqTitle,
    faqDescription: source.faqDescription,
    faqSupportLabel: source.faqSupportLabel,
    faqSupportDescription: source.faqSupportDescription,
    contactEyebrow: source.contactEyebrow,
    contactTitle: source.contactTitle,
    contactDescription: source.contactDescription,
    contactButtonLabel: source.contactButtonLabel,
    benefits: source.benefits ?? [],
    steps: source.steps ?? [],
    facts: source.facts,
    pricing: source.pricing,
    faqs: source.faqs,
    tools: source.tools ?? [],
  });
}

function slugBaseFor(target: Target, generatedSlug: string | null) {
  if (
    target.sectionLabel === "IP & Trademark" &&
    target.parentLabel === null &&
    target.label === "Trademark"
  ) {
    return trademarkRegistrationService.slug;
  }
  return (
    generatedSlug ??
    slugify(
      `${target.sectionLabel}-${target.groupLabel}-${target.parentLabel ?? ""}-${target.label}`,
    )
  );
}

function uniqueSlug(
  base: string,
  targetId: string,
  used: Map<string, string>,
  currentProfileId: string | null,
) {
  const normalized = slugify(base).slice(0, MAX_SLUG_LENGTH);
  const owner = used.get(normalized);
  if (!owner || owner === currentProfileId) {
    used.set(normalized, currentProfileId ?? targetId);
    return normalized;
  }

  const suffix = `-${targetId.slice(-8)}`;
  const withSuffix = `${normalized.slice(0, MAX_SLUG_LENGTH - suffix.length)}${suffix}`;
  used.set(withSuffix, currentProfileId ?? targetId);
  return withSuffix;
}

function buildTargets(sections: Awaited<ReturnType<typeof readMenuTree>>) {
  const targets: Target[] = [];
  for (const section of sections) {
    for (const group of section.groups) {
      for (const item of group.items) {
        targets.push({
          targetType: "ITEM",
          id: item.id,
          label: item.label,
          description: item.description,
          href: item.href,
          icon: item.icon || "briefcase",
          sectionLabel: section.label,
          groupLabel: group.label,
          parentLabel: null,
        });
        for (const link of item.links) {
          targets.push({
            targetType: "LINK",
            id: link.id,
            label: link.label,
            description: item.description,
            href: link.href,
            icon: item.icon || "briefcase",
            sectionLabel: section.label,
            groupLabel: group.label,
            parentLabel: item.label,
          });
        }
      }
    }
  }
  return targets;
}

async function readMenuTree(client: PrismaClient = prisma) {
  return client.menuSection.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
    include: {
      groups: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            where: { isVisible: true },
            orderBy: { sortOrder: "asc" },
            include: {
              links: {
                where: { isVisible: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });
}

function generatedByIdentity() {
  const map = new Map<string, (typeof generatedServices)[number]>();
  for (const entry of generatedServices) {
    map.set(
      identity({
        sectionLabel: entry.sectionLabel,
        groupLabel: entry.groupLabel,
        parentLabel: entry.parentLabel,
        label: entry.titleEn,
      }),
      entry,
    );
  }
  return map;
}

function serviceKeyFor(target: Target) {
  return `menu-${target.targetType.toLowerCase()}-${target.id}`.slice(0, 180);
}

function sourceDetail(
  target: Target,
  generated: (typeof generatedServices)[number] | null,
) {
  if (
    target.sectionLabel === "IP & Trademark" &&
    target.parentLabel === null &&
    target.label === "Trademark"
  ) {
    return detailFromLegacyPage();
  }
  return generated ? normalizeServiceDetail(generated.detailEn) : null;
}

function sourceTitle(
  target: Target,
  generated: (typeof generatedServices)[number] | null,
) {
  if (
    target.sectionLabel === "IP & Trademark" &&
    target.parentLabel === null &&
    target.label === "Trademark"
  ) {
    return {
      titleEn: trademarkRegistrationService.title,
      titleBn: "ট্রেডমার্ক নিবন্ধন",
      descriptionEn: trademarkRegistrationService.description,
      descriptionBn:
        "পরিষ্কার অনুসন্ধান, আবেদন ও পরবর্তী সহায়তায় আপনার ব্র্যান্ড সুরক্ষিত রাখুন।",
    };
  }
  return {
    titleEn: generated?.titleEn ?? target.label,
    titleBn: generated?.titleBn ?? target.label,
    descriptionEn: generated?.descriptionEn ?? target.description,
    descriptionBn: generated?.descriptionBn ?? target.description,
  };
}

function nextHref(target: Target, slug: string, hasDetail: boolean) {
  // A tool or explicitly external destination is already a useful destination
  // and belongs to the menu editor. Preserve it even when a matching article
  // or service profile exists.
  if (!isContactOnlyHref(target.href)) return target.href;
  return hasDetail ? `/services/${slug}` : target.href;
}

export type SyncMenuServicesOptions = {
  dryRun?: boolean;
  silent?: boolean;
};

export async function syncMenuServices(
  client: PrismaClient = prisma,
  options: SyncMenuServicesOptions = {},
) {
  const { dryRun = false, silent = false } = options;
  const sections = await readMenuTree(client);
  const targets = buildTargets(sections);
  const generated = generatedByIdentity();
  const profiles = await client.serviceProfile.findMany({
    select: {
      id: true,
      serviceKey: true,
      slug: true,
      menuItemId: true,
      menuLinkId: true,
      menuSnapshot: true,
      icon: true,
      origin: true,
      titleEn: true,
      titleBn: true,
      descriptionEn: true,
      descriptionBn: true,
      detail: true,
      publishedDetail: true,
      status: true,
      revision: true,
      publishedRevision: true,
    },
  });
  const byTarget = new Map<string, ExistingProfile>();
  for (const profile of profiles) {
    if (profile.menuItemId)
      byTarget.set(`ITEM:${profile.menuItemId}`, profile as ExistingProfile);
    if (profile.menuLinkId)
      byTarget.set(`LINK:${profile.menuLinkId}`, profile as ExistingProfile);
  }
  const usedSlugs = new Map(
    profiles.map((profile) => [profile.slug, profile.id]),
  );

  const plan = targets.map((target) => {
    const entry = generated.get(identity(target)) ?? null;
    const profile = byTarget.get(`${target.targetType}:${target.id}`) ?? null;
    const detail = sourceDetail(target, entry);
    const shouldMaterialize = Boolean(detail);
    const slug =
      profile?.slug ??
      uniqueSlug(
        slugBaseFor(target, entry?.slug ?? null),
        target.id,
        usedSlugs,
        null,
      );
    const href = nextHref(target, slug, shouldMaterialize);
    return { target, entry, profile, detail, shouldMaterialize, slug, href };
  });

  const materialized = plan.filter((item) => item.shouldMaterialize);
  const missingGenerated = plan.filter(
    (item) =>
      item.target.targetType === "LINK" &&
      !item.entry &&
      isContactOnlyHref(item.target.href),
  );
  if (!silent) {
    console.log(
      JSON.stringify(
        {
          visibleMenuItems: plan.filter(
            (item) => item.target.targetType === "ITEM",
          ).length,
          visibleMenuLinks: plan.filter(
            (item) => item.target.targetType === "LINK",
          ).length,
          serviceTargets: materialized.length,
          newProfiles: materialized.filter((item) => !item.profile).length,
          placeholderUpgrades: materialized.filter(
            (item) => item.profile && isUntouchedPlaceholder(item.profile),
          ).length,
          protectedExistingProfiles: materialized.filter(
            (item) => item.profile && !isUntouchedPlaceholder(item.profile),
          ).length,
          contactOnlyTargetsMovedToServices: materialized.filter((item) =>
            isContactOnlyHref(item.target.href),
          ).length,
          contactOnlyLinksWithoutSource: missingGenerated.map((item) =>
            identity(item.target),
          ),
          dryRun,
        },
        null,
        2,
      ),
    );
  }

  if (missingGenerated.length) {
    throw new Error(
      `A contact-only menu link has no service source: ${missingGenerated.map((item) => identity(item.target)).join(", ")}`,
    );
  }
  if (dryRun) return;

  const now = new Date();
  let created = 0;
  let upgraded = 0;
  let templatesUpdated = 0;
  let protectedExisting = 0;
  let menuLinksUpdated = 0;

  await client.$transaction(
    async (transaction) => {
      for (const item of materialized) {
        const { target, entry, profile, detail, slug, href } = item;
        if (!detail) continue;
        const copy = sourceTitle(target, entry);
        const menuSnapshot = profile?.menuSnapshot ?? {
          targetType: target.targetType,
          targetId: target.id,
          href: target.href,
          source: ACTOR,
        };
        const isPlaceholder = profile ? isUntouchedPlaceholder(profile) : false;

        if (!profile) {
          const createdProfile = await transaction.serviceProfile.create({
            data: {
              serviceKey: serviceKeyFor(target),
              slug,
              menuItemId: target.targetType === "ITEM" ? target.id : null,
              menuLinkId: target.targetType === "LINK" ? target.id : null,
              menuSnapshot: asJson(menuSnapshot),
              icon: target.icon,
              origin: ACTOR,
              titleEn: copy.titleEn,
              titleBn: copy.titleBn,
              descriptionEn: copy.descriptionEn,
              descriptionBn: copy.descriptionBn,
              detail: asJson(detail),
              publishedDetail: asJson(detail),
              status: "PUBLISHED",
              revision: 1,
              publishedRevision: 1,
              publishedAt: now,
              revisions: {
                create: {
                  version: 1,
                  kind: "PUBLISHED",
                  snapshot: asJson({
                    serviceKey: serviceKeyFor(target),
                    slug,
                    menuItemId: target.targetType === "ITEM" ? target.id : null,
                    menuLinkId: target.targetType === "LINK" ? target.id : null,
                    icon: target.icon,
                    titleEn: copy.titleEn,
                    titleBn: copy.titleBn,
                    descriptionEn: copy.descriptionEn,
                    descriptionBn: copy.descriptionBn,
                    detail,
                  }),
                  createdBy: ACTOR,
                },
              },
            },
          });
          byTarget.set(
            `${target.targetType}:${target.id}`,
            createdProfile as unknown as ExistingProfile,
          );
          created += 1;
        } else if (isPlaceholder) {
          const nextRevision = profile.revision + 1;
          await transaction.serviceProfile.update({
            where: { id: profile.id },
            data: {
              slug,
              menuSnapshot: asJson(menuSnapshot),
              icon: target.icon,
              origin: ACTOR,
              titleEn: copy.titleEn,
              titleBn: copy.titleBn,
              descriptionEn: copy.descriptionEn,
              descriptionBn: copy.descriptionBn,
              detail: asJson(detail),
              publishedDetail: asJson(detail),
              status: "PUBLISHED",
              revision: nextRevision,
              publishedRevision: nextRevision,
              publishedAt: now,
              revisions: {
                create: {
                  version: nextRevision,
                  kind: "PUBLISHED",
                  snapshot: asJson({
                    serviceKey: profile.serviceKey,
                    slug,
                    menuItemId: profile.menuItemId,
                    menuLinkId: profile.menuLinkId,
                    icon: target.icon,
                    titleEn: copy.titleEn,
                    titleBn: copy.titleBn,
                    descriptionEn: copy.descriptionEn,
                    descriptionBn: copy.descriptionBn,
                    detail,
                  }),
                  createdBy: ACTOR,
                },
              },
            },
          });
          upgraded += 1;
        } else {
          const needsTemplateUpdate = shouldUpdateTemplate(
            profile,
            detail.overviewHtml,
          );
          if (needsTemplateUpdate && detail.overviewHtml) {
            const currentDetail =
              (profile.detail as Record<string, unknown> | null) ?? {};
            const currentPublished =
              (profile.publishedDetail as Record<string, unknown> | null) ?? {};
            const updatedDetail = {
              ...currentDetail,
              overviewHtml: detail.overviewHtml,
              contentLinkLabel: "",
              contentLinkHref: "",
            };
            const updatedPublishedDetail = {
              ...currentPublished,
              overviewHtml: detail.overviewHtml,
              contentLinkLabel: "",
              contentLinkHref: "",
            };
            await transaction.serviceProfile.update({
              where: { id: profile.id },
              data: {
                detail: asJson(updatedDetail),
                publishedDetail: asJson(updatedPublishedDetail),
              },
            });
            templatesUpdated += 1;
          } else {
            protectedExisting += 1;
          }
        }

        if (isContactOnlyHref(target.href) && href !== target.href) {
          if (target.targetType === "ITEM") {
            await transaction.menuItem.update({
              where: { id: target.id },
              data: { href },
            });
          } else {
            await transaction.menuLink.update({
              where: { id: target.id },
              data: { href },
            });
          }
          menuLinksUpdated += 1;
        }
      }
    },
    { timeout: 30000 },
  );

  const result = {
    created,
    upgraded,
    templatesUpdated,
    protectedExisting,
    menuLinksUpdated,
  };

  if (!silent) {
    console.log(JSON.stringify(result, null, 2));
  }

  return result;
}

if (
  process.argv[1] &&
  (process.argv[1].endsWith("sync-menu-services.ts") ||
    process.argv[1].endsWith("sync-menu-services.js"))
) {
  syncMenuServices(prisma, { dryRun: process.argv.includes("--dry-run") })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
