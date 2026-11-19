import { headers } from "next/headers";
import type { Language } from "@/lib/i18n";
import {
  LANG_HEADER,
  SITE_HEADER,
  detectPreferredLanguage,
  getSiteConfig,
  isSiteId,
  resolveSiteFromHost,
  type SiteConfig,
  type SiteId,
} from "@/lib/tenant";

export async function getServerSite(): Promise<SiteId> {
  const headerStore = await headers();
  const fromHeader = headerStore.get(SITE_HEADER);
  if (isSiteId(fromHeader)) return fromHeader;
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  return resolveSiteFromHost(host);
}

export async function getServerSiteConfig(): Promise<SiteConfig> {
  const site = await getServerSite();
  return getSiteConfig(site);
}

export async function getServerLanguage(): Promise<Language> {
  const headerStore = await headers();
  const fromHeader = headerStore.get(LANG_HEADER);
  if (fromHeader === "en" || fromHeader === "es") return fromHeader;

  const site = await getServerSite();
  return detectPreferredLanguage({
    acceptLanguage: headerStore.get("accept-language"),
    country:
      headerStore.get("x-vercel-ip-country") ||
      headerStore.get("cf-ipcountry"),
    site,
  });
}
