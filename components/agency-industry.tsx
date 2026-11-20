"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AgencyHero } from "@/components/agency-home";
import PricingCalculator from "@/components/agency/pricing-calculator";
import {
  AgencyCta,
  AgencySection,
  FaqList,
  FunnelGrid,
  NumberedGrid,
  ProofGrid,
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
        scroll={home.scroll}
        scrollTarget="numbers"
      />
      <div className="page-shell">
        <Separator />
        <AgencySection id="numbers" eyebrow={labels.stats} title={copy.statsTitle}>
          <StatGrid stats={copy.stats} />
          <p className="agency-note">{copy.statsSource}</p>
        </AgencySection>
        <Separator />
        <AgencySection id="problem" eyebrow={labels.pains} title={copy.painsTitle}>
          <NumberedGrid items={copy.pains} />
        </AgencySection>
        <Separator />
        <AgencySection
          id="services"
          eyebrow={labels.funnel}
          title={copy.funnelTitle}
          aside={
            <Link className="text-link" href="/#services">
              {labels.allServices}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          }
        >
          <FunnelGrid stages={copy.funnel} />
        </AgencySection>
        <Separator />
        <AgencySection id="ai" eyebrow={home.aiEyebrow} title={home.aiTitle} intro={home.aiIntro}>
          <NumberedGrid items={home.ai} />
          <p className="agency-note">{home.aiNote}</p>
        </AgencySection>
        <Separator />
        <AgencySection id="proof" eyebrow={labels.proof} title={copy.proofTitle}>
          <ProofGrid
            items={getProof(language, industry.proof)}
            caseStudy={home.caseStudy}
            tag={labels.otherIndustry}
          />
          <p className="agency-note">{copy.proofNote}</p>
        </AgencySection>
        <Separator />
        <AgencySection
          id="pricing"
          eyebrow={home.pricingEyebrow}
          title={labels.pricingTitle}
          intro={labels.pricingIntro}
        >
          <PricingCalculator preset={industry.preset} />
        </AgencySection>
        <Separator />
        <AgencySection id="faq" eyebrow={home.faqEyebrow} title={home.faqTitle}>
          <FaqList items={[...copy.faq, ...home.faq]} />
        </AgencySection>
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
