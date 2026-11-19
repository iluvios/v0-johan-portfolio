"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Reveal,
  ScrollArtwork,
  ScrollWorkItem,
} from "@/components/portfolio-motion";
import {
  Eyebrow,
  ProjectCard,
  ContentLoading,
  ContentEmpty,
  ContactInvitation,
} from "@/components/portfolio-ui";
import {
  useAgencyCopy,
  usePortfolioCopy,
  useFeaturedProjects,
} from "@/lib/portfolio";
import { STACK } from "@/lib/site";

function AgencyHero() {
  const { copy, language } = useAgencyCopy();
  return (
    <section className="hero" aria-labelledby="agency-hero-heading">
      <div className="page-shell hero-inner">
        <ScrollArtwork className="hero-artwork">
          <Image
            src="/images/glass-aperture.png"
            alt=""
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 767px) 610px, 1000px"
          />
        </ScrollArtwork>
        <div className="hero-copy">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h1 id="agency-hero-heading" className="hero-title" lang={language}>
            {copy.hero.map((line, i) => (
              <span key={i} className={i === 2 ? "hero-last" : undefined}>
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-description">{copy.intro}</p>
          <div className="hero-actions">
            <GlowButton asChild>
              <Link href="/contact">
                {copy.primaryCta}
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </GlowButton>
            <Link href="#selected-work" className="text-link">
              {copy.secondaryCta}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="hero-bottom">
          <ul className="hero-facts">
            {copy.facts.map((item, i) => (
              <li key={item}>
                {i === 0 && <span className="status-dot" aria-hidden="true" />}
                {item}
              </li>
            ))}
          </ul>
          <a href="#capabilities" aria-label={copy.scroll}>
            <span className="scroll-label">{copy.scroll}</span>
            <ArrowDown size={20} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const { copy } = useAgencyCopy();
  return (
    <section
      id="capabilities"
      className="section"
      aria-labelledby="capabilities-heading"
    >
      <div className="section-heading">
        <div className="flex flex-col gap-4">
          <Eyebrow>{copy.capabilitiesEyebrow}</Eyebrow>
          <h2 id="capabilities-heading" className="section-title">
            {copy.capabilitiesTitle}
          </h2>
        </div>
        <Link className="text-link" href="/services">
          {copy.capabilitiesLink}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {copy.capabilities.map((item) => (
          <Reveal key={item.index}>
            <Link href="/services" className="service-teaser h-full">
              <span className="service-index">{item.index}</span>
              <ArrowUpRight
                size={18}
                className="service-teaser-arrow"
                aria-hidden="true"
              />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {item.deliverables.map((deliverable) => (
                  <li key={deliverable}>
                    <Badge variant="tag">{deliverable}</Badge>
                  </li>
                ))}
              </ul>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SelectedClientWork() {
  const { copy } = usePortfolioCopy();
  const { data: projects, isLoading, error, mutate } = useFeaturedProjects();
  const selected = projects?.slice(0, 3) || [];
  const [activeId, setActiveId] = useState<number | null>(null);
  return (
    <section
      id="selected-work"
      className="section"
      aria-labelledby="agency-work-heading"
    >
      <div className="work-layout">
        <aside className="work-aside">
          <Eyebrow>{copy.selected}</Eyebrow>
          <h2 id="agency-work-heading" className="section-title">
            {copy.workTitle}
          </h2>
          <nav className="work-index" aria-label={copy.selected}>
            {selected.map((project, i) => (
              <a
                key={project.id}
                href={`#work-${project.id}`}
                aria-current={
                  (activeId ?? selected[0]?.id) === project.id
                    ? "location"
                    : undefined
                }
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{project.title}</span>
              </a>
            ))}
          </nav>
          <Link className="text-link" href="/projects">
            {copy.allWork}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </aside>
        <div className="work-list">
          {isLoading ? (
            <ContentLoading detail />
          ) : error ? (
            <ContentEmpty error onReset={() => mutate()} />
          ) : selected.length ? (
            selected.map((project, i) => (
              <ScrollWorkItem
                key={project.id}
                onEnter={() => setActiveId(project.id)}
              >
                <ProjectCard project={project} index={i} />
              </ScrollWorkItem>
            ))
          ) : (
            <ContentEmpty />
          )}
        </div>
      </div>
    </section>
  );
}

function Process() {
  const { copy } = useAgencyCopy();
  return (
    <section className="section" aria-labelledby="process-heading">
      <div className="section-heading">
        <div className="flex flex-col gap-4">
          <Eyebrow>{copy.processEyebrow}</Eyebrow>
          <h2 id="process-heading" className="section-title">
            {copy.processTitle}
          </h2>
        </div>
      </div>
      <div className="process-grid">
        {copy.process.map((step) => (
          <Reveal key={step.index} className="process-step">
            <span className="service-index">{step.index}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function AgencyStack() {
  const { copy } = usePortfolioCopy();
  return (
    <section className="section" aria-label={copy.stackLabel}>
      <div className="flex flex-col gap-4">
        <p className="eyebrow">{copy.stackLabel}</p>
        <ul className="flex flex-wrap gap-2">
          {STACK.map((tool) => (
            <li key={tool}>
              <Badge variant="tag">{tool}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function AgencyHome() {
  return (
    <>
      <AgencyHero />
      <div className="page-shell">
        <Separator />
        <Capabilities />
        <Separator />
        <SelectedClientWork />
        <Separator />
        <Process />
        <Separator />
        <AgencyStack />
        <div className="pb-16 md:pb-24">
          <ContactInvitation />
        </div>
      </div>
    </>
  );
}
