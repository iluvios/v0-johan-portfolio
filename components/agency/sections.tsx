"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlowButton } from "@/components/ui/glow-button";
import { Reveal } from "@/components/portfolio-motion";
import { Eyebrow } from "@/components/portfolio-ui";
import type { Faq, FunnelStage, ProofItem, TitledText } from "@/lib/agency/copy";

export function AgencySection({
  id,
  eyebrow,
  title,
  intro,
  aside,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-heading`}>
      <div className="section-heading">
        <div className="flex flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={`${id}-heading`} className="section-title">
            {title}
          </h2>
          {intro && <p className="agency-intro">{intro}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function NumberedGrid({ items }: { items: TitledText[] }) {
  return (
    <div className="agency-numbered">
      {items.map((item, i) => (
        <Reveal key={item.title} className="process-step">
          <span className="service-index">{String(i + 1).padStart(2, "0")}</span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function FunnelGrid({ stages }: { stages: (Omit<FunnelStage, "tags"> & { tags?: string[] })[] }) {
  return (
    <ol className="agency-funnel">
      {stages.map((stage, i) => (
        <li key={stage.stage}>
          <Reveal className="service-teaser h-full">
            <span className="agency-stage">
              <span className="service-index">{String(i + 1).padStart(2, "0")}</span>
              {stage.stage}
            </span>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
            {stage.tags && (
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {stage.tags.map((tag) => (
                  <li key={tag}>
                    <Badge variant="tag">{tag}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export function StatGrid({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <dl className="proof-grid agency-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="proof-item">
          <dt className="proof-label">{stat.label}</dt>
          <dd className="proof-value">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProofGrid({
  items,
  caseStudy,
  tag,
}: {
  items: ProofItem[];
  caseStudy: string;
  tag?: string;
}) {
  return (
    <ul className="agency-proof">
      {items.map((item) => {
        const body = (
          <>
            <span className="agency-proof-client">
              {item.client}
              {item.href && <ArrowUpRight size={16} aria-hidden="true" />}
            </span>
            <span className="proof-value">{item.value}</span>
            <span className="proof-label">{item.label}</span>
            <span className="proof-context">
              {tag ? `${tag} · ` : ""}
              {item.context}
            </span>
          </>
        );
        return (
          <li key={item.client}>
            {item.href ? (
              <Link
                href={item.href}
                className="agency-proof-item"
                aria-label={`${caseStudy}: ${item.client}, ${item.value} ${item.label}`}
              >
                {body}
              </Link>
            ) : (
              <div className="agency-proof-item">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="agency-faq">
      {items.map((item) => (
        <details key={item.q}>
          <summary>
            <span>{item.q}</span>
            <Plus size={20} aria-hidden="true" />
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function AgencyCta({
  eyebrow,
  title,
  body,
  button,
}: {
  eyebrow: string;
  title: string;
  body: string;
  button: string;
}) {
  return (
    <Reveal>
      <section className="contact-invitation" aria-label={eyebrow}>
        <div className="contact-invitation-inner">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2>{title}</h2>
          <div className="flex flex-wrap items-center gap-6">
            <GlowButton asChild>
              <Link href="/contact">
                {button}
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </GlowButton>
            <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
