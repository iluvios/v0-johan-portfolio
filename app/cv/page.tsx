"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Download, Edit3, Linkedin, Mail, MapPin, Phone, Share2 } from "lucide-react"
import { GlowButton } from "@/components/ui/glow-button"
import { useLanguage } from "@/contexts/language-context"
import { getCVData, DEFAULT_CV_DATA, type CVProfile } from "@/lib/profile-data"

const toolbarCopy = {
  en: { back: "Back to portfolio", edit: "Edit in admin", share: "Share", copied: "Link copied", print: "Download PDF" },
  es: { back: "Volver al portafolio", edit: "Editar en admin", share: "Compartir", copied: "Enlace copiado", print: "Descargar PDF" },
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-6 border-b border-border pb-3 text-xs font-medium uppercase tracking-[0.13em] text-muted-foreground print:mb-3 print:border-slate-300 print:pb-1.5 print:text-slate-600">
      {children}
    </h2>
  )
}

export default function CVPage() {
  const { language } = useLanguage()
  const t = toolbarCopy[language]
  const [cv, setCv] = useState<CVProfile>(DEFAULT_CV_DATA)
  const [copied, setCopied] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    getCVData().then(setCv)
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data.authenticated)))
      .catch(() => {})
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${cv.name} — CV`, text: `${cv.name} | ${cv.title}`, url: window.location.href })
        return
      } catch {
        // Fall back to copying the link
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {}
  }

  const contacts = [
    { icon: Phone, label: cv.phone, href: `tel:${cv.phone.replace(/\s+/g, "")}` },
    { icon: Mail, label: cv.email, href: `mailto:${cv.email}` },
    {
      icon: Linkedin,
      label: cv.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
      href: cv.linkedin,
      external: true,
    },
    { icon: MapPin, label: cv.location },
  ].filter((item) => item.label)

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-slate-900">
      <nav
        aria-label="CV controls"
        className="no-print sticky top-0 z-50 border-b border-foreground/10 bg-background/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="text-link text-muted-foreground">
            <ArrowLeft size={16} aria-hidden="true" />
            {t.back}
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <GlowButton variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/admin">
                  <Edit3 aria-hidden="true" />
                  {t.edit}
                </Link>
              </GlowButton>
            )}
            <GlowButton variant="outline" size="sm" onClick={handleShare}>
              {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
              {copied ? t.copied : t.share}
            </GlowButton>
            <GlowButton size="sm" onClick={() => window.print()}>
              <Download aria-hidden="true" />
              {t.print}
            </GlowButton>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 print:max-w-none print:p-0" lang="en">
        <article className="cv-document">
          <header className="cv-header rounded-xl border border-border bg-card p-6 sm:p-8 print:rounded-none print:border-0 print:border-b print:border-slate-300 print:bg-white print:px-0 print:pb-4 print:pt-0">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <img
                src="/images/profile.jpeg"
                alt={cv.name}
                width={112}
                height={112}
                className="h-24 w-24 shrink-0 rounded-full border border-border object-cover sm:h-28 sm:w-28 print:h-20 print:w-20"
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-4xl font-medium sm:text-5xl print:text-3xl">{cv.name}</h1>
                <p className="mt-2 text-lg text-accent print:mt-1 print:text-base print:text-blue-700">{cv.title}</p>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground print:mt-2 print:gap-x-4 print:text-xs print:text-slate-700">
                  {contacts.map(({ icon: Icon, label, href, external }) => (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="inline-flex items-center gap-2 transition-colors hover:text-accent"
                        >
                          <Icon size={14} aria-hidden="true" className="shrink-0 text-accent print:text-blue-700" />
                          {label}
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Icon size={14} aria-hidden="true" className="shrink-0 text-accent print:text-blue-700" />
                          {label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {cv.summary && (
              <div className="mt-6 max-w-3xl space-y-3 text-[15px] leading-relaxed text-foreground/85 print:mt-3 print:space-y-1.5 print:text-[10pt] print:text-slate-800">
                {cv.summary.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </header>

          <section aria-label="Experience" className="mt-12 print:mt-5">
            <SectionTitle>Experience</SectionTitle>
            <div className="flex flex-col">
              {cv.experiences.map((exp, i) => (
                <article
                  key={`${exp.company}-${exp.period}-${i}`}
                  className="cv-entry border-b border-border/60 py-6 first:pt-0 last:border-0 last:pb-0 print:border-slate-200 print:py-2.5"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <h3 className="text-lg font-medium leading-snug print:text-[11pt]">
                      {exp.role}
                      <span className="font-normal text-muted-foreground print:text-slate-600"> · {exp.company}</span>
                    </h3>
                    <p className="shrink-0 text-sm tabular-nums text-muted-foreground print:text-xs print:text-slate-600">
                      {exp.period}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-sm text-muted-foreground print:mt-1 print:text-xs print:text-slate-700">
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground/80 marker:text-accent print:mt-1.5 print:space-y-0.5 print:text-[9.5pt] print:leading-snug print:text-slate-800 print:marker:text-blue-700">
                      {exp.achievements.map((achievement, j) => (
                        <li key={j}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                  {exp.tools?.length > 0 && (
                    <ul aria-label="Tools" className="mt-3 flex flex-wrap gap-1.5 print:mt-1.5 print:gap-1">
                      {exp.tools.map((tool) => (
                        <li
                          key={tool}
                          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground print:border-slate-300 print:px-1.5 print:text-[8pt] print:text-slate-700"
                        >
                          {tool}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>

          <div className="cv-bottom-section mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 print:mt-5 print:grid-cols-2 print:gap-6">
            <section aria-label="Skills">
              <SectionTitle>Skills</SectionTitle>
              <div className="space-y-5 print:space-y-2">
                {cv.skillCategories.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-medium print:text-[10pt]">{category.category}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground print:mt-0.5 print:space-y-0 print:text-[9pt] print:text-slate-700">
                      {category.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-12 print:space-y-4">
              <section aria-label="Education">
                <SectionTitle>Education</SectionTitle>
                <div className="space-y-5 print:space-y-2">
                  {cv.education.map((edu) => (
                    <div key={`${edu.degree}-${edu.period}`}>
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-sm font-medium print:text-[10pt]">{edu.degree}</h3>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground print:text-slate-600">
                          {edu.period}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground print:mt-0 print:text-[9pt] print:text-slate-700">
                        {[edu.institution, edu.location].filter(Boolean).join(" · ")}
                      </p>
                      {edu.achievements.map((achievement) => (
                        <p key={achievement} className="mt-1 text-xs text-accent print:text-[8.5pt] print:text-blue-700">
                          {achievement}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </section>

              {cv.languages.length > 0 && (
                <section aria-label="Languages">
                  <SectionTitle>Languages</SectionTitle>
                  <ul className="space-y-1 text-sm text-muted-foreground print:text-[9pt] print:text-slate-700">
                    {cv.languages.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </article>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 10mm 12mm;
          }
          html,
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 10pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .cv-entry,
          .cv-header {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>
    </div>
  )
}
