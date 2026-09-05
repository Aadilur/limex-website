import { request } from "./menu-api";
import type {
  AdminDocumentTemplate,
  DocumentTemplateDraft,
  DocumentTemplateSummary,
  PublicDocumentTemplate,
} from "./document-templates";

export type { AdminDocumentTemplate, DocumentTemplateDraft, DocumentTemplateSummary, PublicDocumentTemplate } from "./document-templates";

export function getPublishedTemplates(): Promise<DocumentTemplateSummary[]> {
  return request<DocumentTemplateSummary[]>("/api/tools/templates", { cache: "no-store" });
}

export function getPublishedTemplate(slug: string): Promise<PublicDocumentTemplate> {
  return request<PublicDocumentTemplate>(`/api/tools/templates/${encodeURIComponent(slug)}`, { cache: "no-store" });
}

export function getAdminTemplates(): Promise<AdminDocumentTemplate[]> {
  return request<AdminDocumentTemplate[]>("/api/admin/tools/templates", { cache: "no-store" });
}

export function getAdminTemplatePreview(slug: string): Promise<AdminDocumentTemplate> {
  return request<AdminDocumentTemplate>(`/api/admin/tools/templates/preview/${encodeURIComponent(slug)}`, { cache: "no-store" });
}

export function checkTemplateSlug(slug: string, excludeId?: string): Promise<{ slug: string; available: boolean }> {
  const query = new URLSearchParams({ slug });
  if (excludeId) query.set("excludeId", excludeId);
  return request<{ slug: string; available: boolean }>(`/api/admin/tools/templates/slug-availability?${query.toString()}`, { cache: "no-store" });
}

export function createAdminTemplate(template: DocumentTemplateDraft): Promise<AdminDocumentTemplate> {
  return request<AdminDocumentTemplate>("/api/admin/tools/templates", {
    method: "POST",
    body: JSON.stringify(template),
  });
}

export function updateAdminTemplate(id: string, template: DocumentTemplateDraft, expectedRevision: number): Promise<AdminDocumentTemplate> {
  return request<AdminDocumentTemplate>(`/api/admin/tools/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify({ template, expectedRevision }),
  });
}

export function publishAdminTemplate(id: string, expectedRevision: number): Promise<AdminDocumentTemplate> {
  return request<AdminDocumentTemplate>(`/api/admin/tools/templates/${id}/publish`, {
    method: "POST",
    body: JSON.stringify({ expectedRevision }),
  });
}

export function unpublishAdminTemplate(id: string, expectedRevision: number): Promise<AdminDocumentTemplate> {
  return request<AdminDocumentTemplate>(`/api/admin/tools/templates/${id}/unpublish`, {
    method: "POST",
    body: JSON.stringify({ expectedRevision }),
  });
}
