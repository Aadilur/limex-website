import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { SmoothScroll } from "@/components/limex/smooth-scroll";
import { NavigationProgress } from "@/components/limex/navigation-progress";
import { BrandingProvider } from "@/components/limex/branding-context";
import {
  defaultBranding,
  generateThemeCss,
  type SiteBranding,
} from "@/lib/branding-api";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Limex | Business, made clearer",
  description:
    "Company registration, tax, trademark and compliance support for ambitious businesses.",
};

async function getServerBranding(): Promise<SiteBranding> {
  try {
    const port = process.env.BACKEND_PORT || process.env.GATEWAY_PORT || 4000;
    const res = await fetch(`http://127.0.0.1:${port}/api/branding`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return defaultBranding;
    const json = await res.json();
    return json?.data || defaultBranding;
  } catch {
    return defaultBranding;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const branding = await getServerBranding();
  const themeCss = generateThemeCss(branding);

  return (
    <html className="bg-page" lang="en">
      <body className="bg-page font-body text-body text-ink antialiased">
        <style
          id="limex-theme-vars"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
        <BrandingProvider initialBranding={branding}>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <SmoothScroll />
          {children}
        </BrandingProvider>
      </body>
    </html>
  );
}
