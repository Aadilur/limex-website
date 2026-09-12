import { Prisma, PrismaClient } from "@prisma/client";

import { navigation, services } from "../src/components/limex/data.js";
import { allBlogArticles, type BlogArticle } from "../src/components/limex/blog-data.js";
import { blogBlocksToHtml, blogContentJson } from "../src/lib/blog-content.js";
import { defaultLandingContent } from "../src/lib/landing-defaults.js";
import { defaultMouTemplate, flattenTemplatePages, normalizeDocumentTemplateDraft } from "../src/lib/document-templates.js";
import { defaultPartnershipDeed40Templates, isPartnershipDeedTemplate, upgradePartnershipDeedTemplate } from "../src/lib/partnership-deed-templates.js";
import { defaultRentalDeedTemplates } from "../src/lib/rental-deed-templates.js";
import { trademarkRegistrationService } from "../src/components/limex/service-page-data.js";
import type { ServiceDetailContent } from "../src/lib/service-types.js";

const prisma = new PrismaClient();

function parseArticleDate(value: string) {
  const match = value.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (match) {
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(match[2].toLowerCase());
    const day = Number(match[1]);
    const year = Number(match[3]);
    if (month >= 0 && day >= 1 && day <= 31) return new Date(Date.UTC(year, month, day, 12));
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function articleService(article: BlogArticle) {
  const preferred = article.category === "Business setup"
    ? ["Company Formation", "Trade License"]
    : article.category === "VAT & Tax"
      ? ["VAT / BIN Registration", "Income Tax"]
      : article.category === "Brand protection"
        ? ["Trademark"]
        : [];
  return preferred
    .map((title) => services.find((service) => service.title === title))
    .filter((service): service is (typeof services)[number] => Boolean(service))
    .map((service, index) => ({ serviceKey: service.title, label: service.title, href: service.href, isPrimary: index === 0, sortOrder: index }));
}

function serviceSlug(sectionLabel: string, itemLabel: string, href: string) {
  const linkedSlug = href.match(/^\/services\/([^/?#]+)/i)?.[1];
  if (linkedSlug) return linkedSlug.toLowerCase();
  return `${sectionLabel}-${itemLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 160) || "service";
}

function detailSnapshot(service: typeof trademarkRegistrationService): ServiceDetailContent {
  return {
    ctaLabel: service.ctaLabel,
    startingPrice: service.startingPrice,
    deliveryTime: service.deliveryTime,
    serviceMode: service.serviceMode,
    mediaTitle: service.mediaTitle,
    mediaDescription: service.mediaDescription,
    mediaUrl: service.mediaUrl ?? "",
    mediaAlt: service.mediaAlt ?? "",
    overviewEyebrow: service.overviewEyebrow,
    overviewTitle: service.overviewTitle,
    overviewDescription: service.overviewDescription,
    contentLabel: service.contentLabel,
    contentTitle: service.contentTitle,
    contentDescription: service.contentDescription,
    contentLinkLabel: service.contentLinkLabel,
    contentLinkHref: service.contentLinkHref ?? "#pricing",
    benefits: service.benefits ?? [],
    steps: service.steps ?? [],
    facts: service.facts,
    pricing: service.pricing,
    faqs: service.faqs,
  };
}

async function seedServiceProfiles() {
  const sections = await prisma.menuSection.findMany({
    include: { groups: { include: { items: true } } },
  });

  for (const section of sections) {
    for (const group of section.groups) {
      for (const item of group.items) {
        const existing = await prisma.serviceProfile.findUnique({ where: { menuItemId: item.id } });
        const isTrademarkProfile = item.label === "Trademark" || item.href === `/services/${trademarkRegistrationService.slug}`;
        const detail = isTrademarkProfile ? detailSnapshot(trademarkRegistrationService) : null;
        if (existing) {
          // Repair only the original link-only trademark seed. Never replace a
          // profile that an administrator has already started editing.
          if (isTrademarkProfile && existing.status === "LINK_ONLY" && !existing.detail) {
            await prisma.serviceProfile.update({
              where: { id: existing.id },
              data: {
                slug: trademarkRegistrationService.slug,
                detail: detail as unknown as Prisma.InputJsonValue,
                publishedDetail: detail as unknown as Prisma.InputJsonValue,
                status: "PUBLISHED",
                publishedRevision: existing.revision + 1,
                publishedAt: existing.createdAt,
                revisions: { create: { version: existing.revision + 1, kind: "PUBLISHED", snapshot: { serviceKey: existing.serviceKey, slug: trademarkRegistrationService.slug, detail } as unknown as Prisma.InputJsonValue, createdBy: "seed" } },
                revision: { increment: 1 },
              },
            });
          }
          continue;
        }

        const slug = detail ? trademarkRegistrationService.slug : serviceSlug(section.label, item.label, item.href);
        await prisma.serviceProfile.create({
          data: {
            serviceKey: item.label,
            slug,
            menuItemId: item.id,
            titleEn: item.label,
            titleBn: item.label,
            descriptionEn: item.description,
            descriptionBn: item.description,
            detail: detail ? detail as unknown as Prisma.InputJsonValue : Prisma.JsonNull,
            publishedDetail: detail ? detail as unknown as Prisma.InputJsonValue : Prisma.JsonNull,
            status: detail ? "PUBLISHED" : "LINK_ONLY",
            revision: 1,
            publishedRevision: detail ? 1 : null,
            publishedAt: detail ? new Date() : null,
            revisions: {
              create: {
                version: 1,
                kind: detail ? "PUBLISHED" : "DRAFT",
                snapshot: {
                  serviceKey: item.label,
                  slug,
                  titleEn: item.label,
                  titleBn: item.label,
                  descriptionEn: item.description,
                  descriptionBn: item.description,
                  detail,
                } as unknown as Prisma.InputJsonValue,
                createdBy: "seed",
              },
            },
          },
        });
      }
    }
  }
}

async function seedBlogPosts() {
  for (const [sortOrder, article] of allBlogArticles.entries()) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: article.slug }, select: { id: true } });
    if (existing) continue;

    const bodyHtml = blogBlocksToHtml(article.blocks ?? []);
    const translations = [{
      locale: "en",
      title: article.title,
      subtitle: article.summary,
      intro: article.intro,
      atAGlance: article.atAGlance,
      bodyHtml,
      bodyJson: blogContentJson(bodyHtml),
      keywords: article.tags,
      seoTitle: `${article.title} | Limex`,
      seoDescription: article.summary,
      coverAlt: `${article.title} cover`,
      coverCaption: null,
    }];
    const relatedServices = articleService(article);
    const snapshot = {
      slug: article.slug,
      category: article.category,
      author: article.author,
      readTimeMinutes: Number(article.readTime.match(/\d+/)?.[0] ?? 6),
      coverTone: article.coverTone,
      coverNote: article.coverNote,
      coverNumber: article.coverNumber,
      coverMediaId: null,
      sidebarVideoUrl: null,
      sidebarVideoId: null,
      sidebarVideoTitle: null,
      isFeatured: sortOrder === 0,
      noIndex: false,
      canonicalUrl: null,
      translations,
      services: relatedServices,
    };
    const publishedAt = parseArticleDate(article.date);
    await prisma.blogPost.create({
      data: {
        slug: article.slug,
        publishedSlug: article.slug,
        category: article.category,
        author: article.author,
        readTimeMinutes: snapshot.readTimeMinutes,
        coverTone: article.coverTone,
        coverNote: article.coverNote,
        coverNumber: article.coverNumber,
        isFeatured: sortOrder === 0,
        noIndex: false,
        status: "PUBLISHED",
        revision: 1,
        publishedRevision: 1,
        publishedSnapshot: snapshot as unknown as Prisma.InputJsonValue,
        publishedAt,
        sortOrder,
        translations: { create: translations.map((translation) => ({ ...translation, bodyJson: translation.bodyJson as Prisma.InputJsonValue, keywords: translation.keywords as Prisma.InputJsonValue })) },
        services: { create: relatedServices },
        revisions: { create: { version: 1, kind: "PUBLISHED", snapshot: snapshot as unknown as Prisma.InputJsonValue, createdBy: "seed" } },
      },
    });
  }
}

async function ensureLandingTestVideo() {
  const landing = await prisma.landingPage.findUnique({ where: { id: "home" } });
  if (!landing || !landing.content || typeof landing.content !== "object" || Array.isArray(landing.content)) return;

  const content = landing.content as Record<string, unknown>;
  const testimonials = content.testimonials;
  if (!testimonials || typeof testimonials !== "object" || Array.isArray(testimonials)) return;
  const testimonialContent = testimonials as Record<string, unknown>;
  const items = testimonialContent.items;
  if (!Array.isArray(items)) return;
  const defaultFirst = defaultLandingContent.testimonials.items[0];
  const first = items.find((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item) && (item as Record<string, unknown>).id === defaultFirst.id));
  const hasVideo = items.some((item) => Boolean(item && typeof item === "object" && typeof (item as Record<string, unknown>).youtubeUrl === "string" && String((item as Record<string, unknown>).youtubeUrl).trim()));

  // Repair only an untouched seeded landing row. Custom landing content is never overwritten by seed.
  if (!first || hasVideo || first.title !== defaultFirst.title || first.imageUrl !== defaultFirst.imageUrl) return;
  const nextItems = items.map((item) => item === first ? { ...item, youtubeUrl: defaultFirst.youtubeUrl } : item);
  await prisma.landingPage.update({
    where: { id: "home" },
    data: { content: { ...content, testimonials: { ...testimonialContent, items: nextItems } } as Prisma.InputJsonValue },
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

  for (const [sortOrder, template] of [defaultMouTemplate, ...defaultRentalDeedTemplates, ...defaultPartnershipDeed40Templates].entries()) {
    const existing = await prisma.documentTemplate.findUnique({ where: { slug: template.slug } });
    if (!existing) {
      await prisma.documentTemplate.create({
        data: {
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
          sortOrder,
        },
      });
      continue;
    }

    if (!isPartnershipDeedTemplate(template)) continue;
    const current = normalizeDocumentTemplateDraft({ title: existing.title, slug: existing.slug, description: existing.description, settings: existing.settings, fields: existing.fields, pages: existing.pages ?? undefined, blocks: existing.blocks });
    const upgraded = upgradePartnershipDeedTemplate(current);
    const draftChanged = JSON.stringify(current.settings) !== JSON.stringify(upgraded.settings) || JSON.stringify(current.fields) !== JSON.stringify(upgraded.fields) || JSON.stringify(current.pages) !== JSON.stringify(upgraded.pages);
    const publishedSource = existing.publishedPages ?? existing.publishedBlocks;
    const published = normalizeDocumentTemplateDraft({ title: existing.title, slug: existing.slug, description: existing.description, settings: existing.publishedSettings ?? existing.settings, fields: existing.publishedFields ?? existing.fields, pages: existing.publishedPages ?? undefined, blocks: publishedSource });
    const upgradedPublished = upgradePartnershipDeedTemplate(published);
    const publishedChanged = JSON.stringify(published.settings) !== JSON.stringify(upgradedPublished.settings) || JSON.stringify(published.fields) !== JSON.stringify(upgradedPublished.fields) || JSON.stringify(published.pages) !== JSON.stringify(upgradedPublished.pages);
    if (!draftChanged && !publishedChanged) continue;
    await prisma.documentTemplate.update({
      where: { id: existing.id },
      data: {
        ...(draftChanged ? { settings: upgraded.settings as unknown as Prisma.InputJsonValue, fields: upgraded.fields as unknown as Prisma.InputJsonValue, blocks: flattenTemplatePages(upgraded.pages) as unknown as Prisma.InputJsonValue, pages: upgraded.pages as unknown as Prisma.InputJsonValue, revision: { increment: 1 } } : {}),
        ...(publishedChanged ? { publishedSettings: upgradedPublished.settings as unknown as Prisma.InputJsonValue, publishedFields: upgradedPublished.fields as unknown as Prisma.InputJsonValue, publishedBlocks: flattenTemplatePages(upgradedPublished.pages) as unknown as Prisma.InputJsonValue, publishedPages: upgradedPublished.pages as unknown as Prisma.InputJsonValue, publishedRevision: existing.publishedRevision === null ? null : { increment: 1 } } : {}),
      },
    });
  }

  await seedBlogPosts();

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
