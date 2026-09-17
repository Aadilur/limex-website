import { ApiError, request } from "./menu-api";

export type MediaFolder = {
  id: string;
  parentId: string | null;
  name: string;
  isSystem: boolean;
  assetCount: number;
};

export type MediaUsage = {
  type: "blog" | "service";
  label: string;
  href: string;
} | null;

export type MediaAsset = {
  id: string;
  folderId: string;
  originalName: string;
  displayName: string;
  contentType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string;
  url: string;
  publicUrl: string;
  directUrl?: string | null;
  urlExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  usage: MediaUsage;
};

export type MediaLibrary = {
  currentFolder: MediaFolder | null;
  breadcrumbs: Array<{ id: string; name: string }>;
  folders: MediaFolder[];
  assets: MediaAsset[];
};

export function getAdminMedia(folderId?: string | null) {
  const search = folderId ? "?folderId=" + encodeURIComponent(folderId) : "";
  return request<MediaLibrary>("/api/admin/media" + search, { cache: "no-store" });
}

export function getAdminMediaAsset(id: string) {
  return request<MediaAsset>("/api/admin/media/assets/" + encodeURIComponent(id), { cache: "no-store" });
}

export function createMediaFolder(name: string, parentId?: string | null) {
  return request<MediaFolder>("/api/admin/media/folders", {
    method: "POST",
    body: JSON.stringify({ name, parentId: parentId ?? null }),
  });
}

export function uploadMediaAsset(folderId: string, file: File, metadata?: { width?: number; height?: number; displayName?: string; altText?: string; caption?: string }) {
  const formData = new FormData();
  formData.append("folderId", folderId);
  formData.append("image", file);
  if (metadata?.width) formData.append("width", String(metadata.width));
  if (metadata?.height) formData.append("height", String(metadata.height));
  if (metadata?.displayName) formData.append("displayName", metadata.displayName);
  if (metadata?.altText) formData.append("altText", metadata.altText);
  if (metadata?.caption) formData.append("caption", metadata.caption);
  return request<MediaAsset>("/api/admin/media/assets", { method: "POST", body: formData });
}

export function updateMediaAsset(id: string, input: { displayName?: string; altText?: string | null; caption?: string | null; folderId?: string | null }) {
  return request<MediaAsset>("/api/admin/media/assets/" + id, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteMediaAsset(id: string) {
  return request<{ deleted: boolean }>("/api/admin/media/assets/" + id, { method: "DELETE" });
}

export function isUnauthorizedMediaError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
