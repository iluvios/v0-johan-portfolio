"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlowButton } from "@/components/ui/glow-button";
import { Separator } from "@/components/ui/separator";
import { Eyebrow, PageIntro } from "@/components/portfolio-ui";
import { Reveal } from "@/components/portfolio-motion";
import { usePortfolioCopy } from "@/lib/portfolio";
import { SERVICE_TOOLS } from "@/lib/site";

export default function ServicesPortfolio() {
  const { copy } = usePortfolioCopy();
  return (
    <div className="page-shell">
      <PageIntro
        eyebrow={copy.servicesEyebrow}
        title={copy.servicesTitle}
        description={copy.servicesIntro}
      />
      <div className="flex flex-wrap items-center gap-6 pb-12">
        <GlowButton asChild>
          <Link href="/contact">
            {copy.servicesContact}
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </GlowButton>
        <Link href="/projects" className="text-link">
          {copy.allWork}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>

      <Separator />
      <section className="section" aria-label={copy.servicesEyebrow}>
        <div className="service-grid">
          {copy.services.map((service, i) => (
            <Reveal key={service.id} delay={i * 0.05}>
              <article id={service.id} className="service-card">
                <span className="service-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-3">
                  <h2 className="service-title">{service.title}</h2>
                  <p className="service-outcome">{service.outcome}</p>
                </div>
                <ul className="service-list">
                  {service.includes.map((item) => (
                    <li key={item}>
                      <Check size={16} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-auto flex flex-wrap gap-2" aria-label="Tools">
                  {(SERVICE_TOOLS[service.id] ?? []).map((tool) => (
                    <li key={tool}>
                      <Badge variant="tag">{tool}</Badge>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Separator />
      <section className="section" aria-labelledby="engagements-heading">
        <div className="section-heading">
          <div className="flex flex-col gap-4">
            <Eyebrow>{copy.engagementsEyebrow}</Eyebrow>
            <h2 id="engagements-heading" className="section-title">
              {copy.engagementsTitle}
            </h2>
          </div>
        </div>
        <div className="engagement-grid">
          {copy.engagements.map((engagement) => (
            <div key={engagement.title} className="engagement-card">
              <p className="engagement-meta">{engagement.meta}</p>
              <h3>{engagement.title}</h3>
              <p>{engagement.body}</p>
            </div>
          ))}
        </div>
        <h3 className="eyebrow mb-6 mt-16">{copy.processTitle}</h3>
        <ol className="process-grid">
          {copy.process.map((step, i) => (
            <li key={step.title} className="process-step">
              <span className="service-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <Separator />
      <section className="section" aria-labelledby="proof-work-heading">
        <div className="section-heading">
          <div className="flex flex-col gap-4">
            <Eyebrow>{copy.proof}</Eyebrow>
            <h2 id="proof-work-heading" className="section-title">
              {copy.servicesProofTitle}
            </h2>
          </div>
          <Link className="text-link" href="/projects">
            {copy.allWork}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <ul>
          {copy.servicesProof.map((item) => (
            <li key={item.name} className="proof-row">
              <h3>{item.name}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="pb-16 md:pb-24">
        <Reveal>
          <section className="contact-invitation">
            <div className="contact-invitation-inner">
              <Eyebrow>{copy.servicesEyebrow}</Eyebrow>
              <h2>{copy.servicesContactTitle}</h2>
              <div className="flex flex-wrap items-center gap-6">
                <GlowButton asChild>
                  <Link href="/contact">
                    {copy.talk}
                    <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </GlowButton>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {copy.servicesContactBody}
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
