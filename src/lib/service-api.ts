import { ApiError, request } from "./menu-api";
import { generatedServiceToPublic, getGeneratedService, mergeGeneratedServiceCatalog } from "./service-content";
import type {
  AdminService,
  PublicService,
  PublicServiceCatalog,
  PublicServiceDetail,
  ServiceProfileInput,
} from "./service-types";

export type {
  AdminService,
  PublicService,
  PublicServiceCatalog,
  PublicServiceDetail,
  ServiceDetailContent,
  ServiceDestination,
  ServiceDestinationType,
  ServiceFaq,
  ServiceFact,
  ServicePriceTier,
  ServiceProfileInput,
  ServiceStatus,
  ServiceStep,
} from "./service-types";

export function getPublicServices(): Promise<PublicServiceCatalog> {
  return request<PublicServiceCatalog>("/api/services", { cache: "no-store" }).then((catalog) => mergeGeneratedServiceCatalog(catalog));
}

export function getPublicService(slug: string, locale: "en" | "bn" = "en"): Promise<PublicServiceDetail | null> {
  const generated = getGeneratedService(slug);

  return request<PublicServiceDetail | null>(`/api/services/${encodeURIComponent(slug)}?locale=${locale}`, { cache: "no-store" })
    .then((service) => {
      return service;
    })
    .catch((error) => {
      if (!generated) throw error;
      return {
        ...generatedServiceToPublic(generated, locale),
        detail: locale === "bn" ? generated.detailBn : generated.detailEn,
      };
    });
}

export function getAdminServices(): Promise<AdminService[]> {
  return request<AdminService[]>("/api/admin/services", { cache: "no-store" });
}

export function getAdminService(menuItemId: string): Promise<AdminService> {
  return request<AdminService>(`/api/admin/services/${encodeURIComponent(menuItemId)}`, { cache: "no-store" });
}

export function updateAdminService(menuItemId: string, profile: ServiceProfileInput, expectedRevision: number | null): Promise<AdminService> {
  return request<AdminService>(`/api/admin/services/${encodeURIComponent(menuItemId)}`, {
    method: "PUT",
    body: JSON.stringify({ profile, expectedRevision }),
  });
}

export function publishAdminService(profileId: string, expectedRevision: number): Promise<AdminService> {
  return request<AdminService>(`/api/admin/services/profile/${encodeURIComponent(profileId)}/publish`, {
    method: "POST",
    body: JSON.stringify({ expectedRevision }),
  });
}

export function unpublishAdminService(profileId: string, expectedRevision: number): Promise<AdminService> {
  return request<AdminService>(`/api/admin/services/profile/${encodeURIComponent(profileId)}/unpublish`, {
    method: "POST",
    body: JSON.stringify({ expectedRevision }),
  });
}

export function isUnauthorizedServiceError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function isServiceConflictError(error: unknown) {
  return error instanceof ApiError && error.status === 409;
}
