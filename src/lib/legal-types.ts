export type LegalSlug = "terms" | "privacy";

export type LegalPageData = {
  id: string;
  slug: LegalSlug;
  title: string;
  contentHtml: string;
  contentJson?: unknown | null;
  createdAt: string;
  updatedAt: string;
};

export type LegalPageInput = {
  title: string;
  contentHtml: string;
  contentJson?: unknown | null;
};
