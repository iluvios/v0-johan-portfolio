import type { Metadata } from "next";
import ProjectDetail from "@/components/project-detail";

export const metadata: Metadata = {
  title: "Project details",
  description:
    "A closer look at the strategy, craft, and tools behind Johan Alvarez’s work.",
};
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetail id={Number(id)} />;
}
