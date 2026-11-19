"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/portfolio-motion";
import {
  Eyebrow,
  PageIntro,
  ContactInvitation,
} from "@/components/portfolio-ui";
import { useAgencyCopy } from "@/lib/portfolio";

export default function AgencyServices() {
  const { copy } = useAgencyCopy();
  const page = copy.servicesPage;

  return (
    <div className="page-shell">
      <PageIntro
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
      />

      <Separator />

      <section className="section" aria-labelledby="services-capabilities">
        <div className="section-heading">
          <div className="flex flex-col gap-4">
            <Eyebrow>{copy.capabilitiesEyebrow}</Eyebrow>
            <h2 id="services-capabilities" className="section-title">
              {copy.capabilitiesTitle}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {copy.capabilities.map((item) => (
            <Reveal key={item.index}>
              <article className="service-teaser h-full">
                <span className="service-index">{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {item.deliverables.map((deliverable) => (
                    <li key={deliverable}>
                      <Badge variant="tag">{deliverable}</Badge>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <Separator />

      <section className="section" aria-labelledby="engagement-models">
        <div className="section-heading">
          <div className="flex flex-col gap-4">
            <Eyebrow>{page.modelsEyebrow}</Eyebrow>
            <h2 id="engagement-models" className="section-title">
              {page.modelsTitle}
            </h2>
          </div>
        </div>
        <div className="process-grid">
          {page.models.map((model) => (
            <Reveal key={model.index} className="process-step justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="service-index">{model.index}</span>
                  <Badge variant="tag">{model.tag}</Badge>
                </div>
                <h3>{model.name}</h3>
                <p>{model.description}</p>
                <p className="text-xs leading-relaxed text-accent/90">
                  {model.fit}
                </p>
              </div>
              <div className="pt-4">
                <Link href="/contact" className="text-link">
                  {page.startCta}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="pb-16 md:pb-24">
        <ContactInvitation />
      </div>
    </div>
  );
}
