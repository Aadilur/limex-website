import type { PublicContactSettings } from "./contact-types";

function backendUrl(path: string) {
  const base = process.env.BACKEND_INTERNAL_URL ?? `http://127.0.0.1:${process.env.BACKEND_PORT ?? "4000"}`;
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function getPublicContactServer(): Promise<PublicContactSettings | null> {
  try {
    const response = await fetch(backendUrl("/api/contact-settings"), { cache: "no-store" });
    if (!response.ok) return null;
    const payload = await response.json() as { data?: PublicContactSettings };
    return payload.data ?? null;
  } catch {
    return null;
  }
}
