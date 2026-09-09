"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlowButton } from "@/components/ui/glow-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Target, Zap, Code, Lightbulb, BookOpen, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { ProjectCard } from "@/components/portfolio/project-card"
import { ArticleCard } from "@/components/portfolio/article-card"
import { getFeaturedProjects, type Project } from "@/lib/projects"
import { getBlogPosts, type BlogPost } from "@/lib/blog"

export default function HomePage() {
  const [typedText, setTypedText] = useState("")
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [articles, setArticles] = useState<BlogPost[]>([])
  const { t, language } = useLanguage()

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
    }, 30)

    return () => clearInterval(timer)
  }, [fullText])

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [projectsData, articlesData] = await Promise.all([
          getFeaturedProjects(),
          getBlogPosts(),
        ])
        setFeaturedProjects(projectsData)
        setArticles(articlesData.slice(0, 2))
      } catch (error) {
        console.error("Error loading home page content:", error)
      }
    }
    loadContent()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <div className="text-sm sm:text-base md:text-lg uppercase tracking-wider text-blue-400 mb-4 font-medium">
              {language === "en"
                ? "SENIOR MARKETING & INNOVATION STRATEGIST"
                : "ESTRATEGA SENIOR EN MARKETING E INNOVACIÓN"}
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 gradient-text leading-tight">
              {language === "en" ? "Transforming Brands" : "Transformando marcas"}
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-white/90">
              {language === "en" ? (
                <>
                  with <span className="gradient-text">Digital Solutions</span>
                </>
              ) : (
                <>
                  con <span className="gradient-text">soluciones digitales</span>
                </>
              )}
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              {t.home.description}
            </p>
          </div>

          {/* Typing Effect */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-4 sm:p-6 mb-8 sm:mb-12 ai-glow border border-blue-500/20 mx-4">
            <div className="text-blue-400 text-base sm:text-lg md:text-xl font-mono whitespace-pre-line min-h-[60px] sm:min-h-[80px] text-left">
              {typedText}
              <span className="animate-pulse">|</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <GlowButton size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl w-full sm:w-auto">
              <Link href="/projects" className="flex items-center justify-center">
                {t.common.viewProjects} <ArrowRight className="ml-2" size={20} />
              </Link>
            </GlowButton>
            <GlowButton
              variant="outline"
              size="lg"
              className="px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl w-full sm:w-auto"
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
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">{t.home.values.title}</h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 px-4">{t.home.values.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="cyber-card">
              <CardContent className="p-6 sm:p-8 text-center">
                <BookOpen className="text-blue-400 mx-auto mb-4" size={40} />
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">{t.home.values.learning.title}</h3>
                <p className="text-base sm:text-lg text-gray-300">{t.home.values.learning.description}</p>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-6 sm:p-8 text-center">
                <Brain className="text-cyan-400 mx-auto mb-4" size={40} />
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">{t.home.values.curiosity.title}</h3>
                <p className="text-base sm:text-lg text-gray-300">{t.home.values.curiosity.description}</p>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardContent className="p-6 sm:p-8 text-center">
                <Zap className="text-blue-500 mx-auto mb-4" size={40} />
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">{t.home.values.agility.title}</h3>
                <p className="text-base sm:text-lg text-gray-300">{t.home.values.agility.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 sm:py-20 bg-slate-800/30 backdrop-blur-sm relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">{t.home.portfolio.title}</h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 px-4">{t.home.portfolio.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} showDescription />
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
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">{t.home.blog.title}</h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 px-4">{t.home.blog.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                readMoreLabel={t.common.readMore}
              />
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
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-4">{t.home.cta.title}</h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-8 sm:mb-12 px-4">{t.home.cta.subtitle}</p>

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

          <div className="mt-8 sm:mt-12 text-base sm:text-lg md:text-xl text-blue-400 font-mono italic px-4">
            {t.common.quotes.projects}
          </div>
        </div>
      </section>
    </div>
  )
}
