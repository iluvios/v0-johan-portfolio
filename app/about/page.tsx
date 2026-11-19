import type { Metadata } from "next";
import CVDocument from "@/components/cv-document";
import AgencyAbout from "@/components/agency-about";
import { getServerSite } from "@/lib/tenant-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getServerSite();
  if (site === "energymedia") {
    return {
      title: "About",
      description:
        "Energy Media is a Medellín-based growth and digital systems agency uniting paid acquisition, web engineering, CRM automation, and attribution.",
      openGraph: {
        title: "About Energy Media | Growth & Digital Systems Agency",
        description:
          "Senior growth operators uniting performance marketing, high-converting websites, CRM automation, and attribution.",
        type: "website",
      },
    };
  }
  return {
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
}

export default async function AboutPage() {
  const site = await getServerSite();
  return site === "energymedia" ? <AgencyAbout /> : <CVDocument embedded />;
}
