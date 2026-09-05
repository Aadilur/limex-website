import { z } from "zod";

export const toolSlugs = ["income-tax", "vat", "limited-company", "trade-license", "trademark", "rjsc", "irc-erc", "rental-deed", "trade-license-cancellation", "partnership-deed", "moa-aoa", "mou", "employment-agreement"] as const;
export type ToolSlug = typeof toolSlugs[number];
export type ToolDefinition = { slug: ToolSlug; title: string; description: string; group: "calculator" | "builder"; icon: "tax" | "calculator" | "building" | "license" | "trademark" | "world" | "contract" | "users-group" | "file-check" | "briefcase"; menuLabel: string };
export const businessTools: ToolDefinition[] = [
  { slug: "income-tax", title: "Income tax", description: "Income, rebates and what’s left to pay.", group: "calculator", icon: "tax", menuLabel: "TAX Calculator" },
  { slug: "vat", title: "VAT calculator", description: "Add VAT or find it within a total.", group: "calculator", icon: "calculator", menuLabel: "VAT Calculator" },
  { slug: "limited-company", title: "Company setup", description: "Plan your incorporation budget.", group: "calculator", icon: "building", menuLabel: "Limited Company Cost Calculator" },
  { slug: "trade-license", title: "Trade licence", description: "Understand your local licence costs.", group: "calculator", icon: "license", menuLabel: "Trade License Fee Calculator" },
  { slug: "trademark", title: "Trademark", description: "Plan costs by class and filing stage.", group: "calculator", icon: "trademark", menuLabel: "Trademark Calculator" },
  { slug: "rjsc", title: "RJSC fees", description: "Separate registration fees from extras.", group: "calculator", icon: "building", menuLabel: "RJSC Fee Calculator" },
  { slug: "irc-erc", title: "Import & export", description: "Budget for IRC or ERC registration.", group: "calculator", icon: "world", menuLabel: "IRC/ERC FEE Calculator" },
  { slug: "rental-deed", title: "Office rental deed", description: "Agree on rent, deposits and handover.", group: "builder", icon: "contract", menuLabel: "Office Rental Deed Agreement Builder (Eng and Bangla)" },
  { slug: "partnership-deed", title: "Partnership deed", description: "Set out ownership and responsibilities.", group: "builder", icon: "users-group", menuLabel: "Partnership Deed Agreement Builder (Eng and Bangla)" },
  { slug: "mou", title: "MOU builder", description: "Put a shared understanding in writing.", group: "builder", icon: "contract", menuLabel: "MOU Generator" },
  { slug: "moa-aoa", title: "MOA & AOA", description: "Outline your company’s foundations.", group: "builder", icon: "building", menuLabel: "MOA/AOA Builder" },
  { slug: "employment-agreement", title: "Employment agreement", description: "Clarify the role, pay and key terms.", group: "builder", icon: "briefcase", menuLabel: "Employment Agreement Generator" },
  { slug: "trade-license-cancellation", title: "Licence cancellation", description: "Prepare a business closure request.", group: "builder", icon: "file-check", menuLabel: "E-Trade License Closed/Cancel Application" },
];
export const toolHref = (slug: ToolSlug) => `/business-tools/${slug}`;
export const getTool = (slug: string) => businessTools.find((tool) => tool.slug === slug);
export const money = (value: number) => `৳ ${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(value)}`;

export type ToolFieldVisibility = { key: string; value: string } | { key: string; values: string[] };
export type ToolField = { key: string; label: string; kind?: "number" | "select" | "text" | "textarea" | "date"; options?: { value: string; label: string }[]; hint?: string; required?: boolean; defaultValue?: string; min?: number; max?: number; step?: string; showWhen?: ToolFieldVisibility };
const options = (...values: string[]) => values.map((label) => ({ label, value: label }));
export const taxCategoryLabels = { general: "General taxpayer", female: "Female taxpayer", senior: "Age 65 or above", disability: "Person with a disability", thirdGender: "Third-gender taxpayer", freedom: "Gazetted war-wounded freedom fighter", july: "Gazetted injured July warrior" };
export const taxGuideUrl = "https://nbr.gov.bd/uploads/publications/আয়কর_নির্দেশিকা_২০২৬-২০২৭.pdf";
export const feeSources: Record<string, string> = {
  "income-tax": taxGuideUrl, vat: "https://nbr.gov.bd/faq/vat-faq", rjsc: "https://app.roc.gov.bd/psp/fee_calculator",
  "limited-company": "https://app.roc.gov.bd/psp/fee_calculator", "trade-license": "https://dncc.gov.bd/", trademark: "https://dpdt.gov.bd/pages/static-pages/6922e14d933eb65569e2b677", "irc-erc": "https://olm.ccie.gov.bd/",
};
const nonNegative = z.number().finite().min(0).max(1e12);
const nullableFee = nonNegative.nullable();
const publicUrl = z.string().url().refine((value) => /^https?:\/\//.test(value), "Use an http(s) source URL.");
export const feeSettingSchema = z.object({
  serviceFee: nullableFee, governmentFee: nullableFee,
  chargeDefaults: z.record(nullableFee).default({}),
  sourceUrl: publicUrl, effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  note: z.string().max(1000),
}).strict().refine((value) => value.governmentFee === null || value.effectiveDate !== null, "A published government fee needs an effective date.");
export const taxYearSchema = z.object({
  year: z.string().regex(/^\d{4}-\d{2}$/),
  thresholds: z.object({ general: nonNegative, female: nonNegative, senior: nonNegative, disability: nonNegative, thirdGender: nonNegative, freedom: nonNegative, july: nonNegative }).strict(),
  bands: z.array(z.object({ width: nonNegative.positive().nullable(), rate: z.number().min(0).max(100) }).strict()).min(1).max(10),
  salaryExemptionCap: nonNegative, rebateInvestmentRate: z.number().min(0).max(100), rebateIncomeRate: z.number().min(0).max(100), rebateCap: nonNegative,
  minimumTax: nonNegative, newTaxpayerMinimum: nonNegative, childAllowance: nonNegative, sourceUrl: publicUrl,
}).strict().refine((value) => value.bands.every((band, i) => (band.width === null) === (i === value.bands.length - 1)), "Only the final tax band must have an unlimited (null) width.");
export const toolsSettingsSchema = z.object({
  taxYears: z.array(taxYearSchema).min(1).max(10).refine((years) => new Set(years.map((year) => year.year)).size === years.length, "Assessment years must be unique."),
  fees: z.object({ "limited-company": feeSettingSchema, rjsc: feeSettingSchema, "trade-license": feeSettingSchema, trademark: feeSettingSchema, "irc-erc": feeSettingSchema }).strict(),
}).strict();
export type ToolsSettings = z.infer<typeof toolsSettingsSchema>;
export type ToolsConfig = { version: number; settings: ToolsSettings };
const feeSetting = (slug: string, note: string) => ({ governmentFee: null, serviceFee: null, chargeDefaults: {}, sourceUrl: feeSources[slug], effectiveDate: null, note });
export const defaultToolsSettings: ToolsSettings = {
  taxYears: [{ year: "2026-27", thresholds: { general: 400000, female: 450000, senior: 450000, disability: 525000, thirdGender: 525000, freedom: 550000, july: 550000 }, bands: [{ width: 300000, rate: 10 }, { width: 400000, rate: 15 }, { width: 500000, rate: 20 }, { width: 2000000, rate: 25 }, { width: null, rate: 30 }], salaryExemptionCap: 500000, rebateInvestmentRate: 10, rebateIncomeRate: 3, rebateCap: 750000, minimumTax: 5000, newTaxpayerMinimum: 1000, childAllowance: 50000, sourceUrl: taxGuideUrl }],
  fees: {
    "limited-company": feeSetting("limited-company", "Use the RJSC assessment for your company’s entity type and authorised capital. Trade licence and optional services are separate. No name-availability check is performed."),
    rjsc: feeSetting("rjsc", "Use the fee assessment from RJSC for the selected entity and capital. Do not count stamp or filing charges twice if already included in the assessment."),
    "trade-license": feeSetting("trade-license", "Licence and signboard charges depend on the authority and business activity. Enter the amounts on your authority’s assessment; blank amounts remain pending, not zero."),
    trademark: feeSetting("trademark", "Fees are per class and filing stage. Search, application, publication and registration are separate stages. This tool does not check trademark availability."),
    "irc-erc": feeSetting("irc-erc", "Use the CCI&E assessment for your registration type, import ceiling and new/renewal application. Chamber membership, bank charges and late fees may be additional."),
  },
};

const assessedFee: ToolField = { key: "governmentFee", label: "Government assessment (৳)", hint: "From the authority’s fee slip. Leave blank if not known.", kind: "number" };
export function calculatorFields(slug: ToolSlug, settings: ToolsSettings): ToolField[] {
  if (slug === "vat") return [
    { key: "mode", label: "Your amount is", kind: "select", options: options("Excluding VAT", "Including VAT"), defaultValue: "Excluding VAT" },
    { key: "taxYear", label: "VAT period", kind: "select", options: options("Current assessment period", "2025–26", "2026–27"), defaultValue: "Current assessment period" },
    { key: "supplyType", label: "Supply / service type", kind: "select", options: options("General supply", "Professional service", "Zero-rated supply", "Exempt supply"), defaultValue: "General supply", hint: "Use the rate that applies to your specific supply; zero-rated and exempt supplies are legally different." },
    { key: "amount", label: "Amount (৳)", kind: "number", required: true, min: 0 },
    { key: "rate", label: "VAT rate (%)", kind: "number", required: true, defaultValue: "15", max: 100, hint: "15% is the standard rate. Enter a different rate only when it applies to your supply." },
  ];
  if (slug === "income-tax") return [
    { key: "year", label: "Assessment year", kind: "select", options: settings.taxYears.map((year) => ({ value: year.year, label: year.year })), defaultValue: settings.taxYears[0].year },
    { key: "category", label: "Taxpayer category", kind: "select", options: Object.entries(taxCategoryLabels).map(([value, label]) => ({ value, label })), defaultValue: "general" },
    { key: "incomeType", label: "Income basis", kind: "select", options: options("Private employment salary", "Already-computed taxable income"), defaultValue: "Private employment salary", hint: "Use taxable income for government salary or other income, after its applicable exemptions." },
    { key: "income", label: "Annual income (৳)", kind: "number", required: true, hint: "Salary includes bonuses and taxable benefits. This estimator covers ordinary slab-rate income only." },
    { key: "investment", label: "Actual investment total (৳)", kind: "number", defaultValue: "0", hint: "Enter a total, or use the detailed investment fields below. Detailed entries replace this total." },
    { key: "dps", label: "DPS / approved savings (৳)", kind: "number", defaultValue: "0", hint: "Optional qualifying amount after its statutory limit." },
    { key: "securities", label: "Government securities (৳)", kind: "number", defaultValue: "0" },
    { key: "fund", label: "Mutual / unit fund (৳)", kind: "number", defaultValue: "0" },
    { key: "stocks", label: "Stock market investment (৳)", kind: "number", defaultValue: "0" },
    { key: "insurance", label: "Life insurance premium (৳)", kind: "number", defaultValue: "0" },
    { key: "provident", label: "Provident fund (৳)", kind: "number", defaultValue: "0" },
    { key: "credits", label: "Source tax / TDS credit (৳)", kind: "number", defaultValue: "0", hint: "Eligible source tax / advance tax credits, not final or non-adjustable tax." },
    { key: "children", label: "Eligible dependent children with disabilities", kind: "number", defaultValue: "0", max: 20, step: "1", hint: "Only one parent or guardian may claim each child’s allowance." },
    { key: "newTaxpayer", label: "Qualifying new taxpayer?", kind: "select", options: options("No", "Yes"), defaultValue: "No" },
  ];
  if (slug === "limited-company" || slug === "rjsc") {
    const feeSlug = slug === "limited-company" ? "limited-company" : "rjsc";
    const fee = settings.fees[feeSlug];
    const chargeDefault = (key: string, fallback = "") => fee.chargeDefaults[key] === null || fee.chargeDefaults[key] === undefined ? fallback : String(fee.chargeDefaults[key]);
    const governmentFee = { ...assessedFee, defaultValue: fee.governmentFee === null ? "" : String(fee.governmentFee) };
    return [
      { key: "entity", label: "Entity type", kind: "select", options: options("Private limited company", "One-person company", "Public limited company", "Foreign branch"), defaultValue: "Private limited company" },
      { key: "capital", label: "Authorised capital (৳)", kind: "number", required: slug === "limited-company", min: 1, hint: slug === "rjsc" ? "Required for a company-registration assessment; optional for a name or filing service." : "Capital is context for the authority’s assessment, not an added expense." },
      ...(slug === "limited-company" ? [{ key: "paidUp", label: "Paid-up capital (৳)", kind: "number", required: true, min: 1 } as ToolField] : []),
      ...(slug === "limited-company" ? [
        { key: "location", label: "Registration location", kind: "select", options: options("Inside Dhaka city corporation", "Outside Dhaka city corporation"), defaultValue: "Inside Dhaka city corporation", hint: "Used to keep the trade licence estimate tied to the right authority." } as ToolField,
        { key: "nameClearance", label: "Name clearance", kind: "select", options: options("Need a new name clearance", "Already have name clearance"), defaultValue: "Need a new name clearance" } as ToolField,
        { key: "nameOptions", label: "Proposed names", kind: "number", defaultValue: "1", min: 1, max: 3, step: "1", hint: "Most applications submit up to three name choices." } as ToolField,
        { key: "name1", label: "Approved / first preferred name", kind: "text", required: true, hint: "Use the approved name, or your first choice if clearance is still needed." } as ToolField,
        { key: "name2", label: "Second preferred name (optional)", kind: "text" } as ToolField,
        { key: "name3", label: "Third preferred name (optional)", kind: "text" } as ToolField,
        { key: "businessActivity", label: "Primary business activity", kind: "text", hint: "A short description helps an advisor confirm the service scope." } as ToolField,
        { key: "officeAddress", label: "Registered office address (optional)", kind: "textarea", hint: "Add the proposed Bangladesh office address when available." } as ToolField,
        { key: "directors", label: "Number of directors", kind: "number", defaultValue: "2", min: 1, max: 100, step: "1" } as ToolField,
        { key: "shareholders", label: "Number of shareholders", kind: "number", defaultValue: "2", min: 1, max: 100, step: "1" } as ToolField,
        { key: "directorDetails", label: "Director information (optional)", kind: "textarea", hint: "Names, citizenship and NID / passport readiness for each director." } as ToolField,
        { key: "shareholdingStructure", label: "Shareholding structure (optional)", kind: "textarea", hint: "For example: 60% / 40% between two shareholders." } as ToolField,
        { key: "nameClearanceFee", label: "Name clearance charge (৳)", kind: "number", defaultValue: chargeDefault("nameClearanceFee"), hint: "Enter the assessed charge when name clearance is needed.", showWhen: { key: "nameClearance", value: "Need a new name clearance" } } as ToolField,
      ] : []),
      ...(slug === "rjsc" ? [
        { key: "serviceType", label: "RJSC service", kind: "select", options: options("Company registration", "Name clearance", "Annual return filing", "Director / shareholder change", "Share transfer / allotment", "Registered office change", "Capital increase"), defaultValue: "Company registration" } as ToolField,
        { key: "companyName", label: "Company / file name (optional)", kind: "text" } as ToolField,
      ] : []),
      governmentFee,
      ...(slug === "limited-company" ? [
        { key: "tradeLicense", label: "Trade licence support", kind: "select", options: options("No", "Yes"), defaultValue: "Yes" } as ToolField,
        { key: "tradeFee", label: "Trade licence charge (৳)", kind: "number", defaultValue: chargeDefault("tradeFee"), hint: "Enter the local authority assessment when trade licence support is selected.", showWhen: { key: "tradeLicense", value: "Yes" } } as ToolField,
        { key: "trademark", label: "Trademark support", kind: "select", options: options("No", "Yes"), defaultValue: "No" } as ToolField,
        { key: "trademarkFee", label: "Trademark charge (৳)", kind: "number", defaultValue: chargeDefault("trademarkFee"), hint: "Enter the assessed filing or support charge when selected.", showWhen: { key: "trademark", value: "Yes" } } as ToolField,
        { key: "bin", label: "BIN / VAT registration support", kind: "select", options: options("No", "Yes"), defaultValue: "No" } as ToolField,
        { key: "binFee", label: "BIN / VAT support charge (৳)", kind: "number", defaultValue: chargeDefault("binFee"), hint: "Enter the confirmed charge when selected.", showWhen: { key: "bin", value: "Yes" } } as ToolField,
        { key: "complianceSupport", label: "Ongoing compliance support", kind: "select", options: options("No ongoing support", "Annual return filing", "Tax return support", "VAT & BIN support", "Full compliance management"), defaultValue: "No ongoing support" } as ToolField,
        { key: "complianceFee", label: "Compliance support charge (৳)", kind: "number", defaultValue: chargeDefault("complianceFee"), hint: "Enter the confirmed recurring or annual support charge.", showWhen: { key: "complianceSupport", values: ["Annual return filing", "Tax return support", "VAT & BIN support", "Full compliance management"] } } as ToolField,
        { key: "stampFee", label: "Stamp / filing charges (৳)", kind: "number", defaultValue: chargeDefault("stampFee", "0"), hint: "Use only for confirmed charges not already included in the government assessment." } as ToolField,
      ] : []),
      { key: "extras", label: "Other confirmed charges (৳)", kind: "number", defaultValue: chargeDefault("extras", "0"), hint: "Only amounts not already included above." },
    ];
  }
  if (slug === "trade-license") return [
    { key: "authority", label: "Local authority", kind: "select", options: options("Dhaka North City Corporation", "Dhaka South City Corporation", "Other city corporation", "Municipality", "Union Parishad"), defaultValue: "Dhaka North City Corporation" },
    { key: "businessType", label: "Business type", kind: "select", options: options("General trading", "E-commerce business", "Restaurant", "Food business", "Consultancy", "IT / software company", "Import business", "Export business", "Manufacturing", "Construction", "Travel agency", "Real estate", "Pharmacy", "Retail shop", "Wholesale business", "Professional services", "Online business", "Other business activity"), defaultValue: "IT / software company" },
    { key: "activity", label: "Business activity", kind: "text", required: true, hint: "For example: software services or retail clothing." },
    { key: "structure", label: "Business structure", kind: "select", options: options("Sole proprietorship", "Partnership", "Private limited company", "One-person company"), defaultValue: "Sole proprietorship" },
    { key: "application", label: "Application type", kind: "select", options: options("New licence", "Renewal", "Duplicate", "Amendment"), defaultValue: "New licence" },
    { key: "area", label: "Area / zone (optional)", kind: "text", hint: "For example: Gulshan or Khulna Sadar." },
    { key: "ward", label: "Ward number (optional)", kind: "text" },
    { key: "address", label: "Business address (optional)", kind: "textarea" },
    { key: "floorArea", label: "Floor area (sq. ft, optional)", kind: "number", min: 0, max: 1e8 },
    { key: "employees", label: "Number of employees (optional)", kind: "number", min: 0, max: 1e6, step: "1" },
    { key: "licenceNumber", label: "Existing licence number (optional)", kind: "text", hint: "Useful for renewal, duplicate or amendment requests." },
    { key: "previousLicenseYear", label: "Previous licence year (optional)", kind: "text", showWhen: { key: "application", value: "Renewal" } },
    { ...assessedFee, defaultValue: settings.fees["trade-license"].governmentFee === null ? "" : String(settings.fees["trade-license"].governmentFee) },
    { key: "signboard", label: "Signboard assessment (৳)", kind: "number", defaultValue: settings.fees["trade-license"].chargeDefaults.signboard === null || settings.fees["trade-license"].chargeDefaults.signboard === undefined ? "" : String(settings.fees["trade-license"].chargeDefaults.signboard), hint: "Enter 0 if confirmed not applicable." },
    { key: "extras", label: "Other assessed taxes / charges (৳)", kind: "number", defaultValue: settings.fees["trade-license"].chargeDefaults.extras === null || settings.fees["trade-license"].chargeDefaults.extras === undefined ? "" : String(settings.fees["trade-license"].chargeDefaults.extras), hint: "VAT, source tax or arrears on the fee slip, if any. Enter 0 if none." },
  ];
  if (slug === "trademark") return [
    { key: "brandName", label: "Brand / trademark name", kind: "text", required: true, hint: "Enter the name or identifier you want to protect." },
    { key: "ownerType", label: "Applicant type", kind: "select", options: options("Individual", "Company", "Partnership"), defaultValue: "Company" },
    { key: "markType", label: "Trademark type", kind: "select", options: options("Word mark", "Logo / device", "Combined word and logo"), defaultValue: "Word mark" },
    { key: "stage", label: "Filing stage", kind: "select", options: options("Search", "Application", "Publication", "Registration", "Renewal"), defaultValue: "Application" },
    { key: "goodsServices", label: "Goods / services description (optional)", kind: "textarea", hint: "Briefly describe what the mark will cover." },
    { key: "classes", label: "Nice class numbers", kind: "text", required: true, hint: "Comma-separated, e.g. 9, 35, 42. Goods: 1–34; services: 35–45." },
    { ...assessedFee, label: "Government fee per class (৳)", defaultValue: settings.fees.trademark.governmentFee === null ? "" : String(settings.fees.trademark.governmentFee), hint: "Enter the current DPDT fee for your selected stage." },
    { key: "extras", label: "Other assessed charges (৳)", kind: "number", defaultValue: settings.fees.trademark.chargeDefaults.extras === null || settings.fees.trademark.chargeDefaults.extras === undefined ? "0" : String(settings.fees.trademark.chargeDefaults.extras) },
  ];
  return [
    { key: "certificate", label: "Certificate", kind: "select", options: options("Commercial IRC", "Industrial IRC", "ERC"), defaultValue: "Commercial IRC" },
    { key: "businessType", label: "Trade direction", kind: "select", options: options("Import only", "Export only", "Import and export"), defaultValue: "Import only" },
    { key: "application", label: "Application type", kind: "select", options: options("New registration", "Renewal"), defaultValue: "New registration" },
    { key: "ceiling", label: "Annual import ceiling (৳)", kind: "number", hint: "For IRC only. Use the ceiling on your application." },
    { key: "businessActivity", label: "Business activity (optional)", kind: "text" },
    { key: "chamberMembership", label: "Chamber membership available?", kind: "select", options: options("No", "Yes"), defaultValue: "No", hint: "Membership, bank and late fees are not calculated automatically." },
    { ...assessedFee, defaultValue: settings.fees["irc-erc"].governmentFee === null ? "" : String(settings.fees["irc-erc"].governmentFee) },
    { key: "extras", label: "VAT / other assessed charges (৳)", kind: "number", defaultValue: settings.fees["irc-erc"].chargeDefaults.extras === null || settings.fees["irc-erc"].chargeDefaults.extras === undefined ? "" : String(settings.fees["irc-erc"].chargeDefaults.extras), hint: "Copy from the CCI&E assessment. Enter 0 if none." },
  ];
}
export type ToolValues = Record<string, string>;
export function initialToolValues(fields: ToolField[]): ToolValues { return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ""])); }
export function validateFields(fields: ToolField[], raw: unknown): ToolValues {
  const values = z.record(z.string().max(5000)).parse(raw);
  const clean: ToolValues = {};
  for (const field of fields) {
    const value = (values[field.key] ?? field.defaultValue ?? "").trim();
    if ((field.required || field.kind === "select") && !value) throw new Error(`Enter ${field.label.toLowerCase()}.`);
    if (value && field.kind === "number" && (!/^\d+(\.\d+)?$/.test(value) || Number(value) < (field.min ?? 0) || Number(value) > (field.max ?? 1e12) || (field.step === "1" && !Number.isInteger(Number(value))))) throw new Error(`Check ${field.label.toLowerCase()}: enter a valid non-negative number within the allowed range.`);
    if (value && field.kind === "select" && !field.options?.some((option) => option.value === value)) throw new Error(`Choose a valid ${field.label.toLowerCase()}.`);
    if (value && field.kind === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw new Error(`Enter a valid ${field.label.toLowerCase()}.`);
    clean[field.key] = value;
  }
  return clean;
}
export type CalculationResult = { title: string; total: number; complete: boolean; rows: { label: string; amount: number | null }[]; notes: string[]; sourceUrl: string; year?: string; slabs?: { label: string; rate: number; income: number; tax: number }[] };
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export function calculateTool(slug: ToolSlug, input: unknown, settings: ToolsSettings): { values: ToolValues; result: CalculationResult } {
  if (getTool(slug)?.group !== "calculator") throw new Error("Choose a calculator.");
  const values = validateFields(calculatorFields(slug, settings), input);
  const n = (key: string) => Number(values[key] || 0);
  if (slug === "vat") {
    const base = values.mode === "Including VAT" ? n("amount") / (1 + n("rate") / 100) : n("amount");
    const total = values.mode === "Including VAT" ? n("amount") : base * (1 + n("rate") / 100);
    return { values, result: { title: "Total including VAT", total: round(total), complete: true, rows: [{ label: "Amount before VAT", amount: round(base) }, { label: `VAT at ${n("rate")}%`, amount: round(total) - round(base) }], notes: ["Arithmetic estimate at your selected rate; not a VAT return or tax invoice. Exemptions, reduced rates, VDS, supplementary duty and input credits are not determined here."], sourceUrl: feeSources.vat } };
  }
  if (slug === "income-tax") {
    const year = settings.taxYears.find((item) => item.year === values.year);
    if (!year) throw new Error("This assessment year is not available.");
    const detailedInvestment = ["dps", "securities", "fund", "stocks", "insurance", "provident"].reduce((sum, key) => sum + n(key), 0);
    const investment = detailedInvestment > 0 ? detailedInvestment : n("investment");
    const exemption = values.incomeType === "Private employment salary" ? Math.min(n("income") / 3, year.salaryExemptionCap) : 0;
    const income = Math.max(0, n("income") - exemption);
    const threshold = year.thresholds[values.category as keyof typeof year.thresholds] + n("children") * year.childAllowance;
    let remaining = Math.max(0, income - threshold); let cursor = threshold;
    const slabs = year.bands.map((band) => {
      const taxable = Math.min(remaining, band.width ?? remaining); remaining -= taxable;
      const label = band.width === null ? `Above ${money(cursor)}` : `${money(cursor)} – ${money(cursor + band.width)}`;
      cursor += band.width ?? 0;
      return { label, rate: band.rate, income: round(taxable), tax: round(taxable * band.rate / 100) };
    });
    const grossTax = round(slabs.reduce((sum, slab) => sum + slab.tax, 0));
    const rebate = round(Math.min(grossTax, income * year.rebateIncomeRate / 100, investment * year.rebateInvestmentRate / 100, year.rebateCap));
    const minimum = income > threshold ? (values.newTaxpayer === "Yes" ? year.newTaxpayerMinimum : year.minimumTax) : 0;
    const liability = Math.max(grossTax - rebate, minimum);
    return { values, result: { title: "Estimated amount to pay", total: round(Math.max(0, liability - n("credits"))), complete: true, year: year.year, rows: [{ label: "Employment income exemption", amount: round(exemption) }, { label: "Income after exemptions", amount: round(income) }, { label: "Your tax-free threshold", amount: threshold }, { label: "Tax at slab rates", amount: grossTax }, { label: "Qualifying investment considered", amount: round(investment) }, { label: "Investment rebate applied", amount: -rebate }, { label: "Minimum tax floor", amount: minimum }, { label: "Liability after rebate / minimum", amount: round(liability) }, { label: "Source tax / TDS credit", amount: -n("credits") }, ...(n("credits") > liability ? [{ label: "Excess credit (subject to review)", amount: round(n("credits") - liability) }] : [])], slabs, sourceUrl: year.sourceUrl, notes: ["For ordinary slab-rate income and on-time filing. Business turnover minimum tax, special/final-tax income, wealth/environmental surcharges and late filing adjustments are excluded. Government salary has different exemptions.", "Only use eligible investment amounts and adjustable credits. Detailed investment entries are combined and take priority over the total investment field. Excess credit is not a guaranteed refund. A nil estimate does not establish that no return is required."] } };
  }
  if (slug === "limited-company" && n("paidUp") > n("capital")) throw new Error("Paid-up capital cannot exceed authorised capital.");
  if (slug === "limited-company" && values.nameClearance === "Need a new name clearance") {
    const nameCount = n("nameOptions") || 1;
    if (nameCount >= 2 && !values.name2) throw new Error("Add a second preferred company name or choose one proposed name.");
    if (nameCount >= 3 && !values.name3) throw new Error("Add a third preferred company name or choose fewer proposed names.");
  }
  if (slug === "rjsc" && values.serviceType === "Company registration" && !values.capital) throw new Error("Enter authorised capital for a company-registration assessment.");
  if (slug === "irc-erc" && values.certificate !== "ERC" && !values.ceiling) throw new Error("Enter the annual import ceiling for IRC.");
  if (slug === "irc-erc" && values.certificate === "ERC" && values.businessType === "Import only") throw new Error("Choose export-only or import-and-export for an ERC.");
  if (slug === "irc-erc" && values.certificate !== "ERC" && values.businessType === "Export only") throw new Error("Choose import-only or import-and-export for an IRC.");
  let classes = 1;
  if (slug === "trademark") {
    const tokens = values.classes.split(/[,\s]+/).filter(Boolean);
    if (!tokens.length || tokens.some((token) => !/^\d+$/.test(token) || +token < 1 || +token > 45)) throw new Error("Enter Nice class numbers from 1 to 45, separated by commas.");
    const selected = [...new Set(tokens.map(Number))].sort((a, b) => a - b); classes = selected.length; values.classes = selected.join(", ");
  }
  const config = settings.fees[slug as keyof ToolsSettings["fees"]];
  // A blank authority amount is unknown. Never silently represent it as a zero fee.
  const hasValue = (key: string) => values[key] !== undefined && values[key] !== "";
  const amountOrPending = (key: string) => hasValue(key) ? n(key) : null;
  const assessed = hasValue("governmentFee") ? n("governmentFee") : config.governmentFee;
  const primaryLabel = slug === "trademark"
    ? `Government fee · ${values.stage} · ${classes} class${classes > 1 ? "es" : ""}`
    : slug === "limited-company"
      ? `RJSC registration · ${values.entity}`
      : slug === "rjsc"
        ? `RJSC · ${values.serviceType}${values.entity ? ` · ${values.entity}` : ""}`
        : slug === "trade-license"
          ? `Government assessment · ${values.application}`
          : "Government assessment";
  const rows: CalculationResult["rows"] = [
    { label: primaryLabel, amount: assessed === null ? null : assessed * classes },
    { label: slug === "trademark" ? "Limex support · all selected classes" : "Limex support", amount: config.serviceFee === null ? null : config.serviceFee * classes },
  ];
  if (slug === "limited-company") {
    if (values.nameClearance === "Need a new name clearance") rows.push({ label: `Name clearance · ${n("nameOptions") || 1} proposed name${n("nameOptions") === 1 ? "" : "s"}`, amount: amountOrPending("nameClearanceFee") });
    if (values.tradeLicense === "Yes") rows.push({ label: `Trade licence · ${values.location}`, amount: amountOrPending("tradeFee") });
    if (values.trademark === "Yes") rows.push({ label: "Trademark support", amount: amountOrPending("trademarkFee") });
    if (values.bin === "Yes") rows.push({ label: "BIN / VAT registration support", amount: amountOrPending("binFee") });
    if (values.complianceSupport && values.complianceSupport !== "No ongoing support") rows.push({ label: values.complianceSupport, amount: amountOrPending("complianceFee") });
    rows.push({ label: "Stamp / filing charges", amount: amountOrPending("stampFee") });
  }
  if (slug === "trade-license") rows.push({ label: "Signboard charge", amount: amountOrPending("signboard") });
  rows.push({ label: "Other assessed charges", amount: amountOrPending("extras") });
  const complete = rows.every((row) => row.amount !== null);
  return { values, result: { title: complete ? "Estimated total" : "Known costs so far", complete, total: round(rows.reduce((sum, row) => sum + (row.amount ?? 0), 0)), rows, sourceUrl: config.sourceUrl, notes: [config.note, ...(complete ? [] : ["Pending amounts are not included. Request a fee check to complete this budget."]), "This is a planning estimate, not a quotation or completed government application. A Limex advisor will confirm scope and charges."] } };
}
