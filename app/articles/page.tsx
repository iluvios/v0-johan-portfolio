"use client"

import { useState, useEffect } from "react"
import { SimpleCard } from "@/components/ui/simple-card"
import { GlowButton } from "@/components/ui/glow-button"
import { getBlogPosts, type BlogPost } from "@/lib/blog"

const categories = ["All", "Innovation", "Marketing", "Philosophy"]

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
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
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-md p-6 max-w-2xl mx-auto ai-glow border border-blue-500/20">
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
            <GlowButton
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </GlowButton>
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
            <div className="text-blue-400 text-sm font-mono">
              "Knowledge base initialization in progress..." - A.S. Johan
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <SimpleCard
              key={article.id}
              title={article.title}
              image={article.image || "/placeholder.svg?height=400&width=600"}
              href={`/articles/${article.id}`}
            />
          ))}
        </div>

        {/* A.S. Johan Insight */}
        <div className="text-center mt-16">
          <div className="text-sm text-blue-400 font-mono italic">
            "Information processed. Dissemination active." - A.S. Johan
          </div>
        </div>
      </div>
    </div>
  )
}
