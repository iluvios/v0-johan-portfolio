import type { Metadata } from "next";
import ProjectBrowser from "@/components/project-browser";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Digital experiences, marketing automation, and strategies brought to life by Johan Alvarez.",
};
export default function ProjectsPage() {
  return <ProjectBrowser />;
}
