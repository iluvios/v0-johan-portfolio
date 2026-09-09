"use client"

import { useState, useEffect } from "react"
import { GlowButton } from "@/components/ui/glow-button"
import { Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/portfolio/project-card"
import { useLanguage } from "@/contexts/language-context"
import { getProjects, type Project } from "@/lib/projects"

export default function ProjectsPage() {
  const { t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await getProjects()
        setProjects(projectsData)
        setFilteredProjects(projectsData)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    let filtered = projects

    if (selectedCategory !== "All") {
      filtered = filtered.filter((project) => project.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredProjects(filtered)
  }, [projects, selectedCategory, searchTerm])

  const categories: string[] = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category).filter((c): c is string => Boolean(c)))),
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white grid-background flex items-center justify-center">
        <div className="text-xl sm:text-2xl md:text-3xl">{t.projects?.loading || "Loading projects..."}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 gradient-text">
            {t.projects?.title || "Projects"}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            {t.projects?.subtitle || "Explore my portfolio of innovative digital solutions and successful campaigns"}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder={t.projects?.search || "Search projects..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 text-base sm:text-lg md:text-xl h-12 sm:h-14"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {categories.map((category) => (
              <GlowButton
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-sm sm:text-base md:text-lg"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {category}
              </GlowButton>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-lg sm:text-xl md:text-2xl text-slate-400">
              {t.projects?.noResults || "No projects found matching your search."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
