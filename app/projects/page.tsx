"use client"

import { useState, useEffect } from "react"
import { SimpleCard } from "@/components/ui/simple-card"
import { GlowButton } from "@/components/ui/glow-button"
import { getProjects, type Project } from "@/lib/projects"
import { useLanguage } from "@/contexts/language-context"

const categories = ["All", "Marketing Automation", "Web Development", "Full-Funnel Strategy"]

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects(selectedCategory === "All" ? undefined : selectedCategory)
        setProjects(data)
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [selectedCategory])

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-blue-400 font-mono">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">PROJECT REPOSITORY</h1>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-md p-6 max-w-2xl mx-auto ai-glow border border-blue-500/20">
            <div className="text-blue-400 text-sm font-mono">
              Project Repository.
              <br />
              Case studies in strategic execution and measurable impact. Filter by expertise.
              <br />
              <span className="text-green-400">Projects loaded: {projects.length}</span>
            </div>
          </div>
        </div>

        {/* Filter */}
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

        {/* No Projects Message */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {selectedCategory === "All"
                ? "No projects found."
                : `No projects found in "${selectedCategory}" category.`}
            </div>
            <div className="text-blue-400 text-sm font-mono">
              "Project database initialization in progress..." - A.S. Johan
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <SimpleCard
              key={project.id}
              title={project.title}
              image={project.image_url || "/placeholder.svg?height=400&width=600"}
              href={`/projects/${project.id}`}
            />
          ))}
        </div>

        {/* A.S. Johan Insight */}
        <div className="text-center mt-16">
          <div className="text-sm text-blue-400 font-mono italic">
            "Data points logged. Result correlation: Positive." - A.S. Johan
          </div>
        </div>
      </div>
    </div>
  )
}
