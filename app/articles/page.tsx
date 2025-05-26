"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { getBlogPosts, type BlogPost } from "@/lib/blog"

const categories = ["All", "Innovation", "Marketing", "Philosophy"]

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null)
  const [articles, setArticles] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const posts = await getBlogPosts()
        setArticles(posts)
      } catch (error) {
        console.error("Error loading articles:", error)
      } finally {
        setLoading(false)
      }
    }
    loadArticles()
  }, [])

  const filteredArticles =
    selectedCategory === "All" ? articles : articles.filter((article) => article.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-blue-400 font-mono">Loading articles...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">KNOWLEDGE CORE</h1>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto ai-glow">
            <div className="text-blue-400 text-sm font-mono">
              Knowledge Core.
              <br />
              Exploring innovation, marketing paradigms, and foundational philosophies.
              <br />
              <span className="text-green-400">Articles loaded: {articles.length}</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 ai-glow"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* No Articles Message */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {selectedCategory === "All"
                ? "No articles found."
                : `No articles found in "${selectedCategory}" category.`}
            </div>
            <div className="text-blue-400 text-sm font-mono">"Knowledge base initialization in progress..." - ALVA</div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="bg-gray-800/50 border-gray-700 hover:border-blue-400 transition-all duration-300 ai-glow group cursor-pointer"
              onMouseEnter={() => setHoveredArticle(article.id)}
              onMouseLeave={() => setHoveredArticle(null)}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={article.image || "/placeholder.svg?height=300&width=500"}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {hoveredArticle === article.id && (
                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                      <div className="text-blue-400 text-xs font-mono text-center px-4">
                        Initiating deep read of '{article.title}'...
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <div className="flex items-center text-gray-400 text-xs space-x-2">
                    <Calendar size={12} />
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <CardTitle className="text-xl mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>

                <CardDescription className="text-gray-300 mb-4 line-clamp-3">{article.excerpt}</CardDescription>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-400 text-xs">
                    <Clock size={12} className="mr-1" />
                    {article.readTime}
                  </div>
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center text-sm"
                  >
                    Read More <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ALVA Insight */}
        <div className="text-center mt-16">
          <div className="text-sm text-blue-400 font-mono italic">
            "Information processed. Dissemination active." - ALVA
          </div>
        </div>
      </div>
    </div>
  )
}
