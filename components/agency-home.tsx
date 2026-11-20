"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/portfolio-motion";
import { AgencyHero } from "@/components/agency/hero";
import PricingCalculator from "@/components/agency/pricing-calculator";
import {
  AgencyCta,
  AgencySection,
  FaqList,
  FunnelGrid,
  NumberedGrid,
  ProofGrid,
} from "@/components/agency/sections";
import { useLanguage } from "@/contexts/language-context";
import { agencyHomeCopy, getProof } from "@/lib/agency/copy";
import { INDUSTRIES, INDUSTRY_SLUGS } from "@/lib/agency/industries";

export default function AgencyHome() {
  const { language } = useLanguage();
  const copy = agencyHomeCopy[language];
  return (
    <>
      <AgencyHero
        eyebrow={copy.eyebrow}
        hero={copy.hero}
        intro={copy.intro}
        primaryCta={copy.primaryCta}
        secondaryCta={copy.secondaryCta}
        facts={copy.facts}
        toolsLabel={copy.toolsLabel}
      />
      <div className="page-shell">
        <Separator />
        <AgencySection id="problem" eyebrow={copy.problemEyebrow} title={copy.problemTitle}>
          <NumberedGrid items={copy.problems} />
        </AgencySection>
        <Separator />
        <AgencySection id="services" eyebrow={copy.funnelEyebrow} title={copy.funnelTitle}>
          <FunnelGrid stages={copy.funnel} />
        </AgencySection>
        <Separator />
        <AgencySection id="ai" eyebrow={copy.aiEyebrow} title={copy.aiTitle} intro={copy.aiIntro}>
          <NumberedGrid items={copy.ai} />
          <p className="agency-note">{copy.aiNote}</p>
        </AgencySection>
        <Separator />
        <AgencySection id="proof" eyebrow={copy.proofEyebrow} title={copy.proofTitle}>
          <ProofGrid
            items={getProof(language, ["revy", "autobruder", "rainforest", "bi", "nurses", "tecno"])}
            caseStudy={copy.caseStudy}
          />
          <p className="agency-note">{copy.proofNote}</p>
        </AgencySection>
        <Separator />
        <AgencySection id="industries" eyebrow={copy.industriesEyebrow} title={copy.industriesTitle}>
          <div className="agency-industries">
            {INDUSTRY_SLUGS.map((slug) => {
              const industry = INDUSTRIES[slug].copy[language];
              return (
                <Reveal key={slug}>
                  <Link href={`/industries/${slug}`} className="service-teaser h-full">
                    <ArrowUpRight size={18} className="service-teaser-arrow" aria-hidden="true" />
                    <h3>{industry.name}</h3>
                    <p>{industry.teaser}</p>
                    <span className="mt-auto pt-3 text-sm font-medium text-accent">
                      {copy.industriesLink}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </AgencySection>
        <Separator />
        <AgencySection id="process" eyebrow={copy.processEyebrow} title={copy.processTitle}>
          <NumberedGrid items={copy.process} />
        </AgencySection>
        <Separator />
        <AgencySection
          id="pricing"
          eyebrow={copy.pricingEyebrow}
          title={copy.pricingTitle}
          intro={copy.pricingIntro}
        >
          <PricingCalculator />
        </AgencySection>
        <Separator />
        <AgencySection id="faq" eyebrow={copy.faqEyebrow} title={copy.faqTitle}>
          <FaqList items={copy.faq} />
        </AgencySection>
        <div className="pb-16 md:pb-24">
          <AgencyCta
            eyebrow={copy.ctaEyebrow}
            title={copy.ctaTitle}
            body={copy.ctaBody}
            button={copy.ctaButton}
          />
        </div>
      </div>
    </>
  );
}
