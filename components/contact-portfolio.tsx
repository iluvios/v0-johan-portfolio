"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageIntro } from "@/components/portfolio-ui";
import { usePortfolioCopy } from "@/lib/portfolio";
import { useSite } from "@/contexts/site-context";
import ContactForm from "@/components/contact-form";

export default function ContactPortfolio() {
  const { copy, language } = usePortfolioCopy();
  const { isAgency, config } = useSite();

  return (
    <div className="page-shell">
      <PageIntro
        eyebrow={copy.talk}
        title={copy.contactTitle}
        description={copy.contactIntro}
      />
      <div className="contact-layout">
        <div className="contact-direct">
          <a href={`mailto:${config.email}`} className="text-link">
            {config.email}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          {isAgency ? (
            <>
              <Link href="/services" className="text-link">
                {language === "en" ? "Services and pricing" : "Servicios y precios"}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/projects" className="text-link">
                {copy.allWork}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <a
                href={config.linkedinUrl}
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
            </>
          )}
          <p className="flex max-w-xs items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-1 shrink-0" size={16} aria-hidden="true" />
            {copy.location}
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
