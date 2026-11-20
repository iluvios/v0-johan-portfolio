import type { Metadata } from "next";
import ContactPortfolio from "@/components/contact-portfolio";
import { getServerSite } from "@/lib/tenant-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getServerSite();
  if (site === "energymedia") {
    return {
      title: "Contact",
      description:
        "Book a call with Energy Media about ads, social media, email, websites, tracking or CRM. We work with businesses in the US, Colombia and Latin America.",
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
