import { defaultLandingContent } from "./landing-defaults";
import { ApiError, request } from "./menu-api";
import { businessTools, toolHref } from "./business-tools";
import type { LandingContent, LandingSectionKey } from "./landing-types";

export type { LandingContent, LandingSectionKey } from "./landing-types";
export { defaultLandingContent, landingTestVideoUrl } from "./landing-defaults";
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
  return request<LandingAdminSnapshot>("/api/admin/landing", {
    cache: "no-store",
  });
}

export function updateLandingSection(
  section: LandingSectionKey,
  content: LandingContent[LandingSectionKey],
  expectedUpdatedAt: string,
): Promise<LandingAdminSnapshot> {
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

export function withLandingFallback(
  content: Partial<LandingContent> | null | undefined,
): LandingContent {
  const legacyAboutReelsVisibility = (
    content?.testimonials as
      | (LandingContent["testimonials"] & { showAboutReels?: boolean })
      | undefined
  )?.showAboutReels;
  const sourceArticles = content?.articles?.items ?? [];
  const savedArticles = sourceArticles.map((saved) => {
    const fallback = defaultLandingContent.articles.items.find(
      (item) => item.id === saved.id || item.slug === saved.slug,
    );
    if (!fallback || Object.prototype.hasOwnProperty.call(saved, "coverUrl"))
      return saved;
    return { ...fallback, ...saved, coverUrl: fallback.coverUrl };
  });
  const sourceTools = content?.tools?.items ?? [];
  const calculatorTools = businessTools.filter(
    (tool) => tool.group === "calculator",
  );
  const seen = new Set<string>();
  const savedTools = sourceTools.flatMap((saved) => {
    const tool = calculatorTools.find(
      (candidate) =>
        saved.id === `tool-${candidate.slug}` ||
        saved.href === toolHref(candidate.slug),
    );
    if (!tool || seen.has(tool.slug)) return [];
    seen.add(tool.slug);
    const fallback = defaultLandingContent.tools.items.find(
      (item) => item.id === `tool-${tool.slug}`,
    )!;
    return [
      {
        ...fallback,
        ...saved,
        id: `tool-${tool.slug}`,
        href: saved.href.startsWith("/business-tools/")
          ? saved.href
          : toolHref(tool.slug),
        tag: tool.group,
      },
    ];
  });
  const toolItems = [
    ...savedTools,
    ...calculatorTools
      .filter((tool) => !seen.has(tool.slug))
      .map(
        (tool) =>
          defaultLandingContent.tools.items.find(
            (item) => item.id === `tool-${tool.slug}`,
          )!,
      ),
  ];
  return {
    ...defaultLandingContent,
    ...content,
    hero: { ...defaultLandingContent.hero, ...(content?.hero ?? {}) },
    clients: { ...defaultLandingContent.clients, ...(content?.clients ?? {}) },
    metrics: { ...defaultLandingContent.metrics, ...(content?.metrics ?? {}) },
    services: {
      ...defaultLandingContent.services,
      ...(content?.services ?? {}),
    },
    process: { ...defaultLandingContent.process, ...(content?.process ?? {}) },
    testimonials: {
      ...defaultLandingContent.testimonials,
      ...(content?.testimonials ?? {}),
    },
    aboutReels: {
      ...defaultLandingContent.aboutReels,
      ...(content?.aboutReels ?? {}),
      isVisible:
        content?.aboutReels?.isVisible ??
        legacyAboutReelsVisibility ??
        defaultLandingContent.aboutReels.isVisible,
    },
    packages: {
      ...defaultLandingContent.packages,
      ...(content?.packages ?? {}),
    },
    tools: {
      ...defaultLandingContent.tools,
      ...(content?.tools ?? {}),
      items: toolItems,
    },
    articles: {
      ...defaultLandingContent.articles,
      ...(content?.articles ?? {}),
      ...(savedArticles.length ? { items: savedArticles } : {}),
    },
    faq: { ...defaultLandingContent.faq, ...(content?.faq ?? {}) },
    contact: { ...defaultLandingContent.contact, ...(content?.contact ?? {}) },
    footer: {
      ...defaultLandingContent.footer,
      ...(content?.footer ?? {}),
      legalLinks: (
        content?.footer?.legalLinks ?? defaultLandingContent.footer.legalLinks
      ).map((link) => {
        if (
          link.id === "privacy" &&
          (link.href === "/#top" || link.href === "#top" || !link.href)
        ) {
          return { ...link, href: "/privacy" };
        }
        if (
          link.id === "terms" &&
          (link.href === "/#top" || link.href === "#top" || !link.href)
        ) {
          return { ...link, href: "/terms" };
        }
        return link;
      }),
    },
  };
}
