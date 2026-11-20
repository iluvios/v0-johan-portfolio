"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/portfolio-motion";
import { AgencyHero } from "@/components/agency/hero";
import {
  AgencyCta,
  AgencySection,
  ConnectedSystem,
  FaqSection,
  FitSection,
  FunnelGrid,
  IconCards,
  Pillars,
  PlanCards,
  ProofShowcase,
  StatBand,
  Steps,
  TeamRow,
} from "@/components/agency/sections";
import { useLanguage } from "@/contexts/language-context";
import { agencyHomeCopy, getProof } from "@/lib/agency/copy";
import { INDUSTRIES, INDUSTRY_SLUGS } from "@/lib/agency/industries";

// Each section answers the buyer's next question, in order:
// what is it, is it for me, why am I losing customers, what do I get, how does it
// work together, why you, can you prove it, does it fit my industry, how do I start,
// how much, what about my doubts, what's next.
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
        proofLabel={copy.proofLabel}
        proof={copy.proofStrip}
      />
      <div className="page-shell">
        <FitSection
          eyebrow={copy.fitEyebrow}
          title={copy.fitTitle}
          intro={copy.fitIntro}
          listTitle={copy.fitListTitle}
          list={copy.fitList}
        />

        <AgencySection id="problem" eyebrow={copy.statsEyebrow} title={copy.statsTitle} align="center">
          <StatBand intro={copy.statsIntro} stats={copy.stats} source={copy.statsSource} />
          <IconCards items={copy.problems} />
        </AgencySection>

        <AgencySection
          id="services"
          eyebrow={copy.funnelEyebrow}
          title={copy.funnelTitle}
          intro={copy.funnelIntro}
        >
          <FunnelGrid stages={copy.funnel} />
        </AgencySection>

        <ConnectedSystem
          id="system"
          eyebrow={copy.connectedEyebrow}
          title={copy.connectedTitle}
          intro={copy.connectedIntro}
          points={copy.connectedPoints}
          mock={copy.mock}
        />

        <AgencySection
          id="why"
          eyebrow={copy.pillarsEyebrow}
          title={copy.pillarsTitle}
          intro={copy.pillarsIntro}
          align="center"
        >
          <TeamRow language={language} />
          <p className="agency-pillars-tagline">{copy.pillarsTagline}</p>
          <Pillars items={copy.pillars} language={language} />
        </AgencySection>

        <AgencySection id="proof" eyebrow={copy.proofEyebrow} title={copy.proofTitle}>
          <ProofShowcase
            items={getProof(language, ["revy", "autobruder", "rainforest", "bi", "nurses", "tecno"])}
            caseStudy={copy.caseStudy}
          />
          <p className="agency-note">{copy.proofNote}</p>
        </AgencySection>

        <AgencySection id="industries" eyebrow={copy.industriesEyebrow} title={copy.industriesTitle}>
          <div className="agency-industries">
            {INDUSTRY_SLUGS.map((slug, i) => {
              const industry = INDUSTRIES[slug].copy[language];
              return (
                <Reveal key={slug} delay={i * 0.07}>
                  <Link href={`/industries/${slug}`} className="agency-card agency-card--link h-full">
                    <ArrowUpRight size={18} className="agency-card-arrow" aria-hidden="true" />
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

        <AgencySection id="process" eyebrow={copy.processEyebrow} title={copy.processTitle} align="center">
          <Steps items={copy.process} />
        </AgencySection>

        <AgencySection
          id="pricing"
          eyebrow={copy.pricingEyebrow}
          title={copy.pricingTitle}
          intro={copy.pricingIntro}
          align="center"
        >
          <PlanCards copy={copy} />
        </AgencySection>

        <FaqSection eyebrow={copy.faqEyebrow} title={copy.faqTitle} items={copy.faq} />

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
