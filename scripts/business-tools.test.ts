import assert from "node:assert/strict";
import test from "node:test";
import { businessTools, calculateTool, calculatorFields, defaultToolsSettings, initialToolValues, toolsSettingsSchema, validateFields, type ToolSlug, type ToolValues } from "../src/lib/business-tools.js";
import { createDocumentDraft, documentFields, documentText } from "../src/lib/business-documents.js";
import { defaultMouTemplate, defaultTemplateSettings, documentTemplateDraftSchema, expandTemplateBlockInstances, isTemplateFieldVisible, missingTemplateFields, normalizeDocumentTemplateDraft, resolveTemplateFieldValue, templateRepeaterFieldValueKey, type TemplateBlock } from "../src/lib/document-templates.js";
import { renderTemplateDocx } from "../src/lib/document-template-docx.js";
import { renderTemplatePrintHtml } from "../src/lib/document-template-print.js";
import { addPartnershipPartnerSlot, defaultPartnershipDeed40BanglaTemplate, defaultPartnershipDeed40EnglishTemplate, partnershipDeedMaxPartners, partnershipPartnerVisibility, upgradePartnershipDeedTemplate } from "../src/lib/partnership-deed-templates.js";
import { defaultRentalDeedBanglaTemplate, defaultRentalDeedEnglishTemplate } from "../src/lib/rental-deed-templates.js";
import { sanitizeBlogContent, sanitizeBlogHtml } from "../src/lib/blog-content.js";

const settings = defaultToolsSettings;
function calculate(slug: ToolSlug, values: ToolValues) { return calculateTool(slug, { ...initialToolValues(calculatorFields(slug, settings)), ...values }, settings).result; }
test("blog HTML keeps scoped responsive guide styles", () => {
  const source = "<style>.blog-guide-block { width: 100%; margin: 48px 0; } .blog-guide-step { display: grid; grid-template-columns: 60px 1fr; } @media (max-width: 600px) { .blog-guide-step { gap: 12px; } }</style><div class=\"blog-guide-block\"><section class=\"blog-guide-step\"><div class=\"blog-guide-step-number\">01</div><h3>Choose the right structure</h3></section></div>";
  const html = sanitizeBlogHtml(source);
  assert.match(html, /<style>\.blog-rich-text \.blog-guide-block\{/);
  assert.match(html, /class="blog-guide-block"/);
  assert.match(html, /<section class="blog-guide-step">/);
  assert.match(html, /grid-template-columns: 60px 1fr/);
  assert.match(html, /@media \(max-width: 600px\)\{\.blog-rich-text \.blog-guide-step\{gap: 12px\}\}/);
  assert.doesNotMatch(html, /<script|onclick=|url\s*\(/i);
});

test("rich text separates scoped CSS and preserves editor-defined classes", () => {
  const source = "<style>.guide-layout { display: grid; gap: 16px; } h2 { letter-spacing: -0.02em; } @media (max-width: 600px) { .guide-layout { display: block; } }</style><div class=\"guide-layout custom-card\"><h2>Filing guide</h2></div>";
  const content = sanitizeBlogContent(source);
  assert.match(content.css, /\.blog-rich-text \.guide-layout\{display: grid; gap: 16px\}/);
  assert.match(content.css, /\.blog-rich-text h2\{letter-spacing: -0.02em\}/);
  assert.match(content.css, /@media \(max-width: 600px\)\{\.blog-rich-text \.guide-layout\{display: block\}\}/);
  assert.doesNotMatch(content.html, /<style/i);
  assert.match(content.html, /class="guide-layout custom-card"/);
});
test("catalogue contains seven distinct calculators and six builders", () => {
  assert.equal(businessTools.filter((tool) => tool.group === "calculator").length, 7); assert.equal(businessTools.filter((tool) => tool.group === "builder").length, 6); assert.equal(new Set(businessTools.map((tool) => tool.slug)).size, 13);
});
test("document templates keep a safe service CTA default and reject external service links", () => {
  const legacy = normalizeDocumentTemplateDraft({ ...defaultMouTemplate, settings: { ...defaultMouTemplate.settings, serviceCta: undefined } });
  assert.equal(legacy.settings.serviceCta.enabled, false);
  assert.equal(legacy.settings.serviceCta.href, "");
  assert.throws(() => documentTemplateDraftSchema.parse({ ...defaultMouTemplate, settings: { ...defaultMouTemplate.settings, serviceCta: { ...defaultMouTemplate.settings.serviceCta, enabled: true, href: "https://example.com" } } }));
});
test("rental deed templates preserve the supplied long-sheet ratio and separate languages", () => {
  for (const template of [defaultRentalDeedEnglishTemplate, defaultRentalDeedBanglaTemplate]) {
    const parsed = documentTemplateDraftSchema.parse(template);
    assert.equal(parsed.settings.paperSize, "DEED");
    assert.equal(parsed.pages.length, 3);
    assert.equal(parsed.pages[0]?.blocks.some((block) => block.type === "paragraph" && block.text.includes("{{landlord_details}}")), true);
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
      { id: "member-name", key: "name", label: "Name", type: "text" as const, required: true, placeholder: "Full name", options: [] },
      { id: "member-kind", key: "kind", label: "Type", type: "select" as const, required: true, placeholder: "Choose a type", options: [{ value: "person", label: "Person" }, { value: "company", label: "Company" }] },
      { id: "member-note", key: "note", label: "Company note", type: "textarea" as const, required: true, placeholder: "Registration details", options: [], visibleWhen: { fieldKey: "kind", values: ["company"] } },
    ],
  };
  const template = documentTemplateDraftSchema.parse({
    title: "Member roster",
    slug: "member-roster",
    description: "A reusable member list.",
    settings: { ...defaultTemplateSettings, repeaters: [repeater] },
    fields: [{ id: "member-count", key: "member_count", label: "Number of members", type: "number", required: true, placeholder: "2", options: [], defaultValue: "2" }],
    pages: [{ id: "member-page", title: "Members", settings: {}, blocks: [{ id: "member-row", type: "paragraph", text: "Member {{item_number}} — {{name}} ({{kind}}) {{note}}", align: "left", bold: false, italic: false, fontSize: "body", repeat: { repeaterKey: "members" } }] }],
  });
  const values = { member_count: "2", "members.1.name": "A", "members.1.kind": "person", "members.2.name": "B", "members.2.kind": "company" };
  const group = template.settings.repeaters[0]!;
  const row = template.pages[0]!.blocks[0]!;
  const instances = expandTemplateBlockInstances(template, row, values);
  assert.equal(instances.length, 2);
  assert.equal(instances[0]?.values.name, "A");
  assert.equal(instances[1]?.values.item_number, "2");
  assert.deepEqual(missingTemplateFields(template.fields, values, template.settings.repeaters).map((field) => field.key), ["members.2.note"]);
  assert.equal(templateRepeaterFieldValueKey(group, 2, group.fields[0]!), "members.2.name");
  const html = renderTemplatePrintHtml(template, values);
  assert.equal(resolveTemplateFieldValue(group.fields[1], "person"), "Person");
  assert.equal(html.includes("Member 1 — A (Person)"), true);
  assert.equal(html.includes("Member 2 — B (Company)"), true);
  assert.equal(html.includes("[Company note]"), false);
});
test("40-page partnership deed templates preserve the source structure and separate languages", () => {
  for (const template of [defaultPartnershipDeed40EnglishTemplate, defaultPartnershipDeed40BanglaTemplate]) {
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
    assert.equal(parsed.fields.find((field) => field.key === "partner_count")?.defaultValue, "2");
    assert.deepEqual(parsed.fields.find((field) => field.key === "partner_count")?.options.map((option) => option.value), ["2", "3", "4", "5", "6", "7", "8"]);
    const partners = parsed.settings.repeaters.find((repeater) => repeater.key === "partners");
    assert.ok(partners);
    assert.equal(partners.countFieldKey, "partner_count");
    assert.equal(partners.minItems, 2);
    assert.equal(partners.maxItems, 8);
    assert.deepEqual(partners.fields.map((field) => field.key), ["name", "details", "role", "capital", "capital_words", "profit_share"]);
    assert.equal(templateRepeaterFieldValueKey(partners, 8, partners.fields[0]!), "partner_8_name");
    assert.equal(parsed.pages[10]?.blocks.some((block) => block.type === "paragraph" && block.repeat?.repeaterKey === "partners" && block.text.includes("{{capital}}")), true);
    assert.equal(parsed.pages[39]?.blocks.filter((block) => block.type === "signature").length, 4);
    assert.deepEqual(parsed.pages.flatMap((page, index) => page.blocks.some((block) => block.repeat?.repeaterKey === "partners") ? [index + 1] : []), [2, 3, 11, 23, 40]);
    assert.equal(parsed.pages.some((page) => page.blocks.some((block) => JSON.stringify(block).includes("partner_8_name"))), false);
  }
  assert.match(defaultPartnershipDeed40BanglaTemplate.title, /[\u0980-\u09ff]/);
  assert.equal(defaultPartnershipDeed40EnglishTemplate.slug, "partnership-deed-40-en");
  assert.equal(defaultPartnershipDeed40BanglaTemplate.slug, "partnership-deed-40-bn");
});
test("partnership deed partner slots are conditional, extendable to eight and keep capital optional", () => {
  const template = defaultPartnershipDeed40EnglishTemplate;
  const values = { partner_count: "2" };
  assert.equal(isTemplateFieldVisible(template.fields.find((field) => field.key === "partner_1_name")!, values), true);
  assert.equal(isTemplateFieldVisible(template.fields.find((field) => field.key === "partner_2_name")!, values), true);
  assert.equal(isTemplateFieldVisible(template.fields.find((field) => field.key === "partner_3_name")!, values), false);
  assert.equal(isTemplateFieldVisible(template.fields.find((field) => field.key === "partner_4_name")!, values), false);
  const missing = missingTemplateFields(template.fields, values, template.settings.repeaters).map((field) => field.key);
  assert.equal(missing.includes("partner_1_profit_share"), true);
  assert.equal(missing.includes("partner_1_capital"), false);
  assert.equal(missing.includes("partner_1_capital_words"), false);
  assert.equal(missing.some((key) => key.startsWith("partner_3_")), false);
  assert.equal(template.fields.find((field) => field.key === "initial_capital")?.required, false);
  assert.equal(template.fields.find((field) => field.key === "partner_1_profit_share")?.required, true);

  const expanded = Array.from({ length: 4 }).reduce((current) => addPartnershipPartnerSlot(current), template);
  const parsed = documentTemplateDraftSchema.parse(expanded);
  assert.equal(partnershipDeedMaxPartners, 8);
  assert.equal(parsed.fields.some((field) => field.key === "partner_8_name"), true);
  assert.equal(parsed.fields.some((field) => field.key === "partner_9_name"), false);
  assert.equal(parsed.fields.find((field) => field.key === "partner_count")?.options.some((option) => option.value === "8"), true);
  const partnerRepeater = parsed.settings.repeaters.find((repeater) => repeater.key === "partners");
  assert.ok(partnerRepeater);
  const partnerSignature = parsed.pages[39]?.blocks.find((block) => block.type === "signature" && block.repeat?.repeaterKey === "partners");
  assert.ok(partnerSignature);
  assert.equal(expandTemplateBlockInstances(parsed, partnerSignature, { partner_count: "8" }).length, 8);
  const finalSignatures = parsed.pages[39]?.blocks.filter((block) => block.type === "signature") ?? [];
  assert.equal(finalSignatures.filter((block) => block.repeat?.repeaterKey === "partners").length, 1);
  assert.equal(finalSignatures.filter((block) => JSON.stringify(block).includes("witness_")).length, 3);
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
  assert.equal(repaired.pages[29]?.blocks.some((block) => block.id === misplaced.id), false);
  assert.equal(repaired.pages[2]?.blocks.some((block) => block.repeat?.repeaterKey === "partners" && block.type === "paragraph" && block.text.includes("{{details}}")), true);
});
test("partnership deed print output removes inactive partner rows and signatures", () => {
  const values = Object.fromEntries(defaultPartnershipDeed40EnglishTemplate.fields.map((field) => [field.key, field.key === "partner_count" ? "2" : field.key.match(/^partner_([1-8])_name$/)?.[1] ? `Partner ${field.key.match(/^partner_([1-8])_name$/)?.[1]}` : "Sample"]));
  const html = renderTemplatePrintHtml(defaultPartnershipDeed40EnglishTemplate, values);
  assert.equal(html.split("class=\"template-page\"").length - 1, 40);
  for (const number of [3, 4, 5, 6, 7, 8]) assert.equal(html.includes(`Partner ${number}`), false);
  assert.equal(html.includes("Partner 1"), true);
});
test("document templates export as editable DOCX files", async () => {
  const values = Object.fromEntries(defaultMouTemplate.fields.map((field) => [field.key, field.defaultValue ?? "Sample"]));
  const blob = await renderTemplateDocx(defaultMouTemplate, values);
  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.ok(blob.size > 1000);
  assert.equal(bytes.subarray(0, 2).toString("hex"), "504b");
});
for (const amount of [0, 0.01, 1, 99.99, 1000, 999999.99]) for (const rate of [0, 5, 7.5, 15, 100]) test(`VAT reconciles amount=${amount} rate=${rate}`, () => {
  for (const mode of ["Including VAT", "Excluding VAT"]) {
    const result = calculate("vat", { amount: String(amount), rate: String(rate), mode });
    assert.ok(Math.abs(result.rows.reduce((sum, row) => sum + row.amount!, 0) - result.total) < 0.001);
    if (mode === "Including VAT") assert.equal(result.total, amount);
  }
});
test("VAT rejects negative, infinite and out-of-range amounts/rates", () => {
  for (const amount of ["-1", "NaN", "Infinity", "1e20"]) assert.throws(() => calculate("vat", { amount }));
  assert.throws(() => calculate("vat", { amount: "100", rate: "101" }));
});
for (const [category, threshold] of Object.entries(settings.taxYears[0].thresholds)) test(`tax threshold and minimum: ${category}`, () => {
  const input = { category, incomeType: "Already-computed taxable income", income: String(threshold) };
  assert.equal(calculate("income-tax", input).total, 0);
  assert.equal(calculate("income-tax", { ...input, income: String(threshold + 1) }).total, 5000);
  assert.equal(calculate("income-tax", { ...input, income: String(threshold + 1), newTaxpayer: "Yes" }).total, 1000);
});
test("slabs apply progressively at exact boundaries", () => {
  for (const [income, expected] of [[700000, 30000], [1100000, 90000], [1600000, 190000], [3600000, 690000], [5000000, 1110000]]) assert.equal(calculate("income-tax", { income: String(income), incomeType: "Already-computed taxable income" }).total, expected);
});
test("income tax uses the current NBR assessment-year settings", () => {
  const year = settings.taxYears[0];
  assert.equal(year.year, "2026-27");
  assert.deepEqual(year.thresholds, { general: 400000, female: 450000, senior: 450000, disability: 525000, thirdGender: 525000, freedom: 550000, july: 550000 });
  assert.deepEqual(year.bands, [{ width: 300000, rate: 10 }, { width: 400000, rate: 15 }, { width: 500000, rate: 20 }, { width: 2000000, rate: 25 }, { width: null, rate: 30 }]);
  assert.equal(year.salaryExemptionCap, 500000);
  assert.equal(year.rebateInvestmentRate, 10);
  assert.equal(year.rebateIncomeRate, 3);
  assert.equal(year.rebateCap, 750000);
});
test("employment exemption is the lower of one-third of gross salary and the published cap", () => {
  const oneThird = calculate("income-tax", { income: "1200000" });
  assert.equal(oneThird.rows.find((row) => row.label === "Employment income exemption")?.amount, 400000);
  const capped = calculate("income-tax", { income: "1800000" });
  assert.equal(capped.rows.find((row) => row.label === "Employment income exemption")?.amount, 500000);
  const alreadyComputed = calculate("income-tax", { income: "1800000", incomeType: "Already-computed taxable income" });
  assert.equal(alreadyComputed.rows.find((row) => row.label === "Employment income exemption")?.amount, 0);
});
test("private employment income can be combined with other taxable income", () => {
  const result = calculate("income-tax", { income: "1200000", otherTaxableIncome: "100000" });
  assert.equal(result.rows.find((row) => row.label === "Other taxable income")?.amount, 100000);
  assert.equal(result.rows.find((row) => row.label === "Income after exemptions")?.amount, 900000);
});
test("salary exemption, investment rebate, credits and minimum apply in order", () => {
  assert.equal(calculate("income-tax", { income: "1200000", investment: "150000", credits: "10000" }).total, 20000);
  const result = calculate("income-tax", { income: "1200000", investment: "150000", credits: "60000" });
  assert.equal(result.total, 0); assert.equal(result.rows.at(-1)?.amount, 30000);
  assert.equal(calculate("income-tax", { income: "500000", incomeType: "Already-computed taxable income", children: "2" }).total, 0);
  assert.throws(() => calculate("income-tax", { income: "500000", children: "1.5" }));
});
test("tax investment detail fields replace the manual total", () => {
  const totalInput = calculate("income-tax", { income: "1200000", investment: "150000" });
  const detailedInput = calculate("income-tax", { income: "1200000", investment: "1", dps: "100000", fund: "50000" });
  assert.equal(detailedInput.total, totalInput.total);
  assert.equal(detailedInput.rows.find((row) => row.label === "Qualifying investment considered")?.amount, 150000);
});
test("trade licence uses the DNCC/DSCC schedule and itemises related charges", () => {
  const fields = calculatorFields("trade-license", settings);
  assert.ok(fields.find((field) => field.key === "signboardType"));
  assert.ok(fields.find((field) => field.key === "advertisementType"));
  const dncc = calculate("trade-license", { authority: "Dhaka North City Corporation", businessType: "restaurant-non-ac", signboardType: "Business identification signboard", signboardArea: "6", sourceTax: "0" });
  assert.equal(dncc.rows.find((row) => row.label.startsWith("Trade licence / renewal fee"))?.amount, 1000);
  assert.equal(dncc.rows.find((row) => row.label.startsWith("Signboard tax"))?.amount, 480);
  assert.equal(dncc.rows.find((row) => row.label === "VAT · 15%")?.amount, 222);
  assert.equal(dncc.rows.find((row) => row.label === "Application form")?.amount, 0);
  assert.equal(dncc.rows.find((row) => row.label === "Licence book")?.amount, 270);
  assert.equal(dncc.rows.find((row) => row.label === "Other authority fee")?.amount, 500);
  const dscc = calculate("trade-license", { authority: "Dhaka South City Corporation", businessType: "restaurant-non-ac", sourceTax: "0" });
  assert.equal(dscc.rows.find((row) => row.label === "Application form")?.amount, 50);
  assert.equal(dscc.sourceUrl, settings.tradeLicense.dscc.sourceUrl);
});
test("trade licence handles company capital bands, advertising and late renewal", () => {
  const company = calculate("trade-license", { structure: "Private limited company", paidUpCapital: "10000000", sourceTax: "0" });
  assert.equal(company.rows.find((row) => row.label.startsWith("Trade licence / renewal fee"))?.amount, 7500);
  const advertised = calculate("trade-license", { businessType: "restaurant-non-ac", advertisementType: "festoon-banner", advertisementUnits: "2", sourceTax: "0" });
  assert.equal(advertised.rows.find((row) => row.label.startsWith("Advertisement tax"))?.amount, 1000);
  const renewal = calculate("trade-license", { application: "Renewal", businessType: "restaurant-non-ac", licenseYears: "1", lateMonths: "1", sourceTax: "0" });
  assert.equal(renewal.rows.find((row) => row.label.startsWith("Late-renewal surcharge"))?.amount, 100);
});
test("unknown trade licence fees remain pending and zero is distinct for other authorities", () => {
  const result = calculate("trade-license", { authority: "Other city corporation", governmentFee: "0", signboard: "", extras: "0" });
  assert.equal(result.rows[0].amount, 0); assert.equal(result.rows[1].amount, null); assert.equal(result.rows[2].amount, null); assert.equal(result.rows[3].amount, 0); assert.equal(result.complete, false);
});
test("trademark de-duplicates classes and rejects invalid classes", () => {
  const result = calculate("trademark", { brandName: "Limex", classes: "9,35,9", governmentFee: "5000" }); assert.equal(result.rows[0].amount, 10000);
  for (const classes of ["0", "46", "1.5", "9,not-a-class"]) assert.throws(() => calculate("trademark", { brandName: "Limex", classes }));
});
test("company capital, IRC ceiling and unsupported inputs are validated", () => {
  assert.throws(() => calculate("limited-company", { capital: "0" }));
  const rjscFields = calculatorFields("rjsc", settings);
  const capitalField = rjscFields.find((field) => field.key === "capital");
  assert.equal(capitalField?.label, "Authorised capital (৳)");
  assert.equal(capitalField?.defaultValue, "1000000");
  assert.equal(capitalField?.required, true);
  assert.doesNotThrow(() => calculate("rjsc", { serviceType: "Name clearance", capital: "" }));
  assert.throws(() => calculate("rjsc", { serviceType: "Capital increase", capital: "" }));
  assert.throws(() => calculate("irc-erc", { certificate: "Commercial IRC" }));
  assert.doesNotThrow(() => calculate("irc-erc", { certificate: "ERC", businessType: "Export only" }));
  assert.throws(() => calculateTool("mou", {}, settings));
});
test("company setup applies the published RJSC schedule", () => {
  const result = calculate("limited-company", { capital: "1000000", nameClearance: "Need name clearance", nameOptions: "1" });
  assert.equal(result.total, 14700);
  assert.equal(result.rows.find((row) => row.label === "RJSC filing fee · 6 documents")?.amount, 1200);
  assert.equal(result.rows.find((row) => row.label === "Articles of Association stamp")?.amount, 2000);
  assert.equal(result.rows.find((row) => row.label === "Authorised share capital fee")?.amount, 0);
  assert.equal(result.rows.find((row) => row.label.startsWith("Name clearance"))?.amount, 500);
  const nextBand = calculate("limited-company", { capital: "1000001", nameClearance: "Already have name clearance" });
  assert.equal(nextBand.rows.find((row) => row.label === "Authorised share capital fee")?.amount, 80);
  assert.equal(nextBand.rows.some((row) => row.label.startsWith("Name clearance")), false);
  assert.equal(nextBand.rows.find((row) => row.label === "Articles of Association stamp")?.amount, 4000);
  assert.equal(calculate("limited-company", { capital: "5000000", nameClearance: "Already have name clearance" }).rows.find((row) => row.label === "Authorised share capital fee")?.amount, 3200);
  assert.equal(calculate("limited-company", { capital: "5000001", nameClearance: "Already have name clearance" }).rows.find((row) => row.label === "Authorised share capital fee")?.amount, 3330);
  const rjscRegistration = calculate("rjsc", { entity: "Private limited company", serviceType: "Company registration", capital: "5000001", governmentFee: "", extras: "" });
  assert.equal(rjscRegistration.rows.find((row) => row.label === "RJSC filing fee · 6 documents")?.amount, 1200);
  assert.equal(rjscRegistration.rows.find((row) => row.label === "Authorised share capital fee")?.amount, 3330);
  assert.match(rjscRegistration.notes[1] ?? "", /above ৳ 5,000,000/);
});
test("admin can change fees and rules with one consistent calculation engine", () => {
  const custom = structuredClone(settings); custom.fees.trademark.serviceFee = 1000;
  const result = calculateTool("trademark", { ...initialToolValues(calculatorFields("trademark", custom)), brandName: "Limex", classes: "9,42", governmentFee: "5000" }, custom).result;
  assert.equal(result.total, 12000); assert.equal(result.complete, true);
  custom.taxYears[0].thresholds.general = 600000;
  assert.equal(calculateTool("income-tax", { ...initialToolValues(calculatorFields("income-tax", custom)), income: "600000", incomeType: "Already-computed taxable income" }, custom).result.total, 0);
});
test("published settings reject unsafe URLs and invalid band definitions", () => {
  assert.ok(toolsSettingsSchema.safeParse(settings).success);
  const invalid = structuredClone(settings); invalid.fees.rjsc.sourceUrl = "javascript:alert(1)"; assert.ok(!toolsSettingsSchema.safeParse(invalid).success);
  const bands = structuredClone(settings); bands.taxYears[0].bands[0].width = null; assert.ok(!toolsSettingsSchema.safeParse(bands).success);
  const noDate = structuredClone(settings); noDate.fees.rjsc.governmentFee = 100; assert.ok(!toolsSettingsSchema.safeParse(noDate).success);
  const unorderedCompanyBands = structuredClone(settings); unorderedCompanyBands.companyRegistration.aoaStampBands[0].upto = 40000000; assert.ok(!toolsSettingsSchema.safeParse(unorderedCompanyBands).success);
});
for (const tool of businessTools.filter((tool) => tool.group === "builder")) test(`document ${tool.slug} has a distinct validated template and export`, () => {
  const fields = documentFields(tool.slug); assert.ok(fields.length >= 10); assert.throws(() => validateFields(fields, {}));
  const values = initialToolValues(fields);
  for (const field of fields) if (!values[field.key]) values[field.key] = field.kind === "date" ? "2026-09-05" : field.kind === "number" ? field.key === "shareA" ? "50" : field.key === "months" ? "12" : "1000" : `QA ${field.label}`;
  const clean = validateFields(fields, values); const draft = createDocumentDraft(tool.slug, clean);
  assert.ok(draft.sections.length >= 5); assert.ok(draft.warning); assert.ok(documentText(draft).includes(draft.title)); assert.ok(!documentText(draft).includes("undefined"));
  if (tool.slug === "rental-deed" || tool.slug === "partnership-deed") { const bangla = createDocumentDraft(tool.slug, { ...clean, language: "bn" }); assert.equal(bangla.language, "bn"); assert.match(bangla.title, /[\u0980-\u09ff]/); }
});
