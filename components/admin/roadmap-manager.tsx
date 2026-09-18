"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  CircleDot,
  ExternalLink,
  Hammer,
  LayoutGrid,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Target,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import {
  ROADMAP_STATUSES,
  ROADMAP_TYPES,
  getRoadmap,
  saveRoadmap,
  type Roadmap,
  type RoadmapItem,
  type RoadmapItemType,
  type RoadmapStatus,
  type RoadmapTrack,
} from "@/lib/roadmap"

const TYPE_META: Record<RoadmapItemType, { icon: LucideIcon; className: string }> = {
  study: { icon: BookOpen, className: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
  project: { icon: Hammer, className: "border-violet-500/40 bg-violet-500/10 text-violet-300" },
  certification: { icon: Award, className: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  portfolio: { icon: LayoutGrid, className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
}

const STATUS_META: Record<RoadmapStatus, { icon: LucideIcon; className: string; label: string }> = {
  todo: { icon: Circle, className: "text-slate-500 hover:text-slate-300", label: "To do" },
  in_progress: { icon: CircleDot, className: "text-blue-400 hover:text-blue-300", label: "In progress" },
  done: { icon: CheckCircle2, className: "text-emerald-400 hover:text-emerald-300", label: "Done" },
}

const NEXT_STATUS: Record<RoadmapStatus, RoadmapStatus> = { todo: "in_progress", in_progress: "done", done: "todo" }

const LEVELS = [0, 1, 2, 3, 4, 5]

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function countDone(items: RoadmapItem[]) {
  const done = items.filter((item) => item.status === "done").length
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 }
}

function formatDue(due?: string) {
  if (!due) return null
  const date = new Date(`${due}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? due
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function isOverdue(item: RoadmapItem) {
  return Boolean(item.due) && item.status !== "done" && new Date(`${item.due}T23:59:59`) < new Date()
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

function LevelDots({ level, target }: { level: number; target: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Level ${level} of 5, target ${target}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`h-2 w-2 rounded-full ${
            n <= level ? "bg-cyan-400" : n <= target ? "border border-cyan-400/70" : "bg-slate-700"
          }`}
        />
      ))}
    </span>
  )
}

function TypeBadge({ type }: { type: RoadmapItemType }) {
  const meta = TYPE_META[type]
  const Icon = meta.icon
  const label = ROADMAP_TYPES.find((t) => t.value === type)?.label ?? type
  return (
    <Badge variant="outline" className={`gap-1 py-0 text-[10px] font-medium ${meta.className}`}>
      <Icon size={11} aria-hidden="true" />
      {label}
    </Badge>
  )
}

interface RoadmapManagerProps {
  notify: (type: "success" | "error", text: string) => void
  initialRoadmap?: Roadmap
}

export function RoadmapManager({ notify, initialRoadmap }: RoadmapManagerProps) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(initialRoadmap ?? null)
  const [loading, setLoading] = useState(!initialRoadmap)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [typeFilter, setTypeFilter] = useState<RoadmapItemType | "all">("all")
  const [hideDone, setHideDone] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editingTrack, setEditingTrack] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setRoadmap(await getRoadmap())
      setDirty(false)
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to load roadmap.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialRoadmap) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  if (loading || !roadmap) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        {loading ? "Loading roadmap…" : "Roadmap unavailable."}
      </div>
    )
  }

  const update = (next: Roadmap) => {
    setRoadmap(next)
    setDirty(true)
  }

  const updateTrack = (trackId: string, patch: Partial<RoadmapTrack>) =>
    update({ ...roadmap, tracks: roadmap.tracks.map((t) => (t.id === trackId ? { ...t, ...patch } : t)) })

  const updateItem = (trackId: string, itemId: string, patch: Partial<RoadmapItem>) => {
    const track = roadmap.tracks.find((t) => t.id === trackId)
    if (!track) return
    updateTrack(trackId, { items: track.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })
  }

  const addItem = (trackId: string) => {
    const track = roadmap.tracks.find((t) => t.id === trackId)
    if (!track) return
    const item: RoadmapItem = {
      id: newId(),
      type: typeFilter === "all" ? "study" : typeFilter,
      title: "New item",
      status: "todo",
    }
    updateTrack(trackId, { items: [...track.items, item] })
    setEditingItem(item.id)
  }

  const deleteItem = (trackId: string, item: RoadmapItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return
    const track = roadmap.tracks.find((t) => t.id === trackId)
    if (!track) return
    updateTrack(trackId, { items: track.items.filter((i) => i.id !== item.id) })
    setEditingItem(null)
  }

  const addTrack = () => {
    const track: RoadmapTrack = { id: newId(), skill: "New skill", why: "", priority: 2, level: 1, target: 3, items: [] }
    update({ ...roadmap, tracks: [...roadmap.tracks, track] })
    setEditingTrack(track.id)
  }

  const deleteTrack = (track: RoadmapTrack) => {
    if (!confirm(`Delete the "${track.skill}" track and its ${track.items.length} items?`)) return
    update({ ...roadmap, tracks: roadmap.tracks.filter((t) => t.id !== track.id) })
    setEditingTrack(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      setRoadmap(await saveRoadmap(roadmap))
      setDirty(false)
      notify("success", "Roadmap saved.")
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to save roadmap.")
    } finally {
      setSaving(false)
    }
  }

  const allItems = roadmap.tracks.flatMap((track) => track.items.map((item) => ({ track, item })))
  const overall = countDone(allItems.map(({ item }) => item))
  const statusRank: Record<RoadmapStatus, number> = { in_progress: 0, todo: 1, done: 2 }
  const nextUp = allItems
    .filter(({ item }) => item.status !== "done")
    .sort(
      (a, b) =>
        statusRank[a.item.status] - statusRank[b.item.status] ||
        a.track.priority - b.track.priority ||
        (a.item.due ?? "9999").localeCompare(b.item.due ?? "9999"),
    )
    .slice(0, 5)
  const tracks = [...roadmap.tracks].sort((a, b) => a.priority - b.priority)
  const visible = (item: RoadmapItem) =>
    (typeFilter === "all" || item.type === typeFilter) && !(hideDone && item.status === "done")

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="border-slate-700 bg-slate-800/50 lg:col-span-7">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target size={20} className="text-cyan-400" />
              Level-up roadmap
            </CardTitle>
            <p className="text-xs text-slate-400">
              Private — only visible when logged in. Click a status icon to move an item forward, then save.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_170px]">
              <div>
                <Label htmlFor="roadmap-goal" className="text-slate-200">
                  Goal
                </Label>
                <Input
                  id="roadmap-goal"
                  value={roadmap.goal}
                  onChange={(e) => update({ ...roadmap, goal: e.target.value })}
                  className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                />
              </div>
              <div>
                <Label htmlFor="roadmap-date" className="text-slate-200">
                  Target date
                </Label>
                <Input
                  id="roadmap-date"
                  type="date"
                  value={roadmap.targetDate ?? ""}
                  onChange={(e) => update({ ...roadmap, targetDate: e.target.value || undefined })}
                  className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-slate-300">Overall progress</span>
                <span className="font-mono text-slate-400">
                  {overall.done}/{overall.total} · {overall.pct}%
                </span>
              </div>
              <ProgressBar pct={overall.pct} />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ROADMAP_TYPES.map(({ value, label }) => {
                const stats = countDone(allItems.filter(({ item }) => item.type === value).map(({ item }) => item))
                const Icon = TYPE_META[value].icon
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTypeFilter(typeFilter === value ? "all" : value)}
                    aria-pressed={typeFilter === value}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      typeFilter === value
                        ? "border-cyan-400/60 bg-cyan-500/10"
                        : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Icon size={13} aria-hidden="true" />
                      {label}
                    </span>
                    <span className="mt-1 block font-mono text-lg text-white">
                      {stats.done}/{stats.total}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 lg:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Next up</CardTitle>
            <p className="text-xs text-slate-400">In-progress first, then by priority and due date.</p>
          </CardHeader>
          <CardContent>
            {nextUp.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Everything is done. Time to add the next goal.</p>
            ) : (
              <ol className="space-y-3">
                {nextUp.map(({ track, item }) => {
                  const status = STATUS_META[item.status]
                  const StatusIcon = status.icon
                  return (
                    <li key={item.id} className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => updateItem(track.id, item.id, { status: NEXT_STATUS[item.status] })}
                        className={`mt-0.5 shrink-0 ${status.className}`}
                        title={`${status.label} — click to advance`}
                        aria-label={`${item.title}: ${status.label}. Advance status`}
                      >
                        <StatusIcon size={18} />
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm leading-snug text-white">{item.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {track.skill}
                          {item.due && (
                            <span className={isOverdue(item) ? "text-red-400" : undefined}> · due {formatDue(item.due)}</span>
                          )}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={typeFilter === "all" ? "default" : "outline"}
            onClick={() => setTypeFilter("all")}
            className="text-xs"
          >
            All ({allItems.length})
          </Button>
          {ROADMAP_TYPES.map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={typeFilter === value ? "default" : "outline"}
              onClick={() => setTypeFilter(value)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
          <label className="ml-1 flex cursor-pointer items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
              className="accent-cyan-400"
            />
            Hide done
          </label>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {dirty && <span className="text-xs text-amber-400">Unsaved changes</span>}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => (!dirty || confirm("Discard unsaved changes?")) && load()}
            className="text-slate-400 hover:text-white"
            title="Reload from database"
          >
            <RefreshCw size={14} />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addTrack} className="border-slate-700 text-xs text-slate-300">
            <Plus size={14} className="mr-1" /> Add skill track
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !dirty} className="ai-glow flex items-center gap-1.5 text-xs">
            <Save size={14} />
            {saving ? "Saving…" : "Save roadmap"}
          </Button>
        </div>
      </div>

      {/* Tracks */}
      <div className="space-y-5">
        {tracks.map((track) => {
          const stats = countDone(track.items)
          const items = track.items.filter(visible)
          const isEditingTrack = editingTrack === track.id
          if (!isEditingTrack && items.length === 0 && typeFilter !== "all") return null
          return (
            <Card key={track.id} className="border-slate-700 bg-slate-800/50">
              <CardHeader className="space-y-3 pb-3">
                {isEditingTrack ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px_110px_110px]">
                      <div>
                        <Label className="text-slate-200">Skill</Label>
                        <Input
                          value={track.skill}
                          onChange={(e) => updateTrack(track.id, { skill: e.target.value })}
                          className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200">Priority</Label>
                        <Select
                          value={String(track.priority)}
                          onValueChange={(v) => updateTrack(track.id, { priority: Number(v) as 1 | 2 | 3 })}
                        >
                          <SelectTrigger className="mt-1 border-slate-700 bg-slate-900/80 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-slate-700 bg-slate-900 text-white">
                            <SelectItem value="1">P1 · now</SelectItem>
                            <SelectItem value="2">P2 · next</SelectItem>
                            <SelectItem value="3">P3 · later</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-200">Level</Label>
                        <Select value={String(track.level)} onValueChange={(v) => updateTrack(track.id, { level: Number(v) })}>
                          <SelectTrigger className="mt-1 border-slate-700 bg-slate-900/80 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-slate-700 bg-slate-900 text-white">
                            {LEVELS.map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n} / 5
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-200">Target</Label>
                        <Select value={String(track.target)} onValueChange={(v) => updateTrack(track.id, { target: Number(v) })}>
                          <SelectTrigger className="mt-1 border-slate-700 bg-slate-900/80 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-slate-700 bg-slate-900 text-white">
                            {LEVELS.map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n} / 5
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-200">Why it matters (market evidence)</Label>
                      <Textarea
                        value={track.why}
                        onChange={(e) => updateTrack(track.id, { why: e.target.value })}
                        rows={2}
                        className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                      />
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTrack(track)}
                        className="border-slate-700 text-xs text-slate-400 hover:border-red-400 hover:text-red-400"
                      >
                        <Trash2 size={13} className="mr-1" /> Delete track
                      </Button>
                      <Button type="button" size="sm" onClick={() => setEditingTrack(null)} className="text-xs">
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`py-0 text-[10px] ${
                            track.priority === 1
                              ? "border-cyan-400/50 text-cyan-300"
                              : track.priority === 2
                                ? "border-blue-400/40 text-blue-300"
                                : "border-slate-600 text-slate-400"
                          }`}
                        >
                          P{track.priority}
                        </Badge>
                        <CardTitle className="text-lg">{track.skill}</CardTitle>
                      </div>
                      {track.why && <p className="max-w-3xl text-xs leading-relaxed text-slate-400">{track.why}</p>}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTrack(track.id)}
                      className="shrink-0 text-slate-400 hover:text-white"
                      title="Edit track"
                      aria-label={`Edit ${track.skill}`}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    Level <LevelDots level={track.level} target={track.target} />
                    <span className="font-mono">
                      {track.level} → {track.target}
                    </span>
                  </span>
                  <span className="flex min-w-40 flex-1 items-center gap-3">
                    <ProgressBar pct={stats.pct} />
                    <span className="shrink-0 font-mono">
                      {stats.done}/{stats.total}
                    </span>
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item) => {
                  const status = STATUS_META[item.status]
                  const StatusIcon = status.icon
                  if (editingItem === item.id) {
                    return (
                      <div key={item.id} className="space-y-3 rounded-lg border border-blue-500/40 bg-blue-950/20 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_150px_150px]">
                          <div>
                            <Label className="text-slate-200">Title</Label>
                            <Input
                              value={item.title}
                              onChange={(e) => updateItem(track.id, item.id, { title: e.target.value })}
                              className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                              autoFocus
                            />
                          </div>
                          <div>
                            <Label className="text-slate-200">Type</Label>
                            <Select
                              value={item.type}
                              onValueChange={(v) => updateItem(track.id, item.id, { type: v as RoadmapItemType })}
                            >
                              <SelectTrigger className="mt-1 border-slate-700 bg-slate-900/80 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-slate-700 bg-slate-900 text-white">
                                {ROADMAP_TYPES.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-slate-200">Status</Label>
                            <Select
                              value={item.status}
                              onValueChange={(v) => updateItem(track.id, item.id, { status: v as RoadmapStatus })}
                            >
                              <SelectTrigger className="mt-1 border-slate-700 bg-slate-900/80 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-slate-700 bg-slate-900 text-white">
                                {ROADMAP_STATUSES.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[150px_1fr_1fr]">
                          <div>
                            <Label className="text-slate-200">Due</Label>
                            <Input
                              type="date"
                              value={item.due ?? ""}
                              onChange={(e) => updateItem(track.id, item.id, { due: e.target.value || undefined })}
                              className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-200">Resource link</Label>
                            <Input
                              value={item.url ?? ""}
                              placeholder="https://"
                              onChange={(e) => updateItem(track.id, item.id, { url: e.target.value || undefined })}
                              className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-200">Proof link (repo, case study, certificate)</Label>
                            <Input
                              value={item.proofUrl ?? ""}
                              placeholder="https://"
                              onChange={(e) => updateItem(track.id, item.id, { proofUrl: e.target.value || undefined })}
                              className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-slate-200">Details</Label>
                          <Textarea
                            value={item.detail ?? ""}
                            onChange={(e) => updateItem(track.id, item.id, { detail: e.target.value || undefined })}
                            rows={2}
                            className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                          />
                        </div>
                        <div className="flex justify-between gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem(track.id, item)}
                            className="border-slate-700 text-xs text-slate-400 hover:border-red-400 hover:text-red-400"
                          >
                            <Trash2 size={13} className="mr-1" /> Delete
                          </Button>
                          <Button type="button" size="sm" onClick={() => setEditingItem(null)} className="text-xs">
                            Done
                          </Button>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={item.id}
                      className="group flex items-start gap-3 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3 hover:border-slate-600"
                    >
                      <button
                        type="button"
                        onClick={() => updateItem(track.id, item.id, { status: NEXT_STATUS[item.status] })}
                        className={`mt-0.5 shrink-0 transition-colors ${status.className}`}
                        title={`${status.label} — click to advance`}
                        aria-label={`${item.title}: ${status.label}. Advance status`}
                      >
                        <StatusIcon size={20} />
                      </button>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <TypeBadge type={item.type} />
                          <span
                            className={`text-sm ${item.status === "done" ? "text-slate-500 line-through" : "text-white"}`}
                          >
                            {item.title}
                          </span>
                        </div>
                        {item.detail && <p className="text-xs leading-relaxed text-slate-400">{item.detail}</p>}
                        {(item.due || item.url || item.proofUrl) && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            {item.due && (
                              <span className={isOverdue(item) ? "text-red-400" : "text-slate-500"}>
                                {isOverdue(item) ? "Overdue · " : "Due "}
                                {formatDue(item.due)}
                              </span>
                            )}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                              >
                                Resource <ExternalLink size={11} />
                              </a>
                            )}
                            {item.proofUrl && (
                              <a
                                href={item.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                              >
                                Proof <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(item.id)}
                        className="h-8 shrink-0 px-2 text-slate-500 hover:text-white"
                        title="Edit item"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Pencil size={14} />
                      </Button>
                    </div>
                  )
                })}
                {items.length === 0 && track.items.length > 0 && (
                  <p className="py-2 text-xs text-slate-500">No items match the current filter.</p>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addItem(track.id)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <Plus size={14} className="mr-1" /> Add item
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {dirty && (
        <div className="sticky bottom-4 z-10 flex justify-end">
          <Button type="button" onClick={handleSave} disabled={saving} className="ai-glow flex items-center gap-1.5 shadow-lg">
            <Save size={15} />
            {saving ? "Saving…" : "Save roadmap"}
          </Button>
        </div>
      )}
    </div>
  )
}
