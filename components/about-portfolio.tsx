"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";
import { usePortfolioCopy } from "@/lib/portfolio";
import { Eyebrow, ContactInvitation } from "@/components/portfolio-ui";
import { Reveal } from "@/components/portfolio-motion";

export default function AboutPortfolio() {
  const { t } = useLanguage();
  const { copy, language } = usePortfolioCopy();
  const jobs = [
    {
      company: t.about.work.pvragon.company,
      role: t.about.work.pvragon.role,
      period: t.about.work.pvragon.period,
      description: t.about.work.pvragon.achievements[0],
      details: t.about.work.pvragon.achievements.slice(1),
    },
    {
      company: language === "en" ? "Independent" : "Independiente",
      role: t.about.work.independent.company,
      period: t.about.work.independent.period,
      description: t.about.work.independent.description,
      details: t.about.work.independent.achievements,
    },
    {
      company: "Grandpa Devs",
      role: t.about.work.grandpaDevs.company,
      period: t.about.work.grandpaDevs.period,
      description: t.about.work.grandpaDevs.achievements[2],
      details: t.about.work.grandpaDevs.achievements.filter((_, i) => i !== 2),
    },
  ];
  const tools = [
    ["Google Analytics", "Google Ads", "A/B Testing"],
    ["HubSpot", "Salesforce", "SQL"],
    ["React", "Next.js", "JavaScript"],
  ];
  return (
    <div className="page-shell">
      <section className="about-hero">
        <div className="about-hero-copy">
          <Eyebrow>{copy.perspective}</Eyebrow>
          <h1 className="page-title">{copy.aboutTitle}</h1>
          <p className="page-description">{copy.aboutIntro}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={16} aria-hidden="true" />
            {t.about.location}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <GlowButton asChild>
              <Link href="/contact">
                {copy.talk}
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </GlowButton>
            <a
              href="https://linkedin.com/in/johanalvarez"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              LinkedIn
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
        <Image
          src="/images/profile.jpeg"
          alt="Johan Alvarez"
          width={640}
          height={800}
          sizes="(max-width: 767px) 100vw, 420px"
          className="about-portrait"
          priority
        />
      </section>
      <Separator />
      <section className="section experience-layout">
        <div className="experience-label flex flex-col gap-5">
          <Eyebrow>{copy.experience}</Eyebrow>
          <h2 className="section-title">
            {language === "en" ? "A connected path." : "Un camino conectado."}
          </h2>
          <p className="max-w-sm text-base text-muted-foreground">
            {copy.aboutBody}
          </p>
        </div>
        <div className="experience-list">
          {jobs.map((job) => (
            <Reveal key={job.company}>
              <article className="experience-item">
                <p className="text-sm text-muted-foreground">{job.period}</p>
                <div className="flex flex-col gap-2">
                  <h3>{job.company}</h3>
                  <p className="text-base text-accent">{job.role}</p>
                </div>
                <p className="max-w-xl text-base text-muted-foreground">
                  {job.description}
                </p>
                <details>
                  <summary>{copy.experienceMore}</summary>
                  <ul className="flex list-disc flex-col gap-2 py-3 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {job.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </details>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <Separator />
      <section className="section">
        <div className="section-heading">
          <div className="flex flex-col gap-4">
            <Eyebrow>{copy.expertise}</Eyebrow>
            <h2 className="section-title">
              {language === "en"
                ? "Different tools. One mindset."
                : "Distintas herramientas. Una visión."}
            </h2>
          </div>
        </div>
        <div className="expertise-grid">
          {copy.expertiseTitles.map((title, i) => (
            <Reveal key={title}>
              <div className="flex flex-col gap-5">
                <h3>{title}</h3>
                <p className="text-base text-muted-foreground">
                  {copy.expertiseCopy[i]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tools[i].map((tool) => (
                    <Badge key={tool} variant="tag">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <Separator />
      <section className="section experience-layout">
        <div className="experience-label">
          <Eyebrow>{copy.education}</Eyebrow>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <h2 className="text-3xl font-medium">{t.about.edu.degree}</h2>
          <p className="text-base text-accent">{t.about.edu.institution}</p>
          <p className="text-sm text-muted-foreground">
            {t.about.edu.period} · {t.about.edu.location}
          </p>
          <ul className="flex flex-col gap-2 text-base text-muted-foreground">
            {t.about.edu.achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <div className="pb-16 md:pb-24">
        <ContactInvitation />
      </div>
    </div>
  );
}
