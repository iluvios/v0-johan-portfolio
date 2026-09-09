"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Download, Mail, MapPin, Phone, Printer, FileText } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";
import { cvCopy, cvExperience, cvSkills, type CvLanguage } from "@/lib/cv";

const cvFile = "/johan-alvarez-cv.pdf";

function CvHeader({ language }: { language: CvLanguage }) {
  const copy = cvCopy[language];
  return (
    <header className="cv-header" id="cv-top">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium tracking-widest text-accent uppercase">{copy.label}</p>
        <p className="text-sm text-muted-foreground">2026</p>
      </div>
      <div className="cv-identity">
        <Image src="/images/profile.jpeg" alt="Johan Alvarez" width={160} height={192} sizes="(max-width: 639px) 88px, 144px" className="cv-portrait" priority />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="cv-name text-balance">Johan Alvarez<span className="text-accent">.</span></h1>
            <p className="text-xl font-medium text-accent sm:text-2xl">{copy.role}</p>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">{copy.intro}</p>
          <div className="cv-contact-links">
            <span><MapPin size={16} aria-hidden="true" />Medellín, Colombia</span>
            <a href="mailto:contact@asjohan.com"><Mail size={16} aria-hidden="true" />contact@asjohan.com</a>
            <a href="tel:+573184064960"><Phone size={16} aria-hidden="true" />+57 318 406 4960</a>
          </div>
        </div>
      </div>
      <div className="cv-actions">
        <div className="flex flex-wrap items-center gap-3">
          <GlowButton asChild><a href={cvFile} download="Johan-Alvarez-CV-2026.pdf"><Download data-icon="inline-start" aria-hidden="true" />{copy.download}</a></GlowButton>
          <GlowButton variant="outline" onClick={() => window.print()}><Printer data-icon="inline-start" aria-hidden="true" />{copy.print}</GlowButton>
          <GlowButton asChild variant="outline">
            <Link href="/cv">
              <FileText data-icon="inline-start" aria-hidden="true" />
              {language === "en" ? "Executive 2-Page CV" : "CV Ejecutivo (2 Págs)"}
            </Link>
          </GlowButton>
          <a className="cv-linkedin" href="https://linkedin.com/in/johanalvarez" target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">{language === "en" ? " (opens in a new tab)" : " (abre en otra pestaña)"}</span></a>
        </div>
        <span className="text-sm text-muted-foreground">{copy.pdfNote}</span>
      </div>
    </header>
  );
}

function CvNavigation({ language }: { language: CvLanguage }) {
  const copy = cvCopy[language];
  const sections = [["profile", copy.overview], ["experience", copy.experience], ["skills", copy.skills], ["education", copy.education], ["languages", copy.languages]];
  return (
    <aside className="cv-aside">
      <nav aria-label={copy.navigation}>
        <p className="cv-nav-label text-sm text-muted-foreground">{copy.navigation}</p>
        <div className="cv-nav-links">
          {sections.map(([id, label]) => <a key={id} href={`#cv-${id}`}>{label}</a>)}
        </div>
      </nav>
      <a className="cv-back-link text-sm text-muted-foreground" href="#cv-top">{copy.back}<ArrowUp size={16} aria-hidden="true" /></a>
    </aside>
  );
}

function CvExperience({ language }: { language: CvLanguage }) {
  const copy = cvCopy[language];
  return (
    <section id="cv-experience" aria-labelledby="cv-experience-title" className="cv-section">
      <div className="flex flex-col gap-2">
        <h2 id="cv-experience-title">{copy.experience}</h2>
        <p className="text-base text-muted-foreground">{copy.experienceNote}</p>
      </div>
      <div className="cv-job-list">
        {cvExperience.map((job, index) => (
          <article key={`${job.company}-${index}`} className="cv-job">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-medium text-accent">{job.company}</p>
                <p className="text-sm tabular-nums text-muted-foreground">{job.period[language]}</p>
              </div>
              <h3 className="text-xl font-medium leading-snug sm:text-2xl">{job.role[language]}</h3>
              {index === 0 && <span className="sr-only">{copy.latest}</span>}
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">{job.summary[language]}</p>
            <ul className="cv-achievements">
              {job.achievements[language].map((achievement) => <li key={achievement}>{achievement}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function CvSkills({ language }: { language: CvLanguage }) {
  const copy = cvCopy[language];
  return (
    <section id="cv-skills" aria-labelledby="cv-skills-title" className="cv-section">
      <div className="flex flex-col gap-2">
        <h2 id="cv-skills-title">{copy.skills}</h2>
        <p className="text-base text-muted-foreground">{copy.skillsNote}</p>
      </div>
      <div className="cv-skill-groups">
        {cvSkills.map((group) => (
          <div key={group.title.en} className="cv-skill-group">
            <h3 className="text-xl font-medium">{group.title[language]}</h3>
            <p className="text-base leading-relaxed text-muted-foreground">{group.description[language]}</p>
            <div className="flex flex-wrap gap-2">{group.tools.map((tool) => <Badge variant="tag" key={tool}>{tool}</Badge>)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CvEducation({ language }: { language: CvLanguage }) {
  const copy = cvCopy[language];
  return (
    <section id="cv-education" aria-labelledby="cv-education-title" className="cv-section">
      <h2 id="cv-education-title">{copy.education}</h2>
      <article className="flex flex-col gap-3">
        <div className="flex flex-wrap justify-between gap-2">
          <p className="font-medium text-accent">Universidad EAFIT</p>
          <p className="text-sm text-muted-foreground">2016 — 2022</p>
        </div>
        <h3 className="text-xl font-medium leading-snug">{copy.business}</h3>
        <p className="text-sm text-muted-foreground">Medellín, Colombia</p>
        <p className="text-base text-muted-foreground">{copy.scholarship}</p>
      </article>
      <Separator />
      <article className="flex flex-col gap-3">
        <div className="flex flex-wrap justify-between gap-2">
          <p className="font-medium text-accent">SENA</p>
          <p className="text-sm text-muted-foreground">2014 — 2015</p>
        </div>
        <h3 className="text-xl font-medium leading-snug">{copy.design}</h3>
        <p className="text-sm text-muted-foreground">Medellín, Colombia</p>
      </article>
    </section>
  );
}

export default function AboutPortfolio() {
  const { language } = useLanguage();
  const copy = cvCopy[language];
  return (
    <div className="page-shell cv-page font-sans">
      <CvHeader language={language} />
      <Separator />
      <div className="cv-layout">
        <CvNavigation language={language} />
        <div className="cv-content">
          <section id="cv-profile" aria-labelledby="cv-profile-title" className="cv-section">
            <h2 id="cv-profile-title">{copy.overview}</h2>
            <div className="flex flex-col gap-4">{copy.summary.map((paragraph) => <p key={paragraph} className="text-base leading-relaxed text-muted-foreground">{paragraph}</p>)}</div>
          </section>
          <Separator />
          <CvExperience language={language} />
          <Separator />
          <CvSkills language={language} />
          <Separator />
          <CvEducation language={language} />
          <Separator />
          <section id="cv-languages" aria-labelledby="cv-languages-title" className="cv-section">
            <h2 id="cv-languages-title">{copy.languages}</h2>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-2"><h3 className="text-xl font-medium">{copy.english}</h3><p className="text-sm text-muted-foreground">{copy.certification}</p></div>
              <span className="text-base text-accent">{copy.proficiency}</span>
            </div>
          </section>
          <section className="cv-contact" aria-labelledby="cv-contact-title">
            <div className="flex flex-col gap-3"><h2 id="cv-contact-title" className="text-2xl font-medium">{copy.contactTitle}</h2><p className="text-base text-muted-foreground">{copy.contactText}</p></div>
            <GlowButton asChild><a href="mailto:contact@asjohan.com">{copy.contactAction}<ArrowUpRight data-icon="inline-end" aria-hidden="true" /></a></GlowButton>
          </section>
        </div>
      </div>
    </div>
  );
}
