"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Download,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  Check,
  Edit3,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  Layers,
  Code,
} from "lucide-react"
import { getCVData, DEFAULT_CV_DATA, type CVProfile } from "@/lib/profile-data"

export default function CVPage() {
  const [cv, setCv] = useState<CVProfile>(DEFAULT_CV_DATA)
  const [copied, setCopied] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const load = async () => {
      const data = await getCVData()
      setCv(data)
    }
    load()

    if (typeof window !== "undefined" && sessionStorage.getItem("admin_auth") === "true") {
      setIsAdmin(true)
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (typeof window === "undefined") return
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cv.name} - CV & Resume`,
          text: `${cv.name} | ${cv.title}`,
          url: window.location.href,
        })
        return
      } catch {
        // Fallback to copy
      }
    }

    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-slate-900 selection:bg-blue-500/30">
      {/* Non-printable Floating Control Toolbar */}
      <nav
        aria-label="CV controls"
        className="no-print sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/about"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Portfolio</span>
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded border border-blue-500/30 hover:border-blue-400 transition-colors"
              >
                <Edit3 size={13} />
                <span>Edit in Admin</span>
              </Link>
            )}

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-md border border-slate-700 hover:border-slate-600 bg-slate-800/80 transition-colors"
              title="Share CV Link"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white px-4 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md transition-all active:scale-95"
            >
              <Download size={15} />
              <span>Download PDF / Print</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Printable Resume Document Sheet */}
      <main className="max-w-5xl mx-auto my-4 sm:my-8 print:my-0 px-3 sm:px-6 print:px-0">
        <article className="cv-document bg-slate-900/90 print:bg-white border border-slate-800 print:border-none rounded-xl print:rounded-none overflow-hidden shadow-2xl print:shadow-none">
          {/* Header Banner */}
          <header className="cv-header bg-slate-950 print:bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800 print:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-blue-400 shrink-0 shadow-lg bg-slate-800">
                  <img
                    src="/images/profile.jpeg"
                    alt={cv.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white print:text-white">
                    {cv.name}
                  </h1>
                  <p className="text-lg sm:text-xl font-medium text-blue-400 print:text-cyan-300 mt-0.5">
                    {cv.title}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 print:text-slate-300 mt-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-blue-400 shrink-0" />
                    <span>{cv.location}</span>
                  </p>
                </div>
              </div>

              {/* Contact Pills */}
              <div className="flex flex-col sm:items-end gap-1.5 text-xs text-slate-300 print:text-slate-200">
                <a
                  href={`tel:${cv.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1.5 hover:text-blue-300 transition-colors"
                >
                  <Phone size={12} className="text-blue-400 shrink-0" />
                  <span>{cv.phone}</span>
                </a>
                <a
                  href={`mailto:${cv.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-blue-300 transition-colors"
                >
                  <Mail size={12} className="text-cyan-400 shrink-0" />
                  <span>{cv.email}</span>
                </a>
                <a
                  href={cv.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-blue-300 transition-colors"
                >
                  <Globe size={12} className="text-blue-400 shrink-0" />
                  <span>{cv.website.replace(/^https?:\/\//, "")}</span>
                </a>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="mt-5 pt-5 border-t border-slate-800/80 print:border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-300 print:text-slate-200 bg-slate-900/60 print:bg-slate-800/60 p-3.5 rounded-lg">
              <p>{cv.summary}</p>
            </div>
          </header>

          {/* 2-Column Body Grid */}
          <div className="cv-body grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12 gap-6 p-6 sm:p-8 print:p-5">
            {/* Main Column: Work Experience (7 of 12 columns in desktop/print) */}
            <section
              aria-label="Work Experience"
              className="lg:col-span-7 print:col-span-7 space-y-5 print:space-y-4"
            >
              <div className="flex items-center gap-2 border-b-2 border-blue-500 pb-1 mb-4">
                <Briefcase size={18} className="text-blue-400 print:text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-white print:text-slate-900">
                  Work Experience
                </h2>
              </div>

              {cv.experiences.map((exp, idx) => (
                <article
                  key={idx}
                  className="cv-entry relative pl-4 border-l-2 border-blue-500/30 print:border-blue-600/40 pb-4 last:pb-0"
                >
                  <span className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500 print:bg-blue-600" />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-white print:text-slate-900">
                      {exp.role}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 print:text-slate-600">
                      [{exp.period}]
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-blue-400 print:text-blue-700 mb-2">
                    {exp.company} <span className="text-slate-500 font-normal">• {exp.location}</span>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-slate-300 print:text-slate-700 mb-2 leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  {/* Bullet achievements */}
                  <ul className="space-y-1 text-xs text-slate-300 print:text-slate-700 leading-snug">
                    {exp.achievements.map((ach, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 print:text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tool Stack Tags */}
                  {exp.tools && exp.tools.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 print:text-slate-600 mr-1">
                        Tools:
                      </span>
                      {exp.tools.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-block text-[10px] font-mono bg-blue-950/70 print:bg-slate-100 text-cyan-300 print:text-blue-800 border border-blue-500/30 print:border-slate-300 rounded px-1.5 py-0.5"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </section>

            {/* Sidebar Column: Skills, Education, Certifications (5 of 12 columns) */}
            <aside
              aria-label="Skills and Education"
              className="lg:col-span-5 print:col-span-5 space-y-6 print:space-y-4 lg:border-l lg:border-slate-800 print:border-l print:border-slate-200 lg:pl-6 print:pl-4"
            >
              {/* Skills by Category */}
              <div>
                <div className="flex items-center gap-2 border-b-2 border-cyan-500 pb-1 mb-3">
                  <Sparkles size={17} className="text-cyan-400 print:text-cyan-600" />
                  <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-white print:text-slate-900">
                    Skills & Tools
                  </h2>
                </div>

                <div className="space-y-3.5 text-xs">
                  {cv.skillCategories.map((cat, cIdx) => (
                    <div key={cIdx} className="cv-skill-category">
                      <h3 className="font-semibold text-cyan-300 print:text-cyan-800 text-[11px] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                        {cIdx === 0 ? <Layers size={13} /> : <Code size={13} />}
                        {cat.category}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {cat.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-slate-800/80 print:bg-slate-100 text-slate-300 print:text-slate-800 border border-slate-700/60 print:border-slate-300 rounded px-2 py-0.5 text-[11px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="pt-2">
                <div className="flex items-center gap-2 border-b-2 border-blue-500 pb-1 mb-3">
                  <GraduationCap size={18} className="text-blue-400 print:text-blue-600" />
                  <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-white print:text-slate-900">
                    Education
                  </h2>
                </div>

                <div className="space-y-3">
                  {cv.education.map((edu, eIdx) => (
                    <div key={eIdx} className="cv-entry text-xs">
                      <div className="flex items-baseline justify-between gap-1">
                        <h3 className="font-bold text-white print:text-slate-900 text-xs sm:text-sm">
                          {edu.degree}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                          [{edu.period}]
                        </span>
                      </div>
                      <p className="text-blue-400 print:text-blue-700 text-xs">{edu.institution}</p>
                      <p className="text-slate-500 text-[11px]">{edu.location}</p>
                      {edu.achievements.map((ach, aIdx) => (
                        <p
                          key={aIdx}
                          className="text-[11px] text-emerald-400 print:text-emerald-700 italic mt-0.5"
                        >
                          ★ {ach}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages & Certifications */}
              <div className="pt-2">
                <div className="flex items-center gap-2 border-b-2 border-cyan-500 pb-1 mb-3">
                  <Award size={18} className="text-cyan-400 print:text-cyan-600" />
                  <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase text-white print:text-slate-900">
                    Languages & Certs
                  </h2>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 print:text-slate-800">
                  {cv.languages.map((lang, lIdx) => (
                    <div key={lIdx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 print:bg-cyan-600" />
                      <span className="font-medium">{lang}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>

      {/* Embedded Print CSS to guarantee condensed 2-page pagination */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 8mm 10mm 8mm 10mm;
          }

          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 10.5pt !important;
            line-height: 1.35 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .cv-document {
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }

          .cv-header {
            background-color: #0f172a !important;
            color: #ffffff !important;
            padding: 18px 24px !important;
            border-radius: 6px !important;
            margin-bottom: 12px !important;
          }

          .cv-body {
            padding: 0 !important;
          }

          .cv-entry {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .cv-skill-category {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          a {
            text-decoration: none !important;
            color: inherit !important;
          }
        }
      `}</style>
    </div>
  )
}
