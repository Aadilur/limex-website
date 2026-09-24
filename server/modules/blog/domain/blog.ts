export const blogLocales = ["en", "bn"] as const;
export type BlogLocale = (typeof blogLocales)[number];
export const blogStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type BlogStatus = (typeof blogStatuses)[number];

export type BlogTranslationInput = {
  locale: BlogLocale;
  title: string;
  subtitle: string;
  intro: string;
  atAGlance?: string | null;
  bodyHtml: string;
  bodyJson?: unknown;
  keywords: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverAlt?: string | null;
  coverCaption?: string | null;
};

export type BlogServiceLinkInput = {
  serviceKey: string;
  label: string;
  href: string;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type BlogPostReel = {
  youtubeUrl: string;
  videoId: string;
  title: string;
  sortOrder: number;
};

export type BlogPostInput = {
  slug: string;
  category: string;
  author: string;
  readTimeMinutes: number;
  coverTone: string;
  coverNote?: string | null;
  coverNumber?: string | null;
  coverMediaId?: string | null;
  sidebarVideoUrl?: string | null;
  sidebarVideoId?: string | null;
  sidebarVideoTitle?: string | null;
  reels: BlogPostReel[];
  isFeatured: boolean;
  noIndex: boolean;
  canonicalUrl?: string | null;
  translations: BlogTranslationInput[];
  services: BlogServiceLinkInput[];
};

export type BlogPostSummary = {
  id: string;
  slug: string;
  category: string;
  author: string;
  readTimeMinutes: number;
  status: BlogStatus;
  isFeatured: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  revision: number;
  title: string;
  subtitle: string;
};

export interface BlogRepository {
  listPublic(input: { locale: BlogLocale; query?: string; category?: string; page: number; pageSize: number }): Promise<{ items: Array<{ row: any; locale: BlogLocale }>; total: number }>;
  findPublicBySlug(slug: string, locale: BlogLocale): Promise<{ row: any; locale: BlogLocale; redirectTo: string | null } | null>;
  listAdmin(input: { query?: string; status?: BlogStatus; page: number; pageSize: number }): Promise<{ items: BlogPostSummary[]; total: number }>;
  findAdminById(id: string): Promise<unknown | null>;
  createDraft(input: BlogPostInput, createdBy: string): Promise<unknown>;
  updateDraft(id: string, input: BlogPostInput, expectedRevision: number, updatedBy: string): Promise<unknown>;
  publish(id: string, expectedRevision: number, updatedBy: string): Promise<unknown>;
  unpublish(id: string, expectedRevision: number, updatedBy: string): Promise<unknown>;
  delete(id: string, expectedRevision: number): Promise<void>;
  reorder(ids: string[]): Promise<BlogPostSummary[]>;
  createRedirect(fromSlug: string, toSlug: string, postId: string): Promise<void>;
}

export class BlogConflictError extends Error {
  public readonly statusCode = 409;

  public constructor(message = "This article changed in another session. Reload before saving.") {
    super(message);
    this.name = "BlogConflictError";
  }
}

export class BlogSafetyError extends Error {
  public readonly statusCode = 422;

  public constructor(message = "The update is incomplete and was not saved. Reload the article and try again.") {
    super(message);
    this.name = "BlogSafetyError";
  }
}

export class BlogNotFoundError extends Error {
  public readonly statusCode = 404;

  public constructor(message = "Article not found.") {
    super(message);
    this.name = "BlogNotFoundError";
  }
}

export class BlogInputError extends Error {
  public readonly statusCode = 400;

  public constructor(message: string) {
    super(message);
    this.name = "BlogInputError";
  }
}
