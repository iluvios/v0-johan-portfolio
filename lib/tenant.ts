import type { Language } from "@/lib/i18n";
import { AGENCY_EMAIL, CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";

export type SiteId = "asjohan" | "energymedia";

export const SITE_HEADER = "x-site-id";
export const LANG_HEADER = "x-detected-lang";
export const PREVIEW_SITE_COOKIE = "site_preview";

export interface SiteConfig {
  id: SiteId;
  name: string;
  shortName: string;
  domain: string;
  origin: string;
  email: string;
  linkedinUrl: string;
  contactSubjectDefault: Record<Language, string>;
}

export const SITE_CONFIGS: Record<SiteId, SiteConfig> = {
  asjohan: {
    id: "asjohan",
    name: "Johan Alvarez",
    shortName: "A.S. Johan",
    domain: "asjohan.com",
    origin: "https://asjohan.com",
    email: CONTACT_EMAIL,
    linkedinUrl: LINKEDIN_URL,
    contactSubjectDefault: {
      en: "Portfolio inquiry",
      es: "Consulta desde asjohan.com",
    },
  },
  energymedia: {
    id: "energymedia",
    name: "Energy Media",
    shortName: "Energy Media",
    domain: "energymedia.com.co",
    origin: "https://energymedia.com.co",
    email: AGENCY_EMAIL,
    linkedinUrl: LINKEDIN_URL,
    contactSubjectDefault: {
      en: "New project inquiry — Energy Media",
      es: "Nuevo proyecto — Energy Media",
    },
  },
};

export function isSiteId(value: string | null | undefined): value is SiteId {
  return value === "asjohan" || value === "energymedia";
}

export function normalizeHost(host: string | null | undefined): string {
  if (!host) return "";
  return host.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
}

export function isPreviewHost(host: string | null | undefined): boolean {
  const clean = normalizeHost(host);
  return (
    clean === "localhost" ||
    clean === "127.0.0.1" ||
    clean.endsWith(".localhost") ||
    clean.endsWith(".vercel.app")
  );
}

export function resolveSiteFromHost(host: string | null | undefined): SiteId {
  const clean = normalizeHost(host);
  if (clean.includes("energymedia")) return "energymedia";
  return "asjohan";
}

export function getSiteConfig(site: SiteId): SiteConfig {
  return SITE_CONFIGS[site];
}

// ISO 3166-1 alpha-2 country codes where Spanish is the primary language.
const SPANISH_COUNTRIES = new Set([
  "AR",
  "BO",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "ES",
  "GQ",
  "GT",
  "HN",
  "MX",
  "NI",
  "PA",
  "PE",
  "PR",
  "PY",
  "SV",
  "UY",
  "VE",
]);

export function isSpanishSpeakingCountry(country: string | null | undefined): boolean {
  if (!country) return false;
  return SPANISH_COUNTRIES.has(country.trim().toUpperCase());
}

interface ParsedAcceptLang {
  tag: string;
  base: string;
  q: number;
}

function parseAcceptLanguage(header: string | null | undefined): ParsedAcceptLang[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = (rawTag || "").trim().toLowerCase();
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return {
        tag,
        base: tag.split("-")[0],
        q: Number.isFinite(q) ? q : 1,
      };
    })
    .filter((entry) => Boolean(entry.tag))
    .sort((a, b) => b.q - a.q);
}

/**
 * Picks the most relevant language ("en" | "es") by weighing both browser
 * language preferences and GeoIP country (e.g. x-vercel-ip-country).
 *
 * Rules:
 * 1. Primary browser language is Spanish -> "es".
 * 2. Primary browser language is English, visitor is in a Spanish-speaking country,
 *    and Spanish is also listed in their browser languages (or on the .com.co agency
 *    domain with no explicit US/UK/etc. regional lock) -> "es" when bilingual in LATAM/ES,
 *    otherwise "en".
 * 3. Neither English nor Spanish is primary -> fall back to country, then "en".
 */
export function detectPreferredLanguage(options: {
  acceptLanguage?: string | null;
  country?: string | null;
  site?: SiteId;
}): Language {
  const langs = parseAcceptLanguage(options.acceptLanguage);
  const spanishCountry = isSpanishSpeakingCountry(options.country);
  const primary = langs[0]?.base;
  const hasSpanish = langs.some((l) => l.base === "es");
  const hasEnglish = langs.some((l) => l.base === "en");

  if (primary === "es") return "es";

  if (primary === "en") {
    // Bilingual visitor physically located in Colombia / LATAM / Spain whose OS/Chrome
    // defaults to English but also includes Spanish in browser languages.
    if (spanishCountry && hasSpanish) return "es";
    // On the Colombian agency domain (.com.co), a visitor located in a Spanish-speaking
    // country who didn't explicitly pick a non-Spanish manual preference gets Spanish.
    if (spanishCountry && options.site === "energymedia") return "es";
    return "en";
  }

  if (spanishCountry) return "es";
  if (hasSpanish && !hasEnglish) return "es";
  return "en";
}
