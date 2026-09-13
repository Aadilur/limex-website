import "dotenv/config";

import { Prisma, PrismaClient } from "@prisma/client";

import {
  blogContentJson,
  estimateReadTime,
  isSafeBlogNavigationUrl,
  normalizeBlogSlug,
  sanitizeBlogHtml,
} from "../src/lib/blog-content.js";

const prisma = new PrismaClient();

const BLOG_IMPORT_ACTOR = "menu-blog-import-v1";
const BATCH_SIZE = 4;
const EXPECTED_MENU_LINKS = 52;

type Step = { title: string; text: string };
type Question = { question: string; answer: string };

type Topic = {
  title: string;
  subtitle: string;
  intro: string;
  what: string;
  why: string;
  steps: Step[];
  documents: string[];
  pitfalls: string[];
  faqs: Question[];
  keywords: string[];
};

type MenuLinkRecord = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  parent: string;
  groupKey: string;
  groupLabel: string;
  sectionKey: string;
  sectionLabel: string;
};

function topic(input: Topic): Topic {
  if (input.steps.length < 3 || input.documents.length < 3 || input.pitfalls.length < 2 || input.faqs.length < 2) {
    throw new Error(`Incomplete article profile: ${input.title}`);
  }
  return input;
}

function keyFor(parent: string, label: string) {
  return `${parent}::${label}`;
}

/**
 * These profiles are intentionally editorial rather than generated from a
 * single sentence. The importer uses the live MenuLink tree for scope and
 * URL ownership, while this map gives every menu destination useful,
 * service-specific search content.
 */
const topics: Record<string, Topic> = {
  [keyFor("Company Formation", "Limited Company Formation")]: topic({
    title: "Limited Company Formation in Bangladesh: a practical guide",
    subtitle: "Understand the key decisions, documents and RJSC steps involved in forming a private limited company in Bangladesh.",
    intro: "A limited company can give a growing business a separate legal identity, clearer ownership and a more structured path for future investment. The quality of the setup depends on making the ownership, address, constitutional documents and statutory registrations consistent from the beginning.",
    what: "Private limited company formation normally involves choosing and clearing a name, confirming shareholders and directors, preparing the constitutional documents, registering the entity with RJSC and completing the registrations needed for its activities. The exact forms, fees and portal steps can change, so treat this guide as a preparation checklist rather than a substitute for current authority instructions.",
    why: "Founders usually benefit when the company structure is chosen before signing contracts, opening a business account or investing heavily in a brand. It helps separate company decisions from personal decisions and creates a clearer record of who owns and manages the business.",
    steps: [
      { title: "Confirm the ownership plan", text: "Agree who will hold shares, how ownership will be divided and who will act as director before documents are drafted." },
      { title: "Prepare the company information", text: "Keep the proposed name, registered office, business activities, share capital and identity details consistent." },
      { title: "Complete the RJSC process", text: "Submit the relevant name clearance, incorporation information and constitutional documents through the current RJSC process." },
      { title: "Finish the next registrations", text: "After incorporation, review trade licensing, e-TIN, VAT/BIN, banking and any activity-specific approvals." },
    ],
    documents: ["Proposed company names and business activity", "Shareholder and director identity information", "Registered office evidence", "Memorandum and Articles of Association", "Ownership, capital and authorised-signatory details"],
    pitfalls: ["Using different spellings for the company name or address", "Choosing shareholding without considering future investors", "Assuming incorporation alone covers trade, tax and sector permissions"],
    faqs: [
      { question: "Is RJSC registration the same as a trade licence?", answer: "No. RJSC incorporation creates the company, while a trade licence is a local permission connected to operating a business at a particular address." },
      { question: "Can the shareholding be changed later?", answer: "Changes may be possible through the appropriate corporate records and filings, but it is better to agree the initial structure carefully before incorporation." },
      { question: "What should happen after incorporation?", answer: "Review the trade licence, e-TIN, VAT/BIN position, bank account, accounting process and any sector-specific approvals that apply." },
    ],
    keywords: ["limited company formation Bangladesh", "private limited company", "RJSC company registration", "company incorporation", "কোম্পানি রেজিস্ট্রেশন"],
  }),
  [keyFor("Company Formation", "One Person Company Formation")]: topic({
    title: "One Person Company Formation in Bangladesh: what to prepare",
    subtitle: "Learn how a one person company is planned, documented and prepared for registration in Bangladesh.",
    intro: "A one person company is designed for an entrepreneur who wants a formal corporate structure while keeping ownership concentrated. The most important work happens before filing: checking eligibility, deciding the business activity, preparing the registered office information and understanding the company’s ongoing obligations.",
    what: "The process typically requires a clear owner and nominee or successor arrangement where applicable, a proposed company name, registered office evidence, constitutional documents and the identity information requested by the current authority process. The available structure and requirements should be confirmed against the latest RJSC rules before submission.",
    why: "A formal structure may make contracts, banking and record-keeping easier to manage than operating entirely in an individual capacity. It also creates a more deliberate boundary between the owner and the company’s business records.",
    steps: [
      { title: "Check whether the structure fits", text: "Review the current one person company eligibility rules, ownership requirements and permitted activities." },
      { title: "Plan the company records", text: "Decide the name, registered office, business activity, capital and the people who must appear in the filing." },
      { title: "Prepare and submit the documents", text: "Keep identity, address and constitutional information aligned while completing the current RJSC process." },
      { title: "Set up the operating routine", text: "After registration, separate company records, review tax and licence requirements and maintain statutory filings." },
    ],
    documents: ["Owner identity and contact information", "Nominee or successor information where required", "Proposed name and business activity", "Registered office evidence", "Constitutional and capital information"],
    pitfalls: ["Treating a one person company like an informal sole business", "Leaving nominee or succession information until the last minute", "Forgetting that a company still has continuing compliance duties"],
    faqs: [
      { question: "Does one person company mean there are no company formalities?", answer: "No. The ownership may be concentrated, but the company still needs appropriate records, filings, tax and licensing review." },
      { question: "Can the business open a company bank account?", answer: "The bank will apply its own onboarding requirements, usually based on incorporation documents, trade licensing, tax information and authorised signatories." },
      { question: "Should I choose this structure for every small business?", answer: "Not necessarily. Compare the owner’s liability, cost, compliance capacity and growth plan with the available structures before deciding." },
    ],
    keywords: ["one person company Bangladesh", "OPC registration", "RJSC OPC formation", "single owner company", "এক ব্যক্তি কোম্পানি"],
  }),
  [keyFor("Company Formation", "Public Limited Company Formation")]: topic({
    title: "Public Limited Company Formation in Bangladesh: planning essentials",
    subtitle: "A practical overview of the ownership, governance and documentation questions behind a public limited company setup.",
    intro: "A public limited company is a more demanding structure than a closely held private company. It is usually considered where a business needs a broader ownership model, a formal governance framework or a future path involving public investment, subject to the applicable laws and approvals.",
    what: "Preparation normally covers the proposed name and activity, shareholders, directors, capital structure, registered office, constitutional documents and governance arrangements. Public company requirements can be more extensive and may involve additional approvals beyond the ordinary incorporation record.",
    why: "The structure can support a larger ownership base and more formal governance, but it also brings greater disclosure, record-keeping and compliance responsibility. A careful feasibility review is essential before committing to it.",
    steps: [
      { title: "Define the purpose of the structure", text: "Clarify whether the business actually needs public-company governance, broader ownership or a future capital-market route." },
      { title: "Build the ownership and governance plan", text: "Map shareholders, directors, capital, meetings, signatories and the controls needed for a larger company." },
      { title: "Prepare the incorporation package", text: "Coordinate the name, office, activity, constitutional documents and supporting records for the applicable authority process." },
      { title: "Plan continuing compliance", text: "Budget for annual returns, accounts, governance records, tax, licences and any additional regulatory reporting." },
    ],
    documents: ["Shareholder and director details", "Capital and ownership schedule", "Registered office evidence", "Memorandum and Articles of Association", "Governance and authorised-signatory plan"],
    pitfalls: ["Selecting a public structure without a realistic governance budget", "Using a capital plan that does not match the business model", "Underestimating continuing reporting and record obligations"],
    faqs: [
      { question: "Is a public limited company suitable for every growing business?", answer: "No. The right structure depends on ownership, capital needs, governance capacity and the business’s longer-term plan." },
      { question: "Are incorporation and public offering the same thing?", answer: "No. Incorporation is the creation of the legal entity; any public offering or capital-market activity can involve separate legal and regulatory requirements." },
      { question: "What should be reviewed before filing?", answer: "Review the latest Companies Act, RJSC process, governance requirements, capital rules and any sector-specific approvals with a qualified professional." },
    ],
    keywords: ["public limited company Bangladesh", "PLC formation", "RJSC public company", "company governance", "পাবলিক লিমিটেড কোম্পানি"],
  }),
  [keyFor("Company Formation", "Partnership Firm Registration")]: topic({
    title: "Partnership Firm Registration in Bangladesh: a clear starting guide",
    subtitle: "Prepare the partnership deed, ownership terms and registration information before starting a firm in Bangladesh.",
    intro: "A partnership works best when the partners agree the commercial relationship before the firm starts taking money, signing contracts or sharing liabilities. Registration is only one part of the work; the partnership deed and operating rules are equally important.",
    what: "A firm normally needs a partnership deed, partner identity and address information, business activity, principal place of business and the details required by the current registration process. The deed should explain contributions, profit and loss sharing, authority, exit, dispute handling and dissolution.",
    why: "Clear written terms reduce misunderstandings when a partner contributes more time, money or contacts than another. They also give the firm a reliable reference when opening accounts, engaging suppliers or changing the partnership.",
    steps: [
      { title: "Agree the commercial terms", text: "Set out contributions, profit and loss percentages, roles, drawings, decision-making and dispute handling." },
      { title: "Draft and review the deed", text: "Make the names, addresses, business activity and partnership duration consistent across the deed and forms." },
      { title: "Submit the registration information", text: "Complete the applicable registration process and keep acknowledgements and filed copies with the firm records." },
      { title: "Organise ongoing records", text: "Separate firm money, maintain accounts and review tax, trade licence and renewal obligations." },
    ],
    documents: ["Signed partnership deed", "Partner NID or passport details", "Business address evidence", "Firm name and activity details", "Contribution and profit-sharing schedule"],
    pitfalls: ["Using equal shares without discussing actual contributions", "Leaving exit, death or dispute terms unclear", "Mixing partnership funds with a partner’s personal spending"],
    faqs: [
      { question: "Does a partnership need a written deed?", answer: "A clear written deed is strongly recommended because it records the terms the partners intend to follow and helps avoid disputes." },
      { question: "Can partners have different profit percentages?", answer: "Yes, partners can agree commercial terms, but the percentages and responsibilities should be documented consistently." },
      { question: "What happens after registration?", answer: "Maintain accounts, renew local permissions, review tax obligations and update the firm record when partner details change." },
    ],
    keywords: ["partnership firm registration Bangladesh", "partnership deed", "RJSC partnership", "business partners", "পার্টনারশিপ ফার্ম"],
  }),
  [keyFor("Company Formation", "Foreign Company Registration")]: topic({
    title: "Foreign Company Registration in Bangladesh: what to plan first",
    subtitle: "Understand the main documents, local presence and approval questions for registering a foreign company in Bangladesh.",
    intro: "A foreign company entering Bangladesh needs a local compliance plan that connects its overseas records with its proposed local activity. The right route can depend on whether it is opening a branch, liaison office, project office or another permitted presence.",
    what: "Preparation commonly includes certified corporate documents, parent-company authority, local office information, proposed activities, authorised representatives and evidence of the approvals required for the chosen route. The applicable authority and documentation can differ by activity and investment structure.",
    why: "A well-planned entry avoids a common problem: securing one approval while overlooking banking, tax, employment, trade or sector requirements that must follow. The local operating model should be clear before documents are translated and certified.",
    steps: [
      { title: "Choose the local presence", text: "Define whether the business needs a branch, liaison office, project office or another permitted route." },
      { title: "Map approvals and restrictions", text: "Review BIDA, tax, banking, trade, employment and sector requirements for the proposed activities." },
      { title: "Prepare certified records", text: "Collect parent-company certificates, board authority, local office evidence and authorised-person information." },
      { title: "Set up local compliance", text: "After approval, organise banking, tax registrations, reporting, renewals and records for the local operation." },
    ],
    documents: ["Parent-company incorporation certificate", "Board resolution or power of authority", "Certified constitutional documents", "Local office and representative details", "Proposed activity and funding plan"],
    pitfalls: ["Describing activities too broadly for the proposed approval", "Submitting inconsistent translated or certified documents", "Treating approval as permission for every local activity"],
    faqs: [
      { question: "Does every foreign business need the same registration route?", answer: "No. The route depends on the intended activity, presence, funding and the current approval framework." },
      { question: "Do overseas documents need certification or translation?", answer: "Often they do, depending on the authority and document. Confirm the current format before arranging certification." },
      { question: "What should be planned after approval?", answer: "Plan banking, tax, trade licensing, employment, reporting and renewal responsibilities before operations begin." },
    ],
    keywords: ["foreign company registration Bangladesh", "branch office Bangladesh", "BIDA registration", "liaison office", "বিদেশি কোম্পানি নিবন্ধন"],
  }),
  [keyFor("Company Formation", "Joint venture Company Registration")]: topic({
    title: "Joint Venture Company Registration in Bangladesh: a practical roadmap",
    subtitle: "Align local and foreign partners on ownership, governance and registration before forming a joint venture in Bangladesh.",
    intro: "A joint venture combines the resources, relationships or expertise of two or more parties. Its success depends on documenting the relationship before incorporation, especially where partners contribute different capital, technology, land, permissions or management time.",
    what: "The setup may involve a joint venture agreement, ownership and capital schedule, board and management arrangements, registered office, constitutional documents and sector or investment approvals. The final route depends on the parties and the activities they intend to carry out.",
    why: "A clear agreement prevents the company documents from carrying more commercial meaning than they can safely explain. Partners should decide how decisions are made, what happens when plans change and how a partner can exit.",
    steps: [
      { title: "Define each party’s contribution", text: "Record cash, assets, technology, market access, staffing and the timing of every contribution." },
      { title: "Agree ownership and control", text: "Set shareholding, board seats, reserved matters, signatories and day-to-day management responsibilities." },
      { title: "Prepare the incorporation package", text: "Coordinate the joint venture agreement, company documents, office evidence and approval records." },
      { title: "Build an exit and compliance plan", text: "Document transfer, deadlock, exit and dispute procedures alongside tax, licence and annual filing duties." },
    ],
    documents: ["Joint venture or shareholders’ agreement", "Partner corporate and identity documents", "Capital and contribution schedule", "Registered office evidence", "Board, management and reserved-matter plan"],
    pitfalls: ["Agreeing percentages without defining decision rights", "Ignoring deadlock, transfer and exit provisions", "Assuming a foreign partner’s approval covers the company’s local permissions"],
    faqs: [
      { question: "Should the joint venture agreement be separate from the Articles?", answer: "They serve different purposes. The agreement can record broader commercial arrangements, while the constitutional documents govern the company within the applicable law." },
      { question: "Can partners contribute something other than cash?", answer: "They may be able to contribute assets, technology or services subject to proper valuation, documentation and applicable rules." },
      { question: "What is the biggest early decision?", answer: "Agree who controls which decisions and what happens if the parties cannot agree before the company starts operating." },
    ],
    keywords: ["joint venture company Bangladesh", "JV registration", "shareholders agreement", "foreign local joint venture", "যৌথ উদ্যোগ কোম্পানি"],
  }),
  [keyFor("Company Formation", "Society/Foundation/Trust/Club Registration")]: topic({
    title: "Society, Foundation, Trust or Club Registration in Bangladesh",
    subtitle: "Compare the planning, governing documents and registration questions for purpose-led organisations in Bangladesh.",
    intro: "Purpose-led organisations need a structure that matches how they will receive funds, make decisions, hold property and serve their members or beneficiaries. A society, foundation, trust or club should not be selected only because its name sounds familiar.",
    what: "The registration route depends on the organisation’s purpose, membership model, trustees or governing body, assets and planned activities. Founding documents should explain the purpose, governance, finance controls, membership or beneficiary rules and what happens if the organisation closes.",
    why: "A clear governing framework gives donors, members, beneficiaries and authorities a consistent picture of the organisation. It also reduces confusion over who can sign, spend, appoint officers or amend the purpose.",
    steps: [
      { title: "Define the purpose and beneficiaries", text: "Write a specific purpose and identify the people, communities or members the organisation will serve." },
      { title: "Choose the suitable structure", text: "Compare membership, trusteeship, asset holding, reporting and activity requirements before selecting the route." },
      { title: "Draft governing documents", text: "Set out officers, meetings, funds, signatories, admission, removal, amendment and dissolution rules." },
      { title: "Register and organise controls", text: "Complete the applicable registration and establish accounts, minutes, records and renewal responsibilities." },
    ],
    documents: ["Founding resolution and governing document", "Founder, trustee or member identity details", "Registered office evidence", "Purpose and activity statement", "Asset, fund and signatory information"],
    pitfalls: ["Using a purpose that is too vague to guide operations", "Leaving fund controls and officer powers undefined", "Starting activities that need a separate approval"],
    faqs: [
      { question: "Is a foundation always a company?", answer: "Not necessarily. The appropriate form depends on purpose, governance, assets and the applicable registration law." },
      { question: "Who should approve the governing document?", answer: "The founders or governing body should approve it, while the registering authority may require a prescribed format or supporting resolution." },
      { question: "Can the organisation later change its purpose?", answer: "Changes may require an amendment process and, in some cases, authority approval. Plan this in the governing document." },
    ],
    keywords: ["society registration Bangladesh", "foundation registration", "trust registration", "club registration", "ফাউন্ডেশন রেজিস্ট্রেশন"],
  }),
  [keyFor("Company Formation", "Forging Company Formation")]: topic({
    title: "Forging Company Formation in Bangladesh: compliance planning",
    subtitle: "A preparation guide for a forging or metal-processing business covering structure, premises, safety and approvals.",
    intro: "A forging business combines ordinary company formation with industrial, premises, worker-safety and environmental considerations. The legal structure is only the first step; the proposed plant, machinery, power use and product category influence the permissions that follow.",
    what: "Preparation should cover the entity or firm structure, business activity description, registered and operating address, ownership, machinery plan and the approvals relevant to the site. Depending on the operation, trade licensing, fire safety, environmental clearance, factory compliance and standards permissions may be relevant.",
    why: "Describing the activity accurately at the beginning helps the business avoid a mismatch between its registration, premises and actual production. It also gives lenders, suppliers and inspectors a clearer record of what the business intends to do.",
    steps: [
      { title: "Describe the industrial activity", text: "List the products, process, machinery, power needs and location rather than using a vague manufacturing description." },
      { title: "Form the business structure", text: "Choose the company or firm structure and prepare ownership, office and constitutional information." },
      { title: "Review site approvals", text: "Check trade, fire, factory, environmental, utility and standards requirements before fitting out the premises." },
      { title: "Create the operating file", text: "Keep licences, inspections, maintenance, worker-safety and renewal records in one controlled system." },
    ],
    documents: ["Entity formation records", "Premises ownership or lease evidence", "Process and machinery description", "Fire and environmental information", "Owner, manager and authorised-person details"],
    pitfalls: ["Registering a generic activity that does not describe the plant", "Moving into production before site approvals are checked", "Treating machinery safety and environmental records as optional"],
    faqs: [
      { question: "Is company formation enough to start a forging plant?", answer: "No. Industrial operations can require local, fire, factory, environmental and standards permissions in addition to entity formation." },
      { question: "Should the operating address be decided early?", answer: "Yes. The premises often determine local licensing, fire, environmental and utility requirements." },
      { question: "What should be kept after approval?", answer: "Maintain licences, inspection reports, equipment records, safety procedures, tax records and renewal dates." },
    ],
    keywords: ["forging company Bangladesh", "metal manufacturing registration", "factory licence Bangladesh", "industrial compliance", "ফোর্জিং কোম্পানি"],
  }),
  [keyFor("Trade License", "New Trade License")]: topic({
    title: "How to get a New Trade License in Bangladesh",
    subtitle: "Prepare the address, identity and business documents needed for a new trade licence application in Bangladesh.",
    intro: "A trade licence is a local permission connected to carrying on business at a particular place. The application is easier when the business name, activity, address and applicant information are already consistent across the supporting documents.",
    what: "The relevant city corporation, municipality or local authority usually assesses the business activity and premises. Required documents vary by location and activity, and factories, food businesses, importers or other regulated operations may need additional approvals.",
    why: "Operating with a clear local licence helps a business open accounts, work with vendors and demonstrate that its operating address has been reviewed by the relevant authority.",
    steps: [
      { title: "Confirm the local authority", text: "Identify the city corporation, municipality or other authority responsible for the business address." },
      { title: "Prepare the business details", text: "Use the same legal name, activity, address and applicant information on the application and documents." },
      { title: "Submit and respond to review", text: "Provide the requested documents, follow any inspection or assessment step and keep the application record." },
      { title: "Track renewal and changes", text: "Record the validity period and update the licence when the address, owner or business activity changes." },
    ],
    documents: ["Applicant NID or passport", "Business address or rental evidence", "Company or firm papers where applicable", "Recent photograph or supporting form where required", "Sector approval where the activity needs one"],
    pitfalls: ["Applying to the wrong local authority", "Using an address that cannot be supported", "Assuming the trade licence covers a regulated activity approval"],
    faqs: [
      { question: "Is a trade licence national?", answer: "It is generally linked to the local authority and business address, so requirements can differ by location." },
      { question: "Can a company use its incorporation certificate as a trade licence?", answer: "No. Incorporation and local trade licensing are separate permissions." },
      { question: "What if the business has more than one location?", answer: "Review the local licensing position for each operating address and keep the records separate." },
    ],
    keywords: ["new trade license Bangladesh", "trade licence application", "city corporation trade license", "business licence", "ট্রেড লাইসেন্স"],
  }),
  [keyFor("Trade License", "Renewal")]: topic({
    title: "Trade License Renewal in Bangladesh: a simple compliance checklist",
    subtitle: "Keep a trade licence current by checking the authority, address, business activity and renewal records before expiry.",
    intro: "Trade licence renewal is easier when it is treated as a recurring business control rather than a last-minute formality. Before renewal, confirm that the business details and operating address still match the authority’s records.",
    what: "The renewing authority may request the current licence, payment evidence, identity or entity papers, address information and other documents based on the business. Fees, timing and online or in-person steps can vary by authority.",
    why: "A current licence supports routine banking, vendor onboarding, inspections and business records. An expired licence can create avoidable questions when the business is applying for another permission or contract.",
    steps: [
      { title: "Check the expiry date", text: "Keep a renewal calendar with reminders before the licence expires and note any late-renewal consequences." },
      { title: "Review the licence details", text: "Confirm the business name, owner, activity and address have not changed since the last issue." },
      { title: "Prepare the renewal file", text: "Collect the licence, receipts, identity, entity and address papers requested by the local authority." },
      { title: "Store the updated record", text: "Save the renewed licence, payment proof and next expiry date where the finance and operations teams can find them." },
    ],
    documents: ["Previous trade licence", "Renewal or payment evidence", "Applicant identity or company papers", "Current address evidence", "Updated activity or sector permission where applicable"],
    pitfalls: ["Waiting until after expiry without checking the late process", "Renewing a licence whose activity or address is outdated", "Losing payment proof or the next renewal date"],
    faqs: [
      { question: "Can a trade licence be renewed after expiry?", answer: "The authority may have a late-renewal process or surcharge. Confirm the current rule instead of assuming the old licence remains valid." },
      { question: "Do I need a new licence when the address changes?", answer: "A new application, correction or transfer may be required depending on the authority and nature of the change." },
      { question: "Who should track renewal?", answer: "Assign one owner in the business and keep the date in both the operations and finance calendars." },
    ],
    keywords: ["trade license renewal Bangladesh", "trade licence renew", "business licence renewal", "city corporation renewal", "ট্রেড লাইসেন্স নবায়ন"],
  }),
  [keyFor("Trade License", "Corrections")]: topic({
    title: "Trade License Correction in Bangladesh: fix records cleanly",
    subtitle: "Learn how to prepare a correction request when a trade licence contains a wrong name, address, owner or business detail.",
    intro: "A small mismatch on a trade licence can cause bigger friction when the business opens a bank account, renews another registration or responds to an inspection. Corrections should be approached as a record-matching exercise.",
    what: "The correction process depends on the local authority and the field that needs to change. The authority may compare the current licence with identity, entity, address, lease or supporting permission documents before issuing an updated record.",
    why: "Keeping the licence aligned with the underlying business records creates a clearer compliance trail and reduces repeated explanations to banks, vendors and government offices.",
    steps: [
      { title: "Identify the exact error", text: "Write down the current value, the correct value and every record that supports the requested correction." },
      { title: "Check whether it is a correction or change", text: "A spelling error may be corrected, while a new owner, address or activity may need a different application route." },
      { title: "Submit supporting evidence", text: "Provide the current licence and the identity, entity, address or permission records requested by the authority." },
      { title: "Replace the old copies", text: "Update the business’s scanned records, bank files, renewal calendar and displayed licence after approval." },
    ],
    documents: ["Current trade licence", "Applicant identity", "Company, firm or ownership record", "Correct address or tenancy evidence", "Activity or sector approval where relevant"],
    pitfalls: ["Calling a material business change a simple spelling correction", "Submitting a correct value without evidence", "Keeping old copies in circulation after the correction"],
    faqs: [
      { question: "Can every mistake be corrected online?", answer: "Availability depends on the local authority and the type of field. Check the current channel and required documents." },
      { question: "What if the business activity changed?", answer: "The authority may require an amendment, fresh assessment or new licence rather than a simple correction." },
      { question: "Should the bank be told after correction?", answer: "Yes, update any bank, vendor or licence file that relies on the corrected name, address or ownership detail." },
    ],
    keywords: ["trade license correction Bangladesh", "trade licence change", "business licence amendment", "licence record correction", "ট্রেড লাইসেন্স সংশোধন"],
  }),
  [keyFor("Trade License", "Trade License Cancel")]: topic({
    title: "Trade License Cancellation in Bangladesh: what to close properly",
    subtitle: "Use a clear record-closing process when a business stops operating or no longer needs a local trade licence.",
    intro: "Closing a trade licence is more than stopping renewal. The business should confirm that it has ceased or changed the relevant activity, settle local obligations and keep evidence of the cancellation request and outcome.",
    what: "The local authority’s cancellation or surrender process can require the current licence, applicant identity, closure explanation, payment records and evidence connected to the business address. Other registrations, tax accounts and contracts may need separate closure steps.",
    why: "A proper closure record helps prevent future renewal notices, confusion about who operates from the premises and mismatches between local, tax and corporate records.",
    steps: [
      { title: "Confirm the closure decision", text: "Record the last operating date, the reason for closure and whether another owner or activity will use the premises." },
      { title: "Review connected obligations", text: "Check tax, VAT, company, employee, lease, utility and sector permissions before surrendering the local licence." },
      { title: "Submit the cancellation request", text: "Provide the licence and supporting records through the current local authority process." },
      { title: "Keep the closure file", text: "Save the cancellation acknowledgement, final payment evidence and internal approval with the business records." },
    ],
    documents: ["Current trade licence", "Owner or authorised representative identity", "Closure or surrender request", "Payment or tax clearance evidence where required", "Board or partnership resolution where applicable"],
    pitfalls: ["Cancelling locally without reviewing tax or company obligations", "Giving up a licence while a new operator still uses the address", "Failing to keep proof of cancellation"],
    faqs: [
      { question: "Does cancellation close a limited company?", answer: "No. Trade licence cancellation and company winding-up or dissolution are separate processes." },
      { question: "Can the same address be used by another business?", answer: "Possibly, but the new operator should obtain its own appropriate licence and supporting address records." },
      { question: "Should the licence simply be allowed to expire?", answer: "Ask the authority about the correct surrender or cancellation route, especially where the business has stopped operating." },
    ],
    keywords: ["trade license cancellation Bangladesh", "surrender trade licence", "close business licence", "business closure", "ট্রেড লাইসেন্স বাতিল"],
  }),
  [keyFor("VAT / BIN Registration", "BIN Correction & Recovery")]: topic({
    title: "BIN Correction and Recovery in Bangladesh: a practical guide",
    subtitle: "Prepare the business records needed to correct or recover a BIN and keep VAT information consistent.",
    intro: "A Business Identification Number is useful only when the registration record matches the taxpayer’s legal name, address, activity and contact information. When a certificate is lost or contains an error, the response should start with a careful record review.",
    what: "A correction or recovery request may involve the VAT registration record, business identity, tax information, address proof, authorised person and evidence of the earlier registration. The National Board of Revenue’s current portal and office requirements should be checked before submission.",
    why: "An accurate BIN record reduces friction with invoices, returns, customers, banks and tax officers. It also helps prevent a new registration being created when the business already has an existing record.",
    steps: [
      { title: "Confirm the existing record", text: "Search the available VAT record and identify whether the issue is a lost certificate, wrong field or inactive access." },
      { title: "Match the core information", text: "Compare the BIN record with the legal name, address, e-TIN, trade licence and authorised-person documents." },
      { title: "Submit the correction or recovery", text: "Use the current NBR route and attach evidence that explains the requested change or recovery." },
      { title: "Update the filing workflow", text: "Replace old copies, update invoice and return records and keep the new access or certificate details securely." },
    ],
    documents: ["Existing BIN or registration details", "Trade licence or incorporation record", "e-TIN and identity information", "Current business address evidence", "Authorisation for the person making the request"],
    pitfalls: ["Applying for a second BIN before checking the existing record", "Using a business name that differs from the incorporation or trade licence", "Treating correction as a replacement for monthly VAT compliance"],
    faqs: [
      { question: "What if the BIN certificate is lost?", answer: "Use the current recovery or account-access route and keep identity and entity records ready for verification." },
      { question: "Can the address be corrected?", answer: "The authority may require a correction, update or new assessment depending on the nature of the address change." },
      { question: "Does a corrected BIN remove past filing duties?", answer: "No. Correction and filing obligations are separate; review any missed or pending returns with a professional." },
    ],
    keywords: ["BIN correction Bangladesh", "BIN recovery", "VAT registration correction", "NBR BIN", "বিন সংশোধন"],
  }),
  [keyFor("TIN / TAX Registration", "New Individual E-TIN Registration")]: topic({
    title: "New Individual e-TIN Registration in Bangladesh",
    subtitle: "Understand the information an individual should prepare before applying for an e-TIN in Bangladesh.",
    intro: "An individual e-TIN application is mostly a data-accuracy exercise. The applicant’s name, national identity information, date of birth, address and contact details should be checked before the application is submitted.",
    what: "The e-TIN process uses the taxpayer’s identity and contact information to create a tax record. Requirements can differ based on the applicant’s citizenship, profession, income source and current NBR process, so use the latest official instructions.",
    why: "A correct tax identity record makes future returns, withholding certificates, banking and property or business transactions easier to reconcile.",
    steps: [
      { title: "Check identity details", text: "Use the correct NID or passport information and make sure the spelling and date of birth match the source record." },
      { title: "Prepare address and contact data", text: "Keep present and permanent address, phone and email information ready in the requested format." },
      { title: "Submit through the current channel", text: "Complete the NBR application and review every field before generating or downloading the certificate." },
      { title: "Store and use the certificate consistently", text: "Keep the e-TIN with tax records and use the same taxpayer details in relevant forms and returns." },
    ],
    documents: ["NID or passport", "Current and permanent address information", "Active phone number and email", "Income or profession information where requested", "Authorised representative details if someone assists"],
    pitfalls: ["Using a nickname or different spelling from the NID", "Creating duplicate records because an older TIN was not checked", "Saving the certificate without a plan for later returns"],
    faqs: [
      { question: "Is e-TIN the same as a tax return?", answer: "No. e-TIN creates the taxpayer record; filing an income tax return is a separate compliance step." },
      { question: "Can an individual correct an e-TIN later?", answer: "The NBR provides update or correction routes, subject to the current process and supporting evidence." },
      { question: "Should the e-TIN be shared with every business?", answer: "Share it only where a lawful transaction or filing requires it and keep a record of where it has been provided." },
    ],
    keywords: ["individual e-TIN Bangladesh", "new TIN registration", "NBR e-TIN", "personal tax identification", "ই-টিন রেজিস্ট্রেশন"],
  }),
  [keyFor("TIN / TAX Registration", "Limited Company E-TIN Registration")]: topic({
    title: "Limited Company e-TIN Registration in Bangladesh",
    subtitle: "Prepare the company, director and registered-office information needed for a corporate e-TIN application.",
    intro: "A company’s tax identity should match its incorporation, trade licence and bank records. Before applying, the directors or authorised person should reconcile the company name, address, activity and contact details.",
    what: "Corporate e-TIN registration can require incorporation information, registered office details, director or authorised-person identity, business activity and contact information. The NBR’s current application requirements should be treated as the source of truth.",
    why: "A clean company tax record supports return filing, withholding, bank onboarding, tender participation and communication with the tax authority.",
    steps: [
      { title: "Reconcile the company profile", text: "Compare the certificate of incorporation, trade licence, registered office and company name before entering the application." },
      { title: "Collect responsible-person details", text: "Prepare director, authorised representative and contact information in the format requested." },
      { title: "Complete the corporate application", text: "Submit the company’s activity, address and identity information through the current NBR process." },
      { title: "Build the filing calendar", text: "Store the e-TIN securely and connect it to tax return, withholding and accounting responsibilities." },
    ],
    documents: ["Certificate of Incorporation", "Memorandum and Articles", "Trade licence", "Director or authorised-person NID", "Registered office and contact information"],
    pitfalls: ["Using an old company address or name variation", "Leaving the authorised-person role unclear", "Assuming e-TIN completes the company’s annual tax duties"],
    faqs: [
      { question: "Does a company need an individual TIN as well?", answer: "Directors and employees may have their own tax identities; the company’s e-TIN is a separate corporate record." },
      { question: "What if the incorporation record has an error?", answer: "Resolve the underlying corporate record first or prepare the evidence required to explain the mismatch to the tax authority." },
      { question: "Where should the certificate be used?", answer: "Use the company e-TIN in the company’s tax, withholding, banking and procurement records where required." },
    ],
    keywords: ["company e-TIN Bangladesh", "corporate TIN registration", "NBR company TIN", "limited company tax", "কোম্পানি ই-টিন"],
  }),
  [keyFor("TIN / TAX Registration", "Partnership E-TIN Registration")]: topic({
    title: "Partnership e-TIN Registration in Bangladesh",
    subtitle: "Align the partnership deed, firm registration and partner information before applying for a partnership e-TIN.",
    intro: "A partnership tax record should tell the same story as its deed and registration certificate. The firm name, principal place of business, business activity and partner details should be reviewed together before the application.",
    what: "The e-TIN application can require the firm’s registration information, deed, address, partners, authorised person and business activity. Exact requirements and portal steps can change, so confirm the latest NBR instructions.",
    why: "A consistent firm tax record makes return filing, withholding, bank onboarding and partner reporting easier to manage.",
    steps: [
      { title: "Review the partnership record", text: "Confirm the registered firm name, deed, address, partner list and profit-sharing details are current." },
      { title: "Choose the authorised applicant", text: "Record who can submit and receive tax communications on behalf of the firm." },
      { title: "Complete the e-TIN application", text: "Enter the firm’s activity, address and partner information consistently with the supporting documents." },
      { title: "Connect it to compliance", text: "Store the firm certificate and plan returns, withholding, accounts and partner-level tax responsibilities." },
    ],
    documents: ["Partnership deed", "Firm registration record where applicable", "Partner identity details", "Business address evidence", "Authorisation for the firm representative"],
    pitfalls: ["Using a partner’s personal TIN in place of the firm record", "Leaving a retired or new partner out of the profile", "Failing to coordinate firm and partner tax records"],
    faqs: [
      { question: "Is a partnership TIN different from a partner’s TIN?", answer: "Yes. The firm and each individual partner can have separate tax identities and responsibilities." },
      { question: "What if partners changed after registration?", answer: "Update the firm records and prepare the evidence needed to keep the tax profile current." },
      { question: "Can one partner apply for the firm?", answer: "An authorised partner or representative may apply, subject to the current NBR process and evidence." },
    ],
    keywords: ["partnership e-TIN Bangladesh", "firm TIN registration", "partnership tax record", "NBR firm TIN", "পার্টনারশিপ ই-টিন"],
  }),
  [keyFor("TIN / TAX Registration", "E-TIN Correction")]: topic({
    title: "e-TIN Correction in Bangladesh: keep the tax record accurate",
    subtitle: "Identify the supporting records needed to correct a name, address, identity or contact detail in an e-TIN profile.",
    intro: "Tax records are used across returns, withholding, banking and official correspondence, so an e-TIN error should be corrected as soon as it is found. Start by identifying whether the issue is a typo, a genuine change or a duplicate record.",
    what: "The correction route depends on the field and taxpayer type. The authority may compare the e-TIN profile with NID, passport, incorporation, trade licence, address or other source documents.",
    why: "Correcting the source tax identity prevents the same mismatch from appearing in later returns, certificates and business registrations.",
    steps: [
      { title: "Compare the records", text: "Place the e-TIN certificate beside the identity, entity and address documents and highlight the exact mismatch." },
      { title: "Classify the request", text: "Separate a spelling correction from a change of address, ownership, legal structure or taxpayer status." },
      { title: "Submit evidence", text: "Use the current NBR correction route and attach the document that proves the requested value." },
      { title: "Replace downstream copies", text: "Update return templates, invoice records, bank files and other systems after the correction is accepted." },
    ],
    documents: ["Current e-TIN certificate", "NID or passport", "Entity and trade records where applicable", "Address or contact evidence", "Authorisation for a representative"],
    pitfalls: ["Correcting the certificate without fixing the underlying identity record", "Opening a new TIN for a simple spelling error", "Continuing to use the old certificate after approval"],
    faqs: [
      { question: "Can an e-TIN name be corrected?", answer: "A correction may be available where the source identity record supports the correct name; follow the current NBR process." },
      { question: "What if the taxpayer moved?", answer: "An address update may require additional evidence and can be different from a typographical correction." },
      { question: "Will correction change past returns automatically?", answer: "No. Review past filings and certificates separately if the correction affects them." },
    ],
    keywords: ["e-TIN correction Bangladesh", "TIN update", "tax identity correction", "NBR TIN change", "ই-টিন সংশোধন"],
  }),
  [keyFor("TIN / TAX Registration", "E-TIN Cancel")]: topic({
    title: "e-TIN Cancellation in Bangladesh: when and how to review it",
    subtitle: "Understand the records and tax checks to consider before requesting e-TIN cancellation in Bangladesh.",
    intro: "An e-TIN should not be cancelled simply because there is no current income. The taxpayer should first understand whether a return, withholding, business, property or other statutory obligation still exists.",
    what: "Cancellation or deactivation depends on the taxpayer’s circumstances and the current NBR process. The authority may require an explanation, supporting records, outstanding return review or evidence that the tax identity is no longer needed.",
    why: "A documented decision avoids duplicate TINs, missed filings and confusion if the taxpayer later starts a business, receives taxable income or needs a certificate.",
    steps: [
      { title: "Review the reason", text: "Record why the TIN is no longer required and check whether the taxpayer still has any active income or statutory relationship." },
      { title: "Check pending obligations", text: "Review returns, withholding, notices, business registrations and any tax balance before requesting cancellation." },
      { title: "Use the current cancellation route", text: "Submit the request and supporting explanation through the channel specified by NBR." },
      { title: "Keep the decision record", text: "Store the acknowledgement or approval and do not create a second TIN if circumstances change later." },
    ],
    documents: ["e-TIN certificate", "Taxpayer identity document", "Explanation or closure evidence", "Return and payment records", "Business closure or deregistration papers where relevant"],
    pitfalls: ["Cancelling while a return or notice remains unresolved", "Using cancellation to avoid an existing tax obligation", "Creating another TIN after a change in circumstances"],
    faqs: [
      { question: "Can a TIN be cancelled just because income is low?", answer: "Low income alone may not remove filing or record obligations. Check the current tax position first." },
      { question: "What if a closed company had an e-TIN?", answer: "Review company closure, tax filings and any clearance requirements before seeking a change to the tax record." },
      { question: "Can a cancelled TIN be restored?", answer: "The available route depends on the current NBR system. Keep the old record and seek the correct reactivation guidance." },
    ],
    keywords: ["e-TIN cancellation Bangladesh", "cancel TIN", "tax identity closure", "NBR TIN deactivate", "ই-টিন বাতিল"],
  }),
  [keyFor("Association Membership", "DHAKA Chamber of Commerce")]: topic({
    title: "Dhaka Chamber of Commerce Membership: preparation guide",
    subtitle: "Prepare the business records and membership information commonly needed for Dhaka Chamber onboarding.",
    intro: "Chamber membership can help a business build credibility, access a business network and obtain relevant support or certificates. The application is strongest when the business identity and authorised-person details are already organised.",
    what: "Membership requirements can include a valid trade licence, entity or firm documents, tax information, address evidence, photographs, authorised signatory details and a membership fee. The Chamber’s current membership form is the final authority.",
    why: "A membership record can support networking, business introductions and certain documentation needs, but it should be treated as a business relationship rather than a substitute for statutory licences.",
    steps: [
      { title: "Confirm the membership category", text: "Check the Chamber’s current categories, eligibility and what services or certificates each category provides." },
      { title: "Prepare the business profile", text: "Align the trade licence, incorporation or firm record, TIN, address and authorised person information." },
      { title: "Submit the application", text: "Complete the form, provide current records and follow any verification or payment step." },
      { title: "Keep membership current", text: "Track renewal, update changes in ownership or address and record the benefits the business actually uses." },
    ],
    documents: ["Current trade licence", "Incorporation or firm registration record", "e-TIN or tax information", "Business address evidence", "Authorised representative photograph and identity"],
    pitfalls: ["Applying with an expired trade licence", "Assuming membership replaces a government permission", "Failing to update the Chamber after a material business change"],
    faqs: [
      { question: "Is Chamber membership mandatory for every business?", answer: "Usually membership is optional, but confirm whether a particular tender, certificate or industry requirement asks for it." },
      { question: "Can a sole proprietor apply?", answer: "Eligibility depends on the Chamber’s current categories and documents." },
      { question: "What should be renewed?", answer: "Track the membership validity and any supporting trade licence or tax records separately." },
    ],
    keywords: ["Dhaka Chamber membership", "DCCI membership Bangladesh", "business chamber registration", "trade membership", "ঢাকা চেম্বার সদস্যপদ"],
  }),
  [keyFor("Association Membership", "REHAB MEMBERSHIP")]: topic({
    title: "REHAB Membership in Bangladesh: what real-estate businesses prepare",
    subtitle: "A practical checklist for real-estate businesses preparing a REHAB membership application and supporting file.",
    intro: "A real-estate business applying for membership should present a consistent profile across its trade licence, entity records, projects, authorised persons and tax documents. Membership is also an opportunity to organise the company’s professional and project records.",
    what: "The Real Estate and Housing Association of Bangladesh may require a membership form, business registration, trade licence, tax records, office evidence, project or developer information and prescribed fees. Requirements can change, so confirm the current REHAB checklist.",
    why: "Industry membership can improve access to peers, events and sector communication, but it does not replace project approvals, land records, building permissions or consumer-protection duties.",
    steps: [
      { title: "Check category and eligibility", text: "Review the current REHAB membership type and whether the business’s activity and project profile qualify." },
      { title: "Create a consistent company file", text: "Organise incorporation, trade licence, TIN, office, directors and project records in one version-controlled file." },
      { title: "Submit for verification", text: "Complete the form, attach the required evidence and respond promptly to clarification requests." },
      { title: "Maintain the relationship", text: "Track renewal, member information, project updates and any sector notices that affect the business." },
    ],
    documents: ["Company or firm registration", "Trade licence and tax records", "Office address evidence", "Director or authorised-person details", "Project or developer profile where required"],
    pitfalls: ["Using marketing claims that cannot be supported by project records", "Confusing membership with project approval", "Allowing company and project information to become outdated"],
    faqs: [
      { question: "Does REHAB membership approve a real-estate project?", answer: "No. Project, land, building and safety approvals remain separate responsibilities." },
      { question: "What makes an application easier to review?", answer: "A consistent company profile, current licences and an organised project evidence file." },
      { question: "Should the membership be shown in marketing?", answer: "Only describe the membership accurately and avoid implying that it is a government approval or project guarantee." },
    ],
    keywords: ["REHAB membership Bangladesh", "real estate association membership", "developer membership", "housing business compliance", "রিহ্যাব সদস্যপদ"],
  }),
  [keyFor("Association Membership", "RAJUK Enlistment")]: topic({
    title: "RAJUK Enlistment in Bangladesh: documents and preparation",
    subtitle: "Organise the business, professional and project records needed when preparing a RAJUK enlistment request.",
    intro: "RAJUK-related enlistment or permissions depend heavily on the nature of the applicant and project. A clear file should separate business identity, professional credentials, land or site records and the specific approval being requested.",
    what: "The current RAJUK process can vary by service, location and applicant category. Supporting records may include entity or trade documents, professional credentials, drawings, ownership or authorisation records and fee evidence.",
    why: "Separating the underlying property and professional documents from the company profile helps prevent an application from being delayed because one record is missing or inconsistent.",
    steps: [
      { title: "Define the RAJUK service", text: "Identify whether the request concerns enlistment, plan approval, land use, construction or another specific service." },
      { title: "Confirm applicant authority", text: "Record the owner, developer, consultant or authorised representative and their right to submit the application." },
      { title: "Prepare the technical file", text: "Collect plans, land, address, ownership and professional documents in the required format." },
      { title: "Track conditions and renewals", text: "Keep approvals, conditions, inspection notes, fees and later compliance actions with the project record." },
    ],
    documents: ["Applicant entity or trade records", "Ownership, lease or authority documents", "Site and address information", "Professional or technical documents", "Current forms and payment evidence"],
    pitfalls: ["Using the wrong RAJUK service category", "Submitting plans without matching land or ownership records", "Treating enlistment as permission to ignore project conditions"],
    faqs: [
      { question: "Is RAJUK enlistment the same as building approval?", answer: "Not always. The exact meaning depends on the service and applicant category; confirm the applicable RAJUK route." },
      { question: "Who can submit the file?", answer: "The owner or an authorised representative may submit, subject to the current procedure and authority documents." },
      { question: "What should be tracked after approval?", answer: "Track conditions, inspection steps, validity, revisions and any related local or environmental permissions." },
    ],
    keywords: ["RAJUK enlistment Bangladesh", "RAJUK approval", "building permission documents", "real estate compliance", "রাজউক এনলিস্টমেন্ট"],
  }),
  [keyFor("Association Membership", "Others Membership")]: topic({
    title: "Business Association Membership in Bangladesh: choose the right fit",
    subtitle: "Use a simple due-diligence checklist when selecting and applying for an industry or local business association membership.",
    intro: "Membership is most useful when it serves a clear business purpose: industry learning, networking, a certificate, collective representation or access to a particular market. The application should reflect the business’s real activity and current records.",
    what: "Different associations have different eligibility rules, forms, fees and supporting documents. A business may need its trade licence, entity papers, tax information, address, owner or director identity and evidence of sector activity.",
    why: "Selecting the right association prevents the business from paying for a badge that does not support its actual customers or regulatory work.",
    steps: [
      { title: "Define the purpose", text: "Write down the market, network, certificate or support the business expects from membership." },
      { title: "Check eligibility and reputation", text: "Review current criteria, member benefits, renewal terms and whether the association is relevant to the sector." },
      { title: "Prepare the application file", text: "Use current business, tax, address and authorised-person documents that tell one consistent story." },
      { title: "Review value each year", text: "Track renewal and measure whether the membership is generating useful relationships or support." },
    ],
    documents: ["Trade licence", "Company, firm or proprietor record", "Tax identity information", "Business address evidence", "Owner, director or authorised-person identity"],
    pitfalls: ["Choosing membership only for a logo or certificate", "Applying with outdated business records", "Claiming membership benefits that the association does not provide"],
    faqs: [
      { question: "Does association membership replace a licence?", answer: "No. Membership is generally separate from statutory licensing and sector permissions." },
      { question: "Can a business belong to multiple associations?", answer: "Yes, if each membership has a clear purpose and the business can maintain the records and fees." },
      { question: "What is the best document to update first?", answer: "Start with the legal name, trade licence, address and authorised-person records because most associations rely on them." },
    ],
    keywords: ["business association membership Bangladesh", "industry membership", "trade association application", "business networking", "ব্যবসায়িক সমিতি সদস্যপদ"],
  }),
  [keyFor("Startup Business Package", "Website")]: topic({
    title: "Business Website Setup in Bangladesh: a launch checklist",
    subtitle: "Plan a credible business website around clear positioning, useful content, mobile access and dependable ownership.",
    intro: "A business website should make it easy for the right customer to understand what you do, trust your process and take the next step. The strongest launch starts with content and ownership decisions before visual design.",
    what: "A practical website project usually covers the domain, hosting, brand identity, page structure, service copy, contact route, privacy information, analytics and a maintenance plan. The website should support the business’s actual registration, service and contact information.",
    why: "A clear site works as a 24-hour explanation of the business. It reduces repetitive questions and gives customers a safer place to verify services, documents and next steps.",
    steps: [
      { title: "Clarify the primary action", text: "Decide whether visitors should book a consultation, request a quote, call, message or use a tool." },
      { title: "Organise the content", text: "Create focused pages for services, about, contact, privacy and useful guidance before styling the site." },
      { title: "Build for trust and access", text: "Use a readable mobile layout, real contact details, accessible controls and secure hosting." },
      { title: "Measure and maintain", text: "Connect search metadata, analytics, backups and a routine for reviewing outdated information." },
    ],
    documents: ["Approved logo and brand colours", "Service descriptions and prices where applicable", "Contact, address and business-hour details", "Privacy and terms information", "Domain and hosting ownership records"],
    pitfalls: ["Launching with placeholder contact details", "Copying generic service claims without proof", "Letting the domain or hosting account belong to an inaccessible third party"],
    faqs: [
      { question: "How many pages does a new business need?", answer: "Start with the pages that answer the customer’s main questions: services, about, contact, trust information and useful guidance." },
      { question: "Does a website automatically rank on Google?", answer: "No. Technical accessibility, useful content, search metadata, links and ongoing quality all contribute to visibility." },
      { question: "Who should own the domain?", answer: "The business should control the registrar account, recovery email and billing records even if a provider builds the site." },
    ],
    keywords: ["business website Bangladesh", "website setup for small business", "company website design", "business web presence", "ব্যবসার ওয়েবসাইট"],
  }),
  [keyFor("Startup Business Package", "Logo Design")]: topic({
    title: "Logo Design for a New Business: create a usable brand mark",
    subtitle: "Build a logo system that remains clear across websites, documents, social profiles and everyday business use.",
    intro: "A good logo is not only an attractive picture. It is a repeatable identity asset that should remain recognisable when printed small, used in one colour or placed beside official business information.",
    what: "A practical logo project covers a brief, visual direction, primary and secondary marks, colour and type choices, file formats, spacing guidance and usage rights. The identity should fit the business’s audience and the way the name appears in legal and customer-facing records.",
    why: "A small, consistent identity makes invoices, proposals, social profiles and website pages feel connected. It also saves time when the business needs new marketing or document assets.",
    steps: [
      { title: "Write the brand brief", text: "Describe the audience, offer, personality, competitors and situations where the logo will appear." },
      { title: "Explore and select a direction", text: "Compare a small number of distinct concepts and choose the one that remains clear at useful sizes." },
      { title: "Create the complete logo set", text: "Prepare horizontal, stacked, mark-only, light and one-colour versions with correct spacing." },
      { title: "Organise the handover", text: "Keep editable source files, web formats, print formats, colour values and usage rights in one folder." },
    ],
    documents: ["Brand brief and business name", "Approved colour direction", "Examples of intended use", "Final vector and raster files", "Usage or ownership agreement"],
    pitfalls: ["Designing only one file for every use case", "Using colours that disappear in print or low contrast", "Losing source files or rights information after delivery"],
    faqs: [
      { question: "Should a logo include the legal company name?", answer: "The logo can use the trading or brand name, but official documents should still use the correct legal identity where required." },
      { question: "Which logo files matter most?", answer: "Keep an editable vector file plus transparent PNG and suitable light, dark and one-colour versions." },
      { question: "Does a logo protect the brand name?", answer: "No. A logo design and trademark registration are separate forms of brand protection." },
    ],
    keywords: ["logo design Bangladesh", "business logo", "brand identity design", "startup branding", "লোগো ডিজাইন"],
  }),
  [keyFor("Startup Business Package", "Digital Marketing")]: topic({
    title: "Digital Marketing for a New Business in Bangladesh",
    subtitle: "Plan a focused digital marketing system that connects the right audience, message, channel and measurable next step.",
    intro: "Digital marketing works best when it starts with a clear offer and a reliable way to respond to interested people. A new business does not need to publish everywhere; it needs a focused system it can maintain.",
    what: "A practical plan can combine website content, search visibility, social media, email, paid campaigns and measurement. The right mix depends on the audience, location, sales cycle, budget and regulatory limits of the business.",
    why: "A documented marketing system makes it easier to learn what is working and avoid spending money on impressions that do not lead to qualified conversations.",
    steps: [
      { title: "Define the audience and offer", text: "Name the customer, problem, promise and action you want people to take after seeing the message." },
      { title: "Choose the useful channels", text: "Prioritise the website, search, social or email channels where the audience already looks for help." },
      { title: "Create a repeatable content plan", text: "Build a small library of helpful topics, proof, calls to action and responses to common questions." },
      { title: "Measure quality, not only reach", text: "Track inquiries, booked calls, qualified leads, cost and conversion so the next decision is evidence-based." },
    ],
    documents: ["Business and customer brief", "Approved service descriptions", "Brand assets and contact links", "Content calendar", "Privacy, consent and tracking settings"],
    pitfalls: ["Running ads before the offer and landing page are clear", "Buying followers or using unverified claims", "Tracking vanity metrics without measuring inquiries or sales"],
    faqs: [
      { question: "How much should a new business spend?", answer: "Set a test budget the business can afford to learn from, then scale only after the channel produces qualified results." },
      { question: "Is social media enough?", answer: "It can support awareness, but a business-owned website and reliable contact route give the audience a more stable next step." },
      { question: "What should be measured first?", answer: "Start with qualified inquiries, response time and the action closest to revenue rather than follower count alone." },
    ],
    keywords: ["digital marketing Bangladesh", "small business marketing", "startup marketing plan", "online business promotion", "ডিজিটাল মার্কেটিং"],
  }),
  [keyFor("Trademark", "Trademark Search")]: topic({
    title: "Trademark Search in Bangladesh: check a brand before filing",
    subtitle: "Use a focused trademark search to identify similar marks, relevant classes and filing risks before investing in a brand.",
    intro: "A trademark search is an early risk check, not a guarantee that an application will be accepted. It should look beyond an exact spelling and consider similar names, logos, sound, meaning and the goods or services involved.",
    what: "A useful search starts with the mark, the owner and the goods or services. It then reviews the relevant classes and available records for similar or potentially confusing marks before a filing strategy is chosen.",
    why: "Searching early can save the cost of packaging, signage and marketing built around a name that may face objection or confusion.",
    steps: [
      { title: "Describe the mark", text: "Record the word, logo, transliteration, meaning, pronunciation and how customers will see it." },
      { title: "Select the relevant classes", text: "Map the goods or services to the classes that actually reflect the planned business activity." },
      { title: "Search for meaningful similarity", text: "Review exact, phonetic, visual and conceptually similar marks in the relevant classes." },
      { title: "Decide the filing direction", text: "Document the risk, refine the mark or prepare an application and evidence plan with professional review." },
    ],
    documents: ["Word mark or logo files", "Goods and services description", "Owner identity or company details", "Relevant class notes", "Prior use or brand evidence where available"],
    pitfalls: ["Searching only the exact spelling", "Choosing a class because it sounds broad", "Treating a search result as a final legal opinion"],
    faqs: [
      { question: "Does a clear search guarantee registration?", answer: "No. The authority can assess the application, evidence and objections under the applicable law." },
      { question: "Should a logo and word mark be searched separately?", answer: "Often yes. The visual and verbal elements can create different similarity questions." },
      { question: "When should a business search?", answer: "Before launch, packaging, major promotion or filing is usually the safest time to investigate the mark." },
    ],
    keywords: ["trademark search Bangladesh", "brand name search", "trademark class search", "DPDT trademark", "ট্রেডমার্ক সার্চ"],
  }),
  [keyFor("Trademark", "Trademark Application")]: topic({
    title: "Trademark Application in Bangladesh: prepare a stronger filing",
    subtitle: "Organise the mark, owner, class and supporting evidence before submitting a trademark application in Bangladesh.",
    intro: "A trademark application brings together the mark, owner, goods or services, class and supporting records. Small inconsistencies at filing can create avoidable objections or later correction work.",
    what: "The filing should accurately identify the applicant, representation of the mark, relevant class, goods or services and any priority or use information that applies. The current DPDT forms, fees and filing route should be checked before submission.",
    why: "A precise application creates a clearer record of the protection being requested and makes later publication, objection or certification steps easier to manage.",
    steps: [
      { title: "Finalise the mark and owner", text: "Confirm whether the applicant is an individual, company or other entity and use its exact official name." },
      { title: "Choose the goods and services", text: "Describe the actual commercial offering and select classes that match the planned use." },
      { title: "File and track the record", text: "Submit the current form and fee, preserve the filing number and monitor communications or examination steps." },
      { title: "Prepare for publication and follow-up", text: "Keep evidence, respond to objections and track publication, opposition and certification milestones." },
    ],
    documents: ["Clear word or logo representation", "Applicant identity or incorporation documents", "Goods and services description", "Class selection", "Use, priority or authorisation evidence where applicable"],
    pitfalls: ["Filing in the wrong owner name", "Describing goods too narrowly or too vaguely", "Losing the filing number or missing an official communication"],
    faqs: [
      { question: "Can one application cover every business activity?", answer: "Protection is connected to the listed goods or services and classes; choose the scope carefully rather than assuming it is universal." },
      { question: "Can a company apply before it is incorporated?", answer: "The applicant must meet the current legal requirements; confirm the appropriate owner and filing route before submission." },
      { question: "What happens after filing?", answer: "The application can move through examination, publication, opposition and certification stages under the current process." },
    ],
    keywords: ["trademark application Bangladesh", "DPDT trademark filing", "brand registration", "trademark class application", "ট্রেডমার্ক আবেদন"],
  }),
  [keyFor("Trademark", "TM Objection")]: topic({
    title: "TM Objection in Bangladesh: respond with a clear record",
    subtitle: "Understand how to organise the application history, grounds and evidence when a trademark faces an objection.",
    intro: "A trademark objection is a process event, not automatically the end of an application. The response should begin with the exact objection, the relevant mark and the deadline stated in the official communication.",
    what: "An objection can concern the mark’s distinctiveness, similarity, classification, applicant details, formalities or evidence. The response route and time limit depend on the current DPDT notice and applicable law.",
    why: "A focused response helps the authority understand the mark, owner, use and legal position without mixing unrelated explanations or unsupported claims.",
    steps: [
      { title: "Read the official objection", text: "Record every ground, application number, deadline and document requested in the notice." },
      { title: "Check the filed record", text: "Compare the objection with the mark representation, owner, class, goods and evidence originally submitted." },
      { title: "Build the response", text: "Prepare factual explanations, amendments or evidence that directly answer each ground." },
      { title: "File and monitor", text: "Submit through the prescribed route, retain proof and track any hearing, publication or follow-up step." },
    ],
    documents: ["Objection or examination notice", "Application and filing receipt", "Mark and class information", "Use, sales, advertising or distinctiveness evidence", "Applicant authorisation"],
    pitfalls: ["Missing the response deadline", "Answering a different issue from the one raised", "Making claims about distinctiveness without supporting evidence"],
    faqs: [
      { question: "Is an objection the same as opposition?", answer: "No. An objection is generally raised during examination, while opposition can be brought by an interested party under the publication process." },
      { question: "Can the mark be amended?", answer: "Some changes may be possible, but the permissible scope depends on the current process and whether the amendment changes the mark materially." },
      { question: "What evidence is useful?", answer: "Evidence should connect the mark to the applicant’s use, reputation, sales or distinctiveness and be organised chronologically." },
    ],
    keywords: ["TM objection Bangladesh", "trademark examination objection", "DPDT objection reply", "trademark response", "ট্রেডমার্ক আপত্তি"],
  }),
  [keyFor("Trademark", "Trademark Publication/Gazette")]: topic({
    title: "Trademark Publication and Gazette in Bangladesh",
    subtitle: "Follow the publication stage carefully so a trademark applicant can track opposition windows and later certification.",
    intro: "Publication is an important point in the trademark process because it gives the public an opportunity to review the mark under the applicable rules. Applicants should treat it as a deadline and monitoring stage, not a passive announcement.",
    what: "After the application reaches the relevant stage, publication or gazette information can identify the mark, owner, class and opposition period. The exact publication format and timeline should be confirmed from the current DPDT process.",
    why: "Keeping the publication record and deadline visible helps the applicant respond to opposition or continue toward certification without losing track of the file.",
    steps: [
      { title: "Confirm publication details", text: "Check the mark, applicant, class, application number and publication date against the filing record." },
      { title: "Calculate the response window", text: "Record the applicable opposition or response deadline and assign an owner to monitor it." },
      { title: "Prepare for possible opposition", text: "Keep the filing history, use evidence, ownership records and response strategy ready." },
      { title: "Track the next stage", text: "Follow the file after the publication period and preserve every notice, receipt and certification step." },
    ],
    documents: ["Application receipt", "Gazette or publication record", "Mark and class details", "Use and ownership evidence", "Deadline and correspondence log"],
    pitfalls: ["Assuming publication means final registration", "Missing an opposition period", "Failing to compare the published entry with the submitted application"],
    faqs: [
      { question: "Does publication guarantee a trademark certificate?", answer: "No. The application can still face opposition or other process requirements before certification." },
      { question: "Who should monitor the publication?", answer: "Assign the applicant, authorised representative or counsel and keep the deadline in a shared calendar." },
      { question: "What if the published information is wrong?", answer: "Raise the discrepancy through the current authority route promptly and preserve evidence of the correct filing." },
    ],
    keywords: ["trademark gazette Bangladesh", "trademark publication", "DPDT gazette", "opposition period", "ট্রেডমার্ক গেজেট"],
  }),
  [keyFor("Trademark", "Trademark Opposition")]: topic({
    title: "Trademark Opposition in Bangladesh: prepare the response strategy",
    subtitle: "Organise the published mark, opposition grounds and evidence before responding to a trademark opposition.",
    intro: "Opposition is a formal challenge to a published trademark application. The applicant should understand who filed it, what grounds are raised and which part of the mark or goods and services is actually in dispute.",
    what: "The opposition file can involve the published application, notice, pleadings, evidence, hearings and responses within prescribed timelines. The process is procedural and should be handled from the official record.",
    why: "A disciplined response prevents the applicant from spending time on irrelevant history and helps establish the mark’s ownership, use, distinctiveness or difference from the opposing mark.",
    steps: [
      { title: "Secure the complete file", text: "Collect the opposition notice, application, publication record, class details and every stated deadline." },
      { title: "Analyse each ground", text: "Separate similarity, ownership, prior use, classification and procedural issues so each receives a direct response." },
      { title: "Build the evidence", text: "Arrange invoices, advertising, sales, registrations, design files and correspondence in a clear chronology." },
      { title: "Respond and monitor", text: "File through the prescribed process and track hearings, evidence stages and the final decision." },
    ],
    documents: ["Opposition notice", "Trademark application and publication", "Ownership and use evidence", "Sales, marketing and customer records", "Authorisation and correspondence log"],
    pitfalls: ["Missing the first response deadline", "Treating an opposition as a casual complaint", "Submitting evidence without explaining how it answers the grounds"],
    faqs: [
      { question: "Can an opposition be negotiated?", answer: "Parties may explore commercial resolution where appropriate, but any formal deadlines and authority requirements still need attention." },
      { question: "Is prior use always decisive?", answer: "Prior use can be relevant, but the outcome depends on the applicable law, evidence and grounds in the particular file." },
      { question: "What happens if the applicant does nothing?", answer: "The application may be placed at serious risk. Follow the official notice and obtain professional advice promptly." },
    ],
    keywords: ["trademark opposition Bangladesh", "DPDT opposition", "trademark dispute", "brand protection response", "ট্রেডমার্ক বিরোধিতা"],
  }),
  [keyFor("Trademark", "Trademark Certification")]: topic({
    title: "Trademark Certification in Bangladesh: protect the record after approval",
    subtitle: "Understand the final certification step and the records a trademark owner should maintain after registration.",
    intro: "Trademark certification is the point at which the owner receives formal evidence of registration under the applicable process. The certificate should be checked carefully and connected to a practical renewal and enforcement file.",
    what: "The final record identifies the owner, mark, class and registration details. The owner should confirm that the information is correct, understand the term and renewal requirements and monitor how the mark is used.",
    why: "A certificate is valuable only when the owner can prove ownership, maintain the registration and respond to confusing use or changes in the business.",
    steps: [
      { title: "Verify the certificate", text: "Check the owner, mark representation, class, registration number and dates against the application." },
      { title: "Create the trademark register", text: "Store the certificate, filing history, renewal date, permitted users and evidence of use in one controlled file." },
      { title: "Use the mark consistently", text: "Keep the logo, word mark and goods or services aligned with the protection that was registered." },
      { title: "Monitor and renew", text: "Track renewal, watch for confusing use and decide when further classes or marks are needed." },
    ],
    documents: ["Trademark certificate", "Application and publication records", "Owner identity or incorporation records", "Renewal calendar", "Use and enforcement evidence"],
    pitfalls: ["Assuming the certificate protects every class", "Letting renewal dates pass unnoticed", "Changing the mark substantially without reviewing protection"],
    faqs: [
      { question: "How long does a trademark registration last?", answer: "The term and renewal rules should be checked in the current law and certificate because requirements can change." },
      { question: "Can the registration be assigned?", answer: "Assignments or permitted use can require formal records or filings; obtain advice before changing ownership." },
      { question: "What if another business copies the mark?", answer: "Preserve evidence, assess the similarity and seek an appropriate professional or legal enforcement route." },
    ],
    keywords: ["trademark certification Bangladesh", "trademark registration certificate", "DPDT trademark certificate", "brand registration proof", "ট্রেডমার্ক সনদ"],
  }),
  [keyFor("Trademark", "Trademark Class Finder")]: topic({
    title: "Trademark Class Finder for Bangladesh: choose the right protection scope",
    subtitle: "Use a practical class-finding method to connect a business’s real goods or services to a trademark filing.",
    intro: "A trademark class is not a description of the whole business. It identifies the goods or services for which protection is requested, so class selection should follow the offer customers will actually receive.",
    what: "Start with the business’s products, services, sales model and planned expansion, then compare them with the current classification list. Similar-sounding descriptions can belong to different classes or require a more precise explanation.",
    why: "Choosing the relevant class prevents a business from paying for a category that does not protect its core offer or from describing its goods so narrowly that future use is left exposed.",
    steps: [
      { title: "List the real offer", text: "Write the goods and services in customer language, including what is sold, delivered, installed or advised." },
      { title: "Map each item to a class", text: "Compare the list with the current classification terms and note primary and supporting classes." },
      { title: "Check similar marks in those classes", text: "Search the relevant classes for confusingly similar names, logos and goods or services." },
      { title: "Record the filing scope", text: "Keep the final class rationale and goods or services description with the trademark application file." },
    ],
    documents: ["Goods and services inventory", "Business model and expansion plan", "Candidate mark or logo", "Current classification reference", "Prior search notes"],
    pitfalls: ["Choosing a class based only on the company’s industry label", "Listing every imaginable service without a real use plan", "Ignoring supporting classes for related products or services"],
    faqs: [
      { question: "Can a business register in more than one class?", answer: "A mark can need multiple classes when the business genuinely provides goods or services across them; confirm the filing requirements." },
      { question: "Do classes protect the company name itself?", answer: "Protection is connected to the mark and listed goods or services, not an unlimited reservation of a name in every market." },
      { question: "Should classes be reviewed before launch?", answer: "Yes. Reviewing the scope before investing in packaging or promotion is usually more efficient than correcting it later." },
    ],
    keywords: ["trademark class finder Bangladesh", "Nice classification trademark", "DPDT class search", "trademark goods services", "ট্রেডমার্ক ক্লাস"],
  }),
  [keyFor("Trademark", "Expert Trademark Review")]: topic({
    title: "Expert Trademark Review in Bangladesh: make the filing decision clearer",
    subtitle: "Use a structured professional review to test the mark, class, ownership and evidence before filing.",
    intro: "A professional trademark review turns a promising name into a documented filing decision. It should explain both what looks workable and what could create objection, confusion or future cost.",
    what: "A review can cover the mark’s distinctiveness, search results, owner, classes, goods or services, use evidence, filing history and risk options. The outcome should be a practical recommendation: file, refine, search further or choose another mark.",
    why: "Independent review is most useful before the business has invested heavily in signage, packaging, domain names or advertising around the mark.",
    steps: [
      { title: "Share the complete brief", text: "Provide the mark, owner, business model, classes, launch plan and any prior search or use evidence." },
      { title: "Review similarity and scope", text: "Assess visual, phonetic and conceptual similarity together with the proposed goods and services." },
      { title: "Test practical options", text: "Compare refinement, additional evidence, different classes or a new mark against the business’s priorities." },
      { title: "Record the decision", text: "Keep the review, search notes, final scope and next filing action in the brand record." },
    ],
    documents: ["Candidate word or logo mark", "Owner identity or company record", "Goods and services list", "Search results", "Use or launch evidence"],
    pitfalls: ["Requesting a review without sharing the intended classes", "Treating a risk opinion as a guaranteed outcome", "Failing to document why the final mark was chosen"],
    faqs: [
      { question: "When is an expert review worth it?", answer: "It is especially useful for a valuable brand, crowded class, unusual mark, foreign expansion or a previous objection." },
      { question: "Can a review replace an official search?", answer: "No. The authority’s process remains separate; a review helps the applicant prepare and decide more intelligently." },
      { question: "What should the final deliverable include?", answer: "It should state the reviewed mark, scope, key risks, evidence gaps and a clear recommended next action." },
    ],
    keywords: ["expert trademark review Bangladesh", "trademark legal review", "brand clearance", "trademark filing advice", "ট্রেডমার্ক পর্যালোচনা"],
  }),
  [keyFor("Income Tax", "Individual Tax Return Filings")]: topic({
    title: "Individual Tax Return Filing in Bangladesh: prepare with confidence",
    subtitle: "Organise income, investment, tax payment and identity records before filing an individual tax return in Bangladesh.",
    intro: "An individual tax return becomes easier when records are collected throughout the year rather than reconstructed at the deadline. The goal is to explain income, deductions, assets, liabilities and tax already paid in a consistent way.",
    what: "The return can involve salary, business income, rent, investment, capital gains, foreign income, withholding, assets, liabilities and eligible rebates depending on the taxpayer. Use the current NBR form and rules for the relevant assessment year.",
    why: "A complete return supports future banking, property, business and official transactions while reducing the risk of unexplained figures or missed evidence.",
    steps: [
      { title: "Gather the year’s income", text: "List every relevant income source and reconcile totals with payslips, accounts, bank records and certificates." },
      { title: "Collect tax and rebate evidence", text: "Keep withholding certificates, advance tax, investments and other supporting records in a dated folder." },
      { title: "Complete the return", text: "Use the correct assessment year, taxpayer identity, assets and liabilities and review calculations before submission." },
      { title: "Store proof and follow up", text: "Save the submitted return, acknowledgement, payment receipt and any later notice or correction." },
    ],
    documents: ["e-TIN certificate", "Income statements and bank records", "Withholding or advance tax evidence", "Investment and rebate documents", "Asset and liability information"],
    pitfalls: ["Reporting only salary while ignoring other income", "Losing withholding certificates", "Using estimates that do not reconcile with bank or asset records"],
    faqs: [
      { question: "Who needs to file an individual return?", answer: "The requirement depends on income, status, transactions and current tax rules; check the applicable NBR guidance for the assessment year." },
      { question: "Can a return be corrected after submission?", answer: "Some correction routes may be available, but use the current process and keep the reason and supporting evidence." },
      { question: "Why are asset records important?", answer: "They help explain changes in wealth and support the figures reported in the return." },
    ],
    keywords: ["individual tax return Bangladesh", "income tax filing", "NBR tax return", "personal tax compliance", "ব্যক্তিগত আয়কর রিটার্ন"],
  }),
  [keyFor("Income Tax", "Withholdings Tax Submission")]: topic({
    title: "Withholding Tax Submission in Bangladesh: keep the trail complete",
    subtitle: "Build a repeatable process for calculating, recording and submitting withholding tax in Bangladesh.",
    intro: "Withholding tax is easier to manage when every payment is classified before it is released. The payer should know why tax is being withheld, at what rate, from which base and how the recipient will receive evidence.",
    what: "The applicable treatment depends on the payment type, recipient, threshold, certificate and current tax rules. A proper file connects the invoice or payroll, deduction calculation, deposit, return and withholding certificate.",
    why: "A complete withholding trail protects the payer during review and gives the recipient credit for tax already deducted.",
    steps: [
      { title: "Classify the payment", text: "Identify whether the payment is salary, service, rent, contract, commission, supply or another category." },
      { title: "Check the current rule", text: "Review the applicable rate, threshold, exemption, recipient status and assessment-year guidance." },
      { title: "Deduct and deposit", text: "Record the calculation, deposit the amount through the accepted route and retain the payment proof." },
      { title: "Submit and issue evidence", text: "Complete the relevant statement or return and provide the recipient with a clear withholding certificate." },
    ],
    documents: ["Invoice, payroll or contract", "Recipient tax identity", "Rate and exemption reference", "Deposit or treasury evidence", "Withholding statement and certificate"],
    pitfalls: ["Using last year’s rate without checking", "Deducting from the wrong payment base", "Failing to issue or reconcile the recipient certificate"],
    faqs: [
      { question: "Is withholding tax the recipient’s final tax?", answer: "Not always. It can be an advance or credit against the recipient’s tax position depending on the applicable rule." },
      { question: "Who is responsible for submission?", answer: "The payer or withholding agent generally has the duty, but the exact responsibility depends on the payment and current law." },
      { question: "What if the wrong amount was withheld?", answer: "Keep the calculation and seek the appropriate correction or adjustment route rather than silently changing the ledger." },
    ],
    keywords: ["withholding tax Bangladesh", "TDS submission", "tax deduction at source", "NBR withholding", "উৎসে কর কর্তন"],
  }),
  [keyFor("VAT", "Monthly Vat Return Submission")]: topic({
    title: "Monthly VAT Return Submission in Bangladesh: a practical workflow",
    subtitle: "Use sales, purchase and tax records to prepare a more reliable monthly VAT return in Bangladesh.",
    intro: "A monthly VAT return should be the final output of a regular record-keeping habit. When invoices, purchases, adjustments and payments are captured as they happen, the return becomes a reconciliation instead of a rushed calculation.",
    what: "The exact return depends on the taxpayer’s registration, supplies, input tax, adjustments and current NBR requirements. The business should reconcile VAT collected, eligible input tax, exemptions, zero-rated supplies and any carry-forward or payment.",
    why: "A reliable monthly process reduces late filing, unexplained differences and the risk that invoices or purchase records cannot support the figures reported.",
    steps: [
      { title: "Close the month’s invoices", text: "Reconcile sales invoices, credit notes, receipts and VAT collected with the accounting records." },
      { title: "Review eligible purchases", text: "Check supplier documents, input tax eligibility, imports and adjustments before including them in the return." },
      { title: "Prepare and submit", text: "Complete the current VAT return, review the calculation and submit or pay through the accepted route." },
      { title: "Archive the evidence", text: "Keep the return, acknowledgement, payment proof, invoices and reconciliation for the required retention period." },
    ],
    documents: ["Sales and purchase register", "Tax invoices and credit notes", "BIN and taxpayer details", "Input tax and adjustment evidence", "Return acknowledgement and payment proof"],
    pitfalls: ["Filing from bank deposits without reconciling invoices", "Claiming input tax without a valid supporting document", "Missing the monthly deadline or retaining no acknowledgement"],
    faqs: [
      { question: "Does every business file the same VAT return?", answer: "No. The form and treatment depend on registration status, activity, supplies and current NBR rules." },
      { question: "What if there were no sales this month?", answer: "A nil or other filing may still be required depending on the taxpayer’s status; check the current obligation." },
      { question: "How long should records be kept?", answer: "Follow the current legal retention requirement and maintain a complete, searchable record of returns and source documents." },
    ],
    keywords: ["monthly VAT return Bangladesh", "VAT return filing", "NBR VAT compliance", "BIN monthly return", "মাসিক ভ্যাট রিটার্ন"],
  }),
  [keyFor("RJSC Compliance", "Annual Return Filings")]: topic({
    title: "RJSC Annual Return Filing in Bangladesh: keep company records current",
    subtitle: "Prepare the shareholding, director, address and financial information needed for an RJSC annual return.",
    intro: "An annual return is a yearly snapshot of the company’s legal and ownership record. It should be prepared from current registers and approved accounts rather than copied forward without review.",
    what: "The filing can include shareholders, directors, registered office, share capital, meetings, accounts and other company information depending on the entity and current RJSC forms. Check the current filing deadline and prescribed documents.",
    why: "Accurate annual returns make later share transfers, bank reviews, financing, tenders and corporate changes easier because the public record is less likely to conflict with internal records.",
    steps: [
      { title: "Close the corporate year", text: "Update registers, minutes, accounts, director information, address and share capital before preparing the return." },
      { title: "Reconcile the filing data", text: "Compare the proposed return with the last filing and identify every change since that date." },
      { title: "Approve and submit", text: "Obtain the required approval or signature, file through the current RJSC process and preserve payment proof." },
      { title: "Track the next obligation", text: "Store the acknowledgement, update the compliance calendar and assign owners for future changes." },
    ],
    documents: ["Previous annual return", "Shareholder and director registers", "Approved accounts and minutes", "Registered office and capital records", "RJSC forms and payment evidence"],
    pitfalls: ["Copying outdated director or address information", "Filing before accounts and registers are reconciled", "Keeping no proof of submission"],
    faqs: [
      { question: "Is an annual return the same as a tax return?", answer: "No. RJSC corporate filings and income tax filings are separate obligations with different information and deadlines." },
      { question: "What if there were no changes during the year?", answer: "A company may still have an annual filing duty; check the current RJSC requirement for its entity type." },
      { question: "Who should own the calendar?", answer: "Assign a corporate-compliance owner and keep the deadline visible to the directors and finance team." },
    ],
    keywords: ["RJSC annual return Bangladesh", "company annual filing", "RJSC compliance", "corporate return", "আরজেএসসি বার্ষিক রিটার্ন"],
  }),
  [keyFor("RJSC Compliance", "Share Transfer")]: topic({
    title: "Share Transfer in Bangladesh: prepare the corporate record properly",
    subtitle: "Follow a clear share-transfer process covering approvals, instruments, consideration and updated company registers.",
    intro: "A share transfer changes the ownership record of a company, so it should be handled as a complete corporate event rather than only a signed paper. The company’s Articles, approval process and statutory records must be checked first.",
    what: "A transfer can involve the transfer instrument, consideration, share certificate, board approval, stamp or fee requirements, register updates and later RJSC reporting. The exact process depends on the company and current law.",
    why: "A clean transfer trail protects both parties and ensures that future annual returns, dividends, voting and due diligence reflect the same ownership.",
    steps: [
      { title: "Check transfer restrictions", text: "Review the Articles, shareholder agreement, pre-emption rights and approval authority before agreeing the transfer." },
      { title: "Prepare the transaction file", text: "Record parties, shares, consideration, instrument, certificate, identity and tax or stamp information." },
      { title: "Approve and update registers", text: "Complete the board or company approval and update the register of members and share certificate record." },
      { title: "Complete statutory follow-up", text: "File the required forms, update the next annual return and retain proof of every step." },
    ],
    documents: ["Share transfer instrument", "Existing share certificate", "Buyer and seller identity", "Board or shareholder approval", "Updated register and filing evidence"],
    pitfalls: ["Ignoring Articles or pre-emption rights", "Updating the register without completing the instrument", "Forgetting stamp, tax or statutory filing implications"],
    faqs: [
      { question: "Can shares be transferred without board approval?", answer: "The required approval depends on the Articles, company type and current law; check the governing documents first." },
      { question: "When does the buyer become the recorded member?", answer: "The company’s register and applicable statutory process determine the effective record; complete every required step." },
      { question: "Should the annual return be updated?", answer: "Yes. The next corporate filing should reflect the updated shareholder record." },
    ],
    keywords: ["share transfer Bangladesh", "RJSC share transfer", "company ownership change", "share transfer deed", "শেয়ার হস্তান্তর"],
  }),
  [keyFor("RJSC Compliance", "Share Allotment")]: topic({
    title: "Share Allotment in Bangladesh: issue new shares with a clear record",
    subtitle: "Plan approvals, consideration, certificates and RJSC updates before allotting new shares in a company.",
    intro: "An allotment creates or issues shares to a person or entity, so it should follow the company’s capital authority and a documented approval path. The reason for the allotment and the rights attached to the shares should be clear.",
    what: "Preparation may include board or shareholder resolutions, authorised capital, subscription details, consideration, share class, allotment return, certificates and updates to the register of members. Current RJSC forms and company law control the process.",
    why: "A well-documented allotment protects the company’s capital record and gives investors a clear account of what they own and paid for.",
    steps: [
      { title: "Confirm authority and rights", text: "Check authorised capital, Articles, share class, pre-emption and approval requirements before offering shares." },
      { title: "Document the subscription", text: "Record subscriber identity, number and class of shares, price, payment and conditions." },
      { title: "Approve and issue", text: "Complete the resolutions, receive consideration, issue certificates and update the member register." },
      { title: "File and reconcile", text: "Submit the prescribed allotment information and make sure accounts and the next annual return agree." },
    ],
    documents: ["Board or shareholder resolution", "Subscription or offer record", "Subscriber identity and payment evidence", "Updated member register", "Allotment filing and certificate"],
    pitfalls: ["Issuing shares beyond available authority", "Recording an allotment without proof of consideration", "Failing to align certificates, accounts and statutory forms"],
    faqs: [
      { question: "Is allotment the same as share transfer?", answer: "No. Allotment issues new shares, while transfer moves existing shares from one holder to another." },
      { question: "Can shares be allotted for non-cash consideration?", answer: "It may be possible subject to valuation, approvals and current legal requirements; document the basis carefully." },
      { question: "What record proves the allotment?", answer: "The resolutions, subscription evidence, register, certificates and filed statutory return should tell the same story." },
    ],
    keywords: ["share allotment Bangladesh", "RJSC allotment", "issue new shares", "company capital increase", "শেয়ার বরাদ্দ"],
  }),
  [keyFor("RJSC Compliance", "Winding up")]: topic({
    title: "Company Winding Up in Bangladesh: plan the closure carefully",
    subtitle: "Review assets, creditors, employees, taxes and corporate filings before starting a company winding-up process.",
    intro: "Winding up is a formal process for bringing a company’s affairs to an end. It should start with a complete picture of the company’s assets, liabilities, employees, contracts, tax position and statutory records.",
    what: "The correct route can depend on solvency, creditor position, shareholder decision, court involvement and the company’s current status. The process may require resolutions, notices, statements, liquidator action, tax clearance and final filings.",
    why: "A structured closure protects directors, creditors, employees and shareholders from unresolved obligations and keeps the company’s final record defensible.",
    steps: [
      { title: "Assess solvency and obligations", text: "Prepare an inventory of assets, debts, taxes, employees, leases, contracts, litigation and statutory filings." },
      { title: "Choose the applicable route", text: "Confirm whether voluntary, court-supervised or another winding-up process applies to the company." },
      { title: "Complete the closure work", text: "Handle notices, asset realisation, creditor and employee claims, taxes, accounts and distributions as required." },
      { title: "File the final record", text: "Submit final accounts and statutory documents and preserve the company’s closure file and approvals." },
    ],
    documents: ["Certificate of incorporation and Articles", "Current financial statements", "Creditor, debtor and asset schedule", "Tax and employee records", "Resolutions, notices and liquidator reports"],
    pitfalls: ["Starting closure without checking solvency", "Ignoring employees, taxes or lease obligations", "Assuming non-operation equals formal dissolution"],
    faqs: [
      { question: "Can an inactive company simply be abandoned?", answer: "Non-operation does not necessarily end corporate, tax or filing obligations. Use the correct closure route." },
      { question: "What happens to company assets?", answer: "Assets should be identified, valued and dealt with under the applicable winding-up process and creditor priorities." },
      { question: "Does winding up remove all liability immediately?", answer: "Not automatically. Directors and the company may still have responsibilities during the process." },
    ],
    keywords: ["company winding up Bangladesh", "RJSC company closure", "voluntary winding up", "corporate dissolution", "কোম্পানি অবসায়ন"],
  }),
  [keyFor("RJSC Compliance", "High Court permission")]: topic({
    title: "High Court Permission for Company Matters in Bangladesh",
    subtitle: "Prepare a disciplined corporate record when a transaction or restructuring needs High Court permission.",
    intro: "Some corporate events require court supervision or permission because they affect creditors, shareholders, assets or the legal status of the company. The quality of the application depends on the underlying corporate record being complete and internally consistent.",
    what: "The exact order, petition, affidavit, notices, accounts and supporting evidence depend on the matter. A company should identify the legal route, parties, affected creditors or shareholders and the relief requested before drafting.",
    why: "A complete court file reduces adjournments and gives the Court a clear explanation of the company’s authority, solvency, approvals and proposed outcome.",
    steps: [
      { title: "Define the relief required", text: "State the transaction or corporate action and why court permission is required under the applicable law." },
      { title: "Reconcile the company record", text: "Update registers, accounts, resolutions, creditor information, notices and constitutional documents." },
      { title: "Prepare the petition file", text: "Coordinate petitions, affidavits, exhibits, authorisations and notices with qualified legal counsel." },
      { title: "Track the order and follow-up", text: "Complete filings, authority submissions and corporate register updates required after the Court’s direction." },
    ],
    documents: ["Corporate constitutional documents", "Board and shareholder resolutions", "Accounts, solvency or creditor schedules", "Petition, affidavit and exhibits", "Authority and notice records"],
    pitfalls: ["Seeking permission without a complete corporate approval trail", "Using outdated accounts or creditor information", "Failing to carry the order into later RJSC and company records"],
    faqs: [
      { question: "Does every corporate change need High Court permission?", answer: "No. The requirement depends on the specific transaction and law. Obtain advice on the correct route." },
      { question: "Can an accountant prepare the petition alone?", answer: "Court proceedings should be coordinated with qualified legal counsel, with financial and corporate professionals supporting the evidence." },
      { question: "What happens after an order?", answer: "The company may need certified copies, filings, notices, register updates or other implementation steps." },
    ],
    keywords: ["High Court company permission Bangladesh", "corporate court approval", "RJSC court order", "company restructuring", "হাইকোর্ট অনুমতি"],
  }),
  [keyFor("Fee Calculator", "Limited Company Cost Calculator")]: topic({
    title: "Limited Company Cost Calculator in Bangladesh: understand the estimate",
    subtitle: "Use a limited company cost estimate to plan government fees, professional work and the registrations that follow incorporation.",
    intro: "A company formation estimate is most useful when it separates official fees from professional support and later operating costs. The final amount depends on the company’s capital, structure, documents, urgency and current authority schedule.",
    what: "A calculator can provide an indicative view of incorporation-related fees and service charges. It should not be treated as an official quotation because government schedules, stamp duties, name clearance, tax, trade licence and sector requirements may change.",
    why: "Separating the cost categories helps founders budget for the full first phase instead of comparing only the incorporation line item.",
    steps: [
      { title: "Choose the company assumptions", text: "Enter authorised capital, shareholder or director assumptions and any options that affect the estimate." },
      { title: "Review government components", text: "Read the estimated RJSC, stamp or filing components and check the date or source shown with the tool." },
      { title: "Add the next registrations", text: "Budget separately for trade licence, e-TIN, VAT/BIN, banking, accounting and any sector permission." },
      { title: "Confirm before payment", text: "Use the estimate for planning and request a current case-specific quote before starting the filing." },
    ],
    documents: ["Expected authorised capital", "Proposed ownership and structure", "Registered office information", "Required company services", "Current fee reference or quotation"],
    pitfalls: ["Treating an estimate as an official fee notice", "Ignoring post-incorporation registrations", "Changing capital or structure after relying on the first estimate"],
    faqs: [
      { question: "Does the calculator guarantee the final cost?", answer: "No. It is an estimate based on current configured assumptions; confirm the authority fee and case-specific work before payment." },
      { question: "Why does authorised capital affect cost?", answer: "Some government or stamp components can be connected to capital bands, while professional charges can be separate." },
      { question: "Is annual compliance included?", answer: "Usually not unless the estimate explicitly says so. Budget annual returns, accounts, tax and other renewals separately." },
    ],
    keywords: ["limited company cost calculator Bangladesh", "company registration fee", "RJSC company cost", "incorporation estimate", "কোম্পানি খরচ ক্যালকুলেটর"],
  }),
  [keyFor("Fee Calculator", "Trade License Fee Calculator")]: topic({
    title: "Trade License Fee Calculator in Bangladesh: plan local licence costs",
    subtitle: "Estimate the main trade-licence cost components while checking the local authority and business activity assumptions.",
    intro: "Trade licence fees are local and can depend on the authority, business category, location, signboard or other assessments. A calculator can help with early planning, but the issuing authority’s assessment remains decisive.",
    what: "The tool may combine a configured licence fee with service charges or related items. Read the authority, effective date, exclusions and assumptions before treating the result as a budget figure.",
    why: "A transparent estimate helps a business plan its launch or renewal cash flow and identify which parts need confirmation from the local authority.",
    steps: [
      { title: "Select the business location", text: "Choose the city corporation, municipality or other authority that matches the operating address." },
      { title: "Choose the activity category", text: "Use the closest current business category and note whether the authority may assess the premises differently." },
      { title: "Review included items", text: "Separate annual licence, signboard, source tax, service charge, arrears or late fees where the tool shows them." },
      { title: "Confirm the assessment", text: "Use the result for planning and verify the final payment instruction with the issuing authority or professional." },
    ],
    documents: ["Business address", "Business activity", "Existing licence for renewal", "Authority and category reference", "Payment or assessment notice"],
    pitfalls: ["Using the wrong local authority", "Assuming every related charge is included", "Relying on an old tariff after the effective date changes"],
    faqs: [
      { question: "Is a trade licence fee the same everywhere?", answer: "No. Local authority schedules and business categories can differ." },
      { question: "Does the calculator submit the application?", answer: "The calculator is for estimation unless the page explicitly provides a separate application workflow." },
      { question: "What if the authority’s amount differs?", answer: "Use the authority’s current assessment as the payment source and keep the difference noted for future updates." },
    ],
    keywords: ["trade license fee calculator Bangladesh", "trade licence cost", "city corporation fee", "business licence estimate", "ট্রেড লাইসেন্স ফি"],
  }),
  [keyFor("Fee Calculator", "RJSC Fee Calculator")]: topic({
    title: "RJSC Fee Calculator in Bangladesh: estimate corporate filing fees",
    subtitle: "Use capital and filing assumptions to understand an indicative RJSC fee range before a company transaction.",
    intro: "RJSC costs can vary by entity type, authorised or paid-up capital, filing type, document and current fee schedule. An estimate is useful for planning only when the assumptions are visible.",
    what: "The calculator may show government fees, stamp or document charges and a separate service component. It should identify the capital band, transaction and effective reference used for the calculation.",
    why: "A clear estimate helps founders compare options and prepare the right amount without confusing professional charges with government fees.",
    steps: [
      { title: "Select the transaction", text: "Choose incorporation, annual filing, share change, document or other RJSC work that matches the case." },
      { title: "Enter the capital assumption", text: "Use the authorised or relevant capital value requested by the tool and check the band it selects." },
      { title: "Separate each fee", text: "Read government, stamp, filing and service lines individually rather than relying only on the total." },
      { title: "Validate before filing", text: "Confirm the current RJSC schedule and case details before using the estimate as a payment decision." },
    ],
    documents: ["Entity type", "Authorised or paid-up capital", "Transaction or filing type", "Current RJSC fee reference", "Professional quotation where applicable"],
    pitfalls: ["Entering the wrong capital basis", "Assuming all RJSC transactions use the same band", "Treating an indicative table as a final government assessment"],
    faqs: [
      { question: "Why do capital bands matter?", answer: "Certain government or stamp components can be calculated by capital range; the relevant basis depends on the transaction." },
      { question: "Does the result include a consultant’s fee?", answer: "Only if the tool labels a separate service charge. Review the breakdown and request a case-specific quote." },
      { question: "Can the fee schedule change?", answer: "Yes. Always check the reference date and current RJSC instruction before payment." },
    ],
    keywords: ["RJSC fee calculator Bangladesh", "RJSC capital fee", "company filing fee", "corporate fee estimate", "আরজেএসসি ফি ক্যালকুলেটর"],
  }),
  [keyFor("Fee Calculator", "TAX Calculator")]: topic({
    title: "Income Tax Calculator in Bangladesh: use estimates responsibly",
    subtitle: "Estimate an income-tax position from income, deductions and credits while keeping the official return as the source of truth.",
    intro: "A tax calculator can make planning easier, but it is not the same as a filed return. The result depends on the assessment year, income categories, rebates, withholding, exemptions and facts that a simple form may not capture.",
    what: "Use the tool to explore a scenario and understand which inputs drive the result. Confirm the current tax slabs, thresholds, exemptions and filing requirements before making a payment or return decision.",
    why: "Scenario planning helps a taxpayer set aside funds and identify records that should be gathered before the formal return is prepared.",
    steps: [
      { title: "Choose the assessment year", text: "Make sure the calculator’s rates and thresholds correspond to the year being planned." },
      { title: "Enter complete income", text: "Include salary, business, rent, investment or other relevant categories rather than only the easiest figure." },
      { title: "Review deductions and credits", text: "Check eligible rebates, withholding and advance tax evidence against the current rules." },
      { title: "Use the result as a scenario", text: "Keep the estimate for planning and confirm the final position through the official return or professional review." },
    ],
    documents: ["Income statements", "Withholding and advance-tax proof", "Investment or rebate records", "Assessment-year reference", "Asset and liability information"],
    pitfalls: ["Using the wrong assessment year", "Leaving out a second income source", "Treating a rough estimate as legal tax advice"],
    faqs: [
      { question: "Does the calculator file a tax return?", answer: "No. It estimates a scenario; filing and payment follow the official NBR process." },
      { question: "Why can the result differ from the return?", answer: "The formal return may include categories, exemptions, withholding or facts that were not entered into the calculator." },
      { question: "What is the safest next step?", answer: "Save the inputs, gather supporting records and have the final calculation checked against current rules." },
    ],
    keywords: ["income tax calculator Bangladesh", "tax estimator", "NBR tax calculation", "personal income tax", "আয়কর ক্যালকুলেটর"],
  }),
  [keyFor("Fee Calculator", "VAT Calculator")]: topic({
    title: "VAT Calculator in Bangladesh: estimate VAT with the right inputs",
    subtitle: "Use a VAT estimate to understand tax-inclusive prices, output tax and planning assumptions before filing.",
    intro: "VAT calculations depend on the transaction, price basis, rate, exemption, input tax and registration status. A simple calculator is useful for a scenario, but invoices and returns must follow the current NBR rules.",
    what: "A VAT tool may calculate tax-exclusive or tax-inclusive amounts, output VAT or a planning total. Read whether the entered amount includes VAT and whether the result covers a single sale, period or broader return position.",
    why: "Clear VAT estimates help businesses price consistently and avoid accidentally treating a tax-inclusive amount as net revenue.",
    steps: [
      { title: "Identify the supply", text: "Confirm what is being sold, whether it is taxable and which rate or treatment may apply." },
      { title: "Choose the price basis", text: "Enter whether the amount is before VAT or already tax-inclusive and keep the invoice convention consistent." },
      { title: "Review the output", text: "Separate net value, VAT and gross amount and compare them with the accounting record." },
      { title: "Reconcile for filing", text: "Use actual invoices, purchases and adjustments for the return rather than relying on a single estimate." },
    ],
    documents: ["Product or service description", "Tax rate and exemption reference", "Invoice amount and price basis", "BIN and taxpayer status", "Sales and purchase records"],
    pitfalls: ["Applying the wrong rate or exemption", "Confusing inclusive and exclusive prices", "Using a calculator result as a substitute for the monthly return"],
    faqs: [
      { question: "How do I calculate VAT from a VAT-inclusive price?", answer: "Use the correct inclusive-price formula for the applicable rate, then verify it against the current NBR treatment." },
      { question: "Does VAT apply to every sale?", answer: "Not necessarily. The nature of the supply, registration status and current rules determine the treatment." },
      { question: "Can the tool calculate input VAT?", answer: "Only if it explicitly supports that input. Input tax eligibility still depends on valid records and current law." },
    ],
    keywords: ["VAT calculator Bangladesh", "VAT inclusive price", "NBR VAT calculation", "output VAT", "ভ্যাট ক্যালকুলেটর"],
  }),
  [keyFor("Fee Calculator", "Trademark Calculator")]: topic({
    title: "Trademark Cost Calculator in Bangladesh: plan the filing journey",
    subtitle: "Estimate trademark filing and professional-work components while keeping class and process assumptions visible.",
    intro: "Trademark cost is influenced by the applicant type, number of classes, mark format, filing route, objections and later certification or renewal work. A calculator helps with an initial budget, not a guaranteed final invoice.",
    what: "Review the number of classes, official filing or publication components, professional search or response work and any later stages included by the tool. Current DPDT fees and case complexity should be confirmed before filing.",
    why: "A stage-by-stage estimate helps a brand owner decide whether to search, file one class or plan a broader protection strategy.",
    steps: [
      { title: "Define the mark and owner", text: "Confirm whether the filing is for a word, logo or combined mark and whether the applicant is an individual or entity." },
      { title: "Choose the classes", text: "Use the actual goods or services to select the number of relevant classes." },
      { title: "Review process stages", text: "Separate search, filing, publication, objection, certification and renewal costs if shown." },
      { title: "Confirm the current quote", text: "Validate the official schedule and professional scope before making a payment decision." },
    ],
    documents: ["Mark representation", "Applicant details", "Goods and services list", "Class selection", "Current DPDT or service fee reference"],
    pitfalls: ["Assuming one class protects every product", "Ignoring objection or certification work", "Using an old fee schedule without checking its date"],
    faqs: [
      { question: "Does the calculator include every future cost?", answer: "Only the components it lists. Opposition, objection, additional classes or renewal can change the total." },
      { question: "Why does the number of classes matter?", answer: "Official filing components and preparation work can increase when protection covers more classes." },
      { question: "Is a trademark search included automatically?", answer: "Check the breakdown. A filing estimate and a professional clearance search can be separate services." },
    ],
    keywords: ["trademark cost calculator Bangladesh", "trademark fee estimate", "DPDT filing cost", "brand registration cost", "ট্রেডমার্ক খরচ"],
  }),
  [keyFor("Fee Calculator", "IRC/ERC FEE Calculator")]: topic({
    title: "IRC and ERC Fee Calculator in Bangladesh: budget trade permissions",
    subtitle: "Estimate import and export registration costs while checking the business category, validity and current authority fees.",
    intro: "Import and export permissions involve more than a single certificate fee. The business should understand whether it needs IRC, ERC or both, what category applies and which bank, tax and trade records support the application.",
    what: "A fee calculator can show an indicative government or service cost based on the selected licence and category. The final amount can depend on turnover, product category, renewal, chamber or other supporting requirements.",
    why: "Early cost clarity helps an importer or exporter budget before placing an order and identify missing registrations that could delay the shipment process.",
    steps: [
      { title: "Choose import, export or both", text: "Confirm the trade direction and whether the business needs an IRC, ERC or combined planning view." },
      { title: "Select the business category", text: "Use the current turnover, product or registration category rather than an assumed default." },
      { title: "Review validity and renewal", text: "Read whether the estimate covers new registration, renewal, certificate, bank or supporting charges." },
      { title: "Confirm with the authority", text: "Check the current CCI&E process and bank or customs requirements before payment or shipment." },
    ],
    documents: ["Trade licence and entity papers", "e-TIN and VAT/BIN information", "Chamber or bank documents where required", "Product and trade activity details", "Current IRC/ERC fee reference"],
    pitfalls: ["Choosing the wrong registration category", "Assuming an IRC replaces customs or product permissions", "Ignoring renewal and bank documentation"],
    faqs: [
      { question: "What do IRC and ERC cover?", answer: "They relate to import and export registration respectively; the business may have separate obligations for customs, products and banking." },
      { question: "Does the calculator submit an application?", answer: "No, unless a separate application workflow is clearly provided. It is an estimate for planning." },
      { question: "Can fees depend on turnover?", answer: "Some categories and renewals can depend on business information. Check the current authority schedule." },
    ],
    keywords: ["IRC ERC fee calculator Bangladesh", "import registration fee", "export registration fee", "CCI&E licence", "আইআরসি ইআরসি ফি"],
  }),
  [keyFor("Business Agreement Builder", "Office Rental Deed - English")]: topic({
    title: "Office Rental Deed Builder in Bangladesh: prepare the essentials",
    subtitle: "Create an English office rental deed draft from structured details, then review the terms, stamp and signing requirements.",
    intro: "An office rental deed records the relationship between the landlord and tenant, the premises, term, rent, deposit, permitted use and responsibilities. A structured builder reduces omissions, but the finished document still needs a careful legal and factual review.",
    what: "The builder can collect party identities, address, office description, dates, rent, security deposit, utilities, repairs, termination, renewal and signatures. Use the preview to check the page order and print or export the final draft for review.",
    why: "Clear rental terms protect both parties from later disagreement about possession, payments, repairs, alterations and the end of the tenancy.",
    steps: [
      { title: "Enter both parties correctly", text: "Use complete names, identity details and addresses exactly as they should appear in the deed." },
      { title: "Describe the premises", text: "Record the office address, floor, rooms, use, handover condition and included fixtures clearly." },
      { title: "Set the commercial terms", text: "Enter rent, deposit, due date, utilities, repair duties, renewal and termination terms without ambiguity." },
      { title: "Review and sign properly", text: "Check the generated pages, applicable stamp requirements, witnesses and signatures before relying on the deed." },
    ],
    documents: ["Landlord identity and ownership or authority proof", "Tenant identity or company record", "Premises address and floor details", "Agreed rent, deposit and term", "Witness and signing information"],
    pitfalls: ["Using a company name without naming its authorised signatory", "Leaving the permitted office use vague", "Printing without checking stamp, witness and execution requirements"],
    faqs: [
      { question: "Is the builder a substitute for legal advice?", answer: "No. It creates a working draft; check applicable law, stamp, registration and signing requirements before execution." },
      { question: "Can a company be the tenant?", answer: "Yes, the company’s legal name and authorised representative should be entered accurately with its supporting records." },
      { question: "Can the English deed be edited after export?", answer: "The exported document is intended to be editable, but any changes should be reviewed against the source details and final agreed terms." },
    ],
    keywords: ["office rental deed Bangladesh", "office rent agreement", "rental deed builder", "commercial lease draft", "অফিস ভাড়ার চুক্তিপত্র"],
  }),
  [keyFor("Business Agreement Builder", "40 Page Partnership Deed - English")]: topic({
    title: "40-Page Partnership Deed Builder in Bangladesh",
    subtitle: "Prepare a detailed English partnership deed from partner, capital, profit-sharing and governance information.",
    intro: "A detailed partnership deed is a working agreement for how partners contribute, manage, share profits, resolve disagreements and leave the firm. The builder helps organise repeated partner fields and long-form clauses, but the final terms must reflect the actual agreement.",
    what: "The 40-page format can capture up to eight partners, optional capital details, mandatory profit or loss percentages, roles, address, business purpose, banking, records, admission, retirement, death, dispute resolution and dissolution.",
    why: "A complete deed is especially important where partners contribute different amounts or responsibilities. It gives the firm a reference for everyday decisions and future changes.",
    steps: [
      { title: "Add the active partners", text: "Start with two partners and add only the partner slots the firm actually needs, checking names and addresses carefully." },
      { title: "Set the ownership economics", text: "Enter profit and loss percentages, optional capital contributions, drawings and any special arrangements." },
      { title: "Define governance and exit", text: "Review authority, banking, records, new partners, retirement, death, dispute and winding-up clauses." },
      { title: "Preview and execute", text: "Check every page, partner order, signature block, witness field, stamp and signing requirement before final use." },
    ],
    documents: ["Partner identity and address records", "Business name, purpose and address", "Profit and loss percentage agreement", "Capital and drawings schedule", "Partner, witness and signing details"],
    pitfalls: ["Leaving the percentage total unclear", "Showing unused partner slots in the final deed", "Using a template without reviewing local stamp and registration requirements"],
    faqs: [
      { question: "How many partners can the builder support?", answer: "The current format starts at two and can support up to eight active partners; unused slots should remain hidden." },
      { question: "Is capital mandatory?", answer: "The builder can leave capital optional where the commercial agreement does not require a fixed contribution, but profit and loss percentages should be completed." },
      { question: "Is the generated deed legally final?", answer: "It is a structured draft. Review the complete text, stamp, signing, witness and registration requirements before execution." },
    ],
    keywords: ["partnership deed builder Bangladesh", "40 page partnership deed", "partnership agreement", "profit sharing deed", "পার্টনারশিপ ডিড"],
  }),
  [keyFor("Business Agreement Builder", "Office Rental Deed - বাংলা")]: topic({
    title: "অফিস ভাড়া চুক্তিপত্র বিল্ডার: বাংলা খসড়া প্রস্তুত করুন",
    subtitle: "বাংলা ভাষায় অফিস ভাড়া চুক্তিপত্রের পক্ষ, ঠিকানা, ভাড়া, মেয়াদ ও স্বাক্ষরের তথ্য সাজিয়ে খসড়া তৈরি করুন।",
    intro: "অফিস ভাড়া চুক্তিপত্রে মালিক ও ভাড়াটিয়ার পরিচয়, অফিসের ঠিকানা, ব্যবহার, ভাড়া, অগ্রিম, ইউটিলিটি, মেরামত, বাতিল ও নবায়নের শর্ত পরিষ্কার থাকা প্রয়োজন। বিল্ডারটি তথ্য সাজাতে সাহায্য করে; চূড়ান্ত ব্যবহারের আগে পুরো খসড়া যাচাই করুন।",
    what: "বাংলা টেমপ্লেটে পক্ষসমূহের পরিচয়, অফিসের বিবরণ, ভাড়ার সময়কাল, মাসিক ভাড়া, জামানত, বিদ্যুৎ বা অন্যান্য খরচ, ব্যবহার, মেরামত, ছাড়ার নিয়ম এবং সাক্ষীর তথ্য রাখা যায়। প্রিভিউ দেখে পৃষ্ঠা ও স্বাক্ষর অংশ মিলিয়ে নিন।",
    why: "পরিষ্কার শর্ত থাকলে অফিস দখল, ভাড়া পরিশোধ, পরিবর্তন, মেরামত ও চুক্তি শেষ হওয়ার সময় ভুল বোঝাবুঝি কমে।",
    steps: [
      { title: "দুই পক্ষের পরিচয় দিন", text: "জাতীয় পরিচয়পত্র বা প্রতিষ্ঠানের নথি অনুযায়ী সম্পূর্ণ নাম, ঠিকানা ও প্রতিনিধির তথ্য লিখুন।" },
      { title: "অফিসের বিবরণ দিন", text: "ভবন, তলা, কক্ষ, ঠিকানা, ব্যবহার ও হস্তান্তরের অবস্থা পরিষ্কারভাবে লিখুন।" },
      { title: "আর্থিক শর্ত ঠিক করুন", text: "ভাড়া, জামানত, পরিশোধের তারিখ, ইউটিলিটি, মেরামত, নবায়ন ও বাতিলের নিয়ম যাচাই করুন।" },
      { title: "প্রিন্ট ও স্বাক্ষরের আগে যাচাই করুন", text: "পৃষ্ঠা, স্ট্যাম্প, সাক্ষী ও স্বাক্ষরের প্রয়োজনীয়তা প্রযোজ্য আইন অনুযায়ী পরীক্ষা করুন।" },
    ],
    documents: ["মালিকের পরিচয় ও মালিকানা বা অনুমতির প্রমাণ", "ভাড়াটিয়ার পরিচয় বা কোম্পানির নথি", "অফিসের ঠিকানা ও তলার বিবরণ", "সম্মত ভাড়া, জামানত ও মেয়াদ", "সাক্ষী ও স্বাক্ষরের তথ্য"],
    pitfalls: ["প্রতিষ্ঠানের অনুমোদিত প্রতিনিধির তথ্য না দেওয়া", "অফিস ব্যবহারের উদ্দেশ্য অস্পষ্ট রাখা", "স্ট্যাম্প ও সাক্ষীর শর্ত যাচাই না করে প্রিন্ট করা"],
    faqs: [
      { question: "এই বিল্ডার কি আইনগত পরামর্শের বিকল্প?", answer: "না। এটি একটি কাজের খসড়া তৈরি করে; ব্যবহার করার আগে আইন, স্ট্যাম্প, নিবন্ধন ও স্বাক্ষরের শর্ত যাচাই করুন।" },
      { question: "কোম্পানি কি ভাড়াটিয়া হতে পারে?", answer: "পারে, তবে কোম্পানির সঠিক আইনগত নাম ও অনুমোদিত প্রতিনিধির তথ্য দিতে হবে।" },
      { question: "বাংলা খসড়া কি পরে সম্পাদনা করা যাবে?", answer: "রপ্তানি করা নথি সম্পাদনাযোগ্য হতে পারে, তবে পরিবর্তনের পর উৎস তথ্য ও সম্মত শর্তের সঙ্গে আবার মিলিয়ে নিন।" },
    ],
    keywords: ["অফিস ভাড়া চুক্তিপত্র", "বাংলা rental deed", "অফিস ভাড়া চুক্তি বিল্ডার", "ভাড়ার দলিল", "office rental deed Bangla"],
  }),
  [keyFor("Business Agreement Builder", "40 Page Partnership Deed - বাংলা")]: topic({
    title: "৪০ পৃষ্ঠার পার্টনারশিপ ডিড বিল্ডার: বাংলা খসড়া",
    subtitle: "বাংলা ভাষায় অংশীদার, লাভ-ক্ষতি, মূলধন, দায়িত্ব ও স্বাক্ষরের তথ্য দিয়ে বিস্তারিত পার্টনারশিপ ডিড প্রস্তুত করুন।",
    intro: "বিস্তারিত পার্টনারশিপ ডিডে অংশীদারদের পরিচয়, ব্যবসার উদ্দেশ্য, লাভ-ক্ষতির ভাগ, দায়িত্ব, ব্যাংক, হিসাব, নতুন অংশীদার, অবসর, মৃত্যু, বিরোধ ও বিলুপ্তির নিয়ম থাকা উচিত। বিল্ডারটি এই তথ্যগুলোকে ধারাবাহিকভাবে সাজাতে সাহায্য করে।",
    what: "এই ফরম্যাটে দুই থেকে আটজন সক্রিয় অংশীদারের তথ্য, ঐচ্ছিক মূলধন, বাধ্যতামূলক লাভ-ক্ষতির শতাংশ, ঠিকানা, ব্যবস্থাপনা, হিসাব, অংশীদার পরিবর্তন, বিরোধ নিষ্পত্তি ও সমাপ্তির ধারাগুলো রাখা যায়। প্রিভিউতে অব্যবহৃত অংশীদার যেন না থাকে তা যাচাই করুন।",
    why: "অংশীদারদের অবদান ও দায়িত্ব আলাদা হলে লিখিত নিয়মই ভবিষ্যতের সিদ্ধান্তের সবচেয়ে পরিষ্কার ভিত্তি। এতে দৈনন্দিন পরিচালনা ও পরিবর্তনের সময় মতভেদ কমে।",
    steps: [
      { title: "সক্রিয় অংশীদার যোগ করুন", text: "দুইজন দিয়ে শুরু করে প্রয়োজন অনুযায়ী অংশীদার যোগ করুন এবং নাম, পরিচয় ও ঠিকানা মিলিয়ে নিন।" },
      { title: "লাভ-ক্ষতির ভাগ নির্ধারণ করুন", text: "মূলধন ঐচ্ছিক হতে পারে, তবে প্রত্যেক অংশীদারের লাভ ও ক্ষতির শতাংশ মোট ১০০ শতাংশ হয় তা নিশ্চিত করুন।" },
      { title: "পরিচালনা ও বের হওয়ার নিয়ম লিখুন", text: "ক্ষমতা, ব্যাংক, হিসাব, নতুন অংশীদার, অবসর, মৃত্যু, বিরোধ ও বিলুপ্তির ধারা পর্যালোচনা করুন।" },
      { title: "প্রিভিউ ও স্বাক্ষর যাচাই করুন", text: "প্রতিটি পৃষ্ঠা, অংশীদারের ক্রম, সাক্ষী, স্ট্যাম্প ও স্বাক্ষরের অংশ চূড়ান্ত ব্যবহারের আগে পরীক্ষা করুন।" },
    ],
    documents: ["অংশীদারদের পরিচয় ও ঠিকানার নথি", "ব্যবসার নাম, উদ্দেশ্য ও ঠিকানা", "লাভ-ক্ষতির শতাংশের সম্মতি", "মূলধন ও উত্তোলনের তালিকা", "অংশীদার, সাক্ষী ও স্বাক্ষরের তথ্য"],
    pitfalls: ["লাভ-ক্ষতির শতাংশের মোট ঠিক না রাখা", "অব্যবহৃত অংশীদারের ঘর চূড়ান্ত ডিডে রেখে দেওয়া", "স্ট্যাম্প ও নিবন্ধনের শর্ত যাচাই না করে ব্যবহার করা"],
    faqs: [
      { question: "বিল্ডারে কয়জন অংশীদার রাখা যায়?", answer: "বর্তমান ফরম্যাটে দুইজন থেকে শুরু করে সর্বোচ্চ আটজন সক্রিয় অংশীদার রাখা যায়; অব্যবহৃত ঘর গোপন থাকবে।" },
      { question: "মূলধন কি বাধ্যতামূলক?", answer: "চুক্তিতে নির্দিষ্ট মূলধন না থাকলে এটি ঐচ্ছিক রাখা যায়, তবে লাভ ও ক্ষতির শতাংশ পূরণ করা প্রয়োজন।" },
      { question: "তৈরি ডিড কি সরাসরি আইনগতভাবে চূড়ান্ত?", answer: "এটি একটি কাঠামোবদ্ধ খসড়া। ব্যবহার করার আগে পুরো লেখা, স্ট্যাম্প, সাক্ষী, স্বাক্ষর ও নিবন্ধনের শর্ত যাচাই করুন।" },
    ],
    keywords: ["পার্টনারশিপ ডিড বিল্ডার", "৪০ পৃষ্ঠার পার্টনারশিপ ডিড", "অংশীদারি চুক্তিপত্র", "লাভ ক্ষতি চুক্তি", "Bangla partnership deed"],
  }),
};

const legacySeedSlugs = [
  "vat-registration-explained-for-small-businesses",
  "trademark-basics-before-you-file",
  "safeguarding-your-business-data",
  "emerging-techniques-in-product-design",
  "building-lasting-connections-with-your-audience",
  "boost-efficiency-without-sacrificing-quality",
  "staying-ahead-in-international-regulations",
  "turning-data-insights-into-business-actions",
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function safeHref(value: string) {
  return isSafeBlogNavigationUrl(value) ? value.trim() : "#contact";
}

function makeSeoTitle(title: string) {
  const suffix = " | Limex";
  if (`${title}${suffix}`.length <= 60) return `${title}${suffix}`;
  const available = 60 - suffix.length;
  const clipped = title.slice(0, available).replace(/\s+\S*$/, "").trim();
  return `${clipped || title.slice(0, available).trim()}${suffix}`;
}

function clipDescription(value: string) {
  if (value.length <= 160) return value;
  return `${value.slice(0, 157).replace(/\s+\S*$/, "").trim()}...`;
}

function renderList(items: string[], className: string) {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderSteps(steps: Step[]) {
  return `<ol class="lm-steps">${steps.map((step, index) => `<li class="lm-step"><span class="lm-step-number">${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div></li>`).join("")}</ol>`;
}

function renderFaqs(faqs: Question[]) {
  return `<div class="lm-faqs">${faqs.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}</div>`;
}

function articleStyles() {
  return `<style>
.limex-menu-guide,.limex-menu-guide *{box-sizing:border-box}
.limex-menu-guide{width:100%;max-width:980px;margin:0 auto;color:#202722;font-family:inherit;font-size:16px;line-height:1.72}
.limex-menu-guide p{margin:0;color:#5e6860}
.limex-menu-guide h2,.limex-menu-guide h3{margin-top:0;color:#17201a}
.limex-menu-guide .lm-hero{padding:44px;border:1px solid #dfe7e0;border-radius:24px;background:linear-gradient(135deg,#f4faf5 0%,#fff 58%,#eef6f0 100%)}
.limex-menu-guide .lm-kicker{display:inline-flex;align-items:center;gap:8px;margin:0 0 16px;color:#327050;font-size:12px;font-weight:700;letter-spacing:.1em;line-height:1.4;text-transform:uppercase}
.limex-menu-guide .lm-kicker:before{content:"";width:22px;height:2px;border-radius:99px;background:#19cfff}
.limex-menu-guide .lm-hero h2{max-width:760px;margin-bottom:16px;font-size:clamp(30px,4.6vw,52px);font-weight:650;line-height:1.08;letter-spacing:-.045em}
.limex-menu-guide .lm-lead{max-width:740px;font-size:18px;line-height:1.7}
.limex-menu-guide .lm-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:28px 0 0;padding:0;list-style:none}
.limex-menu-guide .lm-fact{padding:16px;border-top:1px solid #d7e4d9;color:#4d5d50;font-size:13px;line-height:1.5}
.limex-menu-guide .lm-fact strong{display:block;margin-bottom:5px;color:#202a22;font-size:14px}
.limex-menu-guide .lm-section{margin-top:52px}
.limex-menu-guide .lm-section-label{display:block;margin-bottom:9px;color:#5f826b;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.limex-menu-guide .lm-section h2{margin-bottom:12px;font-size:clamp(25px,3.5vw,36px);font-weight:650;line-height:1.16;letter-spacing:-.03em}
.limex-menu-guide .lm-section-intro{max-width:760px}
.limex-menu-guide .lm-callout{margin-top:22px;padding:20px 22px;border-left:3px solid #19cfff;border-radius:0 14px 14px 0;background:#f1f7f2}
.limex-menu-guide .lm-callout strong{display:block;margin-bottom:5px;color:#24432e;font-size:15px}
.limex-menu-guide .lm-list{display:grid;gap:9px;margin:20px 0 0;padding:0;list-style:none}
.limex-menu-guide .lm-list li{position:relative;padding-left:22px;color:#46534a}
.limex-menu-guide .lm-list li:before{content:"";position:absolute;top:11px;left:0;width:7px;height:7px;border-radius:50%;background:#19cfff}
.limex-menu-guide .lm-steps{display:grid;gap:0;margin:22px 0 0;padding:0;border-top:1px solid #dfe7e0;list-style:none}
.limex-menu-guide .lm-step{display:grid;grid-template-columns:62px minmax(0,1fr);gap:18px;padding:22px 0;border-bottom:1px solid #dfe7e0}
.limex-menu-guide .lm-step-number{display:flex;width:42px;height:42px;align-items:center;justify-content:center;border:1px solid #cfe0d2;border-radius:50%;color:#397153;background:#f7fbf7;font-size:12px;font-weight:700}
.limex-menu-guide .lm-step h3{margin-bottom:5px;font-size:19px;font-weight:650;line-height:1.3}
.limex-menu-guide .lm-step p{font-size:15px}
.limex-menu-guide .lm-faqs{display:grid;gap:10px;margin-top:20px}
.limex-menu-guide .lm-faqs details{padding:16px 18px;border:1px solid #dfe7e0;border-radius:14px;background:#fff}
.limex-menu-guide .lm-faqs summary{cursor:pointer;color:#253129;font-weight:650}
.limex-menu-guide .lm-faqs details p{padding-top:10px;font-size:15px}
.limex-menu-guide .lm-note{margin-top:48px;padding-top:20px;border-top:1px solid #dfe7e0;color:#6d786f;font-size:13px}
@media (max-width:760px){
 .limex-menu-guide{font-size:15px;line-height:1.65}
 .limex-menu-guide .lm-hero{padding:25px 20px;border-radius:18px}
 .limex-menu-guide .lm-hero h2{font-size:clamp(27px,9vw,38px)}
 .limex-menu-guide .lm-lead{font-size:16px}
 .limex-menu-guide .lm-facts{grid-template-columns:1fr;margin-top:22px}
 .limex-menu-guide .lm-fact{padding:11px 0}
 .limex-menu-guide .lm-section{margin-top:38px}
 .limex-menu-guide .lm-step{grid-template-columns:45px minmax(0,1fr);gap:12px;padding:18px 0}
 .limex-menu-guide .lm-step-number{width:35px;height:35px;font-size:11px}
 .limex-menu-guide .lm-step h3{font-size:17px}
}
</style>`;
}

function renderBody(link: MenuLinkRecord, detail: Topic) {
  const destination = safeHref(link.href);
  const category = categoryFor(link.sectionKey);
  return `${articleStyles()}<article class="limex-menu-guide">
  <header class="lm-hero">
    <p class="lm-kicker">${escapeHtml(category)} · ${escapeHtml(link.label)}</p>
    <h2>${escapeHtml(detail.title)}</h2>
    <p class="lm-lead">${escapeHtml(detail.intro)}</p>
    <ul class="lm-facts" aria-label="At a glance">
      <li class="lm-fact"><strong>What this covers</strong>${escapeHtml(detail.what)}</li>
      <li class="lm-fact"><strong>Why it matters</strong>${escapeHtml(detail.why)}</li>
      <li class="lm-fact"><strong>Next step</strong>Review the checklist, confirm current requirements and discuss the service when you are ready.</li>
    </ul>
  </header>
  <section class="lm-section" aria-labelledby="lm-overview"><span class="lm-section-label">Overview</span><h2 id="lm-overview">A clearer way to approach ${escapeHtml(link.label.toLowerCase())}</h2><p class="lm-section-intro">${escapeHtml(detail.what)}</p><div class="lm-callout"><strong>Practical direction</strong><p>${escapeHtml(detail.why)}</p></div></section>
  <section class="lm-section" aria-labelledby="lm-process"><span class="lm-section-label">The process</span><h2 id="lm-process">Plan the work in the right order</h2>${renderSteps(detail.steps)}</section>
  <section class="lm-section" aria-labelledby="lm-documents"><span class="lm-section-label">Preparation</span><h2 id="lm-documents">Documents and information to gather</h2><p class="lm-section-intro">The exact checklist can vary by applicant, location and current authority process. These are the records that usually make the first review more useful.</p>${renderList(detail.documents, "lm-list")}</section>
  <section class="lm-section" aria-labelledby="lm-pitfalls"><span class="lm-section-label">Keep it moving</span><h2 id="lm-pitfalls">Common points to check early</h2>${renderList(detail.pitfalls, "lm-list")}</section>
  <section class="lm-section" aria-labelledby="lm-faq"><span class="lm-section-label">Questions</span><h2 id="lm-faq">Frequently asked questions</h2>${renderFaqs(detail.faqs)}</section>
  <footer class="lm-note"><p><strong>Important note.</strong> This guide is general information for planning and does not replace current government instructions, legal, tax or regulatory advice. Requirements, fees, forms and timelines can change. Confirm the current position before filing, signing or paying.</p><p><a href="${escapeHtml(destination)}">Discuss ${escapeHtml(link.label.toLowerCase())} with Limex →</a></p></footer>
</article>`;
}

function categoryFor(sectionKey: string) {
  if (sectionKey === "startup-licensing") return "Business setup";
  if (sectionKey === "ip-trademark") return "Brand protection";
  if (sectionKey === "compliance-documentation") return "Compliance & documentation";
  return "Business tools";
}

function toneFor(sectionKey: string): "mint" | "violet" | "peach" {
  if (sectionKey === "startup-licensing") return "mint";
  if (sectionKey === "ip-trademark") return "peach";
  if (sectionKey === "compliance-documentation") return "violet";
  return "mint";
}

function slugFor(link: MenuLinkRecord, used: Set<string>) {
  const language = link.label.includes("বাংলা") ? "bangla" : "";
  const label = link.label.replace(/\s*-\s*(?:English|বাংলা)\s*$/i, "").trim();
  const parent = link.parent.trim();
  const base = normalizeBlogSlug(`${label} Bangladesh ${language}`);
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  const withParent = normalizeBlogSlug(`${parent} ${label} Bangladesh ${language}`);
  if (!used.has(withParent)) {
    used.add(withParent);
    return withParent;
  }
  let suffix = 2;
  let candidate = `${withParent}-${suffix}`;
  while (used.has(candidate)) {
    suffix += 1;
    candidate = `${withParent}-${suffix}`;
  }
  used.add(candidate);
  return candidate;
}

function profileFor(link: MenuLinkRecord) {
  const profile = topics[keyFor(link.parent, link.label)];
  if (!profile) throw new Error(`Missing editorial profile for ${keyFor(link.parent, link.label)}`);
  return profile;
}

async function readMenuLinks() {
  const sections = await prisma.menuSection.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
    include: {
      groups: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            where: { isVisible: true },
            orderBy: { sortOrder: "asc" },
            include: {
              links: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  return sections.flatMap((section) => section.groups.flatMap((group) => group.items.flatMap((item) => item.links.map((link) => ({
    id: link.id,
    label: link.label,
    href: link.href,
    sortOrder: link.sortOrder,
    parent: item.label,
    groupKey: group.key,
    groupLabel: group.label,
    sectionKey: section.key,
    sectionLabel: section.label,
  } satisfies MenuLinkRecord)))));
}

async function removeUntouchedSeedPosts() {
  const rows = await prisma.blogPost.findMany({
    where: { slug: { in: legacySeedSlugs } },
    select: { id: true, slug: true, revisions: { select: { createdBy: true } } },
  });
  const removable = rows.filter((row) => row.revisions.length > 0 && row.revisions.every((revision) => revision.createdBy === "seed"));
  if (!removable.length) return [];
  await prisma.$transaction(removable.map((row) => prisma.blogPost.delete({ where: { id: row.id } })));
  return removable.map((row) => row.slug);
}

function snapshotFor(input: {
  slug: string;
  category: string;
  author: string;
  readTimeMinutes: number;
  coverTone: string;
  coverNote: string;
  coverNumber: string;
  bodyHtml: string;
  bodyJson: Prisma.InputJsonValue;
  keywords: string[];
  seoTitle: string;
  seoDescription: string;
  title: string;
  subtitle: string;
  intro: string;
  atAGlance: string;
  services: Array<{ serviceKey: string; label: string; href: string; isPrimary: boolean; sortOrder: number }>;
}) {
  return {
    slug: input.slug,
    category: input.category,
    author: input.author,
    readTimeMinutes: input.readTimeMinutes,
    coverTone: input.coverTone,
    coverNote: input.coverNote,
    coverNumber: input.coverNumber,
    coverMediaId: null,
    sidebarVideoUrl: null,
    sidebarVideoId: null,
    sidebarVideoTitle: null,
    isFeatured: false,
    noIndex: false,
    canonicalUrl: null,
    translations: [{
      locale: "en",
      title: input.title,
      subtitle: input.subtitle,
      intro: input.intro,
      atAGlance: input.atAGlance,
      bodyHtml: input.bodyHtml,
      bodyJson: input.bodyJson,
      keywords: input.keywords,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      coverAlt: `${input.title} cover`,
      coverCaption: null,
    }],
    services: input.services,
  };
}

async function saveBatch(batch: MenuLinkRecord[], baseSortOrder: number, usedSlugs: Set<string>) {
  return prisma.$transaction(async (transaction) => {
    const outcomes: Array<{ label: string; status: "created" | "updated" | "unchanged" | "skipped"; slug: string }> = [];
    for (const [batchIndex, link] of batch.entries()) {
      const detail = profileFor(link);
      const category = categoryFor(link.sectionKey);
      const rawBody = renderBody(link, detail);
      const bodyHtml = sanitizeBlogHtml(rawBody);
      const bodyJson = blogContentJson(bodyHtml) as unknown as Prisma.InputJsonValue;
      const readTimeMinutes = estimateReadTime(bodyHtml.replace(/<style[\s\S]*?<\/style>/gi, ""));
      const seoTitle = makeSeoTitle(detail.title);
      const seoDescription = clipDescription(detail.subtitle);
      const serviceHref = safeHref(link.href);
      const services = [{ serviceKey: link.id, label: link.label, href: serviceHref, isPrimary: true, sortOrder: 0 }];
      const snapshot = snapshotFor({
        slug,
        category,
        author: "Limex Editorial",
        readTimeMinutes,
        coverTone: toneFor(link.sectionKey),
        coverNote: `${link.label} · practical guide`,
        coverNumber: String(baseSortOrder + batchIndex + 1).padStart(2, "0"),
        bodyHtml,
        bodyJson,
        keywords: detail.keywords,
        seoTitle,
        seoDescription,
        title: detail.title,
        subtitle: detail.subtitle,
        intro: detail.intro,
        atAGlance: detail.what,
        services,
      });
      const includeExisting = {
        translations: true,
        services: true,
        revisions: { select: { createdBy: true } },
      } as const;
      // The menu-link relationship is the importer’s stable identity. This
      // keeps reruns idempotent even when the generated slug rules change.
      const existingByMenuLink = await transaction.blogPost.findFirst({
        where: { services: { some: { serviceKey: link.id } } },
        include: includeExisting,
      });
      const slug = existingByMenuLink?.slug ?? slugFor(link, usedSlugs);
      const existing = existingByMenuLink ?? await transaction.blogPost.findUnique({
        where: { slug },
        include: includeExisting,
      });

      if (!existing) {
        await transaction.blogPost.create({
          data: {
            slug,
            publishedSlug: slug,
            category,
            author: "Limex Editorial",
            readTimeMinutes,
            coverTone: toneFor(link.sectionKey),
            coverNote: `${link.label} · practical guide`,
            coverNumber: String(baseSortOrder + batchIndex + 1).padStart(2, "0"),
            status: "PUBLISHED",
            isFeatured: false,
            noIndex: false,
            revision: 1,
            publishedRevision: 1,
            publishedSnapshot: snapshot as unknown as Prisma.InputJsonValue,
            publishedAt: new Date(),
            sortOrder: baseSortOrder + batchIndex,
            translations: {
              create: [{
                locale: "en",
                title: detail.title,
                subtitle: detail.subtitle,
                intro: detail.intro,
                atAGlance: detail.what,
                bodyHtml,
                bodyJson,
                keywords: detail.keywords as unknown as Prisma.InputJsonValue,
                seoTitle,
                seoDescription,
                coverAlt: `${detail.title} cover`,
              }],
            },
            services: { create: services },
            revisions: { create: { version: 1, kind: "PUBLISHED", snapshot: snapshot as unknown as Prisma.InputJsonValue, createdBy: BLOG_IMPORT_ACTOR } },
          },
        });
        outcomes.push({ label: link.label, status: "created", slug });
        continue;
      }

      const ownedByImporter = existing.revisions.length > 0 && existing.revisions.every((revision) => revision.createdBy === BLOG_IMPORT_ACTOR);
      if (!ownedByImporter) {
        outcomes.push({ label: link.label, status: "skipped", slug });
        continue;
      }

      const currentTranslation = existing.translations.find((translation) => translation.locale === "en");
      const unchanged = existing.status === "PUBLISHED"
        && existing.publishedRevision === existing.revision
        && existing.category === category
        && existing.author === "Limex Editorial"
        && existing.readTimeMinutes === readTimeMinutes
        && existing.coverTone === toneFor(link.sectionKey)
        && existing.coverNote === `${link.label} · practical guide`
        && currentTranslation?.title === detail.title
        && currentTranslation.subtitle === detail.subtitle
        && currentTranslation.bodyHtml === bodyHtml
        && JSON.stringify(currentTranslation.keywords) === JSON.stringify(detail.keywords);
      if (unchanged) {
        outcomes.push({ label: link.label, status: "unchanged", slug });
        continue;
      }

      const nextRevision = existing.revision + 1;
      await transaction.blogPost.update({
        where: { id: existing.id },
        data: {
          slug,
          publishedSlug: slug,
          category,
          author: "Limex Editorial",
          readTimeMinutes,
          coverTone: toneFor(link.sectionKey),
          coverNote: `${link.label} · practical guide`,
          coverNumber: existing.coverNumber ?? String(baseSortOrder + batchIndex + 1).padStart(2, "0"),
          status: "PUBLISHED",
          noIndex: false,
          revision: nextRevision,
          publishedRevision: nextRevision,
          publishedSnapshot: snapshot as unknown as Prisma.InputJsonValue,
          publishedAt: existing.publishedAt ?? new Date(),
          translations: {
            deleteMany: {},
            create: [{
              locale: "en",
              title: detail.title,
              subtitle: detail.subtitle,
              intro: detail.intro,
              atAGlance: detail.what,
              bodyHtml,
              bodyJson,
              keywords: detail.keywords as unknown as Prisma.InputJsonValue,
              seoTitle,
              seoDescription,
              coverAlt: `${detail.title} cover`,
            }],
          },
          services: {
            deleteMany: {},
            create: services,
          },
          revisions: { create: { version: nextRevision, kind: "PUBLISHED", snapshot: snapshot as unknown as Prisma.InputJsonValue, createdBy: BLOG_IMPORT_ACTOR } },
        },
      });
      outcomes.push({ label: link.label, status: "updated", slug });
    }
    return outcomes;
  });
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const cleanSeed = process.argv.includes("--clean-seed");
  const links = await readMenuLinks();
  if (!links.length) throw new Error("No visible menu links found. Run the menu migration and seed first.");
  if (links.length !== EXPECTED_MENU_LINKS) console.warn(`Expected ${EXPECTED_MENU_LINKS} menu links, found ${links.length}; importing every visible link found.`);

  const missing = links.map((link) => keyFor(link.parent, link.label)).filter((key) => !topics[key]);
  if (missing.length) throw new Error(`Missing editorial profiles (${missing.length}): ${missing.join(", ")}`);

  const existingSlugs = new Set((await prisma.blogPost.findMany({ select: { slug: true } })).map((row) => row.slug));
  const existingSlugByMenuLink = new Map((await prisma.blogPostService.findMany({
    where: { serviceKey: { in: links.map((link) => link.id) } },
    select: { serviceKey: true, post: { select: { slug: true } } },
  })).map((row) => [row.serviceKey, row.post.slug] as const));
  if (dryRun) {
    const plannedSlugs = new Set(existingSlugs);
    const planned = links.map((link) => ({ link, slug: existingSlugByMenuLink.get(link.id) ?? slugFor(link, plannedSlugs) }));
    console.log(JSON.stringify({ links: links.length, batches: Math.ceil(links.length / BATCH_SIZE), planned: planned.map(({ link, slug }) => ({ label: link.label, parent: link.parent, category: categoryFor(link.sectionKey), slug })) }, null, 2));
    return;
  }

  if (cleanSeed) {
    const removed = await removeUntouchedSeedPosts();
    if (removed.length) console.log(`Removed untouched bundled seed articles: ${removed.join(", ")}`);
  }

  // Refresh after optional cleanup so generated slugs never collide with any
  // existing article, including an article that was not part of the importer.
  const usedSlugs = new Set((await prisma.blogPost.findMany({ select: { slug: true } })).map((row) => row.slug));

  const maxExisting = await prisma.blogPost.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  const baseSortOrder = (maxExisting?.sortOrder ?? -1) + 1;
  let completed = 0;
  for (let start = 0; start < links.length; start += BATCH_SIZE) {
    const batch = links.slice(start, start + BATCH_SIZE);
    const batchNumber = Math.floor(start / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(links.length / BATCH_SIZE);
    console.log(`\nBatch ${batchNumber}/${totalBatches} · ${batch.length} articles`);
    const results = await saveBatch(batch, baseSortOrder + start, usedSlugs);
    for (const result of results) console.log(`  ${result.status.padEnd(9)} ${result.label} → /blog/${result.slug}`);
    completed += results.length;
  }
  const finalCount = await prisma.blogPost.count({ where: { status: "PUBLISHED" } });
  console.log(`\nImported ${completed} menu-link articles in ${Math.ceil(links.length / BATCH_SIZE)} batches. Published article count: ${finalCount}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
