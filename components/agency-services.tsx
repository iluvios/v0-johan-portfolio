"use client";

import { Separator } from "@/components/ui/separator";
import { PageIntro } from "@/components/portfolio-ui";
import PricingCalculator from "@/components/agency/pricing-calculator";
import {
  AgencyCta,
  AgencySection,
  FaqList,
  FunnelGrid,
  NumberedGrid,
} from "@/components/agency/sections";
import { useLanguage } from "@/contexts/language-context";
import { agencyHomeCopy } from "@/lib/agency/copy";

const INTRO = {
  en: {
    eyebrow: "Services",
    title: "Your whole funnel, built and run by one team.",
    description:
      "Most businesses split ads, social media, websites, email and tracking across separate vendors, with nobody answering leads at night. We set up the whole system once, AI assistants included, then run and improve it every month.",
  },
  es: {
    eyebrow: "Servicios",
    title: "Todo tu embudo, construido y operado por un solo equipo.",
    description:
      "La mayoría de negocios reparte pauta, redes sociales, sitio web, email y medición entre proveedores distintos, y nadie responde a los leads de noche. Montamos todo el sistema una vez, con asistentes de IA incluidos, y luego lo operamos y mejoramos cada mes.",
  },
};

export default function AgencyServices() {
  const { language } = useLanguage();
  const copy = agencyHomeCopy[language];
  const intro = INTRO[language];

  return (
    <div className="page-shell">
      <PageIntro eyebrow={intro.eyebrow} title={intro.title} description={intro.description} />
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
  );
}
