import type { MetadataRoute } from "next";
import { neon } from "@neondatabase/serverless";
import { getServerSiteConfig } from "@/lib/tenant-server";
import type { SiteId } from "@/lib/tenant";
import { INDUSTRY_SLUGS } from "@/lib/agency/industries";

// Domain-aware sitemap: each hostname serves its own canonical URLs and active projects.
export const dynamic = "force-dynamic";

// Project detail pages are client-rendered, so list them here for crawlers.
async function projectIds(site: SiteId): Promise<number[]> {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!dbUrl) return [];
  try {
    const sql = neon(dbUrl);
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_on_asjohan BOOLEAN DEFAULT true;`.catch(() => {});
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_on_energymedia BOOLEAN DEFAULT true;`.catch(() => {});
    const rows =
      site === "energymedia"
        ? await sql`SELECT id FROM projects WHERE hidden IS NOT TRUE AND show_on_energymedia IS NOT FALSE`
        : await sql`SELECT id FROM projects WHERE hidden IS NOT TRUE AND show_on_asjohan IS NOT FALSE`;
    return rows.map((row) => Number(row.id)).filter(Number.isSafeInteger);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getServerSiteConfig();
  const basePaths =
    config.id === "energymedia"
      ? [
          "",
          ...INDUSTRY_SLUGS.map((slug) => `/industries/${slug}`),
          "/services",
          "/projects",
          "/about",
          "/contact",
        ]
      : ["", "/projects", "/about", "/contact"];

  const pages = basePaths.map((path) => ({ url: `${config.origin}${path}` }));
  const projects = (await projectIds(config.id)).map((id) => ({
    url: `${config.origin}/projects/${id}`,
  }));
  return [...pages, ...projects];
}
