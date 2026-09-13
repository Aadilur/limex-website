export type ServiceTemplateContext = {
  title: string;
  description: string;
  section: string;
  group: string;
  parent?: string | null;
  locale: "en" | "bn";
};

type ServiceProfileDetails = {
  overviewEn: string;
  overviewBn: string;
  scopeEn: string[];
  scopeBn: string[];
  docsEn: string[];
  docsBn: string[];
  stepsEn: Array<{ title: string; desc: string }>;
  stepsBn: Array<{ title: string; desc: string }>;
  complianceEn: string;
  complianceBn: string;
};

const serviceDirectory: Record<string, ServiceProfileDetails> = {
  "Company Formation": {
    overviewEn:
      "Comprehensive corporate entity incorporation at the Registrar of Joint Stock Companies and Firms (RJSC) under the Companies Act 1994, establishing a legally distinct corporate identity with limited liability.",
    overviewBn:
      "কোম্পানি আইন ১৯৯৪-এর অধীন রেজিস্ট্রার অব জয়েন্ট স্টক কোম্পানিজ অ্যান্ড ফার্মস (RJSC)-এ সম্পূর্ণ কোম্পানি নিবন্ধন ও আইনি সত্তা প্রতিষ্ঠা।",
    scopeEn: [
      "Name clearance verification and reservation with RJSC portal",
      "Drafting of customized Memorandum of Association (MoA) and Articles of Association (AoA)",
      "Preparation of statutory Form IX, Form X, Form XII and subscriber witness records",
      "Payment of government stamp duties and statutory registration fees",
      "Obtaining the official Certificate of Incorporation and certified Form XII",
    ],
    scopeBn: [
      "RJSC পোর্টালে নাম যাচাই ও নেম ক্লিয়ারেন্স সংরক্ষণ",
      "স্মারকলিপি (MoA) ও পরিমেল নিয়মাবলী (AoA) প্রস্তুতকরণ",
      "বিধিবদ্ধ ফরম IX, ফরম X ও ফরম XII প্রস্তুতকরণ",
      "সরকারি স্ট্যাম্প ডিউটি ও সরকারি ফি পরিশোধ",
      "সার্টিফিকেট অব ইনকর্পোরেশন ও সার্টিফায়েড ফরম XII সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Proposed company names in order of preference",
      "National ID (NID) or Passport copies of all prospective directors and shareholders",
      "TIN certificates of all Bangladeshi directors",
      "Passport-sized formal photographs of all directors",
      "Registered office physical address with utility bill or tenancy agreement copy",
      "Authorized and paid-up capital distribution schedule among shareholders",
    ],
    docsBn: [
      "পছন্দের ক্রমানুসারে প্রস্তাবিত কোম্পানির নাম",
      "সকল প্রস্তাবিত পরিচালক ও শেয়ারহোল্ডারদের জাতীয় পরিচয়পত্র (NID) বা পাসপোর্টের কপি",
      "সকল বাংলাদেশি পরিচালকদের ই-টিন সার্টিফিকেট",
      "সকল পরিচালকদের পাসপোর্ট সাইজের রঙিন ছবি",
      "কোম্পানির নিবন্ধিত প্রধান কার্যালয়ের ঠিকানা ও চুক্তিপত্র",
      "অনুমোদিত ও পরিশোধিত মূলধনের অনুপাত ও শেয়ার বিবরণী",
    ],
    stepsEn: [
      {
        title: "Name Clearance",
        desc: "Submit and secure approved Name Clearance from the official RJSC digital portal.",
      },
      {
        title: "Charter Drafting",
        desc: "Formulate business object clauses in the MoA and management regulations in the AoA.",
      },
      {
        title: "Statutory Filing",
        desc: "Submit digital application forms, subscriber declarations, and execute government fee challans.",
      },
      {
        title: "Handover & Next Steps",
        desc: "Receive digitally certified incorporation certificate, Form XII, and initiate post-incorporation registrations.",
      },
    ],
    stepsBn: [
      {
        title: "নেম ক্লিয়ারেন্স অনুমোদন",
        desc: "RJSC পোর্টাল থেকে প্রাতিষ্ঠানিক নাম যাচাই ও ছাড়পত্র অনুমোদন গ্রহণ।",
      },
      {
        title: "স্মারকলিপি ও নিয়ামাবলী প্রণয়ন",
        desc: "ব্যবসায়ের উদ্দেশ্যসমূহ অন্তর্ভুক্ত করে MoA এবং পরিচালনা নীতি সম্বলিত AoA প্রস্তুত।",
      },
      {
        title: "ডিজিটাল আবেদন ও ফি দাখিল",
        desc: "সরকারি ফি পরিশোধপূর্বক RJSC পোর্টালে চূড়ান্ত আবেদন সাবমিট।",
      },
      {
        title: "সার্টিফিকেট ও ডকুমেন্ট হস্তান্তর",
        desc: "ইনকর্পোরেশন সনদ ও ফরম XII গ্রহণ এবং পরবর্তী লাইসেন্সিং সহায়তা।",
      },
    ],
    complianceEn:
      "Turnaround time is typically 5 to 7 working days following document finalization. Post-incorporation compliance requires obtaining an E-TIN, Trade License, and 13-digit VAT/BIN prior to opening a corporate bank account.",
    complianceBn:
      "কাগজপত্র প্রস্তুতের পর সাধারণত ৫ থেকে ৭ কর্মদিবসের মধ্যে ইনকর্পোরেশন সম্পন্ন হয়। পরবর্তী ধাপে ই-টিন, ট্রেড লাইসেন্স ও ভ্যাট/BIN নিবন্ধন বাধ্যতামূলক।",
  },

  "Limited Company Formation": {
    overviewEn:
      "Private Limited Company incorporation at RJSC Bangladesh, offering equity-based limited liability protection, corporate legitimacy for contracts, and formal eligibility for institutional financing and global partnerships.",
    overviewBn:
      "RJSC-তে প্রাইভেট লিমিটেড কোম্পানি নিবন্ধন। সীমিত দায়বদ্ধতা, ব্যবসায়িক গ্রহণযোগ্যতা ও আইনি সুরক্ষা নিশ্চিত করার সবচেয়ে নির্ভরযোগ্য প্রাতিষ্ঠানিক মাধ্যম।",
    scopeEn: [
      "RJSC name search, validation, and official name clearance certificate",
      "Tailored drafting of Memorandum and Articles of Association",
      "Formulation of statutory filing packets (Form I, VI, IX, X, XII)",
      "Government fee payment and digital submission management",
      "Delivery of certified Certificate of Incorporation, Form XII, and certified charter copy",
    ],
    scopeBn: [
      "RJSC পোর্টালে নাম যাচাই ও নেম ক্লিয়ারেন্স সংগ্রহ",
      "ব্যবসার উপযোগী স্মারকলিপি (MoA) ও পরিমেল নিয়মাবলী (AoA) প্রস্তুত",
      "বিধিবদ্ধ ফরম (ফরম I, VI, IX, X, XII) নির্ভুলভাবে প্রস্তুত",
      "সরকারি ফি পরিশোধ ও ডিজিটাল আবেদন প্রক্রিয়া সম্পন্নকরণ",
      "ইনকর্পোরেশন সনদ, সার্টিফায়েড ফরম XII ও অনুমোদিত চার্টার হস্তান্তর",
    ],
    docsEn: [
      "Minimum 2 and maximum 50 directors/shareholders' NID or Passport copies",
      "E-TIN certificates of all Bangladeshi directors",
      "Recent passport-sized photographs of all directors",
      "Physical commercial address proof for registered office in Bangladesh",
      "Agreed shareholding ratios and paid-up capital allocation plan",
    ],
    docsBn: [
      "কমপক্ষে ২ জন এবং সর্বোচ্চ ৫০ জন শেয়ারহোল্ডারের NID বা পাসপোর্ট কপি",
      "সকল পরিচালকের ব্যক্তিগত ই-টিন সার্টিফিকেট",
      "সকল পরিচালকের পাসপোর্ট সাইজ ছবি",
      "নিবন্ধিত প্রধান কার্যালয়ের ঠিকানা ও চুক্তিপত্র",
      "শেয়ার বণ্টনের অনুপাত ও মূলধন সংক্রান্ত সিদ্ধান্ত",
    ],
    stepsEn: [
      {
        title: "Name Approval",
        desc: "Secure name clearance confirmation through the online RJSC registry.",
      },
      {
        title: "Charter Preparation",
        desc: "Draft object clauses and corporate governance provisions in MoA/AoA.",
      },
      {
        title: "Online Filing",
        desc: "Execute digital submission and pay required government registration fees.",
      },
      {
        title: "Issuance of Incorporation",
        desc: "RJSC verifies records and issues the Certificate of Incorporation and Form XII.",
      },
    ],
    stepsBn: [
      {
        title: "নাম অনুমোদন",
        desc: "অনলাইন পোর্টালের মাধ্যমে কাঙ্ক্ষিত নামের ছাড়পত্র অনুমোদন।",
      },
      {
        title: "চার্টার প্রস্তুত",
        desc: "MoA এবং AoA খসড়া প্রস্তুত ও পরিচালকদের স্বাক্ষর গ্রহণ।",
      },
      {
        title: "অনলাইন সাবমিশন",
        desc: "ফি জমা দিয়ে সরকারি পোর্টালে চূড়ান্ত আবেদন দাখিল।",
      },
      {
        title: "সনদ প্রাপ্তি",
        desc: "যাচাই শেষে ইনকর্পোরেশন সনদ ও ফরম XII গ্রহণ।",
      },
    ],
    complianceEn:
      "Filing and certification usually complete within 5 to 7 business days. Annual compliance requires holding an Annual General Meeting (AGM) and submitting audited financial returns to RJSC.",
    complianceBn:
      "কাগজপত্র প্রস্তুতের পর সাধারণত ৫ থেকে ৭ কর্মদিবসের মধ্যে ইনকর্পোরেশন সম্পন্ন হয়। প্রতি বছর বার্ষিক সাধারণ সভা (AGM) এবং অডিট রিপোর্ট দাখিল করা আবশ্যক।",
  },

  "One Person Company Formation": {
    overviewEn:
      "Formation of a One Person Company (OPC) under the Companies (Second Amendment) Act 2020, allowing a single individual entrepreneur to operate with corporate limited liability and distinct legal identity.",
    overviewBn:
      "কোম্পানি আইন ২০২০-এর সংশোধন অনুযায়ী একজন মাত্র উদ্যোক্তার মালিকানায় ওয়ান পারসন কোম্পানি (OPC) গঠন, যেখানে একক ব্যক্তির সীমিত দায়বদ্ধতা নিশ্চিত হয়।",
    scopeEn: [
      "RJSC name search, validation, and official name clearance",
      "Drafting MoA and AoA customized for single-shareholder governance with mandatory nominee provisions",
      "Filing of statutory forms and nominee consent declarations",
      "Payment of government stamp duty and registration fees",
      "Delivery of Certificate of Incorporation and certified Form XII",
    ],
    scopeBn: [
      "RJSC পোর্টালে নাম যাচাই ও নেম ক্লিয়ারেন্স অনুমোদন",
      "একক শেয়ারহোল্ডার ও নমিনি সংক্রান্ত বিধানসহ MoA ও AoA প্রণয়ন",
      "নমিনি সম্মতিপত্র ও অন্যান্য সংবিধিবদ্ধ ফরম দাখিল",
      "সরকারি স্ট্যাম্প ডিউটি ও নিবন্ধন ফি পরিশোধ",
      "ইনকর্পোরেশন সনদ ও সার্টিফায়েড ফরম XII সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Sole shareholder's NID copy, E-TIN certificate, and photographs",
      "Nominee director's NID copy, photographs, and written consent",
      "Registered office physical address with rental agreement or property deed",
      "Bank solvency statement of the sole subscriber",
    ],
    docsBn: [
      "একক উদ্যোক্তার NID, ই-টিন সার্টিফিকেট ও পাসপোর্ট সাইজের ছবি",
      "মনোনীত নমিনির NID, ছবি ও লিখিত সম্মতিপত্র",
      "কোম্পানির নিবন্ধিত প্রধান কার্যালয়ের ঠিকানা ও চুক্তিপত্র",
      "উদ্যোক্তার ব্যাংক সলভেন্সি সনদ",
    ],
    stepsEn: [
      {
        title: "Name Clearance",
        desc: "Obtain approved name clearance carrying the mandatory '(OPC) Limited' suffix.",
      },
      {
        title: "Drafting Governance Charter",
        desc: "Formulate MoA and AoA with designated nominee succession clauses.",
      },
      {
        title: "Statutory Submission",
        desc: "Submit digital dossier and pay official government fees.",
      },
      {
        title: "Certificate Handover",
        desc: "Receive certified Certificate of Incorporation and Form XII.",
      },
    ],
    stepsBn: [
      {
        title: "নেম ক্লিয়ারেন্স গ্রহণ",
        desc: "নামের শেষে '(OPC) Limited' প্রত্যয়সহ নাম অনুমোদন।",
      },
      {
        title: "নিয়মাবলী প্রণয়ন",
        desc: "নমিনির বিবরণ ও উত্তরাধিকার শর্তসহ MoA ও AoA খসড়া প্রস্তুত।",
      },
      {
        title: "ফি পরিশোধ ও আবেদন",
        desc: "সরকারি ফি জমা দিয়ে RJSC পোর্টালে আবেদন দাখিল।",
      },
      { title: "সনদ হস্তান্তর", desc: "ইনকর্পোরেশন সনদ ও ফরম XII হস্তান্তর।" },
    ],
    complianceEn:
      "Turnaround time is 5 to 7 working days. Minimum paid-up capital requirement is BDT 25 Lac and maximum BDT 5 Crore under current statutory thresholds.",
    complianceBn:
      "প্রক্রিয়াটি সম্পন্ন হতে ৫-৭ কর্মদিবস সময় লাগে। বিধিবদ্ধ নিয়ম অনুযায়ী সর্বনিম্ন পরিশোধিত মূলধন ২৫ লাখ টাকা এবং সর্বোচ্চ ৫ কোটি টাকা হতে পারে।",
  },

  "Public Limited Company Formation": {
    overviewEn:
      "Formation and incorporation of a Public Limited Company under the Companies Act 1994, enabling capital raising from the public, institutional scale, and transferable equity ownership.",
    overviewBn:
      "কোম্পানি আইন ১৯৯৪-এর অধীনে পাবলিক লিমিটেড কোম্পানি গঠন। বৃহত্তর পরিসরে বিনিয়োগ সংগ্রহ ও উন্মুক্ত শেয়ার হস্তান্তরের জন্য এটি উপযুক্ত কাঠামো।",
    scopeEn: [
      "RJSC name reservation and clearance certification",
      "Comprehensive drafting of capital clauses, governance rules, and MoA/AoA",
      "Statutory form preparations for a minimum of 7 subscribers and 3 directors",
      "Coordination of statutory declaration in lieu of prospectus",
      "Filing and delivery of Certificate of Incorporation and Commencement of Business certificate",
    ],
    scopeBn: [
      "RJSC পোর্টালে পাবলিক লিমিটেড নামের ছাড়পত্র গ্রহণ",
      "বৃহৎ পরিসরের পরিচালনা বিধি সম্বলিত MoA ও AoA প্রণয়ন",
      "কমপক্ষে ৭ জন সদস্য ও ৩ জন পরিচালকের সংবিধিবদ্ধ ফরম প্রস্তুত",
      "প্রসপেক্টাস সংক্রান্ত ঘোষণাপত্র প্রস্তুত ও দাখিল",
      "ইনকর্পোরেশন সনদ ও ব্যবসা শুরুর সনদ (Commencement of Business) সংগ্রহ",
    ],
    docsEn: [
      "Minimum 7 shareholders and minimum 3 directors' NID/Passport and TIN records",
      "Photographs and bio-data profiles of all directors",
      "Registered corporate office address evidence",
      "Capitalization plan and qualification share subscription details",
    ],
    docsBn: [
      "কমপক্ষে ৭ জন শেয়ারহোল্ডার ও ৩ জন পরিচালকের NID/পাসপোর্ট ও ই-টিন কপি",
      "সকল পরিচালকের ছবি ও সংক্ষিপ্ত প্রোফাইল",
      "নিবন্ধিত প্রধান কার্যালয়ের ঠিকানা ও চুক্তিপত্র",
      "শেয়ার ক্যাপিটাল পরিকল্পনা ও সাবস্ক্রিপশন সংক্রান্ত তথ্য",
    ],
    stepsEn: [
      {
        title: "Name Clearance",
        desc: "Secure name reservation under the Public Limited format.",
      },
      {
        title: "Charter & Governance Setup",
        desc: "Draft extensive governance articles and board structure.",
      },
      {
        title: "RJSC Statutory Filing",
        desc: "Submit all statutory documentation and pay graded capital fees.",
      },
      {
        title: "Business Commencement",
        desc: "Obtain incorporation certification and certificate to commence business.",
      },
    ],
    stepsBn: [
      { title: "নাম অনুমোদন", desc: "পাবলিক লিমিটেড ক্যাটাগরিতে নাম সংরক্ষণ।" },
      {
        title: "গঠনতন্ত্র প্রণয়ন",
        desc: "পরিচালনা পর্ষদ ও শেয়ারহোল্ডারদের বিস্তারিত বিধিবিধান প্রস্তুত।",
      },
      {
        title: "সরকারি ফি ও আবেদন",
        desc: "নির্ধারিত সরকারি ফি পরিশোধপূর্বক আবেদন দাখিল।",
      },
      {
        title: "কার্যারম্ভ সনদ",
        desc: "ইনকর্পোরেশন সনদ ও ব্যবসা শুরুর সনদ গ্রহণ।",
      },
    ],
    complianceEn:
      "Filing turnaround is 7 to 10 working days. Public entities are subject to mandatory annual audits, statutory meetings, and rigorous RJSC compliance reporting.",
    complianceBn:
      "কাগজপত্র অনুমোদনে ৭ থেকে ১০ কর্মদিবস প্রয়োজন। বার্ষিক অডিট, বিধিবদ্ধ সাধারণ সভা ও নিয়মিত RJSC ফাইলিং বজায় রাখা বাধ্যতামূলক।",
  },

  "Partnership Firm Registration": {
    overviewEn:
      "Formal registration of a Partnership Firm under the Partnership Act 1932 with RJSC Bangladesh, establishing enforceable mutual rights, profit-sharing ratios, and legal standing in business disputes.",
    overviewBn:
      "অংশীদারি আইন ১৯৩২-এর অধীনে RJSC-তে অংশীদারি ফার্ম নিবন্ধন। অংশীদারদের অধিকার, লভ্যাংশ বণ্টন ও আইনি সুরক্ষা নিশ্চিত করার নির্ভরযোগ্য মাধ্যম।",
    scopeEn: [
      "Comprehensive drafting of legal Partnership Deed with non-judicial stamp allocation",
      "Preparation of statutory Form I application for registration of firm",
      "Execution and notarization coordination among all partners",
      "Payment of government filing fees and submission to the Registrar of Firms",
      "Issuance and handover of the official Certificate of Registration of Firm",
    ],
    scopeBn: [
      "নন-জুডিশিয়াল স্ট্যাম্পে অংশীদারি চুক্তিপত্র (Deed of Partnership) প্রণয়ন",
      "নিবন্ধনের জন্য বিধিবদ্ধ ফরম I প্রস্তুতকরণ",
      "সকল অংশীদারের স্বাক্ষর ও নোটারি পাবলিক দ্বারা প্রত্যয়ন",
      "সরকারি ফি পরিশোধ ও RJSC ফার্ম রেজিস্ট্রারে আবেদন জমা",
      "রেজিস্ট্রেশন সনদ সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "NID or Passport copies of all partners",
      "Personal E-TIN certificates of all partners",
      "Passport-sized photographs of all partners",
      "Registered principal place of business tenancy agreement or deed",
      "Agreed capital investment and profit/loss sharing schedule",
    ],
    docsBn: [
      "সকল অংশীদারের NID বা পাসপোর্ট কপি",
      "সকল অংশীদারের ব্যক্তিগত ই-টিন সার্টিফিকেট",
      "সকল অংশীদারের পাসপোর্ট সাইজের রঙিন ছবি",
      "ফার্মের প্রধান কার্যালয়ের ভাড়াচুক্তি বা মালিকানা সংক্রান্ত প্রমাণ",
      "মূলধন বিনিয়োগ ও লাভ-ক্ষতি বণ্টনের বিবরণী",
    ],
    stepsEn: [
      {
        title: "Deed Drafting",
        desc: "Draft comprehensive partnership deed governing term, capital, roles, and dissolution.",
      },
      {
        title: "Execution & Stamping",
        desc: "Print on prescribed non-judicial stamp paper and execute signatures with notarization.",
      },
      {
        title: "Statutory Submission",
        desc: "Submit Form I to RJSC with required fee challans.",
      },
      {
        title: "Certificate Delivery",
        desc: "Receive official Certificate of Firm Registration.",
      },
    ],
    stepsBn: [
      {
        title: "চুক্তিপত্র প্রণয়ন",
        desc: "অংশীদারদের দায়িত্ব, মূলধন ও লভ্যাংশ উল্লেখ করে ডিড প্রণয়ন।",
      },
      {
        title: "স্ট্যাম্পিং ও নোটারি",
        desc: "নির্ধারিত মূল্যের স্ট্যাম্পে প্রিন্ট ও নোটারি সম্পন্নকরণ।",
      },
      {
        title: "ফরম I দাখিল",
        desc: "ফি চালানসহ RJSC-তে ফার্ম রেজিস্ট্রেশন আবেদন দাখিল।",
      },
      {
        title: "সনদ সংগ্রহ",
        desc: "নিবন্ধন সনদ গ্রহণ ও পরবর্তী ট্রেড লাইসেন্স সহায়তা।",
      },
    ],
    complianceEn:
      "Turnaround time is 4 to 6 business days. Registered firms are legally empowered to file suits in court to enforce contractual obligations under the Partnership Act.",
    complianceBn:
      "প্রক্রিয়াটি সম্পন্ন হতে ৪ থেকে ৬ কর্মদিবস সময় লাগে। নিবন্ধিত ফার্ম চুক্তি ও লেনদেন সংক্রান্ত আইনি অধিকার আদালতে প্রয়োগে সক্ষম হয়।",
  },

  "Foreign Company Registration": {
    overviewEn:
      "Setting up a Branch Office or Liaison/Representative Office for foreign companies under BIDA (Bangladesh Investment Development Authority) and RJSC Section 378/379 of the Companies Act 1994.",
    overviewBn:
      "বিদেশি কোম্পানির জন্য BIDA ও RJSC-এর অধীনে বাংলাদেশ শাখা (Branch Office) বা লিয়াজোঁ অফিস নিবন্ধন ও পরিচালনা অনুমোদন।",
    scopeEn: [
      "BIDA application preparation and Inter-Ministerial Committee clearance",
      "Coordination of inward remittance encashment certificate validation",
      "RJSC filing under Section 378/379 for foreign company entity registration",
      "Preparation of board resolutions, power of attorney, and statutory forms",
      "Delivery of BIDA approval letter and RJSC registration acknowledgment",
    ],
    scopeBn: [
      "BIDA অনুমোদন ও আন্তঃমন্ত্রণালয় কমিটির ছাড়পত্র প্রক্রিয়াকরণ",
      "বৈদেশিক রেমিট্যান্স এনক্যাশমেন্ট সনদ সমন্বয়",
      "কোম্পানি আইন ৩78/৩৭৯ ধারার অধীনে RJSC-তে নিবন্ধন সম্পন্নকরণ",
      "বোর্ড রেজল্যুশন, পাওয়ার অব অ্যাটর্নি ও সংশ্লিষ্ট ফরম প্রস্তুত",
      "BIDA অনুমোদনপত্র ও RJSC সনদ হস্তান্তর",
    ],
    docsEn: [
      "Parent company Certificate of Incorporation, MoA, and AoA attested by Bangladesh Embassy",
      "Audited financial statements of the parent entity for the preceding financial year",
      "Board resolution authorizing Bangladesh office opening and appointing principal officer",
      "Power of Attorney in favor of the authorized representative (embassy attested)",
      "Office lease agreement in Bangladesh",
    ],
    docsBn: [
      "বাংলাদেশ দূতাবাস কর্তৃক সত্যায়িত মূল কোম্পানির ইনকর্পোরেশন সনদ ও গঠনতন্ত্র",
      "মূল কোম্পানির পূর্ববর্তী অর্থবছরের নিরীক্ষিত আর্থিক প্রতিবেদন",
      "বাংলাদেশে অফিস স্থাপন ও প্রতিনিধি নিয়োগ সংক্রান্ত বোর্ড রেজল্যুশন",
      "সত্যায়িত পাওয়ার অব অ্যাটর্নি",
      "বাংলাদেশে বাণিজ্যিক কার্যালয়ের ভাড়াচুক্তিপত্র",
    ],
    stepsEn: [
      {
        title: "BIDA Dossier",
        desc: "Compile foreign documents, embassy attestations, and submit to BIDA.",
      },
      {
        title: "Inter-Ministerial Approval",
        desc: "Represent before committee for official BIDA clearance letter.",
      },
      {
        title: "Capital Remittance",
        desc: "Facilitate minimum foreign inward remittance and encashment certificate.",
      },
      {
        title: "RJSC Registration",
        desc: "Complete Section 378/379 filing at RJSC and obtain entity records.",
      },
    ],
    stepsBn: [
      {
        title: "BIDA আবেদন",
        desc: "দূতাবাস সত্যায়িত কাগজপত্র প্রস্তুত ও BIDA-তে জমা।",
      },
      {
        title: "কমিটি অনুমোদন",
        desc: "আন্তঃমন্ত্রণালয় কমিটির অনুমোদন ও BIDA অনুমতিপত্র গ্রহণ।",
      },
      {
        title: "রেমিট্যান্স আনয়ন",
        desc: "নির্ধারিত বৈদেশিক রেমিট্যান্স ব্যাংকে আনয়ন ও এনক্যাশমেন্ট সনদ গ্রহণ।",
      },
      {
        title: "RJSC নিবন্ধন",
        desc: "RJSC-তে ৩78/৩৭৯ ধারায় অফিস নিবন্ধন সম্পন্নকরণ।",
      },
    ],
    complianceEn:
      "Turnaround time spans 4 to 8 weeks depending on inter-ministerial review. Initial BIDA permission is granted for 3 years, renewable upon regular compliance reporting.",
    complianceBn:
      "আন্তঃমন্ত্রণালয় পর্যালোচনার ওপর ভিত্তি করে সাধারণত ৪ থেকে ৮ সপ্তাহ সময় লাগে। প্রাথমিক অনুমতি ৩ বছরের জন্য কার্যকর থাকে।",
  },

  "Trade License": {
    overviewEn:
      "Issuance and regulatory management of Trade Licenses across Dhaka North (DNCC), Dhaka South (DSCC), other City Corporations, Municipalities (Pourashava), and Union Parishads under Local Government Acts.",
    overviewBn:
      "সিটি কর্পোরেশন, পৌরসভা বা ইউনিয়ন পরিষদ থেকে বাণিজ্যিক কার্যক্রম পরিচালনার জন্য বাধ্যতামূলক ট্রেড লাইসেন্স ইস্যু ও ব্যবস্থাপনা।",
    scopeEn: [
      "Jurisdictional zoning classification and appropriate authority determination",
      "Documentation review and commercial lease verification",
      "Application drafting and electronic/physical submission",
      "Inspection liaison and official fee challan settlement",
      "Delivery of original Trade License book or digital certificate",
    ],
    scopeBn: [
      "এলাকাভিত্তিক জোন ও সংশ্লিষ্ট কর্তৃপক্ষ নির্ধারণ",
      "ডকুমেন্ট পর্যালোচনা ও বাণিজ্যিক চুক্তিপত্র যাচাই",
      "নির্ধারিত ফরমে আবেদন ও অনলাইন সাবমিশন",
      "পরিদর্শন সমন্বয় ও সরকারি ফি পরিশোধ",
      "মূল ট্রেড লাইসেন্স বই বা ই-ট্রেড লাইসেন্স সনদ সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Commercial space rental agreement with holding tax payment receipt",
      "National ID (NID) copy of applicant proprietor or managing director",
      "Passport-sized formal photographs",
      "TIN certificate of the applicant or entity",
      "Incorporation Certificate and Form XII (for limited companies) or Partnership Deed",
    ],
    docsBn: [
      "বাণিজ্যিক স্পেসের ভাড়াচুক্তিপত্র ও হোল্ডিং ট্যাক্স রসিদ",
      "স্বত্বাধিকারী বা ব্যবস্থাপনা পরিচালকের NID কপি",
      "পাসপোর্ট সাইজের রঙিন ছবি",
      "আবেদনকারী বা প্রতিষ্ঠানের ই-টিন সার্টিফিকেট",
      "লিমিটেড কোম্পানির ক্ষেত্রে ইনকর্পোরেশন ও ফরম XII অথবা অংশীদারি ডিড",
    ],
    stepsEn: [
      {
        title: "Jurisdiction & Category",
        desc: "Identify zonal revenue circle and select specific business line code.",
      },
      {
        title: "Document Compilation",
        desc: "Verify tenancy agreement, holding tax receipt, and corporate identity.",
      },
      {
        title: "Submission & Challan",
        desc: "Submit through revenue portal, generate bank challan, and pay fees.",
      },
      {
        title: "License Issuance",
        desc: "Obtain verified signed Trade License.",
      },
    ],
    stepsBn: [
      {
        title: "জোন ও ক্যাটাগরি নির্ধারণ",
        desc: "সংশ্লিষ্ট রাজস্ব সার্কেল ও ব্যবসার ধরন নির্বাচন।",
      },
      {
        title: "ডকুমেন্ট প্রস্তুত",
        desc: "ভাড়াচুক্তি, ট্যাক্স রসিদ ও প্রাতিষ্ঠানিক সনদ যাচাই।",
      },
      {
        title: "আবেদন ও ফি প্রদান",
        desc: "অনলাইন আবেদন দাখিল ও ব্যাংক চালানের মাধ্যমে ফি জমা।",
      },
      {
        title: "লাইসেন্স প্রাপ্তি",
        desc: "স্বাক্ষরিত ট্রেড লাইসেন্স গ্রহণ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround time is 2 to 4 working days for standard commercial activities. Trade Licenses must be renewed annually between July 1 and September 30 to avoid statutory surcharges.",
    complianceBn:
      "সাধারণ ব্যবসার ক্ষেত্রে ২ থেকে ৪ কর্মদিবসে লাইসেন্স পাওয়া যায়। প্রতি বছর ১ জুলাই থেকে ৩০ সেপ্টেম্বরের মধ্যে নবায়ন বাধ্যতামূলক।",
  },

  "New Trade License": {
    overviewEn:
      "Fresh issuance of Trade License for newly established proprietary businesses, partnerships, or corporate branches across all municipal zones in Bangladesh.",
    overviewBn:
      "নতুন ব্যবসা প্রতিষ্ঠান, অংশীদারি কারবার বা কোম্পানির জন্য নতুন ট্রেড লাইসেন্স ইস্যুকরণ।",
    scopeEn: [
      "Business code categorization and zonal circle identification",
      "Commercial space holding tax and rental validation",
      "Filing and processing through online City Corporation/e-Trade system",
      "Settlement of license fees, signboard charges, and municipal sanitation taxes",
      "Handover of official valid trade license document",
    ],
    scopeBn: [
      "ব্যবসায়িক কোড ও জোন নির্ধারণ",
      "হোল্ডিং ট্যাক্স ও ভাড়াচুক্তি যাচাই",
      "ই-ট্রেড লাইসেন্স সিস্টেমে আবেদন দাখিল ও প্রক্রিয়াকরণ",
      "লাইসেন্স ফি, সাইনবোর্ড চার্জ ও পৌর কর পরিশোধ",
      "মূল ট্রেড লাইসেন্স সংগ্রহ ও ক্লায়েন্টকে হস্তান্তর",
    ],
    docsEn: [
      "Rent agreement on non-judicial stamp with updated holding tax receipt",
      "Applicant proprietor/MD NID copy and passport-sized photos",
      "Personal/Entity E-TIN certificate",
      "Certificate of Incorporation (for limited companies)",
    ],
    docsBn: [
      "স্ট্যাম্পে বাণিজ্যিক ভাড়াচুক্তিপত্র ও হালনাগাদ হোল্ডিং ট্যাক্স রসিদ",
      "স্বত্বাধিকারী/এমডির NID ও ছবি",
      "ব্যক্তিগত বা প্রাতিষ্ঠানিক ই-টিন কপি",
      "কোম্পানির ক্ষেত্রে ইনকর্পোরেশন সনদ",
    ],
    stepsEn: [
      {
        title: "Zonal Filing",
        desc: "Submit dossier to the relevant municipal revenue circle.",
      },
      {
        title: "Fee Settlement",
        desc: "Pay statutory trade tax, signboard levy, and surcharges.",
      },
      {
        title: "Inspection & Issuance",
        desc: "Complete verification and receive valid license.",
      },
    ],
    stepsBn: [
      { title: "জোনাল আবেদন", desc: "সংশ্লিষ্ট রাজস্ব সার্কেলে আবেদন সাবমিট।" },
      { title: "ফি পরিশোধ", desc: "লাইসেন্স ফি, সাইনবোর্ড কর ও চার্জ পরিশোধ।" },
      { title: "লাইসেন্স গ্রহণ", desc: "যাচাই শেষে বৈধ লাইসেন্স সংগ্রহ।" },
    ],
    complianceEn:
      "Issued license remains valid for the running fiscal year (July to June) and must be renewed annually.",
    complianceBn:
      "ইস্যুকৃত লাইসেন্স চলতি অর্থবছরের ৩০ জুন পর্যন্ত কার্যকর থাকে এবং পরবর্তী অর্থবছরে নবায়নযোগ্য।",
  },

  Renewal: {
    overviewEn:
      "Annual statutory renewal of existing Trade Licenses with City Corporations, Pourashavas, and Union Parishads to maintain operational continuity and bank compliance.",
    overviewBn:
      "সিটি কর্পোরেশন ও স্থানীয় কর্তৃপক্ষ হতে বিদ্যমান ট্রেড লাইসেন্সের বার্ষিক নবায়ন সম্পন্নকরণ।",
    scopeEn: [
      "Assessment of current fiscal year fees and applicable signboard/source taxes",
      "Resolution of outstanding dues or late renewal surcharges",
      "Submission of renewal challan and municipal revenue desk endorsement",
      "Delivery of renewed trade license endorsement or updated digital certificate",
    ],
    scopeBn: [
      "চলতি অর্থবছরের নবায়ন ফি ও সাইনবোর্ড কর নির্ধারণ",
      "বকেয়া বা বিলম্ব ফি সমন্বয়",
      "নবায়ন চালান দাখিল ও রাজস্ব অনুমোদন গ্রহণ",
      "নবায়নকৃত ট্রেড লাইসেন্স বা ডিজিটাল সনদ হস্তান্তর",
    ],
    docsEn: [
      "Original previous year Trade License book or digital certificate copy",
      "Latest commercial rent receipt or holding tax clearance",
      "Updated E-TIN return submission acknowledgment or certificate",
    ],
    docsBn: [
      "পূর্ববর্তী বছরের মূল ট্রেড লাইসেন্স বা ডিজিটাল সনদ কপি",
      "হালনাগাদ ভাড়ার রসিদ বা হোল্ডিং ট্যাক্স রসিদ",
      "হালনাগাদ আয়কর রিটার্ন জমার প্রমাণ বা ই-টিন সনদ",
    ],
    stepsEn: [
      {
        title: "Fee Calculation",
        desc: "Compute municipal renewal fee, source tax, and vat charges.",
      },
      {
        title: "Challan Payment",
        desc: "Execute payment at designated partner bank.",
      },
      {
        title: "Endorsement",
        desc: "Obtain official renewal stamp and revenue officer signature.",
      },
    ],
    stepsBn: [
      { title: "ফি নির্ধারণ", desc: "নবায়ন ফি, উৎসে কর ও ভ্যাট হিসাব।" },
      { title: "ব্যাংক পেমেন্ট", desc: "নির্ধারিত ব্যাংকে চালান পরিশোধ।" },
      {
        title: "নবায়ন অনুমোদন",
        desc: "রাজস্ব কর্মকর্তার স্বাক্ষর ও সিলমোহরযুক্ত নবায়ন সংগ্রহ।",
      },
    ],
    complianceEn:
      "Renewing before September 30 avoids late surcharges. Banks require renewed trade licenses to maintain active business accounts.",
    complianceBn:
      "৩০ সেপ্টেম্বরের মধ্যে নবায়ন করলে বিলম্ব জরিমানা এড়ানো যায়। ব্যাংক হিসাব সচল রাখতে হালনাগাদ লাইসেন্স আবশ্যক।",
  },

  Corrections: {
    overviewEn:
      "Official modification and correction of existing Trade Licenses, including business title amendments, address relocations, ownership changes, and line of business expansions.",
    overviewBn:
      "বিদ্যমান ট্রেড লাইসেন্সের নাম সংশোধন, ঠিকানা পরিবর্তন, অংশীদার রদবদল বা ব্যবসার ধরন পরিবর্তনের আনুষ্ঠানিক প্রক্রিয়া।",
    scopeEn: [
      "Preparation of formal correction petition to the Zonal Revenue Officer",
      "Verification of supporting legal instruments (board resolution, tenancy, deed)",
      "Municipal registry update and cancellation of old record",
      "Issuance of rectified Trade License reflecting updated details",
    ],
    scopeBn: [
      "জোনাল রাজস্ব কর্মকর্তার বরাবরে আনুষ্ঠানিক আবেদনপত্র প্রস্তুত",
      "সহায়ক কাগজপত্র (রেজল্যুশন, নতুন চুক্তি, ডিড) যাচাই",
      "মিউনিসিপ্যাল রেজিস্টারে তথ্য হালনাগাদ ও পুরোনো রেকর্ড সংশোধন",
      "সংশোধিত তথ্যাদিসহ নতুন ট্রেড লাইসেন্স সংগ্রহ",
    ],
    docsEn: [
      "Original Trade License book/certificate",
      "New tenancy agreement (for address correction)",
      "Board resolution or revised partnership deed (for name/structure changes)",
      "NID and TIN of new proprietor/directors (if ownership updated)",
    ],
    docsBn: [
      "মূল ট্রেড লাইসেন্স বই বা সনদ",
      "নতুন ভাড়াচুক্তিপত্র (ঠিকানা পরিবর্তনের ক্ষেত্রে)",
      "বোর্ড রেজল্যুশন বা সংশোধিত ডিড (নাম বা কাঠামো পরিবর্তনের ক্ষেত্রে)",
      "নতুন অংশীদার বা পরিচালকের NID ও ই-টিন",
    ],
    stepsEn: [
      {
        title: "Petition Drafting",
        desc: "Draft correction application with verified legal justification.",
      },
      {
        title: "Zonal Hearing",
        desc: "Liaison with revenue officer and address verification.",
      },
      {
        title: "Rectified Delivery",
        desc: "Receive corrected trade license reflecting new particulars.",
      },
    ],
    stepsBn: [
      {
        title: "আবেদন প্রণয়ন",
        desc: "যথাযথ কারণ ও সহায়ক ডকুমেন্টসহ সংশোধনের আবেদন প্রস্তুত।",
      },
      {
        title: "সার্কেল যাচাই",
        desc: "রাজস্ব কর্মকর্তার নিকট শুনানি ও পরিদর্শন সমন্বয়।",
      },
      {
        title: "সংশোধিত সনদ গ্রহণ",
        desc: "হালনাগাদ ট্রেড লাইসেন্স গ্রহণ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround time is 3 to 5 working days upon submitting requisite legal evidence to the zonal circle.",
    complianceBn:
      "সহায়ক কাগজপত্র দাখিলের পর সাধারণত ৩ থেকে ৫ কর্মদিবসের মধ্যে সংশোধিত লাইসেন্স প্রদান করা হয়।",
  },

  "Trade License Cancel": {
    overviewEn:
      "Formal cancellation and surrender of Trade License upon business closure, restructuring, or entity dissolution to prevent recurring tax liabilities and municipal surcharges.",
    overviewBn:
      "ব্যবসা বন্ধ, স্থানান্তর বা কোম্পানি অবলুপ্তির ক্ষেত্রে ভবিষ্যৎ কর দায় এড়াতে ট্রেড লাইসেন্স আনুষ্ঠানিকভাবে সমর্পণ ও বাতিলকরণ।",
    scopeEn: [
      "Preparation of formal surrender petition and no-dues verification",
      "Settlement of outstanding municipal dues and tax levies",
      "Coordination of zonal inspector physical verification of premises closure",
      "Receipt of formal cancellation letter and closure certificate",
    ],
    scopeBn: [
      "লাইসেন্স সমর্পণ ও নো-ডিউজ যাচাইপূর্বক আবেদন প্রস্তুত",
      "বকেয়া পৌর কর ও সার্ভিস চার্জের নিষ্পত্তি",
      "বাণিজ্যিক স্থান বন্ধের ব্যাপারে রাজস্ব পরিদর্শকের রিপোর্ট সমন্বয়",
      "আনুষ্ঠানিক বাতিলকরণ পত্র ও ক্লিয়ারেন্স গ্রহণ",
    ],
    docsEn: [
      "Original Trade License book or certificate",
      "Premises vacation certificate from landlord or lease termination deed",
      "Entity dissolution resolution or proprietor closure declaration",
      "Latest holding tax and utility clearance receipts",
    ],
    docsBn: [
      "মূল ট্রেড লাইসেন্স বই বা সনদপত্র",
      "বাণিজ্যিক স্পেস ছাড়ার প্রমাণপত্র বা চুক্তি বাতিলের দলিল",
      "ব্যবসা বন্ধ সংক্রান্ত বোর্ড রেজল্যুশন বা স্বত্বাধিকারীর ঘোষণা",
      "সর্বশেষ হোল্ডিং ট্যাক্স ও ইউটিলিটি বিলের ক্লিয়ারেন্স",
    ],
    stepsEn: [
      {
        title: "Surrender Application",
        desc: "File cancellation petition with justification records.",
      },
      {
        title: "Dues Audit",
        desc: "Audit and settle municipal fees up to the closure date.",
      },
      {
        title: "Closure Confirmation",
        desc: "Obtain official written confirmation of license cancellation.",
      },
    ],
    stepsBn: [
      {
        title: "বাতিলের আবেদন",
        desc: "বন্ধের প্রমাণপত্রসহ রাজস্ব সার্কেলে আবেদন দাখিল।",
      },
      {
        title: "বকেয়া অডিট",
        desc: "বন্ধের তারিখ পর্যন্ত পৌর বকেয়া হিসাব ও নিষ্পত্তি।",
      },
      {
        title: "বাতিল নিশ্চিতকরণ",
        desc: "ট্রেড লাইসেন্স বাতিলের আনুষ্ঠানিক চিঠি সংগ্রহ।",
      },
    ],
    complianceEn:
      "Ensures full legal immunity from cumulative local government taxes and statutory audit inquiries.",
    complianceBn:
      "ভবিষ্যতে পৌর করের ধারাবাহিক দাবি ও আইনি জটিলতা থেকে সম্পূর্ণ সুরক্ষা প্রদান করে।",
  },

  "VAT / BIN Registration": {
    overviewEn:
      "Obtaining the 13-digit Business Identification Number (BIN) from the National Board of Revenue (NBR) via the VAT Online System (VOS) under the Value Added Tax and Supplementary Duty Act 2012.",
    overviewBn:
      "জাতীয় রাজস্ব বোর্ড (NBR) থেকে ভ্যাট অনলাইন সিস্টেম (VOS)-এর মাধ্যমে ১৩-সংখ্যার বিজনেস আইডেন্টিফিকেশন নম্বর (BIN) নিবন্ধন।",
    scopeEn: [
      "Economic activity classification and standard VAT rate alignment",
      "NBR VOS portal account creation and electronic Form Mushak 2.1 preparation",
      "Document upload, verification liaison with VAT Circle Revenue Officer",
      "Issuance and handover of original 13-digit VAT Registration Certificate (Mushak 2.3)",
    ],
    scopeBn: [
      "অর্থনৈতিক কার্যক্রমের শ্রেণিবিভাগ ও ভ্যাট হার নির্ধারণ",
      "NBR ভ্যাট অনলাইন পোর্টালে ফরম মূসক ২.১ প্রস্তুত ও দাখিল",
      "কাগজপত্র আপলোড ও সার্কেল রাজস্ব কর্মকর্তার সঙ্গে যাচাই সমন্বয়",
      "১৩-সংখ্যার মূল ভ্যাট নিবন্ধন সনদ (মূসক ২.৩) সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Valid Trade License copy",
      "E-TIN certificate of business or proprietor",
      "National ID (NID) copy of applicant proprietor or managing director",
      "Bank account statement or bank solvency certificate showing company account title",
      "Certificate of Incorporation and Form XII (for limited companies)",
      "Import/Export Registration Certificate (IRC/ERC) if applicable",
    ],
    docsBn: [
      "হালনাগাদ ট্রেড লাইসেন্সের কপি",
      "ব্যবসা বা উদ্যোক্তার ই-টিন সার্টিফিকেট",
      "স্বত্বাধিকারী বা ব্যবস্থাপনা পরিচালকের NID কপি",
      "প্রতিষ্ঠানের নামে ব্যাংক হিসাব বিবরণী বা ব্যাংক সলভেন্সি সনদ",
      "লিমিটেড কোম্পানির ক্ষেত্রে ইনকর্পোরেশন সনদ ও ফরম XII",
      "আমদানি/রপ্তানি সনদ (যদি প্রযোজ্য থাকে)",
    ],
    stepsEn: [
      {
        title: "Portal Enrollment",
        desc: "Create enterprise account on the NBR VAT Online System.",
      },
      {
        title: "Mushak 2.1 Submission",
        desc: "Submit electronic application with verified supporting files.",
      },
      {
        title: "Circle Approval",
        desc: "Revenue officer verifies records and sanctions registration.",
      },
      {
        title: "Certificate Download",
        desc: "Download and deliver authenticated Mushak 2.3 certificate.",
      },
    ],
    stepsBn: [
      {
        title: "পোর্টাল অ্যাকাউন্ট",
        desc: "NBR ভ্যাট অনলাইন পোর্টালে প্রতিষ্ঠানের প্রোফাইল তৈরি।",
      },
      {
        title: "মূসক ২.১ দাখিল",
        desc: "প্রয়োজনীয় কাগজপত্রসহ ডিজিটাল আবেদন সম্পন্নকরণ।",
      },
      {
        title: "সার্কেল অনুমোদন",
        desc: "রাজস্ব কর্মকর্তা কর্তৃক তথ্য যাচাই ও অনুমোদন প্রদান।",
      },
      {
        title: "সনদ সংগ্রহ",
        desc: "অনুমোদিত মূসক ২.৩ ভ্যাট সার্টিফিকেট হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround time is 1 to 2 business days. Having an active BIN mandates submitting monthly VAT returns (Mushak 9.1) by the 15th of every month, even for zero-turnover periods.",
    complianceBn:
      "সাধারণত ১ থেকে ২ কর্মদিবসে সনদ পাওয়া যায়। BIN গ্রহণের পর প্রতি মাসের ১৫ তারিখের মধ্যে মূসক ৯.১ রিটার্ন জমা দেওয়া আইনত বাধ্যতামূলক।",
  },

  "BIN Correction & Recovery": {
    overviewEn:
      "Rectification of business details on the NBR VAT portal or recovery and unfreezing of suspended/locked Business Identification Numbers (BIN).",
    overviewBn:
      "NBR ভ্যাট পোর্টালে ঠিকানা বা তথ্য সংশোধন এবং স্থগিত বা লক হয়ে যাওয়া BIN পোর্টাল পুনরুদ্ধার।",
    scopeEn: [
      "Comprehensive audit of VAT portal status and pending return defaults",
      "Preparation of rectification or restoration petition to the Divisional VAT Officer",
      "Filing overdue monthly returns (Mushak 9.1) to regularize compliance",
      "Issuance of updated Mushak 2.3 or unlocked portal credentials",
    ],
    scopeBn: [
      "ভ্যাট পোর্টালে স্থিতি ও বকেয়া রিটার্নের অডিট",
      "বিভাগীয় ভ্যাট কর্মকর্তার নিকট সংশোধন বা সচলের আবেদন দাখিল",
      "বকেয়া মূসক ৯.১ রিটার্ন দাখিলের মাধ্যমে অ্যাকাউন্ট নিয়মিতকরণ",
      "হালনাগাদ মূসক ২.৩ সনদ বা সচল পোর্টাল এক্সেস হস্তান্তর",
    ],
    docsEn: [
      "Current 13-digit BIN certificate copy",
      "Updated Trade License reflecting revised particulars",
      "Bank solvency certificate and bank statement",
      "Reason for suspension or password recovery authorization letter",
    ],
    docsBn: [
      "বিদ্যমান ১৩-সংখ্যার BIN সনদ কপি",
      "সংশোধিত তথ্যাদিসহ হালনাগাদ ট্রেড লাইসেন্স",
      "ব্যাংক হিসাব বিবরণী ও ব্যাংক সলভেন্সি সনদ",
      "স্থগিতাদেশ প্রত্যাহারের যৌক্তিকতা সম্বলিত আবেদনপত্র",
    ],
    stepsEn: [
      {
        title: "Diagnostic Audit",
        desc: "Examine circle ledger for penalty demands or overdue periods.",
      },
      {
        title: "Filing Rectification",
        desc: "Clear defaults and submit petition with revenue officer.",
      },
      {
        title: "Portal Restoration",
        desc: "Reactivate BIN status and receive updated certificate.",
      },
    ],
    stepsBn: [
      {
        title: "পরিস্থিতি যাচাই",
        desc: "বকেয়া রিটার্ন ও জরিমানার হিসাব নির্ণয়।",
      },
      {
        title: "আবেদন ও সমন্বয়",
        desc: "বকেয়া পূরণপূর্বক ভ্যাট সার্কেলে আনুষ্ঠানিক আবেদন দাখিল।",
      },
      {
        title: "পুনরুদ্ধার",
        desc: "BIN স্ট্যাটাস সচলকরণ ও হালনাগাদ সনদ গ্রহণ।",
      },
    ],
    complianceEn:
      "Resolution takes 3 to 5 business days. Timely regularization prevents customs clearance blockades and banking freezes.",
    complianceBn:
      "সাধারণত ৩ থেকে ৫ কর্মদিবস লাগে। সময়মতো সচল করলে কাস্টমস ও ব্যাংকিং জটিলতা এড়ানো সম্ভব হয়।",
  },

  "TIN / TAX Registration": {
    overviewEn:
      "Issuance of the mandatory 12-digit electronic Taxpayer Identification Number (E-TIN) from the National Board of Revenue (NBR) under the Income Tax Act 2023.",
    overviewBn:
      "আয়কর আইন ২০২৩-এর অধীনে জাতীয় রাজস্ব বোর্ড (NBR) থেকে ১২-সংখ্যার ইলেকট্রনিক ই-টিন (E-TIN) নিবন্ধন।",
    scopeEn: [
      "Appropriate tax circle and zone determination based on location and activity",
      "Electronic data validation against national database registries",
      "Instant generation of authenticated official 12-digit E-TIN certificate",
      "Guidance on initial tax assessment obligations and annual filing cycles",
    ],
    scopeBn: [
      "এলাকা ও ব্যবসার প্রকৃতি অনুযায়ী প্রযোজ্য কর সার্কেল ও কর অঞ্চল নির্ধারণ",
      "জাতীয় পরিচয়পত্র ও রেজিস্ট্রি ডেটাবেজে তথ্য যাচাই",
      "১২-সংখ্যার অফিশিয়াল ই-টিন সার্টিফিকেট তাৎক্ষণিক প্রস্তুতকরণ",
      "বার্ষিক আয়কর রিটার্ন জমার নিয়মাবলী সংক্রান্ত মৌলিক নির্দেশনা",
    ],
    docsEn: [
      "National ID (NID) copy of applicant or passport for foreign nationals",
      "Active mobile number registered in applicant's name for OTP verification",
      "Business trade license or incorporation certificate (for corporate entities)",
    ],
    docsBn: [
      "আবেদনকারীর জাতীয় পরিচয়পত্র (NID) বা পাসপোর্টের কপি",
      "আবেদনকারীর নামে নিবন্ধিত সক্রিয় মোবাইল নম্বর",
      "প্রতিষ্ঠানের ক্ষেত্রে ট্রেড লাইসেন্স বা ইনকর্পোরেশন সনদ",
    ],
    stepsEn: [
      {
        title: "Registry Verification",
        desc: "Validate identification records on NBR tax portal.",
      },
      {
        title: "Circle Mapping",
        desc: "Assign appropriate territorial or specialized taxes circle.",
      },
      {
        title: "Certificate Generation",
        desc: "Issue authenticated 12-digit E-TIN certificate.",
      },
    ],
    stepsBn: [
      { title: "তথ্য যাচাই", desc: "NBR সার্ভারে NID ও তথ্যাদি যাচাইকরণ।" },
      {
        title: "সার্কেল নির্ধারণ",
        desc: "সংশ্লিষ্ট কর অঞ্চল ও সার্কেল ম্যাপিং।",
      },
      {
        title: "সনদ গ্রহণ",
        desc: "ই-টিন সার্টিফিকেট তাৎক্ষণিক গ্রহণ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Delivered within 24 hours. Possessing an active E-TIN requires filing an annual income tax return under Section 166 of the Income Tax Act 2023.",
    complianceBn:
      "২৪ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়। ই-টিন গ্রহণকারীদের প্রতি করবর্ষে আয়কর রিটার্ন দাখিল করা বাধ্যতামূলক।",
  },

  "New Individual E-TIN Registration": {
    overviewEn:
      "Issuance of personal 12-digit E-TIN for salaried individuals, professionals, company directors, and property owners.",
    overviewBn:
      "চাকরিজীবী, পেশাজীবী, কোম্পানির পরিচালক বা সম্পদ মালিকদের জন্য ব্যক্তিগত ১২-সংখ্যার ই-টিন নিবন্ধন।",
    scopeEn: [
      "NID-linked electronic authentication on NBR portal",
      "Jurisdictional circle assignment based on employer/residential address",
      "Immediate issuance and delivery of personal E-TIN certificate",
    ],
    scopeBn: [
      "NBR পোর্টালে NID সমন্বিত অনলাইন ডেটা যাচাই",
      "কর্মস্থল বা ঠিকানার ভিত্তিতে কর সার্কেল নির্ধারণ",
      "ব্যক্তিগত ই-টিন সনদ তাৎক্ষণিক প্রস্তুত ও হস্তান্তর",
    ],
    docsEn: [
      "Applicant National ID (NID) copy",
      "Active mobile phone number for OTP authentication",
      "Current residential and permanent address details",
    ],
    docsBn: [
      "আবেদনকারীর জাতীয় পরিচয়পত্র (NID) কপি",
      "ওটিপি যাচাইয়ের জন্য সক্রিয় মোবাইল নম্বর",
      "বর্তমান ও স্থায়ী ঠিকানার তথ্য",
    ],
    stepsEn: [
      {
        title: "NID Verification",
        desc: "Verify bio-data with Election Commission server via NBR.",
      },
      {
        title: "Profile Submission",
        desc: "Complete profession and circle selection fields.",
      },
      {
        title: "Immediate Issuance",
        desc: "Download and deliver authenticated E-TIN document.",
      },
    ],
    stepsBn: [
      { title: "NID যাচাই", desc: "অনলাইন সিস্টেমে NID তথ্যাদি যাচাই।" },
      {
        title: "প্রোফাইল তৈরি",
        desc: "পেশা ও সার্কেল নির্বাচন করে আবেদন সম্পন্ন।",
      },
      {
        title: "সনদ প্রাপ্তি",
        desc: "ই-টিন সনদ তাৎক্ষণিক সংগ্রহ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Mandatory for vehicle registration, credit card approvals, property sales, and directorships.",
    complianceBn:
      "গাড়ি রেজিস্ট্রেশন, ক্রেডিট কার্ড আবেদন, জমি কেনাবেচা ও কোম্পানির পরিচালক পদের জন্য অপরিহার্য।",
  },

  "Limited Company E-TIN Registration": {
    overviewEn:
      "Issuance of corporate 12-digit E-TIN for private and public limited companies registered with RJSC.",
    overviewBn:
      "RJSC নিবন্ধিত প্রাইভেট ও পাবলিক লিমিটেড কোম্পানির জন্য প্রাতিষ্ঠানিক ১২-সংখ্যার ই-টিন নিবন্ধন।",
    scopeEn: [
      "RJSC incorporation credential validation on NBR corporate portal",
      "Corporate taxes circle assignment (e.g. LTU or specialized company circles)",
      "Issuance of Company E-TIN certificate in company's registered title",
    ],
    scopeBn: [
      "NBR সিস্টেমে RJSC ইনকর্পোরেশন ডেটা যাচাইকরণ",
      "কোম্পানি সার্কেল বা লার্জ ট্যাক্সপেয়ার্স ইউনিটে (LTU) সার্কেল ম্যাপিং",
      "কোম্পানির নামে প্রাতিষ্ঠানিক ই-টিন সার্টিফিকেট সংগ্রহ",
    ],
    docsEn: [
      "Certificate of Incorporation from RJSC",
      "Certified Form XII and Memorandum of Association (MoA)",
      "Managing Director's personal E-TIN and NID copies",
      "Company official seal and registered address proof",
    ],
    docsBn: [
      "RJSC ইনকর্পোরেশন সনদ কপি",
      "সার্টিফায়েড ফরম XII ও স্মারকলিপি (MoA)",
      "ব্যবস্থাপনা পরিচালকের ব্যক্তিগত ই-টিন ও NID কপি",
      "কোম্পানির সিলমোহর ও নিবন্ধিত কার্যালয়ের ঠিকানা",
    ],
    stepsEn: [
      {
        title: "Corporate Validation",
        desc: "Validate RJSC incorporation number with NBR tax database.",
      },
      {
        title: "Circle Allocation",
        desc: "Assign corporate tax circle matching entity type.",
      },
      {
        title: "Certificate Download",
        desc: "Obtain corporate E-TIN certificate.",
      },
    ],
    stepsBn: [
      {
        title: "ইনকর্পোরেশন যাচাই",
        desc: "RJSC নিবন্ধন নম্বর ডেটাবেজে যাচাই।",
      },
      { title: "সার্কেল নির্ধারণ", desc: "কোম্পানি কর সার্কেল নির্বাচন।" },
      { title: "সনদ গ্রহণ", desc: "কোম্পানির ই-টিন সার্টিফিকেট সংগ্রহ।" },
    ],
    complianceEn:
      "Prerequisite for bank account activation, trade license processing, and BIN registration.",
    complianceBn:
      "ব্যাংক হিসাব খোলা, ট্রেড লাইসেন্স ইস্যু ও ভ্যাট নিবন্ধনের জন্য বাধ্যতামূলক।",
  },

  "Partnership E-TIN Registration": {
    overviewEn:
      "Issuance of firm 12-digit E-TIN for partnership businesses registered with RJSC or operating under a registered partnership deed.",
    overviewBn:
      "অংশীদারি ফার্মের নামে স্বতন্ত্র ১২-সংখ্যার প্রাতিষ্ঠানিক ই-টিন নিবন্ধন।",
    scopeEn: [
      "Partnership deed analysis and partnership entity verification",
      "Firm tax circle mapping and electronic registration",
      "Delivery of Partnership Firm E-TIN certificate",
    ],
    scopeBn: [
      "অংশীদারি চুক্তিপত্র পর্যালোচনা ও ফার্মের তথ্য যাচাই",
      "সংশ্লিষ্ট ফার্ম কর সার্কেল নির্ধারণ ও আবেদন দাখিল",
      "ফার্মের নামে ই-টিন সার্টিফিকেট সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Registered Partnership Deed copy",
      "RJSC Certificate of Firm Registration (if registered)",
      "Personal E-TIN and NID copies of all partners",
      "Firm commercial address proof",
    ],
    docsBn: [
      "নোটারিকৃত অংশীদারি চুক্তিপত্র (Deed of Partnership)",
      "RJSC ফার্ম রেজিস্ট্রেশন সনদ (যদি থাকে)",
      "সকল অংশীদারের ব্যক্তিগত ই-টিন ও NID কপি",
      "ফার্মের বাণিজ্যিক কার্যালয়ের ঠিকানা",
    ],
    stepsEn: [
      {
        title: "Partner Validation",
        desc: "Confirm all partners possess active personal E-TINs.",
      },
      {
        title: "Firm Filing",
        desc: "Submit partnership application under partnership firm category.",
      },
      { title: "Delivery", desc: "Handover official Firm E-TIN certificate." },
    ],
    stepsBn: [
      {
        title: "অংশীদার যাচাই",
        desc: "অংশীদারদের ব্যক্তিগত ই-টিন সক্রিয়তা নিশ্চিতকরণ।",
      },
      {
        title: "আবেদন দাখিল",
        desc: "ফার্ম ক্যাটাগরিতে অনলাইন আবেদন সম্পন্নকরণ।",
      },
      { title: "সনদ হস্তান্তর", desc: "অংশীদারি ফার্মের ই-টিন সনদ হস্তান্তর।" },
    ],
    complianceEn:
      "Allows opening a firm bank account and filing independent partnership tax returns under Income Tax Act 2023.",
    complianceBn:
      "ফার্মের ব্যাংক হিসাব খোলা ও স্বতন্ত্র ফার্ম আয়কর রিটার্ন দাখিলের জন্য আবশ্যক।",
  },

  "E-TIN Correction": {
    overviewEn:
      "Official rectification of taxpayer particulars on the NBR E-TIN system, including name spelling, date of birth, address, circle changes, or father's/mother's details.",
    overviewBn:
      "জাতীয় রাজস্ব বোর্ডের সিস্টেমে ই-টিনের নাম, জন্মতারিখ, ঠিকানা বা কর অঞ্চল/সার্কেল সংশোধনের আনুষ্ঠানিক প্রক্রিয়া।",
    scopeEn: [
      "Review of discrepancy between NID/Passport database and tax records",
      "Filing formal correction request or circle transfer petition to the Tax Commissioner",
      "Systematic data realignment and issuance of updated E-TIN certificate",
    ],
    scopeBn: [
      "এনআইডি ও কর রেকর্ডের অমিল চিহ্নিতকরণ ও অডিট",
      "কর কমিশনারের কার্যালয়ে আনুষ্ঠানিক আবেদন বা সার্কেল পরিবর্তনের আবেদন দাখিল",
      "ডাটাবেজে তথ্য সংশোধন ও হালনাগাদ ই-টিন সনদ সংগ্রহ",
    ],
    docsEn: [
      "Current 12-digit E-TIN certificate copy",
      "Updated National ID (NID) copy or official Gazette notification",
      "Written explanation of correction grounds",
      "Utility bill or trade license (for address or circle updates)",
    ],
    docsBn: [
      "বিদ্যমান ১২-সংখ্যার ই-টিন সনদ কপি",
      "হালনাগাদ জাতীয় পরিচয়পত্র (NID) বা সংশোধিত সনদ",
      "সংশোধনের যৌক্তিকতা সম্বলিত ব্যাখ্যাপত্র",
      "ঠিকানা বা সার্কেল পরিবর্তনের ক্ষেত্রে বিদ্যুৎ বিল বা ট্রেড লাইসেন্স",
    ],
    stepsEn: [
      {
        title: "Discrepancy Audit",
        desc: "Verify correction requirements against national identification databases.",
      },
      {
        title: "Commissioner Submission",
        desc: "Submit formal petition to the territorial Commissioner of Taxes.",
      },
      {
        title: "Updated Certificate",
        desc: "Receive re-issued E-TIN certificate reflecting correct data.",
      },
    ],
    stepsBn: [
      {
        title: "অমিল যাচাই",
        desc: "জাতীয় ডেটাবেজের সাথে কর তথ্যের অমিল যাচাই।",
      },
      {
        title: "কমিশনারে আবেদন",
        desc: "সংশ্লিষ্ট কর কমিশনার বরাবরে আবেদন ও প্রমাণপত্র দাখিল।",
      },
      {
        title: "হালনাগাদ সনদ",
        desc: "সংশোধিত তথ্যাদিসহ নতুন ই-টিন সনদ গ্রহণ।",
      },
    ],
    complianceEn:
      "Turnaround time is 3 to 7 working days depending on whether circle transfer is required.",
    complianceBn:
      "সার্কেল পরিবর্তনের ওপর ভিত্তি করে ৩ থেকে ৭ কর্মদিবস সময় প্রয়োজন হয়।",
  },

  "E-TIN Cancel": {
    overviewEn:
      "Statutory deregistration and cancellation of redundant, duplicated, or inactive E-TIN records under the Income Tax Act 2023 with formal Tax Commissioner approval.",
    overviewBn:
      "অপ্রয়োজনীয়, দ্বৈত বা নিষ্ক্রিয় ই-টিন জাতীয় রাজস্ব বোর্ডের নিয়ম অনুযায়ী আনুষ্ঠানিকভাবে বাতিলকরণ।",
    scopeEn: [
      "Assessment of tax assessment history and non-filing liability audit",
      "Preparation of formal cancellation petition to the jurisdiction Tax Commissioner",
      "Attending tax circle hearings and verification of closure criteria",
      "Issuance of formal TIN Deregistration Clearance Order",
    ],
    scopeBn: [
      "কর ফাইল ও পূর্ববর্তী অ্যাসেসমেন্ট হিস্ট্রি অডিট",
      "কর কমিশনারের বরাবরে আনুষ্ঠানিক বাতিল আবেদন প্রস্তুত",
      "কর সার্কেলের শুনানি ও পরিদর্শনে প্রতিনিধিত্ব",
      "ই-টিন বাতিলের আনুষ্ঠানিক আদেশপত্র সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Original E-TIN certificate copies of all active/duplicate numbers",
      "NID copy of the applicant",
      "Written affidavit explaining grounds for duplicate generation or cessation of taxable income",
      "Zero-income return submission records (if directed by tax circle)",
    ],
    docsBn: [
      "বিদ্যমান বা দ্বৈত ই-টিন সনদের কপি",
      "আবেদনকারীর জাতীয় পরিচয়পত্র",
      "দ্বৈত রেজিস্ট্রেশন বা করযোগ্য আয় না থাকার কারণ সম্বলিত হলফনামা",
      "প্রযোজ্য ক্ষেত্রে সার্কেলের চাহিদা অনুযায়ী পূর্ববর্তী রিটার্ন জমার কপি",
    ],
    stepsEn: [
      {
        title: "Audit & Petition",
        desc: "Examine tax circle ledger and formulate cancellation petition.",
      },
      {
        title: "Circle Representation",
        desc: "Represent before Tax Circle officer and clear liabilities.",
      },
      {
        title: "Cancellation Order",
        desc: "Obtain approved Tax Commissioner cancellation order.",
      },
    ],
    stepsBn: [
      {
        title: "অডিট ও আবেদন",
        desc: "কর সার্কেল রেকর্ড যাচাইপূর্বক আবেদন প্রস্তুত।",
      },
      {
        title: "শুনানি ও সমন্বয়",
        desc: "কর কর্মকর্তার নিকট কারণ ব্যাখ্যা ও দায়মুক্তি নিশ্চিতকরণ।",
      },
      {
        title: "বাতিল আদেশ",
        desc: "অনুমোদিত কর কমিশনার বাতিল আদেশপত্র সংগ্রহ।",
      },
    ],
    complianceEn:
      "Protects taxpayers from recurring statutory penalties and notices under Section 166 for uncancelled duplicate records.",
    complianceBn:
      "অপ্রয়োজনীয় ই-টিনের বিপরীতে প্রতি বছর জরিমানা ও নোটিশের আইনি ঝুঁকি থেকে স্থায়ী মুক্তি দেয়।",
  },

  "Import License": {
    overviewEn:
      "Issuance of Import Registration Certificate (IRC) from the Office of the Chief Controller of Imports and Exports (CCI&E) under the Ministry of Commerce.",
    overviewBn:
      "বাণিজ্য মন্ত্রণালয়ের আমদানি ও রপ্তানি প্রধান নিয়ন্ত্রকের দপ্তর (CCI&E) থেকে আমদানি নিবন্ধন সনদ (IRC) গ্রহণ।",
    scopeEn: [
      "Import ceiling value determination and chamber membership validation",
      "Online OLM portal application preparation with CCI&E",
      "Government fee challan settlement via Sonali Bank / Bangladesh Bank",
      "Verification and delivery of official digital Import Registration Certificate (IRC)",
    ],
    scopeBn: [
      "আমদানি মূলধনী সীমা নির্ধারণ ও চেম্বার মেম্বারশিপ যাচাই",
      "CCI&E অনলাইন ওএলএম সিস্টেমে আবেদন দাখিল",
      "সরকারি ফি ও ভ্যাট চালান পরিশোধ",
      "অনুমোদিত আমদানি নিবন্ধন সনদ (IRC) সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Valid Trade License with commercial/industrial import line",
      "Active 13-digit VAT/BIN and corporate E-TIN certificates",
      "Bank Solvency Certificate & bank credit information letter",
      "Membership Certificate from recognized Chamber of Commerce (e.g. DCCI) or trade association",
      "Certificate of Incorporation and Form XII (for limited companies) or Partnership Deed",
    ],
    docsBn: [
      "আমদানি উপযোগী হালনাগাদ ট্রেড লাইসেন্স",
      "সক্রিয় ১৩-সংখ্যার ভ্যাট/BIN ও ই-টিন সনদ",
      "ব্যাংক সলভেন্সি সার্টিফিকেট ও ক্রেডিট ইনফরমেশন",
      "স্বীকৃত চেম্বার অব কমার্স (যেমন ঢাকা চেম্বার) বা অ্যাসোসিয়েশন সনদ",
      "ইনকর্পোরেশন ও ফরম XII অথবা অংশীদারি ডিড",
    ],
    stepsEn: [
      {
        title: "Chamber Enlistment",
        desc: "Ensure active membership with recognized trade chamber.",
      },
      {
        title: "OLM Submission",
        desc: "Upload credentials to CCI&E digital licensing portal.",
      },
      {
        title: "Fee Challan",
        desc: "Pay government statutory fees based on chosen import bracket.",
      },
      {
        title: "IRC Issuance",
        desc: "Receive digitally verified Import Registration Certificate.",
      },
    ],
    stepsBn: [
      {
        title: "চেম্বার সনদ",
        desc: "স্বীকৃত বাণিজ্যিক চেম্বার বা অ্যাসোসিয়েশন মেম্বারশিপ নিশ্চিতকরণ।",
      },
      {
        title: "অনলাইন আবেদন",
        desc: "CCI&E পোর্টালে প্রয়োজনীয় তথ্য ও ডকুমেন্ট আপলোড।",
      },
      {
        title: "চালান পরিশোধ",
        desc: "আমদানি সীমার ওপর নির্ধারিত সরকারি ফি প্রদান।",
      },
      {
        title: "সনদ প্রাপ্তি",
        desc: "ডিজিটালভাবে স্বাক্ষরিত IRC সনদ গ্রহণ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 3 to 5 working days. IRC requires annual renewal with CCI&E before September 30.",
    complianceBn:
      "৩ থেকে ৫ কর্মদিবসে সনদ পাওয়া যায়। প্রতি বছর ৩০ সেপ্টেম্বরের মধ্যে CCI&E পোর্টালে নবায়ন করতে হয়।",
  },

  "Export License": {
    overviewEn:
      "Issuance of Export Registration Certificate (ERC) from the Chief Controller of Imports and Exports (CCI&E) for commercial export of goods and commodities from Bangladesh.",
    overviewBn:
      "বাংলাদেশ থেকে বিদেশে পণ্য বা সেবা রপ্তানির জন্য CCI&E হতে রপ্তানি নিবন্ধন সনদ (ERC) গ্রহণ।",
    scopeEn: [
      "Classification of export sector and chamber affiliation checks",
      "CCI&E digital submission and documentation audit",
      "Payment of export license fees and treasury deposits",
      "Delivery of authenticated digital Export Registration Certificate (ERC)",
    ],
    scopeBn: [
      "রপ্তানি খাত ও সংশ্লিষ্ট চেম্বার সনদ যাচাই",
      "CCI&E সিস্টেমে আবেদন প্রক্রিয়াকরণ ও অডিট",
      "সরকারি ফি ও ট্রেজারি চালান পরিশোধ",
      "অনুমোদিত রপ্তানি নিবন্ধন সনদ (ERC) সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Updated Trade License specifying export operations",
      "Active E-TIN and 13-digit VAT/BIN certificates",
      "Bank Solvency Certificate from commercial bank",
      "Membership certificate from an approved trade chamber or export association",
      "Incorporation documents for companies or partnership deed",
    ],
    docsBn: [
      "রপ্তানি কার্যক্রম উল্লেখসহ হালনাগাদ ট্রেড লাইসেন্স",
      "সক্রিয় ই-টিন ও ১৩-সংখ্যার ভ্যাট/BIN সনদ",
      "ব্যাংক সলভেন্সি সার্টিফিকেট",
      "স্বীকৃত চেম্বার বা রপ্তানিকারক সমিতির সদস্যপদ সনদ",
      "কোম্পানি ইনকর্পোরেশন সনদ বা অংশীদারি ডিড",
    ],
    stepsEn: [
      {
        title: "Association Verification",
        desc: "Verify trade chamber accreditation.",
      },
      {
        title: "Portal Application",
        desc: "File online application through CCI&E licensing portal.",
      },
      { title: "Fee Settlement", desc: "Execute treasury fee challan." },
      {
        title: "ERC Delivery",
        desc: "Handover verified Export Registration Certificate.",
      },
    ],
    stepsBn: [
      {
        title: "মেম্বারশিপ যাচাই",
        desc: "চেম্বার বা অ্যাসোসিয়েশন সদস্যপদ নিশ্চিতকরণ।",
      },
      { title: "অনলাইন দাখিল", desc: "CCI&E পোর্টালে আবেদন সাবমিট।" },
      { title: "ফি জমা", desc: "ব্যাংক চালানের মাধ্যমে সরকারি ফি জমা।" },
      {
        title: "সনদ হস্তান্তর",
        desc: "ডিজিটাল ERC সনদ গ্রহণ ও ক্লায়েন্টকে হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround time is 3 to 5 business days. An active ERC is mandatory to execute Letters of Credit (LC) and negotiate outward export shipments.",
    complianceBn:
      "সাধারণত ৩ থেকে ৫ কর্মদিবসে পাওয়া যায়। এলসি খোলা ও বিদেশে পণ্য প্রেরণের জন্য ERC অপরিহার্য।",
  },

  "Factory License": {
    overviewEn:
      "Issuance of Factory License from the Department of Inspection for Factories and Establishments (DIFE) under the Bangladesh Labour Act 2006 and Bangladesh Labour Rules 2015.",
    overviewBn:
      "কলকারখানা ও প্রতিষ্ঠান পরিদর্শন অধিদপ্তর (DIFE) হতে বাংলাদেশ শ্রম আইন ২০০৬ অনুযায়ী কারখানা লাইসেন্স গ্রহণ।",
    scopeEn: [
      "Factory machinery, workforce capacity, and layout plan assessment",
      "Preparation of Form 1 application and site safety documentation",
      "Liaison during official inspector site audit and compliance inspection",
      "Issuance and delivery of official DIFE Factory License",
    ],
    scopeBn: [
      "কারখানার যন্ত্রপাতি, জনবল ও লে-আউট প্ল্যান মূল্যায়ন",
      "ফরম ১ আবেদন ও সেফটি ডকুমেন্টস প্রস্তুত",
      "DIFE পরিদর্শকের কারখানা পরিদর্শন সমন্বয়",
      "মূল কারখানা লাইসেন্স সংগ্রহ ও ক্লায়েন্টকে হস্তান্তর",
    ],
    docsEn: [
      "Factory layout plan approved by a certified engineer",
      "Trade license and 13-digit VAT/BIN certificate",
      "Fire Safety License from Fire Service and Civil Defence",
      "Environmental Clearance Certificate (ECC) from Department of Environment",
      "Machinery list with kilowatt/horsepower capacity",
      "Worker health, sanitation, and welfare compliance manual",
    ],
    docsBn: [
      "প্রকৌশলী কর্তৃক অনুমোদিত কারখানার লে-আউট ব্লু-প্রিন্ট",
      "ট্রেড লাইসেন্স ও ১৩-সংখ্যার ভ্যাট/BIN সনদ",
      "ফায়ার সার্ভিস ও সিভিল ডিফেন্সের ফায়ার লাইসেন্স",
      "পরিবেশ অধিদপ্তর হতে পরিবেশগত ছাড়পত্র (ECC)",
      "যন্ত্রপাতির তালিকা ও মোট মোটর হর্সপাওয়ার হিসাব",
      "শ্রমিকদের স্বাস্থ্য, সুরক্ষা ও কল্যাণমূলক ব্যবস্থার বিবরণী",
    ],
    stepsEn: [
      {
        title: "Layout Approval",
        desc: "Submit architectural and machinery layout plan for DIFE sanction.",
      },
      {
        title: "Physical Audit",
        desc: "Facilitate factory inspection by DIFE labour inspector.",
      },
      {
        title: "Fee Settlement",
        desc: "Pay statutory fee based on worker count and motor power.",
      },
      { title: "License Handover", desc: "Obtain official Factory License." },
    ],
    stepsBn: [
      {
        title: "লে-আউট অনুমোদন",
        desc: "কারখানার নকশা ও ব্লু-প্রিন্ট DIFE থেকে অনুমোদন।",
      },
      {
        title: "কারখানা পরিদর্শন",
        desc: "শ্রম পরিদর্শক কর্তৃক কারখানা চত্বর পরিদর্শন সমন্বয়।",
      },
      {
        title: "ফি পরিশোধ",
        desc: "শ্রমিক সংখ্যা ও মোট হর্সপাওয়ারের ওপর নির্ধারিত ফি প্রদান।",
      },
      {
        title: "লাইসেন্স প্রাপ্তি",
        desc: "আনুষ্ঠানিক কারখানা লাইসেন্স সংগ্রহ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 2 to 3 weeks following site inspection. Valid for one year, renewable annually in December.",
    complianceBn:
      "পরিদর্শনের পর ২ থেকে ৩ সপ্তাহ সময় লাগে। প্রতি বছর ৩১ ডিসেম্বরের মধ্যে লাইসেন্স নবায়নযোগ্য।",
  },

  "Fire License": {
    overviewEn:
      "Issuance of Fire Safety Clearance and License from Fire Service and Civil Defence (FSCD) under the Fire Prevention and Extinguishing Act 2003.",
    overviewBn:
      "ফায়ার সার্ভিস ও সিভিল ডিফেন্স অধিদপ্তর হতে বাণিজ্যিক বা শিল্প প্রতিষ্ঠানের জন্য ফায়ার লাইসেন্স সংগ্রহ।",
    scopeEn: [
      "Premises structural fire hazard risk evaluation",
      "Preparation of firefighting equipment installation plan and evacuation routes",
      "Coordination of physical site audit by FSCD inspection officers",
      "Delivery of authenticated Fire License certificate",
    ],
    scopeBn: [
      "ভবন বা প্রতিষ্ঠানের অগ্নিঝুঁকি ও নিরাপত্তা ব্যবস্থা মূল্যায়ন",
      "অগ্নি নির্বাপক যন্ত্রপাতি স্থাপন ও জরুরি বহির্গমন পরিকল্পনা প্রণয়ন",
      "ফায়ার সার্ভিস কর্মকর্তার পরিদর্শন সমন্বয়",
      "অনুমোদিত ফায়ার লাইসেন্স সনদ সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Trade License copy and premises rental agreement",
      "Building approval plan from municipal authority (RAJUK/CDA/City Corporation)",
      "Detailed layout blueprint showing fire exits and extinguisher points",
      "Bank challan of statutory fire fees",
      "Certificate of Incorporation (for corporate entities)",
    ],
    docsBn: [
      "ট্রেড লাইসেন্স ও ভাড়াচুক্তিপত্র",
      "রাজউক বা পৌরসভা কর্তৃক অনুমোদিত ভবনের নকশা",
      "অগ্নি নির্বাপক সিলিন্ডার, হোজরিল ও বহির্গমন পথ নির্দেশিত ফ্লোর প্ল্যান",
      "সরকারি ফি জমার ট্রেজারি চালান",
      "কোম্পানির ক্ষেত্রে ইনকর্পোরেশন সনদ",
    ],
    stepsEn: [
      {
        title: "Documentation & Plan",
        desc: "Draft evacuation floor plan and prepare application.",
      },
      {
        title: "Site Inspection",
        desc: "FSCD inspection officers conduct on-site equipment audit.",
      },
      {
        title: "Fee Challan",
        desc: "Deposit statutory government fire license fees.",
      },
      { title: "License Handover", desc: "Receive valid Fire Safety License." },
    ],
    stepsBn: [
      {
        title: "নকশা ও প্রস্তুতি",
        desc: "ফ্লোর প্ল্যানে সেফটি ইকুইপমেন্ট চিহ্নিতকরণ ও আবেদন প্রস্তুত।",
      },
      {
        title: "ফিল্ড পরিদর্শন",
        desc: "ফায়ার সার্ভিস কর্মকর্তা কর্তৃক সরেজমিনে সেফটি অডিট।",
      },
      { title: "চালান জমা", desc: "নির্ধারিত ট্রেজারি কোডে সরকারি ফি পরিশোধ।" },
      {
        title: "লাইসেন্স প্রাপ্তি",
        desc: "স্বাক্ষরিত ফায়ার লাইসেন্স গ্রহণ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 7 to 14 business days. Essential prerequisite for Factory Licenses, Trade Licenses in designated sectors, and insurance claims.",
    complianceBn:
      "সাধারণত ৭ থেকে ১৪ কর্মদিবস লাগে। কারখানা, ওয়্যারহাউস ও বাণিজ্যিক স্পেসের নিরাপত্তার জন্য এটি বাধ্যতামূলক।",
  },

  "BSTI Permission": {
    overviewEn:
      "Certification Marks (CM) License and Product Clearance from the Bangladesh Standards and Testing Institution (BSTI) under the BSTI Act 2018 for mandatory standard compliance.",
    overviewBn:
      "বাংলাদেশ স্ট্যান্ডার্ডস অ্যান্ড টেস্টিং ইনস্টিটিউশন (BSTI) হতে বাধ্যতামূলক পণ্যের সিএম (CM) লাইসেন্স ও মান অনুমোদন গ্রহণ।",
    scopeEn: [
      "Product classification under mandatory BSTI Bangladesh Standards (BDS)",
      "Factory lab testing parameter alignment and sample coordination",
      "BSTI technical officer factory audit representation",
      "Issuance of CM License enabling the official BSTI standard mark on packaging",
    ],
    scopeBn: [
      "বাধ্যতামূলক বিডিএস (BDS) মানদণ্ড অনুযায়ী পণ্যের বিশ্লেষণ",
      "ল্যাব টেস্ট ও স্যাম্পল প্রস্তুতকরণ সমন্বয়",
      "BSTI পরিদর্শকের কারখানা অডিট ও ল্যাব সমন্বয়",
      "সিএম (CM) লাইসেন্স গ্রহণ যার মাধ্যমে মোড়কে BSTI মানচিহ্ন ব্যবহারের অনুমতি মেলে",
    ],
    docsEn: [
      "Trade License, E-TIN, and 13-digit VAT/BIN certificates",
      "Trademark Registration or TM Application Receipt copy",
      "Factory layout plan and machinery specification list",
      "Factory in-house testing equipment details",
      "Product ingredient breakdown and manufacturing process flowchart",
    ],
    docsBn: [
      "ট্রেড লাইসেন্স, ই-টিন ও ভ্যাট/BIN সনদ",
      "ট্রেডমার্ক আবেদন বা নিবন্ধন সনদ কপি",
      "কারখানার লে-আউট ও যন্ত্রপাতির বিস্তারিত বিবরণ",
      "ল্যাবরেটরি টেস্ট ইকুইপমেন্টের তালিকা",
      "পণ্যের উপাদান তালিকা ও উৎপাদন প্রক্রিয়ার ফ্লোচার্ট",
    ],
    stepsEn: [
      {
        title: "Standard Identification",
        desc: "Map product against relevant mandatory BDS specification.",
      },
      {
        title: "Lab Testing",
        desc: "Submit product samples to BSTI central laboratory for testing.",
      },
      {
        title: "Factory Audit",
        desc: "Facilitate factory inspection by BSTI technical examiners.",
      },
      {
        title: "CM License Award",
        desc: "Obtain Certification Marks license certificate.",
      },
    ],
    stepsBn: [
      {
        title: "মানদণ্ড নির্ধারণ",
        desc: "পণ্যের জন্য প্রযোজ্য সরকারি BDS স্ট্যান্ডার্ড নির্ধারণ।",
      },
      {
        title: "ল্যাব টেস্ট",
        desc: "BSTI ল্যাবরেটরিতে স্যাম্পল জমা ও পরীক্ষার ফলাফল গ্রহণ।",
      },
      {
        title: "কারখানা পরিদর্শন",
        desc: "BSTI কর্মকর্তাদের সরেজমিন কোয়ালিটি অডিট।",
      },
      {
        title: "লাইসেন্স প্রাপ্তি",
        desc: "অনুমোদিত সিএম লাইসেন্স সংগ্রহ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 3 to 6 weeks. Selling products without mandatory BSTI certification constitutes a criminal offence under the BSTI Act.",
    complianceBn:
      "ল্যাব টেস্টের ওপর ভিত্তি করে ৩ থেকে ৬ সপ্তাহ সময় লাগে। নির্ধারিত পণ্যের ক্ষেত্রে BSTI অনুমোদন ছাড়া বিক্রি করা দণ্ডনীয় অপরাধ।",
  },

  "Environment Clearance": {
    overviewEn:
      "Issuance of Environmental Clearance Certificate (ECC) from the Department of Environment (DOE) under the Bangladesh Environment Conservation Act 1995 across Green, Orange-A, Orange-B, and Red industrial categories.",
    overviewBn:
      "পরিবেশ অধিদপ্তর (DOE) হতে গ্রিন, অরেঞ্জ-ক, অরেঞ্জ-খ বা লাল ক্যাটাগরির শিল্প ও প্রতিষ্ঠানের পরিবেশগত ছাড়পত্র (ECC) গ্রহণ।",
    scopeEn: [
      "Project categorization under Environmental Conservation Rules",
      "Preparation of Initial Environmental Examination (IEE) or Environmental Management Plan (EMP)",
      "Site clearance processing and environmental inspector audit liaison",
      "Issuance of Environmental Clearance Certificate (ECC)",
    ],
    scopeBn: [
      "পরিবেশ সংরক্ষণ বিধিমালা অনুযায়ী প্রকল্পের ক্যাটাগরি নির্ধারণ",
      "প্রাথমিক পরিবেশ সমীক্ষা (IEE) বা এনভায়রনমেন্টাল ম্যানেজমেন্ট প্ল্যান (EMP) প্রস্তুত",
      "স্থান ছাড়পত্র ও পরিবেশ পরিদর্শকের অডিট সমন্বয়",
      "পরিবেশগত ছাড়পত্র (ECC) সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Project Profile and detailed manufacturing process flowchart",
      "Effluent Treatment Plant (ETP) blueprint and specification (if applicable)",
      "Trade license and registered lease agreement",
      "No Objection Certificate (NOC) from local authority / Union Parishad",
      "Location map and layout plan",
    ],
    docsBn: [
      "প্রকল্প প্রোফাইল ও উৎপাদন প্রক্রিয়ার বিস্তারিত বিবরণ",
      "ইটিপি (ETP) বা বর্জ্য পরিশোধন প্ল্যান্টের নকশা (প্রযোজ্য ক্ষেত্রে)",
      "ট্রেড লাইসেন্স ও ভাড়াচুক্তিপত্র",
      "স্থানীয় কর্তৃপক্ষ বা চেয়ারম্যানের অনাপত্তিপত্র (NOC)",
      "প্রকল্পের মৌজা ম্যাপ ও লে-আউট নকশা",
    ],
    stepsEn: [
      {
        title: "Category Mapping",
        desc: "Classify into Green, Orange, or Red category under DOE schedule.",
      },
      {
        title: "EMP Formulation",
        desc: "Prepare environmental management and waste disposal plan.",
      },
      {
        title: "Site Audit",
        desc: "DOE inspectors verify site and pollution control infrastructure.",
      },
      {
        title: "Clearance Issuance",
        desc: "Receive official Environmental Clearance Certificate.",
      },
    ],
    stepsBn: [
      {
        title: "ক্যাটাগরি নির্ধারণ",
        desc: "সবুজ, কমলা বা লাল ক্যাটাগরি ম্যাপিং।",
      },
      {
        title: "EMP প্রণয়ন",
        desc: "বর্জ্য ব্যবস্থাপনা ও পরিবেশ সুরক্ষা পরিকল্পনা প্রস্তুত।",
      },
      {
        title: "মাঠ পরিদর্শন",
        desc: "পরিবেশ অধিদপ্তরের কর্মকর্তা কর্তৃক প্রকল্প পরিদর্শন।",
      },
      {
        title: "ছাড়পত্র গ্রহণ",
        desc: "অনুমোদিত পরিবেশগত ছাড়পত্র (ECC) সংগ্রহ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Green categories take 7 to 10 days; industrial Orange/Red categories take 3 to 6 weeks. Mandatory for industrial gas, power, and utility connections.",
    complianceBn:
      "সবুজ ক্যাটাগরিতে ৭-১০ দিন এবং শিল্প ক্যাটাগরিতে ৩-৬ সপ্তাহ লাগে। গ্যাস ও বিদ্যুৎ সংযোগের জন্য পরিবেশ ছাড়পত্র বাধ্যতামূলক।",
  },

  "Association Membership": {
    overviewEn:
      "Securing corporate membership in recognized national trade bodies, bilateral chambers, and commercial associations in Bangladesh.",
    overviewBn:
      "স্বীকৃত বাণিজ্যিক অ্যাসোসিয়েশন, চেম্বার অব কমার্স বা দ্বিপাক্ষিক বাণিজ্য সংস্থায় প্রাতিষ্ঠানিক সদস্যপদ গ্রহণ।",
    scopeEn: [
      "Identifying eligible trade associations matching business sectors",
      "Application drafting, member proposer/seconder coordination",
      "Executive committee representation and fee settlement",
      "Delivery of original Trade Association Membership Certificate",
    ],
    scopeBn: [
      "ব্যবসায়িক খাতের সঙ্গে মানানসই উপযুক্ত অ্যাসোসিয়েশন নির্বাচন",
      "আবেদন প্রস্তুত ও প্রস্তাবক/সমর্থক সদস্যের স্বাক্ষর সমন্বয়",
      "কার্যনির্বাহী কমিটির অনুমোদন ও মেম্বারশিপ ফি পরিশোধ",
      "সদস্যপদ সনদপত্র সংগ্রহ ও ক্লায়েন্টকে হস্তান্তর",
    ],
    docsEn: [
      "Valid Trade License, E-TIN, and 13-digit VAT/BIN",
      "Certificate of Incorporation and Form XII (for companies)",
      "National ID copies and photographs of directors/proprietor",
      "Bank Solvency Certificate in company name",
    ],
    docsBn: [
      "হালনাগাদ ট্রেড লাইসেন্স, ই-টিন ও ভ্যাট/BIN সনদ",
      "ইনকর্পোরেশন সনদ ও ফরম XII (কোম্পানির ক্ষেত্রে)",
      "পরিচালক বা স্বত্বাধিকারীর NID ও রঙিন ছবি",
      "প্রতিষ্ঠানের নামে ব্যাংক সলভেন্সি সনদ",
    ],
    stepsEn: [
      {
        title: "Association Selection",
        desc: "Select appropriate industry body (e.g. DCCI, FBCCI, BASIS, BGMEA).",
      },
      {
        title: "Endorsement",
        desc: "Coordinate signatures of existing standing member sponsors.",
      },
      {
        title: "Committee Approval",
        desc: "Receive membership approval and certificate.",
      },
    ],
    stepsBn: [
      {
        title: "সংস্থা নির্বাচন",
        desc: "খাতভিত্তিক উপযুক্ত বাণিজ্যিক অ্যাসোসিয়েশন নির্বাচন।",
      },
      {
        title: "প্রস্তাবক সমন্বয়",
        desc: "বিদ্যমান স্থায়ী সদস্যদের মাধ্যমে প্রস্তাব অনুমোদন।",
      },
      {
        title: "সনদ প্রাপ্তি",
        desc: "কমিটির অনুমোদন সাপেক্ষে মেম্বারশিপ সনদ গ্রহণ।",
      },
    ],
    complianceEn:
      "Turnaround is 1 to 2 weeks. Required prerequisite for obtaining Import and Export Registration Certificates (IRC/ERC).",
    complianceBn:
      "সাধারণত ১ থেকে ২ সপ্তাহ সময় লাগে। আমদানি ও রপ্তানি লাইসেন্স (IRC/ERC) পাওয়ার জন্য চেম্বার মেম্বারশিপ পূর্বশর্ত।",
  },

  "DHAKA Chamber of Commerce": {
    overviewEn:
      "Enlistment and membership processing with the Dhaka Chamber of Commerce & Industry (DCCI) for commercial credibility, international trade access, and IRC/ERC eligibility.",
    overviewBn:
      "ঢাকা চেম্বার অব কমার্স অ্যান্ড ইন্ডাস্ট্রি (DCCI)-এ সাধারণ বা সহযোগী সদস্যপদ অর্জন।",
    scopeEn: [
      "General or Associate class membership advisory",
      "Coordination of DCCI member proposers and seconders",
      "Document processing, interview facilitation, and entrance fee payment",
      "Handover of prestigious DCCI Certificate of Membership",
    ],
    scopeBn: [
      "জেনারেল বা অ্যাসোসিয়েট মেম্বারশিপ ক্যাটাগরি নির্ধারণ",
      "DCCI-এর বিদ্যমান ভোটার সদস্যদের প্রস্তাব ও সমর্থন সমন্বয়",
      "কাগজপত্র দাখিল, স্ক্রিনিং ও মেম্বারশিপ ফি পরিশোধ",
      "ঢাকা চেম্বারের অফিশিয়াল সদস্যপদ সনদ সংগ্রহ",
    ],
    docsEn: [
      "Trade License under Dhaka City Corporation (DNCC or DSCC)",
      "13-digit VAT/BIN and E-TIN certificate",
      "Bank solvency certificate confirming active commercial standing",
      "Incorporation documents (for companies) or Partnership deed",
      "Passport-sized photographs of applicant representative",
    ],
    docsBn: [
      "ঢাকা সিটি কর্পোরেশনভুক্ত হালনাগাদ ট্রেড লাইসেন্স",
      "১৩-সংখ্যার ভ্যাট/BIN ও ই-টিন সার্টিফিকেট",
      "ব্যাংক সলভেন্সি সার্টিফিকেট",
      "কোম্পানি ইনকর্পোরেশন ও ফরম XII অথবা পার্টনারশিপ ডিড",
      "প্রতিনিধির পাসপোর্ট সাইজের রঙিন ছবি",
    ],
    stepsEn: [
      {
        title: "Eligibility Audit",
        desc: "Verify trade license falls within DCCI jurisdictional area.",
      },
      {
        title: "Sponsorship",
        desc: "Arrange signatures of two permanent DCCI member sponsors.",
      },
      {
        title: "Issuance",
        desc: "Obtain official DCCI Membership Certificate.",
      },
    ],
    stepsBn: [
      {
        title: "যোগ্যতা যাচাই",
        desc: "ঢাকা ভৌগোলিক এলাকার ট্রেড লাইসেন্স ও ডকুমেন্টস যাচাই।",
      },
      {
        title: "স্পন্সর স্বাক্ষর",
        desc: "DCCI-এর দুইজন স্থায়ী সদস্যের স্বাক্ষর গ্রহণ।",
      },
      {
        title: "সনদ হস্তান্তর",
        desc: "DCCI মেম্বারশিপ সার্টিফিকেট সংগ্রহ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 5 to 7 business days. Membership must be renewed annually before December 31.",
    complianceBn:
      "কাগজপত্র জমা দেওয়ার ৫-৭ কর্মদিবসে সম্পন্ন হয়। প্রতি বছর ৩১ ডিসেম্বরের মধ্যে নবায়ন করতে হয়।",
  },

  "REHAB MEMBERSHIP": {
    overviewEn:
      "Securing membership in Real Estate & Housing Association of Bangladesh (REHAB) for real estate developers and housing builders.",
    overviewBn:
      "রিয়েল এস্টেট ডেভেলপার ও আবাসন নির্মাতাদের জন্য রিহ্যাব (REHAB) সদস্যপদ গ্রহণ।",
    scopeEn: [
      "Technical project profile assessment and land portfolio audit",
      "REHAB scrutiny committee documentation compilation",
      "Submitting formal admission dossier and entrance fee settlement",
      "Delivery of official REHAB Membership Certificate",
    ],
    scopeBn: [
      "রিয়েল এস্টেট প্রকল্প প্রোফাইল ও জমি সংক্রান্ত তথ্যাদি মূল্যায়ন",
      "রিহ্যাব স্ক্রুটিনি কমিটির চাহিদামাফিক ডকুমেন্টেশন প্রস্তুত",
      "আবেদন দাখিল ও সদস্যপদ ফি পরিশোধ",
      "অনুমোদিত রিহ্যাব মেম্বারশিপ সনদ সংগ্রহ",
    ],
    docsEn: [
      "Incorporation Certificate, MoA, and AoA specifying real estate development objects",
      "Trade License, E-TIN, and 13-digit VAT/BIN",
      "Proof of ongoing housing/apartment project documentation",
      "Bank solvency statement showing developer financial standing",
    ],
    docsBn: [
      "আবাসন ব্যবসা উল্লেখসহ ইনকর্পোরেশন সনদ ও গঠনতন্ত্র",
      "ট্রেড লাইসেন্স, ই-টিন ও ভ্যাট/BIN সনদ",
      "চলমান রিয়েল এস্টেট বা অ্যাপার্টমেন্ট প্রকল্পের জমির দলিল ও অনুমোদন",
      "উচ্চ আর্থিক সক্ষমতার ব্যাংক সলভেন্সি সনদ",
    ],
    stepsEn: [
      {
        title: "Project Audit",
        desc: "Audit real estate development legal credentials.",
      },
      {
        title: "Committee Review",
        desc: "Submit application to REHAB board of directors.",
      },
      {
        title: "Membership Award",
        desc: "Receive accredited REHAB membership.",
      },
    ],
    stepsBn: [
      { title: "প্রকল্প যাচাই", desc: "ডেভেলপার প্রকল্পের আইনি নথিপত্র অডিট।" },
      {
        title: "বোর্ড স্ক্রিনিং",
        desc: "রিহ্যাব পরিচালনা পর্ষদের নিকট আবেদন উপস্থাপন।",
      },
      { title: "সনদ প্রাপ্তি", desc: "অনুমোদিত রিহ্যাব সদস্যপদ সনদ সংগ্রহ।" },
    ],
    complianceEn:
      "Mandatory statutory prerequisite to obtain developer enlistment with RAJUK and CDA.",
    complianceBn:
      "রাজউক বা সিডিএ-তে ডেভেলপার তালিকাভুক্তির জন্য রিহ্যাব মেম্বারশিপ বাধ্যতামূলক।",
  },

  "RAJUK Enlistment": {
    overviewEn:
      "Statutory enlistment with Rajdhani Unnayan Kartripakkha (RAJUK) as an accredited Real Estate Developer or Engineering Construction Entity.",
    overviewBn:
      "রাজধানী উন্নয়ন কর্তৃপক্ষ (রাজউক)-এ আবাসন ডেভেলপার বা নির্মাণ প্রতিষ্ঠান হিসেবে তালিকাভুক্তি।",
    scopeEn: [
      "Architectural and structural engineering team credential audit",
      "Compilation of developer eligibility dossier under RAJUK regulations",
      "Submission to RAJUK Enlistment Committee and scrutiny liaison",
      "Issuance of official RAJUK Developer Enlistment Certificate",
    ],
    scopeBn: [
      "স্থপতি ও কাঠামোগত প্রকৌশলী দলের কারিগরি যোগ্যতা যাচাই",
      "রাজউক বিধিমালার আলোকে ডেভেলপার তালিকাভুক্তি ফাইল প্রস্তুত",
      "রাজউক তালিকাভুক্তি কমিটির নিকট আবেদন দাখিল ও সমন্বয়",
      "রাজউক ডেভেলপার তালিকাভুক্তি সনদ সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "REHAB Membership Certificate copy",
      "Incorporation Certificate and Form XII",
      "Architect and structural engineer qualification certificates and IAB/IEB registration",
      "Trade License, E-TIN, and 13-digit VAT/BIN",
    ],
    docsBn: [
      "রিহ্যাব (REHAB) সদস্যপদ সনদের কপি",
      "কোম্পানির ইনকর্পোরেশন ও ফরম XII",
      "স্থপতি ও স্ট্রাকচারাল ইঞ্জিনিয়ারের IEB/IAB সনদ ও জীবনবৃত্তান্ত",
      "হালনাগাদ ট্রেড লাইসেন্স, ই-টিন ও ভ্যাট/BIN সনদ",
    ],
    stepsEn: [
      {
        title: "Team Accreditation",
        desc: "Verify enrolled technical architects and civil engineers.",
      },
      {
        title: "RAJUK Scrutiny",
        desc: "Process application through RAJUK committee.",
      },
      {
        title: "Enlistment Delivery",
        desc: "Obtain official RAJUK developer certification.",
      },
    ],
    stepsBn: [
      {
        title: "কারিগরি টিম যাচাই",
        desc: "ইঞ্জিনিয়ার ও স্থপতির পেশাগত সনদ যাচাই।",
      },
      { title: "রাজউক যাচাই", desc: "রাজউক কমিটির মাধ্যমে নথিপত্র স্ক্রিনিং।" },
      { title: "তালিকাভুক্তি সনদ", desc: "রাজউক এনলিস্টমেন্ট সনদ সংগ্রহ।" },
    ],
    complianceEn:
      "Enables legal advertising, apartment booking, and building plan approvals within the RAJUK master plan area.",
    complianceBn:
      "রাজউক এলাকায় ভবন নির্মাণ ও অ্যাপার্টমেন্ট বিপণনের জন্য এটি আইনিভাবে বাধ্যতামূলক।",
  },

  "Others Membership": {
    overviewEn:
      "Membership processing for specialized trade associations including BASIS, BGMEA, BKMEA, BAPEX, FBCCI, and sectoral bilateral trade bodies.",
    overviewBn:
      "বেসিস (BASIS), বিজিএমইএ (BGMEA), বিকেএমইএ বা এফবিসিসিআই-এর মতো বিশেষায়িত খাতে সদস্যপদ অর্জন।",
    scopeEn: [
      "Sectoral criteria assessment and trade association matching",
      "Sponsor member endorsement and portfolio alignment",
      "Filing and liaison with association secretariats",
      "Handover of official membership credentials",
    ],
    scopeBn: [
      "খাতভিত্তিক মানদণ্ড মূল্যায়ন ও উপযুক্ত সমিতি নির্ধারণ",
      "প্রস্তাবক সদস্যের সমর্থন ও পোর্টফোলিও যাচাই",
      "অ্যাসোসিয়েশন সচিবালয়ে ফাইল উপস্থাপন ও সমন্বয়",
      "আনুষ্ঠানিক মেম্বারশিপ সনদ সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Trade License, E-TIN, and 13-digit VAT/BIN",
      "Sector-specific portfolio (e.g. software demos for BASIS, factory records for BGMEA)",
      "Bank solvency certificate and director profiles",
    ],
    docsBn: [
      "ট্রেড লাইসেন্স, ই-টিন ও ভ্যাট/BIN সনদ",
      "খাতভিত্তিক কাজের পোর্টফোলিও (যেমন বেসিসের জন্য সফটওয়্যার প্রমাণাদি)",
      "ব্যাংক সলভেন্সি সনদ ও পরিচালকদের প্রোফাইল",
    ],
    stepsEn: [
      {
        title: "Sector Mapping",
        desc: "Select dedicated industrial trade association.",
      },
      {
        title: "Secretariat Filing",
        desc: "Submit dossier to association membership board.",
      },
      {
        title: "Certification",
        desc: "Obtain recognized membership certificate.",
      },
    ],
    stepsBn: [
      {
        title: "খাত নির্ধারণ",
        desc: "নির্দিষ্ট বাণিজ্যিক অ্যাসোসিয়েশন নির্বাচন।",
      },
      { title: "আবেদন দাখিল", desc: "সংশ্লিষ্ট অ্যাসোসিয়েশনে আবেদন ও যাচাই।" },
      { title: "সনদ প্রাপ্তি", desc: "স্বীকৃত সদস্যপদ সনদ সংগ্রহ।" },
    ],
    complianceEn:
      "Unlocks sector tax incentives, government tender participation, and export cash incentives.",
    complianceBn:
      "খাতভিত্তিক প্রণোদনা, কর রেয়াত ও সরকারি নীতি সহায়তার সুবিধা নিশ্চিত করে।",
  },

  "DBID Certificate": {
    overviewEn:
      "Issuance of Digital Business Identification (DBID) from the Ministry of Commerce for e-commerce enterprises, digital marketplaces, and online shops under the National Digital Commerce Policy.",
    overviewBn:
      "বাণিজ্য মন্ত্রণালয় হতে ই-কমার্স ও অনলাইনভিত্তিক ব্যবসার জন্য বাধ্যতামূলক ডিজিটাল বিজনেস আইডেন্টিফিকেশন (DBID) সনদ গ্রহণ।",
    scopeEn: [
      "Website or social commerce platform terms, privacy, and return policy compliance review",
      "DBID portal application formulation and merchant profile setup",
      "Coordination with Ministry of Commerce verification officers",
      "Delivery of authentic DBID Certificate and digital badge registration",
    ],
    scopeBn: [
      "ওয়েবসাইট বা ফেসবুক পেইজের শর্তাবলী, রিটার্ন পলিসি ও ডেটা সুরক্ষা যাচাই",
      "বাণিজ্য মন্ত্রণালয়ের DBID পোর্টালে মার্চেন্ট প্রোফাইল ও আবেদন প্রস্তুত",
      "মন্ত্রণালয়ের যাচাই কর্মকর্তাদের সঙ্গে যোগাযোগ ও অনুমোদন সমন্বয়",
      "ডিজিটাল DBID সনদ ও অফিসিয়াল কিউআর ব্যাজ সংগ্রহ",
    ],
    docsEn: [
      "Valid Trade License specifying online/e-commerce operations",
      "Active website URL or operational social commerce page link",
      "Applicant proprietor/MD National ID and personal E-TIN",
      "13-digit VAT/BIN certificate",
      "Clear refund, replacement, and customer service delivery policies",
    ],
    docsBn: [
      "ই-কমার্স বা অনলাইন ব্যবসা উল্লেখসহ ট্রেড লাইসেন্স",
      "সক্রিয় ওয়েবসাইট ইউআরএল বা ফেসবুক বিজনেস পেইজ লিংক",
      "উদ্যোক্তার জাতীয় পরিচয়পত্র ও ব্যক্তিগত ই-টিন",
      "১৩-সংখ্যার ভ্যাট/BIN সার্টিফিকেট",
      "পণ্য ফেরত, রিফান্ড ও গ্রাহকসেবা সংক্রান্ত লিখিত নীতিমালা",
    ],
    stepsEn: [
      {
        title: "Digital Store Audit",
        desc: "Verify website displays pricing, return policy, and company credentials.",
      },
      {
        title: "DBID Filing",
        desc: "Submit online dossier through Ministry of Commerce DBID system.",
      },
      {
        title: "Certificate Handover",
        desc: "Receive authenticated DBID certificate and QR-enabled trust badge.",
      },
    ],
    stepsBn: [
      {
        title: "অনলাইন স্টোর অডিট",
        desc: "ওয়েবসাইটে মূল্য, রিফান্ড পলিসি ও কোম্পানির তথ্যাদি প্রদর্শন নিশ্চিতকরণ।",
      },
      {
        title: "DBID আবেদন",
        desc: "বাণিজ্য মন্ত্রণালয়ের DBID সিস্টেমে আবেদন দাখিল।",
      },
      {
        title: "সনদ ও ব্যাজ গ্রহণ",
        desc: "কিউআর কোডযুক্ত অফিসিয়াল DBID সার্টিফিকেট সংগ্রহ।",
      },
    ],
    complianceEn:
      "Turnaround is 7 to 10 working days. Required by payment gateways, courier aggregators, and commercial banks to process online transactions.",
    complianceBn:
      "৭ থেকে ১০ কর্মদিবসের মধ্যে সনদ ইস্যু হয়। পেমেন্ট গেটওয়ে ও কুরিয়ার সার্ভিসের সাথে ইন্টিগ্রেশনের জন্য DBID অপরিহার্য।",
  },

  "Travel Agency License": {
    overviewEn:
      "Issuance of Travel Agency Registration Certificate from the Ministry of Civil Aviation and Tourism under the Bangladesh Travel Agency (Registration and Control) Act 2013.",
    overviewBn:
      "বেসামরিক বিমান পরিবহন ও পর্যটন মন্ত্রণালয় হতে ট্রাভেল এজেন্সি নিবন্ধন সনদ ও পরিচালনা লাইসেন্স গ্রহণ।",
    scopeEn: [
      "Commercial office space inspection preparation matching aviation ministry standards",
      "Bank security deposit / bank guarantee coordination in favor of the ministry",
      "Compilation and physical submission of statutory travel agency application",
      "Delivery of authentic Travel Agency Registration Certificate",
    ],
    scopeBn: [
      "মন্ত্রণালয়ের নির্ধারিত মানদণ্ড অনুযায়ী ট্রাভেল এজেন্সির অফিস প্রস্তুতকরণ",
      "মন্ত্রণালয়ের অনুকূলে নির্ধারিত ব্যাংক জামানত বা ব্যাংক গ্যারান্টি সমন্বয়",
      "সংবিধিবদ্ধ আবেদন ফাইল প্রস্তুত ও বেসামরিক বিমান পরিবহন মন্ত্রণালয়ে দাখিল",
      "মূল ট্রাভেল এজেন্সি রেজিস্ট্রেশন সার্টিফিকেট সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Trade License explicitly mentioning Travel Agency business",
      "Bank Solvency Certificate and statutory Bank Guarantee / Security Deposit",
      "Commercial office space lease deed showing minimum required square footage",
      "E-TIN and 13-digit VAT/BIN certificates",
      "National ID copies and photos of all directors/partners",
    ],
    docsBn: [
      "ট্রাভেল এজেন্সি উল্লেখসহ হালনাগাদ ট্রেড লাইসেন্স",
      "ব্যাংক সলভেন্সি সনদ ও মন্ত্রণালয়ের অনুকূলে ব্যাংক গ্যারান্টি",
      "বাণিজ্যিক স্পেসের ভাড়াচুক্তিপত্র (ন্যূনতম নির্ধারিত আয়তনসহ)",
      "ই-টিন ও ১৩-সংখ্যার ভ্যাট/BIN সনদ",
      "সকল পরিচালক বা অংশীদারের NID ও রঙিন ছবি",
    ],
    stepsEn: [
      {
        title: "Office & Guarantee",
        desc: "Set up physical facility and arrange ministry bank guarantee.",
      },
      {
        title: "Ministry Inspection",
        desc: "Aviation ministry officials inspect premises and ticketing setup.",
      },
      {
        title: "License Issuance",
        desc: "Receive authenticated Travel Agency Registration Certificate.",
      },
    ],
    stepsBn: [
      {
        title: "অফিস ও জামানত",
        desc: "বাণিজ্যিক অফিস প্রস্তুত ও ব্যাংক গ্যারান্টি সম্পন্নকরণ।",
      },
      {
        title: "মন্ত্রণালয় পরিদর্শন",
        desc: "মন্ত্রণালয়ের পরিদর্শক কর্তৃক সরেজমিন অফিস পরিদর্শন।",
      },
      {
        title: "লাইসেন্স হস্তান্তর",
        desc: "স্বাক্ষরিত ট্রাভেল এজেন্সি সনদ গ্রহণ ও হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 3 to 4 weeks. Mandatory prerequisite to obtain an IATA accreditation and book international GDS ticketing terminals.",
    complianceBn:
      "সাধারণত ৩ থেকে ৪ সপ্তাহ সময় লাগে। IATA স্বীকৃতি ও আন্তর্জাতিক জিডিএস টিকিটিং পোর্টাল চালুর জন্য এটি পূর্বশর্ত।",
  },

  "BIDA Registration": {
    overviewEn:
      "Industrial project registration with Bangladesh Investment Development Authority (BIDA) for local and joint-venture manufacturing or service enterprises under the Prime Minister's Office.",
    overviewBn:
      "প্রধানমন্ত্রীর কার্যালয়াধীন বাংলাদেশ বিনিয়োগ উন্নয়ন কর্তৃপক্ষ (BIDA)-এ শিল্প বা সেবা প্রকল্প নিবন্ধন।",
    scopeEn: [
      "Project investment proposal formulation and machinery import plan structuring",
      "Online BIDA One Stop Service (OSS) portal application submission",
      "Liaison with BIDA investment officers through approval committee review",
      "Delivery of official BIDA Industrial Registration Certificate",
    ],
    scopeBn: [
      "বিনিয়োগ প্রস্তাবনা প্রস্তুত ও যন্ত্রপাতি আমদানির রূপরেখা প্রণয়ন",
      "BIDA ওয়ান স্টপ সার্ভিস (OSS) পোর্টালে আবেদন দাখিল",
      "BIDA কর্মকর্তাদের সাথে সমন্বয় ও অনুমোদন কমিটির পর্যালোচনা",
      "অফিসিয়াল BIDA ইন্ডাস্ট্রিয়াল রেজিস্ট্রেশন সনদ সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Certificate of Incorporation, MoA, and Form XII (for limited companies)",
      "Trade License, E-TIN, and 13-digit VAT/BIN",
      "Project Profile outlining machinery cost, raw materials, and manpower",
      "Factory or commercial space title deed or lease agreement",
      "Machinery price quotation or proforma invoice (for imported capital equipment)",
    ],
    docsBn: [
      "ইনকর্পোরেশন সনদ, স্মারকলিপি (MoA) ও ফরম XII",
      "হালনাগাদ ট্রেড লাইসেন্স, ই-টিন ও ভ্যাট/BIN",
      "যন্ত্রপাতি, কাঁচামাল ও জনবল সংবলিত প্রকল্প প্রোফাইল",
      "কারখানা বা প্রকল্পের জমির দলিল বা ভাড়াচুক্তি",
      "আমদানিতব্য মূলধনী যন্ত্রপাতির প্রফরমা ইনভয়েস বা কোটেশন",
    ],
    stepsEn: [
      {
        title: "OSS Application",
        desc: "Submit project dossier on BIDA One Stop Service portal.",
      },
      {
        title: "Technical Review",
        desc: "BIDA officers review capital structure and environmental readiness.",
      },
      {
        title: "Registration Delivery",
        desc: "Obtain official BIDA Industrial Registration Certificate.",
      },
    ],
    stepsBn: [
      {
        title: "OSS আবেদন",
        desc: "BIDA ওয়ান স্টপ সার্ভিস পোর্টালে বিস্তারিত প্রকল্প দাখিল।",
      },
      {
        title: "টেকনিক্যাল স্ক্রিনিং",
        desc: "বিনিয়োগ সক্ষমতা ও অবকাঠামোগত নথিপত্র যাচাই।",
      },
      {
        title: "সনদ সংগ্রহ",
        desc: "অনুমোদিত BIDA রেজিস্ট্রেশন সার্টিফিকেট হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 7 to 10 working days. Unlocks concessional customs duty on imported machinery, tax holidays, and work permit facilitations.",
    complianceBn:
      "৭ থেকে ১০ কর্মদিবসের মধ্যে সম্পন্ন হয়। মূলধনী যন্ত্রপাতির ওপর ১% কনসেশনাল শুল্ক ও কর অবকাশ সুবিধার জন্য এটি অপরিহার্য।",
  },

  "e-GP Registration": {
    overviewEn:
      "Contractor, supplier, and consultant enlistment on the national electronic Government Procurement (e-GP) portal operated by the Central Procurement Technical Unit (CPTU), IMED, Ministry of Planning.",
    overviewBn:
      "পরিকল্পনা মন্ত্রণালয়ের CPTU পরিচালিত জাতীয় ই-জিপি (e-GP) পোর্টালে ঠিকাদার, সরবরাহকারী ও পরামর্শক হিসেবে অনলাইন নিবন্ধন।",
    scopeEn: [
      "e-GP portal user account creation and category mapping",
      "Procurement of authorized Class 3 Digital Signature Certificate (DSC) USB token",
      "Electronic documentation submission and designated bank fee deposit",
      "Activation of live verified e-GP contractor bidding account",
    ],
    scopeBn: [
      "e-GP পোর্টালে ঠিকাদার প্রোফাইল তৈরি ও ক্যাটাগরি ম্যাপিং",
      "অনুমোদিত ক্লাস-৩ ডিজিটাল সিগনেচার সার্টিফিকেট (ডিজিটাল টোকেন) সংগ্রহ",
      "অনলাইন পোর্টালে নথিপত্র আপলোড ও নির্ধারিত ব্যাংকে সরকারি ফি জমা",
      "সক্রিয় e-GP দরপত্র বিডিং একাউন্ট অ্যাক্টিভেশন ও হস্তান্তর",
    ],
    docsEn: [
      "Updated Trade License specifying contractor or supplier work",
      "Active E-TIN and 13-digit VAT/BIN certificates",
      "National ID (NID) copy of authorized signatory",
      "Bank solvency certificate confirming financial capacity",
      "Incorporation documents or partnership deed (if company/firm)",
    ],
    docsBn: [
      "ঠিকাদারি বা সরবরাহ কাজের উপযুক্ত হালনাগাদ ট্রেড লাইসেন্স",
      "সক্রিয় ই-টিন ও ১৩-সংখ্যার ভ্যাট/BIN সনদ",
      "অনুমোদিত প্রতিনিধির জাতীয় পরিচয়পত্র (NID)",
      "ব্যাংক সলভেন্সি সার্টিফিকেট",
      "কোম্পানির ইনকর্পোরেশন বা অংশীদারি দলিল",
    ],
    stepsEn: [
      {
        title: "DSC Procurement",
        desc: "Obtain cryptographic Digital Signature Certificate USB token.",
      },
      {
        title: "Portal Enrollment",
        desc: "Register company profile on CPTU e-GP portal.",
      },
      {
        title: "Bank Activation",
        desc: "Pay e-GP registration fee at authorized bank to activate account.",
      },
    ],
    stepsBn: [
      {
        title: "ডিজিটাল সিগনেচার",
        desc: "অনুমোদিত ডিজিটাল সিগনেচার কিপাস টোকেন সংগ্রহ।",
      },
      {
        title: "পোর্টাল প্রোফাইল",
        desc: "e-GP পোর্টালে প্রতিষ্ঠানের প্রোফাইল তৈরি ও ডকুমেন্ট আপলোড।",
      },
      {
        title: "ব্যাংক সক্রিয়করণ",
        desc: "নির্ধারিত ব্যাংকে ফি জমা দিয়ে তাৎক্ষণিক অ্যাকাউন্ট সচলকরণ।",
      },
    ],
    complianceEn:
      "Turnaround is 2 to 3 business days. Essential prerequisite to participate in public procurement tenders across Bangladesh ministries.",
    complianceBn:
      "২ থেকে ৩ কর্মদিবসে সম্পন্ন হয়। সরকারি সকল মন্ত্রণালয়ের অনলাইন টেন্ডারে অংশ নেওয়ার জন্য এটি একমাত্র মাধ্যম।",
  },

  "Startup Business Package": {
    overviewEn:
      "Turnkey multi-regulatory onboarding bundle combining Company Incorporation, Trade License, E-TIN, 13-digit VAT/BIN, and Corporate Banking facilitation into a unified seamless journey.",
    overviewBn:
      "নতুন ব্যবসার জন্য পূর্ণাঙ্গ প্যাকেজ—কোম্পানি গঠন, ট্রেড লাইসেন্স, ই-টিন, ভ্যাট/BIN এবং ব্যাংক অ্যাকাউন্ট সহায়তা এক সেবায়।",
    scopeEn: [
      "RJSC Limited Company Incorporation with certified MoA, AoA, and Form XII",
      "Jurisdictional City Corporation or Pourashava Trade License issuance",
      "Corporate 12-digit E-TIN and 13-digit VAT/BIN registration",
      "Corporate banking documentation packet and account opening coordination",
      "Consolidated physical and digital handover of all corporate credentials",
    ],
    scopeBn: [
      "সার্টিফায়েড MoA, AoA ও ফরম XII-সহ RJSC লিমিটেড কোম্পানি নিবন্ধন",
      "সিটি কর্পোরেশন বা পৌরসভা থেকে বাণিজ্যিক ট্রেড লাইসেন্স সংগ্রহ",
      "কোম্পানির নামে ১২-সংখ্যার ই-টিন ও ১৩-সংখ্যার ভ্যাট/BIN সনদ",
      "করপোরেট ব্যাংক অ্যাকাউন্ট খোলার জন্য প্রয়োজনীয় নথিপত্র প্রস্তুত",
      "সকল সরকারি নথিপত্রের সমন্বিত ডিজিটাল ও প্রিন্ট হ্যান্ডওভার",
    ],
    docsEn: [
      "NID / Passport copies of all directors/shareholders",
      "Passport-sized formal photos of all directors",
      "Commercial office tenancy agreement with holding tax receipt",
      "Proposed company names in order of preference",
    ],
    docsBn: [
      "সকল পরিচালকদের NID বা পাসপোর্ট কপি",
      "সকল পরিচালকদের পাসপোর্ট সাইজের ছবি",
      "বাণিজ্যিক কার্যালয়ের ভাড়াচুক্তিপত্র ও ট্যাক্স রসিদ",
      "পছন্দের ক্রমানুসারে প্রস্তাবিত নামসমূহ",
    ],
    stepsEn: [
      {
        title: "RJSC Incorporation",
        desc: "Name clearance, MoA/AoA formulation, and incorporation certificate.",
      },
      {
        title: "Tax & Municipal Licenses",
        desc: "Simultaneous execution of Trade License, E-TIN, and VAT/BIN.",
      },
      {
        title: "Bank Facilitation",
        desc: "Handover verified packet to open operational corporate bank accounts.",
      },
    ],
    stepsBn: [
      {
        title: "কোম্পানি ইনকর্পোরেশন",
        desc: "নেম ক্লিয়ারেন্স ও ইনকর্পোরেশন সনদ সংগ্রহ।",
      },
      {
        title: "ট্যাক্স ও ট্রেড লাইসেন্স",
        desc: "একই সাথে ট্রেড লাইসেন্স, ই-টিন ও ভ্যাট/BIN সম্পন্নকরণ।",
      },
      {
        title: "ব্যাংক সুবিধা ও হ্যান্ডওভার",
        desc: "করপোরেট ব্যাংক হিসাব খোলার জন্য প্রস্তুত প্যাকেজ হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 7 to 10 working days for the full suite of statutory documents.",
    complianceBn:
      "সম্পূর্ণ প্যাকেজটি ৭ থেকে ১০ কর্মদিবসের মধ্যে প্রস্তুত হয়ে থাকে।",
  },

  Website: {
    overviewEn:
      "Custom responsive corporate website design and web application development with corporate branding, SSL encryption, and search engine optimization.",
    overviewBn:
      "আধুনিক, মোবাইল রেসপনসিভ ও এসইও-বান্ধব প্রাতিষ্ঠানিক ওয়েবসাইট ডিজাইন এবং ডেভেলপমেন্ট সেবা।",
    scopeEn: [
      "Custom responsive UI/UX architecture aligned with corporate brand identity",
      "Fast page load optimization, semantic HTML5, and responsive CSS design",
      "Integration of business contact modules, inquiry systems, and Google Analytics",
      "Domain configuration, business email setup, and secure SSL deployment",
    ],
    scopeBn: [
      "ব্র্যান্ড আইডেন্টিটির সঙ্গে সামঞ্জস্যপূর্ণ রেসপনসিভ UI/UX ডিজাইন",
      "দ্রুতগতির পারফরম্যান্স, ক্লিন কোড ও সার্চ ইঞ্জিন অপটিমাইজেশন (SEO)",
      "কন্টাক্ট ফর্ম, সার্ভিস ক্যাটালগ ও অ্যানালিটিক্স ইন্টিগ্রেশন",
      "ডোমেন ও হোস্টিং কনফিগারেশন, কর্পোরেট ইমেইল ও SSL নিরাপত্তা স্থাপন",
    ],
    docsEn: [
      "Company logo and brand identity guidelines",
      "Service and product descriptions with imagery",
      "Key leadership profiles and contact information",
    ],
    docsBn: [
      "কোম্পানির লোগো ও ব্র্যান্ড কালার নির্দেশিকা",
      "সেবা ও পণ্যের বিবরণ এবং প্রাসঙ্গিক ছবি",
      "কোম্পানির পরিচিতি ও যোগাযোগের তথ্যাদি",
    ],
    stepsEn: [
      {
        title: "Wireframing",
        desc: "Develop sitemap, UX wireframes, and responsive design mockups.",
      },
      {
        title: "Development",
        desc: "Engineer frontend code, CMS components, and mobile adaptability.",
      },
      {
        title: "Launch & SSL",
        desc: "Configure domain DNS, install SSL, and deploy live website.",
      },
    ],
    stepsBn: [
      {
        title: "নকশা ও প্ল্যানিং",
        desc: "সাইটম্যাপ ও রেসপনসিভ ওয়েব পেজ লে-আউট প্রস্তুত।",
      },
      {
        title: "ডেভেলপমেন্ট",
        desc: "কোডিং, মোবাইল ফ্রেন্ডলি ইন্টারফেস ও কনটেন্ট সংযোজন।",
      },
      {
        title: "লাইভ প্রকাশ",
        desc: "ডোমেন-হোস্টিং সংযোগ, SSL সক্রিয়করণ ও লাইভ টেস্টিং।",
      },
    ],
    complianceEn:
      "Delivery within 7 to 14 working days with complete ownership handover of source assets.",
    complianceBn:
      "৭ থেকে ১৪ কর্মদিবসে সম্পূর্ণ সোর্স কোড ও এক্সেসসহ ওয়েবসাইট হস্তান্তর করা হয়।",
  },

  "Logo Design": {
    overviewEn:
      "Professional vector brand identity creation, corporate trademark-ready logomarks, typography pairing, and visual branding standards.",
    overviewBn:
      "ট্রেডমার্কযোগ্য প্রফেশনাল ভেক্টর লোগো ডিজাইন, ব্র্যান্ড কালার প্যালেট ও ভিজ্যুয়াল আইডেন্টিটি প্যাকেজ।",
    scopeEn: [
      "Concept formulation and distinctiveness analysis for trademark eligibility",
      "High-resolution vector assets delivered in AI, EPS, SVG, PNG, and PDF formats",
      "Full color, monochrome, and inverted variants across light and dark backgrounds",
      "Mini brand style guide detailing exact hex colors, typography, and clearspace rules",
    ],
    scopeBn: [
      "ট্রেডমার্ক উপযোগী স্বতন্ত্র কনসেপ্ট ডেভেলপমেন্ট ও রিসার্চ",
      "AI, EPS, SVG, PNG এবং PDF ফরম্যাটে হাই-রেজোলিউশন ভেক্টর ফাইল",
      "হালকা ও গাঢ় ব্যাকগ্রাউন্ডের জন্য কালার ও মনোক্রোম সংস্করণ",
      "কালার কোড ও ফন্ট নির্দেশিকাসহ মিনি ব্র্যান্ড বুক",
    ],
    docsEn: [
      "Company vision, core industry, and target demographic profile",
      "Preferred color themes, typography style, and design inspirations",
      "Specific trademark class or product application context",
    ],
    docsBn: [
      "কোম্পানির লক্ষ্য, শিল্প খাত ও টার্গেট কাস্টমার পরিচিতি",
      "পছন্দের কালার টোন ও ডিজাইন রেফারেন্স",
      "লোগো ব্যবহারের মাধ্যম ও পণ্য ক্যাটাগরি",
    ],
    stepsEn: [
      {
        title: "Creative Ideation",
        desc: "Develop multiple distinct conceptual design directions.",
      },
      {
        title: "Refinement",
        desc: "Iterate typography, proportions, and color palettes based on feedback.",
      },
      {
        title: "Vector Master Assets",
        desc: "Deliver production-ready vector file package.",
      },
    ],
    stepsBn: [
      {
        title: "কনসেপ্ট তৈরি",
        desc: "একাধিক স্বতন্ত্র ডিজাইনের খসড়া উপস্থাপন।",
      },
      {
        title: "পরিমার্জন",
        desc: "মতামতের ভিত্তিতে কালার ও টাইপোগ্রাফি নিখুঁতকরণ।",
      },
      {
        title: "মাস্টার ফাইল হস্তান্তর",
        desc: "সকল প্রফেশনাল ভেক্টর ফাইল বুঝিয়ে দেওয়া।",
      },
    ],
    complianceEn:
      "Turnaround is 3 to 5 business days with full commercial and copyright transfer.",
    complianceBn:
      "৩ থেকে ৫ কর্মদিবসে চূড়ান্ত ভেক্টর ফাইলসমূহ হস্তান্তর করা হয়।",
  },

  "Digital Marketing": {
    overviewEn:
      "Targeted digital marketing, performance lead generation campaigns, social media business architecture, and search visibility management.",
    overviewBn:
      "ডিজিটাল প্ল্যাটফর্মে ব্র্যান্ড প্রবৃদ্ধি, লিড জেনারেশন ও সামাজিক যোগাযোগ মাধ্যম বিপণন সেবা।",
    scopeEn: [
      "Campaign strategy formulation across Meta (Facebook/Instagram) and Google Ads",
      "Target audience demographic and geographic profiling",
      "Ad copy creation, banner creative formatting, and conversion tracking setup",
      "Performance reporting, budget optimization, and audience retention management",
    ],
    scopeBn: [
      "মেটা (ফেসবুক/ইনস্টাগ্রাম) ও গুগল অ্যাডসের সমন্বিত বিজ্ঞাপন পরিকল্পনা",
      "টার্গেট অডিয়েন্স ও ভৌগোলিক মার্কেট রিসার্চ",
      "অ্যাড কপিরাইটিং, ক্রিয়েটিভ ব্যানার ও কনভার্সন ট্র্যাকিং সেটআপ",
      "বিজ্ঞাপনের পারফরম্যান্স অ্যানালাইসিস ও বাজেট অপটিমাইজেশন",
    ],
    docsEn: [
      "Business service/product pricing and unique selling proposition (USP)",
      "Access credentials to brand social media channels or ad managers",
      "Monthly advertising budget allocation",
    ],
    docsBn: [
      "পণ্য বা সেবার বিবরণ, মূল্য ও বিশেষ সুবিধাসমূহ",
      "বিজ্ঞাপন অ্যাকাউন্টের এক্সেস বা ব্র্যান্ড পেইজের লিংক",
      "মাসিক বিজ্ঞাপন বাজেটের রূপরেখা",
    ],
    stepsEn: [
      {
        title: "Audience Profiling",
        desc: "Define customer demographics and high-intent keyword targets.",
      },
      {
        title: "Campaign Launch",
        desc: "Deploy creative ad creatives with pixel tracking.",
      },
      {
        title: "Optimization",
        desc: "Refine targeting based on CPA and ROI performance data.",
      },
    ],
    stepsBn: [
      {
        title: "অডিয়েন্স ম্যাপিং",
        desc: "টার্গেট কাস্টমার ও কি-ওয়ার্ড নির্বাচন।",
      },
      {
        title: "ক্যাম্পেইন শুরু",
        desc: "বিজ্ঞাপন লাইভ করা ও কনভার্সন ট্র্যাকিং সক্রিয়করণ।",
      },
      {
        title: "ফলাফল বিশ্লেষণ",
        desc: "নিয়মিত পর্যবেক্ষণ ও সর্বোচ্চ রিটার্ন নিশ্চিতকরণ।",
      },
    ],
    complianceEn:
      "Campaign architecture established within 3 to 5 business days with weekly ROI tracking.",
    complianceBn: "৩ থেকে ৫ কর্মদিবসের মধ্যে প্রচারণা প্রস্তুত ও লাইভ করা হয়।",
  },

  Trademark: {
    overviewEn:
      "Complete statutory trademark registration and brand protection under the Trademarks Act 2009 with the Department of Patents, Designs and Trademarks (DPDT).",
    overviewBn:
      "পেটেন্ট, ডিজাইন ও ট্রেডমার্কস অধিদপ্তর (DPDT)-এর মাধ্যমে ট্রেডমার্ক আইন ২০০৯ অনুযায়ী ব্র্যান্ড নাম ও লোগো নিবন্ধন।",
    scopeEn: [
      "Comprehensive preliminary search across DPDT database to assess conflicting prior marks",
      "Nice Classification strategic advisory across Classes 1 to 45",
      "Preparation and formal filing of Form TM-1 application with registry receipt issuance",
      "Management of examination responses, Gazette publication, and opposition monitoring",
      "Issuance and delivery of original Certificate of Registration (Form TM-11)",
    ],
    scopeBn: [
      "DPDT ডেটাবেজে পূর্ববর্তী একই বা কাছাকাছি নামের বিরোধ যাচাইকরণ",
      "১ থেকে ৪৫ আন্তর্জাতিক নাইস শ্রেণিতে উপযুক্ত ক্লাস নির্বাচন",
      "ফরম TM-1 আবেদন প্রস্তুত ও দাখিলপূর্বক অফিসিয়াল ফাইলিং রসিদ গ্রহণ",
      "এক্সামিনেশন রিপোর্ট নিষ্পত্তি, গেজেট প্রকাশনা ও বিরোধিতা পর্যবেক্ষণ",
      "মূল ট্রেডমার্ক নিবন্ধন সনদপত্র (ফরম TM-11) সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "High-resolution image of mark or stylized logo in JPG/PNG/PDF",
      "Applicant NID/Passport (individual) or Trade License and Incorporation Certificate (corporate)",
      "Applicant full physical address and contact information",
      "Detailed description of products or services to be covered",
      "Date of first commercial use in Bangladesh or statement of proposed use",
      "Signed Form TM-48 (Power of Attorney authorizing representation)",
    ],
    docsBn: [
      "লোগো বা ব্র্যান্ড নামের স্পষ্ট হাই-রেজোলিউশন ছবি",
      "ব্যক্তির ক্ষেত্রে NID/পাসপোর্ট অথবা কোম্পানির ট্রেড লাইসেন্স ও ইনকর্পোরেশন কপি",
      "আবেদনকারীর পূর্ণাঙ্গ বাণিজ্যিক ঠিকানা ও যোগাযোগের তথ্য",
      "ব্র্যান্ডের আওতাভুক্ত পণ্য বা সেবাসমূহের তালিকা",
      "বাংলাদেশে প্রথম ব্যবহারের তারিখ অথবা প্রস্তাবিত ব্যবহারের ঘোষণা",
      "প্রতিনিধিত্বের জন্য স্বাক্ষরিত ফরম TM-48 (পাওয়ার অব অ্যাটর্নি)",
    ],
    stepsEn: [
      {
        title: "Pre-Filing Search",
        desc: "Execute comprehensive search on DPDT registry to ensure availability.",
      },
      {
        title: "Statutory TM-1 Filing",
        desc: "Submit formal application, pay government fee, and secure Application Number.",
      },
      {
        title: "Examination & Acceptance",
        desc: "Review official examination report and respond to examiner queries.",
      },
      {
        title: "Journal & Certificate",
        desc: "60-day Bangladesh Trademarks Journal publication followed by certificate issuance.",
      },
    ],
    stepsBn: [
      {
        title: "সার্চ ও যাচাই",
        desc: "DPDT রেজিস্টারে নাম বা লোগো যাচাই করে ছাড়পত্র সম্ভাবনা নির্ণয়।",
      },
      {
        title: "TM-1 আবেদন দাখিল",
        desc: "ফি জমা দিয়ে আবেদন দাখিল ও অফিশিয়াল স্লিপ সংগ্রহ।",
      },
      {
        title: "পরীক্ষা ও অনুমোদন",
        desc: "রেজিস্ট্রারের এক্সামিনেশন রিপোর্ট নিষ্পত্তি ও গ্রহণ নিশ্চিতকরণ।",
      },
      {
        title: "গেজেট ও সনদ",
        desc: "ট্রেডমার্কস জার্নালে ৬০ দিনের প্রকাশনা শেষে মূল সনদপত্র গ্রহণ।",
      },
    ],
    complianceEn:
      "Filing receipt issued within 2 to 3 days allowing immediate use of TM symbol. Final registration certificate valid for 7 years and renewable every 10 years.",
    complianceBn:
      "২-৩ দিনে ফাইলিং রসিদ পাওয়া যায় যার মাধ্যমে TM প্রতীক ব্যবহার করা যায়। মূল সনদের মেয়াদ ৭ বছর এবং পরবর্তীতে প্রতি ১০ বছর পর নবায়নযোগ্য।",
  },

  "Trademark Search": {
    overviewEn:
      "Official and exhaustive preliminary trademark clearance search across all 45 Nice classes in the DPDT database before filing to identify phonetic, visual, or conceptual conflicts.",
    overviewBn:
      "আবেদন করার পূর্বে DPDT রেজিস্টারে পূর্ববর্তী একই বা কাছাকাছি নামের বিরোধ আছে কিনা তা যাচাইয়ের আনুষ্ঠানিক সার্চ সেবা।",
    scopeEn: [
      "Phonetic, spelling, and semantic conflict query execution in official DPDT records",
      "Visual similarity assessment for stylized wordmarks and figurative device logos",
      "Comprehensive written Search Report outlining registration risks and advisory recommendations",
    ],
    scopeBn: [
      "DPDT ডেটাবেজে ধ্বনিগত, বানানগত ও অর্থগত মিলের পুঙ্খানুপুঙ্খ অনুসন্ধান",
      "লোগো বা চিহ্নের ক্ষেত্রে ভিজ্যুয়াল মিলের বিস্তারিত ঝুঁকি বিশ্লেষণ",
      "ঝুঁকি ও বিকল্প পরামর্শ সংবলিত লিখিত সার্চ রিপোর্ট প্রদান",
    ],
    docsEn: [
      "Proposed brand name, slogan, or wordmark",
      "Logo artwork image (if device mark search is required)",
      "List of products or services intended to be sold under the brand",
    ],
    docsBn: [
      "প্রস্তাবিত ব্র্যান্ড নাম বা স্লোগান",
      "লোগোর ছবি (যদি লোগো সার্চ প্রয়োজন হয়)",
      "যেসব পণ্য বা সেবায় ব্র্যান্ডটি ব্যবহৃত হবে তার তালিকা",
    ],
    stepsEn: [
      {
        title: "Search Execution",
        desc: "Query registry databases using specialized Boolean operators.",
      },
      {
        title: "Risk Analysis",
        desc: "Assess conflicting pending applications and registered trademarks.",
      },
      {
        title: "Report Handover",
        desc: "Deliver actionable legal clearance report with recommendations.",
      },
    ],
    stepsBn: [
      {
        title: "সার্চ পরিচালনা",
        desc: "সরকারি রেজিস্টারে পরিকল্পিত কি-ওয়ার্ড দিয়ে বিস্তারিত সার্চ।",
      },
      {
        title: "ঝুঁকি বিশ্লেষণ",
        desc: "বিদ্যমান ও প্রক্রিয়াধীন সমজাতীয় ট্রেডমার্কের সাথে তুলনা।",
      },
      {
        title: "রিপোর্ট প্রদান",
        desc: "আইনি পরামর্শসহ আনুষ্ঠানিক সার্চ রিপোর্ট ক্লায়েন্টকে হস্তান্তর।",
      },
    ],
    complianceEn:
      "Delivered within 24 to 48 hours. Prevents wasted government fees on marks prone to automatic rejection.",
    complianceBn:
      "২৪ থেকে ৪৮ ঘণ্টার মধ্যে পূর্ণাঙ্গ রিপোর্ট সরবরাহ করা হয়, যা আবেদন বাতিল হওয়ার ঝুঁকি দূর করে।",
  },

  "Trademark Application": {
    overviewEn:
      "Drafting, verification, and formal submission of Form TM-1 application with the Department of Patents, Designs and Trademarks (DPDT) with official filing receipt allocation.",
    overviewBn:
      "DPDT-তে ট্রেডমার্ক আবেদন (ফরম TM-1) প্রস্তুত ও সরকারি ফি পরিশোধপূর্বক আবেদন নম্বরসহ মূল রসিদ গ্রহণ।",
    scopeEn: [
      "Precision drafting of Form TM-1 specifying goods specifications under Nice classification",
      "Preparation of Form TM-48 (authorization of agent/advocate)",
      "Settlement of government treasury fees and digital submission with DPDT",
      "Delivery of official TM-1 Filing Receipt containing application number and priority date",
    ],
    scopeBn: [
      "নাইস ক্লাসিফিকেশন অনুযায়ী ফরম TM-1 নির্ভুলভাবে প্রস্তুত",
      "আইনি প্রতিনিধিত্বের জন্য ফরম TM-48 প্রস্তুত ও স্বাক্ষর গ্রহণ",
      "সরকারি ট্রেজারি ফি পরিশোধ ও DPDT রেজিস্ট্রারে আনুষ্ঠানিক দাখিল",
      "অফিসিয়াল অ্যাপ্লিকেশন নম্বর ও তারিখ সংবলিত মূল ফাইলিং স্লিপ হস্তান্তর",
    ],
    docsEn: [
      "Clear visual artwork of mark (JPG/PNG/PDF)",
      "Applicant NID or Certificate of Incorporation and Trade License",
      "Business address and user date declaration",
      "Signed authorization Form TM-48",
    ],
    docsBn: [
      "লোগো বা ব্র্যান্ডের স্পষ্ট ছবি",
      "আবেদনকারীর NID বা কোম্পানির ইনকর্পোরেশন ও ট্রেড লাইসেন্স",
      "বাণিজ্যিক ঠিকানা ও ব্যবহারের তারিখ সংক্রান্ত তথ্য",
      "স্বাক্ষরিত ফরম TM-48",
    ],
    stepsEn: [
      {
        title: "Application Preparation",
        desc: "Finalize TM-1 classification and itemized specification of goods.",
      },
      {
        title: "Registry Filing",
        desc: "Submit dossier to DPDT registry and deposit statutory fees.",
      },
      {
        title: "Receipt Handover",
        desc: "Deliver official filing acknowledgment enabling immediate use of TM symbol.",
      },
    ],
    stepsBn: [
      {
        title: "আবেদন ড্রাফটিং",
        desc: "ফরম TM-1 ও পণ্যের বিবরণী চূড়ান্তকরণ।",
      },
      {
        title: "রেজিস্ট্রারে জমা",
        desc: "সরকারি ফি জমা দিয়ে DPDT-তে আবেদন দাখিল।",
      },
      {
        title: "ফাইলিং রসিদ",
        desc: "অফিসিয়াল রসিদ সংগ্রহ যা TM প্রতীক ব্যবহারের আইনি সুযোগ দেয়।",
      },
    ],
    complianceEn:
      "Filing acknowledgment secured in 2 business days, conferring statutory priority from the date of submission.",
    complianceBn:
      "সাধারণত ২ কর্মদিবসের মধ্যে ফাইলিং স্লিপ পাওয়া যায় এবং ওই তারিখ হতেই অগ্রাধিকার কার্যকর হয়।",
  },

  "TM Objection": {
    overviewEn:
      "Drafting and filing formal legal responses to official examination reports, show-cause notices, and office action objections raised by the Trademark Registrar under the Trademarks Act 2009.",
    overviewBn:
      "ট্রেডমার্ক রেজিস্ট্রারের এক্সামিনেশন রিপোর্ট ও আপত্তির বিরুদ্ধে আইনি জবাব প্রণয়ন ও শুনানি পরিচালনা।",
    scopeEn: [
      "Analysis of Registrar's grounds of objection under Section 8, 9, or 10 of the Trademarks Act 2009",
      "Drafting persuasive written submissions substantiating distinctiveness and honest concurrent use",
      "Personal appearance and legal advocacy before the Registrar at official show-cause hearings",
      "Securing acceptance order and order for publication in the Trademarks Journal",
    ],
    scopeBn: [
      "ট্রেডমার্ক আইন ২০০৯-এর ৮, ৯ বা ১০ ধারার আপত্তির আইনি ভিত্তি বিশ্লেষণ",
      "স্বাতন্ত্র্য ও সৎ সমকালীন ব্যবহারের স্বপক্ষে শক্তিশালী লিখিত জবাব প্রণয়ন",
      "রেজিস্ট্রারের শুনানিতে সরাসরি অংশ নিয়ে আইনি যুক্তি উপস্থাপন",
      "আপত্তি নিষ্পত্তি করে ট্রেডমার্ক জার্নালে প্রকাশের অনুকূল আদেশ লাভ",
    ],
    docsEn: [
      "Copy of DPDT Examination Report or Show-Cause Notice",
      "Original TM-1 filing receipt and representation of mark",
      "Commercial evidence of market use (invoices, marketing flyers, packaging, media coverage)",
      "Affidavit of user with audited turnover data (if acquired distinctiveness is argued)",
    ],
    docsBn: [
      "DPDT এক্সামিনেশন রিপোর্ট বা আপত্তিপত্রের কপি",
      "মূল ফাইলিং স্লিপ ও লোগোর কপি",
      "বাজারে ব্র্যান্ড ব্যবহারের বাণিজ্যিক প্রমাণ (ইনভয়েস, বিলবোর্ড, সোশ্যাল মিডিয়া প্রমাণ)",
      "স্বাতন্ত্র্য প্রমাণের জন্য এফিডেভিট ও টার্নওভার তথ্য",
    ],
    stepsEn: [
      {
        title: "Objection Analysis",
        desc: "Deconstruct examiner's statutory refusal grounds.",
      },
      {
        title: "Written Submission",
        desc: "File detailed legal response citing precedents and market evidence.",
      },
      {
        title: "Hearing Representation",
        desc: "Advocate case at registry hearing to achieve formal mark acceptance.",
      },
    ],
    stepsBn: [
      {
        title: "আপত্তি পর্যালোচনা",
        desc: "রেজিস্ট্রারের উত্থাপিত আপত্তির কারণ বিশ্লেষণ।",
      },
      {
        title: "লিখিত জবাব দাখিল",
        desc: "আইনি নজির ও ব্যবহারের প্রমাণাদিসহ জবাব দাখিল।",
      },
      {
        title: "শুনানি পরিচালনা",
        desc: "রেজিস্ট্রারের নিকট শুনানি সম্পন্ন করে প্রকাশনার আদেশ গ্রহণ।",
      },
    ],
    complianceEn:
      "Responses must be lodged within 90 days of the examination notice date to prevent abandonment.",
    complianceBn:
      "নোটিশ প্রাপ্তির ৯০ দিনের মধ্যে জবাব দাখিল না করলে আবেদন বাতিল হয়ে যায়।",
  },

  "Trademark Publication/Gazette": {
    overviewEn:
      "Managing the statutory 60-day advertisement period in the official Bangladesh Trademarks Journal, monitoring competitor alerts, and securing clearance for final registration.",
    overviewBn:
      "বাংলাদেশ ট্রেডমার্কস জার্নালে ৬০ দিনের সরকারি গেজেট প্রকাশনা পর্যবেক্ষণ ও নিষ্পত্তি নিশ্চিতকরণ।",
    scopeEn: [
      "Preparation and verification of printing block particulars for journal insertion",
      "Payment of statutory journal publication gazette fees",
      "Tracking the publication release in the official Trademarks Journal",
      "Monitoring the mandatory 60-day public opposition window for third-party objections",
      "Advancing mark status to registration upon expiry of opposition timeline",
    ],
    scopeBn: [
      "জার্নালে মুদ্রণের জন্য ব্লকের বিবরণ ও লোগো যাচাইকরণ",
      "সরকারি প্রকাশনা ফি পরিশোধ",
      "ট্রেডমার্কস জার্নালে প্রকাশনা নিশ্চিতকরণ ও কপি সংরক্ষণ",
      "আইনসম্মত ৬০ দিনের গণ-বিরোধিতা সময়সীমা নিবিড় পর্যবেক্ষণ",
      "বিরোধিতা না এলে চূড়ান্ত নিবন্ধনের জন্য ফাইল পরবর্তী ধাপে রূপান্তর",
    ],
    docsEn: [
      "Acceptance order from the Trademark Examiner/Registrar",
      "High-contrast black-and-white and color blocks of mark",
      "Original TM application number and particulars",
    ],
    docsBn: [
      "ট্রেডমার্ক পরীক্ষক বা রেজিস্ট্রারের গ্রহণযোগ্যতা আদেশ",
      "লোগোর হাই-কনট্রাস্ট প্রিন্ট ব্লক",
      "মূল আবেদন নম্বর ও সংশ্লিষ্ট তথ্যাদি",
    ],
    stepsEn: [
      {
        title: "Block Submission",
        desc: "Deposit printing particulars and publication challan.",
      },
      {
        title: "Journal Monitoring",
        desc: "Verify publication in the running bi-monthly journal.",
      },
      {
        title: "Opposition Clearance",
        desc: "Monitor 60-day statutory period and confirm zero opposition.",
      },
    ],
    stepsBn: [
      {
        title: "ব্লক ও ফি দাখিল",
        desc: "গেজেট প্রকাশনা ফি ও ব্লক জমা দেওয়া।",
      },
      { title: "জার্নাল মনিটরিং", desc: "সরকারি জার্নালে প্রকাশ নিশ্চিতকরণ।" },
      {
        title: "সময়সীমা পার হওয়া",
        desc: "৬০ দিনের মধ্যে কোনো আপত্তি না এলে পরবর্তী পদক্ষেপ গ্রহণ।",
      },
    ],
    complianceEn:
      "If no third-party opposition is filed within 60 days of journal date, the mark proceeds directly to certificate issuance.",
    complianceBn:
      "জার্নাল প্রকাশের ৬০ দিনের মধ্যে কেউ বিরোধিতা না করলে সরাসরি সনদ ইস্যুর ধাপে যায়।",
  },

  "Trademark Opposition": {
    overviewEn:
      "Filing or defending formal opposition proceedings (Form TM-5) before the Registrar of Trademarks against infringing, conflicting, or deceptive third-party marks.",
    overviewBn:
      "ট্রেডমার্ক রেজিস্ট্রারের নিকট তৃতীয় পক্ষের বিতর্কিত মার্কের বিরুদ্ধে বিরোধিতা (TM-5) দায়ের বা আত্মপক্ষ সমর্থন।",
    scopeEn: [
      "Drafting and filing Notice of Opposition (Form TM-5) against conflicting journal marks",
      "Drafting Counter-Statement (Form TM-6) in defense of client's contested marks",
      "Preparing Evidence in Support of Opposition/Defense by way of sworn affidavits",
      "Representation and arguments before the Registrar at contested inter-partes hearings",
    ],
    scopeBn: [
      "গেজেটে প্রকাশিত সমজাতীয় মার্কের বিরুদ্ধে নোটিশ অব অপজিশন (ফরম TM-5) দাখিল",
      "বিরোধিতার জবাবে কাউন্টার স্টেটমেন্ট (ফরম TM-6) প্রণয়ন ও দাখিল",
      "হলফনামা ও বাজার ব্যবহারের নথিপত্রসহ তথ্যপ্রমাণ দাখিল",
      "রেজিস্ট্রারের নিকট উভয়পক্ষের উপস্থিতিতে আইনি শুনানি পরিচালনা",
    ],
    docsEn: [
      "Copy of the contested mark published in the Trademarks Journal",
      "Proof of prior use, prior registration certificates, and global trademark records",
      "Invoices, advertising expenses, and commercial proof demonstrating reputation and goodwill",
      "Signed Form TM-48 and sworn affidavits of facts",
    ],
    docsBn: [
      "জার্নালে প্রকাশিত বিতর্কিত ট্রেডমার্কের কপি",
      "পূর্ববর্তী ব্যবহার ও নিবন্ধনের প্রমাণপত্র",
      "প্রতিষ্ঠানের সুনাম, বিজ্ঞাপন ও বিক্রির ভাউচার সংবলিত প্রমাণাদি",
      "স্বাক্ষরিত পাওয়ার অব অ্যাটর্নি ও হলফনামা",
    ],
    stepsEn: [
      {
        title: "Notice of Opposition",
        desc: "File Form TM-5 within 60 days of journal publication.",
      },
      {
        title: "Pleadings & Evidence",
        desc: "Exchange counter-statements and submit documentary evidence.",
      },
      {
        title: "Hearing & Judgment",
        desc: "Argue opposition before the Registrar for final verdict.",
      },
    ],
    stepsBn: [
      {
        title: "বিরোধিতা দাখিল",
        desc: "জার্নাল প্রকাশের ৬০ দিনের মধ্যে ফরম TM-5 দাখিল।",
      },
      {
        title: "জবাব ও প্রমাণাদি",
        desc: "কাউন্টার স্টেটমেন্ট ও তথ্যপ্রমাণ বিনিময়।",
      },
      {
        title: "শুনানি ও রায়",
        desc: "রেজিস্ট্রারের সামনে শুনানি সম্পন্ন ও চূড়ান্ত রায় গ্রহণ।",
      },
    ],
    complianceEn:
      "Strict statutory deadlines apply; missing the 60-day opposition window forfeits the right to block the mark before the Registrar.",
    complianceBn:
      "৬০ দিনের সময়সীমা অত্যন্ত কঠোর; সময়মতো নোটিশ না দিলে মার্কটি নিবন্ধিত হয়ে যায়।",
  },

  "Trademark Certification": {
    overviewEn:
      "Procuring the final Certificate of Registration (Form TM-11) from the Department of Patents, Designs and Trademarks (DPDT) following successful completion of examination and publication.",
    overviewBn:
      "গেজেট প্রকাশনা ও ক্লিয়ারেন্স শেষে DPDT হতে মূল ট্রেডমার্ক সনদপত্র (ফরম TM-11) গ্রহণ ও হস্তান্তর।",
    scopeEn: [
      "Payment of statutory registration fees on Form TM-11",
      "Liaison with the DPDT Certificate Section for compilation and sealing",
      "Thorough verification of certificate particulars, owner title, and specification",
      "Handover of the original sealed Certificate of Registration",
    ],
    scopeBn: [
      "ফরম TM-11 অনুযায়ী সরকারি চূড়ান্ত নিবন্ধন ফি পরিশোধ",
      "DPDT সার্টিফিকেট শাখার সাথে সমন্বয় ও সিলের তদারকি",
      "সনদে উল্লেখিত নাম, লোগো ও শ্রেণির নির্ভুলতা যাচাই",
      "অফিসিয়াল সিলমোহরযুক্ত মূল সনদ ক্লায়েন্টকে হস্তান্তর",
    ],
    docsEn: [
      "Original TM-1 filing receipt and Application Number",
      "Copy of relevant Trademarks Journal publication page",
      "Proof of zero pending opposition order",
    ],
    docsBn: [
      "মূল TM-1 ফাইলিং স্লিপ ও আবেদন নম্বর",
      "ট্রেডমার্কস জার্নালে সংশ্লিষ্ট প্রকাশনার পৃষ্ঠা",
      "বিরোধিতা না থাকার প্রত্যয়ন কপি",
    ],
    stepsEn: [
      {
        title: "Fee Deposit",
        desc: "Pay statutory registration issuance fee to DPDT.",
      },
      {
        title: "Registry Sealing",
        desc: "Registrar signs and seals formal Certificate of Registration.",
      },
      {
        title: "Handover",
        desc: "Deliver original Certificate of Registration.",
      },
    ],
    stepsBn: [
      { title: "ফি জমা", desc: "নির্ধারিত ট্রেজারি কোডে সার্টিফিকেট ফি জমা।" },
      {
        title: "স্বাক্ষর ও সিল",
        desc: "রেজিস্ট্রার কর্তৃক সনদ স্বাক্ষর ও সিলমোহরযুক্তকরণ।",
      },
      {
        title: "সনদ হস্তান্তর",
        desc: "মূল ট্রেডমার্ক সার্টিফিকেট ক্লায়েন্টকে হস্তান্তর।",
      },
    ],
    complianceEn:
      "Grants exclusive nationwide proprietary rights and enables the registered symbol (®). Initial term is 7 years from the application date.",
    complianceBn:
      "সার্টিফিকেট পাওয়ার পর নিবন্ধিত প্রতীক (®) ব্যবহারের আইনি অধিকার মেলে। প্রাথমিক মেয়াদ ৭ বছর।",
  },

  "Trademark Class Finder": {
    overviewEn:
      "Strategic multi-class consultation and classification under the Nice Classification system (Goods Classes 1-34, Services Classes 35-45) to ensure optimal trademark coverage without overpaying.",
    overviewBn:
      "আন্তর্জাতিক নাইস ক্লাসিফিকেশন (১ থেকে ৪৫ ক্লাস) অনুযায়ী ব্যবসার ধরন বুঝে সঠিক শ্রেণি নির্বাচন ও পরামর্শ।",
    scopeEn: [
      "Comprehensive analysis of client's current offerings and projected 5-year product roadmap",
      "Strategic classification across Goods (1-34) and Services (35-45)",
      "Formulation of precision specification lists minimizing broad-scope registry rejections",
    ],
    scopeBn: [
      "বর্তমান পণ্য ও ভবিষ্যৎ ৫ বছরের সম্প্রসারণ পরিকল্পনা পর্যালোচনা",
      "পণ্য (১-৩৪) ও সেবা (৩৫-৪৫) ক্যাটাগরিতে কৌশলগত ক্লাস নির্ধারণ",
      "অতিরিক্ত সরকারি ফি না দিয়ে সর্বোচ্চ সুরক্ষামূলক ক্লাস নির্বাচন",
    ],
    docsEn: [
      "Complete inventory list of current and planned products/services",
      "Company marketing catalog or web store link",
    ],
    docsBn: [
      "বর্তমান ও প্রস্তাবিত পণ্য বা সেবাসমূহের পূর্ণাঙ্গ তালিকা",
      "কোম্পানির ব্রোশার, ক্যাটালগ বা ওয়েবসাইটের বিবরণ",
    ],
    stepsEn: [
      {
        title: "Product Mapping",
        desc: "Map business offerings to official Nice classification terms.",
      },
      {
        title: "Class Consolidation",
        desc: "Identify primary defensive classes and peripheral categories.",
      },
      {
        title: "Schedule Delivery",
        desc: "Provide itemized filing schedule with fee estimates.",
      },
    ],
    stepsBn: [
      { title: "ম্যাপিং", desc: "নাইস ক্লাসিফিকেশনের সাথে পণ্যের মিলকরণ।" },
      {
        title: "ক্লাস বাছাই",
        desc: "প্রয়োজনীয় ও সহায়ক ক্লাসসমূহ চিহ্নিতকরণ।",
      },
      {
        title: "পরিকল্পনা প্রদান",
        desc: "ফি হিসাবসহ ক্লাসিফিকেশন রিপোর্ট হস্তান্তর।",
      },
    ],
    complianceEn:
      "Prevents invalid applications; marks registered under the wrong class provide zero legal protection for actual products.",
    complianceBn:
      "ভুল ক্লাসে রেজিস্ট্রেশন করলে মূল পণ্যের কোনো আইনি সুরক্ষা থাকে না, যা এই সেবায় নিশ্চিত করা হয়।",
  },

  "Expert Trademark Review": {
    overviewEn:
      "In-depth brand asset review, trademark portfolio risk audit, licensing strategy, and defensive filing recommendations by senior intellectual property advisors.",
    overviewBn:
      "সিনিয়র আইপি উপদেষ্টাদের মাধ্যমে বিদ্যমান ব্র্যান্ড অডিট, ঝুঁকি মূল্যায়ন ও সমন্বিত প্রতিরক্ষা কৌশল প্রণয়ন।",
    scopeEn: [
      "Detailed audit of existing trademarks, unregistered brand assets, and domain names",
      "Identification of vulnerability gaps against competitor squatting and counterfeiters",
      "Formulation of multi-jurisdictional filing and brand protection roadmap",
    ],
    scopeBn: [
      "বিদ্যমান ট্রেডমার্ক, অনিবন্ধিত ব্র্যান্ড সম্পদ ও ডোমেন অডিট",
      "প্রতিযোগী কর্তৃক নকল বা জালিয়াতির ঝুঁকি চিহ্নিতকরণ",
      "ব্র্যান্ডের সমন্বিত আইনি সুরক্ষার রোডম্যাপ ও কর্মপরিকল্পনা প্রণয়ন",
    ],
    docsEn: [
      "Existing registration certificates and pending application slips",
      "Brand style guide and commercial product portfolio",
      "Details of any ongoing marketplace disputes or notices",
    ],
    docsBn: [
      "বিদ্যমান সনদ বা প্রক্রিয়াধীন ফাইলিং স্লিপসমূহ",
      "ব্র্যান্ড গাইড ও পণ্যের বর্তমান বাজার বিবরণ",
      "কোনো লিগ্যাল নোটিশ বা বিরোধ থাকলে তার বিবরণ",
    ],
    stepsEn: [
      {
        title: "Portfolio Audit",
        desc: "Review all active and pending intellectual property records.",
      },
      {
        title: "Risk Evaluation",
        desc: "Assess trademark distinctiveness and enforcement viability.",
      },
      {
        title: "Strategic Roadmap",
        desc: "Deliver actionable intellectual property advisory report.",
      },
    ],
    stepsBn: [
      {
        title: "অডিট",
        desc: "সকল ব্র্যান্ড সম্পদের বর্তমান আইনি অবস্থা যাচাই।",
      },
      {
        title: "ঝুঁকি মূল্যায়ন",
        desc: "স্বাতন্ত্র্য ও এনফোর্সমেন্ট সক্ষমতা পরিমাপ।",
      },
      { title: "পরামর্শ প্রদান", desc: "লিখিত স্ট্র্যাটেজিক রিপোর্ট প্রদান।" },
    ],
    complianceEn:
      "Strengthens corporate enterprise valuation for venture investment and licensing agreements.",
    complianceBn:
      "কোম্পানির প্রাতিষ্ঠানিক মূল্যায়ন বৃদ্ধি করে এবং বিনিয়োগকারী ও অংশীদারদের আস্থা নিশ্চিত করে।",
  },

  "Copyright Registration": {
    overviewEn:
      "Statutory copyright registration with the Copyright Office Bangladesh under the Copyright Act 2000 for software code, literary works, artistic designs, website assets, and musical works.",
    overviewBn:
      "কপিরাইট আইন ২০০০ অনুযায়ী সফটওয়্যার কোড, সাহিত্য, শিল্পকর্ম বা নকশার সরকারি কপিরাইট নিবন্ধন।",
    scopeEn: [
      "Authorship and work classification under the Copyright Act 2000",
      "Compilation of Form II application and statement of particulars",
      "Liaison with Copyright Office examiners and gazette/notification compliance",
      "Delivery of official Certificate of Copyright Registration",
    ],
    scopeBn: [
      "কপিরাইট আইনের আওতায় কর্মের ধরন ও স্বত্বাধিকার মূল্যায়ন",
      "ফরম ২ আবেদন ও কাজের বিস্তারিত বিবরণী প্রস্তুত",
      "কপিরাইট অফিসের কর্মকর্তাদের সাথে সমন্বয় ও যাচাই",
      "মূল কপিরাইট নিবন্ধন সনদপত্র সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Four physical copies or digital deposits of the work (software source code, manuscript, artwork)",
      "Applicant/Author NID or Passport copy",
      "Deed of assignment / No Objection Certificate from employer (if work for hire)",
      "Bank challan of statutory copyright fees",
    ],
    docsBn: [
      "কাজের ৪ সেট কপি (সফটওয়্যার কোড, স্ক্রিপ্ট বা আর্টওয়ার্ক)",
      "লেখক বা আবেদনকারীর NID বা পাসপোর্ট কপি",
      "নিয়োগদাতার অনুকূলে হস্তান্তর দলিল বা অনাপত্তিপত্র (প্রযোজ্য ক্ষেত্রে)",
      "সরকারি ফি জমার ট্রেজারি চালান",
    ],
    stepsEn: [
      {
        title: "Work Deposit",
        desc: "Format deposit materials matching Copyright Office guidelines.",
      },
      {
        title: "Form II Submission",
        desc: "Submit formal application and pay government treasury fees.",
      },
      {
        title: "Certificate Issuance",
        desc: "Receive authenticated Certificate of Copyright.",
      },
    ],
    stepsBn: [
      {
        title: "কপি প্রস্তুত",
        desc: "কপিরাইট অফিসের নির্ধারিত মাপে কাজের কপি প্রস্তুত।",
      },
      {
        title: "আবেদন দাখিল",
        desc: "ফরম ২ দাখিল ও সরকারি ট্রেজারি চালান জমা।",
      },
      {
        title: "সনদ গ্রহণ",
        desc: "স্বাক্ষরিত ও সিলমোহরযুক্ত কপিরাইট সনদ গ্রহণ।",
      },
    ],
    complianceEn:
      "Turnaround is 3 to 5 weeks. Copyright protection endures for the author's lifetime plus 60 years post-mortem.",
    complianceBn:
      "সাধারণত ৩ থেকে ৫ সপ্তাহ সময় লাগে। কপিরাইট সুরক্ষার মেয়াদ প্রণেতার আজীবন এবং মৃত্যুর পর আরও ৬০ বছর।",
  },

  "Patent Registration": {
    overviewEn:
      "Filing and prosecution of Patent Applications for novel industrial inventions and technological innovations under the Patent Act with the Department of Patents, Designs and Trademarks (DPDT).",
    overviewBn:
      "নতুন বৈজ্ঞানিক বা শিল্প উদ্ভাবনের আইনি সুরক্ষায় DPDT-তে প্যাটেন্ট আবেদন ও নিবন্ধন।",
    scopeEn: [
      "Patentability search assessing novelty, inventive step, and industrial applicability",
      "Technical patent specification drafting including background, detailed description, and claims",
      "Filing Form 1A with provisional or complete patent specifications",
      "Handling official examination objections, gazette publication, and grant of Letters Patent",
    ],
    scopeBn: [
      "উদ্ভাবনের নতুনত্ব (Novelty) ও শিল্পে প্রয়োগযোগ্যতা সংক্রান্ত প্রি-ফাইলিং অনুসন্ধান",
      "টেকনিক্যাল প্যাটেন্ট স্পেসিফিকেশন ও ক্লেইমস (Claims) খসড়া প্রণয়ন",
      "সম্পূর্ণ বিবরণীসহ ফরম 1A আবেদন DPDT-তে দাখিল",
      "পরীক্ষকের আপত্তি নিষ্পত্তি ও লেটার্স প্যাটেন্ট সনদ গ্রহণ",
    ],
    docsEn: [
      "Technical description of invention with engineering diagrams and schematics",
      "Clear claim sets defining the boundary of proprietary protection",
      "Inventor and applicant NID, passport, and assignment deeds",
      "Signed Form 26 (Power of Attorney)",
    ],
    docsBn: [
      "উদ্ভাবনের বিস্তারিত কারিগরি বিবরণ ও ইঞ্জিনিয়ারিং ডায়াগ্রাম",
      "সুরক্ষার পরিধি নির্দিষ্ট করে প্রস্তুতকৃত ক্লেইমস (Claims)",
      "উদ্ভাবক ও আবেদনকারীর NID/পাসপোর্ট ও স্বত্ব অর্পণের দলিল",
      "স্বাক্ষরিত ফরম ২৬ (পাওয়ার অব অ্যাটর্নি)",
    ],
    stepsEn: [
      {
        title: "Prior Art Search",
        desc: "Verify global novelty and patentability criteria.",
      },
      {
        title: "Specification Drafting",
        desc: "Draft techno-legal patent specification and claims.",
      },
      {
        title: "DPDT Filing & Grant",
        desc: "Submit application, manage substantive examination, and achieve grant.",
      },
    ],
    stepsBn: [
      {
        title: "প্রাইয়ার আর্ট সার্চ",
        desc: "বিশ্বব্যাপী উদ্ভাবনের নতুনত্ব যাচাই।",
      },
      {
        title: "স্পেসিফিকেশন প্রণয়ন",
        desc: "আইনি ও কারিগরি ক্লেইমস ড্রাফটিং।",
      },
      {
        title: "আবেদন ও সনদ",
        desc: "আবেদন দাখিল, এক্সামিনেশন নিষ্পত্তি ও প্যাটেন্ট মঞ্জুরি লাভ।",
      },
    ],
    complianceEn:
      "Multi-stage prosecution over 18 to 24 months. Granted patents confer a 20-year exclusive commercial monopoly.",
    complianceBn:
      "পুরো প্রক্রিয়াটি ১৮ থেকে ২৪ মাস সময় নেয়। প্যাটেন্ট মঞ্জুর হলে ২০ বছর একচেটিয়া বাণিজ্যিক অধিকার নিশ্চিত হয়।",
  },

  "Income Tax": {
    overviewEn:
      "Annual corporate and individual income tax planning, calculation, assessment preparation, and compliance filings under the Income Tax Act 2023.",
    overviewBn:
      "আয়কর আইন ২০২৩ অনুযায়ী ব্যক্তি ও প্রতিষ্ঠানের বার্ষিক আয়কর পরিকল্পনা, রিটার্ন প্রস্তুতি ও কর নির্ধারণ।",
    scopeEn: [
      "Detailed taxable income computation across salary, business, house property, and capital gains",
      "Investment tax rebate optimization under current statutory schedules",
      "Preparation of Form IT-11GA and statement of assets, liabilities, and lifestyle expenses",
      "Filing with territorial Tax Circle and delivery of official Acknowledgment Slip",
    ],
    scopeBn: [
      "বেতন, ব্যবসা, গৃহসম্পত্তি ও মূলধনী লাভ থেকে করযোগ্য আয়ের পুঙ্খানুপুঙ্খ হিসাব",
      "বিনিয়োগ কর রেয়াত বা রিবেট হিসাব করে প্রদেয় কর ন্যূনতমকরণ",
      "আয়কর রিটার্ন ফরম ও পরিসম্পদ, দায় ও জীবনযাত্রার ব্যয় বিবরণী প্রস্তুত",
      "কর সার্কেলে রিটার্ন দাখিল ও অফিশিয়াল প্রাপ্তি স্বীকারপত্র (Acknowledgment Slip) সংগ্রহ",
    ],
    docsEn: [
      "Personal/Corporate 12-digit E-TIN certificate",
      "Bank account statements for the preceding July 1 to June 30 financial year",
      "Salary statement, TDS deduction certificates, or audited financial balance sheets",
      "Investment documents (DPS, life insurance, stocks, government savings certificates)",
      "Asset and liability evidence (property deeds, vehicle registration, loan certificates)",
    ],
    docsBn: [
      "ব্যক্তিগত বা প্রাতিষ্ঠানিক ১২-সংখ্যার ই-টিন কপি",
      "১ জুলাই হতে ৩০ জুন সমাপ্ত অর্থবছরের ব্যাংক হিসাব বিবরণী",
      "বেতন বিবরণী, উৎসে কর কাটার চালান বা নিরীক্ষিত আর্থিক বিবরণী",
      "বিনিয়োগের প্রমাণ (ডিপিএস, সঞ্চয়পত্র, জীবন বীমা, স্টক মার্কেট বিনিয়োগ)",
      "সম্পদ ও দায়ের প্রমাণ (জমির দলিল, গাড়ির কাগজপত্র, ব্যাংক লোন বিবরণী)",
    ],
    stepsEn: [
      {
        title: "Income Audit",
        desc: "Audit income sources and compute net taxable income.",
      },
      {
        title: "Return Formulation",
        desc: "Draft tax return, asset/liability sheet, and rebate claims.",
      },
      {
        title: "Circle Filing",
        desc: "Submit return to NBR and secure formal Acknowledgment Receipt.",
      },
    ],
    stepsBn: [
      {
        title: "আয় হিসাব",
        desc: "আয়ের সকল উৎস পর্যালোচনা করে করযোগ্য আয় নির্ধারণ।",
      },
      {
        title: "রিটার্ন প্রস্তুত",
        desc: "রিটার্ন ফরম, সম্পদ বিবরণী ও কর রেয়াত শিট প্রস্তুত।",
      },
      {
        title: "দাখিল ও রসিদ",
        desc: "কর সার্কেলে জমা দিয়ে অফিশিয়াল প্রাপ্তি স্বীকারপত্র গ্রহণ।",
      },
    ],
    complianceEn:
      "Tax Day deadline is November 30 for individuals (unless officially extended by NBR). Filing proof is required for 40+ statutory services in Bangladesh.",
    complianceBn:
      "সাধারণত ৩০ নভেম্বরের মধ্যে রিটার্ন দাখিল করতে হয়। প্রাপ্তি স্বীকারপত্র ব্যাংক ও লাইসেন্সিং কাজের জন্য বাধ্যতামূলক।",
  },

  "Individual Tax Return Filings": {
    overviewEn:
      "Preparation and submission of personal annual income tax returns for salaried employees, business proprietors, doctors, engineers, and consultants.",
    overviewBn:
      "চাকরিজীবী, ব্যবসায়ী ও পেশাজীবীদের জন্য বার্ষিক ব্যক্তিগত আয়কর রিটার্ন প্রস্তুত ও দাখিল সেবা।",
    scopeEn: [
      "Gross salary restructuring and non-taxable allowance exemptions",
      "Wealth statement (assets and liabilities) compilation under Section 167",
      "Investment rebate maximization to legally minimize final tax liability",
      "Online or circle submission and delivery of stamped Acknowledgment Slip",
    ],
    scopeBn: [
      "বেতন ও আয়ের অন্যান্য উৎসের ওপর করছাড় ও অব্যাহতি নির্ধারণ",
      "১৬৭ ধারা অনুযায়ী সম্পদ ও দায়ের ভারসাম্য বিবরণী প্রস্তুত",
      "আইনসম্মত উপায়ে সর্বোচ্চ কর রেয়াত নিশ্চিতকরণ",
      "অনলাইন বা সার্কেলে রিটার্ন দাখিল ও সিলমোহরযুক্ত একনলেজমেন্ট রসিদ হস্তান্তর",
    ],
    docsEn: [
      "12-digit E-TIN certificate copy",
      "Annual salary certificate from employer",
      "Bank statement for all personal accounts covering July to June",
      "Proof of investment eligible for tax rebate (DPS, Sanchayapatra, Provident Fund)",
      "Previous year's tax return copy (if filed earlier)",
    ],
    docsBn: [
      "১২-সংখ্যার ই-টিন সার্টিফিকেট কপি",
      "নিয়োগদাতা কর্তৃক প্রদত্ত বার্ষিক বেতন বিবরণী",
      "১ জুলাই থেকে ৩০ জুন সময়কালের সকল ব্যাংক স্টেটমেন্ট",
      "কর রেয়াতযোগ্য বিনিয়োগের প্রমাণ (সঞ্চয়পত্র, ডিপিএস, প্রভিডেন্ট ফান্ড)",
      "পূর্ববর্তী বছরের দাখিলকৃত রিটার্নের কপি (যদি থাকে)",
    ],
    stepsEn: [
      {
        title: "Data Gathering",
        desc: "Collect income statements, bank sheets, and investment slips.",
      },
      {
        title: "Return Drafting",
        desc: "Calculate gross tax, rebates, and prepare asset disclosures.",
      },
      {
        title: "Filing & Slip",
        desc: "Submit to tax circle and provide official acknowledgment slip.",
      },
    ],
    stepsBn: [
      {
        title: "তথ্য সংগ্রহ",
        desc: "বেতন শিট, ব্যাংক স্টেটমেন্ট ও বিনিয়োগের তথ্য সংগ্রহ।",
      },
      {
        title: "রিটার্ন তৈরি",
        desc: "প্রদেয় কর, রেয়াত ও সম্পদ বিবরণী প্রস্তুত।",
      },
      {
        title: "দাখিল ও রসিদ",
        desc: "রিটার্ন জমা দিয়ে অফিশিয়াল প্রাপ্তি স্বীকারপত্র হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 2 to 3 business days. Acknowledgment slip is required for trade licenses, bank loans, and foreign travel visas.",
    complianceBn:
      "২ থেকে ৩ কর্মদিবসে সম্পন্ন হয়। ব্যাংক লোন, ভিসা আবেদন ও ট্রেড লাইসেন্সের জন্য রিটার্ন স্লিপ আবশ্যক।",
  },

  "Withholdings Tax Submission": {
    overviewEn:
      "Preparation and monthly/biannual filing of Withholding Tax (TDS/VDS) deduction statements under the Income Tax Act 2023 for withholding entities.",
    overviewBn:
      "আয়কর আইন অনুযায়ী উইথহোল্ডিং এনটিটি কর্তৃক উৎসে কর কর্তন (TDS)-এর মাসিক ও ষান্মাসিক বিবরণী প্রস্তুত ও জমা।",
    scopeEn: [
      "Audit of vendor payments, salary disbursements, and rent payments for applicable TDS rates",
      "Reconciliation of treasury challans deposited in government accounts",
      "Preparation and electronic submission of statutory withholding statements",
      "Issuance of withholding compliance acknowledgment",
    ],
    scopeBn: [
      "সরবরাহকারী বিল, বেতন ও ভাড়ার ওপর সঠিক হারে উৎসে কর কর্তন অডিট",
      "সরকারি কোষাগারে জমা দেওয়া ট্রেজারি চালানের সমন্বয়",
      "বিধিবদ্ধ উৎসে কর বিবরণী প্রস্তুত ও কর সার্কেলে দাখিল",
      "কমপ্লায়েন্স প্রত্যয়ন ও জমার প্রমাণপত্র সংগ্রহ",
    ],
    docsEn: [
      "Monthly vendor payment ledgers and salary sheets",
      "Copies of all Treasury Challans proving tax deposited into Bangladesh Bank / Sonali Bank",
      "Entity 12-digit E-TIN certificate",
    ],
    docsBn: [
      "মাসিক ভেন্ডর পেমেন্ট ও বেতন পরিশোধের হিসাব খাতা",
      "ট্রেজারি চালানের মূল বা সত্যায়িত কপি",
      "প্রতিষ্ঠানের ১২-সংখ্যার ই-টিন সনদ",
    ],
    stepsEn: [
      {
        title: "Deduction Audit",
        desc: "Verify TDS rates deducted against statutory schedules.",
      },
      {
        title: "Challan Matching",
        desc: "Reconcile deposits with government treasury records.",
      },
      {
        title: "Statement Filing",
        desc: "Submit withholding tax statement to territorial tax circle.",
      },
    ],
    stepsBn: [
      {
        title: "কর্তন অডিট",
        desc: "বিধিবদ্ধ হার অনুযায়ী সঠিক উৎসে কর কাটার হিসাব যাচাই।",
      },
      {
        title: "চালান মিলকরণ",
        desc: "ট্রেজারি চালানের সাথে কর্তনকৃত অর্থের সমন্বয়।",
      },
      {
        title: "বিবরণী জমা",
        desc: "কর সার্কেলে উইথহোল্ডিং ট্যাক্স বিবরণী সাবমিট।",
      },
    ],
    complianceEn:
      "Failure to file withholding statements invites personal liability and penalties for corporate directors.",
    complianceBn:
      "নিয়মিত বিবরণী দাখিল না করলে কোম্পানির ওপর জরিমানা ও পরিচালকদের বিরুদ্ধে আইনি নোটিশ জারি হতে পারে।",
  },

  VAT: {
    overviewEn:
      "Comprehensive Value Added Tax compliance, VAT advisory, accounting records setup (Mushak 6 series), and monthly filing management under the VAT and Supplementary Duty Act 2012.",
    overviewBn:
      "মূল্য সংযোজন কর (ভ্যাট) আইন ২০১২-এর অধীনে সার্বিক ভ্যাট পরামর্শ, মূসক ৬ সিরিজের রেজিস্টার সংরক্ষণ ও কমপ্লায়েন্স।",
    scopeEn: [
      "Determining appropriate VAT deduction rates, standard 15% or reduced rates, and rebates",
      "Setup and maintenance of statutory registers (Mushak 6.1 purchase book, Mushak 6.2 sales book)",
      "Preparation and submission of Monthly VAT Returns (Form Mushak 9.1)",
      "Representation before VAT Circle and Commissionerate during regulatory audits",
    ],
    scopeBn: [
      "প্রযোজ্য ভ্যাট হার, স্ট্যান্ডার্ড ১৫% বা হ্রাসকৃত হার এবং রেয়াত যোগ্যতা নির্ধারণ",
      "বিধিবদ্ধ রেজিস্টার (মূসক ৬.১ ক্রয় খাতা ও মূসক ৬.২ বিক্রয় খাতা) সংরক্ষণ",
      "মাসিক ভ্যাট রিটার্ন (ফরম মূসক ৯.১) প্রস্তুত ও পোর্টালে দাখিল",
      "ভ্যাট সার্কেল ও অডিট কর্মকর্তাদের সামনে প্রতিষ্ঠানের প্রতিনিধিত্ব",
    ],
    docsEn: [
      "13-digit BIN certificate copy",
      "Monthly purchase invoices (Mushak 6.3) and sales records",
      "Treasury challans of advance tax or VAT payments",
      "Bill of Entry copies for imported commercial goods",
    ],
    docsBn: [
      "১৩-সংখ্যার BIN সনদ কপি",
      "মাসিক ক্রয়ের মূসক ৬.৩ চালান ও বিক্রয়ের ভাউচারসমূহ",
      "অগ্রিম ভ্যাট বা ব্যাংকে ট্রেজারি চালানের কপি",
      "আমদানিকৃত পণ্যের ক্ষেত্রে বিল অব এন্ট্রি কপি",
    ],
    stepsEn: [
      {
        title: "Ledger Audit",
        desc: "Audit purchase and sales books for input tax credit eligibility.",
      },
      {
        title: "Tax Computation",
        desc: "Calculate net VAT payable after deducting input tax rebate.",
      },
      {
        title: "Monthly Submission",
        desc: "File Mushak 9.1 on the NBR VAT Online System.",
      },
    ],
    stepsBn: [
      {
        title: "খাতা অডিট",
        desc: "ইনপুট ভ্যাট রেয়াতযোগ্যতা যাচাইয়ে ক্রয়-বিক্রয় খাতা পরীক্ষা।",
      },
      {
        title: "কর হিসাব",
        desc: "রেয়াত সমন্বয় করে প্রকৃত প্রদেয় ভ্যাটের পরিমাণ নির্ণয়।",
      },
      {
        title: "অনলাইন দাখিল",
        desc: "ভ্যাট পোর্টালে মূসক ৯.১ রিটার্ন দাখিল ও একনলেজমেন্ট সংগ্রহ।",
      },
    ],
    complianceEn:
      "Returns must be filed before the 15th of every following month. Zero-turnover businesses must still file zero returns to avoid automatic BDT 10,000 penalties per month.",
    complianceBn:
      "প্রতি মাসের ১৫ তারিখের মধ্যে রিটার্ন জমা বাধ্যতামূলক। শূন্য লেনদেনের ক্ষেত্রেও রিটার্ন না দিলে প্রতি মাসে ১০,০০০ টাকা জরিমানা হয়।",
  },

  "Monthly Vat Return Submission": {
    overviewEn:
      "Preparation, reconciliation, and submission of the mandatory monthly Value Added Tax return (Form Mushak 9.1) on the NBR VAT Online System (VOS).",
    overviewBn:
      "প্রতি মাসের ১৫ তারিখের মধ্যে ভ্যাট অনলাইন সিস্টেমে বাধ্যতামূলক মাসিক ভ্যাট রিটার্ন (ফরম মূসক ৯.১) প্রস্তুত ও দাখিল।",
    scopeEn: [
      "Monthly input tax credit and rebate verification against supplier Mushak 6.3 challans",
      "Treasury deposit challan matching on the NBR online system",
      "Filing of Form Mushak 9.1 through the digital portal",
      "Delivery of authenticated digital VAT Return Submission Slip",
    ],
    scopeBn: [
      "সরবরাহকারীদের মূসক ৬.৩ চালানের বিপরীতে ইনপুট ট্যাক্স রেয়াত হিসাব",
      "NBR পোর্টালে জমা চালানের মিলকরণ",
      "ডিজিটাল সিস্টেমে মূসক ৯.১ রিটার্ন পূরণ ও সাবমিশন",
      "ডিজিটাল প্রাপ্তি স্বীকার স্লিপ (Submission Slip) সংগ্রহ ও হস্তান্তর",
    ],
    docsEn: [
      "Summary of monthly total sales and purchases with relevant challans",
      "Treasury deposit challan (if net VAT payable)",
      "13-digit BIN portal username and login credentials",
    ],
    docsBn: [
      "চলতি মাসের মোট ক্রয় ও বিক্রয়ের হিসাব সংবলিত চালানসমূহ",
      "প্রদেয় ভ্যাটের ক্ষেত্রে ব্যাংক ট্রেজারি চালান",
      "ভ্যাট অনলাইন পোর্টালের ইউজার আইডি ও পাসওয়ার্ড",
    ],
    stepsEn: [
      {
        title: "Reconciliation",
        desc: "Reconcile purchases, sales, and VDS deductions.",
      },
      {
        title: "Challan Deposit",
        desc: "Execute net tax payment via treasury challan (if due).",
      },
      {
        title: "VOS Submission",
        desc: "Submit Mushak 9.1 and provide digital submission receipt.",
      },
    ],
    stepsBn: [
      { title: "সমন্বয়", desc: "ক্রয়, বিক্রয় ও উৎসে কাটার হিসাব সমন্বয়।" },
      { title: "চালান জমা", desc: "প্রদেয় কর থাকলে ট্রেজারি চালানে পরিশোধ।" },
      {
        title: "রিটার্ন সাবমিট",
        desc: "পোর্টালে রিটার্ন দাখিল করে অফিসিয়াল স্লিপ হস্তান্তর।",
      },
    ],
    complianceEn:
      "Must be filed by the 15th day of every month. Timely filing maintains unblocked customs clearance and good commercial standing.",
    complianceBn:
      "প্রতি মাসের ১৫ তারিখের মধ্যে দাখিল করতে হয়। নিয়মিত দাখিল করলে পোর্টাল সচল থাকে ও কাস্টমস জটিলতা এড়ানো যায়।",
  },

  "CA Audit Service": {
    overviewEn:
      "Statutory annual financial statement audit by ICAB-registered Chartered Accountant firms for RJSC annual return compliance, NBR tax assessment, and banking facilities.",
    overviewBn:
      "ICAB নিবন্ধিত চার্টার্ড অ্যাকাউন্ট্যান্টস ফার্ম দ্বারা বার্ষিক আর্থিক হিসাব নিরীক্ষা (অডিট) ও অডিট রিপোর্ট প্রস্তুতকরণ।",
    scopeEn: [
      "Independent examination of financial books, general ledgers, and bank reconciliations",
      "Preparation of Balance Sheet, Profit & Loss Account, Cash Flow Statement, and Notes to the Accounts",
      "Application of Document Verification System (DVS) generated unique tracking code",
      "Delivery of formal signed and stamped CA Audit Report",
    ],
    scopeBn: [
      "প্রতিষ্ঠানের সাধারণ খাতা, ভাউচার ও ব্যাংক হিসাবের স্বাধীন আর্থিক নিরীক্ষা",
      "ব্যালেন্স শিট, লাভ-ক্ষতি হিসাব, ক্যাশ ফ্লো স্টেটমেন্ট ও অডিট নোট প্রস্তুত",
      "ICAB ডকুমেন্ট ভেরিফিকেশন সিস্টেম (DVS) কোড সংবলিত অডিট সনদ তৈরি",
      "স্বাক্ষরিত ও সিলমোহরযুক্ত পূর্ণাঙ্গ অডিট রিপোর্ট হস্তান্তর",
    ],
    docsEn: [
      "General ledger, cash book, and complete transaction vouchers for the fiscal year",
      "Bank statements of all enterprise accounts for the 12-month period",
      "Previous year's audited financial report and fixed asset schedules",
      "Company Incorporation Certificate, Form XII, and Trade License",
    ],
    docsBn: [
      "সমাপ্ত অর্থবছরের দৈনিক ক্যাশ বুক, লেজার ও খরচের ভাউচারসমূহ",
      "১২ মাসের সকল ব্যাংক স্টেটমেন্ট",
      "পূর্ববর্তী বছরের অডিট রিপোর্ট ও স্থায়ী সম্পদের তালিকা",
      "কোম্পানির ইনকর্পোরেশন সনদ, ফরম XII ও ট্রেড লাইসেন্স",
    ],
    stepsEn: [
      {
        title: "Field Audit",
        desc: "CA team reviews transaction ledgers and verifies vouchers.",
      },
      {
        title: "Financial Formulation",
        desc: "Draft balance sheet and income statement under accounting standards.",
      },
      {
        title: "DVS Audit Report",
        desc: "Generate ICAB DVS verification code and sign formal audit report.",
      },
    ],
    stepsBn: [
      {
        title: "হিসাব নিরীক্ষা",
        desc: "সিএ অডিট দল কর্তৃক ভাউচার ও ব্যাংক হিসাব পরীক্ষা।",
      },
      {
        title: "বিবরণী প্রণয়ন",
        desc: "অ্যাকাউন্টিং স্ট্যান্ডার্ড অনুযায়ী ব্যালেন্স শিট ও আর্থিক হিসাব প্রস্তুত।",
      },
      {
        title: "DVS কোড ও রিপোর্ট",
        desc: "ICAB থেকে DVS কোড জেনারেট করে অডিট রিপোর্ট হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 5 to 7 business days. DVS-authenticated audit reports are mandatory for RJSC annual return submissions and corporate tax filings.",
    complianceBn:
      "সাধারণত ৫ থেকে ৭ কর্মদিবস সময় লাগে। DVS কোডযুক্ত অডিট রিপোর্ট ছাড়া RJSC ও কর অফিসে রিটার্ন দাখিল গ্রহণ করা হয় না।",
  },

  "CA Assets Valuation": {
    overviewEn:
      "Professional valuation of fixed assets, real estate properties, plant & machinery, and intangible assets by qualified Chartered Accountants for bank mortgages, mergers, or statutory balance sheet restatements.",
    overviewBn:
      "ব্যাংক ঋণ, সম্পদ বন্ধক, মার্জার বা কোম্পানির মূলধন বৃদ্ধির জন্য চার্টার্ড অ্যাকাউন্ট্যান্ট দ্বারা সম্পত্তির ভ্যালুয়েশন ও প্রত্যয়ন।",
    scopeEn: [
      "Physical site inspection and physical verification of asset integrity",
      "Depreciation analysis and market-replacement valuation methodology",
      "Preparation of authenticated Asset Valuation Report with fair market value declarations",
    ],
    scopeBn: [
      "সরেজমিনে সম্পদ ও যন্ত্রপাতির বর্তমান অবস্থা পরিদর্শন ও যাচাই",
      "অবচয় হিসাব ও বর্তমান বাজারমূল্য পদ্ধতি অনুযায়ী মূল্যায়ন",
      "সার্টিফায়েড সিএ ফার্মের স্বাক্ষরিত অফিসিয়াল ভ্যালুয়েশন রিপোর্ট প্রদান",
    ],
    docsEn: [
      "Asset purchase invoices, construction contracts, or land registration title deeds",
      "Original machinery import Bill of Entry and commercial invoices",
      "Company financial statements and fixed asset registers",
    ],
    docsBn: [
      "সম্পদ ক্রয়ের দলিল, ভাউচার বা নির্মাণকাজের চুক্তিপত্র",
      "যন্ত্রপাতি আমদানির বিল অব এন্ট্রি ও কমার্শিয়াল ইনভয়েস",
      "কোম্পানির আর্থিক বিবরণী ও ফিক্সড অ্যাসেট রেজিস্টার",
    ],
    stepsEn: [
      {
        title: "Asset Inspection",
        desc: "CA valuation team inspects property or factory machinery.",
      },
      {
        title: "Financial Appraisal",
        desc: "Apply standard financial valuation methods.",
      },
      {
        title: "Valuation Report",
        desc: "Deliver formal valuation certificate with certified values.",
      },
    ],
    stepsBn: [
      { title: "সম্পদ পরিদর্শন", desc: "সিএ দলের সরেজমিন পরিদর্শন ও যাচাই।" },
      {
        title: "মূল্য নির্ধারণ",
        desc: "আর্থিক মূল্যায়ন পদ্ধতির মাধ্যমে সঠিক বাজারমূল্য নির্ণয়।",
      },
      {
        title: "রিপোর্ট প্রদান",
        desc: "প্রত্যয়িত ভ্যালুয়েশন সার্টিফিকেট হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 7 to 10 business days. Recognized by commercial banks and financial institutions for credit facilities.",
    complianceBn:
      "৭ থেকে ১০ কর্মদিবসের মধ্যে রিপোর্ট প্রস্তুত হয়। ব্যাংক লোন ও বিনিয়োগের ক্ষেত্রে এটি গ্রহণযোগ্য দলিল।",
  },

  "Project Proposal": {
    overviewEn:
      "Formulation of bankable Project Feasibility Proposals, business plans, and financial projection models for commercial bank loans, investor pitching, or government industrial plots.",
    overviewBn:
      "ব্যাংক ঋণ, বিনিয়োগকারী ফান্ডিং বা বিসিক প্লটের জন্য ব্যাংক উপযোগী পূর্ণাঙ্গ প্রজেক্ট প্রপোজাল ও সম্ভাব্যতা সমীক্ষা প্রণয়ন।",
    scopeEn: [
      "Industry market research, competitive landscape, and operational capacity structuring",
      "Comprehensive 5-year financial projection model (P&L, Balance Sheet, Cash Flow, IRR, NPV, Break-even analysis)",
      "Technical layout, capital machinery budgeting, and working capital requirement modeling",
      "Delivery of professionally bound and editable digital bankable project report",
    ],
    scopeBn: [
      "শিল্প বাজার গবেষণা, প্রতিযোগিতা ও উৎপাদন সক্ষমতার বিশ্লেষণ",
      "৫ বছরের আর্থিক প্রক্ষেপণ (লাভ-ক্ষতি, ব্যালেন্স শিট, ক্যাশ ফ্লো, আইআরআর, ব্রেক-ইভেন অ্যানালাইসিস)",
      "প্রকৌশল লে-আউট, যন্ত্রপাতি বাজেট ও চলতি মূলধনের বিস্তারিত মডেলিং",
      "ব্যাংকে উপস্থাপনের উপযোগী প্রফেশনাল প্রজেক্ট প্রপোজাল বুকলেট ও সফটকপি হস্তান্তর",
    ],
    docsEn: [
      "Business overview, promoters' profile, and past track record",
      "Estimated project cost breakdown and capital machinery price quotations",
      "Land or facility details with proposed production capacity",
    ],
    docsBn: [
      "ব্যবসার ধরন ও উদ্যোক্তাদের সংক্ষিপ্ত প্রোফাইল",
      "প্রকল্পের আনুমানিক ব্যয় ও যন্ত্রপাতির কোটেশন",
      "প্রকল্পের স্থান, জমি ও প্রস্তাবিত উৎপাদন সক্ষমতার বিবরণ",
    ],
    stepsEn: [
      {
        title: "Financial Modeling",
        desc: "Construct multi-year revenue, OPEX, and debt service coverage models.",
      },
      {
        title: "Narrative Drafting",
        desc: "Formulate executive summary, marketing plan, and risk mitigations.",
      },
      {
        title: "Final Dossier",
        desc: "Deliver bank-ready comprehensive project feasibility report.",
      },
    ],
    stepsBn: [
      {
        title: "আর্থিক মডেলিং",
        desc: "আয়-ব্যয়, ঋণের কিস্তি পরিশোধ সক্ষমতা ও প্রক্ষেপণ মডেল তৈরি।",
      },
      {
        title: "প্রকল্প বিবরণ",
        desc: "বাজার বিশ্লেষণ, বিপণন পরিকল্পনা ও ঝুঁকি ব্যবস্থাপনার অধ্যায় প্রস্তুত।",
      },
      {
        title: "চূড়ান্ত প্রপোজাল",
        desc: "ব্যাংক অনুমোদনের উপযোগী পূর্ণাঙ্গ প্রজেক্ট প্রোফাইল হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 7 to 14 business days. Tailored to meet Bangladesh Bank guidelines and commercial bank credit committee standards.",
    complianceBn:
      "সাধারণত ৭ থেকে ১৪ কর্মদিবসের মধ্যে তৈরি হয়। বাংলাদেশ ব্যাংকের ঋণ নীতিমালার সঙ্গে সামঞ্জস্য রেখে প্রস্তুত করা হয়।",
  },

  "Accounts Service": {
    overviewEn:
      "End-to-end bookkeeping, cloud accounting ledger management, transaction reconciliation, and management reporting for small and medium enterprises.",
    overviewBn:
      "ক্ষুদ্র ও মাঝারি প্রতিষ্ঠানের জন্য দৈনিক হিসাবরক্ষণ, ক্লাউড অ্যাকাউন্টিং, লেজার ব্যবস্থাপনা ও মাসিক আর্থিক রিপোর্টিং।",
    scopeEn: [
      "Setup of standardized Chart of Accounts customized to your industry",
      "Recording daily sales, vendor purchases, operational expenses, and payroll entries",
      "Monthly bank reconciliation and account balance confirmations",
      "Generation of monthly Management Accounts (Profit & Loss, Balance Sheet, Cash Flow)",
    ],
    scopeBn: [
      "ব্যবসার ধরন অনুযায়ী স্ট্যান্ডার্ড চার্ট অব অ্যাকাউন্টস (হিসাব কোড) তৈরি",
      "দৈনিক ক্রয়-বিক্রয়, অফিস খরচ ও পে-রোল হিসাব খাতা বা সফটওয়্যারে এন্ট্রি",
      "মাসিক ব্যাংক রিকনসিলিয়েশন ও ব্যালেন্স নিশ্চিতকরণ",
      "মাসিক ম্যানেজমেন্ট আর্থিক রিপোর্ট (লাভ-ক্ষতি ও ব্যালেন্স শিট) প্রদান",
    ],
    docsEn: [
      "Monthly sales invoices, vendor bills, and petty cash expense vouchers",
      "Bank account statements for all operational accounts",
      "Payroll registers and employee salary breakdown",
    ],
    docsBn: [
      "মাসিক বিক্রির ইনভয়েস, কেনাকাটার ভাউচার ও ক্যাশ খরচের রসিদ",
      "প্রতিষ্ঠানের সকল ব্যাংক স্টেটমেন্ট",
      "কর্মীদের বেতন শিট ও পে-রোল বিবরণ",
    ],
    stepsEn: [
      {
        title: "System Setup",
        desc: "Establish accounting software and chart of accounts.",
      },
      {
        title: "Voucher Entry",
        desc: "Process regular transaction batches and categorize expenses.",
      },
      {
        title: "Monthly Reporting",
        desc: "Deliver reconciled financial statements with management notes.",
      },
    ],
    stepsBn: [
      {
        title: "সিস্টেম সেটআপ",
        desc: "হিসাব সফটওয়্যার স্থাপন ও অ্যাকাউন্ট কোড বিন্যাস।",
      },
      {
        title: "ভাউচার পোস্টিং",
        desc: "নিয়মিত খরচ ও আয়ের ভাউচার এন্ট্রি ও সমন্বয়।",
      },
      {
        title: "মাসিক রিপোর্ট",
        desc: "মাসের শেষে প্রস্তুতকৃত আর্থিক হিসাব বিবরণী প্রদান।",
      },
    ],
    complianceEn:
      "Ensures error-free year-end statutory audits and seamless corporate tax filings.",
    complianceBn:
      "বছরের শেষে ঝামেলামুক্ত অডিট ও কর রিটার্ন দাখিলের নিশ্চয়তা প্রদান করে।",
  },

  "HR and Payroll Service": {
    overviewEn:
      "Comprehensive human resources administration, payroll calculation, statutory tax deduction at source (TDS), and labour law compliance management.",
    overviewBn:
      "কর্মীদের পে-রোল হিসাব, বেতন শিট প্রস্তুত, উৎসে আয়কর কর্তন এবং শ্রম আইন কমপ্লায়েন্স ব্যবস্থাপনা।",
    scopeEn: [
      "Monthly payroll processing with salary structures, allowances, and provident fund entries",
      "Employee TDS tax deduction calculation under current income tax brackets",
      "Generation of monthly payslips and electronic bank disbursement advice",
      "Drafting of employment appointment letters and non-disclosure agreements (NDAs)",
    ],
    scopeBn: [
      "মূল বেতন, বাড়িভাড়া ও অন্যান্য ভাতা সমন্বয় করে মাসিক পে-রোল প্রস্তুত",
      "আয়কর আইন অনুযায়ী কর্মীদের উৎসে কর (TDS) হিসাব ও কর্তন বিবরণী",
      "কর্মীদের ডিজিটাল পে-স্লিপ ও ব্যাংকে বেতন স্থানান্তরের নির্দেশিকা তৈরি",
      "শ্রম আইনসম্মত নিয়োগপত্র (Appointment Letter) ও এনডিএ (NDA) খসড়া প্রণয়ন",
    ],
    docsEn: [
      "Employee master roster with designation, join date, and agreed gross salary",
      "Monthly attendance, leave, and overtime records",
      "Company provident fund or benefit policy guidelines",
    ],
    docsBn: [
      "কর্মীদের তালিকা, পদবি, যোগদানের তারিখ ও বেতনের বিবরণ",
      "মাসিক উপস্থিতি, ছুটি ও ওভারটাইমের হিসাব",
      "কোম্পানির প্রভিডেন্ট ফান্ড বা বোনাস নীতিমালা",
    ],
    stepsEn: [
      {
        title: "Salary Computation",
        desc: "Calculate gross salary, deductions, and net payable amounts.",
      },
      {
        title: "Tax Alignment",
        desc: "Deduct accurate withholding tax per employee bracket.",
      },
      {
        title: "Disbursement & Slips",
        desc: "Deliver bank advice and distribute itemized payslips.",
      },
    ],
    stepsBn: [
      {
        title: "বেতন হিসাব",
        desc: "উপস্থিতি অনুযায়ী মোট ও প্রদেয় বেতনের নির্ভুল হিসাব।",
      },
      {
        title: "কর কর্তন",
        desc: "কর্মীদের ব্যক্তিগত কর স্ল্যাব অনুযায়ী সঠিক TDS কর্তন।",
      },
      {
        title: "পে-স্লিপ বিতরণ",
        desc: "ব্যাংক ডিসবার্সমেন্ট ফাইল ও পে-স্লিপ প্রস্তুতকরণ।",
      },
    ],
    complianceEn:
      "Aligns employment policies with Bangladesh Labour Act 2006 to eliminate labour inspection liabilities.",
    complianceBn:
      "বাংলাদেশ শ্রম আইন ২০০৬-এর সাথে সামঞ্জস্য রেখে আইনি ঝুঁকি সম্পূর্ণরূপে দূর করে।",
  },

  Affidavits: {
    overviewEn:
      "Drafting, legal vetting, and formal notarization of statutory affidavits, declarations, indemnity undertakings, and sworn statements on non-judicial stamp paper.",
    overviewBn:
      "নন-জুডিশিয়াল স্ট্যাম্পে আইনি হলফনামা (এফিডেভিট), অঙ্গিকারনামা ও ঘোষণাপত্র প্রণয়ন ও নোটারি পাবলিক দ্বারা সত্যায়ন।",
    scopeEn: [
      "Legal drafting tailored to specific regulatory and court requirements",
      "Allocation of prescribed non-judicial stamp paper valuation",
      "Execution and attestation before a certified Notary Public or First Class Magistrate",
      "Delivery of authentic legally binding notarized affidavit",
    ],
    scopeBn: [
      "আইনি ও দাপ্তরিক প্রয়োজন অনুযায়ী যথাযথ আইনি ভাষায় হলফনামা খসড়া প্রণয়ন",
      "সরকারি বিধানমতে নির্ধারিত মূল্যের নন-জুডিশিয়াল স্ট্যাম্পে প্রিন্ট",
      "নোটারি পাবলিক বা প্রথম শ্রেণির ম্যাজিস্ট্রেট দ্বারা আনুষ্ঠানিক প্রত্যয়ন",
      "আইনসম্মত কার্যকর নোটারিকৃত হলফনামা হস্তান্তর",
    ],
    docsEn: [
      "Deponent's National ID (NID) or Passport copy",
      "Passport-sized photograph of deponent",
      "Supporting documentation substantiating the facts declared in the affidavit",
    ],
    docsBn: [
      "হলফকারীর জাতীয় পরিচয়পত্র (NID) বা পাসপোর্টের কপি",
      "হলফকারীর পাসপোর্ট সাইজের ছবি",
      "যে বিষয়ে হলফনামা তার সমর্থনে প্রাসঙ্গিক নথিপত্র",
    ],
    stepsEn: [
      {
        title: "Drafting",
        desc: "Formulate precise sworn statements under legal counsel review.",
      },
      {
        title: "Stamping",
        desc: "Print onto appropriate government non-judicial stamp paper.",
      },
      {
        title: "Notarization",
        desc: "Deponent signs before Notary Public; notary enters into official register.",
      },
    ],
    stepsBn: [
      { title: "ড্রাফটিং", desc: "আইনজীবীর মাধ্যমে নির্ভুল বয়ান প্রণয়ন।" },
      {
        title: "স্ট্যাম্প প্রিন্ট",
        desc: "নির্ধারিত মূল্যের সরকারি স্ট্যাম্পে মুদ্রণ।",
      },
      {
        title: "নোটারি সত্যায়ন",
        desc: "নোটারি পাবলিকের সামনে স্বাক্ষর ও রেজিস্টারে এন্ট্রি।",
      },
    ],
    complianceEn:
      "Turnaround within 24 hours. Legally admissible across all courts, government departments, and embassies.",
    complianceBn:
      "২৪ ঘণ্টার মধ্যে প্রস্তুত হয়। দেশের যেকোনো আদালত, সরকারি দপ্তর ও দূতাবাসে গ্রহণযোগ্য।",
  },

  Translation: {
    overviewEn:
      "Official certified translation of corporate charters, legal contracts, licenses, certificates, and affidavits between English and Bengali with legal attestation.",
    overviewBn:
      "কোম্পানির গঠনতন্ত্র, চুক্তিপত্র, লাইসেন্স ও আইনি দলিলের নির্ভরযোগ্য বাংলা থেকে ইংরেজি বা ইংরেজি থেকে বাংলা সার্টিফায়েড অনুবাদ।",
    scopeEn: [
      "Accurate contextual translation preserving legal terminology and statutory phrasing",
      "Formatting identical to the original layout with official verification stamps",
      "Notarization or advocate certification where demanded by embassies or foreign authorities",
      "Delivery of signed and sealed certified translation sets",
    ],
    scopeBn: [
      "আইনি পরিভাষা ও বিধিবদ্ধ অর্থ অক্ষুণ্ণ রেখে নির্ভুল অনুবাদ",
      "মূল দলিলের অনুরূপ লে-আউটে ফরম্যাটিং ও অনুবাদকের প্রত্যয়ন",
      "দূতাবাস বা সরকারি ব্যবহারের জন্য নোটারি পাবলিক বা আইনজীবীর সত্যায়ন",
      "সিলমোহরযুক্ত অফিশিয়াল সার্টিফায়েড অনুবাদ কপি হস্তান্তর",
    ],
    docsEn: [
      "Clear original or scanned copies of source documents to be translated",
      "Specific target entity formatting requirements (if applicable)",
    ],
    docsBn: [
      "অনুবাদযোগ্য মূল নথির স্পষ্ট স্ক্যান বা মূল কপি",
      "যে দপ্তরে জমা দেওয়া হবে তাদের কোনো বিশেষ নির্দেশিকা থাকলে তা",
    ],
    stepsEn: [
      {
        title: "Document Review",
        desc: "Review terminology and calculate word count and delivery schedule.",
      },
      {
        title: "Legal Translation",
        desc: "Execute translation under specialized legal linguists.",
      },
      {
        title: "Certification",
        desc: "Stamp and attest with certified translator credentials.",
      },
    ],
    stepsBn: [
      {
        title: "পর্যালোচনা",
        desc: "নথির ভাষা ও শব্দ সংখ্যা পর্যালোচনা করে সময় নির্ধারণ।",
      },
      {
        title: "অনুবাদ",
        desc: "আইন বিশেষজ্ঞ অনুবাদক দ্বারা নিখুঁত অনুবাদ সম্পন্ন।",
      },
      {
        title: "সার্টিফিকেশন",
        desc: "অনুবাদক ও নোটারির সিলমোহর দিয়ে চূড়ান্ত কপি প্রস্তুত।",
      },
    ],
    complianceEn:
      "Turnaround is 24 to 48 hours. Accepted by embassies, banks, courts, and ministries.",
    complianceBn:
      "২৪ থেকে ৪৮ ঘণ্টার মধ্যে সম্পন্ন হয়। বিভিন্ন দেশের দূতাবাস, ব্যাংক ও সরকারি দপ্তরে গ্রহণযোগ্য।",
  },

  "RJSC Compliance": {
    overviewEn:
      "Ongoing statutory secretarial compliance management under the Companies Act 1994, ensuring timely filings of annual returns, corporate changes, and registry records.",
    overviewBn:
      "কোম্পানি আইন ১৯৯৪ অনুযায়ী RJSC-তে বার্ষিক রিটার্ন দাখিল, পরিচালক বা শেয়ার পরিবর্তন এবং যাবতীয় সংবিধিবদ্ধ কমপ্লায়েন্স সেবা।",
    scopeEn: [
      "Preparation of Annual General Meeting (AGM) records, director reports, and resolutions",
      "Drafting and digital submission of statutory forms (Form XII, Form X, Form 23B)",
      "Resolution of pending RJSC compliance defaults and regularization",
      "Delivery of certified true copies and official acknowledgment receipts",
    ],
    scopeBn: [
      "বার্ষিক সাধারণ সভা (AGM), পরিচালকদের প্রতিবেদন ও বোর্ড রেজল্যুশন প্রস্তুত",
      "RJSC বিধিবদ্ধ ফরম (ফরম XII, ফরম X, ফরম 23B) ডিজিটাল পোর্টালে সাবমিট",
      "পূর্ববর্তী বকেয়া রিটার্নের জরিমানা নিষ্পত্তি ও কোম্পানি নিয়মিতকরণ",
      "RJSC সার্টিফায়েড কপি ও গ্রহণযোগ্যতার অফিশিয়াল রসিদ হস্তান্তর",
    ],
    docsEn: [
      "Audited Financial Statements with ICAB DVS verification code",
      "List of current shareholders and directors with shareholding numbers",
      "Previous year's submitted Form XII and Form X copies",
      "Board resolutions approving annual accounts and authorizing filings",
    ],
    docsBn: [
      "ICAB DVS কোডযুক্ত নিরীক্ষিত বার্ষিক আর্থিক প্রতিবেদন (অডিট রিপোর্ট)",
      "শেয়ারহোল্ডার ও পরিচালকদের হালনাগাদ তালিকা ও শেয়ার সংখ্যা",
      "পূর্ববর্তী বছরে দাখিলকৃত ফরম XII ও ফরম X-এর কপি",
      "আর্থিক হিসাব অনুমোদন ও ফাইলিং সংক্রান্ত বোর্ড রেজল্যুশন",
    ],
    stepsEn: [
      {
        title: "AGM Documentation",
        desc: "Draft AGM notice, director report, and approval resolutions.",
      },
      {
        title: "Portal Filing",
        desc: "Submit statutory return packet on RJSC online portal.",
      },
      {
        title: "Certified Copies",
        desc: "Secure stamped RJSC acceptance and certified Form XII/X.",
      },
    ],
    stepsBn: [
      {
        title: "AGM ডকুমেন্টস",
        desc: "AGM নোটিশ, পরিচালকদের রিপোর্ট ও রেজল্যুশন ড্রাফটিং।",
      },
      {
        title: "RJSC দাখিল",
        desc: "অডিট রিপোর্টসহ পোর্টালে ডিজিটাল আবেদন সাবমিশন।",
      },
      {
        title: "সার্টিফায়েড কপি",
        desc: "অনুমোদন শেষে RJSC সার্টিফায়েড ফরম ও রসিদ সংগ্রহ।",
      },
    ],
    complianceEn:
      "Annual returns must be submitted within 21 days of holding the AGM. Maintains active company standing and prevents director disqualifications.",
    complianceBn:
      "AGM অনুষ্ঠানের ২১ দিনের মধ্যে RJSC-তে দাখিল করতে হয়। সময়মতো দাখিলে কোম্পানি সচল থাকে ও জরিমানা এড়ানো যায়।",
  },

  "Annual Return Filings": {
    overviewEn:
      "Statutory annual filing at RJSC comprising the submission of audited balance sheets, Form XII (Directors), Form X (Share Capital), and Form 23B following the Annual General Meeting.",
    overviewBn:
      "বার্ষিক সাধারণ সভার পর অডিট রিপোর্ট, ফরম XII, ফরম X ও ফরম 23B সহ RJSC-তে বার্ষিক রিটার্ন দাখিল।",
    scopeEn: [
      "Preparation of statutory AGM resolutions and Director's Report",
      "Formatting and digital upload of DVS-verified Audited Financial Statements",
      "Filing of Form XII (List of Directors) and Form X (Annual Summary of Share Capital)",
      "Securing certified true copies from RJSC Registrar",
    ],
    scopeBn: [
      "বিধিবদ্ধ AGM রেজল্যুশন ও পরিচালনা পর্ষদের প্রতিবেদন প্রস্তুত",
      "DVS ভেরিফায়েড অডিট রিপোর্ট RJSC ডিজিটাল পোর্টালে আপলোড",
      "ফরম XII (পরিচালক তালিকা) ও ফরম X (শেয়ার মূলধনের বিবরণী) দাখিল",
      "RJSC থেকে সার্টিফায়েড ফরম XII ও গ্রহণ রসিদ সংগ্রহ",
    ],
    docsEn: [
      "DVS-certified Audited Balance Sheet and P&L account",
      "Current shareholding distribution and director appointment details",
      "Board meeting and AGM minutes copies",
    ],
    docsBn: [
      "DVS ভেরিফায়েড নিরীক্ষিত ব্যালেন্স শিট ও অডিট রিপোর্ট",
      "শেয়ারহোল্ডারদের নাম, ঠিকানা ও ধারণকৃত শেয়ারের সংখ্যা",
      "বোর্ড সভা ও বার্ষিক সাধারণ সভার কার্যবিবরণী (মিনিটস)",
    ],
    stepsEn: [
      {
        title: "Minutes & Forms",
        desc: "Draft AGM minutes and statutory corporate forms.",
      },
      {
        title: "RJSC Submission",
        desc: "Submit digital packet with audited financials and pay fees.",
      },
      {
        title: "Delivery",
        desc: "Handover certified Form XII and official filing acknowledgment.",
      },
    ],
    stepsBn: [
      {
        title: "ফরম প্রস্তুত",
        desc: "AGM কার্যবিবরণী ও প্রয়োজনীয় সংবিধিবদ্ধ ফরম প্রস্তুত।",
      },
      {
        title: "পোর্টালে দাখিল",
        desc: "অডিট রিপোর্টসহ সরকারি ফি পরিশোধ করে অনলাইনে দাখিল।",
      },
      {
        title: "সনদ হস্তান্তর",
        desc: "RJSC সার্টিফায়েড ফরম XII ও ফাইলিং রসিদ ক্লায়েন্টকে হস্তান্তর।",
      },
    ],
    complianceEn:
      "Turnaround is 3 to 5 business days upon receiving the audited financials.",
    complianceBn:
      "অডিট রিপোর্ট পাওয়ার পর ৩ থেকে ৫ কর্মদিবসের মধ্যে ফাইলিং সম্পন্ন হয়।",
  },

  "Share Transfer": {
    overviewEn:
      "Legal execution, non-judicial stamp duty assessment, board resolution, and statutory Form 117 filing at RJSC for the transfer of company shares between existing or incoming shareholders.",
    overviewBn:
      "শেয়ারহোল্ডারদের মধ্যে শেয়ার হস্তান্তরের আইনি প্রক্রিয়া—স্ট্যাম্প ডিউটি, বোর্ড রেজল্যুশন ও RJSC-তে ফরম ১১৭ ফাইলিং।",
    scopeEn: [
      "Drafting Share Purchase Agreement and statutory Instrument of Transfer (Form 117)",
      "Payment of government stamp duty (1.5% on share face value/consideration)",
      "Board meeting coordination to approve transfer and update Register of Members",
      "Filing and personal appearance before the RJSC Assistant Registrar for certification",
    ],
    scopeBn: [
      "শেয়ার হস্তান্তর চুক্তি ও বিধিবদ্ধ ফরম ১১৭ (Instrument of Transfer) প্রণয়ন",
      "শেয়ার মূল্যের ওপর নির্ধারিত সরকারি স্ট্যাম্প ডিউটি পরিশোধ",
      "শেয়ার হস্তান্তরের অনুমোদন ও সদস্য বহিতে এন্ট্রি সংক্রান্ত বোর্ড সভা পরিচালনা",
      "RJSC রেজিস্ট্রারের নিকট আবেদন দাখিল ও সার্টিফায়েড ফরম ১১৭ গ্রহণ",
    ],
    docsEn: [
      "Transferor and Transferee National ID / Passport copies and TIN certificates",
      "Original Share Certificates to be endorsed and cancelled",
      "Board Resolution approving the share transfer",
      "Updated Register of Members (Share Register)",
    ],
    docsBn: [
      "হস্তান্তরকারী ও গ্রহণকারীর NID বা পাসপোর্ট কপি এবং ই-টিন",
      "মূল শেয়ার সার্টিফিকেটসমূহ",
      "শেয়ার হস্তান্তরের অনুমোদন সংবলিত বোর্ড রেজল্যুশন",
      "হালনাগাদ শেয়ার রেজিস্টার (Register of Members)",
    ],
    stepsEn: [
      {
        title: "Form 117 Execution",
        desc: "Draft Form 117 and execute with requisite stamp duty.",
      },
      {
        title: "Board Approval",
        desc: "Pass board resolution and update company share ledger.",
      },
      {
        title: "RJSC Certification",
        desc: "Submit to RJSC and obtain certified Form 117.",
      },
    ],
    stepsBn: [
      {
        title: "ফরম ১১৭ সম্পাদন",
        desc: "স্ট্যাম্প ডিউটি পরিশোধ করে ফরম ১১৭-তে স্বাক্ষর গ্রহণ।",
      },
      {
        title: "বোর্ড অনুমোদন",
        desc: "বোর্ড রেজল্যুশন পাস ও কোম্পানির শেয়ার রেজিস্টারে এন্ট্রি।",
      },
      {
        title: "RJSC অনুমোদন",
        desc: "RJSC-তে দাখিল করে সার্টিফায়েড ফরম ১১৭ সংগ্রহ।",
      },
    ],
    complianceEn:
      "Turnaround is 5 to 7 working days. Establishes indisputable legal ownership and title to equity.",
    complianceBn:
      "৫ থেকে ৭ কর্মদিবস সময় লাগে। আইনিভাবে নতুন শেয়ারহোল্ডারের মালিকানা প্রতিষ্ঠিত হয়।",
  },

  "Share Allotment": {
    overviewEn:
      "Statutory increase of paid-up capital and allotment of new shares to existing or new investors by filing Form XV (Return of Allotments) with RJSC under the Companies Act 1994.",
    overviewBn:
      "কোম্পানির পরিশোধিত মূলধন বৃদ্ধি ও নতুন শেয়ার বরাদ্দের আইনি প্রক্রিয়া—RJSC-তে ফরম XV দাখিল।",
    scopeEn: [
      "Extraordinary General Meeting (EGM) or Board meeting resolution drafting",
      "Preparation of statutory Return of Allotments (Form XV)",
      "Verification of inward capital deposit in company bank account",
      "Filing and obtaining certified Form XV and new share certificates",
    ],
    scopeBn: [
      "শেয়ার বরাদ্দের বিশেষ সাধারণ সভা (EGM) বা বোর্ড রেজল্যুশন প্রণয়ন",
      "সংবিধিবদ্ধ রিটার্ন অব অ্যালটমেন্ট (ফরম XV) প্রস্তুত",
      "কোম্পানির ব্যাংক হিসাবে শেয়ারের অর্থ জমার প্রমাণাদি যাচাই",
      "RJSC-তে দাখিল ও সার্টিফায়েড ফরম XV সংগ্রহ",
    ],
    docsEn: [
      "Bank statement showing capital deposit from allottees",
      "Allottees' NID/Passport and personal E-TIN copies",
      "Board Resolution and EGM minutes approving allotment",
      "Current Memorandum of Association (MoA) showing authorized capital headroom",
    ],
    docsBn: [
      "নতুন মূলধন ব্যাংক হিসাবে জমার ব্যাংক স্টেটমেন্ট",
      "শেয়ার গ্রহণকারীদের NID/পাসপোর্ট ও ই-টিন কপি",
      "বরাদ্দ অনুমোদন সংক্রান্ত বোর্ড রেজল্যুশন ও মিনিটস",
      "কোম্পানির স্মারকলিপিতে অনুমোদিত মূলধনের কপি",
    ],
    stepsEn: [
      {
        title: "Capital Deposit",
        desc: "Deposit equity funds into corporate bank account.",
      },
      {
        title: "Form XV Drafting",
        desc: "Draft Form XV detailing share allocation.",
      },
      {
        title: "RJSC Endorsement",
        desc: "Submit to RJSC and receive certified Form XV.",
      },
    ],
    stepsBn: [
      {
        title: "মূলধন জমা",
        desc: "কোম্পানির ব্যাংক অ্যাকাউন্টে বিনিয়োগের অর্থ জমা।",
      },
      {
        title: "ফরম XV প্রস্তুত",
        desc: "বরাদ্দকৃত শেয়ারের বিবরণীসহ ফরম XV প্রণয়ন।",
      },
      {
        title: "RJSC অনুমোদন",
        desc: "অনলাইনে দাখিল করে সার্টিফায়েড ফরম XV সংগ্রহ।",
      },
    ],
    complianceEn:
      "Form XV must be filed within 60 days of allotment. Authorizes issuing new share certificates to incoming investors.",
    complianceBn:
      "শেয়ার বরাদ্দের ৬০ দিনের মধ্যে RJSC-তে দাখিল করতে হয়। এটি প্রাতিষ্ঠানিক বিনিয়োগের আইনি বৈধতা দেয়।",
  },

  "Winding up": {
    overviewEn:
      "Orderly voluntary liquidation, solvent company dissolution, and strike-off under the Companies Act 1994 and RJSC rules.",
    overviewBn:
      "কোম্পানি আইন অনুযায়ী স্বেচ্ছায় কোম্পানি অবলুপ্তি (Members' Voluntary Winding Up) ও RJSC রেকর্ড থেকে নাম কর্তন।",
    scopeEn: [
      "Declaration of Solvency drafting and statutory CA asset-liability audit",
      "Extraordinary General Meeting coordination and appointment of Liquidator",
      "Official Gazette publication and newspaper notices for creditor inspection",
      "Final general meeting, liquidator report submission, and RJSC dissolution order",
    ],
    scopeBn: [
      "ঋণ পরিশোধ সক্ষমতার ঘোষণা (Declaration of Solvency) ও সিএ অডিট সম্পাদন",
      "বিশেষ সাধারণ সভা (EGM) পরিচালনা ও লিকুইডেটর নিয়োগ",
      "সরকারি গেজেট ও জাতীয় দৈনিকে পাওনাদারদের অবগতির জন্য বিজ্ঞপ্তি প্রকাশ",
      "চূড়ান্ত সাধারণ সভা, লিকুইডেটরের হিসাব দাখিল ও RJSC থেকে বিলুপ্তির আদেশ লাভ",
    ],
    docsEn: [
      "Audited financial statement showing full settlement of liabilities",
      "Bank closure statement and tax clearance certificate from NBR",
      "Board resolution and EGM special resolution for voluntary winding up",
      "Declaration of solvency signed by directors before a notary public",
    ],
    docsBn: [
      "সকল দায়দেনা পরিশোধ সংবলিত নিরীক্ষিত চূড়ান্ত আর্থিক হিসাব",
      "ব্যাংক হিসাব বন্ধের প্রত্যয়ন ও কর অফিস থেকে অনাপত্তিপত্র (NOC)",
      "স্বেচ্ছায় অবলুপ্তির বিশেষ রেজল্যুশন ও সভার কার্যবিবরণী",
      "নোটারি পাবলিকের সামনে পরিচালকদের স্বাক্ষরিত সলভেন্সি ঘোষণা",
    ],
    stepsEn: [
      {
        title: "Solvency Declaration",
        desc: "Execute solvency declaration and appoint liquidator.",
      },
      {
        title: "Gazette Notification",
        desc: "Publish winding up notices in official Gazette and newspapers.",
      },
      {
        title: "Dissolution Order",
        desc: "Submit liquidator final accounts to RJSC and secure strike-off order.",
      },
    ],
    stepsBn: [
      {
        title: "সলভেন্সি ঘোষণা",
        desc: "দায়মুক্তির ঘোষণা দাখিল ও লিকুইডেটর নিয়োগ।",
      },
      {
        title: "গেজেট প্রকাশ",
        desc: "সরকারি গেজেট ও পত্রিকায় বিজ্ঞপ্তি প্রকাশ।",
      },
      {
        title: "কোম্পানি বিলুপ্তি",
        desc: "চূড়ান্ত হিসাব দাখিল করে RJSC থেকে নাম কর্তন নিশ্চিতকরণ।",
      },
    ],
    complianceEn:
      "Process typically spans 3 to 6 months. Formally extinguishes all future legal, tax, and statutory liabilities of the directors.",
    complianceBn:
      "৩ থেকে ৬ মাস সময় লাগে। আনুষ্ঠানিকভাবে কোম্পানি বন্ধ হলে পরিচালকরা সকল ভবিষ্যৎ দায় থেকে মুক্তি পান।",
  },

  "High Court permission": {
    overviewEn:
      "Legal petition and representation before the High Court Division (Company Bench) under the Companies Act 1994 for condonation of delayed AGMs, MoA alteration, or capital reduction.",
    overviewBn:
      "কোম্পানি আইন অনুযায়ী নির্ধারিত সময়ে AGM না হওয়া বা স্মারকলিপি পরিবর্তনের ক্ষেত্রে হাইকোর্ট বিভাগের কোম্পানি বেঞ্চে অনুমতি প্রার্থনা ও আদেশ লাভ।",
    scopeEn: [
      "Drafting and filing Company Matter Petition before the Company Bench of the Supreme Court of Bangladesh",
      "Preparation of supporting affidavits, audited statements, and board records",
      "Representation by Senior Supreme Court Advocates during motion hearings",
      "Securing certified High Court Order and regularizing records at RJSC",
    ],
    scopeBn: [
      "বাংলাদেশ সুপ্রিম কোর্টের কোম্পানি বেঞ্চে কোম্পানি ম্যাটার পিটিশন ড্রাফটিং ও দাখিল",
      "সহায়ক হলফনামা, অডিট রিপোর্ট ও বোর্ড রেজল্যুশন প্রস্তুত",
      "হাইকোর্টে শুনানিতে সিনিয়র আইনজীবীর মাধ্যমে আইনি যুক্তি উপস্থাপন",
      "হাইকোর্টের প্রত্যয়িত আদেশপত্র সংগ্রহ ও RJSC-তে দাখিল করে কোম্পানি নিয়মিতকরণ",
    ],
    docsEn: [
      "Certified true copies of Certificate of Incorporation, MoA, AoA, and last Form XII",
      "Audited financial statements for all overdue financial years",
      "Board resolutions explaining circumstances preventing timely AGM",
      "Vakalatnama authorizing Supreme Court advocate",
    ],
    docsBn: [
      "ইনকর্পোরেশন সনদ, স্মারকলিপি ও সর্বশেষ দাখিলকৃত ফরম XII-এর সার্টিফায়েড কপি",
      "বকেয়া সকল অর্থবছরের নিরীক্ষিত আর্থিক প্রতিবেদন",
      "দেরিতে AGM অনুষ্ঠানের কারণ সংবলিত বোর্ড রেজল্যুশন",
      "সুপ্রিম কোর্টের আইনজীবীর অনুকূলে স্বাক্ষরিত ওকালতনামা",
    ],
    stepsEn: [
      {
        title: "Petition Drafting",
        desc: "Draft Company Matter petition detailing facts and grounds for relief.",
      },
      {
        title: "High Court Hearing",
        desc: "Move petition before the Hon'ble Company Bench.",
      },
      {
        title: "Order Execution",
        desc: "Obtain certified Court order and submit to RJSC to complete delayed AGM.",
      },
    ],
    stepsBn: [
      {
        title: "পিটিশন প্রণয়ন",
        desc: "বিলম্ব ক্ষমার যৌক্তিক কারণ তুলে ধরে হাইকোর্টে পিটিশন তৈরি।",
      },
      {
        title: "আদালতে শুনানি",
        desc: "কোম্পানি বেঞ্চে শুনানি পরিচালনা ও অনুকূল আদেশ লাভ।",
      },
      {
        title: "আদেশ কার্যকর",
        desc: "হাইকোর্টের সার্টিফায়েড আদেশ সংগ্রহ করে RJSC-তে বকেয়া AGM সম্পন্ন।",
      },
    ],
    complianceEn:
      "Turnaround is 4 to 8 weeks depending on court vacation and bench schedule. Sole legal route to regularize companies with multi-year AGM delays.",
    complianceBn:
      "আদালতের সময়সূচির ওপর ভিত্তি করে ৪ থেকে ৮ সপ্তাহ লাগে। বহু বছর রিটার্ন বকেয়া থাকা কোম্পানি সচলের এটি একমাত্র আইনি উপায়।",
  },
};

export function getServiceOverviewHtml(ctx: ServiceTemplateContext): string {
  const isBn = ctx.locale === "bn";
  const item = serviceDirectory[ctx.title];

  if (item) {
    const overview = isBn ? item.overviewBn : item.overviewEn;
    const scope = isBn ? item.scopeBn : item.scopeEn;
    const docs = isBn ? item.docsBn : item.docsEn;
    const steps = isBn ? item.stepsBn : item.stepsEn;
    const compliance = isBn ? item.complianceBn : item.complianceEn;

    const headingOverview = isBn
      ? `${ctx.title} — পরিচিতি ও উদ্দেশ্য`
      : `${ctx.title} — Overview & Purpose`;
    const headingScope = isBn
      ? "কাজের পরিধি ও অন্তর্ভুক্ত সুবিধাসমূহ"
      : "What This Service Includes (Scope of Work)";
    const headingDocs = isBn
      ? "প্রয়োজনীয় কাগজপত্র ও পূর্বশর্ত"
      : "Required Documents & Prerequisites";
    const headingSteps = isBn
      ? "ধাপভিত্তিক আবেদন ও সম্পাদন প্রক্রিয়া"
      : "Step-by-Step Procedure";
    const headingCompliance = isBn
      ? "সময়সীমা ও আইনি কমপ্লায়েন্স সংক্রান্ত তথ্য"
      : "Statutory Compliance & Delivery Timeline";

    const scopeList = scope.map((s) => `<li>${s}</li>`).join("");
    const docsList = docs.map((d) => `<li>${d}</li>`).join("");
    const stepsList = steps
      .map((st) => `<li><strong>${st.title}:</strong> ${st.desc}</li>`)
      .join("");

    return [
      `<h2>${headingOverview}</h2>`,
      `<p>${overview}</p>`,
      `<h3>${headingScope}</h3>`,
      `<ul>${scopeList}</ul>`,
      `<h3>${headingDocs}</h3>`,
      `<ul>${docsList}</ul>`,
      `<h3>${headingSteps}</h3>`,
      `<ol>${stepsList}</ol>`,
      `<h3>${headingCompliance}</h3>`,
      `<p>${compliance}</p>`,
    ].join("\n");
  }

  // Fallback for any unmapped title: rich structured format without links
  if (isBn) {
    return [
      `<h2>${ctx.title} — সেবার সার্বিক বিবরণ</h2>`,
      `<p>${ctx.description} Limex আপনার ব্যবসায়িক ও আইনি প্রয়োজন অনুযায়ী সঠিক নির্দেশনা, প্রয়োজনীয় নথিপত্র প্রস্তুত এবং সংশ্লিষ্ট সরকারি কর্তৃপক্ষের সঙ্গে সমন্বয়ের মাধ্যমে প্রক্রিয়াটি সম্পন্ন করে।</p>`,
      `<h3>কাজের পরিধি ও অন্তর্ভুক্ত সুবিধাসমূহ</h3>`,
      `<ul>`,
      `<li>প্রাথমিক পর্যালোচনা ও প্রযোজ্য সরকারি বিধিবিধান যাচাই</li>`,
      `<li>প্রয়োজনীয় কাগজপত্র, চুক্তি ও সংবিধিবদ্ধ আবেদন ফরম প্রস্তুতকরণ</li>`,
      `<li>অনুমোদিত সরকারি পোর্টালে ডিজিটাল আবেদন সাবমিশন ও ফি চালান সমন্বয়</li>`,
      `<li>সংশ্লিষ্ট কর্তৃপক্ষের সাথে যাচাই সমন্বয় ও চূড়ান্ত অনুমোদন সংগ্রহ</li>`,
      `</ul>`,
      `<h3>প্রয়োজনীয় কাগজপত্র ও পূর্বশর্ত</h3>`,
      `<ul>`,
      `<li>আবেদনকারী বা পরিচালকদের জাতীয় পরিচয়পত্র (NID) বা পাসপোর্ট কপি</li>`,
      `<li>হালনাগাদ ই-টিন ও ভ্যাট/BIN সনদ (প্রযোজ্য ক্ষেত্রে)</li>`,
      `<li>ব্যবসায়িক কার্যালয়ের ঠিকানা ও চুক্তিপত্র</li>`,
      `<li>সেবা সংশ্লিষ্ট পূর্ববর্তী অনুমতি বা প্রাতিষ্ঠানিক নথিপত্র</li>`,
      `</ul>`,
      `<h3>ধাপভিত্তিক প্রক্রিয়া</h3>`,
      `<ol>`,
      `<li><strong>প্রয়োজনীয়তা বিশ্লেষণ:</strong> আপনার ব্যবসায়ের লক্ষ্য ও বর্তমান নথিপত্র পর্যালোচনা।</li>`,
      `<li><strong>ডকুমেন্ট প্রস্তুতকরণ:</strong> বিধিবদ্ধ আবেদন ও প্রয়োজনীয় নথির সম্পূর্ণ ফাইল প্রস্তুত।</li>`,
      `<li><strong>সরকারি দাখিল:</strong> সংশ্লিষ্ট কর্তৃপক্ষ বা পোর্টালে আনুষ্ঠানিক আবেদন সাবমিট।</li>`,
      `<li><strong>অনুমোদন ও হস্তান্তর:</strong> আনুষ্ঠানিক অনুমোদন বা সনদ সংগ্রহ করে ক্লায়েন্টকে হস্তান্তর।</li>`,
      `</ol>`,
      `<h3>সময়সীমা ও আইনি নির্দেশনা</h3>`,
      `<p>সাধারণত ৩ থেকে ৭ কর্মদিবসের মধ্যে প্রাথমিক প্রক্রিয়া সম্পন্ন হয়। কাজের পরিধি ও সংশ্লিষ্ট কর্তৃপক্ষের সময়সূচির ওপর ভিত্তি করে চূড়ান্ত সনদ প্রদান করা হয়।</p>`,
    ].join("\n");
  }

  return [
    `<h2>${ctx.title} — Overview & Scope</h2>`,
    `<p>${ctx.description} Limex provides end-to-end professional support to organize required documentation, ensure compliance with relevant Bangladesh statutory authorities, and guide your business through a structured filing process.</p>`,
    `<h3>What This Service Includes (Scope of Work)</h3>`,
    `<ul>`,
    `<li>Comprehensive regulatory review and jurisdiction assessment</li>`,
    `<li>Preparation, verification, and drafting of required statutory documentation</li>`,
    `<li>Filing coordination with designated government portals and fee settlements</li>`,
    `<li>Regularization, follow-through, and final deliverable handover</li>`,
    `</ul>`,
    `<h3>Required Documents & Prerequisites</h3>`,
    `<ul>`,
    `<li>National ID (NID) or Passport copies of authorized principals/directors</li>`,
    `<li>Valid Trade License and E-TIN/VAT certificates (if existing business)</li>`,
    `<li>Commercial space physical address proof or lease agreement</li>`,
    `<li>Supporting regulatory clearances or sector-specific records</li>`,
    `</ul>`,
    `<h3>Step-by-Step Procedure</h3>`,
    `<ol>`,
    `<li><strong>Discovery & Scope:</strong> Review business objectives and verify applicable statutory prerequisites.</li>`,
    `<li><strong>Documentation:</strong> Compile, draft, and review all required application forms and legal instruments.</li>`,
    `<li><strong>Statutory Submission:</strong> Execute filing through designated government portals and settle official fees.</li>`,
    `<li><strong>Verification & Handover:</strong> Coordinate registry inspection/review and deliver final certified credentials.</li>`,
    `</ol>`,
    `<h3>Statutory Compliance & Timeline</h3>`,
    `<p>Typical processing spans 3 to 7 working days depending on the statutory agency. Ongoing compliance guidance is provided to maintain active, penalty-free regulatory standing.</p>`,
  ].join("\n");
}
