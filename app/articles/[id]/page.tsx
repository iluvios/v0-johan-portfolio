"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowLeft, Share2, Check } from "lucide-react"
import Link from "next/link"
import { getBlogPost, type BlogPost } from "@/lib/blog"

function parseInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let currentList: { type: "ul"; items: string[] } | null = null

  const flushList = () => {
    if (currentList) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-4 space-y-2 list-disc list-inside text-slate-300">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      )
      currentList = null
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      return
    }

    if (trimmed.startsWith("### ")) {
      flushList()
      elements.push(
        <h3 key={index} className="text-xl sm:text-2xl font-semibold text-blue-400 mt-6 mb-2">
          {parseInline(trimmed.slice(4))}
        </h3>
      )
    } else if (trimmed.startsWith("## ")) {
      flushList()
      elements.push(
        <h2 key={index} className="text-2xl sm:text-3xl font-bold text-white mt-8 mb-3 border-b border-slate-700/50 pb-2">
          {parseInline(trimmed.slice(3))}
        </h2>
      )
    } else if (trimmed.startsWith("# ")) {
      flushList()
      elements.push(
        <h1 key={index} className="text-3xl sm:text-4xl font-extrabold gradient-text mt-10 mb-4">
          {parseInline(trimmed.slice(2))}
        </h1>
      )
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!currentList) {
        currentList = { type: "ul", items: [] }
      }
      currentList.items.push(trimmed.slice(2))
    } else {
      flushList()
      elements.push(
        <p key={index} className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">
          {parseInline(trimmed)}
        </p>
      )
    }
  })

  flushList()
  return <div className="markdown-content">{elements}</div>
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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

  const handleShare = async () => {
    if (!article) return
    const url = typeof window !== "undefined" ? window.location.href : ""

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url,
        })
        return
      } catch {
        // Fallback to clipboard if native share was cancelled or unavailable
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

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
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-6 shadow-xl"
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
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-6 sm:p-8">
            <MarkdownRenderer content={article.content} />
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
          <Button variant="outline" className="ai-glow" onClick={handleShare}>
            {copied ? (
              <>
                <Check size={16} className="mr-2 text-green-400" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 size={16} className="mr-2" />
                Share Article
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
