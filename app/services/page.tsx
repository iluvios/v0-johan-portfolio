import type { Metadata } from "next";
import ServicesPortfolio from "@/components/services-portfolio";

export const metadata: Metadata = {
  title: "Services for startups",
  description:
    "Growth for recently funded startups: campaigns and creative, landing pages, CRM and lifecycle automation, outbound, tracking and attribution, and AI-built MVPs. Launch sprints or a fractional growth marketer.",
};

export default function ServicesPage() {
  return <ServicesPortfolio />;
}
