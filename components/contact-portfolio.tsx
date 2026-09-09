"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import { PageIntro } from "@/components/portfolio-ui";
import { usePortfolioCopy } from "@/lib/portfolio";
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
          <a href="mailto:jdsub16@gmail.com" className="text-link">
            jdsub16@gmail.com
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a
            href="https://linkedin.com/in/johanalvarez"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            LinkedIn
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
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
