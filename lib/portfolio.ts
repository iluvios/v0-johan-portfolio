"use client";

import useSWR from "swr";
import { useLanguage } from "@/contexts/language-context";
import { getProjects, getFeaturedProjects, getProject } from "@/lib/projects";
import { getBlogPosts, getBlogPost } from "@/lib/blog";
import { portfolioCopy, type Language } from "@/lib/i18n";

export function usePortfolioCopy() {
  const { language } = useLanguage();
  return { copy: portfolioCopy[language], language };
}

export const useProjects = () =>
  useSWR("portfolio-projects", () => getProjects());
export const useFeaturedProjects = () =>
  useSWR("portfolio-featured-projects", getFeaturedProjects);
export const useProject = (id: number) =>
  useSWR(["portfolio-project", id], () =>
    Number.isSafeInteger(id) && id > 0 ? getProject(id) : Promise.resolve(null),
  );
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
