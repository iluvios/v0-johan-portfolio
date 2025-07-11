import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlowButton } from "@/components/ui/glow-button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MapPin, Calendar, Mail, Linkedin, Briefcase, GraduationCap, Code, Phone, Award } from "lucide-react"

const workExperiences = [
  {
    company: "INDEPENDENT / FREELANCE",
    role: "Marketing Freelancer",
    dates: "November 2022 - Current",
    description: "Managing end-to-end marketing projects for clients across South America and the USA.",
    achievements: [
      "Execute digital marketing tasks including email marketing, copywriting, SEO, and paid advertising campaigns (Meta, Google Ads)",
      "Serve as Project Manager, sourcing and coordinating necessary talent (UX designers, software developers, photographers)",
      "Drove significant client growth through funnel/campaign optimization resulting in over $300k+ USD in attributable new revenue for past clients",
      "Manage comprehensive marketing strategies from initial planning through execution and reporting",
    ],
  },
  {
    company: "SAVANT INTERNATIONAL",
    role: "Marketing & Automation Lead",
    dates: "March 2022 - November 2022",
    description: "Led marketing automation and RPA implementation for international clients.",
    achievements: [
      "Implemented full-funnel strategies: launched websites, automated email marketing, and managed retargeting/SMS campaigns",
      "Led the implementation of RPA and automation solutions across diverse client workflows, achieving a 60% reduction in manual workload",
      "Contributed to upselling new services to existing clients, increasing average client value",
      "Scaled the automation team from 1 to 6 full-time employees",
    ],
  },
  {
    company: "ENERGY MEDIA AGENCY",
    role: "Marketing and Sales Lead",
    dates: "January 2019 - March 2022",
    description: "Co-founded digital marketing and software development agency.",
    achievements: [
      "Co-founded a digital marketing and software development agency",
      "Drove sales efforts and managed client projects from start to finish",
      "Led the implementation of marketing services sold to clients across various industries",
      "Managed a multidisciplinary team of 8 full-time employees (UX designers, advertising specialists, software developers, etc.)",
    ],
  },
  {
    company: "PSL SOFTWARE",
    role: "Digital Marketing Analyst",
    dates: "January 2018 - November 2018",
    description: "Implemented marketing strategies for 2 SaaS products within the ERP industry.",
    achievements: [
      "Executed email marketing, blog writing, and online webinar setup and promotion",
      "Increased email open rates from 12% to 35%",
      "Boosted webinar attendance rates from 20% to 55%",
      "Generated over 50,000 new monthly website visits through SEO strategies",
    ],
  },
  {
    company: "LOOPITEMS.COM",
    role: "Digital Marketing Analyst",
    dates: "April 2017 - January 2018",
    description: "Managed digital marketing campaigns for a gamer e-commerce store.",
    achievements: [
      "Managed digital marketing campaigns (Meta/Google Ads, SEO, Email) for a gamer e-commerce store",
      "Oversaw social media presence, including daily content creation and community engagement",
      "Grew the main social media account from 0 to 5,000 followers in 12 months",
      "Provided comprehensive customer support and community management",
    ],
  },
  {
    company: "GRANDPA DEVS",
    role: "Fullstack Software Developer",
    dates: "January 2014 - April 2017",
    description: "Developed features and applications using modern web technologies.",
    achievements: [
      "Developed features and applications using HTML5, CSS, JavaScript, Node.js, Python, and Meteor.js",
      "Assisted in the development of internal startup projects and prototypes",
      "Collaborated with cross-functional teams on software architecture and design",
      "Participated in code reviews and maintained high code quality standards",
    ],
  },
]

const skills = [
  "Full-Funnel Strategy & Development (Expert)",
  "Email Marketing Automation & Campaigns (Expert)",
  "SEO (On-page, Off-page, Technical - Advanced)",
  "Paid Media Management (Meta Ads, Google Ads)",
  "CRM Setup & Integration",
  "Workflow Automation (Zapier, Make, etc.)",
  "Google Sheets",
  "Airtable and Custom Implementations",
  "AI (for almost anything really)",
  "Web Analytics (Google Analytics, Tag Manager, Google Search Console)",
  "Performance Reporting",
  "Conversion Rate Optimization (A/B Testing)",
  "WordPress (Expert)",
  "Shopify (Expert)",
  "Webflow (Expert)",
  "Node.js",
  "JavaScript",
  "HTML",
  "CSS",
  "Next.js",
  "MongoDB",
  "Firebase",
  "APIs",
]

const education = [
  {
    degree: "Business Management and Innovation",
    institution: "Universidad EAFIT",
    location: "Medellín, Colombia",
    dates: "2016 - 2022",
    description: "Comprehensive business education focusing on management, strategy, and innovation methodologies.",
    highlight: "Academic Excellence Scholarship - Top 5 Universities in Colombia",
    isScholarship: true,
  },
  {
    degree: "Graphic and Multimedia Design",
    institution: "SENA",
    location: "Medellín, Colombia",
    dates: "2014 - 2015",
    description: "Technical education in graphic design, multimedia production, and visual communication.",
  },
  {
    degree: "English Level Advanced",
    institution: "TOEFL",
    location: "Certified 2022",
    dates: "2022",
    description: "Advanced English proficiency certification demonstrating fluent communication skills.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold gradient-text mb-6">ABOUT ME</h1>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-4 sm:p-6 max-w-3xl mx-auto ai-glow border border-blue-500/20">
            <div className="text-blue-400 text-xs sm:text-sm font-mono">
              Personal Profile.
              <br />
              Senior Digital Marketing Specialist with 8+ years of experience leading diverse marketing projects and
              teams (up to 8+ FTEs).
              <br />
              Business Management and Innovation graduate with academic excellence recognition.
              <br />
              Proven ability to drive revenue growth through data-driven strategies across marketing, automation, and
              team leadership.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Personal Info & Photo */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 mb-6 sm:mb-8 rounded-md">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto rounded-md overflow-hidden mb-4 sm:mb-6 ai-glow">
                  <img
                    src="/placeholder.svg?height=192&width=192"
                    alt="Johan Alvarez"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-2">Johan Alvarez</h2>
                <p className="text-base sm:text-lg text-gray-300 mb-2">Senior Marketing Automation Specialist</p>
                <p className="text-sm text-blue-400 mb-4 sm:mb-6 font-medium">Business Management and Innovation</p>

                <div className="space-y-3 text-left text-sm sm:text-base">
                  <div className="flex items-center text-gray-300">
                    <MapPin className="text-blue-400 mr-3 flex-shrink-0" size={18} />
                    <span>Medellín, Colombia</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone className="text-blue-400 mr-3 flex-shrink-0" size={18} />
                    <span>+57 3184064960</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Mail className="text-blue-400 mr-3 flex-shrink-0" size={18} />
                    <span className="break-all">jdsub16@gmail.com</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="text-blue-400 mr-3 flex-shrink-0" size={18} />
                    <span>8+ Years Experience</span>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  <GlowButton className="w-full">
                    <Link href="/contact" className="flex items-center justify-center">
                      <Mail className="mr-2" size={16} />
                      Get In Touch
                    </Link>
                  </GlowButton>
                </div>

                <div className="flex justify-center space-x-4 mt-4 sm:mt-6">
                  <Link
                    href="https://linkedin.com/in/johan-alvarez"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin size={24} />
                  </Link>
                  <Link href="mailto:jdsub16@gmail.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Mail size={24} />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardHeader>
                <CardTitle className="flex items-center gradient-text text-lg sm:text-xl">
                  <Code className="mr-2" size={20} />
                  Core Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-blue-500/30 text-blue-300 rounded-md"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Work Experience & Education */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Work Experience */}
            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardHeader>
                <CardTitle className="flex items-center gradient-text text-lg sm:text-xl">
                  <Briefcase className="mr-2" size={20} />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                {workExperiences.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-500/30 pl-4 sm:pl-6 relative">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-2 top-0"></div>
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-white">{exp.role}</h3>
                      <p className="text-blue-400 font-medium text-sm sm:text-base">{exp.company}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{exp.dates}</p>
                    </div>
                    <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">{exp.description}</p>
                    <ul className="space-y-2">
                      {exp.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="text-xs sm:text-sm text-gray-300 flex items-start">
                          <span className="text-blue-400 mr-2 mt-1 flex-shrink-0">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education & Certifications */}
            <Card className="bg-slate-800/50 border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardHeader>
                <CardTitle className="flex items-center gradient-text text-lg sm:text-xl">
                  <GraduationCap className="mr-2" size={20} />
                  Education & Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-blue-500/30 pl-4 sm:pl-6 relative">
                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-2 top-0"></div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">{edu.degree}</h3>
                        <p className="text-blue-400 text-sm sm:text-base">{edu.institution}</p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {edu.location} • {edu.dates}
                        </p>
                      </div>
                      {edu.isScholarship && (
                        <div className="ml-4">
                          <Award className="text-yellow-400" size={20} />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-300 mt-2 text-sm sm:text-base">{edu.description}</p>
                    {edu.highlight && (
                      <div className="mt-3 p-3 bg-yellow-500/10 rounded-md border border-yellow-500/20">
                        <div className="flex items-center">
                          <Award className="text-yellow-400 mr-2 flex-shrink-0" size={16} />
                          <p className="text-yellow-300 text-xs sm:text-sm font-medium">{edu.highlight}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
