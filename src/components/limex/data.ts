export type MegaMenuChild = {
  label: string;
  href: string;
  description?: string;
};

export type MegaMenuItem = {
  label: string;
  description: string;
  href: string;
  marker: string;
  children?: MegaMenuChild[];
};

export type MegaMenuGroup = {
  key: string;
  label: string;
  railLabel: string;
  description: string;
  items: MegaMenuItem[];
};

export type MegaMenuSpotlight = {
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export type MegaMenuTone = "green" | "violet" | "teal" | "orange";

export type NavItem = {
  label: string;
  href: string;
  active?: boolean;
  megaGroups?: MegaMenuGroup[];
  menuEyebrow?: string;
  menuTitle?: string;
  menuDescription?: string;
  spotlight?: MegaMenuSpotlight;
  tone?: MegaMenuTone;
};

const limitedCompanyUrl = "https://tradeupbd.com/businessbox/limited-company";
const partnershipUrl = "https://tradeupbd.com/businessbox/partnership-firm";
const tradeLicenseUrl = "https://tradeupbd.com/businessbox/trade-license";
const vatRegistrationUrl = "https://jkassociates.com.bd/vat-registration-certificate-in-bangladesh";
const fireLicenseUrl = "https://segunbagicha.com/service/fire-license/";
const egpRegistrationUrl = "https://segunbagicha.com/service/egp-registration/";
const startupPackageUrl = "https://jkassociates.com.bd/startup-packages";
const agreementBuilderUrl = "https://aideed.daptari.com/deeds";

const startupAndLicensing: MegaMenuGroup[] = [
  {
    key: "company-formation",
    label: "COMPANY FORMATION",
    railLabel: "Company setup",
    description: "Choose the right legal structure before you launch.",
    items: [
      {
        label: "Company Formation",
        description: "Set up the right legal structure.",
        href: "#contact",
        marker: "01",
        children: [
          { label: "Limited Company Formation", href: limitedCompanyUrl },
          { label: "One Person Company Formation", href: "#contact" },
          { label: "Public Limited Company Formation", href: "#contact" },
          { label: "Partnership Firm Registration", href: partnershipUrl },
          { label: "Foreign Company Registration", href: "#contact" },
          { label: "Joint venture Company Registration", href: "#contact" },
          { label: "Society/Foundation/Trust/Club Registration", href: "#contact" },
          { label: "Forging Company Formation", href: "#contact" },
        ],
      },
    ],
  },
  {
    key: "licenses-and-permissions",
    label: "LICENSES & PERMISSIONS",
    railLabel: "Licenses",
    description: "Get the permits and registrations your operation needs.",
    items: [
      {
        label: "Trade License",
        description: "Apply, renew or update your license.",
        href: tradeLicenseUrl,
        marker: "02",
        children: [
          { label: "New Trade License", href: tradeLicenseUrl },
          { label: "Renewal", href: tradeLicenseUrl },
          { label: "Corrections", href: tradeLicenseUrl },
          { label: "Trade License Cancel", href: tradeLicenseUrl },
        ],
      },
      {
        label: "VAT / BIN Registration",
        description: "Register and recover your BIN.",
        href: vatRegistrationUrl,
        marker: "03",
        children: [{ label: "BIN Correction & Recovery", href: "#contact" }],
      },
      {
        label: "TIN / TAX Registration",
        description: "Get your business and personal tax records ready.",
        href: "#contact",
        marker: "04",
        children: [
          { label: "New Individual E-TIN Registration", href: "#contact" },
          { label: "Limited Company E-TIN Registration", href: "#contact" },
          { label: "Partnership E-TIN Registration", href: "#contact" },
          { label: "E-TIN Correction", href: "#contact" },
          { label: "E-TIN Cancel", href: "#contact" },
        ],
      },
      { label: "Import License", description: "Get your import permission in place.", href: "#contact", marker: "05" },
      { label: "Export License", description: "Prepare for international trade.", href: "#contact", marker: "06" },
      {
        label: "Association Membership",
        description: "Join the right industry and business networks.",
        href: "#contact",
        marker: "07",
        children: [
          { label: "DHAKA Chamber of Commerce", href: "#contact" },
          { label: "REHAB MEMBERSHIP", href: "#contact" },
          { label: "RAJUK Enlistment", href: "#contact" },
          { label: "Others Membership", href: "#contact" },
        ],
      },
      { label: "Factory License", description: "Complete the requirements for your facility.", href: "#contact", marker: "08" },
      { label: "Fire License", description: "Move forward with fire safety clearance.", href: fireLicenseUrl, marker: "09" },
      { label: "BSTI Permission", description: "Meet Bangladesh Standards requirements.", href: "#contact", marker: "10" },
      { label: "Environment Clearance", description: "Plan the right environmental approval.", href: "#contact", marker: "11" },
    ],
  },
  {
    key: "membership-and-launch",
    label: "SPECIALIST SUPPORT & LAUNCH",
    railLabel: "Specialist support",
    description: "Build credibility, access networks and launch with confidence.",
    items: [
      { label: "DBID Certificate", description: "Digital business identification.", href: "#contact", marker: "12" },
      { label: "Travel Agency License", description: "Prepare and submit your travel agency application.", href: "#contact", marker: "13" },
      { label: "BIDA Registration", description: "Support for foreign investment setup.", href: "#contact", marker: "14" },
      { label: "e-GP Registration", description: "Get ready for public procurement.", href: egpRegistrationUrl, marker: "15" },
      {
        label: "Startup Business Package",
        description: "Bundle the basics for a credible launch.",
        href: startupPackageUrl,
        marker: "16",
        children: [
          { label: "Website", href: startupPackageUrl },
          { label: "Logo Design", href: startupPackageUrl },
          { label: "Digital Marketing", href: startupPackageUrl },
        ],
      },
    ],
  },
];

const ipAndTrademark: MegaMenuGroup[] = [
  {
    key: "trademark",
    label: "PROTECT YOUR BRAND",
    railLabel: "Trademark",
    description: "Search, file and protect the name you are building.",
    items: [
      {
        label: "Trademark",
        description: "Protect your mark from search to certification.",
        href: "/services/trademark-registration",
        marker: "01",
        children: [
          { label: "Trademark Search", href: "#contact" },
          { label: "Trademark Application", href: "/services/trademark-registration" },
          { label: "TM Objection", href: "#contact" },
          { label: "Trademark Publication/Gazette", href: "#contact" },
          { label: "Trademark Opposition", href: "#contact" },
          { label: "Trademark Certification", href: "#contact" },
          { label: "Trademark Class Finder", href: "/trademark-classes" },
          { label: "Expert Trademark Review", href: "#contact" },
        ],
      },
    ],
  },
  {
    key: "creative-ownership",
    label: "CREATE & OWN",
    railLabel: "Copyright & patent",
    description: "Secure the original work and ideas behind your business.",
    items: [
      { label: "Copyright Registration", description: "Protect your original work.", href: "#contact", marker: "02" },
      { label: "Patent Registration", description: "Secure your innovation.", href: "#contact", marker: "03" },
    ],
  },
];

const complianceAndDocumentation: MegaMenuGroup[] = [
  {
    key: "tax-and-vat",
    label: "TAX & VAT",
    railLabel: "Tax & VAT",
    description: "Stay current with the filings that keep your business moving.",
    items: [
      {
        label: "Income Tax",
        description: "Keep individual and business returns on track.",
        href: "#contact",
        marker: "01",
        children: [
          { label: "Individual Tax Return Filings", href: "#contact" },
          { label: "Withholdings Tax Submission", href: "#contact" },
        ],
      },
      {
        label: "VAT",
        description: "Manage monthly VAT obligations with confidence.",
        href: "#contact",
        marker: "02",
        children: [{ label: "Monthly Vat Return Submission", href: "#contact" }],
      },
    ],
  },
  {
    key: "finance-and-documents",
    label: "FINANCE & DOCUMENTS",
    railLabel: "Finance & documents",
    description: "Turn complex paperwork into clear, usable documentation.",
    items: [
      { label: "CA Audit Service", description: "Independent support for financial clarity.", href: "#contact", marker: "03" },
      { label: "CA Assets Valuation", description: "Document the value behind your business.", href: "#contact", marker: "04" },
      { label: "Project Proposal", description: "Present the next opportunity clearly.", href: "#contact", marker: "05" },
      { label: "Accounts Service", description: "Keep your numbers organized.", href: "#contact", marker: "06" },
      { label: "HR and Payroll Service", description: "Support your growing team.", href: "#contact", marker: "07" },
      { label: "Affidavits", description: "Prepare formal declarations with care.", href: "#contact", marker: "08" },
      { label: "Translation", description: "Make important documents usable.", href: "#contact", marker: "09" },
    ],
  },
  {
    key: "rjsc-compliance",
    label: "RJSC COMPLIANCE",
    railLabel: "RJSC compliance",
    description: "Handle company records, changes and annual obligations.",
    items: [
      {
        label: "RJSC Compliance",
        description: "Keep your company records current.",
        href: "#contact",
        marker: "10",
        children: [
          { label: "Annual Return Filings", href: "#contact" },
          { label: "Share Transfer", href: "#contact" },
          { label: "Share Allotment", href: "#contact" },
          { label: "Winding up", href: "#contact" },
          { label: "High Court permission", href: "#contact" },
        ],
      },
    ],
  },
];

const businessTools: MegaMenuGroup[] = [
  {
    key: "fee-calculators",
    label: "FEE CALCULATORS",
    railLabel: "Fee calculators",
    description: "Plan costs before you commit to the next step.",
    items: [
      {
        label: "Fee Calculator",
        description: "Estimate common registration and compliance fees.",
        href: "#tools",
        marker: "01",
        children: [
          { label: "Trade License Fee Calculator", href: "#tools" },
          { label: "RJSC Fee Calculator", href: "#tools" },
          { label: "TAX Calculator", href: "#tools" },
          { label: "VAT Calculator", href: "#tools" },
          { label: "Trademark Calculator", href: "#tools" },
          { label: "IRC/ERC FEE Calculator", href: "#tools" },
        ],
      },
    ],
  },
  {
    key: "agreement-builders",
    label: "BUSINESS AGREEMENTS",
    railLabel: "Agreement builders",
    description: "Create the documents that keep business moving.",
    items: [
      {
        label: "Business Agreement Builder",
        description: "Build practical agreements in the right format.",
        href: agreementBuilderUrl,
        marker: "02",
        children: [
          { label: "Office Rental Deed Agreement Builder (Eng and Bangla)", href: agreementBuilderUrl },
          { label: "E-Trade License Closed/Cancel Application", href: agreementBuilderUrl },
          { label: "Partnership Deed Agreement Builder (Eng and Bangla)", href: agreementBuilderUrl },
          { label: "MOA/AOA Builder", href: agreementBuilderUrl },
          { label: "MOU Generator", href: agreementBuilderUrl },
          { label: "Employment Agreement Generator", href: agreementBuilderUrl },
        ],
      },
    ],
  },
];

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Startup & Licensing",
    href: "#services",
    active: true,
    megaGroups: startupAndLicensing,
    menuEyebrow: "STARTUP & LICENSING",
    menuTitle: "Launch with the right foundation.",
    menuDescription: "Formation, licensing and launch support for ambitious businesses.",
    tone: "green",
    spotlight: {
      badge: "RECOMMENDED",
      title: "Not sure where to begin?",
      description: "Tell us what you are building and we will point you to the right service.",
      ctaLabel: "Get a recommendation",
      ctaHref: "#contact",
    },
  },
  {
    label: "IP & Trademark",
    href: "#services",
    megaGroups: ipAndTrademark,
    menuEyebrow: "INTELLECTUAL PROPERTY",
    menuTitle: "Protect what makes you different.",
    menuDescription: "Search, register and defend the ideas and identity behind your business.",
    tone: "teal",
    spotlight: {
      badge: "PROTECT YOUR NAME",
      title: "Make your mark worth building.",
      description: "Start with a clear search and a filing plan built around your brand.",
      ctaLabel: "Talk about your brand",
      ctaHref: "#contact",
    },
  },
  {
    label: "Compliance & Documentation",
    href: "#services",
    megaGroups: complianceAndDocumentation,
    menuEyebrow: "COMPLIANCE & DOCUMENTATION",
    menuTitle: "Stay ahead of every filing.",
    menuDescription: "Practical support for tax, VAT, accounts, people and corporate records.",
    tone: "violet",
    spotlight: {
      badge: "STAY CURRENT",
      title: "Keep the paperwork moving.",
      description: "Build a dependable rhythm for the obligations your business cannot miss.",
      ctaLabel: "Plan your compliance",
      ctaHref: "#contact",
    },
  },
  {
    label: "Business Tools",
    href: "/#tools",
    megaGroups: businessTools,
    menuEyebrow: "BUSINESS TOOLS",
    menuTitle: "Make the next decision easier.",
    menuDescription: "Use calculators and document builders to move from question to action.",
    tone: "orange",
    spotlight: {
      badge: "TOOLS INCLUDED",
      title: "Build with more confidence.",
      description: "Estimate fees and prepare essential agreements without starting from scratch.",
      ctaLabel: "Explore all tools",
      ctaHref: "#tools",
    },
  },
  { label: "About us", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export const serviceFilters = [
  "All services",
  "Startup",
  "Tax & compliance",
  "Trademark",
  "Advisory",
] as const;

export type ServiceFilter = (typeof serviceFilters)[number];

export type Service = {
  number: string;
  label: string;
  title: string;
  description: string;
  action: string;
  color: string;
  surface: string;
  filters: ServiceFilter[];
};

export const services: Service[] = [
  {
    number: "02",
    label: "FUNDRAISING",
    title: "Capital and Investors",
    description: "Connect with angel investors and venture capitalists to secure funding.",
    action: "Learn more",
    color: "#2e6b4f",
    surface: "#d6ebde",
    filters: ["Advisory"],
  },
  {
    number: "03",
    label: "MARKET RESEARCH",
    title: "Industry Analysis",
    description: "Gather insights on competitors and customer preferences.",
    action: "Get insights",
    color: "#5c4aa6",
    surface: "#dedbfa",
    filters: ["Advisory", "Startup"],
  },
  {
    number: "04",
    label: "PRODUCT DEVELOPMENT",
    title: "Design and Prototyping",
    description: "Create product designs and build working prototypes.",
    action: "Develop product",
    color: "#b83652",
    surface: "#fcdbe0",
    filters: ["Startup", "Advisory"],
  },
  {
    number: "05",
    label: "BRANDING",
    title: "Identity and Promotion",
    description: "Establish brand identity with logos, slogans, and marketing materials.",
    action: "Build brand",
    color: "#9e5726",
    surface: "#fae5cc",
    filters: ["Trademark", "Startup"],
  },
  {
    number: "06",
    label: "SALES STRATEGY",
    title: "Channels and Tactics",
    description: "Develop effective sales channels and outreach campaigns.",
    action: "Boost sales",
    color: "#1f6e70",
    surface: "#d1edeb",
    filters: ["Advisory"],
  },
  {
    number: "07",
    label: "LEGAL COMPLIANCE",
    title: "Regulations and Policies",
    description: "Ensure business meets all legal and regulatory requirements.",
    action: "Check compliance",
    color: "#2e6b4f",
    surface: "#d6ebde",
    filters: ["Tax & compliance"],
  },
  {
    number: "08",
    label: "TALENT ACQUISITION",
    title: "Hiring and Management",
    description: "Attract and retain skilled professionals for your team.",
    action: "Find talent",
    color: "#5c4aa6",
    surface: "#dedbfa",
    filters: ["Startup", "Advisory"],
  },
  {
    number: "09",
    label: "FINANCIAL PLANNING",
    title: "Budgeting and Forecasting",
    description: "Plan budgets and project future revenues and expenses.",
    action: "Plan finances",
    color: "#b83652",
    surface: "#fcdbe0",
    filters: ["Tax & compliance", "Advisory"],
  },
  {
    number: "10",
    label: "CUSTOMER SUPPORT",
    title: "Service and Feedback",
    description: "Build a support system to engage and retain customers.",
    action: "Enhance support",
    color: "#9e5726",
    surface: "#fae5cc",
    filters: ["Advisory"],
  },
  {
    number: "11",
    label: "SCALING UP",
    title: "Expansion Strategies",
    description: "Prepare for growth through new markets and partnerships.",
    action: "Scale business",
    color: "#1f6e70",
    surface: "#d1edeb",
    filters: ["Startup", "Advisory"],
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Tell us what you need",
    description: "Share your goal, business stage or compliance question.",
  },
  {
    number: "02",
    title: "Choose the right service",
    description: "We guide you to the service or tool that fits best.",
  },
  {
    number: "03",
    title: "Share requirements",
    description: "Send the details and documents needed for your case.",
  },
  {
    number: "04",
    title: "Complete with confidence",
    description: "Track the next steps and get expert support throughout.",
  },
];

export const packages = [
  {
    tag: "STARTUP",
    title: "Company setup",
    description: "A practical start for a new business.",
    price: "From BDT ৳ 5,000",
    features: ["Company registration", "Trade license support", "TIN guidance"],
    color: "#29634d",
    surface: "#ccebdb",
  },
  {
    tag: "COMPLIANCE",
    title: "Compliance care",
    description: "Stay current without the paperwork.",
    price: "From BDT ৳ 4,500",
    features: ["VAT return support", "Income tax filing", "Annual compliance"],
    color: "#594094",
    surface: "#dbd4fa",
  },
  {
    tag: "BRAND PROTECTION",
    title: "Trademark support",
    description: "Protect the name you are building.",
    price: "From BDT ৳ 6,000",
    features: ["Trademark search", "Filing assistance", "Status follow-up"],
    color: "#9e3347",
    surface: "#fac7cc",
  },
];

export const reels = [
  {
    image: "/figma/reel-1.png",
    title: "Real stories from real users enhancing credibility",
    meta: "03:30  |  Feedback compilation",
  },
  {
    image: "/figma/reel-2.png",
    title: "Exploring bold aesthetics and user-friendly interfaces",
    meta: "02:05  |  Key design concepts",
  },
  {
    image: "/figma/reel-3.png",
    title: "Analyzing current and future industry movements",
    meta: "01:50  |  Trend analysis",
  },
  {
    image: "/figma/reel-4.png",
    title: "Highlighting seamless integrations and efficiency gains",
    meta: "00:45  |  Core functionalities",
  },
  {
    image: "/figma/reel-5.png",
    title: "A closer look at the work behind each outcome",
    meta: "00:45  |  Core functionalities",
  },
];

export const tools = [
  {
    mark: "VAT",
    tag: "QUICK ESTIMATE",
    title: "VAT calculator",
    description: "Get a quick view of VAT due before you file or quote.",
    rows: [
      ["Sales amount", "BDT 0.00"],
      ["VAT rate", "15%"],
    ],
    action: "Open calculator",
    color: "#29664f",
    surface: "#d1ede0",
  },
  {
    mark: "TAX",
    tag: "PLAN AHEAD",
    title: "Income tax estimator",
    description: "Understand your estimated tax and plan the next step with clarity.",
    rows: [
      ["Annual income", "BDT 0.00"],
      ["Tax year", "2026"],
    ],
    action: "Estimate tax",
    color: "#594094",
    surface: "#e0d9fa",
  },
  {
    mark: "DOC",
    tag: "BUILD A DOCUMENT",
    title: "Deed builder",
    description: "Create a structured first draft with guided fields and export options.",
    rows: [
      ["Document type", "Select deed"],
      ["Output", "PDF ready"],
    ],
    action: "Start building",
    color: "#914a2b",
    surface: "#fae0cc",
  },
];

export const faqs = [
  {
    question: "What do I need to get started?",
    answer: "Usually, a short description of your goal, your basic business details and any documents you already have is enough for a first conversation.",
  },
  {
    question: "How long does a service usually take?",
    answer: "Timing depends on the service and the authority involved. We will share a clear expected timeline before any work begins.",
  },
  {
    question: "Can I get a custom package for my needs?",
    answer: "Yes. We can bundle services, add tools or scope a tailored package around the stage and priorities of your business.",
  },
  {
    question: "Can I track my request after submitting it?",
    answer: "Yes. You will receive progress updates and a direct point of contact for any follow-up questions along the way.",
  },
  {
    question: "Can I speak with an advisor before I decide?",
    answer: "Absolutely. A short introductory conversation is a good way to make sure you are choosing the right next step.",
  },
];

export const footerColumns = [
  {
    title: "SERVICES",
    links: ["Startup & license", "VAT & tax", "Trademark", "Compliance"],
  },
  { title: "COMPANY", links: ["About us", "Blog", "Contact"] },
  { title: "TOOLS", links: ["VAT calculator", "Income tax estimator", "Deed builder"] },
];
