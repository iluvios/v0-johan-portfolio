import type { Metadata } from "next";
import CVDocument from "@/components/cv-document";

export const metadata: Metadata = {
  title: "About & CV",
  description:
    "Johan Alvarez’s CV: 12 years across growth marketing, martech and software, from paid media and creative to outbound, CRM and attribution. View experience, skills, and education, or download the PDF.",
  openGraph: {
    title: "Johan Alvarez | Senior Growth Marketer",
    description:
      "Experience, skills, and education. Growth marketing, campaigns and creative, and the martech systems behind them.",
    type: "profile",
  },
};

export default function AboutPage() {
  return <CVDocument embedded />;
}
