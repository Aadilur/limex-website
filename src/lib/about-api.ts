import { ApiError, request } from "./menu-api";

export type AboutTeamMember = {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
};

export type AboutTeamMemberInput = {
  name: string;
  title: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
};

export type AboutReel = {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title: string | null;
  youtubeTitle: string;
  thumbnailUrl: string;
  embedUrl: string;
  sortOrder: number;
  isVisible: boolean;
};

export type AboutReelInput = {
  youtubeUrl: string;
  title?: string | null;
  sortOrder: number;
  isVisible: boolean;
};

export { ApiError };

export function isUnauthorizedAboutError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

function toFormData(input: AboutTeamMemberInput, image?: File | null, removeImage = false) {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("sortOrder", String(input.sortOrder));
  formData.append("isVisible", String(input.isVisible));
  if (removeImage) formData.append("removeImage", "true");
  if (image) formData.append("image", image);
  return formData;
}

export function getPublicAboutTeam(): Promise<AboutTeamMember[]> {
  return request<AboutTeamMember[]>("/api/about/team", { cache: "no-store" });
}

export function getAdminAboutTeam(): Promise<AboutTeamMember[]> {
  return request<AboutTeamMember[]>("/api/admin/about/team", { cache: "no-store" });
}

export function createAboutTeamMember(input: AboutTeamMemberInput, image?: File | null) {
  return request<AboutTeamMember[]>("/api/admin/about/team", {
    method: "POST",
    body: toFormData(input, image),
  });
}

export function updateAboutTeamMember(id: string, input: AboutTeamMemberInput, image?: File | null, removeImage = false) {
  return request<AboutTeamMember[]>(`/api/admin/about/team/${id}`, {
    method: "PUT",
    body: toFormData(input, image, removeImage),
  });
}

export function deleteAboutTeamMember(id: string) {
  return request<AboutTeamMember[]>(`/api/admin/about/team/${id}`, { method: "DELETE" });
}

export function getPublicAboutReels(): Promise<AboutReel[]> {
  return request<AboutReel[]>("/api/about/reels", { cache: "no-store" });
}

export function getAdminAboutReels(): Promise<AboutReel[]> {
  return request<AboutReel[]>("/api/admin/about/reels", { cache: "no-store" });
}

export function createAboutReel(input: AboutReelInput) {
  return request<AboutReel[]>("/api/admin/about/reels", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAboutReel(id: string, input: AboutReelInput) {
  return request<AboutReel[]>(`/api/admin/about/reels/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function reorderAboutReels(ids: string[]) {
  return request<AboutReel[]>("/api/admin/about/reels/order", {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });
}

export function deleteAboutReel(id: string) {
  return request<AboutReel[]>(`/api/admin/about/reels/${id}`, { method: "DELETE" });
}
