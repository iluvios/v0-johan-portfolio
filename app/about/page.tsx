"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GlowButton } from "@/components/ui/glow-button"
import { MapPin, Calendar, Award, ExternalLink, Mail, Linkedin } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { DEFAULT_WORK_EXPERIENCES, DEFAULT_EDUCATION, DEFAULT_SKILLS } from "@/lib/profile-data"

export default function AboutPage() {
  const { t } = useLanguage()

  const workExperiences = DEFAULT_WORK_EXPERIENCES.map((exp, idx) => {
    const translationKey = idx === 0 ? "pvragon" : idx === 1 ? "independent" : "grandpaDevs"
    const trans = t.about?.work?.[translationKey as keyof typeof t.about.work]
    return {
      role: trans?.role || exp.role,
      company: trans?.company || exp.company,
      period: trans?.period || exp.period,
      location: trans?.location || exp.location,
      type: (idx === 1 ? t.about?.freelance : t.about?.fullTime) || exp.type,
      description: (trans && "description" in trans ? (trans as any).description : undefined) || exp.description,
      achievements: trans?.achievements || exp.achievements,
    }
  })

  const education = DEFAULT_EDUCATION.map((edu) => ({
    degree: t.about?.edu?.degree || edu.degree,
    institution: t.about?.edu?.institution || edu.institution,
    period: t.about?.edu?.period || edu.period,
    location: t.about?.edu?.location || edu.location,
    achievements: t.about?.edu?.achievements || edu.achievements,
  }))

  const skills = DEFAULT_SKILLS

  return (
    <main className="min-h-screen text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Header Section */}
        <section data-section="about-header" className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text mb-4 sm:mb-6">
            {t.about?.title || "About Me"}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t.about?.subtitle ||
              "Senior Marketing & Innovation Strategist with 8+ years of experience transforming digital landscapes"}
          </p>
        </section>

        {/* Profile Card */}
        <section data-section="about-profile" className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <Card className="cyber-card mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-md overflow-hidden mb-4 sm:mb-6 ai-glow shadow-xl">
                <img
                  src="/images/profile.jpeg"
                  alt="A.S. Johan"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">A.S. Johan</h2>
              <p className="text-xl sm:text-2xl md:text-3xl text-blue-400 mb-4 sm:mb-6">
                {t.about?.currentRole || "Marketing Automation Specialist"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{t.about?.location || "Medellín, Colombia"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{t.about?.experience || "8+ Years Experience"}</span>
                </div>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-6 sm:mb-8">
                {t.about?.bio ||
                  "Passionate about leveraging cutting-edge technologies and data-driven strategies to transform marketing landscapes. Specialized in automation, full-funnel optimization, and innovative digital solutions that drive measurable business growth."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlowButton asChild>
                  <Link href="/contact" className="flex items-center gap-2">
                    <Mail size={18} />
                    {t.about?.getInTouch || "Get In Touch"}
                  </Link>
                </GlowButton>
                <GlowButton variant="outline" asChild>
                  <a
                    href="https://linkedin.com/in/johanalvarez"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Linkedin size={18} />
                    {t.about?.linkedinProfile || "LinkedIn Profile"}
                  </a>
                </GlowButton>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Work Experience */}
        <section data-section="about-experience" className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text flex items-center gap-3">
                <Award className="text-blue-400" size={32} />
                {t.about?.professionalExperience || "Professional Experience"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8">
              {workExperiences.map((exp, index) => (
                <div key={index} className="border-l-2 border-blue-500/30 pl-4 sm:pl-6 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-2 top-0"></div>
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">{exp.role}</h3>
                    <p className="text-lg sm:text-xl md:text-2xl text-blue-400">{exp.company}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base sm:text-lg md:text-xl text-slate-400 mt-2">
                      <span>{exp.period}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{exp.location}</span>
                      <span className="hidden sm:inline">•</span>
                      <Badge variant="outline" className="w-fit text-sm">
                        {exp.type}
                      </Badge>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-4 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  <ul className="space-y-2 text-base sm:text-lg md:text-xl text-slate-300">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Education */}
        <section data-section="about-education" className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text flex items-center gap-3">
                <Award className="text-blue-400" size={32} />
                {t.about?.education || "Education"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8">
              {education.map((edu, index) => (
                <div key={index} className="border-l-2 border-blue-500/30 pl-4 sm:pl-6 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-2 top-0"></div>
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">{edu.degree}</h3>
                    <p className="text-lg sm:text-xl md:text-2xl text-blue-400">{edu.institution}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base sm:text-lg md:text-xl text-slate-400 mt-2">
                      <span>{edu.period}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{edu.location}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-base sm:text-lg md:text-xl text-slate-300">
                    {edu.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Skills */}
        <section data-section="about-skills" className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                {t.about?.technicalSkills || "Technical Skills & Expertise"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm sm:text-base px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section data-section="about-cta" className="max-w-4xl mx-auto text-center">
          <Card className="cyber-card">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4 sm:mb-6">
                {t.about?.letsWorkTogether || "Let's Work Together"}
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 leading-relaxed">
                {t.about?.ctaDescription ||
                  "Ready to transform your marketing strategy with cutting-edge automation and data-driven insights? Let's discuss how we can drive your business forward."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlowButton size="lg" asChild>
                  <Link href="/contact" className="flex items-center gap-2">
                    <Mail size={20} />
                    {t.about?.startConversation || "Start a Conversation"}
                  </Link>
                </GlowButton>
                <GlowButton variant="outline" size="lg" asChild>
                  <Link href="/projects" className="flex items-center gap-2">
                    <ExternalLink size={20} />
                    {t.about?.viewMyWork || "View My Work"}
                  </Link>
                </GlowButton>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
