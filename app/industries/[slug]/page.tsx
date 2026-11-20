import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AgencyIndustry from "@/components/agency-industry";
import { getIndustry } from "@/lib/agency/industries";
import { getServerLanguage, getServerSite } from "@/lib/tenant-server";

// Industry landing pages exist only on the agency site (energymedia).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getServerSite();
  const industry = getIndustry(slug);
  if (site !== "energymedia" || !industry) return {};
  const copy = industry.copy[await getServerLanguage()];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: `/industries/${slug}` },
    openGraph: { title: `${copy.metaTitle} | Energy Media`, description: copy.metaDescription },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getServerSite();
  const industry = getIndustry(slug);
  if (site !== "energymedia" || !industry) notFound();
  return <AgencyIndustry slug={industry.slug} />;
}
