import type { Metadata } from "next";
import ProjectBrowser from "@/components/project-browser";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Startup MVPs, GTM automation, and the sites and funnels Johan Alvarez has built for clients in Latin America and the US.",
};

export default function ProjectsPage() {
  return <ProjectBrowser />;
}
