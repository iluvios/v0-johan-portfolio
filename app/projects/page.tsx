import type { Metadata } from "next";
import ProjectBrowser from "@/components/project-browser";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Campaigns, websites, funnels, and MVPs Johan Alvarez has built for companies in Latin America and the US.",
};

export default function ProjectsPage() {
  return <ProjectBrowser />;
}
