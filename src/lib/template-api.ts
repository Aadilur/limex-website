import { ApiError, request } from "./menu-api";
import type {
  AdminDocumentTemplate,
  DocumentTemplateDraft,
  DocumentTemplateSummary,
  PublicDocumentTemplate,
} from "./document-templates";

export type { AdminDocumentTemplate, DocumentTemplateDraft, DocumentTemplateSummary, PublicDocumentTemplate } from "./document-templates";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function assertAdminTemplate(value: unknown): AdminDocumentTemplate {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.slug !== "string" || typeof value.title !== "string" || typeof value.revision !== "number" || !Array.isArray(value.fields) || !Array.isArray(value.pages) || !isRecord(value.settings)) {
    throw new ApiError(502, "The template response was incomplete. Nothing was changed.");
  }
  return value as unknown as AdminDocumentTemplate;
}

function assertAdminTemplateSummary(value: unknown): DocumentTemplateSummary {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.slug !== "string" || typeof value.title !== "string" || typeof value.description !== "string" || typeof value.paperSize !== "string" || (value.status !== "DRAFT" && value.status !== "PUBLISHED") || typeof value.revision !== "number" || (value.publishedRevision !== null && typeof value.publishedRevision !== "number") || (value.publishedAt !== null && typeof value.publishedAt !== "string") || typeof value.updatedAt !== "string") {
    throw new ApiError(502, "The template list was incomplete. Nothing was changed.");
  }
  return value as unknown as DocumentTemplateSummary;
}

function assertAdminTemplateList(value: unknown): DocumentTemplateSummary[] {
  if (!Array.isArray(value)) throw new ApiError(502, "The template list was incomplete. Nothing was changed.");
  return value.map(assertAdminTemplateSummary);
}

export function getPublishedTemplates(): Promise<DocumentTemplateSummary[]> {
  return request<DocumentTemplateSummary[]>("/api/tools/templates", { cache: "no-store" });
}

export function getPublishedTemplate(slug: string): Promise<PublicDocumentTemplate> {
  return request<PublicDocumentTemplate>(`/api/tools/templates/${encodeURIComponent(slug)}`, { cache: "no-store" });
}

export function getAdminTemplates(): Promise<DocumentTemplateSummary[]> {
  return request<unknown>("/api/admin/tools/templates", { cache: "no-store" }).then(assertAdminTemplateList);
}

export function reorderAdminTemplates(ids: string[]): Promise<DocumentTemplateSummary[]> {
  return request<unknown>("/api/admin/tools/templates/order", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  }).then(assertAdminTemplateList);
}

export function getAdminTemplate(id: string): Promise<AdminDocumentTemplate> {
  return request<unknown>(`/api/admin/tools/templates/${encodeURIComponent(id)}`, { cache: "no-store" }).then(assertAdminTemplate);
}

export function getAdminTemplatePreview(slug: string): Promise<AdminDocumentTemplate> {
  return request<unknown>(`/api/admin/tools/templates/preview/${encodeURIComponent(slug)}`, { cache: "no-store" }).then(assertAdminTemplate);
}

export function checkTemplateSlug(slug: string, excludeId?: string): Promise<{ slug: string; available: boolean }> {
  const query = new URLSearchParams({ slug });
  if (excludeId) query.set("excludeId", excludeId);
  return request<{ slug: string; available: boolean }>(`/api/admin/tools/templates/slug-availability?${query.toString()}`, { cache: "no-store" });
}

export function createAdminTemplate(template: DocumentTemplateDraft): Promise<AdminDocumentTemplate> {
  return request<unknown>("/api/admin/tools/templates", {
    method: "POST",
    body: JSON.stringify(template),
  }).then(assertAdminTemplate);
}

export function updateAdminTemplate(id: string, template: DocumentTemplateDraft, expectedRevision: number): Promise<AdminDocumentTemplate> {
  return request<unknown>(`/api/admin/tools/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify({ template, expectedRevision }),
  }).then(assertAdminTemplate);
}

export function publishAdminTemplate(id: string, expectedRevision: number): Promise<AdminDocumentTemplate> {
  return request<unknown>(`/api/admin/tools/templates/${id}/publish`, {
    method: "POST",
    body: JSON.stringify({ expectedRevision }),
  }).then(assertAdminTemplate);
}

export function unpublishAdminTemplate(id: string, expectedRevision: number): Promise<AdminDocumentTemplate> {
  return request<unknown>(`/api/admin/tools/templates/${id}/unpublish`, {
    method: "POST",
    body: JSON.stringify({ expectedRevision }),
  }).then(assertAdminTemplate);
}
