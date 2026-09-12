import { ApiError, request } from "./menu-api";
import type { AdminContactSettings, ContactSettingsInput, PublicContactSettings } from "./contact-types";

export type { AdminContactSettings, ContactSettingsInput, PublicContactSettings } from "./contact-types";

export function getPublicContactSettings(): Promise<PublicContactSettings> {
  return request<PublicContactSettings>("/api/contact-settings", { cache: "no-store" });
}

export function getAdminContactSettings(): Promise<AdminContactSettings | null> {
  return request<AdminContactSettings | null>("/api/admin/contact-settings", { cache: "no-store" });
}

export function updateAdminContactSettings(input: ContactSettingsInput, expectedRevision: number): Promise<AdminContactSettings> {
  return request<AdminContactSettings>("/api/admin/contact-settings", {
    method: "PUT",
    body: JSON.stringify({ settings: input, expectedRevision }),
  });
}

export function isContactConflictError(error: unknown) {
  return error instanceof ApiError && error.status === 409;
}

export function isUnauthorizedContactError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
