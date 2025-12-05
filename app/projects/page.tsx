"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GlowButton } from "@/components/ui/glow-button"
import { Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
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
          project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredProjects(filtered)
  }, [projects, selectedCategory, searchTerm])

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white grid-background flex items-center justify-center">
        <div className="text-xl sm:text-2xl md:text-3xl">{t.projects?.loading || "Loading projects..."}</div>
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
            <Link key={project.id} href={`/projects/${project.id}`} className="block">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 group overflow-hidden rounded-md cursor-pointer h-full">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image_url || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {project.featured && (
                    <Badge className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-blue-500 text-white text-xs sm:text-sm">
                      {t.projects?.featured || "Featured"}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    {project.client && (
                      <p className="text-sm sm:text-base md:text-lg text-blue-400 font-medium">{project.client}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {project.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="text-xs sm:text-sm bg-slate-700 text-slate-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs sm:text-sm bg-slate-700 text-slate-300">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
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
