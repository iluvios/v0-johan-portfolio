"use client";

import useSWR from "swr";
import { useLanguage } from "@/contexts/language-context";
import { useSite } from "@/contexts/site-context";
import { getProjects, getFeaturedProjects, getProject } from "@/lib/projects";
import { getBlogPosts, getBlogPost } from "@/lib/blog";
import {
  portfolioCopy,
  agencyCopy,
  agencyPortfolioOverrides,
  type Language,
  type PortfolioCopy,
} from "@/lib/i18n";

// Project categories are stored in English; Spanish visitors see them translated.
const CATEGORY_ES: Record<string, string> = {
  "Growth marketing": "Growth marketing",
  Websites: "Sitios web",
  "Apps & platforms": "Apps y plataformas",
  "Online stores": "Tiendas online",
};

export function usePortfolioCopy() {
  const { language } = useLanguage();
  const { isAgency } = useSite();
  const base = portfolioCopy[language];
  const copy: PortfolioCopy = isAgency
    ? {
        ...base,
        ...agencyPortfolioOverrides[language],
        caseStudy: {
          ...base.caseStudy,
          ...(agencyPortfolioOverrides[language].caseStudy ?? {}),
        },
      }
    : base;
  const categoryName = (value: string) =>
    language === "es" ? (CATEGORY_ES[value] ?? value) : value;
  return { copy, language, categoryName };
}

export function useAgencyCopy() {
  const { language } = useLanguage();
  return { copy: agencyCopy[language], language };
}

export function useProjects() {
  const { site } = useSite();
  return useSWR(["portfolio-projects", site], () =>
    getProjects(undefined, { site }),
  );
}

export function useFeaturedProjects() {
  const { site } = useSite();
  return useSWR(["portfolio-featured-projects", site], () =>
    getFeaturedProjects(site),
  );
}

export function useProject(id: number) {
  const { site } = useSite();
  return useSWR(["portfolio-project", site, id], () =>
    Number.isSafeInteger(id) && id > 0
      ? getProject(id, site)
      : Promise.resolve(null),
  );
}

export const useArticles = () => useSWR("portfolio-articles", getBlogPosts);
export const useArticle = (id: string) =>
  useSWR(["portfolio-article", id], () => getBlogPost(id));

export function formatDate(date: string, language: Language) {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? ""
    : value.toLocaleDateString(language === "es" ? "es-CO" : "en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
}

export function readTimeLabel(value: string, language: Language) {
  return language === "es"
    ? value.replace(/min read/i, "min de lectura")
    : value;
}

export function safeWebsite(value: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
