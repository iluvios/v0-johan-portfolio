import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AgencyServices from "@/components/agency-services";
import { getServerSite } from "@/lib/tenant-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getServerSite();
  if (site !== "energymedia") {
    return { title: "Work" };
  }
  return {
    title: "Services",
    description:
      "Paid media, high-converting Next.js & Webflow websites, CRM lifecycle automation, and server-side attribution built by Energy Media.",
  };
}

export default async function ServicesPage() {
  const site = await getServerSite();
  if (site !== "energymedia") {
    redirect("/projects");
  }
  return <AgencyServices />;
}
