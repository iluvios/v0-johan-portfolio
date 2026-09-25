"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { Separator } from "@/components/ui/separator";
import {
  Reveal,
  ScrollArtwork,
  ScrollWorkItem,
} from "@/components/portfolio-motion";
import {
  Eyebrow,
  ProjectCard,
  ArticleRow,
  ContentLoading,
  ContentEmpty,
  ContactInvitation,
} from "@/components/portfolio-ui";
import { Badge } from "@/components/ui/badge";
import {
  usePortfolioCopy,
  useFeaturedProjects,
  useArticles,
} from "@/lib/portfolio";
import { STACK } from "@/lib/site";

function Hero() {
  const { copy, language } = usePortfolioCopy();
  return (
    <section className="hero" aria-labelledby="hero-heading">
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
          <Eyebrow>{copy.role}</Eyebrow>
          <h1 id="hero-heading" className="hero-title" lang={language}>
            {copy.hero.map((line, i) => (
              <span key={i} className={i === 2 ? "hero-last" : undefined}>
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-description">{copy.intro}</p>
          <div className="hero-actions">
            <GlowButton asChild>
              <Link href="#selected-work">
                {copy.work}
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </GlowButton>
            <Link href="/about" className="text-link">
              {copy.moreAbout}
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
          <a href="#selected-work" aria-label={copy.scroll}>
            <span className="scroll-label">{copy.scroll}</span>
            <ArrowDown size={20} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function SelectedWork() {
  const { copy } = usePortfolioCopy();
  const { data: projects, isLoading, error, mutate } = useFeaturedProjects();
  const selected = projects?.slice(0, 3) || [];
  const [activeId, setActiveId] = useState<number | null>(null);
  return (
    <section
      id="selected-work"
      className="section"
      aria-labelledby="work-heading"
    >
      <div className="work-layout">
        <aside className="work-aside">
          <Eyebrow>{copy.selected}</Eyebrow>
          <h2 id="work-heading" className="section-title">
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
                <ProjectCard project={project} index={i} showFeatured={false} />
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

function Proof() {
  const { copy } = usePortfolioCopy();
  return (
    <section className="section" aria-labelledby="proof-heading">
      <div className="section-heading">
        <div className="flex flex-col gap-4">
          <Eyebrow>{copy.proof}</Eyebrow>
          <h2 id="proof-heading" className="section-title">
            {copy.proofTitle}
          </h2>
        </div>
      </div>
      <Reveal>
        <dl className="proof-grid">
          {copy.metrics.map((metric) => (
            <div key={metric.value} className="proof-item">
              <dt className="proof-label">
                {metric.label}
                <span className="proof-context">{metric.context}</span>
              </dt>
              <dd className="proof-value">{metric.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <Link className="text-link mt-4" href="/about">
        {copy.proofCv}
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
      <div className="proof-stack">
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

function ServicesTeaser() {
  const { copy } = usePortfolioCopy();
  return (
    <section className="section" aria-labelledby="services-heading">
      <div className="section-heading">
        <div className="flex flex-col gap-4">
          <Eyebrow>{copy.servicesTeaserEyebrow}</Eyebrow>
          <h2 id="services-heading" className="section-title">
            {copy.servicesTeaserTitle}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            {copy.servicesTeaserBody}
          </p>
        </div>
        <Link className="text-link shrink-0" href="/services">
          {copy.servicesCta}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <Reveal>
        <div className="service-teaser-grid">
          {copy.services.map((service, i) => (
            <Link
              key={service.id}
              href={`/services#${service.id}`}
              className="service-teaser"
            >
              <span className="service-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{service.title}</h3>
              <p>{service.outcome}</p>
              <ArrowUpRight className="service-teaser-arrow" size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Perspective() {
  const { copy } = usePortfolioCopy();
  return (
    <section className="section">
      <Reveal className="perspective-layout">
        <Image
          className="perspective-portrait"
          src="/images/profile.jpeg"
          alt="Johan Alvarez"
          width={420}
          height={525}
          sizes="(max-width: 767px) 112px, 300px"
        />
        <div className="perspective-copy">
          <Eyebrow>{copy.perspective}</Eyebrow>
          <h2 className="perspective-statement">
            {copy.perspectiveStart}
            <br />
            <em>{copy.perspectiveEnd}</em>
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            {copy.perspectiveBody}
          </p>
          <Link className="text-link" href="/about">
            {copy.moreAbout}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// Only rendered once there are published articles to show.
function LatestWriting() {
  const { copy } = usePortfolioCopy();
  const { data: articles } = useArticles();
  if (!articles?.length) return null;
  return (
    <>
      <Separator />
      <section className="section">
        <div className="section-heading">
          <div className="flex flex-col gap-4">
            <Eyebrow>{copy.journal}</Eyebrow>
            <h2 className="section-title">{copy.journalTitle}</h2>
          </div>
          <Link className="text-link" href="/articles">
            {copy.allArticles}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {articles.slice(0, 2).map((article) => (
          <Reveal key={article.id}>
            <ArticleRow article={article} />
          </Reveal>
        ))}
      </section>
    </>
  );
}

export default function HomePortfolio() {
  return (
    <>
      <Hero />
      <div className="page-shell">
        <Separator />
        <SelectedWork />
        <Separator />
        <Proof />
        <Separator />
        <ServicesTeaser />
        <Separator />
        <Perspective />
        <LatestWriting />
        <div className="pb-16 md:pb-24">
          <ContactInvitation />
        </div>
      </div>
    </>
  );
}
