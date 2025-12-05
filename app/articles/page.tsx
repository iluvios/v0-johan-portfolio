"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GlowButton } from "@/components/ui/glow-button"
import { Calendar, Clock, Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { getBlogPosts, type BlogPost } from "@/lib/blog"

export default function ArticlesPage() {
  const { t } = useLanguage()
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [filteredArticles, setFilteredArticles] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesData = await getBlogPosts()
        setArticles(articlesData)
        setFilteredArticles(articlesData)
      } catch (error) {
        console.error("Error fetching articles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredArticles(filtered)
    } else {
      setFilteredArticles(articles)
    }
  }, [articles, searchTerm])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white grid-background flex items-center justify-center">
        <div className="text-xl sm:text-2xl md:text-3xl">{t.articles?.loading || "Loading articles..."}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white grid-background">
      {/* Floating orbs */}
      <div className="floating-orb floating-orb-1"></div>
      <div className="floating-orb floating-orb-2"></div>
      <div className="floating-orb floating-orb-3"></div>
      <div className="floating-orb floating-orb-4"></div>
      <div className="floating-orb floating-orb-5"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 gradient-text">
            {t.articles?.title || "Blog & Articles"}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            {t.articles?.subtitle ||
              "Insights, tutorials, and thoughts on technology, marketing automation, and development"}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder={t.articles?.search || "Search articles..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 text-base sm:text-lg md:text-xl h-12 sm:h-14"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 group rounded-md"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-slate-300 line-clamp-3 mb-3 sm:mb-4">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm md:text-base text-slate-400 mb-3 sm:mb-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                  {article.tags.slice(0, 3).map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      variant="secondary"
                      className="text-xs sm:text-sm bg-slate-700 text-slate-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs sm:text-sm bg-slate-700 text-slate-300">
                      +{article.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <GlowButton size="sm" asChild className="w-full">
                  <Link
                    href={`/articles/${article.id}`}
                    className="flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {t.articles?.readMore || "Read More"}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </GlowButton>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-lg sm:text-xl md:text-2xl text-slate-400">
              {t.articles?.noResults || "No articles found matching your search."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
