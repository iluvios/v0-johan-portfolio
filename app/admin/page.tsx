"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Save,
  KeyRound,
  FolderKanban,
  FileText,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Briefcase,
  Target,
  Users,
  Loader2,
} from "lucide-react"
import { CVManager } from "@/components/admin/cv-manager"
import { RoadmapManager } from "@/components/admin/roadmap-manager"
import { CrmManager } from "@/components/admin/crm-manager"
import { ProjectsManager } from "@/components/admin/projects-manager"
import { ArticlesManager } from "@/components/admin/articles-manager"
import { type CVProfile, DEFAULT_CV_DATA, getCVData, updateCVData } from "@/lib/profile-data"
import type { AdminNotify } from "@/components/admin/admin-utils"
import Link from "next/link"

type AdminTab = "pipeline" | "projects" | "articles" | "cv" | "roadmap"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [adminConfigured, setAdminConfigured] = useState(true)
  const [passcode, setPasscode] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [activeTab, setActiveTab] = useState<AdminTab>("pipeline")
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // Counts for tab badges
  const [projectsCount, setProjectsCount] = useState<number | null>(null)
  const [articlesCount, setArticlesCount] = useState<number | null>(null)

  // Triggers for top-bar buttons
  const [newProjectTrigger, setNewProjectTrigger] = useState(0)
  const [newArticleTrigger, setNewArticleTrigger] = useState(0)

  // CV / Profile state
  const [cvData, setCvData] = useState<CVProfile>(DEFAULT_CV_DATA)
  const [isSavingCV, setIsSavingCV] = useState(false)

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

  const notify: AdminNotify = (type, text) => {
    setStatusMessage({ type, text })
    setTimeout(() => {
      setStatusMessage((current) => (current?.text === text ? null : current))
    }, 4000)
  }

  // --- CV MANAGEMENT ---
  const loadCV = async () => {
    try {
      const data = await getCVData()
      if (data) {
        setCvData(data)
      }
    } catch (error) {
      console.error("Error loading CV data:", error)
      notify("error", "Failed to load CV profile.")
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

  useEffect(() => {
    if (isAuthenticated) {
      loadCV()
    }
  }, [isAuthenticated])

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading admin panel...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/80 border-slate-700 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold gradient-text">Control Center</CardTitle>
            <p className="text-sm text-slate-400 mt-1">Enter your passcode to manage your portfolio</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
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
            {activeTab === "projects" ? (
              <Button onClick={() => setNewProjectTrigger((n) => n + 1)} className="ai-glow flex items-center gap-2">
                <Plus size={16} />
                New Project
              </Button>
            ) : activeTab === "articles" ? (
              <Button onClick={() => setNewArticleTrigger((n) => n + 1)} className="ai-glow flex items-center gap-2">
                <Plus size={16} />
                New Article
              </Button>
            ) : activeTab === "cv" ? (
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
            ) : null}
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
            onClick={() => setActiveTab("pipeline")}
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
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "projects"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-md"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderKanban size={18} />
            Projects
            {projectsCount !== null && (
              <Badge variant="secondary" className="ml-1 text-xs bg-slate-800 text-slate-300">
                {projectsCount}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === "articles"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-md"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText size={18} />
            Articles
            {articlesCount !== null && (
              <Badge variant="secondary" className="ml-1 text-xs bg-slate-800 text-slate-300">
                {articlesCount}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab("cv")}
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
            onClick={() => setActiveTab("roadmap")}
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

        {/* TAB 0: PIPELINE (job + client CRM) */}
        {activeTab === "pipeline" && <CrmManager notify={notify} />}

        {/* TAB 1: PROJECTS */}
        {activeTab === "projects" && (
          <ProjectsManager
            notify={notify}
            onProjectsCountChange={setProjectsCount}
            createTrigger={newProjectTrigger}
          />
        )}

        {/* TAB 2: ARTICLES */}
        {activeTab === "articles" && (
          <ArticlesManager
            notify={notify}
            onPostsCountChange={setArticlesCount}
            createTrigger={newArticleTrigger}
          />
        )}

        {/* TAB 3: CV / RESUME */}
        {activeTab === "cv" && (
          <CVManager
            cvData={cvData}
            onChange={setCvData}
            isSaving={isSavingCV}
            onSave={handleSaveCV}
          />
        )}

        {/* TAB 4: ROADMAP */}
        {activeTab === "roadmap" && <RoadmapManager notify={notify} />}
      </div>
    </div>
  )
}
