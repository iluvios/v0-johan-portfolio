"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getSiteConfig, type SiteConfig, type SiteId } from "@/lib/tenant";

interface SiteContextValue {
  site: SiteId;
  isAgency: boolean;
  config: SiteConfig;
}

const SiteContext = createContext<SiteContextValue>({
  site: "asjohan",
  isAgency: false,
  config: getSiteConfig("asjohan"),
});

export function SiteProvider({
  site,
  children,
}: {
  site: SiteId;
  children: ReactNode;
}) {
  const value: SiteContextValue = {
    site,
    isAgency: site === "energymedia",
    config: getSiteConfig(site),
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  return useContext(SiteContext);
}
