import { Prisma, PrismaClient } from "@prisma/client";

import { navigation, services } from "../src/components/limex/data.js";
import { defaultLandingContent } from "../src/lib/landing-defaults.js";
import { defaultMouTemplate, flattenTemplatePages } from "../src/lib/document-templates.js";
import { defaultPartnershipDeed40Templates } from "../src/lib/partnership-deed-templates.js";
import { defaultRentalDeedTemplates } from "../src/lib/rental-deed-templates.js";

const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: "hello@limex.local" },
    update: { name: "Limex Admin" },
    create: {
      email: "hello@limex.local",
      name: "Limex Admin",
    },
  });

  if (await prisma.menuSection.count() === 0) {
    const serviceIcons = new Map(services.map((service) => [service.title, service.icon]));

    for (const [sectionIndex, item] of navigation.filter((navItem) => navItem.megaGroups).entries()) {
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
                    ? { create: menuItem.children.map((child, childIndex) => ({ label: child.label, href: child.href, sortOrder: childIndex })) }
                    : undefined,
                })),
              },
            })),
          },
        },
      });
    }
  }

  await prisma.landingPage.upsert({
    where: { id: "home" },
    update: {},
    create: {
      id: "home",
      content: defaultLandingContent,
    },
  });

  for (const template of [defaultMouTemplate, ...defaultRentalDeedTemplates, ...defaultPartnershipDeed40Templates]) {
    await prisma.documentTemplate.upsert({
      where: { slug: template.slug },
      update: {},
      create: {
        slug: template.slug,
        title: template.title,
        description: template.description,
        settings: template.settings as unknown as Prisma.InputJsonValue,
        fields: template.fields as unknown as Prisma.InputJsonValue,
        blocks: flattenTemplatePages(template.pages) as unknown as Prisma.InputJsonValue,
        pages: template.pages as unknown as Prisma.InputJsonValue,
        publishedSettings: template.settings as unknown as Prisma.InputJsonValue,
        publishedFields: template.fields as unknown as Prisma.InputJsonValue,
        publishedBlocks: flattenTemplatePages(template.pages) as unknown as Prisma.InputJsonValue,
        publishedPages: template.pages as unknown as Prisma.InputJsonValue,
        status: "PUBLISHED",
        revision: 1,
        publishedRevision: 1,
        publishedAt: new Date(),
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
