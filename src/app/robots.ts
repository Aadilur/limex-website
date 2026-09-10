import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] }], sitemap: `${baseUrl}/sitemap.xml` };
}
