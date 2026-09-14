import assert from "node:assert/strict";
import test from "node:test";
import {
  businessTools,
  calculateTool,
  calculatorFields,
  defaultRjscReferenceRows,
  defaultToolsSettings,
  formatCapitalReference,
  initialToolValues,
  normalizeToolsSettings,
  toolsSettingsSchema,
  validateFields,
  type ToolSlug,
  type ToolValues,
} from "../src/lib/business-tools.js";
import {
  createDocumentDraft,
  documentFields,
  documentText,
} from "../src/lib/business-documents.js";
import {
  defaultMouTemplate,
  defaultTemplateSettings,
  documentTemplateDraftSchema,
  expandTemplateBlockInstances,
  isTemplateFieldVisible,
  missingTemplateFields,
  normalizeDocumentTemplateDraft,
  resolveTemplateFieldValue,
  templateRepeaterFieldValueKey,
  type TemplateBlock,
} from "../src/lib/document-templates.js";
import { renderTemplateDocx } from "../src/lib/document-template-docx.js";
import { renderTemplatePrintHtml } from "../src/lib/document-template-print.js";
import {
  addPartnershipPartnerSlot,
  defaultPartnershipDeed40BanglaTemplate,
  defaultPartnershipDeed40EnglishTemplate,
  partnershipDeedMaxPartners,
  partnershipPartnerVisibility,
  upgradePartnershipDeedTemplate,
} from "../src/lib/partnership-deed-templates.js";
import {
  defaultRentalDeedBanglaTemplate,
  defaultRentalDeedEnglishTemplate,
} from "../src/lib/rental-deed-templates.js";
import {
  sanitizeBlogContent,
  sanitizeBlogHtml,
} from "../src/lib/blog-content.js";
import { blogRichTextClass } from "../src/components/limex/blog-rich-text.js";
import { normalizeServiceDetail } from "../server/modules/services/domain/service.js";

const settings = defaultToolsSettings;
function calculate(slug: ToolSlug, values: ToolValues) {
  return calculateTool(
    slug,
    { ...initialToolValues(calculatorFields(slug, settings)), ...values },
    settings,
  ).result;
}
test("blog HTML keeps scoped responsive guide styles", () => {
  const source =
    '<style>.blog-guide-block { width: 100%; margin: 48px 0; } .blog-guide-step { display: grid; grid-template-columns: 60px 1fr; } @media (max-width: 600px) { .blog-guide-step { gap: 12px; } }</style><div class="blog-guide-block"><section class="blog-guide-step"><div class="blog-guide-step-number">01</div><h3>Choose the right structure</h3></section></div>';
  const html = sanitizeBlogHtml(source);
  assert.match(html, /<style>\.blog-rich-text \.blog-guide-block\{/);
  assert.match(html, /class="blog-guide-block"/);
  assert.match(html, /<section class="blog-guide-step">/);
  assert.match(html, /grid-template-columns: 60px 1fr/);
  assert.match(
    html,
    /@media \(max-width: 600px\)\{\.blog-rich-text \.blog-guide-step\{gap: 12px\}\}/,
  );
  assert.doesNotMatch(html, /<script|onclick=|url\s*\(/i);
});

test("rich text separates scoped CSS and preserves editor-defined classes", () => {
  const source =
    '<style>.guide-layout { display: grid; gap: 16px; } h2 { letter-spacing: -0.02em; } @media (max-width: 600px) { .guide-layout { display: block; } }</style><div class="guide-layout custom-card"><h2>Filing guide</h2></div>';
  const content = sanitizeBlogContent(source);
  assert.match(
    content.css,
    /\.blog-rich-text \.guide-layout\{display: grid; gap: 16px\}/,
  );
  assert.match(content.css, /\.blog-rich-text h2\{letter-spacing: -0.02em\}/);
  assert.match(
    content.css,
    /@media \(max-width: 600px\)\{\.blog-rich-text \.guide-layout\{display: block\}\}/,
  );
  assert.doesNotMatch(content.html, /<style/i);
  assert.match(content.html, /class="guide-layout custom-card"/);
});
test("rich text keeps safe semantic wrappers used by pasted styled articles", () => {
  const source =
    '<style>.limex-business-guide { max-width: 980px; } .limex-business-guide .bg-hero { padding: 56px; border-left: 3px solid #698471; } .limex-business-guide .bg-table { border-collapse: collapse; } .limex-business-guide .bg-table-wrap { -webkit-overflow-scrolling: touch; } .limex-business-guide .bg-cta-link { color: #1a211c !important; } @media (max-width: 600px) { .limex-business-guide .bg-hero { padding: 20px; } }</style><article class="limex-business-guide"><header class="bg-hero"><h2>Business setup guide</h2></header><div class="bg-table-wrap"><table class="bg-table"></table></div><a class="bg-cta-link" href="#contact">Talk to our team</a></article>';
  const content = sanitizeBlogContent(source);
  assert.match(
    content.html,
    /^<article class=\"limex-business-guide\"><header class=\"bg-hero\">/,
  );
  assert.match(
    content.css,
    /\.blog-rich-text \.limex-business-guide\{max-width: 980px\}/,
  );
  assert.match(
    content.css,
    /\.blog-rich-text \.limex-business-guide \.bg-hero\{padding: 56px; border-left: 3px solid #698471\}/,
  );
  assert.match(content.css, /border-collapse: collapse/);
  assert.match(content.css, /-webkit-overflow-scrolling: touch/);
  assert.match(content.css, /color: #1a211c !important/);
  assert.match(
    content.css,
    /@media \(max-width: 600px\)\{\.blog-rich-text \.limex-business-guide \.bg-hero\{padding: 20px\}\}/,
  );
});

test("rich text preserves all CSS classes and handles full document pastes", () => {
  const fullDocument = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Document Title Never Leaks</title>
      <style>
        :root { --brand-primary: #0055ff; --card-radius: 16px; }
        body { font-family: system-ui, sans-serif; }
        .hero-banner { background-color: var(--brand-primary); }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      </style>
    </head>
    <body>
      <div class="hero-banner md:grid-cols-2 [rgba(0,0,0,0.5)] !p-6 btn_primary--large w-1/2">
        <h2 id="heading-overview" style="accent-color: #0055ff; -webkit-line-clamp: 2;">Guide Header</h2>
        <p>Guide text content</p>
      </div>
    </body>
    </html>
  `;
  const content = sanitizeBlogContent(fullDocument);

  // Document wrappers and title stripped
  assert.doesNotMatch(
    content.html,
    /<!doctype|<html|<head|<title|Document Title Never Leaks|<body/i,
  );

  // All classes preserved exactly
  assert.match(
    content.html,
    /class="hero-banner md:grid-cols-2 \[rgba\(0,0,0,0\.5\)\] !p-6 btn_primary--large w-1\/2"/,
  );
  assert.match(content.html, /id="heading-overview"/);
  assert.match(
    content.html,
    /style="accent-color: #0055ff; -webkit-line-clamp: 2"/,
  );

  // Scoped CSS rules
  assert.match(
    content.css,
    /\.blog-rich-text\{--brand-primary: #0055ff; --card-radius: 16px\}/,
  );
  assert.match(
    content.css,
    /\.blog-rich-text\{font-family: system-ui, sans-serif\}/,
  );
  assert.match(
    content.css,
    /\.blog-rich-text \.hero-banner\{background-color: var\(--brand-primary\)\}/,
  );
  assert.match(
    content.css,
    /@keyframes pulse\{0%\{opacity: 1\}50%\{opacity: 0\.5\}100%\{opacity: 1\}\}/,
  );
});

test("blog rich text styles lists via ul and ol without forcing duplicate markers on li", () => {
  // ul gets disc, ol gets decimal, li does NOT get list-disc (which causes double dots/bullets)
  assert.match(blogRichTextClass, /\[&_ul\]:list-disc/);
  assert.match(blogRichTextClass, /\[&_ol\]:list-decimal/);
  assert.doesNotMatch(blogRichTextClass, /\[&_li\]:list-disc/);
  assert.match(blogRichTextClass, /\[&_\.list-none\]:list-none/);

  // Custom list with list-style: none and custom pseudo dot shouldn't be overridden
  const customListHtml = `
    <style>
      .bg-type-list { list-style: none; margin: 0; padding: 0; }
      .bg-type-list li { position: relative; padding-left: 16px; }
      .bg-type-list li::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: #000; }
    </style>
    <ul class="bg-type-list">
      <li>First point</li>
      <li>Second point</li>
    </ul>
  `;
  const sanitized = sanitizeBlogContent(customListHtml);
  assert.match(
    sanitized.css,
    /\.blog-rich-text \.bg-type-list\{list-style: none/,
  );
  assert.match(sanitized.html, /<ul class="bg-type-list">/);
  assert.match(sanitized.html, /<li>First point<\/li>/);
});

test("blog details page orders sections sequentially starting from 01", async () => {
  const fs = await import("node:fs/promises");
  const blogSectionsContent = await fs.readFile(
    new URL("../src/components/limex/blog-sections.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    blogSectionsContent,
    /01 <span className="px-1">\/<\/span> ARTICLE CONTENT/,
  );
  assert.match(
    blogSectionsContent,
    /02 <span className="px-1">\/<\/span> MORE TO READ/,
  );
  assert.doesNotMatch(
    blogSectionsContent,
    /04 <span className="px-1">\/<\/span> ARTICLE CONTENT/,
  );
  assert.doesNotMatch(
    blogSectionsContent,
    /05 <span className="px-1">\/<\/span> MORE TO READ/,
  );
});

test("home page video reels match About Us player: clean play button and no pause button covering screen when playing", async () => {
  const fs = await import("node:fs/promises");
  const mediaSectionsContent = await fs.readFile(
    new URL("../src/components/limex/media-sections.tsx", import.meta.url),
    "utf8",
  );
  // Play button uses compact circular PlayIcon matching About Us
  assert.match(mediaSectionsContent, /<PlayIcon \/>/);
  assert.match(
    mediaSectionsContent,
    /size-\[72px\]\s+-translate-x-1\/2\s+-translate-y-1\/2\s+place-items-center\s+rounded-full/,
  );
  // No pause overlay covering screen while playing (play button is only in non-playing branch)
  assert.doesNotMatch(mediaSectionsContent, /play-overlay\.svg/);
  // Close button exists to dismiss active video
  assert.match(
    mediaSectionsContent,
    /aria-label=\{`Close \$\{reel\.title\} video`\}/,
  );
});

test("service page overview preserves custom HTML with scoped CSS and handles large layouts", async () => {
  const serviceHtml = `
    <style>
      .service-flow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .service-flow-card { background: #f7fbff; border: 1px solid #c7ddfc; border-radius: 18px; padding: 24px; }
      .service-flow-card h3 { color: #071b3d; font-size: 18px; }
      @media (max-width: 768px) { .service-flow-grid { grid-template-columns: 1fr; } }
    </style>
    <div class="service-flow-grid">
      <div class="service-flow-card">
        <h3>Step 1: Consultation</h3>
        <p>Initial assessment and document checklist.</p>
      </div>
      <div class="service-flow-card">
        <h3>Step 2: Filing</h3>
        <p>Submission to government portal.</p>
      </div>
      <div class="service-flow-card">
        <h3>Step 3: Handover</h3>
        <p>Delivery of completed certificate.</p>
      </div>
    </div>
  `;
  const sanitized = sanitizeBlogContent(serviceHtml);
  assert.match(
    sanitized.css,
    /\.blog-rich-text \.service-flow-grid\{display: grid/,
  );
  assert.match(
    sanitized.css,
    /\.blog-rich-text \.service-flow-card\{background: #f7fbff/,
  );
  assert.match(sanitized.html, /class="service-flow-grid"/);
  assert.match(sanitized.html, /<h3>Step 1: Consultation<\/h3>/);

  // Verify service routes allow up to 300,000 characters for overviewHtml
  const fs = await import("node:fs/promises");
  const routesContent = await fs.readFile(
    new URL(
      "../server/modules/services/interface/http/service.routes.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    routesContent,
    /overviewHtml:\s*z\.string\(\)\.trim\(\)\.max\(300000\)\.optional\(\)/,
  );

  // Verify service repository checks overview text without requiring legacy overviewTitle
  const repoContent = await fs.readFile(
    new URL(
      "../server/modules/services/infrastructure/prisma-service.repository.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    repoContent,
    /const hasOverview =\s*detail\.overviewHtml !== undefined/,
  );

  // Verify service page sections share blogRichTextClass for unified styling
  const sectionsContent = await fs.readFile(
    new URL(
      "../src/components/limex/service-page-sections.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(sectionsContent, /const richTextClass = blogRichTextClass;/);
});

test("all catalog services have rich Public page body overviewHtml templates with zero embedded links", async () => {
  const { generatedServices } = await import("../src/lib/service-content.js");
  const { trademarkRegistrationService } =
    await import("../src/components/limex/service-page-data.js");
  const fs = await import("node:fs/promises");

  assert.ok(
    generatedServices.length >= 70,
    "Expected at least 70 generated services",
  );

  for (const service of generatedServices) {
    // Both English and Bengali overviewHtml must be populated
    assert.ok(
      service.detailEn.overviewHtml &&
        service.detailEn.overviewHtml.trim().length > 100,
      `Service ${service.titleEn} missing rich overviewHtml in English`,
    );
    assert.ok(
      service.detailBn.overviewHtml &&
        service.detailBn.overviewHtml.trim().length > 100,
      `Service ${service.titleEn} missing rich overviewHtml in Bengali`,
    );

    // Absolutely zero links in Public page body
    assert.ok(
      !service.detailEn.overviewHtml.includes("<a ") &&
        !service.detailEn.overviewHtml.includes("href="),
      `Service ${service.titleEn} (EN) contains unexpected links in overviewHtml`,
    );
    assert.ok(
      !service.detailBn.overviewHtml.includes("<a ") &&
        !service.detailBn.overviewHtml.includes("href="),
      `Service ${service.titleEn} (BN) contains unexpected links in overviewHtml`,
    );

    // Semantic structure must be present
    assert.match(service.detailEn.overviewHtml, /<h2>[\s\S]*?<\/h2>/);
    assert.match(service.detailEn.overviewHtml, /<h3>[\s\S]*?<\/h3>/);
    assert.match(service.detailEn.overviewHtml, /<ul>[\s\S]*?<\/ul>/);
    assert.match(service.detailEn.overviewHtml, /<ol>[\s\S]*?<\/ol>/);
  }

  // Verify trademarkRegistrationService
  assert.ok(
    trademarkRegistrationService.overviewHtml &&
      trademarkRegistrationService.overviewHtml.trim().length > 500,
    "trademarkRegistrationService missing rich overviewHtml",
  );
  assert.ok(
    !trademarkRegistrationService.overviewHtml.includes("<a ") &&
      !trademarkRegistrationService.overviewHtml.includes("href="),
    "trademarkRegistrationService contains unexpected links in overviewHtml",
  );

  // Verify legacyOverviewHtml in service-pages-module.tsx does not generate links
  const adminContent = await fs.readFile(
    new URL(
      "../src/components/admin/service-pages-module.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.ok(
    !adminContent.includes('`<p><a href="${href}">'),
    "service-pages-module.tsx should not generate links in legacyOverviewHtml",
  );

  // Verify service-page-sections.tsx does not render a link button in the overview section
  const sectionsSource = await fs.readFile(
    new URL(
      "../src/components/limex/service-page-sections.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.ok(
    !sectionsSource.includes("{service.contentLinkLabel ? ("),
    "service-page-sections.tsx should not render a link button in ServiceOverviewSection",
  );
});

test("catalogue contains seven distinct calculators and six builders", () => {
  assert.equal(
    businessTools.filter((tool) => tool.group === "calculator").length,
    7,
  );
  assert.equal(
    businessTools.filter((tool) => tool.group === "builder").length,
    6,
  );
  assert.equal(new Set(businessTools.map((tool) => tool.slug)).size, 13);
});
test("document templates keep a safe service CTA default and reject external service links", () => {
  const legacy = normalizeDocumentTemplateDraft({
    ...defaultMouTemplate,
    settings: { ...defaultMouTemplate.settings, serviceCta: undefined },
  });
  assert.equal(legacy.settings.serviceCta.enabled, false);
  assert.equal(legacy.settings.serviceCta.href, "");
  assert.throws(() =>
    documentTemplateDraftSchema.parse({
      ...defaultMouTemplate,
      settings: {
        ...defaultMouTemplate.settings,
        serviceCta: {
          ...defaultMouTemplate.settings.serviceCta,
          enabled: true,
          href: "https://example.com",
        },
      },
    }),
  );
});
test("document templates can save an intentionally empty page", () => {
  const emptyPage = documentTemplateDraftSchema.parse({
    ...defaultMouTemplate,
    pages: [
      { id: "empty-page", title: "Blank page", settings: {}, blocks: [] },
    ],
  });
  assert.equal(emptyPage.pages[0]?.blocks.length, 0);

  const legacyEmpty = normalizeDocumentTemplateDraft({
    title: defaultMouTemplate.title,
    slug: "empty-legacy-template",
    description: defaultMouTemplate.description,
    settings: defaultMouTemplate.settings,
    fields: defaultMouTemplate.fields,
    blocks: [],
  });
  assert.equal(legacyEmpty.pages.length, 1);
  assert.equal(legacyEmpty.pages[0]?.blocks.length, 0);
});
test("document templates keep a valid admin-selected icon", () => {
  const selected = documentTemplateDraftSchema.parse({
    ...defaultMouTemplate,
    settings: { ...defaultMouTemplate.settings, icon: "building" },
  });
  assert.equal(selected.settings.icon, "building");

  const legacy = documentTemplateDraftSchema.parse({
    ...defaultMouTemplate,
    settings: { ...defaultMouTemplate.settings, icon: undefined },
  });
  assert.equal(legacy.settings.icon, "contract");
  assert.throws(() =>
    documentTemplateDraftSchema.parse({
      ...defaultMouTemplate,
      settings: { ...defaultMouTemplate.settings, icon: "not-an-icon" },
    }),
  );
});
test("rental deed templates preserve the supplied long-sheet ratio and separate languages", () => {
  for (const template of [
    defaultRentalDeedEnglishTemplate,
    defaultRentalDeedBanglaTemplate,
  ]) {
    const parsed = documentTemplateDraftSchema.parse(template);
    assert.equal(parsed.settings.paperSize, "DEED");
    assert.equal(parsed.pages.length, 3);
    assert.equal(
      parsed.pages[0]?.blocks.some(
        (block) =>
          block.type === "paragraph" &&
          block.text.includes("{{landlord_details}}"),
      ),
      true,
    );
  }
  assert.match(defaultRentalDeedBanglaTemplate.title, /[\u0980-\u09ff]/);
  assert.equal(defaultRentalDeedEnglishTemplate.slug, "office-rental-deed-en");
  assert.equal(defaultRentalDeedBanglaTemplate.slug, "office-rental-deed-bn");
});
test("repeatable groups expand generic item fields and validate only active items", () => {
  const repeater = {
    id: "members-group",
    key: "members",
    label: "Members",
    itemLabel: "Member",
    description: "Add each member once.",
    countFieldKey: "member_count",
    minItems: 1,
    maxItems: 4,
    fields: [
      {
        id: "member-name",
        key: "name",
        label: "Name",
        type: "text" as const,
        required: true,
        placeholder: "Full name",
        options: [],
      },
      {
        id: "member-kind",
        key: "kind",
        label: "Type",
        type: "select" as const,
        required: true,
        placeholder: "Choose a type",
        options: [
          { value: "person", label: "Person" },
          { value: "company", label: "Company" },
        ],
      },
      {
        id: "member-note",
        key: "note",
        label: "Company note",
        type: "textarea" as const,
        required: true,
        placeholder: "Registration details",
        options: [],
        visibleWhen: { fieldKey: "kind", values: ["company"] },
      },
    ],
  };
  const template = documentTemplateDraftSchema.parse({
    title: "Member roster",
    slug: "member-roster",
    description: "A reusable member list.",
    settings: { ...defaultTemplateSettings, repeaters: [repeater] },
    fields: [
      {
        id: "member-count",
        key: "member_count",
        label: "Number of members",
        type: "number",
        required: true,
        placeholder: "2",
        options: [],
        defaultValue: "2",
      },
    ],
    pages: [
      {
        id: "member-page",
        title: "Members",
        settings: {},
        blocks: [
          {
            id: "member-row",
            type: "paragraph",
            text: "Member {{item_number}} — {{name}} ({{kind}}) {{note}}",
            align: "left",
            bold: false,
            italic: false,
            fontSize: "body",
            repeat: { repeaterKey: "members" },
          },
        ],
      },
    ],
  });
  const values = {
    member_count: "2",
    "members.1.name": "A",
    "members.1.kind": "person",
    "members.2.name": "B",
    "members.2.kind": "company",
  };
  const group = template.settings.repeaters[0]!;
  const row = template.pages[0]!.blocks[0]!;
  const instances = expandTemplateBlockInstances(template, row, values);
  assert.equal(instances.length, 2);
  assert.equal(instances[0]?.values.name, "A");
  assert.equal(instances[1]?.values.item_number, "2");
  assert.deepEqual(
    missingTemplateFields(
      template.fields,
      values,
      template.settings.repeaters,
    ).map((field) => field.key),
    ["members.2.note"],
  );
  assert.equal(
    templateRepeaterFieldValueKey(group, 2, group.fields[0]!),
    "members.2.name",
  );
  const html = renderTemplatePrintHtml(template, values);
  assert.equal(resolveTemplateFieldValue(group.fields[1], "person"), "Person");
  assert.equal(html.includes("Member 1 — A (Person)"), true);
  assert.equal(html.includes("Member 2 — B (Company)"), true);
  assert.equal(html.includes("[Company note]"), false);
});
test("40-page partnership deed templates preserve the source structure and separate languages", () => {
  for (const template of [
    defaultPartnershipDeed40EnglishTemplate,
    defaultPartnershipDeed40BanglaTemplate,
  ]) {
    const parsed = documentTemplateDraftSchema.parse(template);
    assert.equal(parsed.settings.paperSize, "LEGAL");
    assert.equal(parsed.settings.marginTop + parsed.settings.stampGap, 112);
    assert.equal(parsed.settings.marginRight, 25);
    assert.equal(parsed.settings.marginBottom, 38);
    assert.equal(parsed.settings.marginLeft, 25);
    assert.equal(parsed.settings.fontScale, 100);
    assert.equal(parsed.pages.length, 40);
    assert.equal(parsed.pages[39]?.settings.stampGap, 0);
    assert.equal(parsed.pages[39]?.settings.defaultFontSize, "body");
    assert.equal(parsed.fields.length, 68);
    assert.equal(
      parsed.fields.find((field) => field.key === "partner_count")
        ?.defaultValue,
      "2",
    );
    assert.deepEqual(
      parsed.fields
        .find((field) => field.key === "partner_count")
        ?.options.map((option) => option.value),
      ["2", "3", "4", "5", "6", "7", "8"],
    );
    const partners = parsed.settings.repeaters.find(
      (repeater) => repeater.key === "partners",
    );
    assert.ok(partners);
    assert.equal(partners.countFieldKey, "partner_count");
    assert.equal(partners.minItems, 2);
    assert.equal(partners.maxItems, 8);
    assert.deepEqual(
      partners.fields.map((field) => field.key),
      ["name", "details", "role", "capital", "capital_words", "profit_share"],
    );
    assert.equal(
      templateRepeaterFieldValueKey(partners, 8, partners.fields[0]!),
      "partner_8_name",
    );
    assert.equal(
      parsed.pages[10]?.blocks.some(
        (block) =>
          block.type === "paragraph" &&
          block.repeat?.repeaterKey === "partners" &&
          block.text.includes("{{capital}}"),
      ),
      true,
    );
    assert.equal(
      parsed.pages[39]?.blocks.filter((block) => block.type === "signature")
        .length,
      4,
    );
    assert.deepEqual(
      parsed.pages.flatMap((page, index) =>
        page.blocks.some((block) => block.repeat?.repeaterKey === "partners")
          ? [index + 1]
          : [],
      ),
      [2, 3, 11, 23, 40],
    );
    assert.equal(
      parsed.pages.some((page) =>
        page.blocks.some((block) =>
          JSON.stringify(block).includes("partner_8_name"),
        ),
      ),
      false,
    );
  }
  assert.match(defaultPartnershipDeed40BanglaTemplate.title, /[\u0980-\u09ff]/);
  assert.equal(
    defaultPartnershipDeed40EnglishTemplate.slug,
    "partnership-deed-40-en",
  );
  assert.equal(
    defaultPartnershipDeed40BanglaTemplate.slug,
    "partnership-deed-40-bn",
  );
});
test("partnership deed partner slots are conditional, extendable to eight and keep capital optional", () => {
  const template = defaultPartnershipDeed40EnglishTemplate;
  const values = { partner_count: "2" };
  assert.equal(
    isTemplateFieldVisible(
      template.fields.find((field) => field.key === "partner_1_name")!,
      values,
    ),
    true,
  );
  assert.equal(
    isTemplateFieldVisible(
      template.fields.find((field) => field.key === "partner_2_name")!,
      values,
    ),
    true,
  );
  assert.equal(
    isTemplateFieldVisible(
      template.fields.find((field) => field.key === "partner_3_name")!,
      values,
    ),
    false,
  );
  assert.equal(
    isTemplateFieldVisible(
      template.fields.find((field) => field.key === "partner_4_name")!,
      values,
    ),
    false,
  );
  const missing = missingTemplateFields(
    template.fields,
    values,
    template.settings.repeaters,
  ).map((field) => field.key);
  assert.equal(missing.includes("partner_1_profit_share"), true);
  assert.equal(missing.includes("partner_1_capital"), false);
  assert.equal(missing.includes("partner_1_capital_words"), false);
  assert.equal(
    missing.some((key) => key.startsWith("partner_3_")),
    false,
  );
  assert.equal(
    template.fields.find((field) => field.key === "initial_capital")?.required,
    false,
  );
  assert.equal(
    template.fields.find((field) => field.key === "partner_1_profit_share")
      ?.required,
    true,
  );

  const expanded = Array.from({ length: 4 }).reduce(
    (current) => addPartnershipPartnerSlot(current),
    template,
  );
  const parsed = documentTemplateDraftSchema.parse(expanded);
  assert.equal(partnershipDeedMaxPartners, 8);
  assert.equal(
    parsed.fields.some((field) => field.key === "partner_8_name"),
    true,
  );
  assert.equal(
    parsed.fields.some((field) => field.key === "partner_9_name"),
    false,
  );
  assert.equal(
    parsed.fields
      .find((field) => field.key === "partner_count")
      ?.options.some((option) => option.value === "8"),
    true,
  );
  const partnerRepeater = parsed.settings.repeaters.find(
    (repeater) => repeater.key === "partners",
  );
  assert.ok(partnerRepeater);
  const partnerSignature = parsed.pages[39]?.blocks.find(
    (block) =>
      block.type === "signature" && block.repeat?.repeaterKey === "partners",
  );
  assert.ok(partnerSignature);
  assert.equal(
    expandTemplateBlockInstances(parsed, partnerSignature, {
      partner_count: "8",
    }).length,
    8,
  );
  const finalSignatures =
    parsed.pages[39]?.blocks.filter((block) => block.type === "signature") ??
    [];
  assert.equal(
    finalSignatures.filter((block) => block.repeat?.repeaterKey === "partners")
      .length,
    1,
  );
  assert.equal(
    finalSignatures.filter((block) =>
      JSON.stringify(block).includes("witness_"),
    ).length,
    3,
  );
});
test("partnership deed repair removes legacy misplaced partner blocks", () => {
  const corrupted = structuredClone(defaultPartnershipDeed40EnglishTemplate);
  const misplaced: TemplateBlock = {
    id: "partnership-partner-5-particulars",
    type: "paragraph",
    text: "Partner 5 — {{partner_5_name}}\n{{partner_5_details}}\nDesignation: {{partner_5_role}}",
    align: "left",
    bold: false,
    italic: false,
    fontSize: "body",
    visibleWhen: partnershipPartnerVisibility(5),
  };
  corrupted.pages[29]?.blocks.push(misplaced);
  const repaired = upgradePartnershipDeedTemplate(corrupted);
  assert.equal(
    repaired.pages[29]?.blocks.some((block) => block.id === misplaced.id),
    false,
  );
  assert.equal(
    repaired.pages[2]?.blocks.some(
      (block) =>
        block.repeat?.repeaterKey === "partners" &&
        block.type === "paragraph" &&
        block.text.includes("{{details}}"),
    ),
    true,
  );
});
test("partnership deed print output removes inactive partner rows and signatures", () => {
  const values = Object.fromEntries(
    defaultPartnershipDeed40EnglishTemplate.fields.map((field) => [
      field.key,
      field.key === "partner_count"
        ? "2"
        : field.key.match(/^partner_([1-8])_name$/)?.[1]
          ? `Partner ${field.key.match(/^partner_([1-8])_name$/)?.[1]}`
          : "Sample",
    ]),
  );
  const html = renderTemplatePrintHtml(
    defaultPartnershipDeed40EnglishTemplate,
    values,
  );
  assert.equal(html.split('class="template-page"').length - 1, 40);
  for (const number of [3, 4, 5, 6, 7, 8])
    assert.equal(html.includes(`Partner ${number}`), false);
  assert.equal(html.includes("Partner 1"), true);
});
test("document templates export as editable DOCX files", async () => {
  const values = Object.fromEntries(
    defaultMouTemplate.fields.map((field) => [
      field.key,
      field.defaultValue ?? "Sample",
    ]),
  );
  const blob = await renderTemplateDocx(defaultMouTemplate, values);
  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.ok(blob.size > 1000);
  assert.equal(bytes.subarray(0, 2).toString("hex"), "504b");
});
for (const amount of [0, 0.01, 1, 99.99, 1000, 999999.99])
  for (const rate of [0, 5, 7.5, 15, 100])
    test(`VAT reconciles amount=${amount} rate=${rate}`, () => {
      for (const mode of ["Including VAT", "Excluding VAT"]) {
        const result = calculate("vat", {
          amount: String(amount),
          rate: String(rate),
          mode,
        });
        assert.ok(
          Math.abs(
            result.rows.reduce((sum, row) => sum + row.amount!, 0) -
              result.total,
          ) < 0.001,
        );
        if (mode === "Including VAT") assert.equal(result.total, amount);
      }
    });
test("VAT rejects negative, infinite and out-of-range amounts/rates", () => {
  for (const amount of ["-1", "NaN", "Infinity", "1e20"])
    assert.throws(() => calculate("vat", { amount }));
  assert.throws(() => calculate("vat", { amount: "100", rate: "101" }));
});
for (const [category, threshold] of Object.entries(
  settings.taxYears[0].thresholds,
))
  test(`tax threshold and minimum: ${category}`, () => {
    const input = {
      category,
      incomeType: "Already-computed taxable income",
      income: String(threshold),
    };
    assert.equal(calculate("income-tax", input).total, 0);
    assert.equal(
      calculate("income-tax", { ...input, income: String(threshold + 1) })
        .total,
      5000,
    );
    assert.equal(
      calculate("income-tax", {
        ...input,
        income: String(threshold + 1),
        newTaxpayer: "Yes",
      }).total,
      1000,
    );
  });
test("slabs apply progressively at exact boundaries", () => {
  for (const [income, expected] of [
    [700000, 30000],
    [1100000, 90000],
    [1600000, 190000],
    [3600000, 690000],
    [5000000, 1110000],
  ])
    assert.equal(
      calculate("income-tax", {
        income: String(income),
        incomeType: "Already-computed taxable income",
      }).total,
      expected,
    );
});
test("income tax uses the current NBR assessment-year settings", () => {
  const year = settings.taxYears[0];
  assert.equal(year.year, "2026-27");
  assert.deepEqual(year.thresholds, {
    general: 400000,
    female: 450000,
    senior: 450000,
    disability: 525000,
    thirdGender: 525000,
    freedom: 550000,
    july: 550000,
  });
  assert.deepEqual(year.bands, [
    { width: 300000, rate: 10 },
    { width: 400000, rate: 15 },
    { width: 500000, rate: 20 },
    { width: 2000000, rate: 25 },
    { width: null, rate: 30 },
  ]);
  assert.equal(year.salaryExemptionCap, 500000);
  assert.equal(year.rebateInvestmentRate, 10);
  assert.equal(year.rebateIncomeRate, 3);
  assert.equal(year.rebateCap, 750000);
});
test("employment exemption is the lower of one-third of gross salary and the published cap", () => {
  const oneThird = calculate("income-tax", { income: "1200000" });
  assert.equal(
    oneThird.rows.find((row) => row.label === "Employment income exemption")
      ?.amount,
    400000,
  );
  const capped = calculate("income-tax", { income: "1800000" });
  assert.equal(
    capped.rows.find((row) => row.label === "Employment income exemption")
      ?.amount,
    500000,
  );
  const alreadyComputed = calculate("income-tax", {
    income: "1800000",
    incomeType: "Already-computed taxable income",
  });
  assert.equal(
    alreadyComputed.rows.find(
      (row) => row.label === "Employment income exemption",
    )?.amount,
    0,
  );
});
test("private employment income can be combined with other taxable income", () => {
  const result = calculate("income-tax", {
    income: "1200000",
    otherTaxableIncome: "100000",
  });
  assert.equal(
    result.rows.find((row) => row.label === "Other taxable income")?.amount,
    100000,
  );
  assert.equal(
    result.rows.find((row) => row.label === "Income after exemptions")?.amount,
    900000,
  );
});
test("salary exemption, investment rebate, credits and minimum apply in order", () => {
  assert.equal(
    calculate("income-tax", {
      income: "1200000",
      investment: "150000",
      credits: "10000",
    }).total,
    20000,
  );
  const result = calculate("income-tax", {
    income: "1200000",
    investment: "150000",
    credits: "60000",
  });
  assert.equal(result.total, 0);
  assert.equal(result.rows.at(-1)?.amount, 30000);
  assert.equal(
    calculate("income-tax", {
      income: "500000",
      incomeType: "Already-computed taxable income",
      children: "2",
    }).total,
    0,
  );
  assert.throws(() =>
    calculate("income-tax", { income: "500000", children: "1.5" }),
  );
});
test("tax investment detail fields replace the manual total", () => {
  const totalInput = calculate("income-tax", {
    income: "1200000",
    investment: "150000",
  });
  const detailedInput = calculate("income-tax", {
    income: "1200000",
    investment: "1",
    dps: "100000",
    fund: "50000",
  });
  assert.equal(detailedInput.total, totalInput.total);
  assert.equal(
    detailedInput.rows.find(
      (row) => row.label === "Qualifying investment considered",
    )?.amount,
    150000,
  );
});
test("trade licence uses the DNCC/DSCC schedule and itemises related charges", () => {
  const fields = calculatorFields("trade-license", settings);
  assert.ok(fields.find((field) => field.key === "signboardType"));
  assert.ok(fields.find((field) => field.key === "advertisementType"));
  const dncc = calculate("trade-license", {
    authority: "Dhaka North City Corporation",
    businessType: "restaurant-non-ac",
    signboardType: "Business identification signboard",
    signboardArea: "6",
    sourceTax: "0",
  });
  assert.equal(
    dncc.rows.find((row) => row.label.startsWith("Trade licence / renewal fee"))
      ?.amount,
    1000,
  );
  assert.equal(
    dncc.rows.find((row) => row.label.startsWith("Signboard tax"))?.amount,
    480,
  );
  assert.equal(dncc.rows.find((row) => row.label === "VAT · 15%")?.amount, 222);
  assert.equal(
    dncc.rows.find((row) => row.label === "Application form")?.amount,
    0,
  );
  assert.equal(
    dncc.rows.find((row) => row.label === "Licence book")?.amount,
    270,
  );
  assert.equal(
    dncc.rows.find((row) => row.label === "Other authority fee")?.amount,
    500,
  );
  const dscc = calculate("trade-license", {
    authority: "Dhaka South City Corporation",
    businessType: "restaurant-non-ac",
    sourceTax: "0",
  });
  assert.equal(
    dscc.rows.find((row) => row.label === "Application form")?.amount,
    50,
  );
  assert.equal(dscc.sourceUrl, settings.tradeLicense.dscc.sourceUrl);
});
test("trade licence handles company capital bands, advertising and late renewal", () => {
  const company = calculate("trade-license", {
    structure: "Private limited company",
    paidUpCapital: "10000000",
    sourceTax: "0",
  });
  assert.equal(
    company.rows.find((row) =>
      row.label.startsWith("Trade licence / renewal fee"),
    )?.amount,
    7500,
  );
  const advertised = calculate("trade-license", {
    businessType: "restaurant-non-ac",
    advertisementType: "festoon-banner",
    advertisementUnits: "2",
    sourceTax: "0",
  });
  assert.equal(
    advertised.rows.find((row) => row.label.startsWith("Advertisement tax"))
      ?.amount,
    1000,
  );
  const renewal = calculate("trade-license", {
    application: "Renewal",
    businessType: "restaurant-non-ac",
    licenseYears: "1",
    lateMonths: "1",
    sourceTax: "0",
  });
  assert.equal(
    renewal.rows.find((row) => row.label.startsWith("Late-renewal surcharge"))
      ?.amount,
    100,
  );
});
test("unknown trade licence fees remain pending and zero is distinct for other authorities", () => {
  const result = calculate("trade-license", {
    authority: "Other city corporation",
    governmentFee: "0",
    signboard: "",
    extras: "0",
  });
  assert.equal(result.rows[0].amount, 0);
  assert.equal(result.rows[1].amount, null);
  assert.equal(result.rows[2].amount, null);
  assert.equal(result.rows[3].amount, 0);
  assert.equal(result.complete, false);
});
test("trademark de-duplicates classes and rejects invalid classes", () => {
  const result = calculate("trademark", {
    brandName: "Limex",
    classes: "9,35,9",
    governmentFee: "5000",
  });
  assert.equal(result.rows[0].amount, 10000);
  for (const classes of ["0", "46", "1.5", "9,not-a-class"])
    assert.throws(() =>
      calculate("trademark", { brandName: "Limex", classes }),
    );
});
test("trademark uses the configured stage schedule and supports filing-level fees", () => {
  const scheduled = calculate("trademark", {
    brandName: "Limex",
    stage: "Application",
    classes: "9,35",
    extras: "0",
  });
  assert.match(scheduled.rows[0]?.label ?? "", /TM-1/);
  assert.equal(scheduled.rows[0]?.amount, 10000);
  assert.equal(scheduled.rows[2]?.amount, 0);
  assert.equal(scheduled.complete, false);

  const custom = structuredClone(settings);
  custom.fees.trademark.serviceFee = 1000;
  custom.fees.trademark.stages = custom.fees.trademark.stages.map((stage) =>
    stage.key === "registration"
      ? { ...stage, governmentFee: 20000, basis: "flat" }
      : stage,
  );
  const registered = calculateTool(
    "trademark",
    {
      ...initialToolValues(calculatorFields("trademark", custom)),
      brandName: "Limex",
      stage: "Registration",
      classes: "9,35",
      extras: "0",
    },
    custom,
  ).result;
  assert.equal(registered.rows[0]?.amount, 20000);
  assert.equal(registered.rows[1]?.amount, 2000);
  assert.equal(registered.total, 22000);
  assert.equal(registered.complete, true);

  const legacy = structuredClone(settings);
  delete (legacy.fees.trademark as Partial<typeof legacy.fees.trademark>)
    .stages;
  legacy.fees.trademark.governmentFee = 1234;
  legacy.fees.trademark.effectiveDate = null;
  const migrated = normalizeToolsSettings(legacy);
  assert.equal(
    migrated.fees.trademark.stages.every(
      (stage) => stage.governmentFee === 1234,
    ),
    true,
  );
  assert.equal(migrated.fees.trademark.effectiveDate, "2021-12-28");
});
test("company capital, IRC ceiling and unsupported inputs are validated", () => {
  assert.throws(() => calculate("limited-company", { capital: "0" }));
  const rjscFields = calculatorFields("rjsc", settings);
  const capitalField = rjscFields.find((field) => field.key === "capital");
  assert.equal(capitalField?.label, "Authorised capital (৳)");
  assert.equal(capitalField?.defaultValue, "1000000");
  assert.equal(capitalField?.required, true);
  assert.doesNotThrow(() =>
    calculate("rjsc", { serviceType: "Name clearance", capital: "" }),
  );
  assert.throws(() =>
    calculate("rjsc", { serviceType: "Capital increase", capital: "" }),
  );
  assert.throws(() => calculate("irc-erc", { certificate: "Commercial IRC" }));
  assert.doesNotThrow(() =>
    calculate("irc-erc", { certificate: "ERC", businessType: "Export only" }),
  );
  assert.throws(() => calculateTool("mou", {}, settings));
});
test("company setup applies the published RJSC schedule", () => {
  const result = calculate("limited-company", {
    capital: "1000000",
    nameClearance: "Need name clearance",
    nameOptions: "1",
  });
  assert.equal(result.total, 14700);
  assert.equal(
    result.rows.find((row) => row.label === "RJSC filing fee · 6 documents")
      ?.amount,
    1200,
  );
  assert.equal(
    result.rows.find((row) => row.label === "Articles of Association stamp")
      ?.amount,
    2000,
  );
  assert.equal(
    result.rows.find((row) => row.label === "Authorised share capital fee")
      ?.amount,
    0,
  );
  assert.equal(
    result.rows.find((row) => row.label.startsWith("Name clearance"))?.amount,
    500,
  );
  const nextBand = calculate("limited-company", {
    capital: "1000001",
    nameClearance: "Already have name clearance",
  });
  assert.equal(
    nextBand.rows.find((row) => row.label === "Authorised share capital fee")
      ?.amount,
    80,
  );
  assert.equal(
    nextBand.rows.some((row) => row.label.startsWith("Name clearance")),
    false,
  );
  assert.equal(
    nextBand.rows.find((row) => row.label === "Articles of Association stamp")
      ?.amount,
    4000,
  );
  assert.equal(
    calculate("limited-company", {
      capital: "5000000",
      nameClearance: "Already have name clearance",
    }).rows.find((row) => row.label === "Authorised share capital fee")?.amount,
    3200,
  );
  assert.equal(
    calculate("limited-company", {
      capital: "5000001",
      nameClearance: "Already have name clearance",
    }).rows.find((row) => row.label === "Authorised share capital fee")?.amount,
    3330,
  );
  const rjscRegistration = calculate("rjsc", {
    entity: "Private limited company",
    serviceType: "Company registration",
    capital: "5000001",
    governmentFee: "",
    extras: "",
  });
  assert.equal(
    rjscRegistration.rows.find(
      (row) => row.label === "RJSC filing fee · 6 documents",
    )?.amount,
    1200,
  );
  assert.equal(
    rjscRegistration.rows.find(
      (row) => row.label === "Authorised share capital fee",
    )?.amount,
    3330,
  );
  assert.match(rjscRegistration.notes[1] ?? "", /above ৳ 5,000,000/);
  const rjscCapitalIncrease = calculate("rjsc", {
    entity: "Private limited company",
    serviceType: "Capital increase",
    capital: "5000001",
    governmentFee: "",
    extras: "",
  });
  assert.equal(
    rjscCapitalIncrease.rows.find(
      (row) => row.label === "Authorised share capital fee",
    )?.amount,
    3330,
  );
});
test("RJSC reference table keeps the supplied capital points and supports legacy settings", () => {
  assert.equal(defaultRjscReferenceRows.length, 15);
  assert.deepEqual(defaultRjscReferenceRows[0], {
    capital: 1000000,
    governmentFee: 16003,
  });
  assert.deepEqual(defaultRjscReferenceRows.at(-1), {
    capital: 100000000,
    governmentFee: 181708,
  });
  assert.equal(formatCapitalReference(1000000), "10 Lakh (৳ 1,000,000)");
  assert.equal(formatCapitalReference(10000000), "1 Crore (৳ 10,000,000)");
  const legacy = structuredClone(settings);
  delete (
    legacy.companyRegistration as Partial<typeof legacy.companyRegistration>
  ).rjscReferenceRows;
  const parsed = toolsSettingsSchema.parse(legacy);
  assert.deepEqual(
    parsed.companyRegistration.rjscReferenceRows,
    defaultRjscReferenceRows,
  );
  const estimate = calculate("limited-company", {
    capital: "1000000",
    nameClearance: "Already have name clearance",
  });
  assert.deepEqual(estimate.reference, {
    capital: 1000000,
    governmentFee: 16003,
    serviceFee: 10000,
    minimumTotal: 26003,
  });
});
test("admin can change fees and rules with one consistent calculation engine", () => {
  const custom = structuredClone(settings);
  custom.fees.trademark.serviceFee = 1000;
  const result = calculateTool(
    "trademark",
    {
      ...initialToolValues(calculatorFields("trademark", custom)),
      brandName: "Limex",
      classes: "9,42",
      governmentFee: "5000",
    },
    custom,
  ).result;
  assert.equal(result.total, 12000);
  assert.equal(result.complete, true);
  custom.taxYears[0].thresholds.general = 600000;
  assert.equal(
    calculateTool(
      "income-tax",
      {
        ...initialToolValues(calculatorFields("income-tax", custom)),
        income: "600000",
        incomeType: "Already-computed taxable income",
      },
      custom,
    ).result.total,
    0,
  );
});
test("published settings reject unsafe URLs and invalid band definitions", () => {
  assert.ok(toolsSettingsSchema.safeParse(settings).success);
  const invalid = structuredClone(settings);
  invalid.fees.rjsc.sourceUrl = "javascript:alert(1)";
  assert.ok(!toolsSettingsSchema.safeParse(invalid).success);
  const bands = structuredClone(settings);
  bands.taxYears[0].bands[0].width = null;
  assert.ok(!toolsSettingsSchema.safeParse(bands).success);
  const noDate = structuredClone(settings);
  noDate.fees.rjsc.governmentFee = 100;
  assert.ok(!toolsSettingsSchema.safeParse(noDate).success);
  const unorderedCompanyBands = structuredClone(settings);
  unorderedCompanyBands.companyRegistration.aoaStampBands[0].upto = 40000000;
  assert.ok(!toolsSettingsSchema.safeParse(unorderedCompanyBands).success);
});
for (const tool of businessTools.filter((tool) => tool.group === "builder"))
  test(`document ${tool.slug} has a distinct validated template and export`, () => {
    const fields = documentFields(tool.slug);
    assert.ok(fields.length >= 10);
    assert.throws(() => validateFields(fields, {}));
    const values = initialToolValues(fields);
    for (const field of fields)
      if (!values[field.key])
        values[field.key] =
          field.kind === "date"
            ? "2026-09-05"
            : field.kind === "number"
              ? field.key === "shareA"
                ? "50"
                : field.key === "months"
                  ? "12"
                  : "1000"
              : `QA ${field.label}`;
    const clean = validateFields(fields, values);
    const draft = createDocumentDraft(tool.slug, clean);
    assert.ok(draft.sections.length >= 5);
    assert.ok(draft.warning);
    assert.ok(documentText(draft).includes(draft.title));
    assert.ok(!documentText(draft).includes("undefined"));
    if (tool.slug === "rental-deed" || tool.slug === "partnership-deed") {
      const bangla = createDocumentDraft(tool.slug, {
        ...clean,
        language: "bn",
      });
      assert.equal(bangla.language, "bn");
      assert.match(bangla.title, /[\u0980-\u09ff]/);
    }
  });

test("services module and icon picker use refined SVG arrows, styled dropdowns, and non-boxy inputs", async () => {
  const fs = await import("node:fs/promises");
  const servicesContent = await fs.readFile(
    new URL("../src/components/admin/services-module.tsx", import.meta.url),
    "utf8",
  );
  const iconPickerContent = await fs.readFile(
    new URL("../src/components/admin/icon-picker.tsx", import.meta.url),
    "utf8",
  );

  // Verifies custom select with chevron arrow and appearance-none
  assert.match(servicesContent, /appearance-none/);
  assert.match(servicesContent, /stroke="currentColor"/);

  // Verifies no raw unicode caron or ASCII arrows in services-module
  assert.doesNotMatch(servicesContent, />⌄</);
  assert.doesNotMatch(servicesContent, />[↑→]</);

  // Verifies icon-picker uses SVG arrow and search input icon
  assert.doesNotMatch(iconPickerContent, />⌄</);
  assert.match(iconPickerContent, /Search icons/);
});

test("tools module service requests render as a responsive table with headers and mobile layout", async () => {
  const fs = await import("node:fs/promises");
  const toolsModuleContent = await fs.readFile(
    new URL("../src/components/admin/tools-module.tsx", import.meta.url),
    "utf8",
  );

  // Verifies real table structure with responsive wrapper
  assert.match(toolsModuleContent, /<table className="w-full min-w-\[840px\]/);
  assert.match(toolsModuleContent, /<th[^>]*>Client \/ Contact<\/th>/);
  assert.match(toolsModuleContent, /<th[^>]*>Source Tool<\/th>/);
  assert.match(toolsModuleContent, /<th[^>]*>Contact Channel<\/th>/);
  assert.match(toolsModuleContent, /<th[^>]*>Status<\/th>/);

  // Verifies mobile layout support
  assert.match(toolsModuleContent, /md:hidden/);
  assert.match(toolsModuleContent, /RequestDetailDrawer/);
  assert.match(toolsModuleContent, /ServiceRequestsTable/);
});

test("seamless navigation transitions, progress bar, and view transitions are properly configured", async () => {
  const fs = await import("node:fs/promises");
  const globalsCss = await fs.readFile(
    new URL("../src/app/globals.css", import.meta.url),
    "utf8",
  );
  const templateTsx = await fs.readFile(
    new URL("../src/app/template.tsx", import.meta.url),
    "utf8",
  );
  const navigationProgressTsx = await fs.readFile(
    new URL("../src/components/limex/navigation-progress.tsx", import.meta.url),
    "utf8",
  );
  const smoothScrollTsx = await fs.readFile(
    new URL("../src/components/limex/smooth-scroll.tsx", import.meta.url),
    "utf8",
  );
  const layoutTsx = await fs.readFile(
    new URL("../src/app/layout.tsx", import.meta.url),
    "utf8",
  );

  // View transitions and keyframe animations in CSS
  assert.match(globalsCss, /@view-transition\s*\{\s*navigation:\s*auto;\s*\}/);
  assert.match(globalsCss, /::view-transition-old\(root\)/);
  assert.match(globalsCss, /::view-transition-new\(root\)/);
  assert.match(globalsCss, /@keyframes page-transition-fade-in/);
  assert.match(globalsCss, /page-transition-enter/);

  // App router template wraps content for fluid page-enter animation
  assert.match(templateTsx, /page-transition-enter/);

  // NavigationProgress renders the top bar and is present in RootLayout
  assert.match(navigationProgressTsx, /NavigationProgress/);
  assert.match(layoutTsx, /<NavigationProgress \/>/);

  // SmoothScroll resets scroll cleanly on route change and intercepts clicks
  assert.match(smoothScrollTsx, /lenis\.scrollTo\(0,\s*\{\s*immediate:\s*true/);
  assert.match(smoothScrollTsx, /startViewTransition/);
});

test("service page renders ContactModal CTA buttons in hero and bottom with pre-selected service and clean bg-page stroke styling", async () => {
  const fs = await import("node:fs/promises");
  const serviceSectionsTsx = await fs.readFile(
    new URL(
      "../src/components/limex/service-page-sections.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const contactSectionTsx = await fs.readFile(
    new URL("../src/components/limex/contact-section.tsx", import.meta.url),
    "utf8",
  );
  const toolsRoutesTs = await fs.readFile(
    new URL("../server/modules/tools/tools.routes.ts", import.meta.url),
    "utf8",
  );

  // 1. tools.routes.ts accepts both BLOG and SERVICE sources
  assert.match(toolsRoutesTs, /z\.enum\(\[\s*"BLOG",\s*"SERVICE"\s*\]\)/);

  // 2. ServiceHeroSection and ServiceContactSection both use ContactModal with cta arrow and serviceKey
  assert.match(
    serviceSectionsTsx,
    /<ContactModal[^>]*serviceKey=\{service\.serviceKey \?\? service\.title\}/,
  );
  assert.match(serviceSectionsTsx, /buttonLabel=\{service\.ctaLabel\}/);
  assert.match(serviceSectionsTsx, /buttonLabel=\{contactButtonLabel\}/);

  // 3. Section provides clean reassurance text below the button
  assert.match(serviceSectionsTsx, /bottomReassurance/);
  assert.match(serviceSectionsTsx, /whatsappNow/);

  // 4. Hero stats, Key facts, and FAQ backgrounds use bg-page separated by strokes
  assert.match(
    serviceSectionsTsx,
    /bg-page p-2\.5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-\[#d8d3c7\]/,
  );
  assert.match(
    serviceSectionsTsx,
    /rounded-\[22px\] border border-\[#d8d3c7\] bg-page p-5/,
  );
  assert.match(
    serviceSectionsTsx,
    /rounded-\[20px\] border border-\[#d8d3c7\] bg-page p-5 transition-colors/,
  );

  // 5. ContactForm in contact-section.tsx initializes values.services with initialService and supports modal source
  assert.match(
    contactSectionTsx,
    /services:\s*trimmed\s*\?\s*\[trimmed\]\s*:\s*\[\]/,
  );
  assert.match(contactSectionTsx, /className\?: string/);
  assert.match(contactSectionTsx, /resolvedSource/);
});

test("service page related options are dynamic with title, subtitle, icon, focused buttons, and admin support", async () => {
  const fs = await import("node:fs/promises");
  const serviceSectionsTsx = await fs.readFile(
    new URL(
      "../src/components/limex/service-page-sections.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const serviceModuleTsx = await fs.readFile(
    new URL(
      "../src/components/admin/service-pages-module.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const serviceDomainTs = await fs.readFile(
    new URL("../server/modules/services/domain/service.ts", import.meta.url),
    "utf8",
  );
  const serviceRoutesTs = await fs.readFile(
    new URL(
      "../server/modules/services/interface/http/service.routes.ts",
      import.meta.url,
    ),
    "utf8",
  );

  // 1. service-page-sections.tsx renders Section Title, Subtitle, ServiceIcon, and clean focused button
  assert.match(serviceSectionsTsx, /relatedOptionsTitle/);
  assert.match(serviceSectionsTsx, /relatedOptionsDescription/);
  assert.match(serviceSectionsTsx, /<ServiceIcon\s+name=\{iconName\}/);
  assert.match(serviceSectionsTsx, /group-hover:translate-x-1/);

  // 2. admin module contains dedicated Related options disclosure with full item fields
  assert.match(
    serviceModuleTsx,
    /<SectionDisclosure\s+title="Related options"/,
  );
  assert.match(
    serviceModuleTsx,
    /placeholder="Explore related services & options"/,
  );
  assert.match(serviceModuleTsx, /addRelatedOption/);
  assert.match(serviceModuleTsx, /<IconPicker/);

  // 3. domain normalizes relatedOptionsTitle, relatedOptionsDescription, and cleanRelatedOptions
  assert.match(serviceDomainTs, /cleanRelatedOptions/);
  assert.match(serviceDomainTs, /relatedOptionsTitle:/);
  assert.match(serviceDomainTs, /relatedOptionsDescription:/);

  // 4. HTTP routes validate relatedOptions schema
  assert.match(serviceRoutesTs, /relatedOptions:\s*z\s*\.array/);

  // 5. Test normalizeServiceDetail handles dynamic related options cleanly
  const normalized = normalizeServiceDetail({
    relatedOptionsTitle: "Custom Title",
    relatedOptionsDescription: "Custom Subtitle",
    relatedOptions: [
      {
        title: "Test Option",
        description: "Test Description",
        href: "/services/test",
        icon: "license",
        badge: "Featured",
        actionLabel: "View test",
      },
    ],
  });
  assert.equal(normalized.relatedOptionsTitle, "Custom Title");
  assert.equal(normalized.relatedOptionsDescription, "Custom Subtitle");
  assert.equal(normalized.relatedOptions?.length, 1);
  assert.equal(normalized.relatedOptions?.[0]?.title, "Test Option");
  assert.equal(normalized.relatedOptions?.[0]?.icon, "license");
  assert.equal(normalized.relatedOptions?.[0]?.actionLabel, "View test");
});

test("about page has larger team portraits, executive typography, no odd eyebrows or em-dashes, and preserves bg-page", async () => {
  const fs = await import("node:fs/promises");
  const aboutSectionsContent = await fs.readFile(
    new URL("../src/components/limex/about-sections.tsx", import.meta.url),
    "utf8",
  );

  // 1. Team member portrait is larger than old 92px/100px
  assert.match(
    aboutSectionsContent,
    /size-\[108px\]\s+shrink-0\s+overflow-hidden\s+rounded-\[18px\]/,
  );
  assert.doesNotMatch(aboutSectionsContent, /size-\[92px\]\s+shrink-0/);

  // 2. No em-dash (—) or awkward double dashes (--) in copy
  assert.doesNotMatch(aboutSectionsContent, /—/);
  assert.doesNotMatch(aboutSectionsContent, /\s--\s/);

  // 3. No odd uppercase pink eyebrows on member titles or trust metrics
  assert.doesNotMatch(aboutSectionsContent, /text-overline\s+text-pink/);
  assert.doesNotMatch(aboutSectionsContent, /text-overline\s+text-brand-cyan/);

  // 4. No wireframe "Photo" label under initials
  assert.doesNotMatch(aboutSectionsContent, />Photo<\/span>/);

  // 5. Preserves bg-page background on team section
  assert.match(
    aboutSectionsContent,
    /rounded-panel\s+border\s+border-warm\s+bg-page/,
  );
});

test("bangla language toggle is supported on service and blog pages", async () => {
  const fs = await import("node:fs/promises");
  const serviceSectionsTsx = await fs.readFile(
    new URL(
      "../src/components/limex/service-page-sections.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const blogSectionsTsx = await fs.readFile(
    new URL("../src/components/limex/blog-sections.tsx", import.meta.url),
    "utf8",
  );

  // 1. Service page header supports language toggle switchLabel
  assert.match(serviceSectionsTsx, /ui\.switchLabel/);

  // 2. Blog supports language toggle
  assert.match(blogSectionsTsx, /locale === "bn" \? "English" : "বাংলা"/);
});

test("blog article body contact links, related services, and hash navigation open ContactModal with pre-selected service", async () => {
  const fs = await import("node:fs/promises");
  const blogSectionsTsx = await fs.readFile(
    new URL("../src/components/limex/blog-sections.tsx", import.meta.url),
    "utf8",
  );
  const contactSectionTsx = await fs.readFile(
    new URL("../src/components/limex/contact-section.tsx", import.meta.url),
    "utf8",
  );

  // 1. ContactModal supports controlled open state
  assert.match(contactSectionTsx, /isOpen:\s*controlledIsOpen/);
  assert.match(contactSectionTsx, /hideTrigger/);

  // 2. Blog sections detects contact modal links and extracts service
  assert.match(blogSectionsTsx, /function isContactModalHref/);
  assert.match(blogSectionsTsx, /function extractTargetService/);
  assert.match(blogSectionsTsx, /handleArticleBodyClick/);
  assert.match(blogSectionsTsx, /openContactWithService/);

  // 3. BlogDetailContent listens to URL hash and opens modal
  assert.match(
    blogSectionsTsx,
    /window\.addEventListener\("hashchange", handleHash\)/,
  );

  // 4. Controlled ContactModal is mounted in BlogDetailContent
  assert.match(blogSectionsTsx, /hideTrigger\s+isOpen=\{isContactModalOpen\}/);
});

test("hero section has calm GSAP blob animations, reduced opacity, dynamic typewriter title, and backend animatedWords support", async () => {
  const fs = await import("node:fs/promises");
  const heroSectionTsx = await fs.readFile(
    new URL("../src/components/limex/hero-section.tsx", import.meta.url),
    "utf8",
  );
  const landingRoutesTs = await fs.readFile(
    new URL(
      "../server/modules/landing/interface/http/landing.routes.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const landingModuleTsx = await fs.readFile(
    new URL("../src/components/admin/landing-module.tsx", import.meta.url),
    "utf8",
  );

  // 1. Backend schema supports animatedWords
  assert.match(landingRoutesTs, /animatedWords:\s*z\.array/);

  // 2. Admin landing module provides animated rotating phrases field
  assert.match(landingModuleTsx, /Animated rotating phrases/);

  // 3. Hero section uses GSAP with ambient floating trajectories
  assert.match(heroSectionTsx, /import gsap from "gsap"/);
  assert.match(heroSectionTsx, /gsap\.to\(blobWarmRef\.current/);
  assert.match(heroSectionTsx, /gsap\.to\(blobCoolRef\.current/);

  // 4. Background glow SVG blobs have reduced opacity (opacity-30 / opacity-35 / opacity-40)
  assert.match(heroSectionTsx, /opacity-35/);
  assert.match(heroSectionTsx, /opacity-30/);

  // 5. Typewriter animation with non-jittering container and speed sheen, no verified chip
  assert.match(heroSectionTsx, /min-h-\[1\.25em\]/);
  assert.match(heroSectionTsx, /animate-hero-sheen/);
  assert.doesNotMatch(heroSectionTsx, />Verified<\/span>/);
});

test("rich text editor permanently preserves cursor focus and legal pages have full CMS & footer support", async () => {
  const fs = await import("node:fs/promises");
  const richTextEditorTsx = await fs.readFile(
    new URL("../src/components/admin/rich-text-editor.tsx", import.meta.url),
    "utf8",
  );
  const landingDefaultsTs = await fs.readFile(
    new URL("../src/lib/landing-defaults.ts", import.meta.url),
    "utf8",
  );
  const landingApiTs = await fs.readFile(
    new URL("../src/lib/landing-api.ts", import.meta.url),
    "utf8",
  );
  const adminShellTsx = await fs.readFile(
    new URL("../src/components/admin/admin-shell.tsx", import.meta.url),
    "utf8",
  );
  const serverAppTs = await fs.readFile(
    new URL("../server/app.ts", import.meta.url),
    "utf8",
  );
  const { defaultLegalPages } = await import("../src/lib/legal-defaults.js");

  // 1. Rich text editor cursor focus protection
  assert.match(richTextEditorTsx, /const lastEmittedHtml = useRef/);
  assert.match(
    richTextEditorTsx,
    /if \(wasInternalUpdate \|\| nextHtml === lastEmittedHtml\.current\) \{\s*previousValue\.current = nextHtml;\s*return;\s*\}/,
  );
  assert.match(richTextEditorTsx, /if \(editor\?\.isFocused\) return;/);

  // 2. Default legal pages are comprehensive and structured
  assert.ok(
    defaultLegalPages.terms.contentHtml.includes(
      "<h2>1. Introduction and Scope of Services</h2>",
    ),
  );
  assert.ok(
    defaultLegalPages.terms.contentHtml.includes("Limex Consultancy Firm"),
  );
  assert.ok(
    defaultLegalPages.privacy.contentHtml.includes(
      "<h2>1. Commitment to Privacy</h2>",
    ),
  );
  assert.ok(
    defaultLegalPages.privacy.contentHtml.includes("Information We Collect"),
  );

  // 3. Admin navigation includes Legal pages
  assert.match(
    adminShellTsx,
    /\{ label: "Legal pages", href: "\/admin\/legal" \}/,
  );

  // 4. Backend registers legal routes
  assert.match(
    serverAppTs,
    /import \{ legalRoutes \} from "\.\/modules\/legal\/interface\/http\/legal\.routes\.js"/,
  );
  assert.match(serverAppTs, /await app\.register\(legalRoutes/);

  // 5. Footer legalLinks point to /terms and /privacy
  assert.match(landingDefaultsTs, /href:\s*"\/privacy"/);
  assert.match(landingDefaultsTs, /href:\s*"\/terms"/);
  assert.match(landingApiTs, /link\.href === "\/#top"/);
  assert.match(landingApiTs, /return \{ \.\.\.link, href: "\/privacy" \}/);
  assert.match(landingApiTs, /return \{ \.\.\.link, href: "\/terms" \}/);
});

test("contact modal prevents page scroll-up on open and keeps all form fields in compact mode", async () => {
  const fs = await import("node:fs/promises");
  const contactSectionTsx = await fs.readFile(
    new URL("../src/components/limex/contact-section.tsx", import.meta.url),
    "utf8",
  );

  // 1. Prevent scroll-to-top on open
  assert.match(
    contactSectionTsx,
    /closeButtonRef\.current\?\.focus\(\{\s*preventScroll:\s*true\s*\}\)/,
  );
  assert.match(contactSectionTsx, /const scrollY = window\.scrollY/);
  assert.match(contactSectionTsx, /window\.scrollTo\(\{\s*top:\s*scrollY/);

  // 2. Compact modal container styling
  // 2. Uses createPortal to document.body so modals are never trapped by parent containing blocks
  assert.match(contactSectionTsx, /createPortal/);
  assert.match(contactSectionTsx, /createPortal\([\s\S]*document\.body/);

  // 3. Compact modal container styling
  assert.match(contactSectionTsx, /max-w-\[620px\]/);
  assert.match(contactSectionTsx, /rounded-\[22px\]/);

  // 3. Direct lines strip retains WhatsApp, Phone, Email, and Address
  assert.match(contactSectionTsx, /aria-label="Direct contact details"/);
  assert.match(contactSectionTsx, /WhatsApp/);
  assert.match(contactSectionTsx, /Phone/);
  assert.match(contactSectionTsx, /Email/);
  assert.match(contactSectionTsx, /Office/);

  // 4. All form fields are present in ContactForm
  assert.match(contactSectionTsx, /ServiceMultiSelect/);
  assert.match(contactSectionTsx, /placeholder="Your name"/);
  assert.match(contactSectionTsx, /placeholder="\+880 1XXX XXXXXX"/);
  assert.match(contactSectionTsx, /placeholder="you@example\.com"/);
  assert.match(contactSectionTsx, /aria-label="Preferred date"/);
  assert.match(contactSectionTsx, /aria-label="Preferred time"/);
  assert.match(
    contactSectionTsx,
    /placeholder="Tell us what you need help with\."/,
  );
  assert.match(contactSectionTsx, /name="website"/); // honeypot
  assert.match(contactSectionTsx, /content\.privacyNote/);
});

test("blog listing has editorial cards with blended page background, stroke separation, no service chips, and pagination", async () => {
  const fs = await import("node:fs/promises");
  const blogSectionsTsx = await fs.readFile(
    new URL("../src/components/limex/blog-sections.tsx", import.meta.url),
    "utf8",
  );

  // 1. Pagination engine is present
  assert.match(blogSectionsTsx, /pageSize = 9/);
  assert.match(blogSectionsTsx, /paginatedArticles/);
  assert.match(blogSectionsTsx, /aria-label="Blog pagination"/);
  assert.match(blogSectionsTsx, /getPageNumbers/);

  // 2. Cards blend with page background separated by stroke only, no service chip clutter
  assert.match(blogSectionsTsx, /border-\[#d8d3c7\]\s+bg-page/);
  assert.doesNotMatch(blogSectionsTsx, /Services:/);

  // 3. No wireframe "COVER SLOT" or "IMAGE PLACEHOLDER" text
  assert.doesNotMatch(blogSectionsTsx, /COVER SLOT/);
  assert.doesNotMatch(blogSectionsTsx, /IMAGE PLACEHOLDER/);
  assert.doesNotMatch(blogSectionsTsx, /ARTICLE COVER/);
});

test("service page related options are compact and use intelligent contextual icon resolution", async () => {
  const fs = await import("node:fs/promises");
  const servicePageSectionsTsx = await fs.readFile(
    new URL(
      "../src/components/limex/service-page-sections.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const servicePagesModuleTsx = await fs.readFile(
    new URL(
      "../src/components/admin/service-pages-module.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  // 1. Contextual icon resolver is present and handles diverse keywords
  assert.match(servicePageSectionsTsx, /function resolveRelatedOptionIcon/);
  assert.match(servicePageSectionsTsx, /copyright/);
  assert.match(servicePageSectionsTsx, /trademark/);
  assert.match(servicePageSectionsTsx, /lightbulb/);
  assert.match(servicePageSectionsTsx, /license/);

  // 2. Compact card proportions
  assert.match(servicePageSectionsTsx, /rounded-\[20px\]/);
  assert.match(servicePageSectionsTsx, /size-9\.5/);

  // 3. Admin uses IconPicker for related options
  assert.match(servicePagesModuleTsx, /<IconPicker/);
});

test("blog admin supports searchable service catalog, reordering, custom services, and counter badge", async () => {
  const fs = await import("node:fs/promises");
  const blogModuleTsx = await fs.readFile(
    new URL("../src/components/admin/blog-module.tsx", import.meta.url),
    "utf8",
  );

  // 1. BlogServiceConnectionPanel has catalog search and custom service
  assert.match(blogModuleTsx, /function BlogServiceConnectionPanel/);
  assert.match(blogModuleTsx, /placeholder="Search catalog…"/);
  assert.match(blogModuleTsx, /Add custom service link/);
  assert.match(blogModuleTsx, /function moveService/);
  assert.match(blogModuleTsx, /function removeService/);

  // 2. Tab displays dynamic counter
  assert.match(blogModuleTsx, /Services \(\$\{draft\.services\.length\}\)/);
});
