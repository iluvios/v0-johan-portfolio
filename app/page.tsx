"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlowButton } from "@/components/ui/glow-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Target, Zap, Code, Lightbulb, BookOpen, Users, Calendar, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { getFeaturedProjects, type Project } from "@/lib/projects"

// Sample articles data
const sampleArticles = [
  {
    id: "1",
    title: "The Future of Marketing Automation: AI-Driven Personalization",
    excerpt:
      "Exploring how artificial intelligence is revolutionizing customer journey mapping and personalized marketing experiences at scale.",
    category: "Innovation",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "2",
    title: "Data-Driven Decision Making in Modern Marketing",
    excerpt:
      "A deep dive into leveraging analytics and data science to inform strategic marketing decisions and optimize campaign performance.",
    category: "Marketing",
    date: "2024-01-08",
    readTime: "6 min read",
    image: "/placeholder.svg?height=400&width=600",
  },
]

export default function HomePage() {
  const [typedText, setTypedText] = useState("")
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const { t } = useLanguage()

  const fullText = `${t.home.intro.greeting}

${t.home.intro.passion}`

  useEffect(() => {
    let index = 0
    setTypedText("") // Reset text when language changes
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 30) // Faster typing speed (was 50ms, now 30ms)

    return () => clearInterval(timer)
  }, [fullText])

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      try {
        const projects = await getFeaturedProjects()
        setFeaturedProjects(projects)
      } catch (error) {
        console.error("Error loading featured projects:", error)
      }
    }
    loadFeaturedProjects()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <div className="text-xs sm:text-sm uppercase tracking-wider text-blue-400 mb-4 font-medium">
              SENIOR MARKETING & INNOVATION STRATEGIST
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 gradient-text leading-tight">
              {t.home.title}
            </h1>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8 text-white/90">
              {t.home.subtitle.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="gradient-text">{t.home.subtitle.split(" ").slice(-1)}</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              {t.home.description}
            </p>
          </div>

          {/* Typing Effect */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-4 sm:p-6 mb-8 sm:mb-12 ai-glow border border-blue-500/20 mx-4">
            <div className="text-blue-400 text-sm sm:text-base font-mono whitespace-pre-line min-h-[60px] sm:min-h-[80px] text-left">
              {typedText}
              <span className="animate-pulse">|</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <GlowButton size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              <Link href="/projects" className="flex items-center justify-center">
                {t.common.viewProjects} <ArrowRight className="ml-2" size={20} />
              </Link>
            </GlowButton>
            <GlowButton
              variant="outline"
              size="lg"
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
            >
              <Link href="/articles" className="flex items-center justify-center">
                {t.common.readArticles} <ArrowRight className="ml-2" size={20} />
              </Link>
            </GlowButton>
          </div>
        </div>

        {/* Floating Tech Icons - Hidden on mobile */}
        <div className="hidden lg:block absolute top-1/4 left-10 opacity-30">
          <Brain size={60} className="text-blue-400 float-animation" style={{ animationDelay: "0s" }} />
        </div>
        <div className="hidden lg:block absolute top-1/3 right-10 opacity-30">
          <Target size={50} className="text-cyan-400 float-animation" style={{ animationDelay: "2s" }} />
        </div>
        <div className="hidden lg:block absolute bottom-1/4 left-1/4 opacity-30">
          <Zap size={40} className="text-blue-500 float-animation" style={{ animationDelay: "4s" }} />
        </div>
        <div className="hidden lg:block absolute top-1/2 right-1/4 opacity-30">
          <Code size={45} className="text-cyan-500 float-animation" style={{ animationDelay: "1s" }} />
        </div>
        <div className="hidden lg:block absolute bottom-1/3 right-1/3 opacity-30">
          <Lightbulb size={35} className="text-blue-300 float-animation" style={{ animationDelay: "3s" }} />
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">{t.home.values.title}</h2>
            <p className="text-lg sm:text-xl text-gray-300 px-4">{t.home.values.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-slate-800/50 backdrop-blur-[3px] border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6 sm:p-8 text-center">
                <BookOpen className="text-blue-400 mx-auto mb-4" size={40} />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">{t.home.values.learning.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{t.home.values.learning.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-[3px] border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6 sm:p-8 text-center">
                <Brain className="text-cyan-400 mx-auto mb-4" size={40} />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">{t.home.values.curiosity.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{t.home.values.curiosity.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-[3px] border-slate-700 ai-glow border-blue-500/20 rounded-md">
              <CardContent className="p-6 sm:p-8 text-center">
                <Zap className="text-blue-500 mx-auto mb-4" size={40} />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">{t.home.values.agility.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{t.home.values.agility.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 sm:py-20 bg-slate-800/30 backdrop-blur-sm relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">{t.home.portfolio.title}</h2>
            <p className="text-lg sm:text-xl text-gray-300 px-4">{t.home.portfolio.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {featuredProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-slate-800/50 backdrop-blur-[3px] border-slate-700 hover:border-blue-400 transition-all duration-300 ai-glow group rounded-md"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-md">
                    <img
                      src={project.image_url || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Badge variant="secondary" className="text-xs mb-3">
                    {project.category}
                  </Badge>
                  <CardTitle className="text-lg sm:text-xl mb-2 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </CardTitle>
                  <p className="text-green-400 font-semibold mb-3 text-sm sm:text-base">{project.impact}</p>
                  <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <GlowButton size="lg" className="w-full sm:w-auto">
              <Link href="/projects" className="flex items-center justify-center">
                {t.home.portfolio.viewAll} <ArrowRight className="ml-2" size={20} />
              </Link>
            </GlowButton>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">{t.home.blog.title}</h2>
            <p className="text-lg sm:text-xl text-gray-300 px-4">{t.home.blog.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {sampleArticles.map((article) => (
              <Card
                key={article.id}
                className="bg-slate-800/50 backdrop-blur-[3px] border-slate-700 hover:border-blue-400 transition-all duration-300 ai-glow group rounded-md"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-md">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                    <div className="flex items-center text-gray-400 text-xs space-x-2">
                      <Calendar size={12} />
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <p className="text-gray-300 mb-4 line-clamp-3 text-sm sm:text-base">{article.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-400 text-xs">
                      <Clock size={12} className="mr-1" />
                      {article.readTime}
                    </div>
                    <Link
                      href={`/articles/${article.id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors flex items-center text-sm"
                    >
                      {t.common.readMore} <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <GlowButton size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/articles" className="flex items-center justify-center">
                {t.home.blog.viewAll} <ArrowRight className="ml-2" size={20} />
              </Link>
            </GlowButton>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-slate-800/30 backdrop-blur-sm relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4">{t.home.cta.title}</h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 px-4">{t.home.cta.subtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <GlowButton size="lg" className="w-full sm:w-auto">
              <Link href="/about" className="flex items-center justify-center">
                <Users className="mr-2" size={20} />
                {t.home.cta.aboutMe}
              </Link>
            </GlowButton>
            <GlowButton size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/contact" className="flex items-center justify-center">
                <ArrowRight className="mr-2" size={20} />
                {t.home.cta.contact}
              </Link>
            </GlowButton>
          </div>

          <div className="mt-8 sm:mt-12 text-xs sm:text-sm text-blue-400 font-mono italic px-4">
            {t.common.quotes.projects}
          </div>
        </div>
      </section>
    </div>
  )
}
