import type { MetadataRoute } from "next";
import { getServerSiteConfig } from "@/lib/tenant-server";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getServerSiteConfig();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${config.origin}/sitemap.xml`,
  };
}
