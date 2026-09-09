import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { type BlogPost } from "@/lib/blog"

interface ArticleCardProps {
  article: BlogPost
  className?: string
  readMoreLabel?: string
}

export function ArticleCard({
  article,
  className = "",
  readMoreLabel = "Read More",
}: ArticleCardProps) {
  const formattedDate = article.date
    ? new Date(article.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""

  return (
    <Link href={`/articles/${article.id}`} className={`block h-full ${className}`}>
      <article className="cyber-card group overflow-hidden h-full flex flex-col cursor-pointer">
        {/* Thumbnail */}
        <div className="relative overflow-hidden h-48 bg-slate-900/60">
          <img
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <Badge variant="secondary" className="text-xs bg-slate-700/60 text-slate-300">
                {article.category}
              </Badge>
              {formattedDate && (
                <div className="flex items-center text-slate-400 text-xs space-x-1.5">
                  <Calendar size={12} />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors line-clamp-2">
              {article.title}
            </h3>

            <p className="text-sm text-slate-300 mb-4 line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-700/50 text-xs">
            <div className="flex items-center text-slate-400">
              <Clock size={12} className="mr-1" />
              {article.readTime}
            </div>
            <div className="text-blue-400 group-hover:text-blue-300 transition-colors flex items-center font-medium">
              {readMoreLabel} <ArrowRight size={13} className="ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
