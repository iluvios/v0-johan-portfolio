import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AgencyServices from "@/components/agency-services";
import { EXAMPLE_PLANS, isExamplePlanId } from "@/lib/agency/pricing";
import { getServerSite } from "@/lib/tenant-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getServerSite();
  if (site !== "energymedia") {
    return { title: "Work" };
  }
  return {
    title: "Services and Pricing",
    description:
      "Ads, website, social media, email, chat and CRM built as one connected system for small businesses, with upfront prices and a plan calculator.",
  };
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const site = await getServerSite();
  if (site !== "energymedia") {
    redirect("/projects");
  }
  // The home page plan cards link here with ?plan=starter|growth|full to preset the calculator.
  const { plan } = await searchParams;
  return <AgencyServices preset={isExamplePlanId(plan) ? EXAMPLE_PLANS[plan] : undefined} />;
}
