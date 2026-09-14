import { request } from "./menu-api";
import { defaultLegalPages } from "./legal-defaults";
import type { LegalPageData, LegalPageInput, LegalSlug } from "./legal-types";

export type { LegalPageData, LegalPageInput, LegalSlug } from "./legal-types";

export async function getPublicLegalPage(slug: LegalSlug): Promise<LegalPageData> {
  try {
    return await request<LegalPageData>(`/api/legal/${slug}`, { cache: "no-store" });
  } catch {
    return defaultLegalPages[slug];
  }
}

export async function getAdminLegalPages(): Promise<LegalPageData[]> {
  try {
    return await request<LegalPageData[]>("/api/admin/legal", { cache: "no-store" });
  } catch {
    return [defaultLegalPages.terms, defaultLegalPages.privacy];
  }
}

export async function getAdminLegalPage(slug: LegalSlug): Promise<LegalPageData> {
  try {
    return await request<LegalPageData>(`/api/admin/legal/${slug}`, { cache: "no-store" });
  } catch {
    return defaultLegalPages[slug];
  }
}

export function updateAdminLegalPage(
  slug: LegalSlug,
  input: LegalPageInput,
): Promise<LegalPageData> {
  return request<LegalPageData>(`/api/admin/legal/${slug}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
