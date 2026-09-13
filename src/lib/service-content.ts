import { navigation, type NavItem, type ServiceIconName } from "@/components/limex/data";
import type { PublicService, PublicServiceCatalog, ServiceDetailContent, ServiceDestination, ServiceLocale } from "./service-types";

export type GeneratedService = {
  serviceKey: string;
  slug: string;
  sectionLabel: string;
  sectionLabelBn: string;
  sectionKey: string;
  groupLabel: string;
  groupLabelBn: string;
  parentLabel: string | null;
  parentLabelBn: string | null;
  isChild: boolean;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: ServiceIconName;
  color: string;
  surface: string;
  href: string;
  detailEn: ServiceDetailContent;
  detailBn: ServiceDetailContent;
};

const sectionLabelsBn: Record<string, string> = {
  "Startup & Licensing": "স্টার্টআপ ও লাইসেন্সিং",
  "IP & Trademark": "মেধাস্বত্ব ও ট্রেডমার্ক",
  "Compliance & Documentation": "কমপ্লায়েন্স ও ডকুমেন্টেশন",
};

const groupLabelsBn: Record<string, string> = {
  "COMPANY SETUP": "কোম্পানি সেটআপ",
  "TAX, TRADE & CLEARANCES": "কর, বাণিজ্য ও ক্লিয়ারেন্স",
  "SPECIALIST SUPPORT & LAUNCH": "বিশেষায়িত সহায়তা ও লঞ্চ",
  "PROTECT YOUR BRAND": "আপনার ব্র্যান্ড সুরক্ষা",
  "CREATE & OWN": "তৈরি করুন ও মালিকানা রাখুন",
  "TAX & VAT": "কর ও ভ্যাট",
  "FINANCE & DOCUMENTS": "অর্থ ও ডকুমেন্ট",
  "RJSC COMPLIANCE": "RJSC কমপ্লায়েন্স",
};

const labelsBn: Record<string, string> = {
  "Company Formation": "কোম্পানি গঠন",
  "Limited Company Formation": "লিমিটেড কোম্পানি গঠন",
  "One Person Company Formation": "ওয়ান পারসন কোম্পানি গঠন",
  "Public Limited Company Formation": "পাবলিক লিমিটেড কোম্পানি গঠন",
  "Partnership Firm Registration": "অংশীদারি ফার্ম নিবন্ধন",
  "Foreign Company Registration": "বিদেশি কোম্পানি নিবন্ধন",
  "Joint venture Company Registration": "যৌথ উদ্যোগ কোম্পানি নিবন্ধন",
  "Society/Foundation/Trust/Club Registration": "সোসাইটি/ফাউন্ডেশন/ট্রাস্ট/ক্লাব নিবন্ধন",
  "Forging Company Formation": "ফোরজিং কোম্পানি গঠন",
  "Trade License": "ট্রেড লাইসেন্স",
  "New Trade License": "নতুন ট্রেড লাইসেন্স",
  Renewal: "নবায়ন",
  Corrections: "সংশোধন",
  "Trade License Cancel": "ট্রেড লাইসেন্স বাতিল",
  "VAT / BIN Registration": "ভ্যাট / BIN নিবন্ধন",
  "BIN Correction & Recovery": "BIN সংশোধন ও পুনরুদ্ধার",
  "TIN / TAX Registration": "TIN / ট্যাক্স নিবন্ধন",
  "New Individual E-TIN Registration": "নতুন ব্যক্তিগত E-TIN নিবন্ধন",
  "Limited Company E-TIN Registration": "লিমিটেড কোম্পানির E-TIN নিবন্ধন",
  "Partnership E-TIN Registration": "অংশীদারি ফার্মের E-TIN নিবন্ধন",
  "E-TIN Correction": "E-TIN সংশোধন",
  "E-TIN Cancel": "E-TIN বাতিল",
  "Import License": "আমদানি লাইসেন্স",
  "Export License": "রপ্তানি লাইসেন্স",
  "Factory License": "কারখানা লাইসেন্স",
  "Fire License": "ফায়ার লাইসেন্স",
  "BSTI Permission": "BSTI অনুমতি",
  "Environment Clearance": "পরিবেশ ছাড়পত্র",
  "Association Membership": "অ্যাসোসিয়েশন সদস্যপদ",
  "DHAKA Chamber of Commerce": "ঢাকা চেম্বার অব কমার্স",
  "REHAB MEMBERSHIP": "REHAB সদস্যপদ",
  "RAJUK Enlistment": "রাজউক তালিকাভুক্তি",
  "Others Membership": "অন্যান্য সদস্যপদ",
  "DBID Certificate": "DBID সনদ",
  "Travel Agency License": "ট্রাভেল এজেন্সি লাইসেন্স",
  "BIDA Registration": "BIDA নিবন্ধন",
  "e-GP Registration": "e-GP নিবন্ধন",
  "Startup Business Package": "স্টার্টআপ ব্যবসা প্যাকেজ",
  Website: "ওয়েবসাইট",
  "Logo Design": "লোগো ডিজাইন",
  "Digital Marketing": "ডিজিটাল মার্কেটিং",
  Trademark: "ট্রেডমার্ক",
  "Trademark Search": "ট্রেডমার্ক অনুসন্ধান",
  "Trademark Application": "ট্রেডমার্ক আবেদন",
  "TM Objection": "TM আপত্তি",
  "Trademark Publication/Gazette": "ট্রেডমার্ক প্রকাশনা/গেজেট",
  "Trademark Opposition": "ট্রেডমার্ক বিরোধিতা",
  "Trademark Certification": "ট্রেডমার্ক সনদ",
  "Trademark Class Finder": "ট্রেডমার্ক শ্রেণি খোঁজা",
  "Expert Trademark Review": "বিশেষজ্ঞ ট্রেডমার্ক পর্যালোচনা",
  "Copyright Registration": "কপিরাইট নিবন্ধন",
  "Patent Registration": "পেটেন্ট নিবন্ধন",
  "Income Tax": "আয়কর",
  "Individual Tax Return Filings": "ব্যক্তিগত আয়কর রিটার্ন দাখিল",
  "Withholdings Tax Submission": "উৎসে কর জমা",
  VAT: "ভ্যাট",
  "Monthly Vat Return Submission": "মাসিক ভ্যাট রিটার্ন দাখিল",
  "CA Audit Service": "CA অডিট সেবা",
  "CA Assets Valuation": "CA সম্পদ মূল্যায়ন",
  "Project Proposal": "প্রকল্প প্রস্তাব",
  "Accounts Service": "হিসাবরক্ষণ সেবা",
  "HR and Payroll Service": "HR ও পেরোল সেবা",
  Affidavits: "হলফনামা",
  Translation: "অনুবাদ সেবা",
  "RJSC Compliance": "RJSC কমপ্লায়েন্স",
  "Annual Return Filings": "বার্ষিক রিটার্ন দাখিল",
  "Share Transfer": "শেয়ার হস্তান্তর",
  "Share Allotment": "শেয়ার বরাদ্দ",
  "Winding up": "কার্যক্রম বন্ধ ও অবসায়ন",
  "High Court permission": "হাইকোর্টের অনুমতি",
};

const childDescriptions: Record<string, { en: string; bn: string }> = {
  "Limited Company Formation": { en: "Form a private limited company with clear RJSC documentation and filing support.", bn: "সঠিক RJSC ডকুমেন্ট ও দাখিল সহায়তায় প্রাইভেট লিমিটেড কোম্পানি গঠন করুন।" },
  "One Person Company Formation": { en: "Set up a one-person company with a structure that fits a single founder.", bn: "একজন উদ্যোক্তার জন্য উপযোগী কাঠামোতে ওয়ান পারসন কোম্পানি গড়ে তুলুন।" },
  "Public Limited Company Formation": { en: "Prepare the documents and steps needed for a public limited company structure.", bn: "পাবলিক লিমিটেড কোম্পানির কাঠামোর জন্য প্রয়োজনীয় ডকুমেন্ট ও ধাপ প্রস্তুত করুন।" },
  "Partnership Firm Registration": { en: "Register a partnership firm with clear partner information and a practical deed path.", bn: "সঠিক অংশীদার তথ্য ও ব্যবহারিক দলিলের মাধ্যমে অংশীদারি ফার্ম নিবন্ধন করুন।" },
  "Foreign Company Registration": { en: "Plan the registration path for a foreign company entering or operating in Bangladesh.", bn: "বাংলাদেশে প্রবেশ বা কার্যক্রম পরিচালনাকারী বিদেশি কোম্পানির নিবন্ধন পরিকল্পনা করুন।" },
  "Joint venture Company Registration": { en: "Organize the registration and supporting documents for a joint venture company.", bn: "যৌথ উদ্যোগ কোম্পানির নিবন্ধন ও সহায়ক ডকুমেন্ট গুছিয়ে নিন।" },
  "Society/Foundation/Trust/Club Registration": { en: "Prepare a clear registration route for a society, foundation, trust or club.", bn: "সোসাইটি, ফাউন্ডেশন, ট্রাস্ট বা ক্লাব নিবন্ধনের জন্য পরিষ্কার পথ প্রস্তুত করুন।" },
  "Forging Company Formation": { en: "Set up the legal and document foundation for a forging or manufacturing business.", bn: "ফোরজিং বা উৎপাদন ব্যবসার জন্য আইনি ও ডকুমেন্টের ভিত্তি তৈরি করুন।" },
  "New Trade License": { en: "Apply for a new trade license with the right business and premises information.", bn: "সঠিক ব্যবসা ও ঠিকানার তথ্য দিয়ে নতুন ট্রেড লাইসেন্সের আবেদন করুন।" },
  Renewal: { en: "Keep an existing trade license current with timely renewal support.", bn: "সময়মতো নবায়ন সহায়তায় আপনার ট্রেড লাইসেন্স হালনাগাদ রাখুন।" },
  Corrections: { en: "Correct business, address or owner information on an existing trade license.", bn: "বিদ্যমান ট্রেড লাইসেন্সের ব্যবসা, ঠিকানা বা মালিকের তথ্য সংশোধন করুন।" },
  "Trade License Cancel": { en: "Prepare the documents and application steps to close or cancel a trade license.", bn: "ট্রেড লাইসেন্স বন্ধ বা বাতিলের জন্য ডকুমেন্ট ও আবেদন ধাপ প্রস্তুত করুন।" },
  "BIN Correction & Recovery": { en: "Recover or correct BIN information so your VAT records stay aligned.", bn: "আপনার ভ্যাট রেকর্ড ঠিক রাখতে BIN তথ্য পুনরুদ্ধার বা সংশোধন করুন।" },
  "New Individual E-TIN Registration": { en: "Register an individual E-TIN with the information needed for a clean tax record.", bn: "পরিষ্কার কর রেকর্ডের জন্য প্রয়োজনীয় তথ্য দিয়ে ব্যক্তিগত E-TIN নিবন্ধন করুন।" },
  "Limited Company E-TIN Registration": { en: "Register a company E-TIN and organize the information needed for tax compliance.", bn: "কোম্পানির E-TIN নিবন্ধন করে কর কমপ্লায়েন্সের প্রয়োজনীয় তথ্য গুছিয়ে নিন।" },
  "Partnership E-TIN Registration": { en: "Set up an E-TIN record for a partnership firm and its tax obligations.", bn: "অংশীদারি ফার্মের E-TIN রেকর্ড ও কর দায়বদ্ধতা প্রস্তুত করুন।" },
  "E-TIN Correction": { en: "Fix incorrect or outdated information on an existing E-TIN record.", bn: "বিদ্যমান E-TIN রেকর্ডের ভুল বা পুরোনো তথ্য সংশোধন করুন।" },
  "E-TIN Cancel": { en: "Understand and prepare the steps for cancelling an E-TIN when appropriate.", bn: "প্রয়োজন হলে E-TIN বাতিলের প্রক্রিয়া বুঝে প্রস্তুত করুন।" },
  "DHAKA Chamber of Commerce": { en: "Prepare the documents for membership with the Dhaka Chamber of Commerce.", bn: "ঢাকা চেম্বার অব কমার্সের সদস্যপদের জন্য প্রয়োজনীয় ডকুমেন্ট প্রস্তুত করুন।" },
  "REHAB MEMBERSHIP": { en: "Organize an application for REHAB membership with the right business papers.", bn: "সঠিক ব্যবসায়িক কাগজপত্র দিয়ে REHAB সদস্যপদের আবেদন গুছিয়ে নিন।" },
  "RAJUK Enlistment": { en: "Prepare the information and supporting documents for RAJUK enlistment.", bn: "রাজউক তালিকাভুক্তির জন্য তথ্য ও সহায়ক ডকুমেন্ট প্রস্তুত করুন।" },
  "Others Membership": { en: "Find and prepare the right membership application for your business network.", bn: "আপনার ব্যবসায়িক নেটওয়ার্কের জন্য উপযুক্ত সদস্যপদের আবেদন প্রস্তুত করুন।" },
  Website: { en: "Create a focused website foundation for a credible business launch.", bn: "বিশ্বাসযোগ্য ব্যবসায়িক লঞ্চের জন্য একটি কার্যকর ওয়েবসাইটের ভিত্তি তৈরি করুন।" },
  "Logo Design": { en: "Shape a clear visual identity that makes your business easier to remember.", bn: "আপনার ব্যবসাকে সহজে মনে রাখার মতো পরিষ্কার ভিজ্যুয়াল পরিচয় তৈরি করুন।" },
  "Digital Marketing": { en: "Plan practical digital marketing support around your business goals and audience.", bn: "আপনার ব্যবসার লক্ষ্য ও গ্রাহক অনুযায়ী ব্যবহারিক ডিজিটাল মার্কেটিং পরিকল্পনা করুন।" },
  "Trademark Search": { en: "Search the relevant register and assess a mark before you invest in filing.", bn: "আবেদনের আগে সংশ্লিষ্ট রেজিস্টারে অনুসন্ধান করে আপনার মার্ক মূল্যায়ন করুন।" },
  "Trademark Application": { en: "Prepare and submit a trademark application with a clear class and document plan.", bn: "পরিষ্কার শ্রেণি ও ডকুমেন্ট পরিকল্পনায় ট্রেডমার্ক আবেদন প্রস্তুত ও দাখিল করুন।" },
  "TM Objection": { en: "Review a TM objection and prepare a structured response for the next step.", bn: "TM আপত্তি পর্যালোচনা করে পরবর্তী ধাপের জন্য গুছানো জবাব প্রস্তুত করুন।" },
  "Trademark Publication/Gazette": { en: "Move a trademark through publication or gazette requirements with practical guidance.", bn: "ব্যবহারিক সহায়তায় ট্রেডমার্ক প্রকাশনা বা গেজেটের ধাপ সম্পন্ন করুন।" },
  "Trademark Opposition": { en: "Prepare an informed response or opposition path when a mark is challenged.", bn: "মার্ক নিয়ে আপত্তি উঠলে জেনে-বুঝে জবাব বা বিরোধিতার পথ প্রস্তুত করুন।" },
  "Trademark Certification": { en: "Complete the steps toward receiving and keeping your trademark certificate in order.", bn: "ট্রেডমার্ক সনদ পাওয়া ও রেকর্ড ঠিক রাখার ধাপগুলো সম্পন্ন করুন।" },
  "Trademark Class Finder": { en: "Identify the class direction that best matches your goods or services.", bn: "আপনার পণ্য বা সেবার সঙ্গে সবচেয়ে মানানসই শ্রেণি খুঁজে নিন।" },
  "Expert Trademark Review": { en: "Get an expert review of your mark, class choice and filing readiness.", bn: "আপনার মার্ক, শ্রেণি নির্বাচন ও আবেদন প্রস্তুতি বিশেষজ্ঞ দিয়ে পর্যালোচনা করুন।" },
  "Individual Tax Return Filings": { en: "Prepare and file an individual tax return with a clear record of income and documents.", bn: "আয় ও ডকুমেন্টের পরিষ্কার রেকর্ডসহ ব্যক্তিগত কর রিটার্ন প্রস্তুত ও দাখিল করুন।" },
  "Withholdings Tax Submission": { en: "Organize withholding tax records and submit the information required for compliance.", bn: "উৎসে করের রেকর্ড গুছিয়ে কমপ্লায়েন্সের প্রয়োজনীয় তথ্য জমা দিন।" },
  "Monthly Vat Return Submission": { en: "Keep monthly VAT return preparation consistent with your sales and purchase records.", bn: "বিক্রয় ও ক্রয় রেকর্ডের সঙ্গে মিল রেখে মাসিক ভ্যাট রিটার্ন প্রস্তুত রাখুন।" },
  "Annual Return Filings": { en: "Prepare the annual return information needed to keep company records current.", bn: "কোম্পানির রেকর্ড হালনাগাদ রাখতে বার্ষিক রিটার্নের তথ্য প্রস্তুত করুন।" },
  "Share Transfer": { en: "Organize the documents and company records for a compliant share transfer.", bn: "কমপ্লায়েন্ট শেয়ার হস্তান্তরের জন্য ডকুমেন্ট ও কোম্পানি রেকর্ড গুছিয়ে নিন।" },
  "Share Allotment": { en: "Prepare an accurate share allotment record and the related corporate filings.", bn: "সঠিক শেয়ার বরাদ্দ রেকর্ড ও সংশ্লিষ্ট কর্পোরেট দাখিল প্রস্তুত করুন।" },
  "Winding up": { en: "Plan the documentation and filing steps for an orderly company winding up.", bn: "সুশৃঙ্খল কোম্পানি অবসায়নের জন্য ডকুমেন্ট ও দাখিলের ধাপ পরিকল্পনা করুন।" },
  "High Court permission": { en: "Prepare the information and supporting documents for a High Court permission process.", bn: "হাইকোর্টের অনুমতি প্রক্রিয়ার জন্য তথ্য ও সহায়ক ডকুমেন্ট প্রস্তুত করুন।" },
};

const sectionTone: Record<string, { color: string; surface: string }> = {
  "Startup & Licensing": { color: "#14dcff", surface: "#e9fbff" },
  "IP & Trademark": { color: "#0055ff", surface: "#e8efff" },
  "Compliance & Documentation": { color: "#008cff", surface: "#eaf3ff" },
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160) || "service";
}

function localizedLabel(label: string) {
  return labelsBn[label] ?? label;
}

function detailFor(locale: ServiceLocale, title: string, description: string, section: string, group: string): ServiceDetailContent {
  if (locale === "bn") {
    return {
      ctaLabel: "পরামর্শ নিন",
      startingPrice: "আলোচনা করে নির্ধারণ",
      deliveryTime: "পর্যালোচনার পর নিশ্চিত",
      serviceMode: "অনলাইন বা সরাসরি",
      mediaTitle: title,
      mediaDescription: `${title}-এর জন্য পরিষ্কার ও ব্যবহারিক সহায়তা।`,
      mediaUrl: "",
      mediaAlt: `${title} সেবার জন্য Limex সহায়তা`,
      overviewEyebrow: `${section} / ${group}`,
      overviewTitle: `${title} সহজভাবে এগিয়ে নিন`,
      overviewDescription: `${description} Limex আপনার প্রয়োজন, ডকুমেন্ট ও পরবর্তী ধাপ পরিষ্কারভাবে গুছিয়ে নিতে সহায়তা করে।`,
      contentLabel: "LIMEX পদ্ধতি",
      contentTitle: "প্রয়োজনীয় কাজগুলো এক জায়গায় পরিষ্কার রাখুন।",
      contentDescription: `শুরু করার আগে কী লাগবে, কোন তথ্য প্রস্তুত করতে হবে এবং পরবর্তী ধাপ কী—${title}-এর ক্ষেত্রে আমরা তা সহজ ভাষায় বুঝিয়ে দিই।`,
      contentLinkLabel: "প্রয়োজনীয়তা নিয়ে কথা বলুন",
      contentLinkHref: "#service-contact",
      benefits: ["শুরু করার আগে পরিষ্কার প্রয়োজনীয়তা", "ডকুমেন্ট ও তথ্য পর্যালোচনা", "পরবর্তী ধাপে ব্যবহারিক আপডেট"],
      steps: [
        { title: "প্রয়োজন বুঝে নিন", description: "আপনার লক্ষ্য ও বর্তমান অবস্থার সংক্ষিপ্ত তথ্য শেয়ার করুন।" },
        { title: "তথ্য প্রস্তুত করুন", description: "প্রয়োজনীয় কাগজপত্র ও তথ্যের একটি পরিষ্কার তালিকা তৈরি করুন।" },
        { title: "আত্মবিশ্বাসের সঙ্গে এগোন", description: "পরবর্তী দাখিল বা কাজের ধাপটি গুছিয়ে সম্পন্ন করুন।" },
      ],
      facts: [
        { label: "সহায়তার ধরন", value: "গাইডেড সার্ভিস" },
        { label: "মাধ্যম", value: "অনলাইন বা সরাসরি" },
        { label: "পরবর্তী ধাপ", value: "সংক্ষিপ্ত পরামর্শ" },
      ],
      pricing: [],
      faqs: [
        { question: "শুরু করতে কী লাগবে?", answer: `${title}-এর জন্য আপনার লক্ষ্য, মৌলিক তথ্য ও আগে থেকে থাকা ডকুমেন্ট শেয়ার করুন।` },
        { question: "কত সময় লাগতে পারে?", answer: "কাজের পরিধি ও সংশ্লিষ্ট কর্তৃপক্ষের প্রক্রিয়ার ওপর সময় নির্ভর করে। শুরুতেই আমরা বাস্তবসম্মত পরবর্তী ধাপ জানাই।" },
        { question: "Limex কি পুরো প্রক্রিয়ায় সহায়তা করবে?", answer: "হ্যাঁ। প্রয়োজন বোঝা, তথ্য প্রস্তুত করা এবং পরবর্তী ধাপ পর্যন্ত ব্যবহারিক সহায়তা দেওয়াই আমাদের লক্ষ্য।" },
      ],
    };
  }

  return {
    ctaLabel: "Talk to an advisor",
    startingPrice: "Let's talk",
    deliveryTime: "Confirmed after review",
    serviceMode: "Online or offline",
    mediaTitle: title,
    mediaDescription: `A clear, practical path for ${title.toLowerCase()}.`,
    mediaUrl: "",
    mediaAlt: `Limex support for ${title}`,
    overviewEyebrow: `${section} / ${group}`,
    overviewTitle: `${title} with a clear plan`,
    overviewDescription: `${description} Limex helps you organize the information, documents and next steps around the work.`,
    contentLabel: "THE LIMEX APPROACH",
    contentTitle: "Keep the important work clear and moving.",
    contentDescription: `Understand what ${title.toLowerCase()} involves, prepare the right information and move to the next step without unnecessary complexity.`,
    contentLinkLabel: "Ask about requirements",
    contentLinkHref: "#service-contact",
    benefits: ["Clear requirements before you begin", "Document and information review", "Practical updates through the next step"],
    steps: [
      { title: "Clarify the scope", description: "Share your goal and the current situation in a short conversation." },
      { title: "Prepare the information", description: "Organize the records and documents needed for the work." },
      { title: "Move forward", description: "Complete the next filing or action with a clear path." },
    ],
    facts: [
      { label: "Support type", value: "Guided service" },
      { label: "Service mode", value: "Online or offline" },
      { label: "Next step", value: "Short discovery call" },
    ],
    pricing: [],
    faqs: [
      { question: "What do I need to get started?", answer: `Share your goal, basic details and any documents you already have for ${title.toLowerCase()}.` },
      { question: "How long will it take?", answer: "Timing depends on the scope and the relevant authority. We explain the practical next step before work begins." },
      { question: "Can Limex support the full process?", answer: "Yes. We can help you understand the requirements, prepare the information and stay clear on the next step." },
    ],
  };
}

function entryDetail(sectionLabel: string, groupLabel: string, label: string, descriptionEn: string, isChild: boolean) {
  const titleBn = localizedLabel(label);
  const descriptionBn = childDescriptions[label]?.bn ?? `${titleBn} সেবার জন্য প্রয়োজনীয় তথ্য ও ডকুমেন্ট গুছিয়ে ব্যবহারিক সহায়তা নিন।`;
  return {
    titleEn: label,
    titleBn,
    descriptionEn,
    descriptionBn,
    detailEn: detailFor("en", label, descriptionEn, sectionLabel, groupLabel),
    detailBn: detailFor("bn", titleBn, descriptionBn, sectionLabelsBn[sectionLabel] ?? sectionLabel, groupLabelsBn[groupLabel] ?? groupLabel),
    isChild,
  };
}

function buildEntries() {
  const usedSlugs = new Set<string>();
  const entries: GeneratedService[] = [];

  for (const section of navigation.filter((item) => item.megaGroups?.length && item.label !== "Business Tools")) {
    const tone = sectionTone[section.label] ?? sectionTone["Startup & Licensing"];
    const sectionKey = slugify(section.label);

    for (const group of section.megaGroups ?? []) {
      for (const item of group.items) {
        const topLevelSlug = item.href.match(/^\/services\/([^/?#]+)/i)?.[1]?.toLowerCase() ?? slugify(item.label);
        const baseSlug = topLevelSlug || sectionKey;
        const slug = usedSlugs.has(baseSlug) ? `${sectionKey}-${baseSlug}` : baseSlug;
        usedSlugs.add(slug);
        const description = item.description || `Practical support for ${item.label.toLowerCase()}.`;
        const copy = entryDetail(section.label, group.label, item.label, description, false);
        entries.push({
          serviceKey: `service:${slug}`,
          slug,
          sectionLabel: section.label,
          sectionLabelBn: sectionLabelsBn[section.label] ?? section.label,
          sectionKey,
          groupLabel: group.label,
          groupLabelBn: groupLabelsBn[group.label] ?? group.label,
          parentLabel: null,
          parentLabelBn: null,
          isChild: false,
          titleEn: copy.titleEn,
          titleBn: copy.titleBn,
          descriptionEn: copy.descriptionEn,
          descriptionBn: copy.descriptionBn,
          icon: item.icon ?? "briefcase",
          color: tone.color,
          surface: tone.surface,
          href: `/services/${slug}`,
          detailEn: copy.detailEn,
          detailBn: copy.detailBn,
        });

        for (const child of item.children ?? []) {
          const childBaseSlug = slugify(child.label);
          const childSlug = usedSlugs.has(childBaseSlug) ? `${slug}-${childBaseSlug}` : childBaseSlug;
          usedSlugs.add(childSlug);
          const childDescription = childDescriptions[child.label]?.en ?? `Practical support for ${child.label.toLowerCase()}.`;
          const childCopy = entryDetail(section.label, group.label, child.label, childDescription, true);
          entries.push({
            serviceKey: `service:${childSlug}`,
            slug: childSlug,
            sectionLabel: section.label,
            sectionLabelBn: sectionLabelsBn[section.label] ?? section.label,
            sectionKey,
            groupLabel: group.label,
            groupLabelBn: groupLabelsBn[group.label] ?? group.label,
            parentLabel: item.label,
            parentLabelBn: localizedLabel(item.label),
            isChild: true,
            titleEn: childCopy.titleEn,
            titleBn: childCopy.titleBn,
            descriptionEn: childCopy.descriptionEn,
            descriptionBn: childCopy.descriptionBn,
            icon: item.icon ?? "briefcase",
            color: tone.color,
            surface: tone.surface,
            href: `/services/${childSlug}`,
            detailEn: childCopy.detailEn,
            detailBn: childCopy.detailBn,
          });
        }
      }
    }
  }

  return entries;
}

export const generatedServices = buildEntries();

const generatedBySlug = new Map(generatedServices.map((service) => [service.slug, service]));
const generatedByMenuIdentity = new Map(generatedServices.map((service) => [`${service.sectionLabel}:${service.groupLabel}:${service.parentLabel ?? ""}:${service.titleEn}`, service]));

export function getGeneratedService(slug: string) {
  return generatedBySlug.get(slug.toLowerCase()) ?? null;
}

export function getGeneratedServiceForMenu(sectionLabel: string, groupLabel: string, label: string, parentLabel?: string | null) {
  return generatedByMenuIdentity.get(`${sectionLabel}:${groupLabel}:${parentLabel ?? ""}:${label}`) ?? null;
}

export function getGeneratedServiceHref(sectionLabel: string, groupLabel: string, label: string, parentLabel?: string | null) {
  return getGeneratedServiceForMenu(sectionLabel, groupLabel, label, parentLabel)?.href ?? null;
}

export function getGeneratedServiceDetail(slug: string, locale: ServiceLocale = "en") {
  const service = getGeneratedService(slug);
  if (!service) return null;
  return locale === "bn" ? service.detailBn : service.detailEn;
}

function localizedServiceHref(entry: GeneratedService, locale: ServiceLocale) {
  return locale === "bn" ? `/bn${entry.href}` : entry.href;
}

function generatedDestination(entry: GeneratedService, locale: ServiceLocale): ServiceDestination {
  return {
    type: "DETAIL",
    href: localizedServiceHref(entry, locale),
    label: locale === "bn" ? "সেবা দেখুন" : "View service",
    isExternal: false,
  };
}

export function generatedServiceToPublic(entry: GeneratedService, locale: ServiceLocale = "en"): PublicService {
  const title = locale === "bn" ? entry.titleBn : entry.titleEn;
  const description = locale === "bn" ? entry.descriptionBn : entry.descriptionEn;
  const children = generatedServices
    .filter((candidate) => candidate.parentLabel === entry.titleEn && candidate.sectionLabel === entry.sectionLabel && candidate.groupLabel === entry.groupLabel)
    .map((child, index) => ({
      id: `generated-${child.slug}`,
      label: locale === "bn" ? child.titleBn : child.titleEn,
      href: localizedServiceHref(child, locale),
      isVisible: true,
      sortOrder: index,
    }));

  return {
    id: `generated-${entry.slug}`,
    serviceKey: entry.serviceKey,
    menuItemId: null,
    menuLinkId: null,
    parentLabel: entry.parentLabel,
    slug: entry.slug,
    title,
    description,
    category: locale === "bn" ? entry.sectionLabelBn : entry.sectionLabel,
    categoryKey: entry.sectionKey,
    groupLabel: locale === "bn" ? entry.groupLabelBn : entry.groupLabel,
    icon: entry.icon,
    color: entry.color,
    surface: entry.surface,
    href: localizedServiceHref(entry, locale),
    destination: generatedDestination(entry, locale),
    children,
    status: "PUBLISHED",
    hasDetailPage: true,
    sortOrder: generatedServices.indexOf(entry),
    isVisible: true,
    updatedAt: null,
  };
}

export function mergeGeneratedServiceCatalog(catalog: PublicServiceCatalog | null, locale: ServiceLocale = "en"): PublicServiceCatalog {
  const generatedBySlug = new Map(generatedServices.map((entry) => [entry.slug, entry]));
  const generatedByTitle = new Map(generatedServices.map((entry) => [entry.titleEn, entry]));
  const existing = catalog?.items ?? [];
  const generatedForItem = (item: PublicService) => generatedBySlug.get(item.slug) ?? generatedByTitle.get(item.title) ?? null;
  const items = existing.map((item) => {
    const generated = generatedForItem(item);
    if (!generated) return item;
    // A reachable API is the source of truth. Generated service content is a
    // fallback for an unavailable API, never a way to turn an ordinary menu
    // item into a published service page before an administrator creates and
    // assigns one.
    const children = item.children.map((child) => {
      const generatedChild = generatedServices.find((candidate) => candidate.parentLabel === generated.titleEn && (candidate.titleEn === child.label || candidate.titleBn === child.label));
      return generatedChild && locale === "bn" ? { ...child, label: generatedChild.titleBn } : child;
    });
    return {
      ...item,
      ...(locale === "bn"
        ? {
            title: generated.titleBn,
            description: generated.descriptionBn,
            category: generated.sectionLabelBn,
            groupLabel: generated.groupLabelBn,
          }
        : {}),
      children,
    };
  });
  // Do not append generated records when the API responded. New service
  // pages must be explicitly created and assigned in the admin workspace.
  if (!catalog) {
    for (const entry of generatedServices) items.push(generatedServiceToPublic(entry, locale));
  }

  const publicItems = items.filter((item) => item.isVisible);
  const categoryMap = new Map<string, { key: string; label: string; count: number }>();
  for (const item of publicItems) {
    const current = categoryMap.get(item.categoryKey);
    if (current) current.count += 1;
    else categoryMap.set(item.categoryKey, { key: item.categoryKey, label: item.category, count: 1 });
  }
  return { categories: [...categoryMap.values()], items: publicItems };
}

export function hydrateServiceNavigation(items: NavItem[], locale: ServiceLocale = "en", useGeneratedServices = true) {
  if (!useGeneratedServices) return items;
  return items.map((section) => {
    if (section.label === "Business Tools" || !section.megaGroups?.length) return section;
    return {
      ...section,
      megaGroups: section.megaGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          const generatedItem = getGeneratedServiceForMenu(section.label, group.label, item.label);
          const generatedChildren = item.children?.map((child) => getGeneratedServiceForMenu(section.label, group.label, child.label, item.label));
          return {
            ...item,
            href: generatedItem ? localizedServiceHref(generatedItem, locale) : item.href,
            children: item.children?.map((child, index) => ({
              ...child,
              href: generatedChildren?.[index] ? localizedServiceHref(generatedChildren[index]!, locale) : child.href,
            })),
          };
        }),
      })),
    };
  });
}
