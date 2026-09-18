"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageIntro } from "@/components/portfolio-ui";
import { usePortfolioCopy } from "@/lib/portfolio";
import { CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";
import ContactForm from "@/components/contact-form";

export default function ContactPortfolio() {
  const { copy } = usePortfolioCopy();
  return (
    <div className="page-shell">
      <PageIntro
        eyebrow={copy.talk}
        title={copy.contactTitle}
        description={copy.contactIntro}
      />
      <div className="contact-layout">
        <div className="contact-direct">
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
            {CONTACT_EMAIL}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            LinkedIn
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <Link href="/about" className="text-link">
            CV
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <p className="hidden max-w-xs items-start gap-2 text-sm text-muted-foreground lg:flex">
            <MapPin className="mt-1 shrink-0" size={16} aria-hidden="true" />
            {copy.location}
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
