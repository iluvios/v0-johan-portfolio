"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { Separator } from "@/components/ui/separator";
import { Reveal, ScrollArtwork } from "@/components/portfolio-motion";
import {
  Eyebrow,
  ProjectCard,
  ArticleRow,
  ContentLoading,
  ContentEmpty,
  ContactInvitation,
} from "@/components/portfolio-ui";
import { usePortfolioCopy, useProjects, useArticles } from "@/lib/portfolio";
import { DEFAULT_CV_DATA, getCVData } from "@/lib/profile-data";
import { CLIENTS } from "@/lib/site";

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

function Clients() {
  const { copy } = usePortfolioCopy();
  return (
    <section className="clients-strip" aria-label={copy.workedWith}>
      <p className="eyebrow">{copy.workedWith}</p>
      <ul>
        {CLIENTS.map((client) => (
          <li key={client}>{client}</li>
        ))}
      </ul>
    </section>
  );
}

function Offer() {
  const { copy } = usePortfolioCopy();
  return (
    <section className="section" aria-labelledby="offer-heading">
      <div className="flex flex-col gap-4">
        <Eyebrow>{copy.offer}</Eyebrow>
        <h2 id="offer-heading" className="section-title max-w-3xl">
          {copy.offerTitle}
        </h2>
      </div>
      <ul className="offer-grid">
        {copy.offers.map((item) => (
          <li key={item.title} className="offer-item">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <p className="offer-tools">{item.tools}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// The first six public projects with a full case study, in the order set in the admin.
function SelectedWork() {
  const { copy } = usePortfolioCopy();
  const { data: projects, isLoading, error, mutate } = useProjects();
  const selected =
    projects?.filter((p) => p.case_study?.metrics?.length).slice(0, 6) || [];
  return (
    <section
      id="selected-work"
      className="section"
      aria-labelledby="work-heading"
    >
      <div className="section-heading">
        <div className="flex flex-col gap-4">
          <Eyebrow>{copy.selected}</Eyebrow>
          <h2 id="work-heading" className="section-title max-w-3xl">
            {copy.workTitle}
          </h2>
        </div>
        <Link className="text-link" href="/projects">
          {copy.allWork}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      {isLoading ? (
        <ContentLoading detail />
      ) : error ? (
        <ContentEmpty error onReset={() => mutate()} />
      ) : selected.length ? (
        <div className="home-work-grid">
          {selected.map((project) => (
            <Reveal key={project.id}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      ) : (
        <ContentEmpty />
      )}
    </section>
  );
}

// The CV is written in English; its dates read naturally in Spanish with these swaps.
const ES_MONTHS: Record<string, string> = {
  Jan: "Ene", Feb: "Feb", Mar: "Mar", Apr: "Abr", May: "May", Jun: "Jun",
  June: "Jun", Jul: "Jul", Aug: "Ago", Sep: "Sep", Oct: "Oct", Nov: "Nov", Dec: "Dic",
};
function localizePeriod(period: string, language: string) {
  if (language !== "es") return period;
  return period
    .replace(/\b(Jan|Feb|Mar|Apr|May|June|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (m) => ES_MONTHS[m])
    .replace(" to Present", " a hoy")
    .replace(" to ", " a ");
}

// Roles straight from the live CV, so the home never drifts from it.
function Experience() {
  const { copy, language } = usePortfolioCopy();
  const [cv, setCv] = useState(DEFAULT_CV_DATA);
  useEffect(() => {
    getCVData().then(setCv);
  }, []);
  const roles = cv.experiences.filter((e) => !/software developer/i.test(e.role));
  return (
    <section className="section" aria-labelledby="experience-heading">
      <div className="section-heading">
        <div className="flex flex-col gap-4">
          <Eyebrow>{copy.experience}</Eyebrow>
          <h2 id="experience-heading" className="section-title max-w-3xl">
            {copy.experienceTitle}
          </h2>
        </div>
        <Link className="text-link" href="/about">
          {copy.moreAbout}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <ul className="home-experience">
        {roles.map((exp) => (
          <li key={`${exp.company}-${exp.period}`}>
            <span className="home-experience-period">
              {localizePeriod(exp.period, language)}
            </span>
            <span className="home-experience-role">
              {exp.role}
              <span> · {exp.company}</span>
            </span>
          </li>
        ))}
      </ul>
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
          src="/images/johan-portrait.webp"
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
        <Clients />
        <Separator />
        <Offer />
        <Separator />
        <SelectedWork />
        <Separator />
        <Experience />
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
