"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Globe, Inbox, Instagram, MessageCircle } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { ctaLinkProps } from "@/components/agency/sections";
import { useLanguage } from "@/contexts/language-context";
import { AGENCY_WHATSAPP } from "@/lib/site";

// Fixed grid behind every agency page. Rendered once by SiteShell on the agency site.
export function AgencyBackdrop() {
  return <div className="agency-backdrop" aria-hidden="true" />;
}

// Floating WhatsApp button. Only renders when NEXT_PUBLIC_AGENCY_WHATSAPP is set.
export function AgencyWhatsApp() {
  const { language } = useLanguage();
  if (!AGENCY_WHATSAPP) return null;
  const text =
    language === "es"
      ? "Hola Energy Media, quiero una auditoría gratis."
      : "Hi Energy Media, I’d like a free audit.";
  return (
    <a
      className="agency-whatsapp"
      href={`https://wa.me/${AGENCY_WHATSAPP}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
    >
      <MessageCircle size={26} aria-hidden="true" />
    </a>
  );
}

const TOOLS = ["Google", "Meta", "Instagram", "WhatsApp", "Shopify", "HubSpot", "Webflow"];

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

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
        <span className="agency-glow agency-glow--one" />
        <span className="agency-glow agency-glow--two" />
        <span className="agency-chip agency-chip--one">
          <Globe size={14} /> {language === "es" ? "Chat del sitio" : "Website chat"}
        </span>
        <span className="agency-chip agency-chip--two">
          <MessageCircle size={14} /> WhatsApp
        </span>
        <span className="agency-chip agency-chip--three">
          <Instagram size={14} /> Instagram
        </span>
        <span className="agency-chip agency-chip--four">
          <Inbox size={14} /> CRM <span className="status-dot" />
        </span>
      </div>
      <div className="page-shell agency-hero-inner">
        <p className="agency-hero-eyebrow agency-rise" style={rise(0)}>
          <span className="eyebrow-dot" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 id="agency-hero-heading" className="agency-hero-title" lang={language}>
          {hero.map((line, i) => (
            <span
              key={i}
              className={i === hero.length - 1 ? "hero-last agency-rise" : "agency-rise"}
              style={rise(i + 1)}
            >
              {line}
            </span>
          ))}
        </h1>
        <p className="agency-hero-intro agency-rise" style={rise(hero.length + 1)}>
          {intro}
        </p>
        <div className="agency-hero-actions agency-rise" style={rise(hero.length + 2)}>
          <GlowButton asChild size="lg">
            <Link {...ctaLinkProps}>
              {primaryCta}
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </GlowButton>
          <GlowButton asChild size="lg" variant="outline">
            <Link href="#pricing">{secondaryCta}</Link>
          </GlowButton>
        </div>
        <ul className="agency-hero-facts agency-rise" style={rise(hero.length + 3)}>
          {facts.map((item, i) => (
            <li key={item}>
              {i === 0 && <span className="status-dot" aria-hidden="true" />}
              {item}
            </li>
          ))}
        </ul>
        <div className="agency-tools agency-rise" style={rise(hero.length + 4)}>
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
