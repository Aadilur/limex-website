import type { NavItem } from "@/components/limex/data";

export type AdminMenuLink = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
};

export type AdminMenuItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  marker: string;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  links: AdminMenuLink[];
};

export type AdminMenuGroup = {
  id: string;
  key: string;
  label: string;
  railLabel: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
  items: AdminMenuItem[];
};

export type AdminMenuSection = {
  id: string;
  key: string;
  label: string;
  href: string;
  menuEyebrow: string | null;
  menuTitle: string | null;
  menuDescription: string | null;
  spotlightBadge: string | null;
  spotlightTitle: string | null;
  spotlightDescription: string | null;
  spotlightCtaLabel: string | null;
  spotlightCtaHref: string | null;
  tone: string;
  sortOrder: number;
  isVisible: boolean;
  groups: AdminMenuGroup[];
};

export type AdminSession = {
  username: string;
  expiresAt: number;
};

export type MenuSectionInput = Partial<Omit<AdminMenuSection, "id" | "groups">>;
export type MenuGroupInput = Partial<Omit<AdminMenuGroup, "id" | "items">> & { sectionId?: string };
export type MenuItemInput = Partial<Omit<AdminMenuItem, "id" | "links">> & { groupId?: string };
export type MenuLinkInput = Partial<Omit<AdminMenuLink, "id">> & { itemId?: string };

export class ApiError extends Error {
  public constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isMultipart = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: isMultipart ? init?.headers : { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  const payload = await response.json().catch(() => null) as { data?: T; error?: string } | null;
  if (!response.ok) throw new ApiError(response.status, payload?.error ?? "Something went wrong.");

  return payload?.data as T;
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function getPublicMenu(): Promise<NavItem[]> {
  return request<NavItem[]>("/api/menu", { cache: "no-store" });
}

export function getAdminSession(): Promise<AdminSession> {
  return request<AdminSession>("/api/admin/auth/session", { cache: "no-store" });
}

export function loginAdmin(username: string, password: string): Promise<{ username: string }> {
  return request<{ username: string }>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutAdmin(): Promise<{ loggedOut: boolean }> {
  return request<{ loggedOut: boolean }>("/api/admin/auth/logout", { method: "POST" });
}

export function getAdminMenu(): Promise<AdminMenuSection[]> {
  return request<AdminMenuSection[]>("/api/admin/menu", { cache: "no-store" });
}

function mutateMenu(path: string, method: "POST" | "PUT" | "DELETE", input?: object): Promise<AdminMenuSection[]> {
  return request<AdminMenuSection[]>(path, {
    method,
    ...(input ? { body: JSON.stringify(input) } : {}),
  });
}

export function updateMenuSection(id: string, input: MenuSectionInput) {
  return mutateMenu(`/api/admin/menu/sections/${id}`, "PUT", input);
}

export function updateMenuGroup(id: string, input: MenuGroupInput) {
  return mutateMenu(`/api/admin/menu/groups/${id}`, "PUT", input);
}

export function updateMenuItem(id: string, input: MenuItemInput) {
  return mutateMenu(`/api/admin/menu/items/${id}`, "PUT", input);
}

export function updateMenuLink(id: string, input: MenuLinkInput) {
  return mutateMenu(`/api/admin/menu/links/${id}`, "PUT", input);
}

export function createMenuGroup(input: Required<Pick<MenuGroupInput, "sectionId" | "key" | "label" | "railLabel" | "description">> & MenuGroupInput) {
  return mutateMenu("/api/admin/menu/groups", "POST", input);
}

export function createMenuItem(input: Required<Pick<MenuItemInput, "groupId" | "label" | "description" | "href" | "marker">> & MenuItemInput) {
  return mutateMenu("/api/admin/menu/items", "POST", input);
}

export function createMenuLink(input: Required<Pick<MenuLinkInput, "itemId" | "label" | "href">> & MenuLinkInput) {
  return mutateMenu("/api/admin/menu/links", "POST", input);
}

export function deleteMenuItem(id: string) {
  return mutateMenu(`/api/admin/menu/items/${id}`, "DELETE");
}

export function deleteMenuLink(id: string) {
  return mutateMenu(`/api/admin/menu/links/${id}`, "DELETE");
}

export function deleteMenuGroup(id: string) {
  return mutateMenu(`/api/admin/menu/groups/${id}`, "DELETE");
}

export function deleteMenuSection(id: string) {
  return mutateMenu(`/api/admin/menu/sections/${id}`, "DELETE");
}
