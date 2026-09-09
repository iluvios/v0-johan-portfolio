import type { Metadata } from "next";
import ContactPortfolio from "@/components/contact-portfolio";

export const metadata: Metadata = {
  title: "Let’s talk",
  description:
    "Have an idea, a project, or a question? Start a conversation with Johan Alvarez.",
};
export default function ContactPage() {
  return <ContactPortfolio />;
}
