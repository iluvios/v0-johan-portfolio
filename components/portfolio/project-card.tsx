import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { type Project } from "@/lib/projects"

interface ProjectCardProps {
  project: Project
  className?: string
  showDescription?: boolean
  maxTags?: number
}

export function ProjectCard({
  project,
  className = "",
  showDescription = false,
  maxTags = 3,
}: ProjectCardProps) {
  const tags = project.tags || []
  const visibleTags = tags.slice(0, maxTags)
  const remainingCount = tags.length - maxTags

  return (
    <Link href={`/projects/${project.id}`} className={`block h-full ${className}`}>
      <article className="cyber-card group overflow-hidden h-full flex flex-col cursor-pointer">
        {/* Thumbnail */}
        <div className="relative overflow-hidden h-48 sm:h-56 bg-slate-900/60">
          <img
            src={project.image_url || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {project.featured && (
            <Badge className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-semibold">
              Featured
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <Badge variant="secondary" className="text-xs bg-slate-700/60 text-slate-300">
                {project.category}
              </Badge>
              {project.client && (
                <span className="text-xs text-blue-400 font-medium truncate max-w-[140px]">
                  {project.client}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
              {project.title}
            </h3>

            {project.impact && (
              <p className="text-sm font-semibold text-emerald-400 mb-2">
                {project.impact}
              </p>
            )}

            {showDescription && project.description && (
              <p className="text-sm text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-700/50">
              {visibleTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs border-slate-700 text-slate-300"
                >
                  {tag}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs border-slate-700 text-slate-400"
                >
                  +{remainingCount}
                </Badge>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
