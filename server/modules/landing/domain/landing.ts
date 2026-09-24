export const landingSectionKeys = [
  "hero",
  "clients",
  "metrics",
  "services",
  "process",
  "testimonials",
  "aboutReels",
  "packages",
  "tools",
  "articles",
  "faq",
  "contact",
  "footer",
] as const;

export type LandingSectionKey = (typeof landingSectionKeys)[number];

export type LandingContent = Record<LandingSectionKey, unknown>;

export type LandingPageRecord = {
  id: string;
  content: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export type LandingRepository = {
  find(): Promise<LandingPageRecord | null>;
  upsert(content: unknown): Promise<LandingPageRecord>;
  updateIfUnchanged(expectedUpdatedAt: Date, content: unknown): Promise<LandingPageRecord | null>;
};
