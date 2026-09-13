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
  icon?: ServiceIconName;
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
  key?: string;
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
const agreementBuilderUrl = "/business-tools";

const startupAndLicensing: MegaMenuGroup[] = [
  {
    key: "company-formation",
    label: "COMPANY SETUP",
    railLabel: "Company setup",
    description: "Choose the right legal structure and license before you launch.",
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
    ],
  },
  {
    key: "tax-and-trade",
    label: "TAX, TRADE & CLEARANCES",
    railLabel: "Tax & clearances",
    description: "Put your tax records, trading permissions and clearances in place.",
    items: [
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
      { label: "Factory License", description: "Complete the requirements for your facility.", href: "#contact", marker: "08" },
      { label: "Fire License", description: "Move forward with fire safety clearance.", href: fireLicenseUrl, marker: "09" },
      { label: "BSTI Permission", description: "Meet Bangladesh Standards requirements.", href: "#contact", marker: "10" },
      { label: "Environment Clearance", description: "Plan the right environmental approval.", href: "#contact", marker: "11" },
    ],
  },
  {
    key: "specialist-support-and-launch",
    label: "SPECIALIST SUPPORT & LAUNCH",
    railLabel: "Specialist support",
    description: "Build credibility, access networks and launch with confidence.",
    items: [
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
        href: "/business-tools",
        marker: "01",
        children: [
          { label: "Limited Company Cost Calculator", href: "/business-tools/limited-company" },
          { label: "Trade License Fee Calculator", href: "/business-tools/trade-license" },
          { label: "RJSC Fee Calculator", href: "/business-tools/rjsc" },
          { label: "TAX Calculator", href: "/business-tools/income-tax" },
          { label: "VAT Calculator", href: "/business-tools/vat" },
          { label: "Trademark Calculator", href: "/business-tools/trademark" },
          { label: "IRC/ERC FEE Calculator", href: "/business-tools/irc-erc" },
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
    href: "/business-tools",
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
      ctaHref: "/business-tools",
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
  "Business tools",
] as const;

export type ServiceFilter = (typeof serviceFilters)[number];

export const serviceIconNames = [
  "building",
  "license",
  "receipt-tax",
  "tax",
  "file-upload",
  "file-download",
  "users-group",
  "factory",
  "shield-check",
  "certificate-2",
  "leaf",
  "plane",
  "world",
  "file-check",
  "package",
  "trademark",
  "copyright",
  "lightbulb",
  "report-money",
  "contract",
  "calculator",
  "language",
  "checklist",
  "briefcase",
] as const;

export type ServiceIconName = (typeof serviceIconNames)[number];

export type Service = {
  number: string;
  title: string;
  description: string;
  action: string;
  href: string;
  icon: ServiceIconName;
  color: string;
  surface: string;
  filters: ServiceFilter[];
};

const serviceFilterByNavLabel: Record<string, Exclude<ServiceFilter, "All services">> = {
  "Startup & Licensing": "Startup",
  "IP & Trademark": "Trademark",
  "Compliance & Documentation": "Tax & compliance",
  "Business Tools": "Business tools",
};

const serviceToneByFilter: Record<Exclude<ServiceFilter, "All services">, { color: string; surface: string }> = {
  Startup: { color: "#14dcff", surface: "#e9fbff" },
  "Tax & compliance": { color: "#008cff", surface: "#eaf3ff" },
  Trademark: { color: "#0055ff", surface: "#e8efff" },
  "Business tools": { color: "#14dcff", surface: "#e9fbff" },
};

const serviceIconByLabel: Partial<Record<string, ServiceIconName>> = {
  "Company Formation": "building",
  "Trade License": "license",
  "VAT / BIN Registration": "receipt-tax",
  "TIN / TAX Registration": "tax",
  "Import License": "file-upload",
  "Export License": "file-download",
  "Association Membership": "users-group",
  "Factory License": "factory",
  "Fire License": "shield-check",
  "BSTI Permission": "certificate-2",
  "Environment Clearance": "leaf",
  "DBID Certificate": "certificate-2",
  "Travel Agency License": "plane",
  "BIDA Registration": "world",
  "e-GP Registration": "file-check",
  "Startup Business Package": "package",
  Trademark: "trademark",
  "Copyright Registration": "copyright",
  "Patent Registration": "lightbulb",
  "Income Tax": "tax",
  VAT: "receipt-tax",
  "CA Audit Service": "report-money",
  "CA Assets Valuation": "report-money",
  "Project Proposal": "contract",
  "Accounts Service": "calculator",
  "HR and Payroll Service": "users-group",
  Affidavits: "certificate-2",
  Translation: "language",
  "RJSC Compliance": "checklist",
  "Fee Calculator": "calculator",
  "Business Agreement Builder": "contract",
};

export function createServicesFromNavigation(navigationItems: NavItem[]): Service[] {
  return navigationItems.flatMap((navItem) => {
    const filter = serviceFilterByNavLabel[navItem.label];
    if (!filter) return [];

    const tone = serviceToneByFilter[filter];

    return (navItem.megaGroups ?? []).flatMap((group) =>
      group.items
        .map((item) => ({
          number: item.marker,
          title: item.label,
          description: item.description,
          action: "Learn more",
          href: item.href,
          icon: item.icon ?? serviceIconByLabel[item.label] ?? "briefcase",
          color: tone.color,
          surface: tone.surface,
          filters: [filter],
        }))
        .sort((left, right) => Number(left.number) - Number(right.number)),
    );
  });
}

export const services: Service[] = createServicesFromNavigation(navigation);

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
    description: "For a new business.",
    price: "From BDT ৳ 5,000",
    features: ["Company registration", "Trade license support", "TIN guidance"],
    color: "#008cff",
    surface: "#eaf3ff",
  },
  {
    tag: "COMPLIANCE",
    title: "Compliance care",
    description: "For ongoing compliance.",
    price: "From BDT ৳ 4,500",
    features: ["VAT return support", "Income tax filing", "Annual compliance"],
    color: "#008cff",
    surface: "#eaf3ff",
  },
  {
    tag: "BRAND PROTECTION",
    title: "Trademark support",
    description: "For protecting your brand.",
    price: "From BDT ৳ 6,000",
    features: ["Trademark search", "Filing assistance", "Status follow-up"],
    color: "#0055ff",
    surface: "#e8efff",
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

export const faqs = [
  {
    question: "What do I need to get started?",
    answer: "Share your goal, basic business details and any documents you already have.",
  },
  {
    question: "How long does a service usually take?",
    answer: "It depends on the service and authority. We share a clear timeline before work begins.",
  },
  {
    question: "Can I get a custom package for my needs?",
    answer: "Yes. We can combine services and tailor the scope to your priorities.",
  },
  {
    question: "Can I track my request after submitting it?",
    answer: "Yes. We send progress updates and provide a direct point of contact.",
  },
  {
    question: "Can I speak with an advisor before I decide?",
    answer: "Absolutely. A short introduction helps confirm the right next step.",
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
