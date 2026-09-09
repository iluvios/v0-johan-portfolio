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
  Code,
  Settings,
  Linkedin,
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
      <main className="max-w-4xl mx-auto my-3 sm:my-6 print:m-0 print:p-0 print:max-w-none">
        <article className="cv-document bg-slate-900/90 print:bg-white border border-slate-800 print:border-none rounded-xl print:rounded-none overflow-hidden shadow-2xl print:shadow-none print:m-0 print:p-0">
          {/* Header Banner - Matching Johan's Original Dark Navy Aesthetic */}
          <header className="cv-header bg-[#162032] print:bg-[#162032] text-white p-6 sm:p-7 border-b border-slate-800 print:border-none">
            {/* Top row: Name/Title on Left, Contact info on Right */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-5 border-b border-slate-700/60">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {cv.name}
                </h1>
                <p className="text-base sm:text-lg font-medium text-cyan-400 print:text-cyan-300 mt-0.5">
                  {cv.title}
                </p>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col sm:items-end gap-1.5 text-xs text-slate-300 print:text-slate-200">
                <a
                  href={`tel:${cv.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 hover:text-cyan-300 transition-colors"
                >
                  <Phone size={13} className="text-cyan-400 shrink-0" />
                  <span>{cv.phone}</span>
                </a>
                <a
                  href={`mailto:${cv.email}`}
                  className="inline-flex items-center gap-2 hover:text-cyan-300 transition-colors"
                >
                  <Mail size={13} className="text-cyan-400 shrink-0" />
                  <span>{cv.email}</span>
                </a>
                <a
                  href={cv.linkedin || "https://linkedin.com/in/johanalvarez"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-cyan-300 transition-colors"
                >
                  <Linkedin size={13} className="text-cyan-400 shrink-0" />
                  <span>{cv.linkedin ? cv.linkedin.replace(/^https?:\/\/(www\.)?/, "") : "linkedin.com/in/johanalvarez"}</span>
                </a>
                <div className="inline-flex items-center gap-2 text-slate-300">
                  <MapPin size={13} className="text-cyan-400 shrink-0" />
                  <span>{cv.location}</span>
                </div>
              </div>
            </div>

            {/* Profile Photo + Executive Summary (Simple, Direct Language) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-cyan-500/50 shrink-0 shadow-xl bg-slate-800">
                <img
                  src="/images/profile.jpeg"
                  alt={cv.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="flex-1 text-xs sm:text-[13px] leading-relaxed text-slate-200 print:text-slate-100 space-y-2">
                {cv.summary ? (
                  cv.summary.split("\n\n").map((para, pIdx) => <p key={pIdx}>{para}</p>)
                ) : (
                  <>
                    <p>
                      Senior Digital Marketing Specialist with 10+ years of experience leading diverse marketing projects and teams. I have a proven ability to drive revenue growth through data-driven strategies across marketing, automation, and team leadership.
                    </p>
                    <p>
                      My background as a Fullstack Software Developer and Business Manager provides the technical expertise to efficiently implement and manage the tech and business aligned solutions essential for modern marketing.
                    </p>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Body Content */}
          <div className="p-6 sm:p-7 print:p-4 space-y-6 print:space-y-5">
            {/* 1. WORK EXPERIENCE - FULL SINGLE COLUMN */}
            <section aria-label="Work Experience" className="space-y-4 print:space-y-3.5">
              <div className="border-b-2 border-blue-500/80 pb-1 mb-3">
                <h2 className="text-sm sm:text-base font-bold tracking-wider uppercase text-white print:text-slate-900 flex items-center gap-2">
                  <Briefcase size={16} className="text-cyan-400 print:text-blue-600" />
                  WORK EXPERIENCE
                </h2>
              </div>

              <div className="space-y-4 print:space-y-3.5">
                {cv.experiences.map((exp, idx) => (
                  <article
                    key={idx}
                    className="cv-entry pb-3.5 last:pb-0 border-b border-slate-800/60 print:border-slate-200 last:border-b-0"
                  >
                    {/* Role at Company [ Period ] */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                      <div className="text-sm sm:text-[14px] font-bold text-white print:text-slate-900">
                        <span>{exp.role}</span>
                        <span className="font-normal text-slate-400 print:text-slate-600"> at </span>
                        <span className="text-cyan-400 print:text-blue-700 font-semibold">{exp.company}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 print:text-slate-600 shrink-0">
                        [ {exp.period} ]
                      </span>
                    </div>

                    {/* Simple, straightforward bullets */}
                    <ul className="space-y-1 text-xs sm:text-[12.5px] text-slate-300 print:text-slate-800 leading-snug pl-1">
                      {exp.achievements.map((ach, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-2">
                          <span className="text-cyan-400 print:text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tools Row */}
                    {exp.tools && exp.tools.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1 text-[10.5px]">
                        <span className="font-semibold uppercase tracking-wider text-slate-400 print:text-slate-600 mr-1">
                          TOOLS:
                        </span>
                        {exp.tools.map((tool, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-slate-800/80 print:bg-slate-100 text-cyan-300 print:text-slate-800 border border-slate-700/70 print:border-slate-300 rounded px-1.5 py-0.5"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* 2. BELOW EXPERIENCE: SKILLS & EDUCATION SECTION (2 Balanced Columns) */}
            <section
              aria-label="Skills, Education and Technical Background"
              className="cv-bottom-section pt-2 border-t-2 border-slate-800 print:border-slate-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 items-start">
                {/* Column 1: Skills */}
                <div className="rounded-xl border border-slate-800 print:border-slate-300 p-4 bg-slate-900/50 print:bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-700/80 print:border-slate-300 pb-1.5">
                    <Settings size={16} className="text-cyan-400 print:text-blue-600" />
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white print:text-slate-900">
                      Skills
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-cyan-400 print:text-blue-700 text-xs mb-1.5">
                        → Marketing (7 años)
                      </p>
                      <ul className="space-y-1 text-slate-300 print:text-slate-800 leading-snug pl-1">
                        {cv.skillCategories[0]?.skills.map((skill, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-slate-500 print:text-slate-400 shrink-0">•</span>
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Column 2: Education + Web Development Skills */}
                <div className="space-y-4">
                  {/* Education Card */}
                  <div className="rounded-xl border border-slate-800 print:border-slate-300 p-4 bg-slate-900/50 print:bg-slate-50/50 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-700/80 print:border-slate-300 pb-1.5">
                      <GraduationCap size={16} className="text-cyan-400 print:text-blue-600" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white print:text-slate-900">
                        Education
                      </h3>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-300 print:text-slate-800">
                      <div>
                        <div className="flex justify-between items-baseline gap-1 font-semibold text-white print:text-slate-900">
                          <span>→ Business Management and Innovation</span>
                          <span className="font-mono text-[11px] text-slate-400 print:text-slate-600">[ 2016 - 2022 ]</span>
                        </div>
                        <p className="text-cyan-400 print:text-blue-700">Universidad EAFIT, Medellin</p>
                        <p className="text-[11px] text-slate-400 print:text-slate-600 italic mt-0.5">
                          (Fully paid scholarship for academic achievement)
                        </p>
                      </div>

                      <div className="pt-1 border-t border-slate-800/60 print:border-slate-200">
                        <div className="flex justify-between items-baseline gap-1 font-semibold text-white print:text-slate-900">
                          <span>→ Graphic and multimedia design</span>
                          <span className="font-mono text-[11px] text-slate-400 print:text-slate-600">[ 2014 - 2015 ]</span>
                        </div>
                        <p className="text-cyan-400 print:text-blue-700">SENA, Medellin, Colombia</p>
                      </div>

                      <div className="pt-1 border-t border-slate-800/60 print:border-slate-200">
                        <p className="font-semibold text-white print:text-slate-900">→ English Level C2</p>
                        <p className="text-slate-400 print:text-slate-600 text-[11px]">TOEFL, 2022</p>
                      </div>
                    </div>
                  </div>

                  {/* Web Development Skills Card */}
                  <div className="rounded-xl border border-slate-800 print:border-slate-300 p-4 bg-slate-900/50 print:bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-slate-700/80 print:border-slate-300 pb-1.5">
                      <Code size={16} className="text-cyan-400 print:text-blue-600" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white print:text-slate-900">
                        Web Development Skills
                      </h3>
                    </div>

                    <div className="text-xs text-slate-300 print:text-slate-800 space-y-2 leading-relaxed">
                      <div>
                        <p className="font-semibold text-slate-200 print:text-slate-900 mb-1">• Low code platforms:</p>
                        <ul className="pl-3 space-y-0.5 text-[11.5px] text-slate-400 print:text-slate-700">
                          <li>◦ WordPress (Advanced)</li>
                          <li>◦ Shopify (Advanced)</li>
                          <li>◦ Webflow (Advanced)</li>
                          <li>◦ Lovable, V0.app (advanced)</li>
                        </ul>
                      </div>

                      <div className="pt-1 border-t border-slate-800/60 print:border-slate-200 text-[11.5px]">
                        <p className="font-semibold text-slate-200 print:text-slate-900">Other:</p>
                        <p className="text-slate-400 print:text-slate-700 mt-0.5">
                          OpenAI API, Gemini API, Node.js, Javascript, Html, CSS, Next.js, Mongo DB, APIs, Tailwind
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>

      {/* Strict Print CSS for exact 2-page pagination & zero chrome bleed */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 4mm 8mm 6mm 8mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 10pt !important;
            line-height: 1.3 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide global site navigation, footer, skip link and toolbars */
          .no-print,
          .site-header,
          .site-footer,
          .skip-link,
          header.site-header,
          footer.site-footer,
          nav.desktop-nav,
          .mobile-menu-trigger {
            display: none !important;
          }

          .site-main,
          main {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
          }

          .cv-document {
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .cv-header {
            background-color: #162032 !important;
            color: #ffffff !important;
            padding: 16px 20px !important;
            margin-top: 0 !important;
            margin-bottom: 10px !important;
            border-radius: 6px !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .cv-header a {
            pointer-events: auto !important;
            color: #e2e8f0 !important;
          }

          .cv-entry {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .cv-bottom-section {
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
