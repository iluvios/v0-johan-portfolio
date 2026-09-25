import type { Metadata } from "next";
import ContactPortfolio from "@/components/contact-portfolio";

export const metadata: Metadata = {
  title: "Let’s talk",
  description:
    "Hiring a GTM engineer or martech lead, or need a campaign or system built? Get in touch with Johan Alvarez — remote, on US hours.",
};
export default function ContactPage() {
  return <ContactPortfolio />;
}
