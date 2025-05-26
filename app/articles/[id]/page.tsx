"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { getBlogPost, type BlogPost } from "@/lib/blog"

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadArticle = async () => {
      if (params.id) {
        const post = await getBlogPost(params.id as string)
        setArticle(post)
      }
      setLoading(false)
    }
    loadArticle()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-blue-400 font-mono">Loading article...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
          <Link href="/articles">
            <Button>Back to Articles</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/articles" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to Articles
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          {article.image && (
            <img
              src={article.image || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
            />
          )}

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            <div className="flex items-center text-gray-400 text-sm">
              <Calendar size={14} className="mr-1" />
              {new Date(article.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Clock size={14} className="mr-1" />
              {article.readTime}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{article.title}</h1>
          <p className="text-xl text-gray-300 leading-relaxed">{article.excerpt}</p>
        </div>

        {/* Article Content */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="prose prose-invert prose-blue max-w-none">
              {article.content.split("\n").map((paragraph, index) => (
                <p key={index} className="text-gray-300 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-8">
          <div className="text-sm text-blue-400 font-mono italic">
            "Information processed. Dissemination complete." - ALVA
          </div>
          <Button variant="outline" className="ai-glow">
            <Share2 size={16} className="mr-2" />
            Share Article
          </Button>
        </div>
      </div>
    </div>
  )
}
