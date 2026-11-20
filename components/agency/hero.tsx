"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { useLanguage } from "@/contexts/language-context";

// Fixed grid behind every agency page. Rendered once by SiteShell on the agency site.
export function AgencyBackdrop() {
  return <div className="agency-backdrop" aria-hidden="true" />;
}

const TOOLS = ["Google Ads", "Meta Ads", "WhatsApp", "HubSpot", "GA4", "Shopify", "Webflow", "n8n"];

export function AgencyHero({
  eyebrow,
  hero,
  intro,
  primaryCta,
  secondaryCta,
  facts,
  toolsLabel,
}: {
  eyebrow: string;
  hero: string[];
  intro: string;
  primaryCta: string;
  secondaryCta: string;
  facts: string[];
  toolsLabel: string;
}) {
  const { language } = useLanguage();
  return (
    <section className="agency-hero" aria-labelledby="agency-hero-heading">
      <div className="agency-hero-glows" aria-hidden="true">
        <span className="agency-orb agency-orb--one" />
        <span className="agency-orb agency-orb--two" />
        <span className="agency-orb agency-orb--three" />
        <span className="agency-chip agency-chip--one">
          <span className="status-dot" /> AI assistant
        </span>
        <span className="agency-chip agency-chip--two">WhatsApp</span>
        <span className="agency-chip agency-chip--three">Google Ads</span>
        <span className="agency-chip agency-chip--four">CRM</span>
      </div>
      <div className="page-shell agency-hero-inner">
        <p className="agency-hero-eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 id="agency-hero-heading" className="agency-hero-title" lang={language}>
          {hero.map((line, i) => (
            <span key={i} className={i === hero.length - 1 ? "hero-last" : undefined}>
              {line}
            </span>
          ))}
        </h1>
        <p className="agency-hero-intro">{intro}</p>
        <div className="agency-hero-actions">
          <GlowButton asChild size="lg">
            <Link href="/contact">
              {primaryCta}
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </GlowButton>
          <GlowButton asChild size="lg" variant="outline">
            <Link href="#pricing">{secondaryCta}</Link>
          </GlowButton>
        </div>
        <ul className="agency-hero-facts">
          {facts.map((item, i) => (
            <li key={item}>
              {i === 0 && <span className="status-dot" aria-hidden="true" />}
              {item}
            </li>
          ))}
        </ul>
        <div className="agency-tools">
          <p>{toolsLabel}</p>
          <ul>
            {TOOLS.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
