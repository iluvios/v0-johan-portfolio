"use client";

import Link from "next/link";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { Separator } from "@/components/ui/separator";
import { Eyebrow, PageIntro } from "@/components/portfolio-ui";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/portfolio-motion";
import { usePortfolioCopy } from "@/lib/portfolio";
import { STACK } from "@/lib/site";

// One method, not a menu: the five parts of a digital sales system, connected in a loop.
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
        <Reveal>
          <ol className="system-flow">
            {copy.services.map((stage, i) => (
              <li key={stage.id} id={stage.id} className="system-step" style={{ "--i": i } as React.CSSProperties}>
                <span className="system-node" aria-hidden="true" />
                <span className="service-index">{String(i + 1).padStart(2, "0")}</span>
                <h2>{stage.title}</h2>
                <p className="system-outcome">{stage.outcome}</p>
                <p className="system-body">{stage.body}</p>
              </li>
            ))}
          </ol>
          <div className="system-loop">
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 82.3 1 C 82.3 23, 0.6 23, 0.6 1" vectorEffect="non-scaling-stroke" />
            </svg>
            <p>
              <RotateCcw size={16} aria-hidden="true" />
              {copy.systemLoop}
            </p>
          </div>
        </Reveal>
        <div className="system-tools">
          <p>{copy.systemTools}</p>
          <ul className="flex flex-wrap gap-2">
            {STACK.map((tool) => (
              <li key={tool}>
                <Badge variant="tag">{tool}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Separator />
      <section className="section" aria-label={copy.processTitle}>
        <div className="mb-8">
          <Eyebrow>{copy.processTitle}</Eyebrow>
        </div>
        <ol className="process-grid">
          {copy.process.map((step, i) => (
            <li key={step.title} className="process-step">
              <span className="service-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
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
        <ul className="method-proof">
          {copy.servicesProof.map((item) => (
            <li key={item.id}>
              <Link href={`/projects/${item.id}`}>
                <span className="method-proof-kind">{item.kind}</span>
                <span className="method-proof-name">{item.name}</span>
                <span className="method-proof-result">{item.result}</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
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
