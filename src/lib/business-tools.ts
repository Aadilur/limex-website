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
  "limited-company": "https://app1.roc.gov.bd/psp/RJSC_Fees", "trade-license": "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bangladesh/2024/12/3fd15d371e6d410c84ab1d3022364c18.pdf", trademark: "https://dpdt.gov.bd/pages/static-pages/6922e14d933eb65569e2b677", "irc-erc": "https://olm.ccie.gov.bd/",
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
const upperBound = nonNegative.positive().nullable();
const capitalFeeBandSchema = z.object({ upto: upperBound, unit: nonNegative.positive(), feePerUnit: nonNegative }).strict();
const stampFeeBandSchema = z.object({ upto: upperBound, amount: nonNegative }).strict();
const orderedBands = <T extends { upto: number | null }>(bands: T[]) => bands.at(-1)?.upto === null && bands.slice(0, -1).every((band, index, finiteBands) => band.upto !== null && (index === 0 || band.upto > (finiteBands[index - 1]?.upto ?? 0)));
const tradeLicenseTariffSchema = z.object({ key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), label: z.string().min(1).max(180), amount: nullableFee }).strict();
const tradeLicenseRateSchema = z.object({ key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), label: z.string().min(1).max(180), amount: nonNegative, unit: z.string().min(1).max(80) }).strict();
const tradeLicenseSignboardRatesSchema = z.object({ identificationPerSqFt: nonNegative, illuminatedPerSqFt: nonNegative, nonIlluminatedPerSqFt: nonNegative, ledPerSqFt: nonNegative }).strict();
const tradeLicenseAuthoritySchema = z.object({
  tariffRows: z.array(tradeLicenseTariffSchema).min(1).max(400).refine((rows) => new Set(rows.map((row) => row.key)).size === rows.length, "Trade licence tariff keys must be unique."),
  limitedCompanyBands: z.array(stampFeeBandSchema).min(1).max(10).refine(orderedBands, "Limited-company trade licence bands must be ordered and end with an unlimited band."),
  signboardRates: tradeLicenseSignboardRatesSchema,
  vehicleSignboardRates: tradeLicenseSignboardRatesSchema,
  advertisingRates: z.array(tradeLicenseRateSchema).min(1).max(30).refine((rows) => new Set(rows.map((row) => row.key)).size === rows.length, "Advertisement rate keys must be unique."),
  vatRate: z.number().min(0).max(100),
  formFee: nonNegative,
  bookFee: nonNegative,
  otherFee: nonNegative,
  duplicateFee: nullableFee,
  amendmentFee: nullableFee,
  surcharge: z.object({ graceMonth: z.number().int().min(1).max(12), fixedMonthly: nonNegative, percentOfAnnualLicense: z.number().min(0).max(100) }).strict(),
  sourceUrl: publicUrl,
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(1600),
}).strict();
export const tradeLicenseSchema = z.object({ dncc: tradeLicenseAuthoritySchema, dscc: tradeLicenseAuthoritySchema }).strict();
export const companyRegistrationSchema = z.object({
  nameClearanceFee: nonNegative,
  filingFee: nonNegative,
  moaStamp: nonNegative,
  aoaStampBands: z.array(stampFeeBandSchema).min(1).max(6).refine(orderedBands, "Articles of Association stamp bands must be ordered and end with an unlimited band."),
  capitalFeeBands: z.array(capitalFeeBandSchema).min(1).max(6).refine(orderedBands, "Authorized capital fee bands must be ordered and end with an unlimited band."),
  sourceUrl: publicUrl,
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(1000),
}).strict();
export const toolsSettingsSchema = z.object({
  taxYears: z.array(taxYearSchema).min(1).max(10).refine((years) => new Set(years.map((year) => year.year)).size === years.length, "Assessment years must be unique."),
  fees: z.object({ "limited-company": feeSettingSchema, rjsc: feeSettingSchema, "trade-license": feeSettingSchema, trademark: feeSettingSchema, "irc-erc": feeSettingSchema }).strict(),
  companyRegistration: companyRegistrationSchema,
  tradeLicense: tradeLicenseSchema,
}).strict();
export type ToolsSettings = z.infer<typeof toolsSettingsSchema>;
export type ToolsConfig = { version: number; settings: ToolsSettings };
export type TradeLicenseAuthoritySchedule = z.infer<typeof tradeLicenseAuthoritySchema>;
const feeSetting = (slug: string, note: string) => ({ governmentFee: null, serviceFee: null, chargeDefaults: {}, sourceUrl: feeSources[slug], effectiveDate: null, note });
const defaultTradeLicenseTariffs: TradeLicenseAuthoritySchedule["tariffRows"] = [
  { key: "scheduled-bank-financial-institution", label: "Scheduled bank / financial institution", amount: 10000 },
  { key: "insurance-branch", label: "Insurance company branch", amount: 5000 },
  { key: "loan-institution-branch", label: "Loan institution branch", amount: 5000 },
  { key: "money-exchange", label: "Money exchange", amount: 5000 },
  { key: "share-buy-sell-branch", label: "Share buy / sell branch", amount: 3000 },
  { key: "ngo-branch", label: "NGO branch", amount: 5000 },
  { key: "private-university", label: "Private university", amount: 5000 },
  { key: "private-college-school", label: "Private college / large school", amount: 3000 },
  { key: "kindergarten", label: "Kindergarten", amount: 2000 },
  { key: "training-centre", label: "Training centre", amount: 1000 },
  { key: "coaching-centre", label: "Coaching centre", amount: 1000 },
  { key: "computer-training-centre", label: "Computer training centre", amount: 500 },
  { key: "special-category-contractor", label: "Special-category contractor", amount: 6000 },
  { key: "first-grade-contractor", label: "First-grade contractor / construction firm", amount: 4000 },
  { key: "second-grade-contractor", label: "Second-grade contractor", amount: 3000 },
  { key: "third-grade-contractor", label: "Third-grade contractor", amount: 2000 },
  { key: "supplier", label: "Supplier", amount: 2000 },
  { key: "real-estate-developer", label: "Builder / developer / real-estate business", amount: 6000 },
  { key: "indenting-commission-agent", label: "Indenting / commission agent / dealer", amount: 2000 },
  { key: "clearing-forwarding-agent", label: "Clearing and forwarding agent", amount: 2500 },
  { key: "travelling-agent", label: "Travelling agent", amount: 2000 },
  { key: "recruiting-agent", label: "Recruiting agent", amount: 5000 },
  { key: "publication-distributor", label: "Publication distributor", amount: 2000 },
  { key: "publication-importer", label: "Publication importer", amount: 2000 },
  { key: "publication-exporter", label: "Publication exporter", amount: 1000 },
  { key: "auction-agent", label: "Auction agent", amount: 2000 },
  { key: "textile-mill", label: "Textile mill", amount: 4500 },
  { key: "jute-mill", label: "Jute mill", amount: 4000 },
  { key: "iron-steel-mill", label: "Iron / steel mill", amount: 4000 },
  { key: "tannery", label: "Tannery", amount: 5000 },
  { key: "garments-factory", label: "Garments factory", amount: 8000 },
  { key: "pharmaceutical-factory", label: "Pharmaceutical factory", amount: 5000 },
  { key: "chemical-factory", label: "Chemical factory", amount: 3000 },
  { key: "bread-biscuit-factory", label: "Bread / biscuit factory", amount: 1000 },
  { key: "jam-pickle-sauce-factory", label: "Jam / jelly / pickle / sauce factory", amount: 1000 },
  { key: "luggage-factory", label: "Luggage factory", amount: 1000 },
  { key: "cold-storage", label: "Cold storage", amount: 3000 },
  { key: "beverage-factory", label: "Beverage factory", amount: 4000 },
  { key: "ice-cream-factory", label: "Ice-cream factory", amount: 2000 },
  { key: "tobacco-factory", label: "Tobacco factory", amount: 5000 },
  { key: "rice-dal-flour-factory", label: "Rice / dal / flour / semolina / spice mill", amount: 1000 },
  { key: "oil-mill", label: "Oil mill", amount: 1000 },
  { key: "printing-factory", label: "Printing factory", amount: 1000 },
  { key: "pottery", label: "Pottery", amount: 500 },
  { key: "ceramic-products-factory", label: "Ceramic products factory", amount: 2000 },
  { key: "ice-factory", label: "Ice factory", amount: 3000 },
  { key: "block-batik-cloth-printing", label: "Block / batik / cloth-printing business", amount: 1000 },
  { key: "parts-spare-machinery", label: "Parts / spare machinery business", amount: 1000 },
  { key: "engineering-workshop-large", label: "Large engineering workshop", amount: 1500 },
  { key: "engineering-workshop-small", label: "Small engineering workshop", amount: 1000 },
  { key: "motor-workshop-large", label: "Large motor workshop", amount: 2000 },
  { key: "motor-workshop-small", label: "Small motor workshop", amount: 1000 },
  { key: "welding-workshop-large", label: "Large welding workshop", amount: 2000 },
  { key: "welding-workshop-small", label: "Small welding workshop", amount: 1000 },
  { key: "refrigerator-air-cooler-repair", label: "Refrigerator / air-cooler repair", amount: 1000 },
  { key: "vulcanizing-large", label: "Large vulcanizing workshop", amount: 2000 },
  { key: "vulcanizing-small", label: "Small vulcanizing workshop", amount: 1000 },
  { key: "automobile-repair-large", label: "Large automobile repair workshop", amount: 2000 },
  { key: "automobile-repair-small", label: "Small automobile repair workshop", amount: 1000 },
  { key: "restaurant-ac", label: "Air-conditioned restaurant", amount: 2500 },
  { key: "restaurant-non-ac", label: "Non-air-conditioned restaurant", amount: 1000 },
  { key: "mobile-vehicle-restaurant", label: "Mobile / vehicle restaurant", amount: 500 },
  { key: "sweet-shop-large", label: "Large sweet shop", amount: 1200 },
  { key: "sweet-shop-small", label: "Small sweet shop", amount: 1000 },
  { key: "confectionery-large", label: "Large confectionery shop", amount: 2000 },
  { key: "confectionery-small", label: "Small confectionery shop", amount: 1000 },
  { key: "fast-food-shop", label: "Fast-food shop", amount: 3000 },
  { key: "ice-cream-shop", label: "Ice-cream shop", amount: 1000 },
  { key: "hotel-five-star", label: "Five-star residential hotel", amount: 50000 },
  { key: "hotel-four-star", label: "Four-star residential hotel", amount: 35000 },
  { key: "hotel-three-star", label: "Three-star centrally air-conditioned hotel", amount: 25000 },
  { key: "hotel-two-star", label: "Two-star centrally air-conditioned hotel", amount: 15000 },
  { key: "hotel-one-star", label: "One-star centrally air-conditioned hotel", amount: 12000 },
  { key: "hotel-partly-ac", label: "Partly air-conditioned residential hotel", amount: 10000 },
  { key: "hotel-non-ac", label: "Non-air-conditioned residential hotel", amount: 5000 },
  { key: "guest-house-ac", label: "Air-conditioned guest / rest house", amount: 10000 },
  { key: "guest-house-non-ac", label: "Non-air-conditioned guest / rest house", amount: 5000 },
  { key: "private-hostel-up-to-50", label: "Private hostel · up to 50 seats", amount: 5000 },
  { key: "private-hostel-51-100", label: "Private hostel · 51–100 seats", amount: 6000 },
  { key: "private-hostel-over-100", label: "Private hostel · above 100 seats", amount: 10000 },
  { key: "cinema-ac", label: "Air-conditioned cinema", amount: 3000 },
  { key: "cinema-non-ac", label: "Non-air-conditioned cinema", amount: 2000 },
  { key: "community-centre-ac", label: "Air-conditioned community centre", amount: 4000 },
  { key: "community-centre-non-ac", label: "Non-air-conditioned community centre", amount: 3000 },
  { key: "decorator-electric-large", label: "Large electric decorator", amount: 1000 },
  { key: "decorator-electric-small", label: "Small electric decorator", amount: 750 },
  { key: "decorator-general-large", label: "Large general decorator", amount: 2000 },
  { key: "decorator-general-small", label: "Small general decorator", amount: 1000 },
  { key: "carrier-truck-trailer-agency", label: "Carrier / truck / trailer agency", amount: 10000 },
  { key: "bus-truck-ac", label: "Air-conditioned truck / tanker / bus", amount: 500 },
  { key: "bus-truck-non-ac", label: "Non-air-conditioned truck / tanker / bus", amount: 300 },
  { key: "minibus-mini-truck-human-hauler", label: "Minibus / mini truck / human hauler", amount: 200 },
  { key: "microbus", label: "Microbus", amount: 300 },
  { key: "taxi-cab-car", label: "Taxi cab / car", amount: 300 },
  { key: "tempo", label: "Tempo", amount: 200 },
  { key: "battery-taxi", label: "Battery taxi", amount: 100 },
  { key: "rickshaw", label: "Rickshaw business", amount: 100 },
  { key: "medicine-shop", label: "Medicine shop", amount: 1000 },
  { key: "grain-rice-dal-market", label: "Grain / rice / dal / wheat / sugar / oil market", amount: 1000 },
  { key: "jute-cotton-market", label: "Jute / cotton market", amount: 2000 },
  { key: "fruit-vegetable-market", label: "Fruit / vegetable market", amount: 1000 },
  { key: "egg-poultry-market", label: "Egg / poultry market", amount: 500 },
  { key: "fish-market", label: "Fish market", amount: 3000 },
  { key: "furniture-brand", label: "Brand furniture showroom", amount: 20000 },
  { key: "furniture-steel-aluminium", label: "Steel / aluminium furniture", amount: 3000 },
  { key: "furniture-large", label: "Large furniture shop", amount: 3000 },
  { key: "furniture-small", label: "Small furniture shop", amount: 2000 },
  { key: "paint-agency", label: "Paint agency", amount: 2000 },
  { key: "paint-retail", label: "Paint retail shop", amount: 1000 },
  { key: "hardware-materials", label: "Hardware materials shop", amount: 1200 },
  { key: "motorcycle-tyre-large", label: "Large motorcycle / tyre shop", amount: 2500 },
  { key: "motorcycle-tyre-small", label: "Small motorcycle / tyre shop", amount: 2000 },
  { key: "sanitary-ware-large", label: "Large sanitary-ware shop", amount: 2600 },
  { key: "sanitary-ware-small", label: "Small sanitary-ware shop", amount: 2000 },
  { key: "cloth-wholesale", label: "Cloth / sari / lungi wholesale", amount: 1500 },
  { key: "ready-garment-wholesale", label: "Ready-made garment wholesale", amount: 1500 },
  { key: "essential-goods-wholesale", label: "Rice / dal / flour / sugar / oil wholesale", amount: 1000 },
  { key: "essential-goods-retail", label: "Essential-goods retail shop", amount: 500 },
  { key: "cosmetics-large", label: "Large cosmetics / perfumery shop", amount: 2000 },
  { key: "cosmetics-small", label: "Small cosmetics / perfumery shop", amount: 1000 },
  { key: "iron-goods-large", label: "Large iron-goods shop", amount: 4000 },
  { key: "iron-goods-small", label: "Small iron-goods shop", amount: 1000 },
  { key: "spare-parts-wholesale", label: "Spare-parts wholesale", amount: 2000 },
  { key: "spare-parts-retail", label: "Spare-parts retail", amount: 1000 },
  { key: "chain-shop", label: "Chain shop", amount: 5000 },
  { key: "beauty-parlour-ac", label: "Air-conditioned beauty parlour", amount: 5000 },
  { key: "beauty-parlour-non-ac", label: "Non-air-conditioned beauty parlour", amount: 2000 },
  { key: "hair-salon-ac", label: "Air-conditioned hair-dressing salon", amount: 1500 },
  { key: "hair-salon-non-ac", label: "Non-air-conditioned hair-dressing salon", amount: 1000 },
  { key: "hair-salon-small", label: "Small hair-dressing salon", amount: 500 },
  { key: "jewellery-showroom", label: "Jewellery shop with showroom", amount: 8000 },
  { key: "jewellery-without-showroom", label: "Jewellery shop without showroom", amount: 2000 },
  { key: "jewellery-repair", label: "Jewellery repair shop", amount: 1500 },
  { key: "imitation-jewellery-large", label: "Large imitation-jewellery shop", amount: 1000 },
  { key: "imitation-jewellery-small", label: "Small imitation-jewellery shop", amount: 500 },
  { key: "film-producer", label: "Full-length film producer", amount: 3000 },
  { key: "short-film-producer", label: "Short-film producer", amount: 1000 },
  { key: "package-drama", label: "Package drama producer", amount: 2000 },
  { key: "advertisement-producer", label: "Advertisement producer / promoter", amount: 2000 },
  { key: "publishing-institution", label: "Publishing institution", amount: 5000 },
  { key: "book-seller-large", label: "Large book seller", amount: 1000 },
  { key: "book-seller-small", label: "Small book seller", amount: 500 },
  { key: "photo-studio-lab", label: "Photo laboratory", amount: 700 },
  { key: "photo-studio-large", label: "Large photo studio", amount: 500 },
  { key: "photo-studio-small", label: "Small photo studio", amount: 300 },
  { key: "video-game-shop", label: "Video games shop", amount: 1000 },
  { key: "video-vcd-cd-large", label: "Large video / VCD / CD / audio shop", amount: 1000 },
  { key: "video-vcd-cd-small", label: "Small video / VCD / CD / audio shop", amount: 500 },
  { key: "musical-instrument-large", label: "Large musical-instrument shop", amount: 1000 },
  { key: "musical-instrument-small", label: "Small musical-instrument shop", amount: 500 },
  { key: "tobacco-pan-shop", label: "Tobacco / pan / mala shop", amount: 500 },
  { key: "international-courier", label: "International courier / parcel service", amount: 25000 },
  { key: "domestic-courier-goods", label: "Domestic courier with goods transport", amount: 3000 },
  { key: "domestic-courier-letter", label: "Domestic courier with letter transport", amount: 1000 },
  { key: "cable-tv-operator", label: "Cable TV operator", amount: 2000 },
  { key: "phone-internet-cyber-large", label: "Large phone / fax / internet / cyber cafe", amount: 2000 },
  { key: "phone-internet-cyber-small", label: "Small phone / fax / internet / cyber cafe", amount: 1000 },
  { key: "pet-animals", label: "Pet animal shop", amount: 500 },
  { key: "carpentry", label: "Carpentry workshop", amount: 2000 },
  { key: "poultry-fish-meat-shop", label: "Poultry / fish / meat shop", amount: 500 },
  { key: "security-service", label: "Security service", amount: 5000 },
  { key: "dairy-poultry-farm-large", label: "Large dairy / poultry farm", amount: 1500 },
  { key: "dairy-poultry-farm-small", label: "Small dairy / poultry farm", amount: 1000 },
  { key: "sports-goods-large", label: "Large sports-goods shop", amount: 1000 },
  { key: "sports-goods-small", label: "Small sports-goods shop", amount: 500 },
  { key: "poultry-meat-agency-large", label: "Large poultry / meat food agency", amount: 2000 },
  { key: "poultry-meat-agency-small", label: "Small poultry / meat food agency", amount: 1000 },
  { key: "cement-sheet-producer", label: "Cement / CI sheet / angle producer", amount: 5000 },
  { key: "cement-sheet-large", label: "Large cement / CI sheet / angle shop", amount: 3000 },
  { key: "cement-sheet-medium", label: "Medium cement / CI sheet / angle shop", amount: 2000 },
  { key: "cement-sheet-small", label: "Small cement / CI sheet / angle shop", amount: 1000 },
  { key: "ready-made-garments-large", label: "Ready-made garments shop · above 200 sq. ft.", amount: 1000 },
  { key: "ready-made-garments-small", label: "Ready-made garments shop · up to 200 sq. ft.", amount: 500 },
  { key: "sari-panjabi-large", label: "Large sari / panjabi / cloth shop", amount: 3000 },
  { key: "sari-panjabi-medium", label: "Medium sari / panjabi / cloth shop", amount: 2000 },
  { key: "sari-panjabi-small", label: "Small sari / panjabi / cloth shop", amount: 1000 },
  { key: "shoe-shop-wholesale", label: "Large shoe shop / wholesale", amount: 2000 },
  { key: "shoe-shop-retail", label: "Small shoe shop / retail", amount: 1500 },
  { key: "fruit-shop", label: "Fruit shop", amount: 500 },
  { key: "tea-pan-shop", label: "Tea / pan shop", amount: 500 },
  { key: "nursery-large", label: "Large plant nursery", amount: 1000 },
  { key: "nursery-small", label: "Small plant nursery", amount: 500 },
  { key: "flower-seller", label: "Flower seller", amount: 1000 },
  { key: "coconut-cane-bamboo", label: "Coconut / cane / bamboo business", amount: 1000 },
  { key: "warehouse", label: "Warehouse", amount: 10000 },
  { key: "barge-house", label: "Barge house", amount: 5000 },
  { key: "super-shop-mega-mall", label: "Super shop / mega mall", amount: 3000 },
  { key: "big-medium-shopping-mall", label: "Big / medium shopping mall", amount: 2000 },
  { key: "departmental-market", label: "Departmental market", amount: 1500 },
  { key: "departmental-small", label: "Small departmental store", amount: 1000 },
  { key: "laundry-automatic-large", label: "Large automatic laundry", amount: 2000 },
  { key: "laundry-automatic-small", label: "Small automatic laundry", amount: 1000 },
  { key: "laundry-general", label: "General laundry", amount: 500 },
  { key: "motor-parts-lubricant-large", label: "Large motor-parts / lubricant shop", amount: 2000 },
  { key: "motor-parts-lubricant-small", label: "Small motor-parts / lubricant shop", amount: 1000 },
  { key: "tyre-tube-dealer-large", label: "Large tyre / tube dealer", amount: 1000 },
  { key: "tyre-tube-dealer-small", label: "Small tyre / tube dealer", amount: 500 },
  { key: "tyre-tube-dealership", label: "Tyre / tube dealership", amount: 5000 },
  { key: "battery-large", label: "Large battery shop", amount: 2000 },
  { key: "battery-small", label: "Small battery shop", amount: 1000 },
  { key: "tv-fridge-electronics-agency", label: "TV / fridge / electronics shop or agency", amount: 5000 },
  { key: "tv-fridge-electronics-large", label: "Large electronics agency", amount: 2000 },
  { key: "tv-fridge-electronics-small", label: "Small electronics agency", amount: 1000 },
  { key: "tv-fridge-electronics-repair", label: "Electronics repair shop", amount: 500 },
  { key: "electrical-equipment-large", label: "Large electrical-equipment dealer", amount: 1000 },
  { key: "electrical-equipment-small", label: "Small electrical-equipment dealer", amount: 500 },
  { key: "machine-tools-large", label: "Large machine-tools / equipment shop", amount: 2000 },
  { key: "machine-tools-small", label: "Small machine-tools / equipment shop", amount: 1000 },
  { key: "motor-vehicle-showroom-large", label: "Large motor-vehicle dealer / showroom", amount: 5000 },
  { key: "motor-vehicle-showroom-small", label: "Small motor-vehicle dealer / showroom", amount: 3000 },
  { key: "bicycle-seller", label: "Bicycle seller", amount: 1000 },
  { key: "bicycle-parts-large", label: "Large bicycle-parts shop", amount: 1000 },
  { key: "bicycle-parts-small", label: "Small bicycle-parts shop", amount: 500 },
  { key: "rickshaw-shop-large", label: "Large rickshaw shop", amount: 1000 },
  { key: "rickshaw-shop-small", label: "Small rickshaw shop", amount: 500 },
  { key: "foam-large", label: "Large foam shop", amount: 3000 },
  { key: "foam-medium", label: "Medium foam shop", amount: 2000 },
  { key: "foam-small", label: "Small foam shop", amount: 1000 },
  { key: "television-dealer", label: "Television dealer", amount: 3000 },
  { key: "television-seller-large", label: "Large television seller", amount: 2000 },
  { key: "television-seller-small", label: "Small television seller", amount: 1000 },
  { key: "petrol-cng-filling-station", label: "Petrol pump / CNG / filling station", amount: 5000 },
  { key: "lpg-dealer", label: "LPG gas dealer", amount: 7500 },
  { key: "lpg-large", label: "Large LPG gas shop", amount: 3000 },
  { key: "lpg-small", label: "Small LPG gas shop", amount: 2000 },
  { key: "aquarium-fish-birds-large", label: "Large aquarium fish / birds shop", amount: 1000 },
  { key: "aquarium-fish-birds-small", label: "Small aquarium fish / birds shop", amount: 500 },
  { key: "pharmacy-large-wholesale", label: "Large / wholesale pharmacy", amount: 2500 },
  { key: "pharmacy-small", label: "Small pharmacy", amount: 1000 },
  { key: "eyeglass-shop-large", label: "Large eyeglass shop", amount: 1500 },
  { key: "eyeglass-shop-small", label: "Small eyeglass shop", amount: 1000 },
  { key: "advocate", label: "Advocate", amount: 1000 },
  { key: "solicitor-law-adviser-firm", label: "Solicitor / law-adviser firm", amount: 2000 },
  { key: "liquor-shop-bar", label: "Liquor shop / bar", amount: 20000 },
  { key: "meat-shop", label: "Meat shop", amount: 750 },
  { key: "computer-sales-shop", label: "Computer sales shop", amount: 700 },
  { key: "stamp-vendor", label: "Stamp vendor", amount: 1000 },
  { key: "mobile-parts-accessories-large", label: "Large mobile-parts / accessories dealer", amount: 1000 },
  { key: "mobile-parts-accessories-small", label: "Small mobile-parts / accessories dealer", amount: 500 },
  { key: "mobile-agency-large", label: "Large mobile-phone / accessories agency", amount: 5000 },
  { key: "mobile-agency-medium", label: "Medium mobile-phone / accessories agency", amount: 3000 },
  { key: "mobile-agency-small", label: "Small mobile-phone / accessories agency", amount: 2000 },
  { key: "money-lender", label: "Money lender", amount: 5000 },
  { key: "fertilizer-pesticide-agency", label: "Fertilizer / pesticide agency", amount: 2000 },
  { key: "fertilizer-pesticide-retail", label: "Fertilizer / pesticide retail", amount: 1000 },
  { key: "ceramic-factory", label: "Ceramic factory", amount: 10000 },
  { key: "brick-kiln", label: "Brick kiln", amount: 8000 },
  { key: "transport-agency-contractor", label: "Transport agency / contractor", amount: 5000 },
  { key: "cigarette-bidi-wholesale", label: "Cigarette / bidi wholesale or agency", amount: 5000 },
  { key: "handicrafts-handloom", label: "Handicrafts / handloom", amount: 500 },
  { key: "bakery-factory", label: "Bakery factory", amount: 1000 },
  { key: "fish-farm", label: "Fish farm", amount: 2000 },
  { key: "garments-accessories", label: "Garments accessories business", amount: 2000 },
  { key: "brick-sand-cement-large", label: "Large brick / sand / cement / stone business", amount: 2000 },
  { key: "brick-sand-cement-small", label: "Small brick / sand / cement / stone business", amount: 1000 },
  { key: "health-fitness-club", label: "Health / fitness club", amount: 5000 },
  { key: "printing-packaging-hand", label: "Hand-operated printing / packaging press", amount: 750 },
  { key: "printing-packaging-automatic", label: "Automatic printing / packaging press", amount: 3000 },
  { key: "ship-breaking", label: "Ship-breaking business", amount: 25000 },
  { key: "sanitary-factory", label: "Sanitary factory", amount: 1000 },
  { key: "generic-other-income-tax-paid", label: "Other business · income tax paid", amount: 1000 },
  { key: "generic-other-income-tax-not-paid", label: "Other business · income tax not paid", amount: 500 },
  { key: "unlisted-business", label: "Unlisted business · authority assessment required", amount: null },
];
const defaultTradeLicenseAdvertisingRates: TradeLicenseAuthoritySchedule["advertisingRates"] = [
  { key: "cutout-under-10-feet", label: "Temporary cutout · under 10 ft", amount: 10000, unit: "per month" },
  { key: "cutout-under-5-feet", label: "Temporary cutout · under 5 ft", amount: 5000, unit: "per month" },
  { key: "balloon", label: "Advertising balloon", amount: 10000, unit: "per month" },
  { key: "commercial-gate-toran", label: "Commercial gate / toran", amount: 20000, unit: "per month" },
  { key: "non-commercial-gate-toran", label: "Non-commercial gate / toran", amount: 5000, unit: "per month" },
  { key: "festoon-banner", label: "Festoon / banner", amount: 500, unit: "per 30 days" },
  { key: "large-poster", label: "Large poster · maximum 3 × 2 ft", amount: 10, unit: "per day" },
  { key: "small-poster", label: "Small poster · maximum 1.5 × 1 ft", amount: 7, unit: "per day" },
  { key: "canvas-ad", label: "Canvas advertisement in wood frame", amount: 30000, unit: "per month" },
  { key: "moving-ad", label: "Moving advertisement", amount: 30000, unit: "per month" },
];
const defaultTradeLicenseAuthority = (formFee: number, sourceUrl: string): TradeLicenseAuthoritySchedule => ({
  tariffRows: defaultTradeLicenseTariffs,
  limitedCompanyBands: [
    { upto: 100000, amount: 1500 }, { upto: 500000, amount: 2000 }, { upto: 1000000, amount: 3500 }, { upto: 2500000, amount: 4500 },
    { upto: 5000000, amount: 5500 }, { upto: 10000000, amount: 7500 }, { upto: 50000000, amount: 10000 }, { upto: null, amount: 12000 },
  ],
  signboardRates: { identificationPerSqFt: 80, illuminatedPerSqFt: 300, nonIlluminatedPerSqFt: 150, ledPerSqFt: 20000 },
  vehicleSignboardRates: { identificationPerSqFt: 0, illuminatedPerSqFt: 150, nonIlluminatedPerSqFt: 100, ledPerSqFt: 10000 },
  advertisingRates: defaultTradeLicenseAdvertisingRates,
  vatRate: 15,
  formFee,
  bookFee: 270,
  otherFee: 500,
  duplicateFee: null,
  amendmentFee: null,
  surcharge: { graceMonth: 9, fixedMonthly: 100, percentOfAnnualLicense: 10 },
  sourceUrl,
  effectiveDate: "2016-01-31",
  note: "The seeded tariff rows follow the Dhaka North, Dhaka South and Chattogram column of the City Corporation Model Tax Schedule, 2016 (Gazette 31 January 2016). The licence fee is annual and may be collected for up to five years. Signboard, advertisement, VAT, form, book, other fee, source tax, arrears and late-renewal surcharge are shown separately because the final e-revenue assessment can vary by case. Confirm current assessment before payment.",
});
export const defaultToolsSettings: ToolsSettings = {
  taxYears: [{ year: "2026-27", thresholds: { general: 400000, female: 450000, senior: 450000, disability: 525000, thirdGender: 525000, freedom: 550000, july: 550000 }, bands: [{ width: 300000, rate: 10 }, { width: 400000, rate: 15 }, { width: 500000, rate: 20 }, { width: 2000000, rate: 25 }, { width: null, rate: 30 }], salaryExemptionCap: 500000, rebateInvestmentRate: 10, rebateIncomeRate: 3, rebateCap: 750000, minimumTax: 5000, newTaxpayerMinimum: 1000, childAllowance: 50000, sourceUrl: taxGuideUrl }],
  fees: {
    "limited-company": { ...feeSetting("limited-company", "The Limex support fee is editable by an administrator. Government charges below follow the published RJSC schedule and remain a planning estimate until the authority assesses the filing."), serviceFee: 10000 },
    rjsc: feeSetting("rjsc", "Use the fee assessment from RJSC for the selected entity and capital. Do not count stamp or filing charges twice if already included in the assessment."),
    "trade-license": feeSetting("trade-license", "Licence and signboard charges depend on the authority and business activity. Enter the amounts on your authority’s assessment; blank amounts remain pending, not zero."),
    trademark: feeSetting("trademark", "Fees are per class and filing stage. Search, application, publication and registration are separate stages. This tool does not check trademark availability."),
    "irc-erc": feeSetting("irc-erc", "Use the CCI&E assessment for your registration type, import ceiling and new/renewal application. Chamber membership, bank charges and late fees may be additional."),
  },
  companyRegistration: {
    nameClearanceFee: 500,
    filingFee: 1200,
    moaStamp: 1000,
    aoaStampBands: [{ upto: 1000000, amount: 2000 }, { upto: 30000000, amount: 4000 }, { upto: null, amount: 10000 }],
    capitalFeeBands: [{ upto: 1000000, unit: 1, feePerUnit: 0 }, { upto: 5000000, unit: 100000, feePerUnit: 80 }, { upto: null, unit: 100000, feePerUnit: 130 }],
    sourceUrl: feeSources["limited-company"],
    effectiveDate: "2026-09-05",
    note: "Reviewed against the current RJSC fee schedule: name clearance is ৳500 per proposed name; filing is ৳1,200; MoA stamp is ৳1,000; AoA stamp is ৳2,000 up to ৳10 lakh, ৳4,000 up to ৳3 crore and ৳10,000 above; authorized-capital fees are nil up to ৳10 lakh, then ৳80 per ৳1 lakh or part up to ৳50 lakh and ৳130 per ৳1 lakh or part above that. Confirm the final assessment before filing.",
  },
  tradeLicense: {
    dncc: defaultTradeLicenseAuthority(0, "https://erevenue.dncc.gov.bd/cp/cportal/cp/northcc.aspx/index.html"),
    dscc: defaultTradeLicenseAuthority(50, "https://erevenue.dscc.gov.bd/cp/cportal/cp/southcc.aspx"),
  },
};

function mergeScheduleRows<T extends { key: string }>(defaults: T[], current: T[]) {
  const currentByKey = new Map(current.map((row) => [row.key, row]));
  const known = new Set(defaults.map((row) => row.key));
  return [...defaults.map((row) => currentByKey.get(row.key) ?? row), ...current.filter((row) => !known.has(row.key))];
}
export function normalizeToolsSettings(input: unknown): ToolsSettings {
  const raw = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const parsed = toolsSettingsSchema.parse({ ...raw, tradeLicense: raw.tradeLicense ?? defaultToolsSettings.tradeLicense });
  const normalizeAuthority = (authority: "dncc" | "dscc"): TradeLicenseAuthoritySchedule => ({
    ...parsed.tradeLicense[authority],
    tariffRows: mergeScheduleRows(defaultToolsSettings.tradeLicense[authority].tariffRows, parsed.tradeLicense[authority].tariffRows),
    advertisingRates: mergeScheduleRows(defaultToolsSettings.tradeLicense[authority].advertisingRates, parsed.tradeLicense[authority].advertisingRates),
  });
  return { ...parsed, tradeLicense: { dncc: normalizeAuthority("dncc"), dscc: normalizeAuthority("dscc") } };
}

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
  if (slug === "limited-company") return [
    { key: "entity", label: "Company type", kind: "select", options: options("Private limited company", "One-person company (OPC)"), defaultValue: "Private limited company" },
    { key: "capital", label: "Authorised capital (৳)", kind: "number", required: true, defaultValue: "1000000", min: 1, hint: "The amount registered with RJSC. The statutory fee changes by capital tier." },
    { key: "nameClearance", label: "Name clearance", kind: "select", options: options("Need name clearance", "Already have name clearance"), defaultValue: "Need name clearance" },
    { key: "nameOptions", label: "Proposed names", kind: "number", defaultValue: "1", min: 1, max: 3, step: "1", hint: "RJSC charges per proposed name.", showWhen: { key: "nameClearance", value: "Need name clearance" } },
  ];
  if (slug === "rjsc") {
    const fee = settings.fees.rjsc;
    const governmentFee = { ...assessedFee, defaultValue: fee.governmentFee === null ? "" : String(fee.governmentFee) };
    return [
      { key: "entity", label: "Entity type", kind: "select", options: options("Private limited company", "One-person company", "Public limited company", "Foreign branch"), defaultValue: "Private limited company" },
      { key: "serviceType", label: "RJSC service", kind: "select", options: options("Company registration", "Name clearance", "Annual return filing", "Director / shareholder change", "Share transfer / allotment", "Registered office change", "Capital increase"), defaultValue: "Company registration" },
      { key: "capital", label: "Authorised capital (৳)", kind: "number", required: true, defaultValue: "1000000", min: 1, hint: "Used for company registration and capital increase; RJSC fees change by capital tier.", showWhen: { key: "serviceType", values: ["Company registration", "Capital increase"] } },
      { key: "companyName", label: "Company / file name (optional)", kind: "text" },
      governmentFee,
      { key: "extras", label: "Other confirmed charges (৳)", kind: "number", defaultValue: fee.chargeDefaults.extras === null || fee.chargeDefaults.extras === undefined ? "" : String(fee.chargeDefaults.extras), hint: "Only add a charge from the RJSC assessment that is not already included." },
    ];
  }
  if (slug === "trade-license") {
    const tariffRows = [...settings.tradeLicense.dncc.tariffRows, ...settings.tradeLicense.dscc.tariffRows].filter((row, index, rows) => !row.key.startsWith("limited-company-") && rows.findIndex((item) => item.key === row.key) === index);
    const fee = settings.fees["trade-license"];
    const noSignboard = "No signboard / advertisement";
    const signboardTypes = [noSignboard, "Business identification signboard", "Illuminated advertisement", "Non-illuminated advertisement", "LED advertisement"];
    const noAdvertisement = "No additional advertisement";
    return [
      { key: "authority", label: "Local authority", kind: "select", options: options("Dhaka North City Corporation", "Dhaka South City Corporation", "Other city corporation", "Municipality", "Union Parishad"), defaultValue: "Dhaka North City Corporation", hint: "Dhaka North and Dhaka South use the seeded city-corporation schedule. Other authorities need their own assessment." },
      { key: "structure", label: "Business structure", kind: "select", options: options("Sole proprietorship", "Partnership", "Private limited company", "One-person company"), defaultValue: "Sole proprietorship" },
      { key: "paidUpCapital", label: "Paid-up capital (৳)", kind: "number", required: true, defaultValue: "1000000", min: 1, showWhen: { key: "structure", values: ["Private limited company", "One-person company"] }, hint: "For a limited company, the city-corporation tariff is selected by paid-up capital." },
      { key: "businessType", label: "Business category", kind: "select", options: tariffRows.map((row) => ({ value: row.key, label: row.label })), defaultValue: tariffRows.find((row) => row.key === "generic-other-income-tax-paid")?.key ?? tariffRows[0]?.key, hint: "Choose the closest official tariff row. The final authority assessment controls." },
      { key: "activity", label: "Business activity (optional)", kind: "text", hint: "Add a plain-language description if the category needs context." },
      { key: "application", label: "Application type", kind: "select", options: options("New licence", "Renewal", "Duplicate", "Amendment"), defaultValue: "New licence" },
      { key: "licenseYears", label: "Licence period (years)", kind: "number", required: true, defaultValue: "1", min: 1, max: 5, step: "1", showWhen: { key: "application", values: ["New licence", "Renewal"] }, hint: "The model schedule allows advance collection for up to five years." },
      { key: "signboardType", label: "Signboard / advertising", kind: "select", options: options(...signboardTypes), defaultValue: noSignboard },
      { key: "signboardPlacement", label: "Advertisement placement", kind: "select", options: options("On business property / private land", "Roadside or vehicle"), defaultValue: "On business property / private land", showWhen: { key: "signboardType", values: ["Illuminated advertisement", "Non-illuminated advertisement", "LED advertisement"] } },
      { key: "signboardArea", label: "Signboard area (sq. ft.)", kind: "number", required: true, min: 0.01, max: 1e8, showWhen: { key: "signboardType", values: ["Business identification signboard", "Illuminated advertisement", "Non-illuminated advertisement", "LED advertisement"] }, hint: "Measure the chargeable face area." },
      { key: "advertisementType", label: "Temporary advertisement add-on", kind: "select", options: [noAdvertisement, ...settings.tradeLicense.dncc.advertisingRates, ...settings.tradeLicense.dscc.advertisingRates].filter((item, index, rows) => typeof item === "string" || rows.findIndex((row) => typeof row !== "string" && typeof item !== "string" && row.key === item.key) === index).map((item) => typeof item === "string" ? { value: item, label: item } : { value: item.key, label: `${item.label} · ${item.amount.toLocaleString("en-BD")} ${item.unit}` }), defaultValue: noAdvertisement, hint: "Optional city advertisement tax. Quantity means months, days or 30-day periods as shown." },
      { key: "advertisementUnits", label: "Advertisement quantity / periods", kind: "number", required: true, defaultValue: "1", min: 1, max: 1e6, step: "1", showWhen: { key: "advertisementType", values: settings.tradeLicense.dncc.advertisingRates.map((row) => row.key).concat(settings.tradeLicense.dscc.advertisingRates.map((row) => row.key)) }, hint: "For example, 2 months or 5 daily posters." },
      { key: "sourceTax", label: "Income / source tax assessment (৳)", kind: "number", min: 0, defaultValue: fee.chargeDefaults.sourceTax === null || fee.chargeDefaults.sourceTax === undefined ? "" : String(fee.chargeDefaults.sourceTax), hint: "Copy this only when it appears on the authority assessment; it is not universal." },
      { key: "arrears", label: "Arrears (৳)", kind: "number", min: 0, defaultValue: "0", hint: "Past unpaid amount, if shown on a renewal assessment." },
      { key: "lateMonths", label: "Late-renewal months", kind: "number", required: true, min: 0, max: 120, step: "1", defaultValue: "0", showWhen: { key: "application", value: "Renewal" }, hint: "The model schedule applies the higher of ৳100 or 10% of the annual licence fee per late month after September." },
      { key: "caseFee", label: "Duplicate / amendment fee (৳)", kind: "number", required: true, min: 0, defaultValue: "", showWhen: { key: "application", values: ["Duplicate", "Amendment"] }, hint: "Enter the amount on the authority assessment when no published default is configured." },
      { key: "area", label: "Area / zone (optional)", kind: "text", hint: "For example: Gulshan or Dhanmondi." },
      { key: "ward", label: "Ward number (optional)", kind: "text" },
      { key: "address", label: "Business address (optional)", kind: "textarea" },
      { ...assessedFee, defaultValue: fee.governmentFee === null ? "" : String(fee.governmentFee), showWhen: { key: "authority", values: ["Other city corporation", "Municipality", "Union Parishad"] }, hint: "Use the fee slip when this authority is not DNCC or DSCC." },
      { key: "signboard", label: "Other-authority signboard charge (৳)", kind: "number", defaultValue: fee.chargeDefaults.signboard === null || fee.chargeDefaults.signboard === undefined ? "" : String(fee.chargeDefaults.signboard), showWhen: { key: "authority", values: ["Other city corporation", "Municipality", "Union Parishad"] }, hint: "Optional assessed amount for a non-Dhaka authority." },
      { key: "extras", label: "Other assessed charges (৳)", kind: "number", defaultValue: fee.chargeDefaults.extras === null || fee.chargeDefaults.extras === undefined ? "" : String(fee.chargeDefaults.extras), showWhen: { key: "authority", values: ["Other city corporation", "Municipality", "Union Parishad"] }, hint: "VAT, source tax or any confirmed charge not already listed." },
    ];
  }
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
    if (field.showWhen && ("value" in field.showWhen ? values[field.showWhen.key] !== field.showWhen.value : !field.showWhen.values.includes(values[field.showWhen.key]))) continue;
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
function feeFromBands(value: number, bands: { upto: number | null; unit: number; feePerUnit: number }[]) {
  let total = 0;
  let previous = 0;
  for (const band of bands) {
    const upper = band.upto ?? Number.POSITIVE_INFINITY;
    const portion = Math.max(0, Math.min(value, upper) - previous);
    if (portion > 0) total += Math.ceil(portion / band.unit) * band.feePerUnit;
    if (value <= upper) break;
    previous = upper;
  }
  return round(total);
}
function amountFromBands(value: number, bands: { upto: number | null; amount: number }[]) {
  return bands.find((band) => band.upto === null || value <= band.upto)?.amount ?? bands.at(-1)?.amount ?? 0;
}
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
  if (slug === "limited-company") {
    const schedule = settings.companyRegistration;
    const capital = n("capital");
    const nameCount = values.nameClearance === "Need name clearance" ? n("nameOptions") || 1 : 0;
    const rows: CalculationResult["rows"] = [
      { label: "RJSC filing fee · 6 documents", amount: schedule.filingFee },
      { label: "Memorandum of Association stamp", amount: schedule.moaStamp },
      { label: "Articles of Association stamp", amount: amountFromBands(capital, schedule.aoaStampBands) },
      { label: "Authorised share capital fee", amount: feeFromBands(capital, schedule.capitalFeeBands) },
      ...(nameCount ? [{ label: `Name clearance · ${nameCount} proposed name${nameCount === 1 ? "" : "s"}`, amount: round(nameCount * schedule.nameClearanceFee) }] : []),
      { label: "Limex professional service", amount: settings.fees["limited-company"].serviceFee },
    ];
    const complete = rows.every((row) => row.amount !== null);
    return { values, result: { title: complete ? "Estimated company setup cost" : "Known company setup costs", total: round(rows.reduce((sum, row) => sum + (row.amount ?? 0), 0)), complete, rows, sourceUrl: schedule.sourceUrl, notes: [schedule.note, "Government rows follow the published RJSC schedule. The Limex professional service fee is editable by an administrator. Final assessment can vary by entity, filing scope and any additional authority charge."] } };
  }

  if (slug === "trade-license" && ["Dhaka North City Corporation", "Dhaka South City Corporation"].includes(values.authority)) {
    const authorityKey = values.authority === "Dhaka South City Corporation" ? "dscc" : "dncc";
    const schedule = settings.tradeLicense[authorityKey];
    const fee = settings.fees["trade-license"];
    const application = values.application;
    const isAnnualApplication = application === "New licence" || application === "Renewal";
    const companyStructure = values.structure === "Private limited company" || values.structure === "One-person company";
    const annualFee = companyStructure
      ? amountFromBands(n("paidUpCapital"), schedule.limitedCompanyBands)
      : schedule.tariffRows.find((row) => row.key === values.businessType)?.amount ?? null;
    const years = isAnnualApplication ? n("licenseYears") || 1 : 0;
    const licenceFee = annualFee === null ? null : round(annualFee * years);
    const signboardType = values.signboardType;
    const signboardRateKey = signboardType === "Business identification signboard" ? "identificationPerSqFt" : signboardType === "Illuminated advertisement" ? "illuminatedPerSqFt" : signboardType === "Non-illuminated advertisement" ? "nonIlluminatedPerSqFt" : signboardType === "LED advertisement" ? "ledPerSqFt" : null;
    const signboardRates = values.signboardPlacement === "Roadside or vehicle" ? schedule.vehicleSignboardRates : schedule.signboardRates;
    const signboardFee = signboardRateKey ? round(n("signboardArea") * signboardRates[signboardRateKey]) : 0;
    const advertisement = values.advertisementType === "No additional advertisement" ? null : schedule.advertisingRates.find((row) => row.key === values.advertisementType);
    const advertisementFee = advertisement ? round(advertisement.amount * n("advertisementUnits")) : 0;
    const caseFee = isAnnualApplication ? 0 : (values.caseFee !== "" ? n("caseFee") : application === "Duplicate" ? schedule.duplicateFee : schedule.amendmentFee);
    const taxableBase = licenceFee ?? caseFee;
    const vat = taxableBase === null ? null : round((taxableBase + signboardFee + advertisementFee) * schedule.vatRate / 100);
    const lateMonths = application === "Renewal" ? n("lateMonths") : 0;
    const surcharge = lateMonths > 0 && annualFee !== null ? round(Math.max(schedule.surcharge.fixedMonthly, annualFee * schedule.surcharge.percentOfAnnualLicense / 100) * lateMonths) : 0;
    const sourceTax = values.sourceTax === "" ? null : n("sourceTax");
    const rows: CalculationResult["rows"] = [
      ...(isAnnualApplication ? [{ label: `Trade licence / renewal fee · ${years} year${years === 1 ? "" : "s"}`, amount: licenceFee }] : []),
      ...(signboardRateKey ? [{ label: `Signboard tax · ${signboardType}`, amount: signboardFee }] : []),
      ...(advertisement ? [{ label: `Advertisement tax · ${advertisement.label}`, amount: advertisementFee }] : []),
      { label: `VAT · ${schedule.vatRate}%`, amount: vat },
      { label: "Income / source tax · authority assessment", amount: sourceTax },
      { label: `Late-renewal surcharge · ${lateMonths} month${lateMonths === 1 ? "" : "s"}`, amount: surcharge },
      { label: "Arrears", amount: n("arrears") },
      ...(application === "Duplicate" || application === "Amendment" ? [{ label: `${application} authority fee`, amount: caseFee }] : []),
      { label: "Application form", amount: schedule.formFee },
      { label: "Licence book", amount: schedule.bookFee },
      { label: "Other authority fee", amount: schedule.otherFee },
      { label: "Limex support", amount: fee.serviceFee },
    ];
    const complete = rows.every((row) => row.amount !== null);
    return { values, result: {
      title: complete ? `${values.authority} estimate` : `${values.authority} known costs so far`,
      total: round(rows.reduce((sum, row) => sum + (row.amount ?? 0), 0)),
      complete,
      rows,
      sourceUrl: schedule.sourceUrl,
      notes: [
        schedule.note,
        `The selected tariff is ${companyStructure ? "based on paid-up capital" : "the selected business category"}. Signboard and advertisement tax are calculated per the selected area and placement.`,
        `VAT is an editable ${schedule.vatRate}% planning default observed in official e-revenue receipt line items; source tax, arrears and case fees must follow the authority assessment.`,
        ...(complete ? [] : ["To confirm amounts are not included in the total. Add the authority-assessed source tax and Limex support fee when known."]),
        "This is a planning estimate, not a quotation or completed government application. Confirm the final assessment before payment.",
      ],
    } };
  }

  if (slug === "rjsc" && ["Company registration", "Capital increase"].includes(values.serviceType) && !values.capital) throw new Error("Enter authorised capital for this RJSC assessment.");
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
    : slug === "rjsc"
      ? `RJSC · ${values.serviceType}${values.entity ? ` · ${values.entity}` : ""}`
      : slug === "trade-license"
        ? `Government assessment · ${values.application}`
        : "Government assessment";
  const rows: CalculationResult["rows"] = [
    { label: primaryLabel, amount: assessed === null ? null : assessed * classes },
    { label: slug === "trademark" ? "Limex support · all selected classes" : "Limex support", amount: config.serviceFee === null ? null : config.serviceFee * classes },
  ];
  if (slug === "trade-license") rows.push({ label: "Signboard charge", amount: amountOrPending("signboard") });
  rows.push({ label: "Other assessed charges", amount: amountOrPending("extras") });
  const complete = rows.every((row) => row.amount !== null);
  return { values, result: { title: complete ? "Estimated total" : "Known costs so far", complete, total: round(rows.reduce((sum, row) => sum + (row.amount ?? 0), 0)), rows, sourceUrl: config.sourceUrl, notes: [config.note, ...(complete ? [] : ["Pending amounts are not included. Request a fee check to complete this budget."]), "This is a planning estimate, not a quotation or completed government application. A Limex advisor will confirm scope and charges."] } };
}
