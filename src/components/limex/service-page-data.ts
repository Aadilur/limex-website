import type { ServiceDetailContent, ServiceDestination, ServiceFaq, ServiceLocale, ServicePriceTier } from "@/lib/service-types";

export type { ServiceDetailContent, ServiceDestination, ServiceFaq, ServicePriceTier } from "@/lib/service-types";

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
  contentLabel: string;
  contentTitle: string;
  contentDescription: string;
  contentLinkLabel: string;
  contentLinkHref?: string;
  destination?: ServiceDestination;
  relatedLinks?: Array<{ id: string; label: string; href: string; isVisible: boolean; sortOrder: number }>;
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
  description: "Protect your brand with a clear search, filing and follow-through plan.",
  ctaLabel: "Get started",
  startingPrice: "From BDT 5,000",
  deliveryTime: "2 to 3 days",
  serviceMode: "Online or offline",
  mediaTitle: "Trademark registration",
  mediaDescription: "A visual slot for your service story, filing flow or helpful explainer.",
  mediaUrl: "",
  mediaAlt: "",
  overviewEyebrow: "OVERVIEW / GUIDED FILING",
  overviewTitle: "What this service includes",
  overviewDescription: "A guided path from searching your mark to preparing a clean filing.",
  contentLabel: "THE LIMEX APPROACH",
  contentTitle: "Make the filing decision with more clarity.",
  contentDescription: "We help you understand the relevant class, prepare the core information and move through the registration process with practical next steps at every stage.",
  contentLinkLabel: "View full requirements",
  contentLinkHref: "#pricing",
  benefits: [
    "Clear class and filing direction",
    "Application preparation and document review",
    "Practical updates through the next steps",
  ],
  steps: [
    { title: "Share your mark", description: "Tell us the brand name and what you plan to offer." },
    { title: "Review the class", description: "We help you choose a sensible class direction." },
    { title: "Prepare the filing", description: "Move forward with a clear application checklist." },
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
      features: ["Search and class guidance", "Application preparation", "Status updates", "Handover support"],
      action: "Get started",
      featured: true,
    },
    {
      name: "CUSTOM SUPPORT",
      price: "Let's talk",
      description: "For multiple classes or special scope.",
      features: ["Custom requirements", "Flexible service mix", "Priority consultation"],
      action: "Request a quote",
    },
  ],
  faqs: [
    {
      question: "What does this service include?",
      answer: "We help you identify a relevant class, prepare the basic filing information and guide you through the next steps for trademark registration.",
    },
    {
      question: "What documents do I need?",
      answer: "The exact list depends on the applicant and mark. We will confirm the required identity, business and brand documents before preparation begins.",
    },
    {
      question: "How long does it take?",
      answer: "Our preparation usually starts within two to three working days after receiving the required information. Government processing timelines are separate.",
    },
    {
      question: "How do I get started?",
      answer: "Choose a package or talk to an advisor. Share your mark and a short description of your goods or services, and we will recommend the next step.",
    },
  ],
};

export const servicePages: ServicePageContent[] = [trademarkRegistrationService];

export function getServicePage(slug: string) {
  return servicePages.find((service) => service.slug === slug);
}
