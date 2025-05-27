"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getProject, type Project } from "@/lib/projects"

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      if (params.id) {
        const projectData = await getProject(Number.parseInt(params.id as string))
        setProject(projectData)
      }
      setLoading(false)
    }
    loadProject()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-blue-400 font-mono">Loading project...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/projects" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          {project.image_url && (
            <img
              src={project.image_url || "/placeholder.svg"}
              alt={project.title}
              className="w-full h-64 md:h-96 object-cover rounded-md mb-6"
            />
          )}

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Badge variant="secondary">{project.category}</Badge>
            {project.client && <div className="text-gray-400 text-sm">Client: {project.client}</div>}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{project.title}</h1>
          {project.impact && <p className="text-xl text-green-400 font-semibold mb-4">{project.impact}</p>}
        </div>

        {/* Project Content */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8 rounded-md">
          <CardContent className="p-8">
            <div className="prose prose-invert prose-blue max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg">{project.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Technologies & Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-8">
          <div className="text-sm text-blue-400 font-mono italic">
            "Project analysis complete. Implementation successful." - A.S. Johan
          </div>
          <Button variant="outline" className="ai-glow">
            <ExternalLink size={16} className="mr-2" />
            View Live Project
          </Button>
        </div>
      </div>
    </div>
  )
}
