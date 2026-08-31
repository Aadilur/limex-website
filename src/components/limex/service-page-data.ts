export type ServicePriceTier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  action: string;
  featured?: boolean;
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServicePageContent = {
  slug: string;
  breadcrumb: string;
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
  facts: Array<{ label: string; value: string }>;
  pricing: ServicePriceTier[];
  faqs: ServiceFaq[];
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
  overviewEyebrow: "OVERVIEW / GUIDED FILING",
  overviewTitle: "What this service includes",
  overviewDescription: "A guided path from searching your mark to preparing a clean filing.",
  contentLabel: "THE LIMEX APPROACH",
  contentTitle: "Make the filing decision with more clarity.",
  contentDescription: "We help you understand the relevant class, prepare the core information and move through the registration process with practical next steps at every stage.",
  contentLinkLabel: "View full requirements",
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
