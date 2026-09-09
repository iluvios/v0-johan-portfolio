"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ArticleCard } from "@/components/portfolio/article-card"
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
          (article.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
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
    <main className="min-h-screen text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 gradient-text">
            {t.articles?.title || "Blog & Articles"}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            {t.articles?.subtitle ||
              "Insights, tutorials, and thoughts on technology, marketing automation, and development"}
          </p>
        </header>

        {/* Search */}
        <section aria-label="Search articles" className="max-w-2xl mx-auto mb-8 sm:mb-12">
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
        </section>

        {/* Articles Grid */}
        <section aria-label="Articles list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              readMoreLabel={t.articles?.readMore || "Read More"}
            />
          ))}
        </section>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-lg sm:text-xl md:text-2xl text-slate-400">
              {t.articles?.noResults || "No articles found matching your search."}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
