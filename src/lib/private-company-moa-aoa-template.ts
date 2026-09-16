import {
  defaultTemplateSettings,
  type DocumentTemplateDraft,
  type TemplateBlock,
  type TemplateField,
  type TemplatePage,
  type TemplateRepeater,
  type TemplateSettings,
} from "./document-templates";

const privateCompanyMinPeople = 2;
const privateCompanyMaxPeople = 8;

function field(
  id: string,
  key: string,
  label: string,
  type: TemplateField["type"],
  placeholder: string,
  required = true,
): TemplateField {
  return { id, key, label, type, required, placeholder, options: [] };
}

function countField(
  id: string,
  key: string,
  label: string,
): TemplateField {
  return {
    id,
    key,
    label,
    type: "select",
    required: true,
    placeholder: "",
    defaultValue: String(privateCompanyMinPeople),
    options: Array.from(
      { length: privateCompanyMaxPeople - privateCompanyMinPeople + 1 },
      (_, index) => {
        const value = String(privateCompanyMinPeople + index);
        return { value, label: `${value} ${Number(value) === 1 ? "person" : "people"}` };
      },
    ),
  };
}

function text(
  id: string,
  type: "title" | "heading" | "paragraph",
  content: string,
  options: Partial<Extract<TemplateBlock, { type: "title" | "heading" | "paragraph" }>> = {},
): TemplateBlock {
  return {
    id,
    type,
    text: content,
    align: type === "title" ? "center" : "left",
    bold: type !== "paragraph",
    italic: false,
    fontSize: type === "title" ? "title" : "legal",
    ...options,
  };
}

function clauseHeading(id: string, content: string): TemplateBlock {
  return text(id, "paragraph", content, {
    align: "center",
    bold: true,
    fontSize: "legal",
  });
}

function spacer(id: string, height: number): TemplateBlock {
  return { id, type: "spacer", height };
}

function signature(id: string, label: string, repeat?: Extract<TemplateBlock, { type: "signature" }>["repeat"]): TemplateBlock {
  return { id, type: "signature", label, ...(repeat ? { repeat } : {}) };
}

function page(
  number: number,
  title: string,
  blocks: TemplateBlock[],
  settings: TemplatePage["settings"] = {},
): TemplatePage {
  const prefix = `private-company-moa-aoa-page-${number}`;
  return {
    id: prefix,
    title,
    settings,
    blocks: blocks.map((block, index) => ({ ...block, id: `${prefix}-block-${index}` })),
  };
}

function directorRepeater(): TemplateRepeater {
  return {
    id: "private-company-directors",
    key: "directors",
    label: "First directors",
    itemLabel: "Director",
    description: "Starts at two directors and supports up to eight. Only the selected director count appears in the document.",
    countFieldKey: "director_count",
    minItems: privateCompanyMinPeople,
    maxItems: privateCompanyMaxPeople,
    fields: [
      field("private-company-director-name", "name", "Full legal name", "text", "Director’s full legal name"),
      field("private-company-director-details", "details", "Identity and address", "textarea", "Father or spouse, NID or passport, nationality and address", false),
      field("private-company-director-role", "role", "Role or designation", "text", "Director", false),
    ],
  };
}

function subscriberRepeater(): TemplateRepeater {
  return {
    id: "private-company-subscribers",
    key: "subscribers",
    label: "Subscribers",
    itemLabel: "Subscriber",
    description: "Starts at two subscribers and supports up to eight. Each selected subscriber receives a signature line on the execution page.",
    countFieldKey: "subscriber_count",
    minItems: privateCompanyMinPeople,
    maxItems: privateCompanyMaxPeople,
    fields: [
      field("private-company-subscriber-name", "name", "Full legal name", "text", "Subscriber’s full legal name"),
      field("private-company-subscriber-address", "address", "Address", "textarea", "Full address", false),
      field("private-company-subscriber-occupation", "occupation", "Occupation", "text", "Occupation", false),
      field("private-company-subscriber-shares", "shares", "Number of shares", "number", "Number of shares subscribed"),
    ],
  };
}

function privateCompanySettings(): TemplateSettings {
  return {
    ...defaultTemplateSettings,
    icon: "building",
    paperSize: "A4",
    marginTop: 12,
    marginRight: 13,
    marginBottom: 12,
    marginLeft: 13,
    stampGap: 0,
    showPageNumbers: false,
    fontFamily: "serif",
    defaultFontSize: "legal",
    fontScale: 100,
    serviceCta: { ...defaultTemplateSettings.serviceCta },
    repeaters: [directorRepeater(), subscriberRepeater()],
  };
}

const companyFields: TemplateField[] = [
  field("private-company-name", "company_name", "Proposed company name", "text", "Full proposed name"),
  field("private-company-date", "execution_date", "Execution date", "date", ""),
  field("private-company-office", "registered_office", "Registered office in Bangladesh", "textarea", "Full registered office address"),
  field("private-company-capital", "authorised_capital", "Authorised capital (BDT)", "number", "4000000"),
  field("private-company-capital-words", "authorised_capital_words", "Authorised capital in words", "text", "Forty lakh taka"),
  field("private-company-share-count", "share_count", "Number of ordinary shares", "number", "40000"),
  field("private-company-share-value", "share_value", "Nominal value per share (BDT)", "number", "100"),
  field("private-company-share-value-words", "share_value_words", "Nominal share value in words", "text", "One hundred taka"),
  field("private-company-objects", "additional_objects", "Additional business objects (optional)", "textarea", "Add any company-specific object clauses that should appear after the source draft clauses.", false),
  countField("private-company-director-count", "director_count", "Number of first directors"),
  field("private-company-chairman", "chairman_name", "First Chairman", "text", "Full legal name"),
  field("private-company-md", "managing_director_name", "First Managing Director", "text", "Full legal name"),
  field("private-company-bank-rule", "bank_operation_rule", "Bank-account operating rule", "textarea", "For example: jointly by the Managing Director and any two Directors", false),
  countField("private-company-subscriber-count", "subscriber_count", "Number of subscribers"),
  field("private-company-witness-one", "witness_one", "Witness 1", "textarea", "Full name, address and occupation"),
  field("private-company-witness-two", "witness_two", "Witness 2", "textarea", "Full name, address and occupation"),
];

const memorandumPages: TemplatePage[] = [
  page(1, "Cover", [
    spacer("cover-top-space", 110),
    text("cover-act", "title", "THE COMPANIES ACT, 1994", { fontSize: "subtitle" }),
    text("cover-act-number", "paragraph", "(ACT XVIII OF 1994)", { align: "center", bold: true, fontSize: "small" }),
    spacer("cover-company-space", 78),
    text("cover-company-type", "title", "A PRIVATE COMPANY LIMITED BY SHARES", { fontSize: "subtitle" }),
    spacer("cover-moa-space", 78),
    text("cover-moa", "title", "MEMORANDUM OF ASSOCIATION", { fontSize: "subtitle" }),
    text("cover-and", "paragraph", "AND", { align: "center", bold: true, fontSize: "legal" }),
    text("cover-aoa", "title", "ARTICLES OF ASSOCIATION", { fontSize: "subtitle" }),
    text("cover-of", "paragraph", "OF", { align: "center", bold: true, fontSize: "legal" }),
    spacer("cover-name-space", 44),
    text("cover-company-name", "title", "{{company_name}}", { fontSize: "subtitle" }),
  ]),
  page(2, "Memorandum of Association", [
    text("moa-act", "paragraph", "THE COMPANIES ACT, 1994\n(ACT XVIII OF 1994)\n(A PRIVATE COMPANY LIMITED BY SHARES)", { align: "center", bold: true, fontSize: "legal" }),
    text("moa-title", "title", "MEMORANDUM OF ASSOCIATION", { fontSize: "subtitle" }),
    text("moa-of", "paragraph", "OF {{company_name}}", { align: "center", bold: true, fontSize: "legal" }),
    text("moa-name", "paragraph", "The name of the company is {{company_name}}.", { bold: false }),
    text("moa-office", "paragraph", "I. The registered office of the company shall be situated at {{registered_office}}, Bangladesh.", { bold: false }),
    text("moa-objects-intro", "paragraph", "II. The objects for which the Company is established are all the objects that will be implemented after obtaining the necessary permission from the Government, concerned authority or competent authority before commencement of business:", { bold: false }),
    text("moa-object-one", "paragraph", "1. To carry on the business of manufacturing, producing, processing, importing, exporting, buying, selling, distributing and otherwise dealing in all kinds of detergent products, washing powder, liquid detergents, laundry soap, bath soap, beauty soap and other personal-care and household-cleansing products, cleaning agents, mosquito coils, repellents and pest-control products; and to act as manufacturer, producer, developer, supplier, distributor, trader, agent or representative thereof in both local and international markets; and also to carry on the business of direct marketing, clinic, real estate and housing-society development, social work, garments manufacturing and trading, super shop, agro-based business, fisheries, poultry farm, information-technology services, car servicing, salon and beauty parlour, training centre, sale and repair of electric and electronic items and mobile accessories, Ayurvedic and herbal treatment, transport service and courier service within Bangladesh and abroad.", { bold: false }),
    text("moa-object-two", "paragraph", "2. To engage in general trading, commission agency, indenting, wholesaling, retailing, marketing, distribution, supply and commercial business in Bangladesh and abroad. To carry on the business of manufacturing, processing, preserving, importing, exporting, buying, selling and dealing in all kinds of consumer food items, beverages, drinks, mineral water, bakery items, agro-processed foods and allied consumer products. To establish and carry on pharmaceutical industries and to manufacture, formulate, process, import, export, buy, sell and deal in medicines, drugs, pharmaceutical products, healthcare products, medical equipment and allied products subject to permission of the concerned authorities. To carry on the business of fish farming, hatchery operation, aquaculture, breeding, cultivation, preservation, processing and marketing of fish and other aquatic species and products.", { bold: false }),
  ]),
  page(3, "Memorandum Objects", [
    clauseHeading("moa-objects-heading", "MEMORANDUM OF ASSOCIATION — OBJECTS"),
    text("moa-object-three", "paragraph", "3. To carry on the business of garments, manufacturing, processing, importing, exporting, buying, selling and dealing in agro-based seeds, fertilizers, pesticides, insecticides, fungicides, herbicides, agricultural medicines, agricultural chemicals and all kinds of agro-based products and chemicals. To acquire, establish, construct, lease, hire or otherwise obtain factories, warehouses, workshops, laboratories, godowns, offices, showrooms and other facilities necessary for carrying out the business of the Company. To provide consultancy, advisory, research, training, technical and support services in the fields of agriculture, fisheries, aquaculture, agro-processing and agro-based industries, including modern farming techniques and sustainable agricultural practices. To establish, operate and maintain agro-based industries, processing plants, hatcheries, laboratories, research centers and other facilities necessary for the development and promotion of the agriculture and fisheries sector.", { bold: false }),
    text("moa-object-four", "paragraph", "4. To carry on the business of civil engineering works including planning, design, consultancy, construction, erection, development, renovation and maintenance of all kinds of infrastructure and real-estate projects including buildings, apartments, residential and commercial complexes, roads, bridges, culverts and other structures; to act as builders, engineers, architects, contractors and developers; to undertake piling works, pile-cap works, excavation, soil development and heavy construction-equipment rental services. To carry on real-estate development including acquisition, purchase, sale, lease and exchange of land and properties; to construct, develop and deal in flats, apartments, markets, shopping complexes, community centers and other infrastructure; and to manufacture, produce, formulate, process and market building chemicals, waterproofing compounds, construction materials and allied products.", { bold: false }),
  ]),
  page(4, "Memorandum Objects Continued", [
    clauseHeading("moa-objects-heading-two", "MEMORANDUM OF ASSOCIATION — OBJECTS CONTINUED"),
    text("moa-object-five", "paragraph", "5. To import, export, produce, manufacture and distribute products, edible and human-consumable items, goods and related products; and to supply, export and distribute those products to entities in Bangladesh and abroad. To establish housing estates or model complexes and apartments. To act as consultants for surveying, mapping, drawing, engineering design, architectural design, interior and exterior design, urban and rural planning and civil-engineering consultancy. To carry on the business of general trading, export and import of all commercially permissible items, dealers, indenters, brokers, manufacturing, contracting, general supply, buying and selling agency, wholesale and distributorship dealings in general and special products, tools, machinery, weighing machines, cars and accessories, electronic goods, food, dress, garments accessories, cloths, seafood, stationeries, computers, computer accessories, plastic accessories and internet-related products.", { bold: false }),
    text("moa-object-six", "paragraph", "6. To carry on business as software development, e-commerce, outsourcing, IT consultancy, IT services, developers, designers, buyers, sellers, importers, exporters and dealers in all kinds of software, computer software, computer technology and information-technology products. To carry on business as manufacturer, producer, trader, dealer, wholesaler, retailer, importer, exporter or merchant in electronic gadgets, mobile-phone and computer accessories, networking equipment, security and protection equipment, digital camera and photo accessories, video games and accessories, speakers, laundry appliances, electrical and electronic supplies and instruments, hardware tools, circuit breakers, air-conditioning appliances, refrigerators and freezers, water heaters, water-treatment appliances and other consumer electronics and electrical goods; and to carry on general trading, export and import, agro business, online shop, perfume brand, travel agency, manpower, IT institute, training centre, food business, organic products and organic food business.", { bold: false }),
  ]),
  page(5, "Memorandum Capital and Liability", [
    clauseHeading("moa-objects-heading-three", "MEMORANDUM OF ASSOCIATION — OBJECTS CONTINUED"),
    text("moa-object-seven", "paragraph", "7. To act or negotiate on behalf of Government, Semi-Government, Autonomous and Private sectors as well as foreign investors by legally permissible means. The Company may provide them the services they require, such as land-development works, plotting for housing estates or model complexes or apartments, publishing readymade software including operating systems, business and other applications, computer games for all platforms, consultancy and advice in designing, developing, installing, implementing and operating all kinds of software and information-technology projects, technical services, freelancing services, business-transformation projects and assistance for start-up, commencement and expansion programmes; and to act as technical and software-development consultants in Bangladesh and abroad. This Company may carry on any lawful business for making profit.", { bold: false }),
    text("moa-object-eight", "paragraph", "8. To attain the business objectives, the Company may enter into partnership or joint venture, take over or amalgamate with any other company and take loans from banks or other financial institutions in Bangladesh or abroad in such manner as the Company thinks fit.", { bold: false }),
    text("moa-object-nine", "paragraph", "9. To mortgage the property and assets of the Company as security for loans and/or credit facilities given to any associate company, companies or third party, and to guarantee liabilities of such associate company, companies and/or third party.", { bold: false }),
    text("moa-additional-objects", "paragraph", "Additional company-specific objects:\n{{additional_objects}}", { bold: false, visibleWhen: { fieldKey: "additional_objects" } }),
    text("moa-liability", "paragraph", "IV. The liability of the members of the Company is limited by shares.", { bold: false }),
    text("moa-capital", "paragraph", "V. The authorised share capital of the Company is BDT {{authorised_capital}} ({{authorised_capital_words}}), divided into {{share_count}} ordinary shares of BDT {{share_value}} ({{share_value_words}}) each, with power to increase or reduce the capital and to divide the share capital into different classes and attach thereto any special right, privilege or condition regarding dividends, repayment of capital, voting or otherwise, or to consolidate or sub-divide the shares.", { bold: false }),
  ]),
];

const articlesPages: TemplatePage[] = [
  page(6, "Articles Cover", [
    spacer("aoa-cover-top-space", 158),
    text("aoa-cover-act", "title", "THE COMPANIES ACT, 1994", { fontSize: "subtitle" }),
    text("aoa-cover-act-number", "paragraph", "(ACT XVIII OF 1994)\n(A PRIVATE COMPANY LIMITED BY SHARES)", { align: "center", bold: true, fontSize: "legal" }),
    spacer("aoa-cover-title-space", 94),
    text("aoa-cover-title", "title", "ARTICLES OF ASSOCIATION", { fontSize: "subtitle" }),
    text("aoa-cover-of", "paragraph", "OF", { align: "center", bold: true, fontSize: "legal" }),
    spacer("aoa-cover-name-space", 42),
    text("aoa-cover-company", "title", "{{company_name}}", { fontSize: "subtitle" }),
  ]),
  page(7, "Articles 1 to 3", [
    clauseHeading("aoa-preliminary", "PRELIMINARY"),
    text("aoa-article-one", "paragraph", "1. The Regulations contained in Schedule 1 of the Companies Act XVIII of 1994 shall apply to this Company with respect to provisions applicable to a private limited company so far only as they are not negative or modified by, or are not contained in, the following Articles or any other Articles that may from time to time be framed by the Company or by any statute.", { bold: false }),
    clauseHeading("aoa-interpretation", "INTERPRETATION"),
    text("aoa-article-two", "paragraph", "2. Unless the context otherwise requires, words or expressions contained in these Articles shall bear the same meaning as in the Act or any statutory modification thereof in force at the date at which these Articles, or any other Articles from time to time framed by the Company, apply. In these presents, unless there is something in the subject or context inconsistent therewith: “The Act” means the Companies Act, 1994. “The Company” means {{company_name}}. “The Directors” means the Directors for the time being of the Company. “The Board of Directors” or “the Board” means the Board of Directors for the time being of the Company. “The Managing Director” means the Managing Director appointed as such for the time being of the Company. “The Office” means the Registered Office for the time being of the Company.", { bold: false }),
    text("aoa-article-three", "paragraph", "3. “Register” means the Register of Members to be kept pursuant to section 34 of the Act. “The Registrar” means the Registrar of Joint Stock Companies, Bangladesh. “Dividend” includes bonus. “Month” means calendar month. “Seal” means the Common Seal of the Company. “Proxy” includes an attorney duly constituted under a power of attorney. “In Writing” and “Written” include printing, lithography and other modes of representing or reproducing words in visible form. Words importing the singular include the plural and vice versa; words importing the masculine include the feminine and vice versa; and words importing persons include corporations and companies.", { bold: false }),
  ]),
  page(8, "Articles 4 to 6", [
    clauseHeading("aoa-private-company", "PRIVATE COMPANY"),
    text("aoa-article-four", "paragraph", "4. The Company is a private limited company within the meaning of section 2(i), clause (ta), of the Companies Act, 1994 and accordingly: (i) no invitation shall be issued to the public to subscribe for any share or debenture of the Company; (ii) the number of members of the Company, exclusive of persons in employment of the Company, shall be limited to fifty, provided that two or more persons holding one or more shares jointly shall be treated as a single member; and (iii) the right to transfer shares of the Company shall be restricted in the manner hereinafter appearing.", { bold: false }),
    clauseHeading("aoa-business", "BUSINESS"),
    text("aoa-article-five", "paragraph", "5. The business of the Company may be commenced as soon after incorporation as the Board shall think fit.", { bold: false }),
    clauseHeading("aoa-share-capital", "SHARE CAPITAL"),
    text("aoa-article-six", "paragraph", "6. The authorised share capital of the Company is BDT {{authorised_capital}} ({{authorised_capital_words}}), divided into {{share_count}} ordinary shares of BDT {{share_value}} ({{share_value_words}}) each, with power to increase or reduce the capital and to divide the share capital into different classes and attach thereto any special right or privilege or condition regarding dividends, repayment of capital, voting or otherwise, or to consolidate or sub-divide the shares. Subject to these Articles, the shares shall be under the control of the Directors, who may allot or otherwise dispose of them.", { bold: false }),
  ]),
  page(9, "Articles 7 to 10", [
    clauseHeading("aoa-calls", "CALL ON AND FORFEITURE"),
    text("aoa-article-seven", "paragraph", "7. The joint holders of shares shall be individually as well as jointly liable for the payment of any call or instalment due in respect of the shares held by them. The Directors may from time to time make calls upon members in respect of money remaining unpaid on shares held by them, and no call shall be less than twenty-five percent of the nominal value of the share. Each member shall receive fourteen days’ notice of the time and place of payment. If the notice is not complied with, any share in respect of which it was given may thereafter be forfeited by a resolution of the Board of Directors.", { bold: false }),
    text("aoa-article-eight", "paragraph", "8. A forfeited share may be sold or otherwise disposed of in such manner as the Directors think fit and, at any time before sale or disposal, the forfeiture may be cancelled on such terms and conditions as the Directors think fit.", { bold: false }),
    clauseHeading("aoa-share-certificate", "SHARE CERTIFICATE"),
    text("aoa-article-nine", "paragraph", "9. Every person whose name is entered in the Register of Members shall be entitled to one or more share certificates issued under the common seal of the Company, specifying the number of shares held and the amount paid thereon. In respect of shares held jointly, the Company is not bound to issue more than one certificate and delivery to one of the joint holders, preferably the holder whose name stands first in the Register of Members, shall be sufficient delivery to all. A defaced, lost or destroyed certificate may be reissued on such terms and conditions as the Directors think fit.", { bold: false }),
    clauseHeading("aoa-transfer", "TRANSFER AND TRANSMISSION OF SHARES"),
    text("aoa-article-ten", "paragraph", "10. Shares of the Company shall be transferred in the usual common form or any other form approved by the Directors. The instrument of transfer shall be executed by both transferor and transferee and lodged at the registered office with the share certificate. The transferor shall be deemed to remain the holder until the transferee’s name is entered in the Register of Members. The legal heirs, successors, executors, administrators or assigns of a deceased sole holder shall be the only persons recognized by the Company as having title to the share.", { bold: false }),
  ]),
  page(10, "Articles 11 to 14", [
    text("aoa-article-eleven", "paragraph", "11. Any person entitled to a share in consequence of the death or insolvency of a member shall, upon producing such evidence as the Directors may require, have the right to be registered as a member in respect of that share. Any share may, subject to approval of the Directors, be transferred by a member to that member’s spouse, son, daughter, father, mother or brother.", { bold: false }),
    text("aoa-article-twelve", "paragraph", "12. Subject to the preceding provisions, shares of the Company shall not be transferred by a member to any person so long as a member or another person selected by the Directors is willing to purchase them at a reasonable price fixed mutually by transferor and transferee. The Directors may decline to register a transfer of shares to a person whom they do not approve for a reason appearing to them just and proper in the interest of the Company, and are not bound to disclose or assign that reason.", { bold: false }),
    clauseHeading("aoa-increase-capital", "INCREASE OF SHARE CAPITAL"),
    text("aoa-article-thirteen", "paragraph", "13. The Directors may, with the sanction of an ordinary resolution of the Company previously passed in general meeting, increase share capital by issuing new shares. The increase shall be of such amount and divided into shares of such respective value as the Company in meeting may direct and, if no direction is given, as the Directors think fit.", { bold: false }),
    clauseHeading("aoa-borrowing", "BORROWING POWERS"),
    text("aoa-article-fourteen", "paragraph", "14. The Directors may from time to time borrow from any source any sum required for the purposes of the Company and raise and secure payment in such manner and upon such terms and conditions as they think fit, including by the issue of shares, making, drawing, accepting or endorsing promissory notes or bills of exchange, issuing securities, or creating a mortgage, charge or hypothecation over any property of the Company, present or future, including uncalled capital. The Directors may on behalf of the Company guarantee the whole or any part of loans or debts incurred by the Company and secure a guarantor against liability in respect of those loans or debts.", { bold: false }),
  ]),
  page(11, "Articles 15 to 18", [
    clauseHeading("aoa-general-meeting", "GENERAL MEETING"),
    text("aoa-article-fifteen", "paragraph", "15. The first ordinary general meeting of the Company shall be held within eighteen months from the date of incorporation and thereafter once in every calendar year, at a time not more than fifteen months after the last preceding general meeting and at such time and place as the Directors determine. All other meetings of the Company shall be called extraordinary general meetings.", { bold: false }),
    text("aoa-article-sixteen", "paragraph", "16. The Directors may at any time call an annual general meeting. An extraordinary general meeting may also be called by shareholders on requisition in accordance with section 84 of the Companies Act, 1994. The Board of Directors may, whenever it thinks necessary, call an extraordinary general meeting at such time and place as it thinks fit.", { bold: false }),
    clauseHeading("aoa-proceedings", "PROCEEDINGS AT GENERAL MEETING"),
    text("aoa-article-seventeen", "paragraph", "17. The business of the ordinary general meeting shall be to receive and consider profit and loss accounts, the balance sheet and the reports of Directors and Auditors; appoint Auditors; elect Directors; declare dividends; and transact any other business which ought to be transacted by the Company. At any general meeting, a resolution put to vote shall be decided by show of hands or by poll. An entry to that effect in the book of proceedings of the Company shall be conclusive evidence of the facts without proof of the number or proportion of votes recorded in favour of or against the resolution.", { bold: false }),
    text("aoa-article-eighteen", "paragraph", "18. The Chairperson of the meeting elected by members present may, with the consent of members, adjourn the meeting from time to time and from place to place, but no business shall be transacted at an adjourned meeting other than business left unfinished at the meeting from which the adjournment took place. No business shall be transacted at any general meeting unless there is a quorum, and the meeting shall stand adjourned until such time as the members present decide.", { bold: false }),
  ]),
  page(12, "Articles 19 to 22", [
    clauseHeading("aoa-quorum-agm", "QUORUM AT GENERAL MEETING"),
    text("aoa-article-nineteen", "paragraph", "19. Two members present in person or by proxy shall form a quorum at any general meeting. The members present shall elect one among themselves to act as Chairperson of the meeting. The Chairperson so elected shall preside over the meeting and, in the case of equality of votes, shall have a second or casting vote.", { bold: false }),
    clauseHeading("aoa-quorum-board", "QUORUM AT BOARD MEETING"),
    text("aoa-article-twenty", "paragraph", "20. Two members present in person and qualified to vote shall form a quorum. Whenever the Board of Directors thinks it necessary, it may call a general meeting, whether ordinary or extraordinary, at such time, subject to section 84 of the Act, and place as the Board thinks fit.", { bold: false }),
    clauseHeading("aoa-vote", "VOTE OF MEMBERS"),
    text("aoa-article-twenty-one", "paragraph", "21. On a show of hands every member present in person and entitled to vote shall have one vote and, upon a poll, every member present in person or by proxy or power of attorney shall have one vote in respect of every share held. On a poll, a vote may be given personally, by proxy, under power of attorney or by a person appointed under section 86 of the Companies Act, 1994. A proxy must be a member of the Company. No member shall be entitled to vote at any general meeting unless all calls or other sums presently payable by that member to the Company in respect of shares held have been paid.", { bold: false }),
    text("aoa-article-twenty-two", "paragraph", "22. Any person entitled under the transmission clause to the transfer of a share may vote at any general meeting in the same manner as if registered holder, provided that at least forty-eight hours before the meeting or adjourned meeting at which that person proposes to vote, the Directors are satisfied of that person’s rights as transferee, unless the Board of Directors or Managing Director has previously admitted that right to vote.", { bold: false }),
  ]),
  page(13, "Articles 23 and 24", [
    clauseHeading("aoa-directors", "DIRECTORS"),
    text("aoa-article-twenty-three", "paragraph", "23. Until otherwise determined by the Company in general meeting, the number of Directors shall not be less than two and not more than fifty. The following persons shall be the first and permanent Directors of the Company unless any one voluntarily resigns the office or is otherwise removed under section 108(1) of the Companies Act, 1994:", { bold: false }),
    text("aoa-director-list", "paragraph", "{{item_number}}. {{name}}\n{{details}} {{role}}", { bold: false, repeat: { repeaterKey: "directors" } }),
    clauseHeading("aoa-qualification", "QUALIFICATION OF SHARES"),
    text("aoa-article-twenty-four", "paragraph", "24. The qualification of a Director of the Company shall be holding, in that Director’s own name or in the name of the Company or shareholder represented, ordinary shares of BDT 1,000 (one thousand) in value, each share being BDT {{share_value}} ({{share_value_words}}), unless otherwise determined in accordance with law. The quorum necessary for transaction of business by the Directors may be fixed and changed by the Directors from time to time.", { bold: false }),
  ]),
  page(14, "Articles 25 to 28", [
    clauseHeading("aoa-director-powers", "POWER OF DIRECTORS"),
    text("aoa-article-twenty-five", "paragraph", "25. The control of the Company shall be vested in the Directors and the business of the Company shall ordinarily be managed by them. The Directors may pay all expenses incurred in getting up and registering the Company and may exercise all powers of the Company not forbidden by the Companies Act, 1994. The Directors shall be entitled to appoint alternate Directors under section 101 of the Companies Act, 1994.", { bold: false }),
    text("aoa-article-twenty-six", "paragraph", "26. A Director during an absence of not less than three months from the district in which meetings of the Directors are ordinarily held may, with approval of the Directors, appoint a person as alternate Director during that absence. The alternate Director shall be entitled to notice of meetings and to attend and vote accordingly. If the Managing Director remains outside Bangladesh for official or personal reasons, or is otherwise unable to perform duties due to absence or unavailability, the Board of Directors may make important or urgent decisions required for the interest and smooth operation of the Company. The control, management and administration of the Company shall be vested in the Board, which may purchase, sell, transfer, lease, mortgage, charge or otherwise dispose of property; borrow or raise loans and create security; enter material contracts; open, close or materially alter bank accounts; acquire business, assets, rights or privileges; and make decisions involving substantial financial commitment or strategic importance. The Board may delegate, vary, restrict or withdraw powers delegated to the Managing Director.", { bold: false }),
    clauseHeading("aoa-disqualification", "DISQUALIFICATION OF DIRECTORS"),
    text("aoa-article-twenty-seven", "paragraph", "27. The office of a Director shall be vacated if the Director fails to obtain or ceases to hold the share qualification required for appointment; is found to be of unsound mind by a court of competent jurisdiction; is adjudged insolvent; is absent from three consecutive meetings of Directors or from all meetings for a continuous period of three months, whichever is longer, without leave of absence; or voluntarily resigns the office.", { bold: false }),
    text("aoa-article-twenty-eight", "paragraph", "28. The Directors shall meet together for dispatch of business and may adjourn or otherwise regulate their meetings as they think fit. A meeting at which a quorum is present shall be competent to exercise powers and authorities of the Directors. Unless otherwise determined, two Directors shall form a quorum. A resolution or circular signed by all Directors shall be as valid and effectual as if passed at a duly called and constituted meeting. The Directors may call a Board meeting at any time and may elect one of them as Chairman of the Company in a vacant post.", { bold: false }),
  ]),
  page(15, "Articles 29 to 33", [
    clauseHeading("aoa-management", "MANAGEMENT"),
    text("aoa-article-twenty-nine", "paragraph", "29. Subject to supervision of the Board of Directors, the business and affairs of the Company shall be managed and conducted collectively by all Directors, with the Managing Director having executive responsibility as assigned by the Board. In the absence of the Managing Director, a Director nominated by the Board shall carry out those duties. The Board may take any other decision or make alternative management arrangements at its discretion.", { bold: false }),
    clauseHeading("aoa-chairman", "CHAIRMAN"),
    text("aoa-chairman-clause", "paragraph", "{{chairman_name}} shall be the first Chairman of the Company from the date of incorporation unless that person dies or voluntarily resigns, and shall not be liable for removal or retirement by rotation during that period. The Board may allow the Chairman to continue on such terms as it considers expedient. In the event of death, resignation or vacation, the general meeting shall appoint another person; a casual vacancy may be filled by the Board.", { bold: false }),
    clauseHeading("aoa-managing-director", "MANAGING DIRECTOR"),
    text("aoa-article-thirty-one", "paragraph", "31. {{managing_director_name}} shall be the first Managing Director of the Company from the date of incorporation and shall hold the position until voluntary resignation or disqualification under section 108(1) of the Companies Act, 1994. For services rendered, the Managing Director shall receive remuneration as salary, commission, participation in profits, or otherwise as decided by the Company in general meeting held after assumption of office.", { bold: false }),
    clauseHeading("aoa-md-powers", "POWER OF MANAGING DIRECTOR"),
    text("aoa-article-thirty-two", "paragraph", "32. Subject to direct control, supervision and approval of the Board, the Managing Director shall have general direction, management, superintendence and control of day-to-day affairs, business operations, transactions, properties and concerns of the Company in accordance with Board policies and resolutions; may acquire property, rights or privileges for the Company subject to prior Board approval; may sell, transfer, lease, exchange or dispose of assets only with prior Board approval; and may enter contracts, agreements, arrangements or understandings necessary in the ordinary course of business, subject to any approval required by these Articles or by a Board resolution.", { bold: false }),
    text("aoa-article-thirty-three", "paragraph", "33. The Managing Director may supervise business operations and operate Company bank accounts in accordance with the signing authority and banking resolutions approved by the Board; may borrow, raise money, mortgage, pledge, hypothecate and execute documents only with prior Board approval; shall not take major strategic, financial or policy decisions without prior Board approval; may receive money payable to the Company and issue valid receipts; may take lawful actions to protect Company assets and interests; may accept, make, draw, sign, endorse and negotiate negotiable instruments in accordance with authority granted by the Board; and shall perform other duties and exercise powers delegated by the Board, which may amend, restrict or withdraw them at its discretion.", { bold: false }),
  ]),
  page(16, "Corporate Administration", [
    clauseHeading("aoa-bank-account", "BANK ACCOUNT"),
    text("aoa-bank-account-clause", "paragraph", "The Company shall have authority to open, maintain and operate one or more bank accounts with scheduled banks and/or foreign banks. {{bank_operation_rule}}", { bold: false }),
    clauseHeading("aoa-fund", "FUND"),
    text("aoa-fund-clause", "paragraph", "All moneys of the Company may be kept in such places or banks as the Board of Directors directs and may be taken from there by cheque or receipt. It shall be sufficient if the cheque or receipt is signed by the Managing Director or by two Directors and bears the seal of the Company.", { bold: false }),
    clauseHeading("aoa-secrecy", "SECRECY"),
    text("aoa-secrecy-clause", "paragraph", "Directors, Managers, Secretaries, officers, Auditors, agents and other persons employed in the business of the Company shall observe strict secrecy respecting matters that come to their knowledge in discharge of their duties, when required by a resolution of the Company, a court of law, any provision of law or these Articles.", { bold: false }),
    clauseHeading("aoa-lien", "LIEN"),
    text("aoa-lien-clause", "paragraph", "The Company shall have a paramount lien on every share that is not fully paid for all money called or payable at a fixed time in respect of that share, and the Company’s lien, if any, shall extend to all dividends payable thereon.", { bold: false }),
    clauseHeading("aoa-notice", "NOTICE"),
    text("aoa-article-thirty-six", "paragraph", "36. When notice is sent by post, service shall be deemed effective by properly addressing, prepaying and posting a letter containing the notice and, unless the contrary is proved, at the time the letter would be delivered in the ordinary course of post. Notice may be given personally, by advertisement or by post to the registered address.", { bold: false }),
    text("aoa-article-thirty-seven", "paragraph", "37. The signature to any notice given by the Company may be written or printed. The Directors shall have absolute discretion as to employment of reserve funds created out of net profit of the Company. A mutual decision documented by agreement of the Chairman, Managing Director and Directors shall be required to take any bank loan or borrow anything of monetary or market value.", { bold: false }),
  ]),
  page(17, "Articles 38 to 44", [
    clauseHeading("aoa-dividend", "DIVIDEND AND RESERVE"),
    text("aoa-article-thirty-eight", "paragraph", "38. The Company in annual general meeting may declare a dividend, but no dividend shall exceed the amount recommended by the Directors and no dividend shall be paid otherwise than out of profits for the year or other undistributed profits. No dividend shall carry interest against the Company. The Directors may from time to time pay such interim dividends as they think fit and reasonable and may create reserve funds out of profits, with absolute authority as to their employment by capitalization or otherwise.", { bold: false }),
    clauseHeading("aoa-capitalization", "CAPITALIZATION OF THE RESERVE"),
    text("aoa-article-thirty-nine", "paragraph", "39. The Company in general meeting may resolve that money, investments or other assets forming part of undistributed profits and standing to the credit of reserve funds, or otherwise available for dividend, be capitalized and distributed among shareholders in the same proportion as they would receive by way of dividend, to be applied on behalf of shareholders in the Company or toward payment of uncalled liability on issued shares. Such distribution or payment shall be accepted by shareholders in full satisfaction of their interests in the capitalized sum.", { bold: false }),
    clauseHeading("aoa-accounts", "ACCOUNTS AND AUDIT"),
    text("aoa-article-forty", "paragraph", "40. The Managing Director shall cause proper books of account to be kept as provided by sections 181 to 191 of the Companies Act, 1994. An Auditor or Auditors shall be appointed by the Company and their duties regulated in accordance with sections 210 to 213 of the Companies Act, 1994 or statutory modification in force. Accounts, when audited and signed by Auditors and Directors and approved at general meeting, shall be conclusive unless an error is discovered before the audit of the next succeeding year’s accounts, in which case it shall be rectified.", { bold: false }),
    clauseHeading("aoa-arbitration", "ARBITRATION"),
    text("aoa-article-forty-one", "paragraph", "41. In accordance with section 227 of the Companies Act, 1994, any dispute arising among Directors or between a member and the Board of Directors as to the true interpretation of these Articles or their implication shall be referred to arbitrators constituted with a nominee for each agreed party, and the award of the arbitrators shall be binding. Arbitration affairs shall be dealt with and settled under the Arbitration Act, 2001.", { bold: false }),
    clauseHeading("aoa-indemnity", "INDEMNITY"),
    text("aoa-article-forty-two", "paragraph", "42. Directors, the Managing Director, Managers and other officers of the Company shall be indemnified for losses and expenditure incurred in faithful discharge of their respective duties, except for wilful acts, neglect or default. The Company shall pay from its funds losses and expenditure incurred by those persons in faithful discharge of duty. Neither Director, Managing Director, Manager nor other officer shall be liable for loss or damage arising from the tortious act of another person or from loss, damage or misfortune due to an act of Government.", { bold: false }),
    clauseHeading("aoa-amendment", "AMENDMENT OF ARTICLES"),
    text("aoa-article-forty-three", "paragraph", "43. These Articles may be amended, modified, substituted, altered or repealed by a three-fourths majority of members present, including the Chairman and Managing Director, voting on a special resolution at an extraordinary general meeting, provided that written notice specifying the intention to propose the resolution is given to members at least twenty-one days before the meeting.", { bold: false }),
    clauseHeading("aoa-winding-up", "WINDING UP"),
    text("aoa-article-forty-four", "paragraph", "44. If the Company is wound up and assets available for distribution among members are insufficient to repay the whole paid-up capital, those assets shall be distributed so that, as nearly as may be, losses are borne by members in proportion to capital paid or which ought to have been paid at commencement of winding up. If assets available for distribution among members are sufficient, they shall be distributed in proportion to capital paid or which ought to have been paid on shares held respectively, without prejudice to rights of holders of shares issued upon special terms and conditions.", { bold: false }),
  ]),
  page(18, "Subscribers and Execution", [
    text("execution-act", "paragraph", "THE COMPANIES ACT, 1994\n(ACT XVIII OF 1994)", { align: "center", bold: true, fontSize: "legal" }),
    text("execution-title", "title", "SUBSCRIBERS AND EXECUTION", { fontSize: "subtitle" }),
    text("execution-company", "paragraph", "For {{company_name}}\nExecuted on {{execution_date}}.", { align: "center", bold: true, fontSize: "legal" }),
    text("execution-intro", "paragraph", "We, the several persons whose names and particulars are subscribed below, wish to be formed into a Company pursuant to this Memorandum of Association and agree to take the number of shares set opposite our respective names.", { bold: false }),
    text("execution-subscriber-details", "paragraph", "Subscriber {{item_number}} — {{name}}\n{{address}} {{occupation}}\nShares: {{shares}}", { bold: false, repeat: { repeaterKey: "subscribers" } }),
    clauseHeading("execution-signatures", "SIGNATURES"),
    signature("execution-subscriber-signature", "Subscriber {{item_number}} — {{name}}", { repeaterKey: "subscribers" }),
    signature("execution-witness-one", "Witness 1 — {{witness_one}}"),
    signature("execution-witness-two", "Witness 2 — {{witness_two}}"),
  ]),
];

export const defaultPrivateCompanyMoaAoaTemplate: DocumentTemplateDraft = {
  title: "Private Company MoA & AoA",
  slug: "private-company-moa-aoa",
  description: "A source-based private-company Memorandum and Articles of Association draft with editable company, capital, director and subscriber details.",
  settings: privateCompanySettings(),
  fields: companyFields,
  pages: [...memorandumPages, ...articlesPages],
};
