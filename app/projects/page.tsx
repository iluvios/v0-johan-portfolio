import type { Metadata } from "next";
import ProjectBrowser from "@/components/project-browser";
import { getServerSite } from "@/lib/tenant-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getServerSite();
  if (site === "energymedia") {
    return {
      title: "Work & Case Studies",
      description:
        "Campaigns, websites, ecommerce stores, and growth systems shipped by Energy Media for companies across Colombia, Latin America, and the US.",
    };
  }
  return {
    title: "Work",
    description:
      "Campaigns, websites, funnels, and MVPs Johan Alvarez has built for companies in Latin America and the US.",
  };
}

export default function ProjectsPage() {
  return <ProjectBrowser />;
}
