import type { MetadataRoute } from "next";
import { neon } from "@neondatabase/serverless";

const SITE = "https://asjohan.com";

// Rebuilt daily so newly added projects show up without a redeploy.
export const revalidate = 86400;

// Project detail pages are client-rendered, so list them here for crawlers.
async function projectIds(): Promise<number[]> {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!dbUrl) return [];
  try {
    const sql = neon(dbUrl);
    const rows = await sql`SELECT id FROM projects`;
    return rows.map((row) => Number(row.id)).filter(Number.isSafeInteger);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/projects", "/services", "/about", "/contact"].map(
    (path) => ({ url: `${SITE}${path}` }),
  );
  const projects = (await projectIds()).map((id) => ({
    url: `${SITE}/projects/${id}`,
  }));
  return [...pages, ...projects];
}
