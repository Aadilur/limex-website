import assert from "node:assert/strict";
import test from "node:test";
import { businessTools, calculateTool, calculatorFields, defaultToolsSettings, initialToolValues, toolsSettingsSchema, validateFields, type ToolSlug, type ToolValues } from "../src/lib/business-tools.js";
import { createDocumentDraft, documentFields, documentText } from "../src/lib/business-documents.js";

const settings = defaultToolsSettings;
function calculate(slug: ToolSlug, values: ToolValues) { return calculateTool(slug, { ...initialToolValues(calculatorFields(slug, settings)), ...values }, settings).result; }
test("catalogue contains seven distinct calculators and six builders", () => {
  assert.equal(businessTools.filter((tool) => tool.group === "calculator").length, 7); assert.equal(businessTools.filter((tool) => tool.group === "builder").length, 6); assert.equal(new Set(businessTools.map((tool) => tool.slug)).size, 13);
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
