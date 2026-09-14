import { defaultLegalPages } from "./legal-defaults";
import type { LegalPageData, LegalSlug } from "./legal-types";

function backendUrl(path: string) {
  const base =
    process.env.BACKEND_INTERNAL_URL ??
    `http://127.0.0.1:${process.env.BACKEND_PORT ?? "4000"}`;
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function getPublicLegalPageServer(slug: LegalSlug): Promise<LegalPageData> {
  try {
    const response = await fetch(backendUrl(`/api/legal/${slug}`), {
      cache: "no-store",
    });
    if (!response.ok) return defaultLegalPages[slug];
    const payload = (await response.json()) as { data?: LegalPageData };
    return payload.data ?? defaultLegalPages[slug];
  } catch {
    return defaultLegalPages[slug];
  }
}
