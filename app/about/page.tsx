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
        "Meet Energy Media: experienced marketing professionals in Medellín, Colombia running ads, design, websites, CRM and tracking for small businesses in the US and Latin America.",
      openGraph: {
        title: "About Energy Media | Marketing for Small Businesses",
        description:
          "Johan on CRM, automation and tracking, Sebastian and Nidward on paid media, Santiago on digital design: one small team for your whole funnel.",
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
