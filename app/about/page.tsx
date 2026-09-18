import type { Metadata } from "next";
import CVPage from "@/app/cv/page";

export const metadata: Metadata = {
  title: "About & CV",
  description:
    "Johan Alvarez’s CV: 10+ years across software development, growth marketing, and martech — outbound, marketing automation, CRM, and attribution. View experience, skills, and education, or download the PDF.",
  openGraph: {
    title: "Johan Alvarez — Senior Martech & GTM Engineer",
    description:
      "Experience, skills, and education. Outbound, marketing automation, CRM, and attribution systems.",
    type: "profile",
  },
};

export default function AboutPage() {
  return <CVPage />;
}
