import type { Metadata } from "next";
import ServicesPortfolio from "@/components/services-portfolio";

export const metadata: Metadata = {
  title: "Services for startups",
  description:
    "Growth and GTM systems for recently funded startups: campaigns and creative, outbound engines, CRM and lifecycle automation, tracking and attribution, and AI-built MVPs. Launch sprints or fractional GTM engineering.",
};

export default function ServicesPage() {
  return <ServicesPortfolio />;
}
