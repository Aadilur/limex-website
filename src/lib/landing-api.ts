import { defaultLandingContent } from "./landing-defaults";
import { ApiError, request } from "./menu-api";
import type { LandingContent, LandingSectionKey } from "./landing-types";

export type { LandingContent, LandingSectionKey } from "./landing-types";
export { defaultLandingContent } from "./landing-defaults";
export { ApiError };

export type LandingAdminSnapshot = {
  content: LandingContent;
  updatedAt: string | null;
};

export type LandingLogoUpload = {
  asset: string;
  url: string;
  bytes: number;
  contentType: string;
};

export function getPublicLanding(): Promise<LandingContent> {
  return request<LandingContent>("/api/landing", { cache: "no-store" });
}

export function getAdminLanding(): Promise<LandingAdminSnapshot> {
  return request<LandingAdminSnapshot>("/api/admin/landing", { cache: "no-store" });
}

export function updateLandingSection(section: LandingSectionKey, content: LandingContent[LandingSectionKey], expectedUpdatedAt: string): Promise<LandingAdminSnapshot> {
  return request<LandingAdminSnapshot>(`/api/admin/landing/${section}`, {
    method: "PUT",
    body: JSON.stringify({ content, expectedUpdatedAt }),
  });
}

export function uploadLandingLogo(file: File): Promise<LandingLogoUpload> {
  const formData = new FormData();
  formData.append("image", file);
  return request<LandingLogoUpload>("/api/admin/landing/logos", {
    method: "POST",
    body: formData,
  });
}

export function isUnauthorizedLandingError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function isLandingConflictError(error: unknown) {
  return error instanceof ApiError && error.status === 409;
}

export function isLandingSafetyError(error: unknown) {
  return error instanceof ApiError && error.status === 422;
}

export function withLandingFallback(content: Partial<LandingContent> | null | undefined): LandingContent {
  return {
    ...defaultLandingContent,
    ...content,
    hero: { ...defaultLandingContent.hero, ...(content?.hero ?? {}) },
    clients: { ...defaultLandingContent.clients, ...(content?.clients ?? {}) },
    metrics: { ...defaultLandingContent.metrics, ...(content?.metrics ?? {}) },
    services: { ...defaultLandingContent.services, ...(content?.services ?? {}) },
    process: { ...defaultLandingContent.process, ...(content?.process ?? {}) },
    testimonials: { ...defaultLandingContent.testimonials, ...(content?.testimonials ?? {}) },
    packages: { ...defaultLandingContent.packages, ...(content?.packages ?? {}) },
    tools: { ...defaultLandingContent.tools, ...(content?.tools ?? {}) },
    articles: { ...defaultLandingContent.articles, ...(content?.articles ?? {}) },
    faq: { ...defaultLandingContent.faq, ...(content?.faq ?? {}) },
    contact: { ...defaultLandingContent.contact, ...(content?.contact ?? {}) },
    footer: { ...defaultLandingContent.footer, ...(content?.footer ?? {}) },
  };
}
