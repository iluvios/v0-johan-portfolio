"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/portfolio-motion";
import {
  Eyebrow,
  PageIntro,
  ContactInvitation,
} from "@/components/portfolio-ui";
import { useAgencyCopy, usePortfolioCopy } from "@/lib/portfolio";
import { SITE_CONFIGS } from "@/lib/tenant";
import { STACK } from "@/lib/site";

export default function AgencyAbout() {
  const { copy } = useAgencyCopy();
  const { copy: shared } = usePortfolioCopy();
  const page = copy.aboutPage;

  return (
    <div className="page-shell">
      <PageIntro
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />

      <Separator />

      <section className="section">
        <Reveal className="perspective-layout">
          <Image
            className="perspective-portrait"
            src="/images/johan-portrait.webp"
            alt="Johan Alvarez — Founder of Energy Media"
            width={420}
            height={525}
            sizes="(max-width: 767px) 112px, 300px"
          />
          <div className="perspective-copy">
            <Eyebrow>{page.thesisEyebrow}</Eyebrow>
            <h2 className="perspective-statement">
              {page.thesisStart}
              <br />
              <em>{page.thesisEnd}</em>
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              {page.thesisBody}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link className="text-link" href="/projects">
                {shared.allWork}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a
                className="text-link"
                href={SITE_CONFIGS.asjohan.origin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {page.founderLink}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <Separator />

      <section className="section" aria-labelledby="principles-heading">
        <div className="section-heading">
          <div className="flex flex-col gap-4">
            <Eyebrow>{page.principlesEyebrow}</Eyebrow>
            <h2 id="principles-heading" className="section-title">
              {page.principlesTitle}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {page.principles.map((item) => (
            <Reveal key={item.index} className="process-step">
              <span className="service-index">{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Separator />

      <section className="section" aria-label={shared.stackLabel}>
        <div className="flex flex-col gap-4">
          <p className="eyebrow">{shared.stackLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {STACK.map((tool) => (
              <li key={tool}>
                <Badge variant="tag">{tool}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="pb-16 md:pb-24">
        <ContactInvitation />
      </div>
    </div>
  );
}
