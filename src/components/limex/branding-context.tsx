"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultBranding,
  generateThemeCss,
  getPublicBranding,
  type SiteBranding,
} from "@/lib/branding-api";

type BrandingContextValue = {
  branding: SiteBranding;
  setBranding: (
    branding: SiteBranding | ((prev: SiteBranding) => SiteBranding),
  ) => void;
  logoUrl: string | null;
  logoLightUrl: string | null;
};

const BrandingContext = createContext<BrandingContextValue>({
  branding: defaultBranding,
  setBranding: () => {},
  logoUrl: null,
  logoLightUrl: null,
});

export function BrandingProvider({
  initialBranding,
  children,
}: {
  initialBranding?: SiteBranding;
  children: ReactNode;
}) {
  const [branding, setBranding] = useState<SiteBranding>(
    initialBranding || defaultBranding,
  );

  useEffect(() => {
    // If no initial branding was provided, fetch from public API
    if (!initialBranding) {
      let cancelled = false;
      void getPublicBranding().then((data) => {
        if (!cancelled && data) {
          setBranding(data);
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [initialBranding]);

  // Sync theme variables to DOM when branding state updates
  useEffect(() => {
    let styleEl = document.getElementById("limex-theme-vars");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "limex-theme-vars";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = generateThemeCss(branding);
  }, [branding]);

  return (
    <BrandingContext.Provider
      value={{
        branding,
        setBranding,
        logoUrl: branding.logoUrl,
        logoLightUrl: branding.logoLightUrl,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
