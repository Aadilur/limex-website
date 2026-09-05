import type { ToolField, ToolSlug, ToolValues } from "./business-tools.js";

export type DocumentDraft = { title: string; language: "en" | "bn"; sections: { heading: string; body: string }[]; signatures: string[]; warning: string };
const text = (key: string, label: string, hint?: string): ToolField => ({ key, label, required: true, hint });
const area = (key: string, label: string, hint?: string): ToolField => ({ ...text(key, label, hint), kind: "textarea" });
const amount = (key: string, label: string): ToolField => ({ key, label, kind: "number", required: true });
const date: ToolField = { key: "date", label: "Effective date", kind: "date", required: true };
const language: ToolField = { key: "language", label: "Document language", kind: "select", options: [{ value: "en", label: "English" }, { value: "bn", label: "বাংলা" }], defaultValue: "en" };
const partyFields = (first: string, second: string): ToolField[] => [text("partyA", first), area("addressA", `${first} address`), text("partyB", second), area("addressB", `${second} address`)];
export function documentFields(slug: ToolSlug): ToolField[] {
  const additional: ToolField = { key: "additional", label: "Additional agreed terms", kind: "textarea", hint: "Include only terms all parties have agreed to. These do not override mandatory law." };
  switch (slug) {
    case "rental-deed": return [language, date, ...partyFields("Landlord", "Tenant / company"), area("premises", "Office address and description"), text("purpose", "Permitted use", "For example: office for software services."), amount("rent", "Monthly rent (৳)"), amount("deposit", "Refundable deposit (৳)"), { ...amount("months", "Lease term (months)"), min: 1, max: 360, step: "1" }, text("dueDay", "Rent due date each month", "For example: by the 5th day."), area("utilities", "Utilities and maintenance responsibilities"), text("notice", "Agreed notice period", "Subject to applicable law."), additional];
    case "partnership-deed": return [language, date, text("business", "Partnership name"), area("office", "Principal business address"), ...partyFields("First partner", "Second partner"), area("activity", "Nature of business"), amount("capitalA", "First partner contribution (৳)"), amount("capitalB", "Second partner contribution (৳)"), { ...amount("shareA", "First partner profit / loss share (%)"), max: 100 }, area("responsibilities", "Management and responsibilities", "Specify authority, banking and decisions requiring both partners’ approval."), text("notice", "Retirement / exit notice"), additional];
    case "mou": return [date, ...partyFields("First party", "Second party"), text("project", "Project / collaboration"), area("purpose", "Shared purpose"), area("obligationsA", "First party responsibilities"), area("obligationsB", "Second party responsibilities"), area("commercial", "Budget and commercial understanding"), text("duration", "Duration and milestones"), { key: "intent", label: "Intended status", kind: "select", options: [{ value: "Non-binding discussion draft", label: "Non-binding discussion draft" }, { value: "Binding terms requested for legal review", label: "Binding terms — requires legal review" }], defaultValue: "Non-binding discussion draft" }, additional];
    case "moa-aoa": return [date, text("company", "Proposed company name"), area("office", "Registered office address in Bangladesh"), area("objects", "Primary business objects", "Describe the lawful activities the company will carry on."), amount("capital", "Authorised share capital (৳)"), { ...amount("shareValue", "Nominal value per share (৳)"), min: 1 }, area("subscribers", "Subscribers and proposed shares", "One person per line: name, address, occupation and number of shares."), area("directors", "First directors", "Names and agreed roles. Obtain their consent separately."), area("governance", "Governance instructions", "Board decisions, meetings, share transfers and banking authority."), additional];
    case "employment-agreement": return [date, ...partyFields("Employer", "Employee"), text("role", "Job title"), area("duties", "Role and responsibilities"), text("workplace", "Workplace / work arrangement"), amount("salary", "Gross monthly salary (৳)"), text("payday", "Salary payment schedule"), area("hours", "Working hours and weekly rest"), area("leave", "Leave and benefits", "Applicable statutory entitlements cannot be reduced by agreement."), text("probation", "Probation arrangement", "Enter ‘None’ if not applicable; subject to statutory limits."), text("notice", "Notice / termination arrangement", "Subject to statutory notice, process and benefits."), additional];
    case "trade-license-cancellation": return [date, text("authority", "Issuing authority"), text("department", "Revenue office / zone"), text("applicant", "Applicant’s full name"), text("business", "Business name"), text("licence", "Trade licence number"), area("address", "Licensed business address"), { key: "closureDate", label: "Business closure date", kind: "date", required: true }, area("reason", "Reason for cancellation"), text("phone", "Contact phone"), area("enclosures", "Documents to enclose", "List only documents you will attach when submitting to the authority."), additional];
    default: return [];
  }
}
export function createDocumentDraft(slug: ToolSlug, values: ToolValues): DocumentDraft {
  const bn = values.language === "bn";
  const v = (key: string) => values[key]?.trim() || `[${documentFields(slug).find((field) => field.key === key)?.label ?? key}]`;
  const sections: DocumentDraft["sections"] = [];
  const add = (heading: string, body: string) => sections.push({ heading, body });
  let title = "";
  let signatures = [v("partyA"), v("partyB"), bn ? "সাক্ষী ১: নাম, ঠিকানা ও স্বাক্ষর" : "Witness 1: name, address and signature", bn ? "সাক্ষী ২: নাম, ঠিকানা ও স্বাক্ষর" : "Witness 2: name, address and signature"];
  const parties = bn ? `${v("date")} তারিখে ${v("partyA")}, ঠিকানা: ${v("addressA")} এবং ${v("partyB")}, ঠিকানা: ${v("addressB")} এই খসড়ার শর্তাবলি পর্যালোচনার জন্য সম্মত হয়েছেন।` : `Dated ${v("date")}, between ${v("partyA")}, of ${v("addressA")}, and ${v("partyB")}, of ${v("addressB")}. The parties propose the following terms for review.`;
  if (slug === "rental-deed") {
    title = bn ? "অফিস ভাড়ার চুক্তির খসড়া" : "Office Rental Deed — Draft";
    add(bn ? "পক্ষসমূহ" : "Parties", parties);
    add(bn ? "ভাড়ার স্থান ও ব্যবহার" : "Premises and use", bn ? `ভাড়ার স্থান: ${v("premises")}। অনুমোদিত ব্যবহার: ${v("purpose")}। বাড়িওয়ালার লিখিত সম্মতি ছাড়া ব্যবহার পরিবর্তন বা সাবলেট করা যাবে না।` : `The premises are ${v("premises")}, for ${v("purpose")}. Changes of use or subletting require the landlord’s written consent.`);
    add(bn ? "মেয়াদ ও ভাড়া" : "Term and rent", bn ? `${v("date")} থেকে ${v("months")} মাস। মাসিক ভাড়া ৳ ${v("rent")}, পরিশোধের সময়: ${v("dueDay")}। নবায়ন উভয় পক্ষের লিখিত সম্মতিতে হবে।` : `The proposed term is ${v("months")} months from ${v("date")}. Monthly rent is BDT ${v("rent")}, payable ${v("dueDay")}. Renewal requires written agreement.`);
    add(bn ? "জামানত" : "Deposit", bn ? `ফেরতযোগ্য জামানত ৳ ${v("deposit")}। স্থান হস্তান্তরের পর প্রমাণিত বকেয়া ও সম্মত ক্ষতির খরচ সমন্বয় করে জামানত ফেরত দিতে হবে; স্বাভাবিক ব্যবহারজনিত ক্ষয় বাদ থাকবে।` : `The refundable deposit is BDT ${v("deposit")}. On handover, return it after settling documented arrears and agreed damage costs, excluding ordinary wear.`);
    add(bn ? "দায়িত্ব ও হস্তান্তর" : "Responsibilities and handover", `${v("utilities")}\n${bn ? "স্থান গ্রহণ ও ফেরতের সময় অবস্থা এবং চাবির লিখিত তালিকা রাখুন।" : "Record the condition, inventory and keys at both possession and handover."}`);
    add(bn ? "সমাপ্তি ও বিরোধ" : "Notice and disputes", bn ? `সম্মত নোটিশ: ${v("notice")}। প্রযোজ্য আইন প্রাধান্য পাবে। বিরোধ হলে প্রথমে আলোচনার মাধ্যমে সমাধানের চেষ্টা হবে; আইনানুগ প্রতিকার অক্ষুণ্ণ থাকবে।` : `Agreed notice: ${v("notice")}, subject to applicable law. Attempt a written, good-faith resolution of disputes without restricting lawful remedies.`);
  } else if (slug === "partnership-deed") {
    title = bn ? "অংশীদারি চুক্তির খসড়া" : "Partnership Deed — Draft";
    add(bn ? "পক্ষসমূহ" : "Partners", parties);
    add(bn ? "ব্যবসার পরিচয়" : "Business", `${v("business")}\n${v("office")}\n${v("activity")}`);
    add(bn ? "মূলধন ও অংশ" : "Capital and sharing", bn ? `${v("partyA")}: ৳ ${v("capitalA")}; ${v("partyB")}: ৳ ${v("capitalB")}। লাভ ও ক্ষতির অংশ যথাক্রমে ${v("shareA")}% এবং ${values.shareA ? 100 - Number(values.shareA) : "[অংশ]"}%।` : `${v("partyA")} contributes BDT ${v("capitalA")}; ${v("partyB")} contributes BDT ${v("capitalB")}. Profit and loss shares are ${v("shareA")}% and ${values.shareA ? 100 - Number(values.shareA) : "[share]"}% respectively.`);
    add(bn ? "পরিচালনা" : "Management", v("responsibilities"));
    add(bn ? "হিসাব ও পরিবর্তন" : "Records and changes", bn ? "সঠিক হিসাব সংরক্ষণ এবং উভয় অংশীদারের হিসাব দেখার অধিকার থাকবে। নতুন অংশীদার, মূলধন বা অংশ পরিবর্তন লিখিত সম্মতিতে হবে।" : "Maintain accurate books accessible to both partners. Admission of partners and changes to capital or sharing require written agreement.");
    add(bn ? "অবসর ও অবসায়ন" : "Exit and dissolution", bn ? `সম্মত নোটিশ: ${v("notice")}। অবসর বা অবসায়নে সম্পদ, দায় ও পাওনার লিখিত হিসাব করে আইনানুগ নিষ্পত্তি করতে হবে।` : `Agreed exit notice: ${v("notice")}. On retirement or dissolution, prepare accounts of assets, liabilities and partner balances, and settle them subject to applicable law.`);
  } else if (slug === "mou") {
    title = "Memorandum of Understanding — Draft"; add("Parties", parties); add("Collaboration", `${v("project")}\n${v("purpose")}`);
    add("First party responsibilities", v("obligationsA")); add("Second party responsibilities", v("obligationsB")); add("Commercial understanding", v("commercial")); add("Duration and milestones", v("duration"));
    add("Intended status", values.intent === "Non-binding discussion draft" ? "This records intentions for discussion, not a commitment to proceed or a concluded commercial contract. Any binding confidentiality, payment, intellectual property or exclusivity obligations require separately reviewed terms signed by the parties." : "The parties request legal review of the intended binding terms. This generated outline must not be treated as a final enforceable agreement until scope, remedies and execution requirements have been reviewed.");
    add("Information and changes", "Do not exchange confidential information until suitable safeguards are agreed. Confirm ownership of work, permitted use, termination and dispute handling in a definitive agreement. Record any agreed amendments in writing.");
  } else if (slug === "moa-aoa") {
    title = "Memorandum & Articles of Association — Working Draft";
    add("1. Name and registered office", `${v("company")}\nRegistered office: ${v("office")}\nPrepared on ${v("date")}. Name clearance remains subject to RJSC approval.`);
    add("2. Memorandum — objects", `${v("objects")}\nCarry on only lawful activities with any required licences and approvals.`);
    add("3. Liability and share capital", `Proposed company limited by shares. Member liability is proposed to be limited to unpaid amounts on their shares. Authorised capital: BDT ${v("capital")}, divided into ${values.capital && values.shareValue ? Number(values.capital) / Number(values.shareValue) : "[number]"} shares of BDT ${v("shareValue")} each.`);
    add("4. Subscribers", v("subscribers")); add("5. Articles — first directors", v("directors")); add("6. Governance instructions", v("governance"));
    add("7. Review before incorporation", "Prepare the full applicable articles, share-transfer provisions, meeting and voting rules, accounts, dividends and winding-up provisions with a qualified professional. Reconcile subscribers’ shares with capital. Obtain required consents, declarations, signatures and statutory forms. This outline is not an RJSC filing-ready instrument.");
    signatures = ["Each subscriber: name, number of shares and signature", "Witness: name, address, occupation and signature"];
  } else if (slug === "employment-agreement") {
    title = "Employment Agreement — Draft"; add("Parties and start date", parties); add("Role and workplace", `${v("role")}\n${v("workplace")}\n${v("duties")}`);
    add("Pay", `Gross monthly salary: BDT ${v("salary")}. Payment schedule: ${v("payday")}. Record lawful deductions and provide the applicable pay statement.`);
    add("Hours, rest and benefits", `${v("hours")}\n${v("leave")}\nMandatory statutory entitlements prevail over any less favourable draft term.`);
    add("Probation", v("probation")); add("Notice and separation", `${v("notice")}\nApply the lawful notice, process, final payments and benefits for the employee’s classification. This draft does not authorise dismissal contrary to applicable law.`);
    add("Confidentiality and workplace obligations", "Protect legitimately confidential information and use it only for work. This does not restrict lawful reporting or statutory rights. Agree separately on intellectual property, data handling and any role-specific obligations after review.");
  } else {
    title = "Application for Trade Licence Cancellation — Draft";
    add("To", `${v("authority")}\n${v("department")}\nDate: ${v("date")}`);
    add("Subject", `Request to cancel trade licence ${v("licence")} — ${v("business")}`);
    add("Application", `Dear Sir / Madam,\nI, ${v("applicant")}, request cancellation of the trade licence for ${v("business")}, located at ${v("address")}. The business closed on ${v("closureDate")}.\nReason: ${v("reason")}\nPlease advise on outstanding dues, documents and any inspection or surrender requirements. I request written confirmation once the cancellation is approved.`);
    add("Enclosures", v("enclosures")); add("Contact", `${v("applicant")}\n${v("phone")}`); signatures = [v("applicant")];
  }
  if (values.additional?.trim()) add(bn ? "অতিরিক্ত সম্মত শর্ত" : "Additional agreed terms", values.additional.trim());
  return { title, language: bn ? "bn" : "en", sections, signatures, warning: bn ? "পর্যালোচনার জন্য খসড়া। স্বাক্ষর বা দাখিলের আগে যোগ্য পেশাজীবীর মাধ্যমে প্রযোজ্য আইন, স্ট্যাম্প, নিবন্ধন ও সম্পাদনের শর্ত যাচাই করুন।" : "Draft for review. Have a qualified professional check applicable law, stamp duty, registration and execution requirements before signing or filing." };
}
export function documentText(draft: DocumentDraft) { return [draft.title, draft.warning, ...draft.sections.map((section) => `${section.heading}\n${section.body}`), ...draft.signatures.map((name) => `${name}\nSignature: __________________  Date: ________________`)].join("\n\n"); }
