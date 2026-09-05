import { Prisma, PrismaClient } from "@prisma/client";

import { navigation, services } from "../src/components/limex/data.js";
import { defaultLandingContent } from "../src/lib/landing-defaults.js";
import { defaultMouTemplate, flattenTemplatePages } from "../src/lib/document-templates.js";

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

  await prisma.documentTemplate.upsert({
    where: { slug: defaultMouTemplate.slug },
    update: {},
    create: {
      slug: defaultMouTemplate.slug,
      title: defaultMouTemplate.title,
      description: defaultMouTemplate.description,
      settings: defaultMouTemplate.settings as unknown as Prisma.InputJsonValue,
      fields: defaultMouTemplate.fields as unknown as Prisma.InputJsonValue,
      blocks: flattenTemplatePages(defaultMouTemplate.pages) as unknown as Prisma.InputJsonValue,
      pages: defaultMouTemplate.pages as unknown as Prisma.InputJsonValue,
      publishedSettings: defaultMouTemplate.settings as unknown as Prisma.InputJsonValue,
      publishedFields: defaultMouTemplate.fields as unknown as Prisma.InputJsonValue,
      publishedBlocks: flattenTemplatePages(defaultMouTemplate.pages) as unknown as Prisma.InputJsonValue,
      publishedPages: defaultMouTemplate.pages as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
      revision: 1,
      publishedRevision: 1,
      publishedAt: new Date(),
    },
  });

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
