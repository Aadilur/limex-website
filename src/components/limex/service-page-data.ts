import type {
  ServiceDetailContent,
  ServiceDestination,
  ServiceFaq,
  ServiceLocale,
  ServicePriceTier,
} from "@/lib/service-types";

export type {
  ServiceDetailContent,
  ServiceDestination,
  ServiceFaq,
  ServicePriceTier,
} from "@/lib/service-types";

export type ServicePageContent = {
  slug: string;
  serviceKey?: string;
  locale?: ServiceLocale;
  breadcrumb: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  category: string;
  title: string;
  description: string;
  ctaLabel: string;
  startingPrice: string;
  deliveryTime: string;
  serviceMode: string;
  mediaTitle: string;
  mediaDescription: string;
  overviewEyebrow: string;
  overviewTitle: string;
  overviewDescription: string;
  overviewHtml?: string;
  overviewDescriptionHtml?: string;
  contentLabel: string;
  contentTitle: string;
  contentDescription: string;
  contentDescriptionHtml?: string;
  contentLinkLabel?: string;
  contentLinkHref?: string;
  keyFactsLabel?: string;
  relatedOptionsLabel?: string;
  toolsEyebrow?: string;
  toolsTitle?: string;
  toolsDescription?: string;
  pricingEyebrow?: string;
  pricingTitle?: string;
  pricingDescription?: string;
  mostPopularLabel?: string;
  faqEyebrow?: string;
  faqTitle?: string;
  faqDescription?: string;
  faqSupportLabel?: string;
  faqSupportDescription?: string;
  contactEyebrow?: string;
  contactTitle?: string;
  contactDescription?: string;
  contactButtonLabel?: string;
  destination?: ServiceDestination;
  relatedLinks?: Array<{
    id: string;
    label: string;
    href: string;
    isVisible: boolean;
    sortOrder: number;
  }>;
  mediaUrl?: string;
  mediaAlt?: string;
  benefits?: string[];
  steps?: Array<{ title: string; description: string }>;
  facts: Array<{ label: string; value: string }>;
  pricing: ServicePriceTier[];
  faqs: ServiceFaq[];
  /** Ordered slugs from the managed business-tools catalogue. */
  tools?: string[];
};

export const trademarkRegistrationService: ServicePageContent = {
  slug: "trademark-registration",
  breadcrumb: "Home / Services / Trademark registration",
  category: "INTELLECTUAL PROPERTY",
  title: "Trademark registration",
  description:
    "Protect your brand with a clear search, filing and follow-through plan.",
  ctaLabel: "Get started",
  startingPrice: "From BDT 5,000",
  deliveryTime: "2 to 3 days",
  serviceMode: "Online or offline",
  mediaTitle: "Trademark registration",
  mediaDescription:
    "A visual slot for your service story, filing flow or helpful explainer.",
  mediaUrl: "",
  mediaAlt: "",
  overviewEyebrow: "OVERVIEW / GUIDED FILING",
  overviewTitle: "What this service includes",
  overviewDescription:
    "A guided path from searching your mark to preparing a clean filing.",
  contentLabel: "THE LIMEX APPROACH",
  contentTitle: "Make the filing decision with more clarity.",
  contentDescription:
    "We help you understand the relevant class, prepare the core information and move through the registration process with practical next steps at every stage.",
  contentLinkLabel: "View full requirements",
  contentLinkHref: "#pricing",
  overviewHtml: `<h2>Trademark Registration in Bangladesh</h2>
<p>Protecting your brand name, wordmark, logo, or tagline through statutory trademark registration grants exclusive nationwide proprietary rights under the Trademarks Act 2009. Registration establishes a definitive legal presumption of ownership, prevents competitor counterfeiting, and enables robust enforcement against unauthorized commercial exploitation.</p>

<h3>Comprehensive Scope of Service</h3>
<p>Limex delivers an end-to-end guided registration workflow coordinated directly with the Department of Patents, Designs and Trademarks (DPDT):</p>
<ul>
  <li><strong>Pre-Filing Clearance Search:</strong> Thorough phonetic, visual, and conceptual conflict analysis against existing marks across the official DPDT registry databases.</li>
  <li><strong>Nice Classification Strategy:</strong> Precision classification across Goods (Classes 1-34) and Services (Classes 35-45) to ensure optimal scope of protection.</li>
  <li><strong>Statutory Application Filing:</strong> Preparation, verification, and formal submission of Form TM-1 with official application number generation.</li>
  <li><strong>Examination &amp; Gazette Monitoring:</strong> Tracking official examination reports, preparing office action responses, and monitoring the 60-day Bangladesh Trademarks Journal publication period.</li>
  <li><strong>Final Certification:</strong> Verification and handover of the formal Certificate of Registration (Form TM-11).</li>
</ul>

<h3>Required Documents &amp; Information</h3>
<p>To initiate a compliant application, please prepare the following details:</p>
<ul>
  <li>High-resolution representation of the mark (logo, emblem, label, or stylized wordmark in JPG/PNG/PDF).</li>
  <li>Applicant identification: NID / Passport for individuals, or Certificate of Incorporation &amp; Trade License for corporate entities.</li>
  <li>Registered business name, trade address, and contact coordinates.</li>
  <li>Specific description of products or commercial services to be covered under the mark.</li>
  <li>First date of commercial use in Bangladesh (or statement of proposed use).</li>
  <li>Signed Form TM-48 (Power of Attorney authorizing official representation before DPDT).</li>
</ul>

<h3>Sequential Filing &amp; Registration Process</h3>
<ol>
  <li><strong>Conflict Clearance &amp; Class Selection:</strong> We review your brand assets, verify distinctiveness, and execute a comprehensive preliminary search.</li>
  <li><strong>Application Drafting &amp; Document Review:</strong> TM-1 application drafting, goods specification formulation, and document integrity checks.</li>
  <li><strong>Official DPDT Submission:</strong> Filing with the trademark registry, fee payment, and issuance of the official Filing Receipt with Application Number.</li>
  <li><strong>Substantive Examination:</strong> Registry review for absolute and relative grounds of refusal, followed by official acceptance.</li>
  <li><strong>Journal Publication &amp; Opposition Window:</strong> 60-day public advertisement in the Bangladesh Trademarks Journal for third-party inspection.</li>
  <li><strong>Issuance of Certificate:</strong> In the absence of opposition, DPDT issues the official Certificate of Registration.</li>
</ol>

<h3>Statutory Timeline &amp; Protection Duration</h3>
<p>The filing receipt is generated within 2 to 3 business days of document completion, allowing immediate use of the TM indicator. The complete statutory process to final certificate typically requires 12 to 18 months in accordance with official registry scheduling. Once granted, registration is valid for 7 years from the date of filing and is indefinitely renewable in 10-year increments upon payment of statutory renewal fees.</p>`,
  benefits: [
    "Clear class and filing direction",
    "Application preparation and document review",
    "Practical updates through the next steps",
  ],
  steps: [
    {
      title: "Share your mark",
      description: "Tell us the brand name and what you plan to offer.",
    },
    {
      title: "Review the class",
      description: "We help you choose a sensible class direction.",
    },
    {
      title: "Prepare the filing",
      description: "Move forward with a clear application checklist.",
    },
  ],
  facts: [
    { label: "Delivery", value: "2 to 3 days" },
    { label: "Support level", value: "Guided throughout" },
    { label: "Why us", value: "Clear class and filing support" },
  ],
  pricing: [
    {
      name: "BASIC SEARCH",
      price: "BDT 1,500",
      description: "Start with a clearer class direction.",
      features: ["Search report", "Class guidance", "Next step notes"],
      action: "Choose basic",
    },
    {
      name: "STANDARD REGISTRATION",
      price: "BDT 5,000",
      description: "A complete guided filing flow.",
      features: [
        "Search and class guidance",
        "Application preparation",
        "Status updates",
        "Handover support",
      ],
      action: "Get started",
      featured: true,
    },
    {
      name: "CUSTOM SUPPORT",
      price: "Let's talk",
      description: "For multiple classes or special scope.",
      features: [
        "Custom requirements",
        "Flexible service mix",
        "Priority consultation",
      ],
      action: "Request a quote",
    },
  ],
  faqs: [
    {
      question: "What does this service include?",
      answer:
        "We help you identify a relevant class, prepare the basic filing information and guide you through the next steps for trademark registration.",
    },
    {
      question: "What documents do I need?",
      answer:
        "The exact list depends on the applicant and mark. We will confirm the required identity, business and brand documents before preparation begins.",
    },
    {
      question: "How long does it take?",
      answer:
        "Our preparation usually starts within two to three working days after receiving the required information. Government processing timelines are separate.",
    },
    {
      question: "How do I get started?",
      answer:
        "Choose a package or talk to an advisor. Share your mark and a short description of your goods or services, and we will recommend the next step.",
    },
  ],
};

export const servicePages: ServicePageContent[] = [
  trademarkRegistrationService,
];

export function getServicePage(slug: string) {
  return servicePages.find((service) => service.slug === slug);
}
