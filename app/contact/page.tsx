import type { Metadata } from "next";
import ContactPortfolio from "@/components/contact-portfolio";
import { getServerSite } from "@/lib/tenant-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getServerSite();
  if (site === "energymedia") {
    return {
      title: "Contact",
      description:
        "Start a growth marketing, website, CRM automation, or attribution project with Energy Media. Serving Colombia, LATAM, and US teams.",
    };
  }
  return {
    title: "Let’s talk",
    description:
      "Hiring a growth marketer or martech lead, or need a campaign or system built? Get in touch with Johan Alvarez, remote on US hours.",
  };
}

export default function ContactPage() {
  return <ContactPortfolio />;
}
