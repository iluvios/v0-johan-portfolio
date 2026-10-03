import type { Metadata } from "next";
import ServicesPortfolio from "@/components/services-portfolio";

export const metadata: Metadata = {
  title: "Services",
  description:
    "One digital sales system, built right for any business that sells online: attract, capture, nurture, convert, and measure. Diagnosed, built, and handed over working, by project or monthly.",
};

export default function ServicesPage() {
  return <ServicesPortfolio />;
}
