import type { BlogTone } from "../components/limex/blog-data";
import type { ServiceFilter, ServiceIconName } from "../components/limex/data";

export const landingSectionKeys = [
  "hero",
  "clients",
  "metrics",
  "services",
  "process",
  "testimonials",
  "packages",
  "tools",
  "articles",
  "faq",
  "contact",
  "footer",
] as const;

export type LandingSectionKey = (typeof landingSectionKeys)[number];
export type LandingServiceFilter = Exclude<ServiceFilter, "All services">;

export type LandingServiceItem = {
  id: string;
  isVisible: boolean;
  serviceKey: string;
  title: string;
  description: string;
  href: string;
  icon: ServiceIconName;
  filter: LandingServiceFilter;
};

export type HeroContent = {
  eyebrow: string;
  mobileEyebrow: string;
  titlePrimary: string;
  titleSecondary: string;
  animatedWords?: string[];
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  featuredServices: LandingServiceItem[];
};

export type ClientLogo = {
  id: string;
  isVisible: boolean;
  name: string;
  logoUrl: string;
  textColor: string;
};

export type ClientsContent = {
  title: string;
  logos: ClientLogo[];
};

export type MetricItem = {
  id: string;
  isVisible: boolean;
  value: string;
  label: string;
};

export type MetricsContent = {
  title: string;
  items: MetricItem[];
};

export type ServicesContent = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  items: LandingServiceItem[];
};

export type ProcessStep = {
  id: string;
  isVisible: boolean;
  number: string;
  title: string;
  description: string;
};

export type ProcessContent = {
  title: string;
  description: string;
  helperEyebrow: string;
  helperTitle: string;
  helperDescription: string;
  helperCtaLabel: string;
  helperCtaHref: string;
  items: ProcessStep[];
};

export type TestimonialItem = {
  id: string;
  isVisible: boolean;
  imageUrl: string;
  title: string;
  subtitle: string;
  youtubeUrl: string;
};

export type TestimonialsContent = {
  title: string;
  description: string;
  items: TestimonialItem[];
};

export type PackageItem = {
  id: string;
  isVisible: boolean;
  tag: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  color: string;
  surface: string;
  href: string;
  action: string;
  isFeatured: boolean;
};

export type PackagesContent = {
  title: string;
  description: string;
  customPlanLabel: string;
  customPlanCtaLabel: string;
  customPlanCtaHref: string;
  items: PackageItem[];
};

export type ToolRow = {
  id: string;
  label: string;
  value: string;
};

export type ToolItem = {
  id: string;
  isVisible: boolean;
  mark: string;
  tag: string;
  title: string;
  description: string;
  rows: ToolRow[];
  action: string;
  href: string;
  color: string;
  surface: string;
};

export type ToolsContent = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  items: ToolItem[];
};

export type ArticleItem = {
  id: string;
  isVisible: boolean;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  title: string;
  subtitle: string;
  coverTone: BlogTone;
  coverNumber: string;
  media: "image" | "video";
  coverUrl?: string;
  href: string;
};

export type ArticlesContent = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  items: ArticleItem[];
};

export type FaqItem = {
  id: string;
  isVisible: boolean;
  question: string;
  answer: string;
};

export type FaqContent = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  items: FaqItem[];
};

export type ContactContent = {
  title: string;
  description: string;
  startEyebrow: string;
  startDescription: string;
  directLineLabel: string;
  directCtaLabel: string;
  whatsapp: string;
  email: string;
  formEyebrow: string;
  formTitle: string;
  formDescription: string;
  serviceHelper: string;
  contactMethodHelper: string;
  scheduleHelper: string;
  privacyNote: string;
  submitLabel: string;
  submittedNote: string;
};

export type FooterLink = {
  id: string;
  isVisible: boolean;
  label: string;
  href: string;
};

export type FooterColumn = {
  id: string;
  isVisible: boolean;
  title: string;
  links: FooterLink[];
};

export type FooterContent = {
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
  title: string;
  columns: FooterColumn[];
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  copyright: string;
  legalLinks: FooterLink[];
};

export type LandingContent = {
  hero: HeroContent;
  clients: ClientsContent;
  metrics: MetricsContent;
  services: ServicesContent;
  process: ProcessContent;
  testimonials: TestimonialsContent;
  packages: PackagesContent;
  tools: ToolsContent;
  articles: ArticlesContent;
  faq: FaqContent;
  contact: ContactContent;
  footer: FooterContent;
};
