"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import Link from "next/link"
import { getProject, type Project } from "@/lib/projects"

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)

  // Combine main image and gallery images
  const allImages = project ? ([project.image_url, ...(project.gallery || [])].filter(Boolean) as string[]) : []

  useEffect(() => {
    const loadProject = async () => {
      if (params.id) {
        const projectData = await getProject(Number.parseInt(params.id as string))
        setProject(projectData)
        if (projectData?.image_url) {
          setSelectedImage(projectData.image_url)
        }
      }
      setLoading(false)
    }
    loadProject()
  }, [params.id])

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling && allImages.length > 1 && !isFullscreen) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % allImages.length
          setSelectedImage(allImages[nextIndex])
          return nextIndex
        })
      }, 3000)
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [isAutoScrolling, allImages, isFullscreen])

  const handlePrevious = () => {
    setIsAutoScrolling(false)
    const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
    setSelectedImage(allImages[newIndex])
  }

  const handleNext = () => {
    setIsAutoScrolling(false)
    const newIndex = (currentIndex + 1) % allImages.length
    setCurrentIndex(newIndex)
    setSelectedImage(allImages[newIndex])
  }

  const handleThumbnailClick = (image: string, index: number) => {
    setIsAutoScrolling(false)
    setCurrentIndex(index)
    setSelectedImage(image)
  }

  const handleImageClick = () => {
    setIsFullscreen(true)
    setIsAutoScrolling(false)
  }

  const handleCloseFullscreen = () => {
    setIsFullscreen(false)
  }

  const handleFullscreenPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    handlePrevious()
  }

  const handleFullscreenNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleNext()
  }

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isFullscreen])

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/projects" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Badge variant="secondary">{project.category}</Badge>
            {project.client && <div className="text-gray-400 text-sm">Client: {project.client}</div>}
            {project.featured && <Badge className="bg-green-600">Featured</Badge>}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{project.title}</h1>
          {project.impact && <p className="text-xl text-green-400 font-semibold mb-6">{project.impact}</p>}
        </div>

        {/* Main Image Display with Navigation Arrows */}
        {selectedImage && (
          <div className="mb-8 relative group">
            <div
              className="relative cursor-pointer overflow-hidden rounded-md"
              onClick={handleImageClick}
              style={{ height: "calc(24rem * 1.15)" }}
            >
              <img
                src={selectedImage || "/placeholder.svg"}
                alt={project.title}
                className="w-full h-full object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
              />

              {/* Zoom indicator */}
              <div className="absolute top-4 right-4 bg-slate-900/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={20} />
              </div>
            </div>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevious()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800/90 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800/90 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                >
                  <ChevronRight size={24} />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Gallery Thumbnails */}
        {allImages.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Project Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(image, index)}
                  className={`relative h-20 rounded-md overflow-hidden border-2 transition-all ${
                    currentIndex === index
                      ? "border-blue-400 ring-2 ring-blue-400/50"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-blue-400/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Auto-scroll indicator */}
            <div className="flex items-center justify-center mt-4 text-sm text-gray-400">
              {isAutoScrolling ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Auto-scrolling enabled
                </span>
              ) : (
                <button
                  onClick={() => setIsAutoScrolling(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Resume auto-scroll
                </button>
              )}
            </div>
          </div>
        )}

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
          {project.website_url && (
            <Link href={project.website_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="ai-glow bg-transparent">
                <ExternalLink size={16} className="mr-2" />
                View Live Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreen && selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={handleCloseFullscreen}
        >
          {/* Close Button */}
          <Button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800/90 text-white rounded-full p-3 z-10"
            size="sm"
          >
            <X size={24} />
          </Button>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-4 py-2 rounded-full text-sm z-10">
              {currentIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <Button
                onClick={handleFullscreenPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800/90 text-white rounded-full p-4 z-10"
                size="sm"
              >
                <ChevronLeft size={32} />
              </Button>
              <Button
                onClick={handleFullscreenNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800/90 text-white rounded-full p-4 z-10"
                size="sm"
              >
                <ChevronRight size={32} />
              </Button>
            </>
          )}

          {/* Full Size Image */}
          <img
            src={selectedImage || "/placeholder.svg"}
            alt={project?.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
            Press ESC or click outside to close
          </div>
        </div>
      )}
    </div>
  )
}
