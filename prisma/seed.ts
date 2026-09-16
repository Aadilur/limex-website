import { Prisma, PrismaClient } from "@prisma/client";

import { navigation, services } from "../src/components/limex/data.js";
import { defaultLandingContent } from "../src/lib/landing-defaults.js";
import {
  defaultMouTemplate,
  flattenTemplatePages,
  normalizeDocumentTemplateDraft,
} from "../src/lib/document-templates.js";
import { defaultPrivateCompanyMoaAoaTemplate } from "../src/lib/private-company-moa-aoa-template.js";
import {
  defaultPartnershipDeed40Templates,
  isPartnershipDeedTemplate,
  upgradePartnershipDeedTemplate,
} from "../src/lib/partnership-deed-templates.js";
import { defaultRentalDeedTemplates } from "../src/lib/rental-deed-templates.js";
import { syncMenuServices } from "../scripts/sync-menu-services.js";

const prisma = new PrismaClient();

async function seedServiceProfiles() {
  if ((await prisma.serviceProfile.count()) === 0) {
    await syncMenuServices(prisma, { silent: true });
  }
}

async function ensureLandingTestVideo() {
  const landing = await prisma.landingPage.findUnique({
    where: { id: "home" },
  });
  if (
    !landing ||
    !landing.content ||
    typeof landing.content !== "object" ||
    Array.isArray(landing.content)
  )
    return;

  const content = landing.content as Record<string, unknown>;
  const testimonials = content.testimonials;
  if (
    !testimonials ||
    typeof testimonials !== "object" ||
    Array.isArray(testimonials)
  )
    return;
  const testimonialContent = testimonials as Record<string, unknown>;
  const items = testimonialContent.items;
  if (!Array.isArray(items)) return;
  const defaultFirst = defaultLandingContent.testimonials.items[0];
  const first = items.find((item): item is Record<string, unknown> =>
    Boolean(
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (item as Record<string, unknown>).id === defaultFirst.id,
    ),
  );
  const hasVideo = items.some((item) =>
    Boolean(
      item &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).youtubeUrl === "string" &&
      String((item as Record<string, unknown>).youtubeUrl).trim(),
    ),
  );

  // Repair only an untouched seeded landing row. Custom landing content is never overwritten by seed.
  if (
    !first ||
    hasVideo ||
    first.title !== defaultFirst.title ||
    first.imageUrl !== defaultFirst.imageUrl
  )
    return;
  const nextItems = items.map((item) =>
    item === first ? { ...item, youtubeUrl: defaultFirst.youtubeUrl } : item,
  );
  await prisma.landingPage.update({
    where: { id: "home" },
    data: {
      content: {
        ...content,
        testimonials: { ...testimonialContent, items: nextItems },
      } as Prisma.InputJsonValue,
    },
  });
}

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: "hello@limex.local" },
    update: { name: "Limex Admin" },
    create: {
      email: "hello@limex.local",
      name: "Limex Admin",
    },
  });

  if ((await prisma.menuSection.count()) === 0) {
    const serviceIcons = new Map(
      services.map((service) => [service.title, service.icon]),
    );

    for (const [sectionIndex, item] of navigation
      .filter((navItem) => navItem.megaGroups)
      .entries()) {
      await prisma.menuSection.create({
        data: {
          key: item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          label: item.label,
          href: item.href,
          menuEyebrow: item.menuEyebrow,
          menuTitle: item.menuTitle,
          menuDescription: item.menuDescription,
          tone: item.tone ?? "green",
          sortOrder: sectionIndex,
          spotlightBadge: item.spotlight?.badge,
          spotlightTitle: item.spotlight?.title,
          spotlightDescription: item.spotlight?.description,
          spotlightCtaLabel: item.spotlight?.ctaLabel,
          spotlightCtaHref: item.spotlight?.ctaHref,
          groups: {
            create: (item.megaGroups ?? []).map((group, groupIndex) => ({
              key: group.key,
              label: group.label,
              railLabel: group.railLabel,
              description: group.description,
              sortOrder: groupIndex,
              items: {
                create: group.items.map((menuItem, itemIndex) => ({
                  label: menuItem.label,
                  description: menuItem.description,
                  href: menuItem.href,
                  marker: menuItem.marker,
                  icon: serviceIcons.get(menuItem.label) ?? "briefcase",
                  sortOrder: itemIndex,
                  links: menuItem.children?.length
                    ? {
                        create: menuItem.children.map((child, childIndex) => ({
                          label: child.label,
                          href: child.href,
                          sortOrder: childIndex,
                        })),
                      }
                    : undefined,
                })),
              },
            })),
          },
        },
      });
    }
  }

  await seedServiceProfiles();

  await prisma.landingPage.upsert({
    where: { id: "home" },
    update: {},
    create: {
      id: "home",
      content: defaultLandingContent,
    },
  });
  await ensureLandingTestVideo();

  await prisma.contactSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      revision: 1,
      whatsappNumber: "",
      whatsappDisplay: defaultLandingContent.contact.whatsapp,
      whatsappMessage: "Hello Limex, I would like to discuss a service.",
      email: defaultLandingContent.contact.email,
      phone: "",
      address: defaultLandingContent.footer.location,
      businessHours: "Sunday–Thursday · 9:00 AM–6:00 PM (Dhaka)",
    },
  });

  for (const [sortOrder, template] of [
    defaultMouTemplate,
    ...defaultRentalDeedTemplates,
    ...defaultPartnershipDeed40Templates,
    defaultPrivateCompanyMoaAoaTemplate,
  ].entries()) {
    const existing = await prisma.documentTemplate.findUnique({
      where: { slug: template.slug },
    });
    if (!existing) {
      await prisma.documentTemplate.create({
        data: {
          slug: template.slug,
          title: template.title,
          description: template.description,
          settings: template.settings as unknown as Prisma.InputJsonValue,
          fields: template.fields as unknown as Prisma.InputJsonValue,
          blocks: flattenTemplatePages(
            template.pages,
          ) as unknown as Prisma.InputJsonValue,
          pages: template.pages as unknown as Prisma.InputJsonValue,
          publishedSettings:
            template.settings as unknown as Prisma.InputJsonValue,
          publishedFields: template.fields as unknown as Prisma.InputJsonValue,
          publishedBlocks: flattenTemplatePages(
            template.pages,
          ) as unknown as Prisma.InputJsonValue,
          publishedPages: template.pages as unknown as Prisma.InputJsonValue,
          status: "PUBLISHED",
          revision: 1,
          publishedRevision: 1,
          publishedAt: new Date(),
          sortOrder,
        },
      });
      continue;
    }

    if (template.slug === "private-company-moa-aoa") {
      const current = normalizeDocumentTemplateDraft({
        title: existing.title,
        slug: existing.slug,
        description: existing.description,
        settings: existing.settings,
        fields: existing.fields,
        pages: existing.pages ?? undefined,
        blocks: existing.blocks,
      });
      if (
        current.settings.defaultFontSize === "legal" ||
        JSON.stringify(current.pages).includes('"fontSize":"legal"')
      ) {
        await prisma.documentTemplate.update({
          where: { id: existing.id },
          data: {
            settings: template.settings as unknown as Prisma.InputJsonValue,
            fields: template.fields as unknown as Prisma.InputJsonValue,
            blocks: flattenTemplatePages(
              template.pages,
            ) as unknown as Prisma.InputJsonValue,
            pages: template.pages as unknown as Prisma.InputJsonValue,
            publishedSettings:
              template.settings as unknown as Prisma.InputJsonValue,
            publishedFields:
              template.fields as unknown as Prisma.InputJsonValue,
            publishedBlocks: flattenTemplatePages(
              template.pages,
            ) as unknown as Prisma.InputJsonValue,
            publishedPages: template.pages as unknown as Prisma.InputJsonValue,
            revision: { increment: 1 },
            publishedRevision:
              existing.publishedRevision === null ? null : { increment: 1 },
          },
        });
      }
      continue;
    }

    if (!isPartnershipDeedTemplate(template)) continue;
    const current = normalizeDocumentTemplateDraft({
      title: existing.title,
      slug: existing.slug,
      description: existing.description,
      settings: existing.settings,
      fields: existing.fields,
      pages: existing.pages ?? undefined,
      blocks: existing.blocks,
    });
    const upgraded = upgradePartnershipDeedTemplate(current);
    const draftChanged =
      JSON.stringify(current.settings) !== JSON.stringify(upgraded.settings) ||
      JSON.stringify(current.fields) !== JSON.stringify(upgraded.fields) ||
      JSON.stringify(current.pages) !== JSON.stringify(upgraded.pages);
    const publishedSource = existing.publishedPages ?? existing.publishedBlocks;
    const published = normalizeDocumentTemplateDraft({
      title: existing.title,
      slug: existing.slug,
      description: existing.description,
      settings: existing.publishedSettings ?? existing.settings,
      fields: existing.publishedFields ?? existing.fields,
      pages: existing.publishedPages ?? undefined,
      blocks: publishedSource,
    });
    const upgradedPublished = upgradePartnershipDeedTemplate(published);
    const publishedChanged =
      JSON.stringify(published.settings) !==
        JSON.stringify(upgradedPublished.settings) ||
      JSON.stringify(published.fields) !==
        JSON.stringify(upgradedPublished.fields) ||
      JSON.stringify(published.pages) !==
        JSON.stringify(upgradedPublished.pages);
    if (!draftChanged && !publishedChanged) continue;
    await prisma.documentTemplate.update({
      where: { id: existing.id },
      data: {
        ...(draftChanged
          ? {
              settings: upgraded.settings as unknown as Prisma.InputJsonValue,
              fields: upgraded.fields as unknown as Prisma.InputJsonValue,
              blocks: flattenTemplatePages(
                upgraded.pages,
              ) as unknown as Prisma.InputJsonValue,
              pages: upgraded.pages as unknown as Prisma.InputJsonValue,
              revision: { increment: 1 },
            }
          : {}),
        ...(publishedChanged
          ? {
              publishedSettings:
                upgradedPublished.settings as unknown as Prisma.InputJsonValue,
              publishedFields:
                upgradedPublished.fields as unknown as Prisma.InputJsonValue,
              publishedBlocks: flattenTemplatePages(
                upgradedPublished.pages,
              ) as unknown as Prisma.InputJsonValue,
              publishedPages:
                upgradedPublished.pages as unknown as Prisma.InputJsonValue,
              publishedRevision:
                existing.publishedRevision === null ? null : { increment: 1 },
            }
          : {}),
      },
    });
  }

  console.log(`Database seeded for ${adminUser.name ?? "Limex"}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
