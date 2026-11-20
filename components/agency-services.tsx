"use client";

import { PageIntro } from "@/components/portfolio-ui";
import PricingCalculator from "@/components/agency/pricing-calculator";
import {
  AgencyCta,
  AgencySection,
  ConnectedSystem,
  FaqSection,
  FunnelGrid,
  Pillars,
  TeamRow,
} from "@/components/agency/sections";
import { useLanguage } from "@/contexts/language-context";
import { agencyHomeCopy } from "@/lib/agency/copy";
import type { PlanInput } from "@/lib/agency/pricing";

const INTRO = {
  en: {
    eyebrow: "Services and pricing",
    title: "Your whole funnel, built and run by one team.",
    description:
      "Ads, website, social media, email, chat and CRM, set up once as one connected system, then run and improved every month. Pick what you need below and see the price right away.",
  },
  es: {
    eyebrow: "Servicios y precios",
    title: "Todo tu embudo, construido y operado por un solo equipo.",
    description:
      "Pauta, sitio web, redes, email, chat y CRM, montados una vez como un solo sistema conectado y luego operados y mejorados cada mes. Elige lo que necesitas abajo y mira el precio al instante.",
  },
};

export default function AgencyServices({ preset }: { preset?: Omit<PlanInput, "payment"> }) {
  const { language } = useLanguage();
  const copy = agencyHomeCopy[language];
  const intro = INTRO[language];

  return (
    <div className="page-shell">
      <PageIntro eyebrow={intro.eyebrow} title={intro.title} description={intro.description} />
      <AgencySection
        id="pricing"
        eyebrow={copy.pricingEyebrow}
        title={copy.pricingTitleFull}
        intro={copy.pricingIntroFull}
      >
        <PricingCalculator preset={preset} />
      </AgencySection>
      <AgencySection id="services" eyebrow={copy.funnelEyebrow} title={copy.funnelTitle}>
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
  );
}
