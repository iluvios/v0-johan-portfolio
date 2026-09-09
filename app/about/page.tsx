import type { Metadata } from "next";
import AboutPortfolio from "@/components/about-portfolio";

export const metadata: Metadata = {
  title: "CV — Senior Martech Specialist",
  description:
    "Johan Alvarez’s CV: 10+ years in digital marketing, automation, and software development. Explore work experience, skills, and education, or download the PDF.",
  openGraph: {
    title: "Johan Alvarez — Senior Martech Specialist",
    description:
      "Marketing, technology, and business. View Johan’s professional experience, skills, education, and downloadable CV.",
    type: "profile",
  },
};

export default function AboutPage() {
  return <AboutPortfolio />;
}
