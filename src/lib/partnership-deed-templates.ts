import {
  defaultTemplateSettings,
  type DocumentTemplateDraft,
  type TemplateBlock,
  type TemplateField,
  type TemplatePage,
  type TemplateRepeater,
  type TemplateRepeaterField,
  type TemplateSettings,
  type TemplateVisibilityRule,
} from "./document-templates";

type Language = "en" | "bn";

export const partnershipDeedMinPartners = 2;
export const partnershipDeedMaxPartners = 8;
const partnershipPartnerNumbers = Array.from(
  { length: partnershipDeedMaxPartners },
  (_, index) => index + 1,
);

export function partnershipPartnerVisibility(partnerNumber: number): TemplateVisibilityRule {
  return {
    fieldKey: "partner_count",
    values: Array.from({ length: partnershipDeedMaxPartners - partnerNumber + 1 }, (_, index) => String(partnerNumber + index)),
  };
}

function copy(language: Language, english: string, bangla: string) {
  return language === "bn" ? bangla : english;
}

function textField(
  id: string,
  key: string,
  language: Language,
  englishLabel: string,
  banglaLabel: string,
  englishPlaceholder: string,
  banglaPlaceholder: string,
  required = true,
): TemplateField {
  return {
    id,
    key,
    label: copy(language, englishLabel, banglaLabel),
    type: "text",
    required,
    placeholder: copy(language, englishPlaceholder, banglaPlaceholder),
    options: [],
  };
}

function areaField(
  id: string,
  key: string,
  language: Language,
  englishLabel: string,
  banglaLabel: string,
  englishPlaceholder: string,
  banglaPlaceholder: string,
  required = true,
): TemplateField {
  return {
    id,
    key,
    label: copy(language, englishLabel, banglaLabel),
    type: "textarea",
    required,
    placeholder: copy(language, englishPlaceholder, banglaPlaceholder),
    options: [],
  };
}

function dateField(id: string, key: string, language: Language, englishLabel: string, banglaLabel: string, required = true): TemplateField {
  return {
    id,
    key,
    label: copy(language, englishLabel, banglaLabel),
    type: "date",
    required,
    placeholder: "",
    options: [],
  };
}

function numberField(
  id: string,
  key: string,
  language: Language,
  englishLabel: string,
  banglaLabel: string,
  placeholder: string,
  required = true,
): TemplateField {
  return {
    id,
    key,
    label: copy(language, englishLabel, banglaLabel),
    type: "number",
    required,
    placeholder,
    options: [],
  };
}

function selectField(id: string, key: string, language: Language): TemplateField {
  return {
    id,
    key,
    label: copy(language, "Number of partners", "অংশীদারের সংখ্যা"),
    type: "select",
    required: true,
    placeholder: copy(language, "Choose the number of partners", "অংশীদারের সংখ্যা নির্বাচন করুন"),
    options: partnerCountOptions(language, partnershipDeedMaxPartners),
    defaultValue: String(partnershipDeedMinPartners),
  };
}

function witnessFields(language: Language): TemplateField[] {
  return [
    areaField("partnership-witness-1", "witness_1", language, "Witness 1 name and address", "সাক্ষী ১-এর নাম ও ঠিকানা", "Full name and address", "পূর্ণ নাম ও ঠিকানা"),
    areaField("partnership-witness-2", "witness_2", language, "Witness 2 name and address", "সাক্ষী ২-এর নাম ও ঠিকানা", "Full name and address", "পূর্ণ নাম ও ঠিকানা"),
    areaField("partnership-witness-3", "witness_3", language, "Witness 3 name and address", "সাক্ষী ৩-এর নাম ও ঠিকানা", "Full name and address", "পূর্ণ নাম ও ঠিকানা"),
  ];
}

function partnerCountOptions(language: Language, maxPartners: number, existingOptions: TemplateField["options"] = []) {
  const existingLabels = new Map(existingOptions.map((option) => [option.value, option.label]));
  return Array.from({ length: Math.max(0, maxPartners - partnershipDeedMinPartners + 1) }, (_, index) => {
    const number = partnershipDeedMinPartners + index;
    const banglaNumber = String(number).replace(/[0-9]/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)] ?? digit);
    return { value: String(number), label: existingLabels.get(String(number)) ?? copy(language, `${number} partner${number === 1 ? "" : "s"}`, `${banglaNumber} জন`) };
  });
}

type PartnerFieldDefinition = {
  key: "name" | "details" | "role" | "capital" | "capital_words" | "profit_share";
  type: TemplateField["type"];
  required: boolean;
  englishLabel: string;
  banglaLabel: string;
  englishItemLabel: string;
  banglaItemLabel: string;
  englishPlaceholder: string;
  banglaPlaceholder: string;
};

const partnerFieldDefinitions: PartnerFieldDefinition[] = [
  { key: "name", type: "text", required: true, englishLabel: "Partner {index} name", banglaLabel: "অংশীদার {index}-এর নাম", englishItemLabel: "Name", banglaItemLabel: "নাম", englishPlaceholder: "Full legal name", banglaPlaceholder: "পূর্ণ আইনগত নাম" },
  { key: "details", type: "textarea", required: true, englishLabel: "Partner {index} identity and address", banglaLabel: "অংশীদার {index}-এর পরিচয় ও ঠিকানা", englishItemLabel: "Identity and address", banglaItemLabel: "পরিচয় ও ঠিকানা", englishPlaceholder: "Father or spouse, mother, present and permanent address, NID, TIN, date of birth, religion, occupation and nationality", banglaPlaceholder: "পিতা বা স্বামী, মাতা, বর্তমান ও স্থায়ী ঠিকানা, এনআইডি, টিআইএন, জন্মতারিখ, ধর্ম, পেশা ও জাতীয়তা" },
  { key: "role", type: "text", required: true, englishLabel: "Partner {index} designation", banglaLabel: "অংশীদার {index}-এর পদবী", englishItemLabel: "Designation", banglaItemLabel: "পদবী", englishPlaceholder: "Partner designation", banglaPlaceholder: "অংশীদারের পদবী" },
  { key: "capital", type: "number", required: false, englishLabel: "Partner {index} capital (BDT)", banglaLabel: "অংশীদার {index}-এর মূলধন (টাকা)", englishItemLabel: "Capital (BDT)", banglaItemLabel: "মূলধন (টাকা)", englishPlaceholder: "Optional", banglaPlaceholder: "ঐচ্ছিক" },
  { key: "capital_words", type: "text", required: false, englishLabel: "Partner {index} capital in words", banglaLabel: "অংশীদার {index}-এর মূলধন কথায়", englishItemLabel: "Capital in words", banglaItemLabel: "মূলধন কথায়", englishPlaceholder: "Optional", banglaPlaceholder: "ঐচ্ছিক" },
  { key: "profit_share", type: "text", required: true, englishLabel: "Partner {index} profit/loss share", banglaLabel: "অংশীদার {index}-এর লাভ-লোকসানের অনুপাত", englishItemLabel: "Profit/loss share", banglaItemLabel: "লাভ-লোকসানের অনুপাত", englishPlaceholder: "Agreed percentage", banglaPlaceholder: "সম্মত শতাংশ" },
];

function partnerRepeaterFields(language: Language): TemplateRepeaterField[] {
  return partnerFieldDefinitions.map((definition) => ({
    id: `partnership-partner-field-${definition.key}`,
    key: definition.key,
    label: copy(language, definition.englishItemLabel, definition.banglaItemLabel),
    type: definition.type,
    required: definition.required,
    placeholder: copy(language, definition.englishPlaceholder, definition.banglaPlaceholder),
    options: [],
    sourceKeyPattern: `partner_{index}_${definition.key}`,
  }));
}

function partnershipPartnerRepeater(language: Language): TemplateRepeater {
  return {
    id: "partnership-partners",
    key: "partners",
    label: copy(language, "Partner slots", "অংশীদারদের তথ্য"),
    itemLabel: copy(language, "Partner", "অংশীদার"),
    description: copy(language, "Starts at 2 partners and supports up to 8. Unused slots stay hidden in the form and document.", "২ জন অংশীদার থেকে শুরু করে সর্বোচ্চ ৮ জন পর্যন্ত যোগ করা যাবে। ব্যবহার না করা ঘর ফর্ম ও দলিলে দেখা যাবে না।"),
    countFieldKey: "partner_count",
    minItems: partnershipDeedMinPartners,
    maxItems: partnershipDeedMaxPartners,
    fields: partnerRepeaterFields(language),
  };
}

function partnerFieldsForSlot(language: Language, number: number): TemplateField[] {
  const visibility = partnershipPartnerVisibility(number);
  return partnerFieldDefinitions.map((definition) => ({
    id: `partnership-partner-${number}-${definition.key}`,
    key: `partner_${number}_${definition.key}`,
    label: copy(language, definition.englishLabel.replace("{index}", String(number)), definition.banglaLabel.replace("{index}", String(number))),
    type: definition.type,
    required: definition.required,
    placeholder: copy(language, definition.englishPlaceholder, definition.banglaPlaceholder),
    options: [],
    visibleWhen: visibility,
  }));
}

function textBlock(
  id: string,
  type: "title" | "heading" | "paragraph",
  text: string,
  options: Partial<Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>> = {},
): TemplateBlock {
  return {
    id,
    type,
    text,
    align: "left",
    bold: type !== "paragraph",
    italic: false,
    fontSize: type === "title" ? "title" : type === "heading" ? "subtitle" : "body",
    ...options,
  };
}

function signatureBlock(id: string, label: string, visibleWhen?: TemplateVisibilityRule, options: Partial<Extract<TemplateBlock, { type: "signature" }>> = {}): TemplateBlock {
  return { id, type: "signature", label, ...(visibleWhen ? { visibleWhen } : {}), ...options };
}

function partnerParticularsRepeatBlock(language: Language, from: number, to: number, repeaterKey = "partners"): TemplateBlock {
  return textBlock(
    "partnership-partner-particulars-repeat",
    "paragraph",
    `${copy(language, "Partner", "অংশীদার")} {{item_number}} — {{name}}\n{{details}}\n${copy(language, "Designation", "পদবী")}: {{role}}`,
    { bold: false, repeat: { repeaterKey, from, to } },
  );
}

function partnershipDeedSettings(language: Language): TemplateSettings {
  return {
    ...defaultTemplateSettings,
    paperSize: "LEGAL",
    marginTop: 32,
    marginRight: 25,
    marginBottom: 38,
    marginLeft: 25,
    stampGap: 80,
    showPageNumbers: false,
    fontFamily: "serif",
    // The source uses 16 pt Kalpurush body copy. The document renderer's
    // subtitle metric is the closest available readable body size.
    defaultFontSize: "subtitle",
    serviceCta: { ...defaultTemplateSettings.serviceCta },
    repeaters: [partnershipPartnerRepeater(language)],
  };
}

function partnershipDeedFields(language: Language): TemplateField[] {
  const fields: TemplateField[] = [
    textField("partnership-notary", "notary_name", language, "Notary / receiving authority", "নোটারী / গ্রহণকারী কর্তৃপক্ষ", "Notary Public of Bangladesh", "নোটারী পাবলিক অব বাংলাদেশ"),
    textField("partnership-business-en", "business_name_en", language, "Business name in English", "ইংরেজিতে ব্যবসার নাম", "Registered or proposed English name", "ইংরেজি নিবন্ধিত বা প্রস্তাবিত নাম"),
    textField("partnership-business-bn", "business_name_bn", language, "Business name in Bangla", "বাংলায় ব্যবসার নাম", "Bangla business name", "বাংলা ব্যবসার নাম"),
    selectField("partnership-count", "partner_count", language),
    dateField("partnership-effective-date", "effective_date", language, "Agreement effective date", "চুক্তি কার্যকর হওয়ার তারিখ"),
    dateField("partnership-deed-date", "deed_date", language, "Deed execution date", "দলিল সম্পাদনের তারিখ"),
    areaField("partnership-office", "principal_office", language, "Principal office address", "প্রধান কার্যালয়ের ঠিকানা", "Complete principal office address", "প্রধান কার্যালয়ের পূর্ণ ঠিকানা"),
    areaField("partnership-trade-license", "trade_license_holders", language, "Trade licence holder names", "ট্রেড লাইসেন্সধারীদের নাম", "Names of the partner or partners under whose names the trade licence will operate", "যে অংশীদার বা অংশীদারদের নামে ট্রেড লাইসেন্স পরিচালিত হবে তাদের নাম"),
    areaField("partnership-branch-office", "branch_office_details", language, "Branch office arrangement", "শাখা অফিসের ব্যবস্থা", "Optional branch locations or write that branches may be opened by mutual decision", "ঐচ্ছিক শাখার ঠিকানা অথবা পারস্পরিক সিদ্ধান্তে শাখা খোলার বিবরণ", false),
    areaField("partnership-business-activities", "business_activities", language, "Business activities supplied by the client", "ক্লায়েন্ট প্রদত্ত ব্যবসার কার্যক্রম", "Describe the consultancy, services, projects, trading or other lawful activities of the firm", "ফার্মের কনসালটেন্সি, সেবা, প্রকল্প, আমদানি-রপ্তানি বা অন্যান্য বৈধ ব্যবসার কার্যক্রম লিখুন"),
    numberField("partnership-initial-capital", "initial_capital", language, "Initial capital (BDT)", "প্রাথমিক মূলধন (টাকা)", "Optional", false),
    textField("partnership-initial-capital-words", "initial_capital_words", language, "Initial capital in words", "কথায় প্রাথমিক মূলধন", "Optional", "ঐচ্ছিক", false),
    numberField("partnership-additional-capital-stamp", "additional_capital_stamp", language, "Additional-capital stamp value (BDT)", "অতিরিক্ত মূলধনের স্ট্যাম্প মূল্য (টাকা)", "Optional", false),
    areaField("partnership-bank-authority", "bank_authorized_persons", language, "Authorised bank signatories", "ব্যাংক হিসাব পরিচালনার অনুমোদিত ব্যক্তি", "Names of the partner or partners authorised by unanimous decision", "সর্বসম্মত সিদ্ধান্তে ব্যাংক হিসাব পরিচালনার জন্য অনুমোদিত অংশীদারের নাম", false),
    textField("partnership-meeting-date", "monthly_meeting_date", language, "Monthly meeting date", "মাসিক সভার তারিখ", "30th day of each English month", "প্রতি ইংরেজি মাসের ৩০ তারিখ"),
    numberField("partnership-stamp-value", "stamp_value", language, "Deed stamp value (BDT)", "দলিলের স্ট্যাম্প মূল্য (টাকা)", "4000"),
    textField("partnership-stamp-value-words", "stamp_value_words", language, "Deed stamp value in words", "কথায় দলিলের স্ট্যাম্প মূল্য", "Four thousand taka", "চার হাজার টাকা"),
    ...witnessFields(language),
  ];

  for (const number of partnershipPartnerNumbers) fields.push(...partnerFieldsForSlot(language, number));

  return fields;
}

function pageLabel(language: Language, number: number) {
  const banglaDigits = String(number).replace(/[0-9]/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)] ?? digit);
  return language === "bn" ? `পাতা-${banglaDigits}` : `PAGE ${String(number).padStart(2, "0")}`;
}

function clause(
  language: Language,
  number: number,
  englishTitle: string,
  banglaTitle: string,
  englishBody: string,
  banglaBody: string,
): TemplateBlock[] {
  return [
    textBlock(`clause-${number}-heading`, "heading", `${number}. ${copy(language, englishTitle, banglaTitle)}`),
    textBlock(`clause-${number}-body`, "paragraph", copy(language, englishBody, banglaBody), { bold: false }),
  ];
}

function partnershipDeedPages(language: Language): TemplatePage[] {
  const page = (number: number, englishTitle: string, banglaTitle: string, blocks: TemplateBlock[]): TemplatePage => {
    const prefix = `partnership-deed-${language}-page-${number}`;
    const pageBlocks = number === 1
      ? blocks
      : [textBlock("page-label", "paragraph", pageLabel(language, number), { align: "center", bold: true, fontSize: "small" }), ...blocks];
    return {
      id: prefix,
      title: copy(language, englishTitle, banglaTitle),
      // Keep the final execution page usable when the deed has many signers.
      // The stamp gap is useful on the stamped content pages, but the final
      // page needs the space for up to eight partners and three witnesses.
      settings: number === 40 ? { stampGap: 0, marginTop: 20, marginBottom: 20, defaultFontSize: "body" } : {},
      blocks: pageBlocks.map((block, index) => ({ ...block, id: `${prefix}-block-${index}` })),
    };
  };

  const opening = copy(
    language,
    'Keeping before us the timeless saying that “Allah has made business lawful and interest unlawful”, we, the following {{partner_count}} partners, in the name of Allah, the sole Provider, have voluntarily and unanimously resolved that, Insha’Allah, we will start a business on a partnership basis. This partnership firm shall be operated with the consent of all partners and in accordance with the principles of the Partnership Act, 1932.',
    '“আল্লাহ ব্যবসাকে করেছেন হালাল আর সুদকে করেছেন হারাম”—এই চিরন্তন বাণীকে সামনে রেখে আমরা নিম্নোক্ত {{partner_count}} জন, একমাত্র রিযিকদাতা পরম করুণাময় আল্লাহর নামে, স্বতঃস্ফূর্তভাবে ও সর্বসম্মতিক্রমে সিদ্ধান্তে উপনীত হইয়াছি যে, ইনশা-আল্লাহ আমরা অংশীদারি ভিত্তিতে একটি ব্যবসা শুরু করিব। এই অংশীদারী প্রতিষ্ঠানটি সকল অংশীদারের সম্মতিতে অংশীদারী আইন, ১৯৩২-এর নীতিমালা অনুসরণ করে পরিচালিত হইবে।',
  );

  const recital = copy(
    language,
    "In the name of the Most Merciful Allah, we begin the recital of this partnership business deed. The partners named above have agreed to conduct business on the basis of mutual understanding. To avoid future disputes or misunderstanding and to protect the partners’ interests, it is necessary to record these terms. The partners are bound to observe the conditions set out below.",
    "পরম করুণাময় মহান আল্লাহ তায়ালার নাম স্মরণ করিয়া অত্র অংশীদারী কারবারের চুক্তিপত্রের বয়ান আরম্ভ করিতেছি। উপরোক্ত অংশীদারগণ পারস্পারিক সমঝোতার ভিত্তিতে ব্যবসা পরিচালনায় সম্মত হইয়াছি। ভবিষ্যৎ বিরোধ ও মনোমালিন্য এড়ানো এবং অংশীদারদের স্বার্থ সংরক্ষণের জন্য কতগুলো শর্ত লিপিবদ্ধ করা একান্ত আবশ্যক। নিম্নে বর্ণিত শর্তাবলী মানিয়া চলিতে অংশীদারগণ বাধ্য থাকিবেন।",
  );

  const businessA = copy(
    language,
    "The firm may provide business-consultancy-related services that support its aims and objectives and may carry on any lawful business.",
    "বিজনেস কনসালটেন্সির সঙ্গে সংশ্লিষ্ট এবং প্রতিষ্ঠানের লক্ষ্য ও উদ্দেশ্য পূরণে সহায়ক অন্যান্য পরিষেবা প্রদান করা হবে। প্রতিষ্ঠানটি সকল ধরনের বৈধ ব্যবসা পরিচালনা করিতে পারিবে।",
  );
  const businessB = copy(
    language,
    "The firm may operate a consultancy practice and undertake field data collection, data entry and processing, data analysis, research-report preparation, baseline and endline surveys, monitoring and evaluation, project evaluation, project-management support, training and capacity building, and services concerning NGOs and the environment. Its activities may include management and technical advice for government, private and NGO institutions; environmental conservation and development projects; surveys and census work; and professional accounting and financial-reporting services. By unanimous decision, the partners may also conduct any other lawful business permitted by the laws of Bangladesh.",
    "এই প্রতিষ্ঠান কনসালটেন্সি ফার্ম পরিচালনা, মাঠ পর্যায়ের তথ্য সংগ্রহ, ডাটা এন্ট্রি ও প্রসেসিং, ডাটা অ্যানালাইসিস, গবেষণা রিপোর্ট প্রস্তুত, বেসলাইন ও এন্ডলাইন সার্ভে, মনিটরিং ও ইভ্যালুয়েশন, প্রজেক্ট ইভ্যালুয়েশন, প্রজেক্ট ম্যানেজমেন্ট সাপোর্ট, প্রশিক্ষণ ও সক্ষমতা বৃদ্ধি এবং এনজিও ও পরিবেশ সংক্রান্ত সেবা প্রদান করিতে পারিবে। বিভিন্ন সরকারি-বেসরকারি প্রতিষ্ঠান ও এনজিওকে ব্যবস্থাপনা ও কারিগরি পরামর্শ, পরিবেশ সংরক্ষণ ও উন্নয়নমূলক প্রকল্পে সেবা, জরিপ ও গণনা কার্যক্রম এবং হিসাবরক্ষণ ও আর্থিক প্রতিবেদন প্রস্তুতকরণ সংক্রান্ত পেশাগত সেবা এই ব্যবসার অন্তর্ভুক্ত হইবে। এতদ্ব্যতীত, অংশীদারগণের সর্বসম্মত সিদ্ধান্তক্রমে বাংলাদেশে প্রচলিত আইন দ্বারা অনুমোদিত অন্য যেকোনো বৈধ ব্যবসাও পরিচালনা করা যাইবে।",
  );
  const businessC = copy(
    language,
    "The firm may, by joint decision, undertake import, export, supply and any other lawful business or venture in addition to the activities described above.",
    "উপরোক্ত ব্যবসার সঙ্গে আমদানি, রপ্তানি ও সরবরাহের কাজসহ অন্য যেকোনো বৈধ ব্যবসা বা উদ্যোগ যৌথ সিদ্ধান্তের মাধ্যমে গ্রহণ করা যাইবে।",
  );

  const capitalScheduleHeading = copy(language, "PARTNER | CAPITAL (BDT) | PROFIT / LOSS SHARE", "অংশীদার | মূলধন (টাকা) | লাভ-লোকসানের অনুপাত");
  const capitalScheduleRow = `${copy(language, "Partner", "অংশীদার")} {{item_number}}: {{name}} | {{capital}} ({{capital_words}}) | {{profit_share}}`;
  const designationScheduleHeading = copy(language, "DESIGNATIONS", "পদবী");
  const designationScheduleRow = `${copy(language, "Partner", "অংশীদার")} {{item_number}} — {{name}} — {{role}}`;

  return [
    page(1, "Title and opening declaration", "শিরোনাম ও প্রারম্ভিক ঘোষণা", [
      textBlock("bismillah", "title", copy(language, "IN THE NAME OF ALLAH, THE MOST MERCIFUL, THE MOST COMPASSIONATE", "বিসমিল্লাহির রহমানির রাহিম"), { align: "center", fontSize: "subtitle" }),
      textBlock("notary", "paragraph", copy(language, "To: {{notary_name}}", "বরাবর, {{notary_name}}"), { align: "center", bold: true, fontSize: "body" }),
      textBlock("business-name", "title", language === "bn" ? "{{business_name_bn}}" : "{{business_name_en}}", { align: "center" }),
      textBlock("business-name-secondary", "paragraph", language === "bn" ? "({{business_name_en}})" : "({{business_name_bn}})", { align: "center", bold: true, fontSize: "body" }),
      textBlock("deed-title", "title", copy(language, "PARTNERSHIP BUSINESS AGREEMENT DEED", "‘’অংশীদারী কারবারের চুক্তিনামা দলিল’’"), { align: "center" }),
      textBlock("opening", "paragraph", opening, { bold: false }),
    ]),
    page(2, "Partner particulars · 1 and 2", "অংশীদারদের পরিচয় · ১ ও ২", [
      textBlock("partner-heading", "heading", copy(language, "Particulars of the partners", "কারবারী অংশীদারদের নাম ও পরিচয়"), { align: "center" }),
      partnerParticularsRepeatBlock(language, 1, 2),
    ]),
    page(3, "Partner particulars · 3 to 8; recital", "অংশীদারদের পরিচয় · ৩ থেকে ৮; ভূমিকা", [
      partnerParticularsRepeatBlock(language, 3, 8),
      textBlock("recital", "paragraph", recital, { bold: false }),
    ]),
    page(4, "Terms and first clause", "শর্তাবলী ও প্রথম ধারা", [
      textBlock("terms", "title", copy(language, "TERMS AND CONDITIONS", "শর্তাবলী"), { align: "center" }),
      ...clause(language, 1, "Commencement", "কার্যকারিতা", "This partnership business firm is established among the partners named in this deed and shall commence on {{effective_date}}.", "অত্র দলিলে উল্লিখিত অংশীদারগণের মধ্যে এই অংশীদারী ব্যবসা প্রতিষ্ঠান গঠিত হইল এবং {{effective_date}} তারিখ হইতে কার্যকর হইবে।"),
    ]),
    page(5, "Name, office and trade licence", "নাম, কার্যালয় ও ট্রেড লাইসেন্স", [
      ...clause(language, 2, "Name of the firm", "প্রতিষ্ঠানের নাম", 'The name of this firm shall be “{{business_name_en}}” and, in Bangla, “{{business_name_bn}}”. The partnership business shall be conducted under these names.', 'এই প্রতিষ্ঠানের নাম “{{business_name_bn}}” এবং ইংরেজিতে “{{business_name_en}}” হইবে। এই নামেই অংশীদারী চুক্তির অধীনে ব্যবসা পরিচালিত হইবে।'),
      ...clause(language, 3, "Principal office", "প্রধান কার্যালয়", "The principal office of the firm shall be at {{principal_office}}. The trade licence shall operate in the name or names of {{trade_license_holders}}.", "প্রতিষ্ঠানের প্রধান কার্যালয় হইবে {{principal_office}}। {{trade_license_holders}}-এর নামে ট্রেড লাইসেন্স পরিচালিত হইবে।"),
    ]),
    page(6, "Branch office", "শাখা অফিস", [
      ...clause(language, 4, "Branch office", "প্রতিষ্ঠানের শাখা অফিস", "When necessary, the partners may change or establish an office by discussion and mutual decision. The firm may conduct business through branches anywhere in Bangladesh. {{branch_office_details}}", "পরবর্তীতে প্রয়োজন হইলে অংশীদারগণের আলোচনার মাধ্যমে অফিস পরিবর্তন বা নতুন অফিস নেওয়া যাইবে এবং ব্যবসার প্রয়োজনে বাংলাদেশের যেকোনো স্থানে শাখার মাধ্যমে ব্যবসা পরিচালনা করা যাইবে। {{branch_office_details}}"),
    ]),
    page(7, "Nature of business · A", "ব্যবসার ধরন · ক", [
      ...clause(language, 5, "Nature of business", "ব্যবসার ধরণ", businessA, businessA),
    ]),
    page(8, "Nature of business · B", "ব্যবসার ধরন · খ", [
      textBlock("business-b-heading", "heading", copy(language, "5(b). Consultancy and lawful services", "৫(খ)। কনসালটেন্সি ও বৈধ সেবা")),
      textBlock("business-b", "paragraph", businessB, { bold: false }),
    ]),
    page(9, "Nature of business · client activities", "ব্যবসার ধরন · ক্লায়েন্টের কার্যক্রম", [
      textBlock("business-b-client-heading", "heading", copy(language, "Client-supplied activity schedule", "ক্লায়েন্ট প্রদত্ত কার্যক্রমের বিবরণ")),
      textBlock("business-b-client", "paragraph", "{{business_activities}}", { bold: false }),
      textBlock("business-b-note", "paragraph", copy(language, "The activity schedule above forms part of the firm’s stated business purpose and may be updated by lawful unanimous decision.", "উপরের কার্যক্রমের বিবরণ প্রতিষ্ঠানের ব্যবসার উদ্দেশ্যের অংশ এবং আইনসঙ্গত সর্বসম্মত সিদ্ধান্তে তা হালনাগাদ করা যাইবে।"), { bold: false }),
    ]),
    page(10, "Nature of business · C and capital", "ব্যবসার ধরন · গ এবং মূলধন", [
      textBlock("business-c", "paragraph", businessC, { bold: false }),
      ...clause(language, 6, "Business capital", "ব্যবসায়ের মূলধন", "The initial capital of the firm is BDT {{initial_capital}} ({{initial_capital_words}}), which shall be invested by the partners in the proportions recorded on the next page.", "এই প্রতিষ্ঠানের প্রাথমিক মূলধন ধরা হইল টাকা {{initial_capital}} ({{initial_capital_words}})। পরবর্তী পৃষ্ঠায় বর্ণিত অনুপাতে অংশীদারগণ এই মূলধন বিনিয়োগ করিবেন।"),
    ]),
    page(11, "Capital and profit-share schedule", "মূলধন ও লাভ-লোকসানের অনুপাত", [
      textBlock("capital-schedule-heading", "heading", copy(language, "Capital contribution and profit/loss schedule", "মূলধন বিনিয়োগ ও লাভ-লোকসানের অনুপাত"), { align: "center" }),
      textBlock("capital-schedule-label", "paragraph", capitalScheduleHeading, { bold: true, align: "center", fontSize: "small" }),
      textBlock("capital-schedule-row", "paragraph", capitalScheduleRow, { bold: false, repeat: { repeaterKey: "partners" } }),
      textBlock("capital-note", "paragraph", copy(language, "Each partner’s contribution and agreed profit/loss percentage should be checked before publishing the deed.", "প্রকাশের আগে প্রত্যেক অংশীদারের মূলধন ও সম্মত লাভ-লোকসানের শতাংশ যাচাই করুন।"), { bold: false, fontSize: "small" }),
    ]),
    page(12, "Profit and loss", "লাভ-লোকসান", [
      ...clause(language, 7, "Profit and loss accounts", "লাভ-লোকসানের হিসাব", "The business profit or loss shall be distributed among the partners according to the profit/loss shares recorded above.", "ব্যবসায়ের লাভ-ক্ষতি উপরোক্ত লাভ-লোকসানের অনুপাত অনুযায়ী অংশীদারগণের মধ্যে বণ্টন করা হইবে।"),
    ]),
    page(13, "Partners’ responsibilities", "অংশীদারদের দায়-দায়িত্ব", [
      ...clause(language, 8, "Partners’ responsibilities", "অংশীদারদের দায়-দায়িত্ব", "Business decisions shall be made jointly. All partners shall discuss matters openly and make decisions by mutual understanding.", "ব্যবসার যেকোনো সিদ্ধান্ত যৌথভাবে গ্রহণ করা হইবে। সকল অংশীদার খোলামনে আলোচনা করিয়া পারস্পারিক বোঝাপড়ার মাধ্যমে সিদ্ধান্ত দিবেন।"),
    ]),
    page(14, "Management and signing authority", "ব্যবসা পরিচালনা ও স্বাক্ষরাধিকার", [
      ...clause(language, 9, "Conduct of the partnership business", "অংশীদারী ব্যবসা পরিচালনা", "For agreements, correspondence with offices, business documents and signatures made in the course of conducting the business, {{partner_1_name}} shall sign as the managing partner unless the partners lawfully decide otherwise.", "ব্যবসা পরিচালনার ক্ষেত্রে বিভিন্ন চুক্তিনামা, অফিসের সঙ্গে চিঠিপত্র, যাবতীয় দলিলপত্র ও স্বাক্ষরের জন্য {{partner_1_name}} ম্যানেজিং পার্টনার হিসেবে স্বাক্ষর করিবেন, যদি না অংশীদারগণ আইনসঙ্গতভাবে অন্য সিদ্ধান্ত গ্রহণ করেন।"),
    ]),
    page(15, "Firm expenses", "প্রতিষ্ঠানের খরচ", [
      ...clause(language, 10, "Firm expenses", "প্রতিষ্ঠানের খরচ", "All expenses of the firm shall be borne from its business profits or accounts. Any inconsistency in expenses shall be discussed and resolved by the partners.", "প্রতিষ্ঠানের যাবতীয় খরচ লভ্যাংশ বা ব্যবসার হিসাব হইতে বহন করা হইবে। খরচের ক্ষেত্রে কোনো অসামঞ্জস্য দেখা দিলে অংশীদারগণ আলোচনা করিয়া তাহা সমাধান করিবেন।"),
    ]),
    page(16, "Purchases", "মালামাল ক্রয়", [
      ...clause(language, 11, "Purchase of goods and materials", "মালামাল ক্রয়", "The partners shall discuss and purchase goods or materials necessary for the business. Written permission from the partners shall be obtained where necessary.", "অংশীদারগণ পরস্পর আলোচনা সাপেক্ষে ব্যবসার প্রয়োজনীয় মালামাল ক্রয় করিবেন। প্রয়োজন হইলে অংশীদারদের লিখিত অনুমতি গ্রহণ করিতে হইবে।"),
    ]),
    page(17, "Business liabilities", "ব্যবসায়ের দায়-দেনা", [
      ...clause(language, 12, "Business debts and liabilities", "দায়-দেনা", "If the firm incurs business-related loans, debts or liabilities, the partners shall bear them according to their agreed responsibility. No partner may independently operate a separate business connected with the principal business without the required consent.", "ব্যবসা সংক্রান্ত কারণে প্রতিষ্ঠানের ঋণ, দায়-দেনা থাকিলে অংশীদারগণ সম্মত দায়িত্ব অনুযায়ী তাহা বহন করিবেন। প্রয়োজনীয় সম্মতি ছাড়া কোনো অংশীদার মূল ব্যবসার সঙ্গে সম্পৃক্ত আলাদা ব্যবসা এককভাবে পরিচালনা করিতে পারিবেন না।"),
    ]),
    page(18, "Personal liabilities", "ব্যক্তিগত দায়-দেনা", [
      ...clause(language, 13, "Personal debts", "ব্যক্তিগত দায়-দেনা", "The firm shall not be bound by a partner’s personal debts. Each partner shall remain personally responsible for and shall personally discharge their own debts.", "অংশীদারদের ব্যক্তিগত দায়-দেনার জন্য উক্ত প্রতিষ্ঠানকে আবদ্ধ করা যাইবে না। প্রত্যেক অংশীদার তাহার ব্যক্তিগত দেনার জন্য ব্যক্তিগতভাবে দায়ী থাকিবেন এবং নিজে সেই দেনা পরিশোধ করিবেন।"),
    ]),
    page(19, "Accounts", "হিসাব-নিকাশ", [
      ...clause(language, 14, "Accounts and financial year", "হিসাব নিকাশ", "Each partner may supervise the firm’s accounts. The partners may appoint an accountant or, by mutual consent, allow a partner to maintain the accounts. The firm’s financial year shall run from 1 July to 30 June. The accounts shall be presented to all partners at the scheduled annual meeting.", "প্রত্যেক অংশীদার প্রতিষ্ঠানের হিসাব-নিকাশ তদারক করিতে পারিবেন। হিসাব রক্ষণের জন্য হিসাবরক্ষক নিয়োগ করা যাইবে অথবা সকল অংশীদারের সম্মতিতে কোনো অংশীদার হিসাব সংরক্ষণ করিতে পারিবেন। প্রতিষ্ঠানের অর্থবছর ১ জুলাই হইতে ৩০ জুন পর্যন্ত হইবে এবং নির্ধারিত সময়ে বার্ষিক সভায় সকল অংশীদারের নিকট হিসাব প্রকাশ করা হইবে।"),
    ]),
    page(20, "Bills and vouchers", "বিল-ভাউচার", [
      ...clause(language, 15, "Bills, vouchers and payments", "বিল ভাউচার", "For all firm expenses, bill payments and financial management, the signature of any one partner shall be valid. The partners may change or amend that signing authority by mutual consent and a board decision.", "প্রতিষ্ঠানের সকল খরচপত্র, বিল পরিশোধ ও আর্থিক ব্যবস্থাপনার ক্ষেত্রে যেকোনো একজন অংশীদারের স্বাক্ষর বৈধ বলিয়া গণ্য হইবে। অংশীদারগণ পারস্পারিক সম্মতি ও বোর্ড সভার সিদ্ধান্তের মাধ্যমে উক্ত স্বাক্ষর কর্তৃত্ব পরিবর্তন বা সংশোধন করিতে পারিবেন।"),
    ]),
    page(21, "Additional capital", "অতিরিক্ত মূলধন", [
      ...clause(language, 16, "Additional capital", "অতিরিক্ত মূলধন", "If additional capital is needed, each partner shall invest in proportion to their current capital. The amount, whether increased or reduced, shall be recorded on a BDT {{additional_capital_stamp}} stamp and signed by all partners, and attached to this partnership deed.", "প্রতিষ্ঠানের অতিরিক্ত মূলধনের প্রয়োজন হইলে প্রত্যেক অংশীদার বর্তমান মূলধনের অনুপাতে মূলধন বিনিয়োগ করিবেন। মূলধনের পরিমাণ বৃদ্ধি বা হ্রাস যাহাই হোক, তাহা {{additional_capital_stamp}} টাকার স্ট্যাম্পে লিখিত ও সকল অংশীদারের স্বাক্ষরযুক্ত থাকিবে এবং এই অংশীদারী দলিলের সঙ্গে সংযুক্ত হইবে।"),
    ]),
    page(22, "Bank account", "ব্যাংক হিসাব", [
      ...clause(language, 17, "Opening and operating a bank account", "ব্যাংক হিসাব খোলা ও পরিচালনা", "A savings or current account may be opened in the firm’s name at any scheduled bank. The person or persons nominated with the consent of all partners may operate the account according to the partners’ decision. Authorised persons: {{bank_authorized_persons}}", "অত্র যৌথ ব্যবসায়িক প্রতিষ্ঠানের নামে যেকোনো তফসিলী ব্যাংকে সঞ্চয়ী বা চলতি হিসাব খোলা যাইবে। সকল অংশীদারের সম্মতিতে মনোনীত ব্যক্তি বা ব্যক্তিগণ অংশীদারদের সিদ্ধান্ত অনুযায়ী হিসাব পরিচালনা করিবেন। অনুমোদিত ব্যক্তি: {{bank_authorized_persons}}"),
    ]),
    page(23, "Designations", "পদ-পদবী", [
      ...clause(language, 18, "Designations", "পদ-পদবী", "For the convenient operation of the business, the partners shall hold the designations set out below.", "ব্যবসা পরিচালনার সুবিধার্থে অংশীদারগণ নিম্নলিখিত পদ-পদবীতে ভূষিত হইবেন।"),
      textBlock("designation-schedule-label", "paragraph", designationScheduleHeading, { bold: true, align: "center", fontSize: "small" }),
      textBlock("designation-schedule-row", "paragraph", designationScheduleRow, { bold: false, repeat: { repeaterKey: "partners" } }),
    ]),
    page(24, "Employees", "কর্মচারী নিয়োগ", [
      ...clause(language, 19, "Appointment of employees", "কর্মচারী নিয়োগ", "The firm may appoint the number of employees necessary for the joint business with unanimous consent. No employee may be appointed by a single decision. Salaries shall be paid from the business accounts, and qualified candidates shall receive priority.", "যৌথ ব্যবসা পরিচালনার জন্য সর্বসম্মতিতে প্রয়োজনীয় সংখ্যক কর্মচারী নিয়োগ করা যাইবে। কোনো একক সিদ্ধান্তে কর্মচারী নিয়োগ করা যাইবে না এবং কর্মচারীদের বেতন ব্যবসার হিসাব হইতে বহন করা হইবে। কর্মকর্তা ও কর্মচারী নিয়োগের ক্ষেত্রে যোগ্য প্রার্থীকে অগ্রাধিকার দেওয়া হইবে।"),
    ]),
    page(25, "Change of partner", "অংশীদারের পরিবর্তন", [
      ...clause(language, 20, "Change or transfer of a partner’s interest", "অংশীদারের পরিবর্তন", "If a partner wishes to transfer their interest, its value shall be determined according to market value or by discussion among the partners. The firm’s assets shall be valued only after all liabilities are paid. A partner wishing to retire must give three months’ written notice.", "কোনো অংশীদার তাহার অংশ হস্তান্তর করিতে চাইলে বাজারমূল্য বা অংশীদারগণের আলোচনার ভিত্তিতে মূল্য নির্ধারণ করা হইবে। প্রতিষ্ঠানের সকল দায়-দেনা পরিশোধের পরেই সম্পদের মূল্য নির্ধারণ করা হইবে। কোনো অংশীদার অব্যাহতি চাইলে তিন মাস পূর্বে লিখিতভাবে জানাইতে হইবে।"),
    ]),
    page(26, "Payment for outgoing share", "মূল্য পরিশোধ", [
      ...clause(language, 21, "Payment for an outgoing partner’s interest", "মূল্য পরিশোধ", "A partner who leaves shall first offer their interest to the other partners. If a partner agrees to purchase it, a reasonable period shall be allowed for payment. If no partner agrees, another suitable partner may be appointed according to law and mutual decision.", "যে অংশীদার চলিয়া যাইবেন, তিনি তাহার অংশ ক্রয়ের জন্য প্রথমে অন্যান্য অংশীদারকে প্রস্তাব দিবেন। কোনো অংশীদার সম্মত হইলে মূল্য পরিশোধের জন্য নির্দিষ্ট সময় প্রদান করিতে হইবে। কোনো অংশীদার ক্রয়ে সম্মত না হইলে আইন ও পারস্পারিক সিদ্ধান্ত অনুযায়ী অন্য উপযুক্ত অংশীদার নিয়োগ করা যাইবে।"),
    ]),
    page(27, "Withdrawal of profit", "লভ্যাংশ উত্তোলন", [
      ...clause(language, 22, "Special withdrawals", "বিশেষ প্রয়োজন", "For a special need, business profit may be withdrawn at any time with the consent of all partners.", "বিশেষ প্রয়োজনে সকলের সম্মতিক্রমে যেকোনো সময় ব্যবসার লভ্যাংশ উত্তোলন করা যাইবে।"),
    ]),
    page(28, "Death, incapacity or insolvency", "মৃত্যু, অক্ষমতা বা দেউলিয়াত্ব", [
      ...clause(language, 23, "Death, incapacity or insolvency of a partner", "অংশীদারের মৃত্যু, অক্ষমতা বা দেউলিয়া হওয়া", "If a partner dies, becomes legally incapacitated or insolvent, their heirs or lawful representative may undertake the responsibility of managing the business in accordance with law. If they do not wish to participate, the money due after settlement of accounts shall be transferred to the heirs or representative.", "কোনো অংশীদারের মৃত্যু, আইনগত অক্ষমতা বা দেউলিয়াত্ব ঘটিলে আইন অনুযায়ী তাহার ওয়ারিশ বা আইনগত প্রতিনিধি ব্যবসা পরিচালনার দায়িত্ব পালন করিতে পারিবেন। তাহারা ব্যবসায়ে অংশগ্রহণে রাজি না হইলে হিসাবের সমুদয় পাওনা-দেনা নিষ্পত্তির পর প্রাপ্য অর্থ ওয়ারিশ বা প্রতিনিধির নিকট হস্তান্তর করা হইবে।"),
    ]),
    page(29, "Tax, trade licence and legal costs", "আয়কর, ট্রেড লাইসেন্স ও অন্যান্য খরচ", [
      ...clause(language, 24, "Income tax, trade licence and other costs", "আয়কর, ট্রেড লাইসেন্স ও অন্যান্য খরচ", "All legal costs of the business, including income-tax, trade-licence and related costs, shall be paid by the firm. No single partner shall be personally responsible for those firm costs.", "ব্যবসায়ের আয়কর, ট্রেড লাইসেন্স ও অন্যান্য আইনগত খরচসহ যাবতীয় লিগ্যাল খরচ প্রতিষ্ঠান হইতে বহন করা হইবে। এই খরচের জন্য কোনো একক অংশীদার ব্যক্তিগতভাবে দায়ী থাকিবেন না।"),
    ]),
    page(30, "Arbitration", "সালিশ / মধ্যস্থতা", [
      ...clause(language, 25, "Arbitration and mediation", "অরবিট্রেশন", "If a disagreement or conflict arises regarding any term, the operation of the business, the accounts or any related matter, the partners may, by mutual consent, appoint one or two acceptable third parties as mediators. All parties shall be bound to accept the decision of the appointed mediator or mediators.", "উল্লিখিত কোনো শর্ত, ব্যবসা পরিচালনা, হিসাব-নিকাশ বা সংশ্লিষ্ট কোনো বিষয়ে মতবিরোধ বা দ্বন্দ্ব দেখা দিলে অংশীদারগণের সম্মতিক্রমে একজন বা দুইজন গ্রহণযোগ্য তৃতীয় পক্ষকে মধ্যস্থতাকারী হিসাবে নিয়োগ করা যাইবে। নিয়োগপ্রাপ্ত মধ্যস্থতাকারী ব্যক্তির বা ব্যক্তিগণের সিদ্ধান্ত সকল পক্ষ মানিয়া নিতে বাধ্য থাকিবেন।"),
    ]),
    page(31, "Saving provision", "রক্ষাবাচক ধারা", [
      ...clause(language, 26, "Saving provision", "রক্ষাবাচক", "If any dispute, complexity, interpretive uncertainty or special problem arises regarding this partnership deed, it shall be resolved in accordance with the Partnership Act, 1932 and the applicable laws in force in Bangladesh.", "এই অংশীদারী চুক্তিপত্রে উল্লিখিত কোনো বিষয়ে বিরোধ, জটিলতা, ব্যাখ্যাগত অস্পষ্টতা বা বিশেষ সমস্যা দেখা দিলে অংশীদারী কারবার আইন, ১৯৩২ এবং বাংলাদেশে প্রচলিত সংশ্লিষ্ট আইনসমূহের বিধান অনুযায়ী তাহা নিষ্পত্তি করা হইবে।"),
    ]),
    page(32, "Amendments", "আইনানুগ পরিবর্তন", [
      ...clause(language, 27, "Amendment by consent", "আইনানুগ পরিবর্তন", "Any clause may be changed lawfully with the consent of all partners.", "সকল অংশীদারের সম্মতিক্রমে যেকোনো ধারায় আইনানুগ পরিবর্তন করা যাইবে।"),
    ]),
    page(33, "Monthly remuneration", "মাসিক পারিতোষিক", [
      ...clause(language, 28, "Monthly remuneration and allowances", "অংশীদারগণের মাসিক পারিতোষিক", "For family maintenance, ordinary living or personal expenses, the partners may, after discussion, withdraw a monthly salary or allowance from the firm in proportion to their capital investment. It shall be adjusted with the profit/loss account. If a partner receives a separate salary for a management responsibility, that salary shall not be adjusted with the profit/loss account.", "সকল অংশীদার পারিবারিক ভরণ-পোষণ, জীবনযাপন বা ব্যক্তিগত খরচের জন্য আলোচনার ভিত্তিতে মূলধন বিনিয়োগের অনুপাতে প্রতি মাসে প্রতিষ্ঠান হইতে বেতন বা ভাতা হিসাবে অর্থ উত্তোলন করিতে পারিবেন। তাহা লাভ-ক্ষতির হিসাবের সঙ্গে সমন্বয় করা হইবে। কোনো অংশীদার পরিচালনার দায়িত্ব পালন করিয়া পৃথক বেতন ভাতা পেলে সেই বেতন ভাতা লাভ-ক্ষতির হিসাবের সঙ্গে সমন্বয় করা হইবে না।"),
    ]),
    page(34, "Borrowing", "ঋণ গ্রহণ", [
      ...clause(language, 29, "Borrowing for the firm", "ঋণ গ্রহণ", "The firm may take a loan from a bank or financial institution when necessary, but the unanimous consent of the partners is required.", "প্রতিষ্ঠানের প্রয়োজনে ব্যাংক বা অর্থলগ্নী প্রতিষ্ঠান হইতে ঋণ গ্রহণ করা যাইবে; তবে এ ক্ষেত্রে অংশীদারগণের ঐক্যমত আবশ্যক।"),
    ]),
    page(35, "Personal borrowing in firm name", "প্রতিষ্ঠানের নামে ব্যক্তিগত ঋণ", [
      ...clause(language, 30, "No personal loan in the firm’s name", "প্রতিষ্ঠানের নামে ব্যক্তিগত ঋণ গ্রহণ নিষিদ্ধ", "No partner may obtain a personal loan using the name of {{business_name_en}} ({{business_name_bn}}). If a partner does so, the firm shall not be liable for that personal loan.", "কোনো অংশীদার {{business_name_bn}} ({{business_name_en}}) প্রতিষ্ঠানের নাম ব্যবহার করিয়া ব্যক্তিগত ঋণ গ্রহণ করিতে পারিবেন না। কেউ এমন ঋণ গ্রহণ করিলে সেই ব্যক্তিগত ঋণের জন্য প্রতিষ্ঠান দায়ী থাকিবে না।"),
    ]),
    page(36, "Use of firm assets", "প্রতিষ্ঠানের সম্পদের ব্যবহার", [
      ...clause(language, 31, "Use of business assets and records", "প্রতিষ্ঠানের সম্পদ ও হিসাবের কাগজপত্র", "No partner may use an asset belonging to the business for personal purposes. All papers and records concerning the firm’s accounts shall remain at the firm’s office.", "কোনো অংশীদার ব্যবসা প্রতিষ্ঠানের সংশ্লিষ্ট সম্পদ তাহার ব্যক্তিগত কাজে ব্যবহার করিতে পারিবেন না। অংশীদারী প্রতিষ্ঠানের হিসাব-নিকাশ সংক্রান্ত যাবতীয় কাগজপত্র প্রতিষ্ঠানের কার্যালয়ে থাকিবে।"),
    ]),
    page(37, "Removal of a partner · A and B", "অংশীদার অপসারণ · ক ও খ", [
      ...clause(language, 32, "Removal of a partner", "অংশীদার অপসারণ", "A partner’s interest may be cancelled or the partner may be removed if any of the following grounds is established:", "নিম্নলিখিত কোনো কারণ অংশীদারদের মধ্যে পাওয়া গেলে সংশ্লিষ্ট অংশীদারের অংশীদারিত্ব বাতিল বা তাহাকে অপসারণ করা যাইবে:"),
      textBlock("removal-a", "paragraph", copy(language, "(a) The partner acts or becomes involved in conduct contrary to the partnership business.\n(b) The partner discloses confidential business information to another person, causing reputational or financial harm to the firm.", "(ক) অংশীদারী ব্যবসার পরিপন্থী কোনো কাজ করেন বা তাতে লিপ্ত হন।\n(খ) অংশীদারী ব্যবসার কোনো গোপনীয় তথ্য অন্য ব্যক্তির নিকট প্রকাশ করেন, যাহাতে প্রতিষ্ঠানের সুনাম ক্ষুণ্ণ বা আর্থিক ক্ষতি হয়।"), { bold: false }),
    ]),
    page(38, "Removal of a partner · C and D", "অংশীদার অপসারণ · গ ও ঘ", [
      textBlock("removal-b", "paragraph", copy(language, "(c) The partner remains missing or untraceable for six months without communication.\n(d) Without the permission of the other partners, the partner secretly opens and operates a parallel business out of personal interest.", "(গ) কোনো অংশীদার ছয় মাস পর্যন্ত কোনো প্রকার খোঁজখবর ছাড়া নিরুদ্দেশ থাকেন।\n(ঘ) অপর অংশীদারগণের অনুমতি ছাড়া কোনো অংশীদার ব্যক্তিগত স্বার্থে গোপনে সমান্তরাল ব্যবসা প্রতিষ্ঠান খুলিয়া পরিচালনা করেন।"), { bold: false }),
    ]),
    page(39, "Death and monthly meetings", "মৃত্যু ও মাসিক সাধারণ সভা", [
      ...clause(language, 33, "Payment to heirs after death", "অংশীদারের মৃত্যু", "If a partner dies, the accounts shall be settled and the deceased partner’s due share shall be transferred proportionately to the heirs.", "কোনো অংশীদার ইন্তেকাল করিলে হিসাব-নিকাশ করিয়া মৃত ব্যক্তির প্রাপ্য অংশ আনুপাতিক হারে তাহার ওয়ারিশগণের মধ্যে হস্তান্তর করা হইবে."),
      ...clause(language, 34, "Monthly general meeting", "মাসিক সাধারণ সভা", "For the orderly operation of the partnership, one general meeting shall be held each month at the principal office on {{monthly_meeting_date}}. No separate notice shall be required. All partners shall attend and discuss business development and accounts; no partner may remain absent without proper cause.", "অংশীদারী ব্যবসা সুষ্ঠুভাবে পরিচালনার জন্য প্রতি মাসে প্রধান কার্যালয়ে একটি সাধারণ সভা অনুষ্ঠিত হইবে। সভাটি {{monthly_meeting_date}} তারিখে অনুষ্ঠিত হইবে এবং এর জন্য পৃথক কোনো নোটিশ প্রয়োজন হইবে না। সকল অংশীদার উপস্থিত থাকিয়া ব্যবসার উন্নয়ন ও হিসাব-নিকাশ সংক্রান্ত সিদ্ধান্ত গ্রহণ করিবেন; উপযুক্ত কারণ ছাড়া কোনো পক্ষ মাসিক সাধারণ সভায় অনুপস্থিত থাকিতে পারিবেন না।"),
    ]),
    page(40, "Dissolution and execution", "অবসান ও সম্পাদন", [
      ...clause(language, 35, "Dissolution", "অবসান", "The partnership shall commence on {{effective_date}} and remain in force until dissolved with the consent of the partners. If all partners agree that the business should no longer continue, the accounts shall be settled, debts paid, and the remaining money distributed according to the agreed accounts before the partnership is concluded.", "অত্র অংশীদারী কারবার {{effective_date}} তারিখ হইতে আরম্ভ হইয়া অংশীদারগণের সম্মতির ভিত্তিতে বিলুপ্ত না হওয়া পর্যন্ত কার্যকর থাকিবে। সকল পক্ষ একমত হইলে যে ব্যবসা আর পরিচালিত হইবে না, ব্যবসার হিসাব-নিকাশ সম্পন্ন ও ঋণ পরিশোধের পর অবশিষ্ট অর্থ সম্মত হিসাব অনুযায়ী বণ্টন করিয়া অংশীদারী কারবারের পরিসমাপ্তি ঘটিবে।"),
      textBlock("closing-protection", "paragraph", copy(language, "In relation to the above terms, no party shall prejudice the lawful interests of another, and each party’s lawful interest shall remain protected.", "উপরোক্ত শর্তগুলির প্রেক্ষাপটে কোনো পক্ষ অপর পক্ষের স্বার্থ ক্ষুণ্ণ করিতে পারিবেন না এবং উভয় পক্ষের আইনসঙ্গত স্বার্থ অটুট থাকিবে।"), { bold: false }),
      textBlock("execution", "paragraph", copy(language, "Accordingly, being present voluntarily, consciously and in sound body and mind, without inducement by anyone, and having read, heard and understood the meaning and effect of this deed, the parties execute this partnership deed.", "এতদ্বার্থে পক্ষগণ স্বেচ্ছায়, স্বজ্ঞানে ও সুস্থ শরীরে, কাহারও প্ররোচনা ছাড়া স্ব-শরীরে উপস্থিত হইয়া দলিলের মর্ম ও ফলাফল অবগত হইয়া অত্র অংশীদারী দলিল সহি সম্পাদন করিলাম।"), { bold: false, fontSize: "body" }),
      textBlock("execution-date", "paragraph", copy(language, "Executed on {{deed_date}}.", "ইতি, তারিখ-{{deed_date}}।"), { bold: true, fontSize: "body" }),
      textBlock("stamp-note", "paragraph", copy(language, "This partnership deed is computer-composed on {{stamp_value}} ({{stamp_value_words}}) taka non-judicial stamp paper in 40 forms, with three witnesses.", "অত্র অংশীদারী চুক্তিপত্র দলিল {{stamp_value}} ({{stamp_value_words}}) টাকার নন-জুডিশিয়াল স্ট্যাম্পে ৪০ (চল্লিশ) ফর্মে কম্পিউটার কম্পোজকৃত এবং সাক্ষী মোট ৩ জন।"), { align: "center", bold: false, fontSize: "body" }),
      textBlock("witness-heading", "heading", copy(language, "Witnesses and partners", "সাক্ষী ও অংশীদারগণ"), { align: "center" }),
      textBlock("witnesses", "paragraph", copy(language, "Witness 1: {{witness_1}}\nWitness 2: {{witness_2}}\nWitness 3: {{witness_3}}", "সাক্ষী ১: {{witness_1}}\nসাক্ষী ২: {{witness_2}}\nসাক্ষী ৩: {{witness_3}}"), { bold: false, fontSize: "body" }),
      signatureBlock(
        "partnership-partners-signatures",
        `${copy(language, "Partner", "অংশীদার")} {{item_number}} — {{name}}`,
        undefined,
        { repeat: { repeaterKey: "partners" } },
      ),
      signatureBlock("witness-1-signature", copy(language, `Witness 1 — {{witness_1}}`, `সাক্ষী ১ — {{witness_1}}`)),
      signatureBlock("witness-2-signature", copy(language, `Witness 2 — {{witness_2}}`, `সাক্ষী ২ — {{witness_2}}`)),
      signatureBlock("witness-3-signature", copy(language, `Witness 3 — {{witness_3}}`, `সাক্ষী ৩ — {{witness_3}}`)),
    ]),
  ];
}

function createPartnershipDeedTemplate(language: Language): DocumentTemplateDraft {
  const bangla = language === "bn";
  return {
    title: bangla ? "৪০ পৃষ্ঠার অংশীদারী চুক্তিনামা" : "40-page Partnership Deed",
    slug: bangla ? "partnership-deed-40-bn" : "partnership-deed-40-en",
    description: bangla
      ? "৪০টি দলিল ফর্মে অংশীদারদের পরিচয়, ব্যবসার উদ্দেশ্য, মূলধন, লাভ-লোকসান, পরিচালনা, দায়-দেনা ও স্বাক্ষর প্রস্তুত করার বাংলা অংশীদারী দলিল।"
      : "A 40-form partnership deed covering the partners, business purpose, capital, profit share, management, liabilities, dissolution and signatures.",
    settings: partnershipDeedSettings(language),
    fields: partnershipDeedFields(language),
    pages: partnershipDeedPages(language),
  };
}

function blockText(block: TemplateBlock) {
  if (block.type === "title" || block.type === "heading" || block.type === "paragraph") return block.text;
  if (block.type === "signature") return block.label;
  return "";
}

function partnerReferences(block: TemplateBlock) {
  const references = Array.from(blockText(block).matchAll(/partner_(\d+)_/g), (match) => Number(match[1]));
  return Array.from(new Set(references));
}

export function isPartnershipDeedTemplate(template: Pick<DocumentTemplateDraft, "slug" | "fields">) {
  return template.slug === "partnership-deed-40-en"
    || template.slug === "partnership-deed-40-bn"
    || (template.fields.some((field) => field.key === "partner_count") && template.fields.some((field) => field.key === "partner_1_name"));
}

type PartnershipSlotBlockKind = "particulars" | "capital-row" | "designation-row" | "signature";

function partnershipPageNumber(page: TemplatePage) {
  const match = /-page-(\d+)$/.exec(page.id);
  return match ? Number(match[1]) : null;
}

function partnershipSlotPageNumber(kind: PartnershipSlotBlockKind, partnerNumber: number) {
  if (kind === "particulars") return partnerNumber <= 2 ? 2 : 3;
  if (kind === "capital-row") return 11;
  if (kind === "designation-row") return 23;
  return 40;
}

function findPartnershipPageIndex(pages: TemplatePage[], pageNumber: number) {
  const exactIndex = pages.findIndex((page) => partnershipPageNumber(page) === pageNumber);
  if (exactIndex >= 0) return exactIndex;

  // Keep compatibility with older/custom templates whose pages use generic
  // ids. Only fall back by position when no page has a numeric identity.
  if (pages.some((page) => partnershipPageNumber(page) !== null) || pages.length < pageNumber) return -1;
  return pageNumber - 1;
}

function generatedPartnershipSlotBlock(block: TemplateBlock) {
  const match = /^partnership-partner-(\d+)-(particulars|capital-row|designation-row|signature)$/.exec(block.id);
  if (!match) return null;
  return { number: Number(match[1]), kind: match[2] as PartnershipSlotBlockKind };
}

function legacyPartnershipSlotBlock(block: TemplateBlock) {
  const generated = generatedPartnershipSlotBlock(block);
  if (generated) return generated;
  if (block.repeat?.repeaterKey === "partners" || block.visibleWhen?.fieldKey !== "partner_count") return null;
  const references = partnerReferences(block);
  if (references.length !== 1) return null;
  const text = blockText(block);
  const number = references[0];
  if (block.type === "signature") return { number, kind: "signature" as const };
  if (text.includes(`{{partner_${number}_details}}`) && text.includes(`{{partner_${number}_role}}`)) return { number, kind: "particulars" as const };
  if (text.includes(`{{partner_${number}_capital}}`) && text.includes(`{{partner_${number}_profit_share}}`)) return { number, kind: "capital-row" as const };
  if (text.includes(`{{partner_${number}_role}}`)) return { number, kind: "designation-row" as const };
  return null;
}

function cleanMisplacedPartnershipSlotBlocks(pages: TemplatePage[]) {
  return pages.map((page, pageIndex) => ({
    ...page,
    blocks: page.blocks.filter((block) => {
      const generated = legacyPartnershipSlotBlock(block);
      if (!generated) return true;
      const targetIndex = findPartnershipPageIndex(pages, partnershipSlotPageNumber(generated.kind, generated.number));
      // If the intended page cannot be identified, preserve the block rather
      // than risk deleting an administrator's content.
      return targetIndex < 0 || targetIndex === pageIndex;
    }),
  }));
}

function removeLegacyPartnershipSlotBlocks(pages: TemplatePage[]) {
  return pages.map((page) => ({
    ...page,
    blocks: page.blocks.filter((block) => !legacyPartnershipSlotBlock(block)),
  }));
}

function hasWitnessSignature(block: TemplateBlock): block is Extract<TemplateBlock, { type: "signature" }> {
  return block.type === "signature" && /Witness [123]|সাক্ষী [১২৩]/i.test(block.label);
}

function addBlockBefore(blocks: TemplateBlock[], block: TemplateBlock, predicate: (candidate: TemplateBlock) => boolean) {
  const index = blocks.findIndex(predicate);
  if (index < 0) return [...blocks, block];
  return [...blocks.slice(0, index), block, ...blocks.slice(index)];
}

function pageHasRepeatBlock(page: TemplatePage | undefined, kind: PartnershipSlotBlockKind, repeaterKey = "partners") {
  if (!page) return false;
  return page.blocks.some((block) => {
    if (block.repeat?.repeaterKey !== repeaterKey) return false;
    if (kind === "signature") return block.type === "signature";
    if (block.type !== "paragraph") return false;
    if (kind === "particulars") return block.text.includes("{{details}}") && block.text.includes("{{role}}");
    if (kind === "capital-row") return block.text.includes("{{capital}}") && block.text.includes("{{profit_share}}");
    return block.text.includes("{{name}}") && block.text.includes("{{role}}");
  });
}

function ensurePageBlock(
  pages: TemplatePage[],
  pageNumber: number,
  block: TemplateBlock,
  present: (page: TemplatePage | undefined) => boolean,
  predicate?: (candidate: TemplateBlock) => boolean,
) {
  const targetIndex = findPartnershipPageIndex(pages, pageNumber);
  if (targetIndex < 0 || present(pages[targetIndex])) return pages;
  return pages.map((page, index) => index === targetIndex
    ? { ...page, blocks: predicate ? addBlockBefore(page.blocks, block, predicate) : [...page.blocks, block] }
    : page);
}

function ensurePartnershipRepeatBlocks(pages: TemplatePage[], language: Language, repeaterKey = "partners") {
  let next = removeLegacyPartnershipSlotBlocks(cleanMisplacedPartnershipSlotBlocks(pages));
  next = ensurePageBlock(next, 2, partnerParticularsRepeatBlock(language, 1, 2, repeaterKey), (page) => pageHasRepeatBlock(page, "particulars", repeaterKey));
  next = ensurePageBlock(next, 3, partnerParticularsRepeatBlock(language, 3, 8, repeaterKey), (page) => pageHasRepeatBlock(page, "particulars", repeaterKey), (candidate) => /recital|ভূমিকা/i.test(blockText(candidate)));
  const capitalLabel = textBlock("partnership-capital-schedule-label", "paragraph", copy(language, "PARTNER | CAPITAL (BDT) | PROFIT / LOSS SHARE", "অংশীদার | মূলধন (টাকা) | লাভ-লোকসানের অনুপাত"), { bold: true, align: "center", fontSize: "small" });
  const capitalRow = textBlock("partnership-capital-schedule-row", "paragraph", `${copy(language, "Partner", "অংশীদার")} {{item_number}}: {{name}} | {{capital}} ({{capital_words}}) | {{profit_share}}`, { bold: false, repeat: { repeaterKey } });
  next = ensurePageBlock(next, 11, capitalLabel, (page) => Boolean(page?.blocks.some((block) => block.type === "paragraph" && (block.text.includes("PARTNER | CAPITAL") || block.text.includes("অংশীদার | মূলধন")))), (candidate) => /capital-note|প্রকাশের আগে/i.test(blockText(candidate)));
  next = ensurePageBlock(next, 11, capitalRow, (page) => pageHasRepeatBlock(page, "capital-row", repeaterKey), (candidate) => /capital-note|প্রকাশের আগে/i.test(blockText(candidate)));
  const designationLabel = textBlock("partnership-designation-schedule-label", "paragraph", copy(language, "DESIGNATIONS", "পদবী"), { bold: true, align: "center", fontSize: "small" });
  const designationRow = textBlock("partnership-designation-schedule-row", "paragraph", `${copy(language, "Partner", "অংশীদার")} {{item_number}} — {{name}} — {{role}}`, { bold: false, repeat: { repeaterKey } });
  next = ensurePageBlock(next, 23, designationLabel, (page) => Boolean(page?.blocks.some((block) => block.type === "paragraph" && (block.text.includes("DESIGNATIONS") || block.text.includes("পদবী")))));
  next = ensurePageBlock(next, 23, designationRow, (page) => pageHasRepeatBlock(page, "designation-row", repeaterKey));
  return next;
}

function ensureFinalSignatureBlocks(pages: TemplatePage[], language: Language, repeaterKey = "partners") {
  const targetIndex = findPartnershipPageIndex(pages, 40);
  const finalPage = pages[targetIndex];
  if (!finalPage) return pages;

  let blocks = finalPage.blocks.filter((block) => {
    const legacy = legacyPartnershipSlotBlock(block);
    return !legacy || legacy.kind !== "signature";
  });
  const hasRepeatSignature = pageHasRepeatBlock({ ...finalPage, blocks }, "signature", repeaterKey);
  const firstWitnessIndex = blocks.findIndex((block) => hasWitnessSignature(block) && /Witness 1|সাক্ষী ১/i.test(block.label));
  let insertAt = firstWitnessIndex >= 0 ? firstWitnessIndex : blocks.length;
  if (!hasRepeatSignature) {
    blocks.splice(insertAt, 0, signatureBlock(
      "partnership-partners-signatures",
      `${copy(language, "Partner", "অংশীদার")} {{item_number}} — {{name}}`,
      undefined,
      { repeat: { repeaterKey } },
    ));
  }

  for (const number of [1, 2, 3]) {
    const witnessExists = blocks.some((block) => block.type === "signature" && new RegExp(`Witness ${number}|সাক্ষী ${number}`, "i").test(block.label));
    if (!witnessExists) blocks.push(signatureBlock(`partnership-witness-${number}-signature`, copy(language, `Witness ${number} — {{witness_${number}}}`, `সাক্ষী ${number} — {{witness_${number}}}`)));
  }

  const finalSettings = {
    ...finalPage.settings,
    stampGap: finalPage.settings.stampGap ?? 0,
    marginTop: finalPage.settings.marginTop ?? 20,
    marginBottom: finalPage.settings.marginBottom ?? 20,
    defaultFontSize: finalPage.settings.defaultFontSize ?? "body",
  };
  return pages.map((page, index) => index === targetIndex ? { ...page, settings: finalSettings, blocks } : page);
}

export function upgradePartnershipDeedTemplate(template: DocumentTemplateDraft): DocumentTemplateDraft {
  if (!isPartnershipDeedTemplate(template)) return template;
  const language: Language = template.slug.endsWith("-bn") ? "bn" : "en";
  const defaultRepeater = partnershipPartnerRepeater(language);
  const existingRepeater = template.settings.repeaters.find((repeater) => repeater.id === defaultRepeater.id || repeater.key === defaultRepeater.key || repeater.fields.some((field) => field.sourceKeyPattern === "partner_{index}_name"));
  const configuredRepeater: TemplateRepeater = existingRepeater
    ? {
        ...defaultRepeater,
        ...existingRepeater,
        minItems: partnershipDeedMinPartners,
        maxItems: partnershipDeedMaxPartners,
        fields: defaultRepeater.fields.map((defaultField) => {
          const currentField = existingRepeater.fields.find((field) => field.key === defaultField.key);
          return currentField ? { ...defaultField, ...currentField, sourceKeyPattern: currentField.sourceKeyPattern ?? defaultField.sourceKeyPattern } : defaultField;
        }).concat(existingRepeater.fields.filter((field) => !defaultRepeater.fields.some((defaultField) => defaultField.key === field.key))),
      }
    : defaultRepeater;
  const repeaters = existingRepeater
    ? template.settings.repeaters.map((repeater) => repeater.id === existingRepeater.id ? configuredRepeater : repeater)
    : [...template.settings.repeaters, configuredRepeater];
  let fields = template.fields.map((field) => {
    const partnerMatch = /^partner_(\d+)_(name|details|role|capital|capital_words|profit_share)$/.exec(field.key);
    if (partnerMatch) {
      const number = Number(partnerMatch[1]);
      const isCapital = partnerMatch[2] === "capital" || partnerMatch[2] === "capital_words";
      return {
        ...field,
        required: isCapital ? false : partnerMatch[2] === "profit_share" ? true : field.required,
        visibleWhen: field.visibleWhen ?? partnershipPartnerVisibility(number),
      };
    }
    if (["initial_capital", "initial_capital_words", "additional_capital_stamp"].includes(field.key)) return { ...field, required: false };
    if (field.key === "partner_count") return {
      ...field,
      options: partnerCountOptions(language, configuredRepeater.maxItems, field.options),
      defaultValue: String(partnershipDeedMinPartners),
    };
    return field;
  });

  // Older seeded versions only contained four partner slots. Add the
  // remaining definitions without replacing any administrator-entered data.
  for (const number of partnershipPartnerNumbers) {
    for (const field of partnerFieldsForSlot(language, number)) {
      if (!fields.some((candidate) => candidate.key === field.key)) fields.push(field);
    }
  }

  let pages = template.pages.map((page) => ({
    ...page,
    blocks: page.blocks.map((block) => {
      const references = partnerReferences(block);
      return references.length === 1 && !block.visibleWhen ? { ...block, visibleWhen: partnershipPartnerVisibility(references[0]) } : block;
    }),
  }));

  // Repair blocks produced by older versions, then replace the generated
  // per-slot rows with repeatable blocks driven by the group definition.
  pages = ensurePartnershipRepeatBlocks(pages, language, configuredRepeater.key);

  const fieldsWithWitnesses = [...fields];
  for (const witness of witnessFields(language)) {
    if (!fieldsWithWitnesses.some((field) => field.key === witness.key)) fieldsWithWitnesses.push(witness);
  }
  return { ...template, settings: { ...template.settings, repeaters }, fields: fieldsWithWitnesses, pages: ensureFinalSignatureBlocks(pages, language, configuredRepeater.key) };
}

export function addPartnershipPartnerSlot(template: DocumentTemplateDraft): DocumentTemplateDraft {
  // Kept as a compatibility export for older callers. Partner slots are now
  // always provisioned by the repeatable-group metadata and the user chooses
  // the active count in the public form.
  return upgradePartnershipDeedTemplate(template);
}

export const defaultPartnershipDeed40EnglishTemplate = createPartnershipDeedTemplate("en");
export const defaultPartnershipDeed40BanglaTemplate = createPartnershipDeedTemplate("bn");
export const defaultPartnershipDeed40Templates = [defaultPartnershipDeed40EnglishTemplate, defaultPartnershipDeed40BanglaTemplate] as const;
