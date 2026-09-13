import {
  defaultTemplateSettings,
  type TemplateBlock,
  type TemplateField,
  type TemplatePage,
  type TemplateSettings,
  type DocumentTemplateDraft,
} from "./document-templates";

function textField(
  id: string,
  key: string,
  label: string,
  placeholder: string,
  required = true,
): TemplateField {
  return { id, key, label, type: "text", required, placeholder, options: [] };
}

function areaField(
  id: string,
  key: string,
  label: string,
  placeholder: string,
  required = true,
): TemplateField {
  return {
    id,
    key,
    label,
    type: "textarea",
    required,
    placeholder,
    options: [],
  };
}

function dateField(
  id: string,
  key: string,
  label: string,
  required = true,
): TemplateField {
  return {
    id,
    key,
    label,
    type: "date",
    required,
    placeholder: "",
    options: [],
  };
}

function numberField(
  id: string,
  key: string,
  label: string,
  placeholder: string,
  required = true,
): TemplateField {
  return { id, key, label, type: "number", required, placeholder, options: [] };
}

function textBlock(
  id: string,
  type: "title" | "heading" | "paragraph",
  text: string,
  options: Partial<
    Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>
  > = {},
): TemplateBlock {
  return {
    id,
    type,
    text,
    align: "left",
    bold: type !== "paragraph",
    italic: false,
    fontSize:
      type === "title" ? "title" : type === "heading" ? "subtitle" : "body",
    ...options,
  };
}

function signatureBlock(id: string, label: string): TemplateBlock {
  return { id, type: "signature", label };
}

function rentalDeedSettings(): TemplateSettings {
  return {
    ...defaultTemplateSettings,
    paperSize: "DEED",
    marginTop: 20,
    marginRight: 18,
    marginBottom: 20,
    marginLeft: 18,
    stampGap: 80,
    showPageNumbers: false,
    defaultFontSize: "body",
    serviceCta: { ...defaultTemplateSettings.serviceCta },
  };
}

function rentalDeedFields(prefix: string, bangla: boolean): TemplateField[] {
  const label = (english: string, bengali: string) =>
    bangla ? bengali : english;
  return [
    dateField(
      `${prefix}-start-date`,
      "agreement_start_date",
      label("Agreement start date", "চুক্তি শুরুর তারিখ"),
    ),
    dateField(
      `${prefix}-end-date`,
      "agreement_end_date",
      label("Agreement end date", "চুক্তি শেষ হওয়ার তারিখ"),
    ),
    dateField(
      `${prefix}-deed-date`,
      "deed_date",
      label("Deed date", "চুক্তিপত্রের তারিখ"),
    ),
    textField(
      `${prefix}-landlord-name`,
      "landlord_name",
      label("Landlord name", "মালিকের নাম"),
      label("Full legal name", "পূর্ণ নাম"),
    ),
    areaField(
      `${prefix}-landlord-details`,
      "landlord_details",
      label("Landlord identity and address", "মালিকের পরিচয় ও ঠিকানা"),
      label(
        "Father or spouse, NID, mother, address, occupation, nationality and religion",
        "পিতা বা স্বামী, এনআইডি, মাতা, ঠিকানা, পেশা, জাতীয়তা ও ধর্ম",
      ),
    ),
    textField(
      `${prefix}-tenant-name`,
      "tenant_name",
      label("Tenant or business name", "ভাড়াটিয়া বা প্রতিষ্ঠানের নাম"),
      label("Full legal or business name", "পূর্ণ নাম বা প্রতিষ্ঠানের নাম"),
    ),
    areaField(
      `${prefix}-tenant-details`,
      "tenant_details",
      label("Tenant identity and address", "ভাড়াটিয়ার পরিচয় ও ঠিকানা"),
      label(
        "Trade licence, representatives, NID, address, occupation, nationality and religion",
        "ট্রেড লাইসেন্স, প্রতিনিধির নাম, এনআইডি, ঠিকানা, পেশা, জাতীয়তা ও ধর্ম",
      ),
    ),
    areaField(
      `${prefix}-premises`,
      "premises_address",
      label("Office premises", "অফিসের ঠিকানা"),
      label(
        "Full rented office address and description",
        "ভাড়া নেওয়া অফিসের পূর্ণ ঠিকানা ও বিবরণ",
      ),
    ),
    textField(
      `${prefix}-use`,
      "permitted_use",
      label("Permitted use", "অনুমোদিত ব্যবহার"),
      label("Office operations only", "শুধুমাত্র অফিস কার্যক্রম"),
    ),
    numberField(
      `${prefix}-rent`,
      "monthly_rent",
      label("Monthly rent", "মাসিক ভাড়া"),
      "20000",
    ),
    textField(
      `${prefix}-rent-words`,
      "monthly_rent_words",
      label("Monthly rent in words", "কথায় মাসিক ভাড়া"),
      label("Twenty thousand taka only", "বিশ হাজার টাকা মাত্র"),
    ),
    textField(
      `${prefix}-rent-window`,
      "rent_due_window",
      label("Rent payment window", "ভাড়া পরিশোধের সময়"),
      label(
        "Within the 1st to 7th day of each month",
        "প্রতি মাসের ১ থেকে ৭ তারিখের মধ্যে",
      ),
    ),
    textField(
      `${prefix}-payment-method`,
      "payment_method",
      label("Payment method", "পরিশোধের মাধ্যম"),
      label("Cash, bank or bKash", "নগদ, ব্যাংক বা বিকাশ"),
    ),
    numberField(
      `${prefix}-deposit`,
      "security_deposit",
      label("Refundable security deposit", "ফেরতযোগ্য জামানত"),
      "40000",
    ),
    textField(
      `${prefix}-deposit-words`,
      "security_deposit_words",
      label("Deposit in words", "কথায় জামানত"),
      label("Forty thousand taka only", "চল্লিশ হাজার টাকা মাত্র"),
    ),
    numberField(
      `${prefix}-renewal-notice`,
      "renewal_notice_days",
      label("Renewal notice in days", "নবায়নের নোটিশের দিন"),
      "30",
    ),
    numberField(
      `${prefix}-termination-notice`,
      "termination_notice_days",
      label("Termination notice in days", "চুক্তি বাতিলের নোটিশের দিন"),
      "30",
    ),
    textField(
      `${prefix}-witness-1`,
      "witness_1",
      label("Witness 1", "সাক্ষী ১"),
      label("Name and address", "নাম ও ঠিকানা"),
    ),
    textField(
      `${prefix}-witness-2`,
      "witness_2",
      label("Witness 2", "সাক্ষী ২"),
      label("Name and address", "নাম ও ঠিকানা"),
      false,
    ),
    textField(
      `${prefix}-witness-3`,
      "witness_3",
      label("Witness 3", "সাক্ষী ৩"),
      label("Name and address", "নাম ও ঠিকানা"),
      false,
    ),
  ];
}

function rentalDeedPages(bangla: boolean): TemplatePage[] {
  const page = (
    number: number,
    title: string,
    blocks: TemplateBlock[],
  ): TemplatePage => ({
    id: `rental-deed-${bangla ? "bn" : "en"}-page-${number}`,
    title,
    settings: {},
    blocks,
  });
  const firstParty = bangla ? "প্রথম পক্ষ (মালিক)" : "FIRST PARTY (LANDLORD)";
  const secondParty = bangla
    ? "দ্বিতীয় পক্ষ (ভাড়াটিয়া)"
    : "SECOND PARTY (TENANT)";
  const pageLabel = (number: number) =>
    bangla
      ? `(${["০১", "০২", "০৩"][number - 1]}-পাতা)`
      : `(PAGE ${String(number).padStart(2, "0")})`;
  const closing = bangla
    ? "এতদ্বার্থে, কোনো প্রকার প্ররোচনা ছাড়া, সুস্থ শরীরে ও স্বজ্ঞানে, স্বেচ্ছায়, নিম্নস্বাক্ষীগণের উপস্থিতিতে আমরা উভয় পক্ষ এই ভাড়া চুক্তিনামা পড়িয়া, শুনিয়া ও বুঝিয়া পরস্পর সম্মত হয়ে সম্পাদন করিলাম।"
    : "Accordingly, having read, understood and accepted this rental deed voluntarily, consciously and in sound mind, without pressure from any person, both parties execute this deed in the presence of the witnesses below.";

  return [
    page(1, bangla ? "পরিচয় ও প্রারম্ভ" : "Parties and commencement", [
      textBlock(
        "rental-deed-title-script",
        "title",
        bangla
          ? "বিসমিল্লাহির রাহমানির রাহীম"
          : "IN THE NAME OF ALLAH, THE MOST MERCIFUL, THE MOST COMPASSIONATE",
        { align: "center", bold: true, fontSize: "subtitle" },
      ),
      textBlock(
        "rental-deed-title",
        "title",
        bangla ? "অফিস ভাড়ার চুক্তিপত্র" : "OFFICE RENTAL DEED",
        { align: "center", bold: true },
      ),
      textBlock(
        "rental-deed-period",
        "paragraph",
        bangla
          ? "({{agreement_start_date}} তারিখ হইতে {{agreement_end_date}} তারিখ পর্যন্ত চুক্তিপত্র দলিল কার্যকর হইবে)"
          : "(This deed shall remain effective from {{agreement_start_date}} to {{agreement_end_date}}.)",
        { align: "center", bold: true, fontSize: "body" },
      ),
      textBlock("rental-deed-first-heading", "heading", firstParty, {
        align: "right",
      }),
      textBlock(
        "rental-deed-first-details",
        "paragraph",
        bangla
          ? "{{landlord_name}}, নিম্নে বর্ণিত পরিচয় ও ঠিকানার অধিকারী:\n{{landlord_details}}"
          : "{{landlord_name}}, whose identity and address details are:\n{{landlord_details}}",
        { bold: false },
      ),
      textBlock("rental-deed-second-heading", "heading", secondParty, {
        align: "right",
      }),
      textBlock(
        "rental-deed-second-details",
        "paragraph",
        bangla
          ? "{{tenant_name}}, নিম্নে বর্ণিত পরিচয় ও ঠিকানার অধিকারী:\n{{tenant_details}}"
          : "{{tenant_name}}, whose identity and address details are:\n{{tenant_details}}",
        { bold: false },
      ),
      textBlock(
        "rental-deed-opening",
        "paragraph",
        bangla
          ? "পরম করুণাময় মহান আল্লাহ তা'য়ালার নামে এই অফিস ভাড়ার চুক্তিপত্রের বয়ান শুরু করিলাম। প্রথম পক্ষের নিজ মালিকানাধীন {{premises_address}} অফিস হিসাবে ভাড়া দিতে ইচ্ছুক এবং দ্বিতীয় পক্ষ নিম্নবর্ণিত শর্তে উক্ত অফিস ভাড়া নিতে সম্মত হওয়ায় পক্ষগণের মধ্যে এই চুক্তিপত্র সম্পাদিত হইল। এই চুক্তিপত্র {{deed_date}} তারিখে সম্পাদিত এবং {{agreement_start_date}} তারিখ হইতে কার্যকর হইবে।"
          : "This office rental deed is made because the Second Party agrees to rent the First Party’s premises at {{premises_address}} for office use on the terms below. The deed is executed on {{deed_date}} and takes effect from {{agreement_start_date}}.",
        { bold: false },
      ),
    ]),
    page(2, bangla ? "চুক্তির শর্তাবলি" : "Terms and conditions", [
      textBlock("rental-deed-page-label", "paragraph", pageLabel(2), {
        align: "center",
        bold: false,
        fontSize: "small",
      }),
      textBlock(
        "rental-deed-terms-title",
        "title",
        bangla ? "চুক্তির শর্তাবলি" : "TERMS AND CONDITIONS",
        { align: "center", bold: true },
      ),
      textBlock(
        "rental-deed-term",
        "heading",
        bangla ? "১। চুক্তির মেয়াদ" : "1. Term",
        { bold: true },
      ),
      textBlock(
        "rental-deed-term-copy",
        "paragraph",
        bangla
          ? "মেয়াদ {{agreement_start_date}} তারিখ হইতে {{agreement_end_date}} তারিখ পর্যন্ত কার্যকর হইবে। মেয়াদ শেষ হওয়ার কমপক্ষে {{renewal_notice_days}} দিন পূর্বে উভয় পক্ষের সম্মতিতে চুক্তি নবায়ন করা যাবে।"
          : "The term will remain effective from {{agreement_start_date}} to {{agreement_end_date}}. The deed may be renewed by mutual agreement at least {{renewal_notice_days}} days before expiry.",
        { bold: false },
      ),
      textBlock(
        "rental-deed-rent",
        "heading",
        bangla ? "২। মাসিক ভাড়া ও পরিশোধ" : "2. Monthly rent and payment",
        { bold: true },
      ),
      textBlock(
        "rental-deed-rent-copy",
        "paragraph",
        bangla
          ? "মাসিক ভাড়া মাত্র টাকা {{monthly_rent_words}} (৳ {{monthly_rent}}/-)। ভাড়া {{rent_due_window}} {{payment_method}}-এর মাধ্যমে পরিশোধ করতে হবে।"
          : "The monthly rent is BDT {{monthly_rent}} ({{monthly_rent_words}}). It must be paid {{rent_due_window}} by {{payment_method}}.",
        { bold: false },
      ),
      textBlock(
        "rental-deed-deposit",
        "heading",
        bangla ? "৩। জামানত" : "3. Security deposit",
        { bold: true },
      ),
      textBlock(
        "rental-deed-deposit-copy",
        "paragraph",
        bangla
          ? "ভাড়ার পূর্বে দ্বিতীয় পক্ষ প্রথম পক্ষকে টাকা {{security_deposit_words}} (৳ {{security_deposit}}/-) জামানত প্রদান করবে। জামানত পূর্ণ থাকলে এবং কোনো ক্ষয়ক্ষতি বা ইউটিলিটি বিল বকেয়া না থাকলে চুক্তির মেয়াদ শেষে জামানত ফেরত দেওয়া হবে।"
          : "Before possession, the Second Party will pay the First Party a deposit of BDT {{security_deposit}} ({{security_deposit_words}}). The deposit will be returned at the end of the term after any outstanding utility bills or documented damage are settled.",
        { bold: false },
      ),
      textBlock(
        "rental-deed-use",
        "heading",
        bangla ? "৪। সম্পত্তির ব্যবহার" : "4. Permitted use",
        { bold: true },
      ),
      textBlock(
        "rental-deed-use-copy",
        "paragraph",
        bangla
          ? "দ্বিতীয় পক্ষ সম্পত্তিটি শুধুমাত্র {{permitted_use}} হিসেবে ব্যবহার করতে পারবেন। কোনো অবৈধ কর্মকাণ্ড, বাণিজ্যিক উৎপাদন, ব্যবহার পরিবর্তন বা সাবলেট করা যাবে না। প্রথম পক্ষের লিখিত অনুমতি ছাড়া কোনো কাঠামোগত পরিবর্তন বা ডেকোরেশন করা যাবে না।"
          : "The Second Party may use the premises only for {{permitted_use}}. No illegal activity, commercial production, change of use or subletting is permitted. Structural changes or decoration require the First Party’s written consent.",
        { bold: false },
      ),
      textBlock(
        "rental-deed-utilities",
        "heading",
        bangla ? "৫। ইউটিলিটি বিল" : "5. Utilities",
        { bold: true },
      ),
      textBlock(
        "rental-deed-utilities-copy",
        "paragraph",
        bangla
          ? "বিদ্যুৎ, পানি, গ্যাস, ইন্টারনেট ও অন্যান্য ইউটিলিটি বিল দ্বিতীয় পক্ষ বহন করবেন।"
          : "The Second Party will bear the electricity, water, gas, internet and other utility bills.",
        { bold: false },
      ),
      textBlock(
        "rental-deed-maintenance",
        "heading",
        bangla ? "৬। রক্ষণাবেক্ষণ" : "6. Maintenance",
        { bold: true },
      ),
      textBlock(
        "rental-deed-maintenance-copy",
        "paragraph",
        bangla
          ? "সাধারণ পরিষ্কার-পরিচ্ছন্নতা ও রক্ষণাবেক্ষণের দায়িত্ব দ্বিতীয় পক্ষের হবে। ভাড়াটিয়ার কারণে কোনো ক্ষয়ক্ষতি হলে মেরামত বা ক্ষতিপূরণের দায় ভাড়াটিয়াকে বহন করতে হবে।"
          : "The Second Party will be responsible for ordinary cleaning and maintenance. Any damage caused by the tenant must be repaired or compensated for by the tenant.",
        { bold: false },
      ),
      textBlock(
        "rental-deed-termination",
        "heading",
        bangla ? "৭। চুক্তি বাতিল" : "7. Termination",
        { bold: true },
      ),
      textBlock(
        "rental-deed-termination-copy",
        "paragraph",
        bangla
          ? "যেকোনো পক্ষ চুক্তি বাতিল করতে চাইলে অপর পক্ষকে কমপক্ষে {{termination_notice_days}} দিন আগে লিখিতভাবে জানাতে হবে। বকেয়া ভাড়া বা ক্ষয়ক্ষতি থাকলে তা জামানত থেকে সমন্বয় বা বাজেয়াপ্ত করা যাবে এবং চুক্তি বাতিলের আগে পক্ষগণের মধ্যে হিসাব নিষ্পত্তি করতে হবে।"
          : "Either party wishing to terminate must give the other party at least {{termination_notice_days}} days’ written notice. Any unpaid rent or documented damage may be adjusted against or forfeited from the deposit, and the parties must settle their accounts before termination.",
        { bold: false },
      ),
    ]),
    page(3, bangla ? "সম্পাদন ও স্বাক্ষর" : "Execution and signatures", [
      textBlock("rental-deed-page-label", "paragraph", pageLabel(3), {
        align: "center",
        bold: false,
        fontSize: "small",
      }),
      textBlock("rental-deed-closing", "paragraph", closing, { bold: false }),
      textBlock(
        "rental-deed-date",
        "paragraph",
        bangla
          ? "ইতি,\nতারিখ-{{deed_date}}"
          : "In witness whereof,\nDate: {{deed_date}}",
        { bold: true },
      ),
      textBlock(
        "rental-deed-signature-heading",
        "heading",
        bangla ? "স্বাক্ষর" : "SIGNATURES",
        { align: "center", bold: true },
      ),
      signatureBlock(
        "rental-deed-landlord-signature",
        bangla
          ? "মালিকের স্বাক্ষর / প্রথম পক্ষ — {{landlord_name}}"
          : "Landlord signature / First Party — {{landlord_name}}",
      ),
      signatureBlock(
        "rental-deed-witness-1",
        bangla ? "সাক্ষী ১ — {{witness_1}}" : "Witness 1 — {{witness_1}}",
      ),
      signatureBlock(
        "rental-deed-tenant-signature",
        bangla
          ? "ভাড়াটিয়ার স্বাক্ষর / দ্বিতীয় পক্ষ — {{tenant_name}}"
          : "Tenant signature / Second Party — {{tenant_name}}",
      ),
      signatureBlock(
        "rental-deed-witness-2",
        bangla ? "সাক্ষী ২ — {{witness_2}}" : "Witness 2 — {{witness_2}}",
      ),
      signatureBlock(
        "rental-deed-witness-3",
        bangla ? "সাক্ষী ৩ — {{witness_3}}" : "Witness 3 — {{witness_3}}",
      ),
    ]),
  ];
}

function createRentalDeedTemplate(
  language: "en" | "bn",
): DocumentTemplateDraft {
  const bangla = language === "bn";
  return {
    title: bangla ? "অফিস ভাড়ার চুক্তিপত্র" : "Office Rental Deed",
    slug: bangla ? "office-rental-deed-bn" : "office-rental-deed-en",
    description: bangla
      ? "অফিস ভাড়ার শর্ত, পক্ষগণের তথ্য, জামানত ও স্বাক্ষর প্রস্তুত করার জন্য তিন পৃষ্ঠার চুক্তিপত্র।"
      : "A three-page office rental deed for recording the parties, premises, rent, deposit, terms and signatures.",
    settings: rentalDeedSettings(),
    fields: rentalDeedFields(`rental-deed-${language}`, bangla),
    pages: rentalDeedPages(bangla),
  };
}

export const defaultRentalDeedEnglishTemplate = createRentalDeedTemplate("en");
export const defaultRentalDeedBanglaTemplate = createRentalDeedTemplate("bn");
export const defaultRentalDeedTemplates = [
  defaultRentalDeedEnglishTemplate,
  defaultRentalDeedBanglaTemplate,
] as const;
