import { homeArticles } from "../components/limex/blog-data";
import {
  createServicesFromNavigation,
  faqs,
  footerColumns,
  navigation,
  packages,
  processSteps,
  reels,
  services,
  tools,
  type Service,
} from "../components/limex/data";
import type { LandingContent, LandingServiceFilter, LandingServiceItem } from "./landing-types";

function serviceFilter(service: Service): LandingServiceFilter {
  return service.filters.find((item): item is LandingServiceFilter => item !== "All services") ?? "Startup";
}

function landingService(service: Service, title = service.title): LandingServiceItem {
  return {
    id: `landing-${service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    isVisible: true,
    serviceKey: service.title,
    title,
    description: service.description,
    href: service.href,
    icon: service.icon,
    filter: serviceFilter(service),
  };
}

const availableServices = createServicesFromNavigation(navigation);
const serviceByTitle = new Map(availableServices.map((service) => [service.title, service]));

function requiredService(title: string, displayTitle = title) {
  const service = serviceByTitle.get(title);
  return service ? landingService(service, displayTitle) : null;
}

const heroServices = [
  requiredService("Company Formation", "Company registration"),
  requiredService("Trade License", "Trade license"),
  requiredService("Income Tax", "Income tax filing"),
  requiredService("VAT / BIN Registration", "VAT / BIN registration"),
  requiredService("Trademark", "Trademark protection"),
].filter((item): item is LandingServiceItem => Boolean(item));

const featuredServiceTitles = [
  "Company Formation",
  "Income Tax",
  "Trademark",
  "Fee Calculator",
  "Trade License",
  "VAT",
  "Copyright Registration",
  "Business Agreement Builder",
];

const featuredServices = featuredServiceTitles
  .map((title) => requiredService(title))
  .filter((item): item is LandingServiceItem => Boolean(item));

const footerLinkHref: Record<string, string> = {
  "Startup & license": "/#packages",
  "VAT & tax": "/#packages",
  Trademark: "/services/trademark-registration",
  Compliance: "/#services",
  "About us": "/about",
  Blog: "/blog",
  Contact: "/#contact",
  "VAT calculator": "/business-tools#vat-calculator",
  "Income tax estimator": "/business-tools#tax-calculator",
  "Deed builder": "/business-tools",
};

export const defaultLandingContent: LandingContent = {
  hero: {
    eyebrow: "BUSINESS REGISTRATION  ·  TRADEMARK  ·  LICENSE  ·  VAT  ·  STARTUP  ·  TAX",
    mobileEyebrow: "ONE PLACE FOR THE IMPORTANT WORK",
    titlePrimary: "Fastest Processing",
    titleSecondary: "Guaranteed",
    description: "Company registration, VAT, tax, trademark and compliance support for ambitious businesses.",
    primaryCtaLabel: "Explore services",
    primaryCtaHref: "#services",
    secondaryCtaLabel: "Talk to an expert",
    secondaryCtaHref: "#contact",
    featuredServices: heroServices,
  },
  clients: {
    title: "OUR CLIENTS",
    logos: [
      { id: "northstar", isVisible: true, name: "Northstar", logoUrl: "/figma/client-northstar-a.svg", textColor: "#121f2e" },
      { id: "sage", isVisible: true, name: "Sage & Co.", logoUrl: "/figma/client-sage-a.svg", textColor: "#2b5e8c" },
      { id: "aster", isVisible: true, name: "Aster Labs", logoUrl: "/figma/client-aster.svg", textColor: "#a64a5c" },
      { id: "biznest", isVisible: true, name: "BIZNEST", logoUrl: "", textColor: "#c79938" },
      { id: "civic", isVisible: true, name: "Civic", logoUrl: "/figma/client-civic-a.svg", textColor: "#4a7563" },
      { id: "morrow", isVisible: true, name: "Morrow", logoUrl: "", textColor: "#5e578c" },
    ],
  },
  metrics: {
    title: "The Limex standard",
    items: [
      { id: "brands", isVisible: true, value: "1,200+", label: "brands assisted" },
      { id: "satisfaction", isVisible: true, value: "4.9/5", label: "client satisfaction" },
      { id: "experience", isVisible: true, value: "7+ years", label: "practical guidance" },
      { id: "response", isVisible: true, value: "24 hrs", label: "typical response" },
    ],
  },
  services: {
    title: "Start, protect and grow with clarity.",
    description: "A focused set of services for the moments that matter most in your business journey.",
    ctaLabel: "View all services",
    ctaHref: "/services",
    items: featuredServices,
  },
  process: {
    title: "From question to completion.",
    description: "A simple, transparent process that keeps your business moving.",
    helperEyebrow: "NEED HELP CHOOSING?",
    helperTitle: "Talk to an expert.",
    helperDescription: "Tell us what you are trying to solve and we will point you in the right direction.",
    helperCtaLabel: "Start a conversation",
    helperCtaHref: "#contact",
    items: processSteps.map((step) => ({ id: `step-${step.number}`, isVisible: true, ...step })),
  },
  testimonials: {
    title: "Stories from the businesses we support.",
    description: "Video stories that make the work feel human.",
    items: reels.map((reel, index) => ({
      id: `reel-${index + 1}`,
      isVisible: true,
      imageUrl: reel.image,
      title: reel.title,
      subtitle: reel.meta,
      youtubeUrl: "",
    })),
  },
  packages: {
    title: "Choose a clear starting point.",
    description: "Simple packages for common needs. Custom support when needed.",
    customPlanLabel: "Need a tailored plan?",
    customPlanCtaLabel: "Request custom quote",
    customPlanCtaHref: "#contact",
    items: packages.map((item, index) => ({
      id: `package-${index + 1}`,
      isVisible: true,
      tag: item.tag,
      title: item.title,
      description: item.description,
      price: item.price,
      features: item.features,
      color: item.color,
      surface: item.surface,
      href: "#contact",
      action: "View package",
      isFeatured: item.title === "Company setup",
    })),
  },
  tools: {
    title: "Move faster with practical tools.",
    description: "Practical tools for quick business decisions.",
    ctaLabel: "Explore tools",
    ctaHref: "/business-tools",
    items: tools.map((tool, index) => ({
      id: `tool-${index + 1}`,
      isVisible: true,
      mark: tool.mark,
      tag: tool.tag,
      title: tool.title,
      description: tool.description,
      rows: tool.rows.map(([label, value], rowIndex) => ({ id: `tool-${index + 1}-row-${rowIndex + 1}`, label, value })),
      action: tool.action,
      href: tool.href,
      color: tool.color,
      surface: tool.surface,
    })),
  },
  articles: {
    title: "Small insights for big decisions.",
    description: "Clear guidance for the decisions ahead.",
    ctaLabel: "All articles",
    ctaHref: "/blog",
    items: homeArticles.map((article) => ({
      id: `article-${article.slug}`,
      isVisible: true,
      slug: article.slug,
      category: article.category,
      date: article.date,
      readTime: article.readTime,
      title: article.title,
      subtitle: article.summary,
      coverTone: article.coverTone,
      coverNumber: article.coverNumber,
      media: article.media,
      href: `/blog/${article.slug}`,
    })),
  },
  faq: {
    title: "Make the next step clearer.",
    description: "The essentials, in plain language.",
    ctaLabel: "Talk to an advisor",
    ctaHref: "#contact",
    items: faqs.map((faq, index) => ({ id: `faq-${index + 1}`, isVisible: true, ...faq })),
  },
  contact: {
    title: "Bring us the question. Leave with a plan.",
    description: "Tell us what you're building, fixing or protecting.",
    startEyebrow: "START HERE",
    startDescription: "From first question to final filing.",
    directLineLabel: "Prefer a direct line?",
    directCtaLabel: "Chat on WhatsApp",
    whatsapp: "+880 1XXX XXXXXX",
    email: "hello@yourbrand.com",
    formEyebrow: "YOUR DETAILS",
    formTitle: "Start with the essentials.",
    formDescription: "Share a little context and we'll guide you from there.",
    serviceHelper: "Top-level services only. You can choose more than one.",
    contactMethodHelper: "Phone or email is required — one is enough.",
    scheduleHelper: "Choose a date and a convenient time. We'll confirm availability with you.",
    privacyNote: "Your details stay private.",
    submitLabel: "Send message",
    submittedNote: "Thanks — we’ll reply within one business day.",
  },
  footer: {
    tagline: "Business, made clearer.",
    ctaLabel: "Talk to an expert",
    ctaHref: "/#contact",
    title: "Make the next move with confidence.",
    columns: footerColumns.map((column, columnIndex) => ({
      id: `footer-column-${columnIndex + 1}`,
      isVisible: true,
      title: column.title,
      links: column.links.map((label, linkIndex) => ({ id: `footer-link-${columnIndex + 1}-${linkIndex + 1}`, isVisible: true, label, href: footerLinkHref[label] ?? "#top" })),
    })),
    contactTitle: "CONTACT",
    contactEmail: "hello@yourbrand.com",
    contactPhone: "+880 1XXX XXXXXX",
    location: "Dhaka, Bangladesh",
    copyright: "© 2026 Limex",
    legalLinks: [
      { id: "privacy", isVisible: true, label: "Privacy", href: "/#top" },
      { id: "terms", isVisible: true, label: "Terms", href: "/#top" },
    ],
  },
};
