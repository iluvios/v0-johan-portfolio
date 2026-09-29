"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Save,
  Edit,
  Trash2,
  Lock,
  KeyRound,
  FolderKanban,
  FileText,
  ExternalLink,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Star,
  LogOut,
  RefreshCw,
  Search,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Briefcase,
  Target,
  Users,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type BlogPost, saveBlogPost, getAllBlogPosts, deleteBlogPost, uploadBlogImage } from "@/lib/blog"
import {
  type Project,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from "@/lib/projects"
import { CVManager } from "@/components/admin/cv-manager"
import { RoadmapManager } from "@/components/admin/roadmap-manager"
import { CrmManager } from "@/components/admin/crm-manager"
import { CaseStudyEditor } from "@/components/admin/case-study-editor"
import { type CVProfile, DEFAULT_CV_DATA, getCVData, updateCVData } from "@/lib/profile-data"
import Link from "next/link"

type AdminTab = "pipeline" | "projects" | "articles" | "cv" | "roadmap"

const PROJECT_CATEGORIES = [
  "GTM & Automation",
  "Product & MVP",
  "Full-Funnel Strategy",
  "Marketing Automation",
  "Web Development",
  "E-commerce",
]

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [adminConfigured, setAdminConfigured] = useState(true)
  const [passcode, setPasscode] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [activeTab, setActiveTab] = useState<AdminTab>("pipeline")
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [projectSearch, setProjectSearch] = useState("")
  const [projectImageUploading, setProjectImageUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [isGalleryDragActive, setIsGalleryDragActive] = useState(false)
  const [newTagInput, setNewTagInput] = useState("")
  const [newGalleryUrl, setNewGalleryUrl] = useState("")
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  // Articles state
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [articleImageUploading, setArticleImageUploading] = useState(false)
  const [newArticleTagInput, setNewArticleTagInput] = useState("")

  // CV / Profile state
  const [cvData, setCvData] = useState<CVProfile>(DEFAULT_CV_DATA)
  const [isSavingCV, setIsSavingCV] = useState(false)
  const [isLoadingCV, setIsLoadingCV] = useState(false)

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated))
        setAdminConfigured(data.configured !== false)
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError(null)
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoginError(data.error || "Login failed.")
        return
      }
      setPasscode("")
      setIsAuthenticated(true)
    } catch {
      setLoginError("Login failed. Check your connection and try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {})
    setIsAuthenticated(false)
  }

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects()
      loadPosts()
      loadCV()
    }
  }, [isAuthenticated])

  const notify = (type: "success" | "error" | "info", text: string) => {
    setStatusMessage({ type, text })
    setTimeout(() => {
      setStatusMessage((current) => (current?.text === text ? null : current))
    }, 4000)
  }

  // --- CV MANAGEMENT ---
  const loadCV = async () => {
    setIsLoadingCV(true)
    try {
      const data = await getCVData()
      if (data) {
        setCvData(data)
      }
    } catch (error) {
      console.error("Error loading CV data:", error)
      notify("error", "Failed to load CV profile.")
    } finally {
      setIsLoadingCV(false)
    }
  }

  const handleSaveCV = async () => {
    setIsSavingCV(true)
    try {
      await updateCVData(cvData)
      notify("success", "CV profile updated and synced successfully!")
    } catch (error: any) {
      console.error("Error saving CV profile:", error)
      notify("error", error?.message || "Failed to save CV profile.")
    } finally {
      setIsSavingCV(false)
    }
  }

  // --- PROJECT MANAGEMENT ---
  const loadProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      console.error("Error loading projects:", error)
      notify("error", "Failed to load projects.")
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const saveProjectOrder = async (orderedList: Project[]) => {
    setIsReordering(true)
    try {
      const ids = orderedList.map((p) => p.id)
      await reorderProjects(ids)
      notify("success", "Project display order saved!")
    } catch (error: any) {
      console.error("Failed to save project order:", error)
      notify("error", "Failed to save project order.")
    } finally {
      setIsReordering(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (projectSearch) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (projectSearch || draggedIndex === null || draggedIndex === index) return
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (projectSearch || draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const updated = [...projects]
    const [moved] = updated.splice(draggedIndex, 1)
    updated.splice(targetIndex, 0, moved)

    setProjects(updated)
    setDraggedIndex(null)
    setDragOverIndex(null)
    saveProjectOrder(updated)
  }

  const handleMoveProject = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= projects.length) return
    const updated = [...projects]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setProjects(updated)
    saveProjectOrder(updated)
  }

  const handleCreateNewProject = () => {
    setEditingProject({
      title: "",
      client: "",
      impact: "",
      description: "",
      image_url: "/placeholder.svg",
      category: "Full-Funnel Strategy",
      tags: [],
      gallery: [],
      website_url: "",
      featured: false,
    })
    setIsCreatingProject(true)
  }

  const handleEditProject = (proj: Project) => {
    setEditingProject({
      ...proj,
      tags: [...(proj.tags || [])],
      gallery: [...(proj.gallery || [])],
    })
    setIsCreatingProject(false)
  }

  const handleSaveProject = async () => {
    if (!editingProject) return
    if (!editingProject.title?.trim()) {
      notify("error", "Project title is required.")
      return
    }

    setIsSavingProject(true)
    try {
      if (isCreatingProject || !editingProject.id) {
        const created = await createProject(
          editingProject as Omit<Project, "id" | "created_at" | "updated_at">,
        )
        setProjects((prev) => [created, ...prev])
        notify("success", `Project "${created.title}" created successfully!`)
      } else {
        const updated = await updateProject(editingProject.id, editingProject)
        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        notify("success", `Project "${updated.title}" updated successfully!`)
      }
      setEditingProject(null)
      setIsCreatingProject(false)
    } catch (error: any) {
      console.error("Error saving project:", error)
      notify("error", error?.message || "Failed to save project.")
    } finally {
      setIsSavingProject(false)
    }
  }

  const handleDeleteProject = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
      if (editingProject?.id === id) {
        setEditingProject(null)
      }
      notify("success", `Project "${title}" deleted.`)
    } catch (error: any) {
      console.error("Error deleting project:", error)
      notify("error", error?.message || "Failed to delete project.")
    }
  }

  const extractImageFiles = (e: React.ClipboardEvent): File[] => {
    const files: File[] = []
    const items = e.clipboardData?.items

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }
    }

    if (files.length === 0 && e.clipboardData?.files) {
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i]
        if (
          file.type.startsWith("image/") ||
          /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(file.name)
        ) {
          files.push(file)
        }
      }
    }

    return files
  }

  const uploadMainProjectImage = async (file: File) => {
    if (!editingProject) return
    setProjectImageUploading(true)
    notify("info", "Uploading main image...")
    try {
      const ext = file.type ? file.type.split("/")[1] || "png" : "png"
      const hasExtension = file.name && /\.[a-z0-9]+$/i.test(file.name)
      const cleanName =
        hasExtension && file.name !== "image.png"
          ? file.name
          : `main-${Date.now()}.${ext}`
      const fileToUpload = new File([file], cleanName, {
        type: file.type || `image/${ext}`,
      })
      const url = await uploadBlogImage(fileToUpload)
      setEditingProject((prev) => (prev ? { ...prev, image_url: url } : prev))
      notify("success", "Main image uploaded successfully.")
    } catch (error: any) {
      console.error("Error uploading project image:", error)
      notify("error", error?.message || "Failed to upload image.")
    } finally {
      setProjectImageUploading(false)
    }
  }

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadMainProjectImage(file)
    e.target.value = ""
  }

  const handleMainImagePaste = async (e: React.ClipboardEvent) => {
    const files = extractImageFiles(e)
    if (files.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      await uploadMainProjectImage(files[0])
    }
  }

  const handleAddProjectTag = () => {
    const trimmed = newTagInput.trim()
    if (!trimmed || !editingProject) return
    const currentTags = editingProject.tags || []
    if (!currentTags.includes(trimmed)) {
      setEditingProject({ ...editingProject, tags: [...currentTags, trimmed] })
    }
    setNewTagInput("")
  }

  const handleRemoveProjectTag = (tagToRemove: string) => {
    if (!editingProject) return
    setEditingProject({
      ...editingProject,
      tags: (editingProject.tags || []).filter((t) => t !== tagToRemove),
    })
  }

  const handleAddGalleryUrl = () => {
    const trimmed = newGalleryUrl.trim()
    if (!trimmed || !editingProject) return
    const currentGallery = editingProject.gallery || []
    if (!currentGallery.includes(trimmed)) {
      setEditingProject({ ...editingProject, gallery: [...currentGallery, trimmed] })
    }
    setNewGalleryUrl("")
  }

  const uploadGalleryFiles = async (files: File[]) => {
    if (!editingProject || files.length === 0) return

    setGalleryUploading(true)
    notify(
      "info",
      `Uploading ${files.length} image${files.length > 1 ? "s" : ""}...`
    )
    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.type ? file.type.split("/")[1] || "png" : "png"
        const hasExtension = file.name && /\.[a-z0-9]+$/i.test(file.name)
        const cleanName =
          hasExtension && file.name !== "image.png"
            ? file.name
            : `gallery-${Date.now()}-${i + 1}.${ext}`
        const fileToUpload = new File([file], cleanName, {
          type: file.type || `image/${ext}`,
        })

        const url = await uploadBlogImage(fileToUpload)
        uploadedUrls.push(url)
      }

      setEditingProject((prev) => {
        if (!prev) return prev
        const currentGallery = prev.gallery || []
        return {
          ...prev,
          gallery: [...currentGallery, ...uploadedUrls],
        }
      })
      notify(
        "success",
        uploadedUrls.length === 1
          ? "Gallery image uploaded and added."
          : `${uploadedUrls.length} gallery images uploaded and added.`
      )
    } catch (error: any) {
      console.error("Error uploading gallery image:", error)
      notify("error", error?.message || "Failed to upload gallery image.")
    } finally {
      setGalleryUploading(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    await uploadGalleryFiles(files)
    e.target.value = ""
  }

  const handleGalleryPaste = async (e: React.ClipboardEvent) => {
    const files = extractImageFiles(e)
    if (files.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      await uploadGalleryFiles(files)
    }
  }

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    if (!editingProject) return
    setEditingProject({
      ...editingProject,
      gallery: (editingProject.gallery || []).filter((_, idx) => idx !== indexToRemove),
    })
  }

  // --- ARTICLE MANAGEMENT ---
  const emptyPost: BlogPost = {
    id: "",
    title: "",
    excerpt: "",
    content: "",
    category: "Innovation",
    date: new Date().toISOString().split("T")[0],
    readTime: "5 min read",
    image: "",
    tags: [],
    published: false,
  }

  const loadPosts = async () => {
    const allPosts = await getAllBlogPosts()
    setPosts(allPosts)
  }

  const handleCreateNewArticle = () => {
    setEditingPost({ ...emptyPost, id: Date.now().toString() })
    setIsCreatingPost(true)
  }

  const handleEditArticle = (post: BlogPost) => {
    setEditingPost({ ...post, tags: [...(post.tags || [])] })
    setIsCreatingPost(false)
  }

  const handleSaveArticle = async () => {
    if (!editingPost) return
    if (!editingPost.title?.trim()) {
      notify("error", "Article title is required.")
      return
    }

    try {
      await saveBlogPost(editingPost)
      await loadPosts()
      setEditingPost(null)
      setIsCreatingPost(false)
      notify("success", `Article "${editingPost.title}" saved successfully!`)
    } catch (error) {
      console.error("Error saving post:", error)
      notify("error", "Failed to save article.")
    }
  }

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete article "${title}"?`)) return
    try {
      await deleteBlogPost(id)
      await loadPosts()
      if (editingPost?.id === id) {
        setEditingPost(null)
      }
      notify("success", `Article "${title}" deleted.`)
    } catch (error) {
      console.error("Error deleting article:", error)
      notify("error", "Failed to delete article.")
    }
  }

  const uploadArticleImage = async (file: File) => {
    if (!editingPost) return
    setArticleImageUploading(true)
    notify("info", "Uploading article image...")
    try {
      const ext = file.type ? file.type.split("/")[1] || "png" : "png"
      const hasExtension = file.name && /\.[a-z0-9]+$/i.test(file.name)
      const cleanName =
        hasExtension && file.name !== "image.png"
          ? file.name
          : `article-${Date.now()}.${ext}`
      const fileToUpload = new File([file], cleanName, {
        type: file.type || `image/${ext}`,
      })
      const imageUrl = await uploadBlogImage(fileToUpload)
      setEditingPost((prev) => (prev ? { ...prev, image: imageUrl } : prev))
      notify("success", "Article image uploaded successfully.")
    } catch (error: any) {
      console.error("Error uploading image:", error)
      notify("error", error?.message || "Failed to upload image.")
    } finally {
      setArticleImageUploading(false)
    }
  }

  const handleArticleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await uploadArticleImage(file)
    event.target.value = ""
  }

  const handleArticleImagePaste = async (e: React.ClipboardEvent) => {
    const files = extractImageFiles(e)
    if (files.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      await uploadArticleImage(files[0])
    }
  }

  const handleAddArticleTag = () => {
    const trimmed = newArticleTagInput.trim()
    if (!trimmed || !editingPost) return
    const currentTags = editingPost.tags || []
    if (!currentTags.includes(trimmed)) {
      setEditingPost({ ...editingPost, tags: [...currentTags, trimmed] })
    }
    setNewArticleTagInput("")
  }

  const handleRemoveArticleTag = (tag: string) => {
    if (!editingPost) return
    setEditingPost({ ...editingPost, tags: (editingPost.tags || []).filter((t) => t !== tag) })
  }

  // Filtered lists
  const filteredProjects = projects.filter((p) => {
    const query = projectSearch.toLowerCase()
    return (
      p.title.toLowerCase().includes(query) ||
      (p.client && p.client.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.tags || []).some((tag) => tag.toLowerCase().includes(query))
    )
  })

  if (!authChecked) {
    return <div className="min-h-screen" aria-busy="true" />
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 ai-glow">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">Admin</CardTitle>
            <p className="text-sm text-slate-400 mt-1">Enter your passcode to manage the site.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {!adminConfigured && (
                <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-md p-3">
                  Admin is disabled until the <code>ADMIN_PASSCODE</code> environment variable is set in Vercel
                  (or in <code>.env.local</code> for local development).
                </p>
              )}
              <div>
                <Input
                  type="password"
                  aria-label="Passcode"
                  placeholder="Passcode"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value)
                    setLoginError(null)
                  }}
                  className="bg-slate-900/80 border-slate-700 text-white"
                  autoFocus
                />
                {loginError && <p className="text-xs text-red-400 mt-1.5">{loginError}</p>}
              </div>
              <Button
                type="submit"
                disabled={isLoggingIn || !passcode}
                className="w-full ai-glow flex items-center justify-center gap-2"
              >
                <KeyRound size={16} />
                {isLoggingIn ? "Checking…" : "Unlock"}
              </Button>
              <div className="text-center pt-2">
                <Link href="/" className="text-xs text-slate-400 hover:text-blue-400 transition-colors">
                  Return to Portfolio
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Notification Banner */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between border transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : statusMessage.type === "info"
                ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300"
                : "bg-red-950/60 border-red-500/40 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              ) : statusMessage.type === "info" ? (
                <Loader2 size={18} className="animate-spin text-cyan-400 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-400 shrink-0" />
              )}
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Control Center</h1>
            <p className="text-sm text-slate-400 mt-1">
              Your job and client pipeline, projects, CV, and level-up roadmap.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "roadmap" || activeTab === "pipeline" ? null : activeTab === "projects" ? (
              <Button onClick={handleCreateNewProject} className="ai-glow flex items-center gap-2">
                <Plus size={16} />
                New Project
              </Button>
            ) : activeTab === "articles" ? (
              <Button onClick={handleCreateNewArticle} className="ai-glow flex items-center gap-2">
                <Plus size={16} />
                New Article
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  asChild
                  className="border-slate-700 text-slate-300 hover:text-white"
                >
                  <Link href="/cv" target="_blank">
                    <ExternalLink size={15} className="mr-1.5" />
                    Preview & Print CV
                  </Link>
                </Button>
                <Button
                  onClick={handleSaveCV}
                  disabled={isSavingCV}
                  className="ai-glow flex items-center gap-2"
                >
                  <Save size={16} />
                  {isSavingCV ? "Saving..." : "Save CV"}
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-700 text-slate-400 hover:text-white"
              title="Lock Admin"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 border-b border-slate-800 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setActiveTab("pipeline")
              setEditingProject(null)
              setEditingPost(null)
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "pipeline"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-md"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users size={18} />
            Pipeline
          </button>

          <button
            onClick={() => {
              setActiveTab("projects")
              setEditingPost(null)
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "projects"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-md"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderKanban size={18} />
            Projects
            <Badge variant="secondary" className="ml-1 text-xs bg-slate-800 text-slate-300">
              {projects.length}
            </Badge>
          </button>

          <button
            onClick={() => {
              setActiveTab("articles")
              setEditingProject(null)
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "articles"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-md"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText size={18} />
            Articles
            <Badge variant="secondary" className="ml-1 text-xs bg-slate-800 text-slate-300">
              {posts.length}
            </Badge>
          </button>

          <button
            onClick={() => {
              setActiveTab("cv")
              setEditingProject(null)
              setEditingPost(null)
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "cv"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-md"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase size={18} />
            CV / Resume
            <Badge variant="secondary" className="ml-1 text-xs bg-blue-950/60 text-blue-300 border border-blue-500/30">
              {cvData.experiences.length} roles
            </Badge>
          </button>

          <button
            onClick={() => {
              setActiveTab("roadmap")
              setEditingProject(null)
              setEditingPost(null)
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "roadmap"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-md"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target size={18} />
            Roadmap
          </button>
        </div>

        {/* TAB 1: PROJECTS */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Projects List */}
            <div className={editingProject ? "lg:col-span-5" : "lg:col-span-12"}>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">
                    Portfolio Projects ({filteredProjects.length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadProjects}
                    disabled={isLoadingProjects}
                    className="text-slate-400 hover:text-white"
                  >
                    <RefreshCw size={14} className={isLoadingProjects ? "animate-spin" : ""} />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search filter */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search projects by title, client, tag..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="pl-9 bg-slate-900/60 border-slate-700 text-sm text-white"
                    />
                  </div>

                  {/* Reorder instructions & status */}
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>
                      {projectSearch ? (
                        <span className="text-amber-400">Search active • Clear search to drag and reorder</span>
                      ) : (
                        <span>Drag handles or use arrows to change display order</span>
                      )}
                    </span>
                    {isReordering && (
                      <span className="text-blue-400 animate-pulse font-mono text-[11px]">Saving order...</span>
                    )}
                  </div>

                  {/* List items */}
                  <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                    {filteredProjects.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        No projects found.
                      </div>
                    ) : (
                      filteredProjects.map((project) => {
                        const isSelected = editingProject?.id === project.id
                        const realIndex = projects.findIndex((p) => p.id === project.id)
                        const isBeingDragged = draggedIndex === realIndex
                        const isDragOver = dragOverIndex === realIndex

                        return (
                          <div
                            key={project.id}
                            draggable={!projectSearch}
                            onDragStart={(e) => handleDragStart(e, realIndex)}
                            onDragOver={(e) => handleDragOver(e, realIndex)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, realIndex)}
                            className={`p-3 sm:p-4 rounded-lg border transition-all flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between ${
                              isBeingDragged
                                ? "opacity-40 border-dashed border-blue-400 scale-[0.98]"
                                : isDragOver
                                ? "border-t-2 border-t-blue-400 bg-blue-950/30"
                                : isSelected
                                ? "bg-blue-950/40 border-blue-500/50 ring-1 ring-blue-500/30"
                                : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600"
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              {/* Drag Handle & Up/Down Arrows */}
                              {!projectSearch && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <div
                                    className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-blue-400 p-1 flex items-center transition-colors"
                                    title="Drag to reorder"
                                  >
                                    <GripVertical size={16} />
                                  </div>
                                  <div className="flex flex-col -space-y-1">
                                    <button
                                      type="button"
                                      disabled={realIndex <= 0 || isReordering}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleMoveProject(realIndex, -1)
                                      }}
                                      className="p-0.5 text-slate-500 hover:text-blue-400 disabled:opacity-20 disabled:hover:text-slate-500 transition-colors"
                                      title="Move up"
                                    >
                                      <ChevronUp size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={realIndex >= projects.length - 1 || isReordering}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleMoveProject(realIndex, 1)
                                      }}
                                      className="p-0.5 text-slate-500 hover:text-blue-400 disabled:opacity-20 disabled:hover:text-slate-500 transition-colors"
                                      title="Move down"
                                    >
                                      <ChevronDown size={13} />
                                    </button>
                                  </div>
                                  <span className="text-[11px] font-mono text-slate-500 w-4 text-center">
                                    #{realIndex + 1}
                                  </span>
                                </div>
                              )}

                              <img
                                src={project.image_url || "/placeholder.svg"}
                                alt={project.title}
                                className="w-14 h-11 rounded object-cover border border-slate-700 bg-slate-800 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                                    {project.title}
                                  </h3>
                                  {project.featured && (
                                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] flex items-center gap-1 py-0">
                                      <Star size={10} className="fill-amber-300" /> Featured
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-[10px] text-slate-400 py-0">
                                    {project.category}
                                  </Badge>
                                </div>
                                {project.client && (
                                  <p className="text-xs text-blue-400 mt-0.5">{project.client}</p>
                                )}
                                {project.impact && (
                                  <p className="text-xs text-emerald-400 truncate mt-0.5">
                                    {project.impact}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {project.website_url && (
                                <a
                                  href={project.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded text-slate-400 hover:text-blue-400 transition-colors"
                                  title="View live website"
                                >
                                  <ExternalLink size={15} />
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProject(project)}
                                className="border-slate-700 hover:border-blue-400 hover:text-blue-400 h-8 px-2.5"
                                title="Edit project"
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteProject(project.id, project.title)}
                                className="border-slate-700 hover:border-red-400 hover:text-red-400 h-8 px-2.5"
                                title="Delete project"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Editor */}
            {editingProject && (
              <div className="lg:col-span-7">
                <Card className="bg-slate-800/60 border-slate-700 ai-glow">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {isCreatingProject ? "Create New Project" : "Edit Project"}
                      </CardTitle>
                      {editingProject.id && (
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          Project ID: #{editingProject.id}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProject(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
                    {/* Title */}
                    <div>
                      <Label htmlFor="proj-title" className="text-slate-200">
                        Project Title *
                      </Label>
                      <Input
                        id="proj-title"
                        value={editingProject.title || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        placeholder="e.g. Autobruder 4WD"
                        className="bg-slate-900/80 border-slate-700 text-white mt-1"
                      />
                    </div>

                    {/* Client & Category Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proj-client" className="text-slate-200">
                          Client / Company
                        </Label>
                        <Input
                          id="proj-client"
                          value={editingProject.client || ""}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, client: e.target.value })
                          }
                          placeholder="e.g. Autobruder"
                          className="bg-slate-900/80 border-slate-700 text-white mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="proj-category" className="text-slate-200">
                          Category
                        </Label>
                        <Select
                          value={editingProject.category || "Full-Funnel Strategy"}
                          onValueChange={(val) =>
                            setEditingProject({ ...editingProject, category: val })
                          }
                        >
                          <SelectTrigger className="bg-slate-900/80 border-slate-700 text-white mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700 text-white">
                            {[
                              ...PROJECT_CATEGORIES,
                              ...(editingProject.category && !PROJECT_CATEGORIES.includes(editingProject.category)
                                ? [editingProject.category]
                                : []),
                            ].map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Impact / Metric */}
                    <div>
                      <Label htmlFor="proj-impact" className="text-slate-200">
                        Impact / Key Metric
                      </Label>
                      <Input
                        id="proj-impact"
                        value={editingProject.impact || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, impact: e.target.value })
                        }
                        placeholder="e.g. +340% Lead Conversion Rate"
                        className="bg-slate-900/80 border-slate-700 text-white mt-1"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="proj-desc" className="text-slate-200">
                        Project Description
                      </Label>
                      <Textarea
                        id="proj-desc"
                        value={editingProject.description || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, description: e.target.value })
                        }
                        placeholder="Comprehensive summary of the problem, strategy, and results..."
                        rows={4}
                        className="bg-slate-900/80 border-slate-700 text-white mt-1"
                      />
                    </div>

                    {/* Website Live URL */}
                    <div>
                      <Label htmlFor="proj-url" className="text-slate-200">
                        Website / Live Demo URL
                      </Label>
                      <Input
                        id="proj-url"
                        value={editingProject.website_url || ""}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, website_url: e.target.value })
                        }
                        placeholder="https://example.com"
                        className="bg-slate-900/80 border-slate-700 text-white mt-1"
                      />
                    </div>

                    {/* Main Image */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-slate-200">Main Display Image</Label>
                        <span className="text-[11px] text-slate-400">
                          Paste with <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Ctrl+V</kbd>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={editingProject.image_url || ""}
                          onChange={(e) =>
                            setEditingProject({ ...editingProject, image_url: e.target.value })
                          }
                          onPaste={handleMainImagePaste}
                          onDrop={async (e) => {
                            e.preventDefault()
                            const files = Array.from(e.dataTransfer.files).filter(
                              (f) =>
                                f.type.startsWith("image/") ||
                                /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(f.name)
                            )
                            if (files.length > 0) {
                              await uploadMainProjectImage(files[0])
                            }
                          }}
                          onDragOver={(e) => {
                            if (e.dataTransfer.types.includes("Files")) {
                              e.preventDefault()
                            }
                          }}
                          placeholder="Paste image (Ctrl+V) or enter URL"
                          disabled={projectImageUploading}
                          className="bg-slate-900/80 border-slate-700 text-white flex-1 focus-visible:ring-cyan-500"
                        />
                        <label className={`cursor-pointer ${projectImageUploading ? "pointer-events-none opacity-50" : ""}`}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProjectImageUpload}
                            className="hidden"
                            disabled={projectImageUploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="border-slate-700 hover:border-blue-400 text-slate-300"
                            disabled={projectImageUploading}
                            asChild
                          >
                            <span>
                              {projectImageUploading ? (
                                <>
                                  <Loader2 size={14} className="mr-1.5 animate-spin" /> Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload size={14} className="mr-1.5" /> Upload
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                      {editingProject.image_url && (
                        <div className="mt-2 relative w-32 h-20 rounded border border-slate-700 overflow-hidden bg-slate-950">
                          <img
                            src={editingProject.image_url}
                            alt="Project thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Tags Manager */}
                    <div>
                      <Label className="text-slate-200">Tags / Technologies</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddProjectTag()
                            }
                          }}
                          placeholder="e.g. Next.js, Automation, HubSpot"
                          className="bg-slate-900/80 border-slate-700 text-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddProjectTag}
                          className="border-slate-700 hover:border-blue-400 text-slate-300"
                        >
                          Add Tag
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(editingProject.tags || []).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-slate-800 text-slate-300 border border-slate-700 pr-1 text-xs"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveProjectTag(tag)}
                              className="ml-1.5 hover:text-red-400 text-slate-400"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Gallery Manager */}
                    <div
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        isGalleryDragActive
                          ? "border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/30"
                          : "border-slate-800/80 bg-slate-900/30"
                      )}
                      onPaste={handleGalleryPaste}
                      onDragOver={(e) => {
                        if (e.dataTransfer.types.includes("Files")) {
                          e.preventDefault()
                          setIsGalleryDragActive(true)
                        }
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setIsGalleryDragActive(false)
                        }
                      }}
                      onDrop={async (e) => {
                        e.preventDefault()
                        setIsGalleryDragActive(false)
                        const files = Array.from(e.dataTransfer.files).filter(
                          (f) =>
                            f.type.startsWith("image/") ||
                            /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(f.name)
                        )
                        if (files.length > 0) {
                          await uploadGalleryFiles(files)
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-slate-200">Project Gallery Images</Label>
                        <span className="text-[11px] text-slate-400">
                          Paste with <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Ctrl+V</kbd>
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          onPaste={handleGalleryPaste}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddGalleryUrl()
                            }
                          }}
                          placeholder="Paste image (Ctrl+V) or enter URL"
                          disabled={galleryUploading}
                          className="bg-slate-900/80 border-slate-700 text-white flex-1 focus-visible:ring-cyan-500"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddGalleryUrl}
                          disabled={galleryUploading || !newGalleryUrl.trim()}
                          className="border-slate-700 hover:border-blue-400 text-slate-300"
                        >
                          Add URL
                        </Button>
                        <label className={`cursor-pointer ${galleryUploading ? "pointer-events-none opacity-50" : ""}`}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryUpload}
                            disabled={galleryUploading}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="border-slate-700 hover:border-blue-400 text-slate-300"
                            disabled={galleryUploading}
                            asChild
                          >
                            <span>
                              {galleryUploading ? (
                                <>
                                  <Loader2 size={14} className="mr-1 animate-spin" /> Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload size={14} className="mr-1" /> File
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-0.5">
                        <span>You can paste screenshots directly or drag and drop image files here.</span>
                        {galleryUploading && (
                          <span className="text-cyan-400 flex items-center gap-1 font-medium">
                            <Loader2 size={11} className="animate-spin" /> Uploading image...
                          </span>
                        )}
                      </div>

                      {/* Gallery preview chips */}
                      {((editingProject.gallery || []).length > 0 || galleryUploading) && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                          {(editingProject.gallery || []).map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="relative group h-16 rounded border border-slate-700 overflow-hidden bg-slate-900"
                            >
                              <img
                                src={imgUrl}
                                alt={`Gallery item ${idx}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          {galleryUploading && (
                            <div className="h-16 rounded border border-cyan-500/50 border-dashed bg-cyan-950/30 flex flex-col items-center justify-center text-cyan-400">
                              <Loader2 size={16} className="animate-spin mb-1" />
                              <span className="text-[10px] font-medium">Uploading...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <CaseStudyEditor
                      value={editingProject.case_study ?? null}
                      onChange={(case_study) => setEditingProject({ ...editingProject, case_study })}
                    />

                    {/* Featured Toggle */}
                    <div className="flex items-center space-x-3 pt-2">
                      <Switch
                        id="proj-featured"
                        checked={Boolean(editingProject.featured)}
                        onCheckedChange={(checked) =>
                          setEditingProject({ ...editingProject, featured: checked })
                        }
                      />
                      <Label htmlFor="proj-featured" className="text-slate-200 cursor-pointer">
                        Feature this project on homepage
                      </Label>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-700">
                      <Button
                        onClick={handleSaveProject}
                        disabled={isSavingProject}
                        className="ai-glow flex-1 flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        {isSavingProject ? "Saving..." : isCreatingProject ? "Create Project" : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingProject(null)}
                        className="border-slate-700 text-slate-300 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ARTICLES */}
        {activeTab === "articles" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Articles List */}
            <div className={editingPost ? "lg:col-span-5" : "lg:col-span-12"}>
              <Card className="bg-slate-800/50 border-slate-700">
                <div className="mx-6 mt-6 rounded-md border border-amber-500/30 bg-amber-950/40 p-3 text-xs text-amber-300">
                  Articles are saved in this browser only and are not visible to visitors yet. The public Notes
                  section stays hidden until articles are stored in the database.
                </div>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">Articles ({posts.length})</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadPosts}
                    className="text-slate-400 hover:text-white"
                  >
                    <RefreshCw size={14} />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
                    {posts.map((post) => {
                      const isSelected = editingPost?.id === post.id
                      return (
                        <div
                          key={post.id}
                          className={`p-3 sm:p-4 rounded-lg border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                            isSelected
                              ? "bg-blue-950/40 border-blue-500/50 ring-1 ring-blue-500/30"
                              : "bg-slate-900/40 border-slate-700/60 hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {post.image ? (
                              <img
                                src={post.image}
                                alt={post.title}
                                className="w-16 h-12 rounded object-cover border border-slate-700 bg-slate-800 shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-12 rounded border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-500 text-xs shrink-0">
                                No img
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                                {post.title || "Untitled"}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant={post.published ? "default" : "secondary"}
                                  className="text-[10px] py-0"
                                >
                                  {post.published ? "Published" : "Draft"}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] text-slate-400 py-0">
                                  {post.category}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditArticle(post)}
                              className="border-slate-700 hover:border-blue-400 hover:text-blue-400 h-8 px-2.5"
                              title="Edit article"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteArticle(post.id, post.title)}
                              className="border-slate-700 hover:border-red-400 hover:text-red-400 h-8 px-2.5"
                              title="Delete article"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Article Editor */}
            {editingPost && (
              <div className="lg:col-span-7">
                <Card className="bg-slate-800/60 border-slate-700 ai-glow">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">
                      {isCreatingPost ? "Create New Article" : "Edit Article"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPost(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
                    <div>
                      <Label htmlFor="post-title" className="text-slate-200">
                        Title *
                      </Label>
                      <Input
                        id="post-title"
                        value={editingPost.title}
                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                        className="bg-slate-900/80 border-slate-700 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="post-excerpt" className="text-slate-200">
                        Excerpt
                      </Label>
                      <Textarea
                        id="post-excerpt"
                        value={editingPost.excerpt}
                        onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                        className="bg-slate-900/80 border-slate-700 text-white mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="post-category" className="text-slate-200">
                          Category
                        </Label>
                        <Select
                          value={editingPost.category}
                          onValueChange={(value) =>
                            setEditingPost({ ...editingPost, category: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-900/80 border-slate-700 text-white mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700 text-white">
                            <SelectItem value="Innovation">Innovation</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Philosophy">Philosophy</SelectItem>
                            <SelectItem value="Automation">Automation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="post-readtime" className="text-slate-200">
                          Read Time
                        </Label>
                        <Input
                          id="post-readtime"
                          value={editingPost.readTime}
                          onChange={(e) =>
                            setEditingPost({ ...editingPost, readTime: e.target.value })
                          }
                          className="bg-slate-900/80 border-slate-700 text-white mt-1"
                          placeholder="e.g. 5 min read"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-slate-200">Featured Image</Label>
                        <span className="text-[11px] text-slate-400">
                          Paste with <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Ctrl+V</kbd>
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={editingPost.image || ""}
                          onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                          onPaste={handleArticleImagePaste}
                          onDrop={async (e) => {
                            e.preventDefault()
                            const files = Array.from(e.dataTransfer.files).filter(
                              (f) =>
                                f.type.startsWith("image/") ||
                                /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(f.name)
                            )
                            if (files.length > 0) {
                              await uploadArticleImage(files[0])
                            }
                          }}
                          onDragOver={(e) => {
                            if (e.dataTransfer.types.includes("Files")) {
                              e.preventDefault()
                            }
                          }}
                          placeholder="Paste image (Ctrl+V) or enter URL"
                          disabled={articleImageUploading}
                          className="bg-slate-900/80 border-slate-700 text-white flex-1 focus-visible:ring-cyan-500"
                        />
                        <label className={`cursor-pointer ${articleImageUploading ? "pointer-events-none opacity-50" : ""}`}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleArticleImageUpload}
                            className="hidden"
                            disabled={articleImageUploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="border-slate-700 hover:border-blue-400 text-slate-300"
                            disabled={articleImageUploading}
                            asChild
                          >
                            <span>
                              {articleImageUploading ? (
                                <>
                                  <Loader2 size={14} className="mr-1.5 animate-spin" /> Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload size={14} className="mr-1.5" /> Upload
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                      {editingPost.image && (
                        <div className="mt-2 relative w-32 h-20 rounded border border-slate-700 overflow-hidden bg-slate-950">
                          <img
                            src={editingPost.image}
                            alt="Article preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <Label className="text-slate-200">Tags</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newArticleTagInput}
                          onChange={(e) => setNewArticleTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddArticleTag()
                            }
                          }}
                          placeholder="e.g. AI, Growth"
                          className="bg-slate-900/80 border-slate-700 text-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddArticleTag}
                          className="border-slate-700 hover:border-blue-400 text-slate-300"
                        >
                          Add Tag
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(editingPost.tags || []).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-slate-800 text-slate-300 border border-slate-700 pr-1 text-xs"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveArticleTag(tag)}
                              className="ml-1.5 hover:text-red-400 text-slate-400"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="post-content" className="text-slate-200">
                        Content (Markdown)
                      </Label>
                      <Textarea
                        id="post-content"
                        value={editingPost.content}
                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                        className="bg-slate-900/80 border-slate-700 text-white font-mono text-sm mt-1"
                        rows={10}
                        placeholder="Write your article in Markdown..."
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <Switch
                        id="post-published"
                        checked={editingPost.published}
                        onCheckedChange={(checked) =>
                          setEditingPost({ ...editingPost, published: checked })
                        }
                      />
                      <Label htmlFor="post-published" className="text-slate-200 cursor-pointer">
                        Published
                      </Label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-700">
                      <Button
                        onClick={handleSaveArticle}
                        className="ai-glow flex-1 flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        Save Article
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingPost(null)}
                        className="border-slate-700 text-slate-300 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CV / RESUME */}
        {activeTab === "cv" && (
          <CVManager
            cvData={cvData}
            onChange={setCvData}
            onSave={handleSaveCV}
            isSaving={isSavingCV}
          />
        )}

        {/* TAB 4: ROADMAP */}
        {activeTab === "roadmap" && <RoadmapManager notify={notify} />}

        {/* TAB 0: PIPELINE (job + client CRM) */}
        {activeTab === "pipeline" && <CrmManager notify={notify} />}
      </div>
    </div>
  )
}
