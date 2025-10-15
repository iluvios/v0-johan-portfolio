"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GlowButton } from "@/components/ui/glow-button"
import { MapPin, Calendar, Award, ExternalLink, Mail, Linkedin } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const workExperiences = [
    {
      role: "Marketing Automation Specialist",
      company: "Pvragon",
      period: "June 2025 - Current",
      location: "Medellín, Colombia (Remote)",
      type: "Full-time",
      achievements: [
        "Leading marketing automation initiatives for international clients",
        "Implementing advanced funnel strategies and conversion optimization",
        "Developing data-driven marketing solutions and analytics frameworks",
      ],
    },
    {
      role: "INDEPENDENT / FREELANCE",
      company: "Marketing & Innovation Strategist",
      period: "November 2022 - June 2025",
      location: "Medellín, Colombia",
      type: "Freelance",
      description:
        "Specialized in marketing automation, full-funnel strategies, and digital transformation for diverse clients across multiple industries.",
      achievements: [
        "Delivered 50+ successful marketing automation projects",
        "Increased client conversion rates by an average of 35%",
        "Built comprehensive marketing funnels generating $2M+ in revenue",
        "Developed custom analytics dashboards and reporting systems",
      ],
    },
    {
      role: "GRANDPA DEVS",
      company: "Marketing Automation Specialist",
      period: "September 2021 - November 2022",
      location: "Medellín, Colombia",
      type: "Full-time",
      achievements: [
        "Implemented marketing automation workflows for 20+ clients",
        "Reduced manual marketing tasks by 60% through automation",
        "Created comprehensive lead nurturing campaigns",
        "Developed ROI tracking and performance analytics systems",
      ],
    },
  ]

  const education = [
    {
      degree: "Systems Engineering",
      institution: "Universidad de Antioquia",
      period: "2016 - 2021",
      location: "Medellín, Colombia",
      achievements: [
        "Academic Excellence Scholarship recipient",
        "Graduated with honors in Software Development",
        "Specialized in Data Analytics and Business Intelligence",
      ],
    },
  ]

  const skills = [
    "Marketing Automation",
    "HubSpot",
    "Salesforce",
    "Google Analytics",
    "Facebook Ads",
    "Google Ads",
    "Email Marketing",
    "Lead Generation",
    "Conversion Optimization",
    "A/B Testing",
    "Data Analysis",
    "Python",
    "JavaScript",
    "React",
    "Next.js",
    "SQL",
    "Tableau",
    "Power BI",
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white grid-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text mb-4 sm:mb-6">
            About Me
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Senior Marketing & Innovation Strategist with 8+ years of experience transforming digital landscapes
          </p>
        </div>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 mb-6 sm:mb-8 rounded-md">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-md overflow-hidden mb-4 sm:mb-6 ai-glow">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Imagen%20de%20WhatsApp%202025-09-04%20a%20las%2011.09.51_08f1e1b1.jpg-sotJrEqj14wwdpg9MLb69Rgb25sFiv.jpeg"
                  alt="Johan Alvarez"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">A.S. Johan</h2>
              <p className="text-xl sm:text-2xl md:text-3xl text-blue-400 mb-4 sm:mb-6">
                Marketing Automation Specialist
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>Medellín, Colombia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>8+ Years Experience</span>
                </div>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-6 sm:mb-8">
                Passionate about leveraging cutting-edge technologies and data-driven strategies to transform marketing
                landscapes. Specialized in automation, full-funnel optimization, and innovative digital solutions that
                drive measurable business growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlowButton asChild>
                  <Link href="/contact" className="flex items-center gap-2">
                    <Mail size={18} />
                    Get In Touch
                  </Link>
                </GlowButton>
                <GlowButton variant="outline" asChild>
                  <a
                    href="https://linkedin.com/in/johan-alvarez"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Linkedin size={18} />
                    LinkedIn Profile
                  </a>
                </GlowButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Experience */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
            <CardHeader>
              <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text flex items-center gap-3">
                <Award className="text-blue-400" size={32} />
                Professional Experience
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
        </div>

        {/* Education */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
            <CardHeader>
              <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text flex items-center gap-3">
                <Award className="text-blue-400" size={32} />
                Education
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
        </div>

        {/* Skills */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
            <CardHeader>
              <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                Technical Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-base sm:text-lg px-3 py-1 bg-blue-500/20 text-blue-300 border-blue-500/30"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4 sm:mb-6">
                Let's Work Together
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 leading-relaxed">
                Ready to transform your marketing strategy with cutting-edge automation and data-driven insights? Let's
                discuss how we can drive your business forward.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlowButton size="lg" asChild>
                  <Link href="/contact" className="flex items-center gap-2">
                    <Mail size={20} />
                    Start a Conversation
                  </Link>
                </GlowButton>
                <GlowButton variant="outline" size="lg" asChild>
                  <Link href="/projects" className="flex items-center gap-2">
                    <ExternalLink size={20} />
                    View My Work
                  </Link>
                </GlowButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
