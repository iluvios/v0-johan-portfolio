import type { Metadata } from "next";
import ProjectDetail from "@/components/project-detail";
import { getServerSite } from "@/lib/tenant-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getServerSite();
  if (site === "energymedia") {
    return {
      title: "Case study",
      description:
        "Strategy, engineering, and measurable results behind Energy Media’s client work.",
    };
  }
  return {
    title: "Project details",
    description:
      "A closer look at the strategy, craft, and tools behind Johan Alvarez’s work.",
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetail id={Number(id)} />;
}
