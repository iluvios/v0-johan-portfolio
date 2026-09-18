import type { Metadata } from "next";
import ServicesPortfolio from "@/components/services-portfolio";

export const metadata: Metadata = {
  title: "Services for startups",
  description:
    "GTM systems for recently funded startups: outbound engines, CRM and lifecycle automation, tracking and attribution, and AI-built MVPs. Launch sprints or fractional GTM engineering.",
};

export default function ServicesPage() {
  return <ServicesPortfolio />;
}
