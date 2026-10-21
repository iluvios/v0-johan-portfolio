"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ExternalLink,
  FileText,
  FolderGit2,
  FolderKanban,
  Kanban,
  Layers,
  ListChecks,
  Loader2,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
  CornerDownRight,
  Calendar,
} from "lucide-react"
import {
  DEFAULT_WORKSPACE,
  PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  TASK_STATUS_OPTIONS,
  addChildTaskRecursive,
  countTasksRecursive,
  createBlankTask,
  createId,
  deleteTaskRecursive,
  findTaskRecursive,
  getWorkspace,
  saveWorkspace,
  updateTaskRecursive,
  type ProjectStatus,
  type TaskPriority,
  type TaskStatus,
  type WorkspaceBucketId,
  type WorkspaceData,
  type WorkspaceProject,
  type WorkspaceTask,
} from "@/lib/workspace"
import { AttachmentsSection, WysiwygEditor } from "@/components/admin/wysiwyg-editor"
import type { AdminNotify } from "@/components/admin/admin-utils"

interface WorkspaceManagerProps {
  notify: AdminNotify
}

type ViewMode = "project" | "all-tasks" | "board"

export function WorkspaceManager({ notify }: WorkspaceManagerProps) {
  const [workspace, setWorkspace] = useState<WorkspaceData>(DEFAULT_WORKSPACE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<"saved" | "unsaved" | "saving">("saved")

  // Navigation & Filtering state
  const [viewMode, setViewMode] = useState<ViewMode>("project")
  const [selectedBucketId, setSelectedBucketId] = useState<WorkspaceBucketId | "all">("all")
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    DEFAULT_WORKSPACE.projects[0]?.id ?? ""
  )
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [showProjectOverview, setShowProjectOverview] = useState(true)

  // Quick add inputs
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium")
  const [addingChildToTaskId, setAddingChildToTaskId] = useState<string | null>(null)
  const [newChildTitle, setNewChildTitle] = useState("")

  // New project modal/inline form
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectBucket, setNewProjectBucket] = useState<WorkspaceBucketId>("freelance-active")
  const [newProjectPriority, setNewProjectPriority] = useState<TaskPriority>("high")
  const [newProjectRepo, setNewProjectRepo] = useState("")

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getWorkspace()
      setWorkspace(data)
      if (data.projects.length > 0 && !data.projects.some((p) => p.id === selectedProjectId)) {
        setSelectedProjectId(data.projects[0].id)
      }
      setSaveState("saved")
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to load workspace")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerSave = (nextWorkspace: WorkspaceData, showToast = false) => {
    setWorkspace(nextWorkspace)
    setSaveState("unsaved")

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true)
      setSaveState("saving")
      try {
        await saveWorkspace(nextWorkspace)
        setSaveState("saved")
        if (showToast) notify("success", "Workspace saved!")
      } catch (err) {
        setSaveState("unsaved")
        if (showToast) {
          notify("error", err instanceof Error ? err.message : "Failed to save workspace")
        }
      } finally {
        setSaving(false)
      }
    }, showToast ? 10 : 750)
  }

  // Filtered projects
  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return workspace.projects.filter((proj) => {
      if (selectedBucketId !== "all" && proj.bucketId !== selectedBucketId) return false
      if (statusFilter !== "all" && proj.status !== statusFilter) return false
      if (priorityFilter !== "all" && proj.priority !== priorityFilter) return false
      if (!q) return true

      const inProj =
        proj.name.toLowerCase().includes(q) ||
        proj.summary.toLowerCase().includes(q) ||
        proj.tags.some((t) => t.toLowerCase().includes(q))
      if (inProj) return true

      // Also search nested tasks
      const hasMatchingTask = (tasks: WorkspaceTask[]): boolean =>
        tasks.some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            (t.children?.length ? hasMatchingTask(t.children) : false)
        )
      return hasMatchingTask(proj.tasks)
    })
  }, [workspace.projects, selectedBucketId, statusFilter, priorityFilter, searchQuery])

  const activeProject = useMemo(
    () =>
      workspace.projects.find((p) => p.id === selectedProjectId) ??
      filteredProjects[0] ??
      workspace.projects[0] ??
      null,
    [workspace.projects, filteredProjects, selectedProjectId]
  )

  const selectedTaskContext = useMemo(() => {
    if (!selectedTaskId) return null
    for (const proj of workspace.projects) {
      const found = findTaskRecursive(proj.tasks, selectedTaskId)
      if (found) return { project: proj, task: found }
    }
    return null
  }, [workspace.projects, selectedTaskId])

  // Update helpers
  const updateProject = (projectId: string, updater: (proj: WorkspaceProject) => WorkspaceProject) => {
    const nextProjects = workspace.projects.map((p) =>
      p.id === projectId ? { ...updater(p), updatedAt: new Date().toISOString() } : p
    )
    triggerSave({ ...workspace, projects: nextProjects })
  }

  const updateTaskInProject = (
    projectId: string,
    taskId: string,
    updater: (task: WorkspaceTask) => WorkspaceTask
  ) => {
    updateProject(projectId, (proj) => ({
      ...proj,
      tasks: updateTaskRecursive(proj.tasks, taskId, updater),
    }))
  }

  const handleToggleTaskCompleted = (projectId: string, task: WorkspaceTask) => {
    const nextCompleted = !task.completed
    updateTaskInProject(projectId, task.id, (t) => ({
      ...t,
      completed: nextCompleted,
      status: nextCompleted ? "done" : t.status === "done" ? "todo" : t.status,
    }))
  }

  const handleChangeTaskStatus = (projectId: string, taskId: string, status: TaskStatus) => {
    updateTaskInProject(projectId, taskId, (t) => ({
      ...t,
      status,
      completed: status === "done",
    }))
  }

  const handleChangeTaskPriority = (projectId: string, taskId: string, priority: TaskPriority) => {
    updateTaskInProject(projectId, taskId, (t) => ({
      ...t,
      priority,
    }))
  }

  const handleAddTopLevelTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProject || !newTaskTitle.trim()) return
    const task = createBlankTask(newTaskTitle.trim(), newTaskPriority)
    updateProject(activeProject.id, (proj) => ({
      ...proj,
      tasks: [...proj.tasks, task],
    }))
    setNewTaskTitle("")
  }

  const handleAddChildObjective = (projectId: string, parentTaskId: string, title?: string) => {
    const text = (title ?? newChildTitle).trim()
    if (!text) return
    const child = createBlankTask(text, "medium")
    updateProject(projectId, (proj) => ({
      ...proj,
      tasks: addChildTaskRecursive(proj.tasks, parentTaskId, child),
    }))
    setNewChildTitle("")
    setAddingChildToTaskId(null)
  }

  const handleDeleteTask = (projectId: string, taskId: string) => {
    if (selectedTaskId === taskId) setSelectedTaskId(null)
    updateProject(projectId, (proj) => ({
      ...proj,
      tasks: deleteTaskRecursive(proj.tasks, taskId),
    }))
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    const proj: WorkspaceProject = {
      id: `proj-${createId()}`,
      name: newProjectName.trim(),
      bucketId: newProjectBucket,
      status: "active",
      priority: newProjectPriority,
      summary: "",
      description: "",
      repoPath: newProjectRepo.trim() || undefined,
      tags: [],
      attachments: [],
      tasks: [],
      order: workspace.projects.length + 1,
      updatedAt: new Date().toISOString(),
    }
    const next = {
      ...workspace,
      projects: [proj, ...workspace.projects],
    }
    triggerSave(next, true)
    setSelectedProjectId(proj.id)
    setNewProjectName("")
    setNewProjectRepo("")
    setIsCreatingProject(false)
  }

  const handleDeleteProject = (projectId: string) => {
    const proj = workspace.projects.find((p) => p.id === projectId)
    if (!proj) return
    if (!window.confirm(`Delete project "${proj.name}" and all its tasks?`)) return
    const nextProjects = workspace.projects.filter((p) => p.id !== projectId)
    triggerSave({ ...workspace, projects: nextProjects }, true)
    if (selectedProjectId === projectId) {
      setSelectedProjectId(nextProjects[0]?.id ?? "")
    }
  }

  // Flatten all tasks across filtered projects for "All Tasks" & "Board" views
  const allFlattenedTasks = useMemo(() => {
    const list: { project: WorkspaceProject; task: WorkspaceTask; depth: number; parentTitle?: string }[] = []
    const walk = (proj: WorkspaceProject, tasks: WorkspaceTask[], depth: number, parentTitle?: string) => {
      for (const t of tasks) {
        list.push({ project: proj, task: t, depth, parentTitle })
        if (t.children?.length) {
          walk(proj, t.children, depth + 1, t.title)
        }
      }
    }
    for (const proj of filteredProjects) {
      walk(proj, proj.tasks, 0)
    }
    return list
  }, [filteredProjects])

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center gap-3 text-slate-400">
        <Loader2 size={20} className="animate-spin text-cyan-400" />
        <span>Loading your workspace...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Command Bar: Bucket Pills + View Mode + Save Status */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Bucket Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedBucketId("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedBucketId === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              All Buckets ({workspace.projects.length})
            </button>
            {workspace.buckets
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((bucket) => {
                const count = workspace.projects.filter((p) => p.bucketId === bucket.id).length
                const active = selectedBucketId === bucket.id
                return (
                  <button
                    key={bucket.id}
                    type="button"
                    onClick={() => {
                      setSelectedBucketId(bucket.id)
                      const firstInBucket = workspace.projects.find((p) => p.bucketId === bucket.id)
                      if (firstInBucket) setSelectedProjectId(firstInBucket.id)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{bucket.name}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        active ? "bg-blue-800 text-blue-100" : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
          </div>

          {/* Save Status & Quick Actions */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mr-1">
              {saveState === "saving" ? (
                <>
                  <Loader2 size={12} className="animate-spin text-cyan-400" />
                  <span>Saving…</span>
                </>
              ) : saveState === "unsaved" ? (
                <span className="text-amber-400">Unsaved edits</span>
              ) : (
                <span className="text-emerald-400/90">All changes saved</span>
              )}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerSave(workspace, true)}
              disabled={saving}
              className="h-8 border-slate-700 bg-slate-900 text-slate-200 hover:text-white"
            >
              <Save size={14} className="mr-1.5" />
              Save
            </Button>

            <Button
              size="sm"
              onClick={() => setIsCreatingProject((v) => !v)}
              className="h-8 ai-glow flex items-center gap-1.5"
            >
              <Plus size={14} />
              New Project
            </Button>
          </div>
        </div>

        {/* Second Row: Search, Flexible Filters, View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, tasks, nested objectives..."
                className="h-8 pl-8 text-xs bg-slate-950/80 border-slate-800 text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-slate-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ProjectStatus | "all")}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs bg-slate-950/80 border-slate-800 text-slate-200">
                <SelectValue placeholder="Project Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                <SelectItem value="all">All Statuses</SelectItem>
                {PROJECT_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as TaskPriority | "all")}
            >
              <SelectTrigger className="h-8 w-[145px] text-xs bg-slate-950/80 border-slate-800 text-slate-200">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Switcher */}
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950/80 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("project")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "project"
                  ? "bg-slate-800 text-cyan-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers size={13} />
              Workspace
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all-tasks")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "all-tasks"
                  ? "bg-slate-800 text-cyan-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ListChecks size={13} />
              All Tasks ({allFlattenedTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "board"
                  ? "bg-slate-800 text-cyan-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Kanban size={13} />
              Board
            </button>
          </div>
        </div>

        {/* Inline New Project Form */}
        {isCreatingProject && (
          <form
            onSubmit={handleCreateProject}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-3 border-t border-slate-800"
          >
            <Input
              placeholder="Project or Idea Name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="sm:col-span-4 h-9 text-xs bg-slate-950 border-slate-700 text-white"
              autoFocus
            />
            <div className="sm:col-span-3">
              <Select
                value={newProjectBucket}
                onValueChange={(v) => setNewProjectBucket(v as WorkspaceBucketId)}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-950 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                  {workspace.buckets.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Select
                value={newProjectPriority}
                onValueChange={(v) => setNewProjectPriority(v as TaskPriority)}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-950 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Repo path or URL (optional)"
              value={newProjectRepo}
              onChange={(e) => setNewProjectRepo(e.target.value)}
              className="sm:col-span-2 h-9 text-xs bg-slate-950 border-slate-700 text-white"
            />
            <div className="sm:col-span-1 flex gap-1">
              <Button type="submit" size="sm" className="h-9 w-full text-xs">
                Create
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: NOTION + ASANA WORKSPACE (SIDEBAR + PROJECT PAGE + DRAWER)    */}
      {/* ===================================================================== */}
      {viewMode === "project" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar: Projects List */}
          <div className="lg:col-span-3 space-y-2 max-h-[80vh] overflow-y-auto pr-1">
            {filteredProjects.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-xs text-slate-400">
                No projects match the current filter.
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const isSelected = activeProject?.id === proj.id
                const stats = countTasksRecursive(proj.tasks)
                const prioMeta =
                  PRIORITY_OPTIONS.find((p) => p.value === proj.priority) ?? PRIORITY_OPTIONS[2]
                const statusMeta =
                  PROJECT_STATUS_OPTIONS.find((s) => s.value === proj.status) ??
                  PROJECT_STATUS_OPTIONS[0]

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id)
                      setSelectedTaskId(null)
                    }}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      isSelected
                        ? "border-blue-500/70 bg-blue-950/25 shadow-md"
                        : "border-slate-800/90 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${prioMeta.dotClass}`} />
                        <h3 className="font-semibold text-sm text-slate-100 truncate">
                          {proj.name}
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 shrink-0 ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </Badge>
                    </div>

                    {proj.summary && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">{proj.summary}</p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {stats.done}/{stats.total} tasks
                      </span>
                      <span>{stats.pct}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Center / Right Main Area: Active Project + Optional Task Detail Drawer */}
          <div
            className={`${
              selectedTaskContext ? "lg:col-span-5" : "lg:col-span-9"
            } space-y-5 transition-all`}
          >
            {activeProject ? (
              <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                <CardHeader className="pb-4 border-b border-slate-800/80 space-y-3">
                  {/* Project Title + Delete */}
                  <div className="flex items-start justify-between gap-3">
                    <Input
                      value={activeProject.name}
                      onChange={(e) =>
                        updateProject(activeProject.id, (p) => ({ ...p, name: e.target.value }))
                      }
                      className="text-xl font-bold bg-transparent border-transparent hover:border-slate-700 focus:border-blue-500 px-2 -ml-2 h-10 text-white"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(activeProject.id)}
                      className="text-slate-500 hover:text-rose-400 h-8 px-2"
                      title="Delete Project"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>

                  {/* Flexible Notion-Style Project Properties Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Bucket / Goal
                      </label>
                      <Select
                        value={activeProject.bucketId}
                        onValueChange={(v) =>
                          updateProject(activeProject.id, (p) => ({
                            ...p,
                            bucketId: v as WorkspaceBucketId,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                          {workspace.buckets.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Project Status
                      </label>
                      <Select
                        value={activeProject.status}
                        onValueChange={(v) =>
                          updateProject(activeProject.id, (p) => ({
                            ...p,
                            status: v as ProjectStatus,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                          {PROJECT_STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Priority
                      </label>
                      <Select
                        value={activeProject.priority}
                        onValueChange={(v) =>
                          updateProject(activeProject.id, (p) => ({
                            ...p,
                            priority: v as TaskPriority,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                          {PRIORITY_OPTIONS.map((prio) => (
                            <SelectItem key={prio.value} value={prio.value}>
                              {prio.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Summary & Repo Path */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <Input
                      value={activeProject.summary}
                      onChange={(e) =>
                        updateProject(activeProject.id, (p) => ({ ...p, summary: e.target.value }))
                      }
                      placeholder="Short one-line summary..."
                      className="h-8 text-xs bg-slate-950/70 border-slate-800 text-slate-200"
                    />
                    <div className="flex items-center gap-1.5">
                      <FolderGit2 size={14} className="text-slate-500 shrink-0" />
                      <Input
                        value={activeProject.repoPath ?? ""}
                        onChange={(e) =>
                          updateProject(activeProject.id, (p) => ({
                            ...p,
                            repoPath: e.target.value,
                          }))
                        }
                        placeholder="Local repo path (C:\Users\...) or live URL"
                        className="h-8 text-xs bg-slate-950/70 border-slate-800 text-slate-300 font-mono"
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-5 space-y-6">
                  {/* Collapsible Project Notes (WYSIWYG) & Project Files */}
                  <div className="rounded-xl border border-slate-800/90 bg-slate-950/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowProjectOverview((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-900/60 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {showProjectOverview ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                        <FileText size={13} className="text-cyan-400" />
                        Project Notes, Specs & Files (WYSIWYG)
                      </span>
                      <span className="text-[11px] font-normal text-slate-500">
                        {activeProject.attachments.length > 0
                          ? `${activeProject.attachments.length} file(s)`
                          : "Click to toggle"}
                      </span>
                    </button>

                    {showProjectOverview && (
                      <div className="p-4 pt-2 space-y-4 border-t border-slate-800/70">
                        <WysiwygEditor
                          value={activeProject.description}
                          onChange={(html) =>
                            updateProject(activeProject.id, (p) => ({ ...p, description: html }))
                          }
                          placeholder="Write project brief, client notes, architecture, or paste screenshots here..."
                          minHeight="130px"
                          onAttachmentUploaded={(att) =>
                            updateProject(activeProject.id, (p) => ({
                              ...p,
                              attachments: [...p.attachments, att],
                            }))
                          }
                        />

                        <AttachmentsSection
                          attachments={activeProject.attachments}
                          onChange={(nextAtts) =>
                            updateProject(activeProject.id, (p) => ({
                              ...p,
                              attachments: nextAtts,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Tasks & Nested Objectives Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <ListChecks size={15} className="text-blue-400" />
                        Tasks & Nested Objectives
                      </h4>
                      <span className="text-xs text-slate-400">
                        Click any task to open its rich editor & files
                      </span>
                    </div>

                    {/* Quick Add Task Bar */}
                    <form onSubmit={handleAddTopLevelTask} className="flex items-center gap-2">
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="+ Add a new task or milestone (press Enter)..."
                        className="h-9 text-xs bg-slate-950 border-slate-800 text-white flex-1"
                      />
                      <Select
                        value={newTaskPriority}
                        onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}
                      >
                        <SelectTrigger className="h-9 w-[130px] text-xs bg-slate-950 border-slate-800 text-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                          {PRIORITY_OPTIONS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="submit" size="sm" className="h-9 px-3 text-xs">
                        <Plus size={14} className="mr-1" />
                        Add
                      </Button>
                    </form>

                    {/* Recursive Task Tree */}
                    {activeProject.tasks.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
                        No tasks in this project yet. Add one above!
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {activeProject.tasks.map((task) => (
                          <TaskTreeNode
                            key={task.id}
                            projectId={activeProject.id}
                            task={task}
                            depth={0}
                            selectedTaskId={selectedTaskId}
                            addingChildToTaskId={addingChildToTaskId}
                            newChildTitle={newChildTitle}
                            onSelectTask={(tId) => setSelectedTaskId(tId)}
                            onToggleComplete={(t) =>
                              handleToggleTaskCompleted(activeProject.id, t)
                            }
                            onChangeStatus={(tId, st) =>
                              handleChangeTaskStatus(activeProject.id, tId, st)
                            }
                            onChangePriority={(tId, pr) =>
                              handleChangeTaskPriority(activeProject.id, tId, pr)
                            }
                            onToggleExpand={(tId) =>
                              updateTaskInProject(activeProject.id, tId, (t) => ({
                                ...t,
                                expanded: !(t.expanded ?? true),
                              }))
                            }
                            onStartAddChild={(tId) => {
                              setAddingChildToTaskId(tId)
                              setNewChildTitle("")
                            }}
                            onCancelAddChild={() => {
                              setAddingChildToTaskId(null)
                              setNewChildTitle("")
                            }}
                            onNewChildTitleChange={setNewChildTitle}
                            onSubmitAddChild={(parentId) =>
                              handleAddChildObjective(activeProject.id, parentId)
                            }
                            onDeleteTask={(tId) => handleDeleteTask(activeProject.id, tId)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Right Pane: Task / Objective Detail Drawer (WYSIWYG, Sub-Objectives, Files) */}
          {selectedTaskContext && (
            <div className="lg:col-span-4">
              <TaskDetailDrawer
                project={selectedTaskContext.project}
                task={selectedTaskContext.task}
                onClose={() => setSelectedTaskId(null)}
                onSelectTask={(tId) => setSelectedTaskId(tId)}
                onUpdateTask={(updater) =>
                  updateTaskInProject(
                    selectedTaskContext.project.id,
                    selectedTaskContext.task.id,
                    updater
                  )
                }
                onAddChild={(title) =>
                  handleAddChildObjective(
                    selectedTaskContext.project.id,
                    selectedTaskContext.task.id,
                    title
                  )
                }
                onToggleChildComplete={(child) =>
                  handleToggleTaskCompleted(selectedTaskContext.project.id, child)
                }
                onDeleteTask={() =>
                  handleDeleteTask(
                    selectedTaskContext.project.id,
                    selectedTaskContext.task.id
                  )
                }
              />
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: ALL TASKS MASTER VIEW (ACROSS ALL PROJECTS)                   */}
      {/* ===================================================================== */}
      {viewMode === "all-tasks" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <Card
            className={`${
              selectedTaskContext ? "lg:col-span-7" : "lg:col-span-12"
            } border-slate-800 bg-slate-900/60`}
          >
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-base text-slate-100 flex items-center justify-between">
                <span>All Tasks & Objectives ({allFlattenedTasks.length})</span>
                <span className="text-xs font-normal text-slate-400">
                  Sorted by Priority • Nothing blocks nothing
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-1.5">
              {allFlattenedTasks
                .slice()
                .sort((a, b) => {
                  if (a.task.completed !== b.task.completed) return a.task.completed ? 1 : -1
                  const order: Record<TaskPriority, number> = {
                    urgent: 0,
                    high: 1,
                    medium: 2,
                    low: 3,
                    none: 4,
                  }
                  return order[a.task.priority] - order[b.task.priority]
                })
                .map(({ project, task, parentTitle }) => {
                  const prioMeta =
                    PRIORITY_OPTIONS.find((p) => p.value === task.priority) ?? PRIORITY_OPTIONS[2]
                  const statusMeta =
                    TASK_STATUS_OPTIONS.find((s) => s.value === task.status) ??
                    TASK_STATUS_OPTIONS[0]

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedProjectId(project.id)
                        setSelectedTaskId(task.id)
                      }}
                      className={`cursor-pointer flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors ${
                        selectedTaskId === task.id
                          ? "border-blue-500/70 bg-blue-950/30"
                          : "border-slate-800/80 bg-slate-950/50 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleTaskCompleted(project.id, task)
                          }}
                          className="text-slate-400 hover:text-emerald-400 shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          ) : (
                            <Circle size={16} />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-medium truncate ${
                              task.completed ? "line-through text-slate-500" : "text-slate-100"
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span className="text-cyan-400/90">{project.name}</span>
                            {parentTitle && <span>↳ {parentTitle}</span>}
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Select
                          value={task.status}
                          onValueChange={(v) =>
                            handleChangeTaskStatus(project.id, task.id, v as TaskStatus)
                          }
                        >
                          <SelectTrigger
                            className={`h-6 px-2 text-[10px] border rounded-full w-auto gap-1 ${statusMeta.color}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            {TASK_STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value} className="text-xs">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={task.priority}
                          onValueChange={(v) =>
                            handleChangeTaskPriority(project.id, task.id, v as TaskPriority)
                          }
                        >
                          <SelectTrigger
                            className={`h-6 px-2 text-[10px] border rounded-full w-auto gap-1 ${prioMeta.badgeClass}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            {PRIORITY_OPTIONS.map((p) => (
                              <SelectItem key={p.value} value={p.value} className="text-xs">
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </Card>

          {selectedTaskContext && (
            <div className="lg:col-span-5">
              <TaskDetailDrawer
                project={selectedTaskContext.project}
                task={selectedTaskContext.task}
                onClose={() => setSelectedTaskId(null)}
                onSelectTask={(tId) => setSelectedTaskId(tId)}
                onUpdateTask={(updater) =>
                  updateTaskInProject(
                    selectedTaskContext.project.id,
                    selectedTaskContext.task.id,
                    updater
                  )
                }
                onAddChild={(title) =>
                  handleAddChildObjective(
                    selectedTaskContext.project.id,
                    selectedTaskContext.task.id,
                    title
                  )
                }
                onToggleChildComplete={(child) =>
                  handleToggleTaskCompleted(selectedTaskContext.project.id, child)
                }
                onDeleteTask={() =>
                  handleDeleteTask(
                    selectedTaskContext.project.id,
                    selectedTaskContext.task.id
                  )
                }
              />
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: KANBAN BOARD VIEW BY TASK STATUS                              */}
      {/* ===================================================================== */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {TASK_STATUS_OPTIONS.map((col) => {
            const colItems = allFlattenedTasks.filter((item) => item.task.status === col.value)
            return (
              <div
                key={col.value}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between px-1">
                  <Badge variant="outline" className={`text-xs ${col.color}`}>
                    {col.label}
                  </Badge>
                  <span className="text-xs text-slate-500">{colItems.length}</span>
                </div>

                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-0.5">
                  {colItems.map(({ project, task }) => {
                    const prioMeta =
                      PRIORITY_OPTIONS.find((p) => p.value === task.priority) ??
                      PRIORITY_OPTIONS[2]
                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedProjectId(project.id)
                          setSelectedTaskId(task.id)
                          setViewMode("project")
                        }}
                        className="cursor-pointer rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 hover:border-blue-500/50 transition-all space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-medium text-slate-100 leading-snug">
                            {task.title}
                          </span>
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 mt-1 ${prioMeta.dotClass}`}
                            title={prioMeta.label}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate text-cyan-400/90">{project.name}</span>
                          {task.children?.length > 0 && (
                            <span>
                              {task.children.filter((c) => c.completed).length}/
                              {task.children.length} sub
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Recursive Task Tree Node Component (Supports unlimited nested objectives)
// ============================================================================

interface TaskTreeNodeProps {
  projectId: string
  task: WorkspaceTask
  depth: number
  selectedTaskId: string | null
  addingChildToTaskId: string | null
  newChildTitle: string
  onSelectTask: (taskId: string) => void
  onToggleComplete: (task: WorkspaceTask) => void
  onChangeStatus: (taskId: string, status: TaskStatus) => void
  onChangePriority: (taskId: string, priority: TaskPriority) => void
  onToggleExpand: (taskId: string) => void
  onStartAddChild: (taskId: string) => void
  onCancelAddChild: () => void
  onNewChildTitleChange: (val: string) => void
  onSubmitAddChild: (parentTaskId: string) => void
  onDeleteTask: (taskId: string) => void
}

function TaskTreeNode({
  projectId,
  task,
  depth,
  selectedTaskId,
  addingChildToTaskId,
  newChildTitle,
  onSelectTask,
  onToggleComplete,
  onChangeStatus,
  onChangePriority,
  onToggleExpand,
  onStartAddChild,
  onCancelAddChild,
  onNewChildTitleChange,
  onSubmitAddChild,
  onDeleteTask,
}: TaskTreeNodeProps) {
  const hasChildren = Boolean(task.children && task.children.length > 0)
  const expanded = task.expanded ?? true
  const isSelected = selectedTaskId === task.id
  const prioMeta = PRIORITY_OPTIONS.find((p) => p.value === task.priority) ?? PRIORITY_OPTIONS[2]
  const statusMeta = TASK_STATUS_OPTIONS.find((s) => s.value === task.status) ?? TASK_STATUS_OPTIONS[0]
  const childStats = hasChildren ? countTasksRecursive(task.children) : null

  return (
    <div className="space-y-1">
      <div
        style={{ marginLeft: `${Math.min(depth * 22, 88)}px` }}
        onClick={() => onSelectTask(task.id)}
        className={`group flex flex-wrap items-center justify-between gap-2 rounded-lg border px-2.5 py-2 cursor-pointer transition-all ${
          isSelected
            ? "border-blue-500/70 bg-blue-950/30 shadow-sm"
            : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/70"
        }`}
      >
        {/* Left: Expand Chevron + Checkbox + Title + Meta Icons */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(task.id)
              }}
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
              title={expanded ? "Collapse nested objectives" : "Expand nested objectives"}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-4 shrink-0 flex justify-center text-slate-700">
              {depth > 0 ? <CornerDownRight size={12} /> : null}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete(task)
            }}
            className="text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
            title="Toggle completion"
          >
            {task.completed ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <Circle size={16} />
            )}
          </button>

          <span
            className={`text-xs font-medium truncate ${
              task.completed ? "line-through text-slate-500" : "text-slate-100"
            }`}
          >
            {task.title}
          </span>

          {/* Sub-objectives pill */}
          {childStats && (
            <span className="rounded bg-slate-800/90 px-1.5 py-0.5 text-[10px] text-slate-300 shrink-0">
              {childStats.done}/{childStats.total}
            </span>
          )}

          {/* Rich description indicator */}
          {task.description && task.description.trim() !== "" && (
            <span title="Has rich description / notes" className="text-cyan-400/80 shrink-0">
              <FileText size={12} />
            </span>
          )}

          {/* Attachments count */}
          {task.attachments?.length > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 shrink-0">
              <Paperclip size={11} />
              {task.attachments.length}
            </span>
          )}
        </div>

        {/* Right: Quick Add Sub-objective + Flexible Status & Priority Dropdowns */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onStartAddChild(task.id)}
            className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-slate-800 hover:text-cyan-300 transition-opacity"
            title="Add nested objective inside this task"
          >
            <Plus size={11} />
            Sub-objective
          </button>

          <Select
            value={task.status}
            onValueChange={(v) => onChangeStatus(task.id, v as TaskStatus)}
          >
            <SelectTrigger
              className={`h-6 px-2 text-[10px] border rounded-full w-auto gap-1 ${statusMeta.color}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
              {TASK_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={task.priority}
            onValueChange={(v) => onChangePriority(task.id, v as TaskPriority)}
          >
            <SelectTrigger
              className={`h-6 px-2 text-[10px] border rounded-full w-auto gap-1 ${prioMeta.badgeClass}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
            title="Delete task"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Inline Add Sub-Objective Input */}
      {addingChildToTaskId === task.id && (
        <div
          style={{ marginLeft: `${Math.min((depth + 1) * 22, 88)}px` }}
          className="flex items-center gap-2 py-1"
        >
          <CornerDownRight size={13} className="text-cyan-400 shrink-0" />
          <Input
            value={newChildTitle}
            onChange={(e) => onNewChildTitleChange(e.target.value)}
            placeholder="Nested objective title (press Enter)..."
            className="h-7 text-xs bg-slate-950 border-slate-700 text-white flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                onSubmitAddChild(task.id)
              } else if (e.key === "Escape") {
                onCancelAddChild()
              }
            }}
          />
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => onSubmitAddChild(task.id)}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-slate-400"
            onClick={onCancelAddChild}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Render Nested Objectives Recursively */}
      {hasChildren && expanded && (
        <div className="space-y-1">
          {task.children.map((child) => (
            <TaskTreeNode
              key={child.id}
              projectId={projectId}
              task={child}
              depth={depth + 1}
              selectedTaskId={selectedTaskId}
              addingChildToTaskId={addingChildToTaskId}
              newChildTitle={newChildTitle}
              onSelectTask={onSelectTask}
              onToggleComplete={onToggleComplete}
              onChangeStatus={onChangeStatus}
              onChangePriority={onChangePriority}
              onToggleExpand={onToggleExpand}
              onStartAddChild={onStartAddChild}
              onCancelAddChild={onCancelAddChild}
              onNewChildTitleChange={onNewChildTitleChange}
              onSubmitAddChild={onSubmitAddChild}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Task / Objective Detail Drawer (Notion / Asana Right Pane)
// ============================================================================

interface TaskDetailDrawerProps {
  project: WorkspaceProject
  task: WorkspaceTask
  onClose: () => void
  onSelectTask: (taskId: string) => void
  onUpdateTask: (updater: (t: WorkspaceTask) => WorkspaceTask) => void
  onAddChild: (title: string) => void
  onToggleChildComplete: (child: WorkspaceTask) => void
  onDeleteTask: () => void
}

function TaskDetailDrawer({
  project,
  task,
  onClose,
  onSelectTask,
  onUpdateTask,
  onAddChild,
  onToggleChildComplete,
  onDeleteTask,
}: TaskDetailDrawerProps) {
  const [subTitle, setSubTitle] = useState("")

  return (
    <Card className="border-blue-500/40 bg-slate-900/90 backdrop-blur-md shadow-2xl sticky top-6">
      <CardHeader className="pb-3 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-cyan-400 truncate">
            {project.name}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteTask}
              className="h-7 px-2 text-slate-400 hover:text-rose-400"
              title="Delete task"
            >
              <Trash2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 px-2 text-slate-400 hover:text-white"
              title="Close panel"
            >
              <X size={15} />
            </Button>
          </div>
        </div>

        {/* Completion + Title */}
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => {
              const nextCompleted = !task.completed
              onUpdateTask((t) => ({
                ...t,
                completed: nextCompleted,
                status: nextCompleted ? "done" : t.status === "done" ? "todo" : t.status,
              }))
            }}
            className="mt-1.5 text-slate-400 hover:text-emerald-400 shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 size={19} className="text-emerald-400" />
            ) : (
              <Circle size={19} />
            )}
          </button>
          <Input
            value={task.title}
            onChange={(e) => onUpdateTask((t) => ({ ...t, title: e.target.value }))}
            className="text-base font-semibold bg-slate-950/60 border-slate-800 text-white h-9"
          />
        </div>

        {/* Flexible Fields: Status, Priority, Due Date */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
              Status
            </label>
            <Select
              value={task.status}
              onValueChange={(v) =>
                onUpdateTask((t) => ({
                  ...t,
                  status: v as TaskStatus,
                  completed: v === "done",
                }))
              }
            >
              <SelectTrigger className="h-7 text-xs bg-slate-950 border-slate-800 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                {TASK_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
              Priority
            </label>
            <Select
              value={task.priority}
              onValueChange={(v) =>
                onUpdateTask((t) => ({
                  ...t,
                  priority: v as TaskPriority,
                }))
              }
            >
              <SelectTrigger className="h-7 text-xs bg-slate-950 border-slate-800 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
              Due Date
            </label>
            <Input
              type="date"
              value={task.dueDate ?? ""}
              onChange={(e) =>
                onUpdateTask((t) => ({ ...t, dueDate: e.target.value || undefined }))
              }
              className="h-7 text-xs bg-slate-950 border-slate-800 text-slate-200 px-2"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5 max-h-[72vh] overflow-y-auto">
        {/* Rich WYSIWYG Description Editor */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Description & Notes (WYSIWYG)
          </label>
          <WysiwygEditor
            value={task.description}
            onChange={(html) => onUpdateTask((t) => ({ ...t, description: html }))}
            placeholder="Add detailed notes, acceptance criteria, links, or paste images..."
            minHeight="160px"
            onAttachmentUploaded={(att) =>
              onUpdateTask((t) => ({
                ...t,
                attachments: [...(t.attachments ?? []), att],
              }))
            }
          />
        </div>

        {/* Nested Objectives Inside This Task */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Nested Objectives ({task.children?.length ?? 0})</span>
            <span className="text-[10px] font-normal text-slate-500">
              Click any sub-objective to open it
            </span>
          </label>

          {task.children?.length > 0 && (
            <div className="space-y-1.5">
              {task.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 hover:border-slate-700"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleChildComplete(child)}
                      className="text-slate-400 hover:text-emerald-400 shrink-0"
                    >
                      {child.completed ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <Circle size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectTask(child.id)}
                      className={`text-left text-xs truncate hover:text-cyan-400 ${
                        child.completed ? "line-through text-slate-500" : "text-slate-200"
                      }`}
                    >
                      {child.title}
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectTask(child.id)}
                    className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-cyan-300"
                  >
                    Open →
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Input
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="+ Add nested objective..."
              className="h-8 text-xs bg-slate-950 border-slate-800 text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter" && subTitle.trim()) {
                  e.preventDefault()
                  onAddChild(subTitle.trim())
                  setSubTitle("")
                }
              }}
            />
            <Button
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => {
                if (!subTitle.trim()) return
                onAddChild(subTitle.trim())
                setSubTitle("")
              }}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Task Attachments & Files */}
        <AttachmentsSection
          attachments={task.attachments ?? []}
          onChange={(nextAtts) => onUpdateTask((t) => ({ ...t, attachments: nextAtts }))}
        />
      </CardContent>
    </Card>
  )
}
