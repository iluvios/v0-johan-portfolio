"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Filter } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "E-commerce Funnel Optimization",
    client: "TechCorp Solutions",
    impact: "+$300k Attributable Revenue via Funnel Optimization",
    description: "Complete funnel redesign and automation implementation resulting in 45% conversion rate improvement.",
    image: "/placeholder.svg?height=300&width=500",
    category: "Marketing Automation",
    tags: ["Conversion Optimization", "Analytics", "A/B Testing"],
  },
  {
    id: 2,
    title: "Brand Identity & Digital Presence",
    client: "StartupX",
    impact: "200% Increase in Brand Engagement",
    description: "Full brand identity development with integrated digital marketing strategy and web presence.",
    image: "/placeholder.svg?height=300&width=500",
    category: "Web Development",
    tags: ["Branding", "Web Design", "Digital Strategy"],
  },
  {
    id: 3,
    title: "Marketing Automation Platform",
    client: "Enterprise Client",
    impact: "60% Reduction in Manual Marketing Tasks",
    description: "Custom marketing automation platform with advanced segmentation and personalization capabilities.",
    image: "/placeholder.svg?height=300&width=500",
    category: "Full-Funnel Strategy",
    tags: ["Automation", "CRM Integration", "Lead Nurturing"],
  },
]

const categories = ["All", "Marketing Automation", "Web Development", "Full-Funnel Strategy"]

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [hoveredProject, setHoveredProject] = useState<number | null>(null)

  const filteredProjects =
    selectedCategory === "All" ? projects : projects.filter((project) => project.category === selectedCategory)

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">PROJECT REPOSITORY</h1>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto ai-glow">
            <div className="text-blue-400 text-sm font-mono">
              Project Repository.
              <br />
              Case studies in strategic execution and measurable impact. Filter by expertise.
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Filter className="text-gray-400" size={20} />
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="ai-glow"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="bg-gray-800/50 border-gray-700 hover:border-blue-400 transition-all duration-300 ai-glow group"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {hoveredProject === project.id && (
                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                      <div className="text-blue-400 text-xs font-mono">
                        Accessing detail view for {project.title}...
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                  <Link href={`/projects/${project.id}`}>
                    <ExternalLink size={16} className="text-gray-400 hover:text-blue-400 transition-colors" />
                  </Link>
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-blue-400 transition-colors">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-green-400 font-semibold mb-3">{project.impact}</CardDescription>
                <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ALVA Insight */}
        <div className="text-center mt-16">
          <div className="text-sm text-blue-400 font-mono italic">
            "Data points logged. Result correlation: Positive." - ALVA
          </div>
        </div>
      </div>
    </div>
  )
}
