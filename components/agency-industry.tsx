"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AgencyHero } from "@/components/agency/hero";
import PricingCalculator from "@/components/agency/pricing-calculator";
import {
  AgencyCta,
  AgencySection,
  ConnectedSystem,
  FaqSection,
  FunnelGrid,
  NumberedGrid,
  ProofShowcase,
  StatGrid,
} from "@/components/agency/sections";
import { useLanguage } from "@/contexts/language-context";
import { agencyHomeCopy, getProof } from "@/lib/agency/copy";
import { INDUSTRIES, type IndustrySlug } from "@/lib/agency/industries";

const LABELS = {
  en: {
    stats: "The numbers",
    pains: "The problem",
    funnel: "What we do",
    proof: "Proof",
    otherIndustry: "Another industry",
    pricingTitle: "Price this plan.",
    pricingIntro:
      "We preselected what most businesses like yours need. Change anything to see the price move.",
    allServices: "See the full service",
  },
  es: {
    stats: "Los números",
    pains: "El problema",
    funnel: "Lo que hacemos",
    proof: "Resultados",
    otherIndustry: "Otra industria",
    pricingTitle: "Calcula este plan.",
    pricingIntro:
      "Preseleccionamos lo que necesitan la mayoría de negocios como el tuyo. Cambia lo que quieras y mira cómo se mueve el precio.",
    allServices: "Ver el servicio completo",
  },
};

export default function AgencyIndustry({ slug }: { slug: IndustrySlug }) {
  const { language } = useLanguage();
  const industry = INDUSTRIES[slug];
  const copy = industry.copy[language];
  const home = agencyHomeCopy[language];
  const labels = LABELS[language];

  return (
    <>
      <AgencyHero
        eyebrow={copy.eyebrow}
        hero={copy.hero}
        intro={copy.intro}
        primaryCta={home.primaryCta}
        secondaryCta={home.secondaryCta}
        facts={home.facts}
        toolsLabel={home.toolsLabel}
      />
      <div className="page-shell">
        <AgencySection id="numbers" eyebrow={labels.stats} title={copy.statsTitle} align="center">
          <StatGrid stats={copy.stats} />
          <p className="agency-note agency-note--center">{copy.statsSource}</p>
        </AgencySection>
        <AgencySection id="problem" eyebrow={labels.pains} title={copy.painsTitle}>
          <NumberedGrid items={copy.pains} />
        </AgencySection>
        <ConnectedSystem
          id="system"
          eyebrow={home.connectedEyebrow}
          title={home.connectedTitle}
          intro={home.connectedIntro}
          points={home.connectedPoints}
          mock={home.mock}
        />
        <AgencySection
          id="services"
          eyebrow={labels.funnel}
          title={copy.funnelTitle}
          aside={
            <Link className="text-link" href="/services">
              {labels.allServices}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          }
        >
          <FunnelGrid stages={copy.funnel} />
        </AgencySection>
        <AgencySection id="proof" eyebrow={labels.proof} title={copy.proofTitle}>
          <ProofShowcase
            items={getProof(language, industry.proof)}
            caseStudy={home.caseStudy}
            tag={labels.otherIndustry}
          />
          <p className="agency-note">{copy.proofNote}</p>
        </AgencySection>
        <AgencySection
          id="pricing"
          eyebrow={home.pricingEyebrow}
          title={labels.pricingTitle}
          intro={labels.pricingIntro}
        >
          <PricingCalculator preset={industry.preset} />
        </AgencySection>
        <FaqSection eyebrow={home.faqEyebrow} title={home.faqTitle} items={[...copy.faq, ...home.faq]} />
        <div className="pb-16 md:pb-24">
          <AgencyCta
            eyebrow={home.ctaEyebrow}
            title={copy.ctaTitle}
            body={home.ctaBody}
            button={home.ctaButton}
          />
        </div>
      </div>
    </>
  );
}
