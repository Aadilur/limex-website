export const serviceDestinationTypes = ["DETAIL", "BLOG", "TOOL", "INTERNAL", "EXTERNAL", "CONTACT"] as const;
export type ServiceDestinationType = (typeof serviceDestinationTypes)[number];
export type ServiceLocale = "en" | "bn";
export type ServiceMenuTargetType = "ITEM" | "LINK";

export const serviceStatuses = ["LINK_ONLY", "DRAFT", "PUBLISHED"] as const;
export type ServiceStatus = (typeof serviceStatuses)[number];

export type ServiceFact = {
  label: string;
  value: string;
};

export type ServicePriceTier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  action: string;
  whatsappLabel?: string;
  featured?: boolean;
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceStep = {
  title: string;
  description: string;
};

export type ServiceDetailContent = {
  ctaLabel: string;
  startingPrice: string;
  deliveryTime: string;
  serviceMode: string;
  mediaTitle: string;
  mediaDescription: string;
  mediaUrl: string;
  mediaAlt: string;
  overviewEyebrow: string;
  overviewTitle: string;
  overviewDescription: string;
  overviewDescriptionHtml?: string;
  contentLabel: string;
  contentTitle: string;
  contentDescription: string;
  contentDescriptionHtml?: string;
  contentLinkLabel: string;
  contentLinkHref: string;
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
  benefits: string[];
  steps: ServiceStep[];
  facts: ServiceFact[];
  pricing: ServicePriceTier[];
  faqs: ServiceFaq[];
  /** Ordered slugs from the managed business-tools catalogue. */
  tools?: string[];
};

export type ServiceDestination = {
  type: ServiceDestinationType;
  href: string;
  label: string;
  isExternal: boolean;
};

export type ServiceChildLink = {
  id: string;
  label: string;
  href: string;
  isVisible: boolean;
  sortOrder: number;
};

export type PublicService = {
  id: string;
  serviceKey: string;
  menuItemId: string | null;
  menuLinkId: string | null;
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryKey: string;
  groupLabel: string;
  icon: string;
  color: string;
  surface: string;
  href: string;
  destination: ServiceDestination;
  children: ServiceChildLink[];
  status: ServiceStatus;
  hasDetailPage: boolean;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: string | null;
};

export type PublicServiceDetail = PublicService & {
  detail: ServiceDetailContent;
};

export type ServiceCategory = {
  key: string;
  label: string;
  count: number;
};

export type PublicServiceCatalog = {
  categories: ServiceCategory[];
  items: PublicService[];
};

export type AdminService = PublicService & {
  profileId: string | null;
  assignedMenu: AdminServiceMenuAssignment | null;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  revision: number;
  publishedRevision: number | null;
  publishedAt: string | null;
  createdAt: string | null;
  mediaAssetId: string | null;
  publishedMediaAssetId: string | null;
  detail: ServiceDetailContent | null;
};

export type AdminServiceMenuAssignment = {
  id: string;
  targetType: ServiceMenuTargetType;
  label: string;
  sectionLabel: string;
  groupLabel: string;
  parentLabel: string | null;
  href: string;
  isVisible: boolean;
};

export type AdminServiceMenuOption = AdminServiceMenuAssignment & {
  pathLabel: string;
  icon: string;
  sortOrder: number;
  assignedProfileId: string | null;
  assignedProfileTitle: string | null;
};

export type ServiceProfileInput = {
  serviceKey?: string;
  slug: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  mediaAssetId?: string | null;
  detail: ServiceDetailContent | null;
};
