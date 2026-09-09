import type { Metadata } from "next";
import AboutPortfolio from "@/components/about-portfolio";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Johan Alvarez, a marketing and innovation strategist connecting data, design, and people from Medellín, Colombia.",
};
export default function AboutPage() {
  return <AboutPortfolio />;
}
