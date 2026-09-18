"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlarmClock, ExternalLink, Plus, RefreshCw, Save, Search, Trash2, X } from "lucide-react"
import {
  CRM_ACTIVITY_TYPES,
  CRM_KINDS,
  CRM_STAGES,
  createCrmItem,
  deleteCrmItem,
  emptyDraft,
  isClosed,
  listCrmItems,
  stageLabel,
  updateCrmItem,
  type CrmActivity,
  type CrmActivityType,
  type CrmDraft,
  type CrmItem,
  type CrmKind,
  type CrmStage,
} from "@/lib/crm"

type Editing = CrmDraft & { id?: number }
type StageFilter = CrmStage | "due" | null

const PRIORITY_DOT: Record<1 | 2 | 3, string> = {
  1: "bg-cyan-400",
  2: "bg-blue-400/70",
  3: "bg-slate-600",
}

function todayISO() {
  return new Date().toLocaleDateString("en-CA")
}

function dueState(item: { nextStepDate: string | null; stage: CrmStage }) {
  if (!item.nextStepDate || isClosed(item.stage)) return null
  const today = todayISO()
  return item.nextStepDate < today ? "overdue" : item.nextStepDate === today ? "today" : "upcoming"
}

function formatDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: value.length === 10 ? undefined : "numeric" })
}

function newActivity(type: CrmActivity["type"], text: string): CrmActivity {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
    at: new Date().toISOString(),
    type,
    text,
  }
}

function withStageLog(draft: Editing, previous: CrmStage | null): Editing {
  if (!previous || previous === draft.stage) return draft
  const text = `Stage: ${stageLabel(previous, draft.kind)} → ${stageLabel(draft.stage, draft.kind)}`
  return { ...draft, activities: [...draft.activities, newActivity("stage", text)] }
}

function parseTags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))]
}

const PAGE_SIZE = 40

const DUE_CLASS = {
  overdue: "text-red-400",
  today: "text-amber-300",
  upcoming: "text-slate-400",
}

interface CrmManagerProps {
  notify: (type: "success" | "error", text: string) => void
  initialItems?: CrmItem[]
}

export function CrmManager({ notify, initialItems }: CrmManagerProps) {
  const [items, setItems] = useState<CrmItem[] | null>(initialItems ?? null)
  const [loading, setLoading] = useState(!initialItems)
  const [kind, setKind] = useState<CrmKind>("job")
  const [stageFilter, setStageFilter] = useState<StageFilter>(null)
  const [search, setSearch] = useState("")
  const [showClosed, setShowClosed] = useState(false)
  const [listFilter, setListFilter] = useState("all")
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [snapshot, setSnapshot] = useState("")
  const [originalStage, setOriginalStage] = useState<CrmStage | null>(null)
  const [tagsText, setTagsText] = useState("")
  const [activityType, setActivityType] = useState<CrmActivityType>("note")
  const [activityText, setActivityText] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setItems(await listCrmItems())
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to load the pipeline.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialItems) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dirty = editing !== null && JSON.stringify({ ...editing, tags: parseTags(tagsText) }) !== snapshot

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  if (loading || !items) {
    return <div className="py-16 text-center text-sm text-slate-400">{loading ? "Loading pipeline…" : "Pipeline unavailable."}</div>
  }

  const openEditor = (draft: Editing) => {
    setEditing(draft)
    setSnapshot(JSON.stringify(draft))
    setOriginalStage(draft.id ? draft.stage : null)
    setTagsText(draft.tags.join(", "))
    setActivityText("")
    setActivityType("note")
  }

  const confirmDiscard = () => !dirty || confirm("Discard unsaved changes?")

  const openItem = (item: CrmItem) => {
    if (editing?.id === item.id || !confirmDiscard()) return
    openEditor({ ...item })
  }

  const openNew = () => {
    if (!confirmDiscard()) return
    openEditor(emptyDraft(kind))
  }

  const closeEditor = () => {
    if (!confirmDiscard()) return
    setEditing(null)
  }

  const set = <K extends keyof Editing>(key: K, value: Editing[K]) => setEditing((current) => (current ? { ...current, [key]: value } : current))

  const replaceItem = (saved: CrmItem) =>
    setItems((current) => (current ? [saved, ...current.filter((i) => i.id !== saved.id)] : [saved]))

  const persist = async (draft: Editing, message: string) => {
    if (!draft.company.trim()) {
      notify("error", "Company is required.")
      return
    }
    setSaving(true)
    try {
      const payload = withStageLog({ ...draft, tags: parseTags(tagsText) }, originalStage)
      const saved = payload.id
        ? await updateCrmItem(payload as CrmItem)
        : await createCrmItem({ ...payload, activities: [newActivity("note", "Created"), ...payload.activities] })
      replaceItem(saved)
      openEditor({ ...saved })
      setKind(saved.kind)
      notify("success", message)
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to save.")
    } finally {
      setSaving(false)
    }
  }

  const logActivity = async () => {
    if (!editing || !activityText.trim()) return
    let next: Editing = { ...editing, activities: [...editing.activities, newActivity(activityType, activityText.trim())] }
    // Logging an application moves an early-stage job to "Applied".
    if (activityType === "applied" && next.kind === "job" && (next.stage === "lead" || next.stage === "qualified")) {
      next = { ...next, stage: "contacted" }
    }
    setActivityText("")
    if (next.id) await persist(next, "Activity logged.")
    else setEditing(next)
  }

  const removeActivity = (id: string) => set("activities", editing ? editing.activities.filter((a) => a.id !== id) : [])

  const quickStage = async (item: CrmItem, stage: CrmStage) => {
    if (stage === item.stage) return
    // The open record may have unsaved edits: change the stage there and let Save persist both.
    if (editing?.id === item.id) {
      set("stage", stage)
      return
    }
    try {
      replaceItem(await updateCrmItem(withStageLog({ ...item, stage }, item.stage) as CrmItem))
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to update the stage.")
    }
  }

  const remove = async () => {
    const id = editing?.id
    if (!editing || !id || !confirm(`Delete "${editing.company} — ${editing.title}"? This can't be undone.`)) return
    try {
      await deleteCrmItem(id)
      setItems((current) => (current ?? []).filter((i) => i.id !== id))
      setEditing(null)
      notify("success", "Record deleted.")
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to delete.")
    }
  }

  const allOfKind = items.filter((item) => item.kind === kind)
  const lists = Object.entries(
    allOfKind.reduce<Record<string, number>>((acc, item) => {
      const source = item.source || "No source"
      acc[source] = (acc[source] ?? 0) + 1
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])
  // Stage counters and the list both follow the selected list (source).
  const ofKind = allOfKind.filter((item) => listFilter === "all" || (item.source || "No source") === listFilter)
  const dueCount = ofKind.filter((item) => {
    const due = dueState(item)
    return due === "overdue" || due === "today"
  }).length
  const query = search.trim().toLowerCase()
  const rank = (item: CrmItem) => ({ overdue: 0, today: 1, upcoming: 2, none: 3 })[dueState(item) ?? "none"]
  const visible = ofKind
    .filter((item) => {
      if (stageFilter === "due") return rank(item) <= 1
      if (stageFilter) return item.stage === stageFilter
      return showClosed || !isClosed(item.stage)
    })
    .filter(
      (item) =>
        !query ||
        [item.company, item.title, item.location, item.notes, item.contactName, item.source, ...item.tags].some((value) =>
          value?.toLowerCase().includes(query),
        ),
    )
    .sort(
      (a, b) =>
        Number(isClosed(a.stage)) - Number(isClosed(b.stage)) ||
        rank(a) - rank(b) ||
        (a.nextStepDate ?? "9999").localeCompare(b.nextStepDate ?? "9999") ||
        a.priority - b.priority ||
        b.updatedAt.localeCompare(a.updatedAt),
    )
  const kindMeta = CRM_KINDS.find((k) => k.value === kind)!
  const isJob = (editing?.kind ?? kind) === "job"

  return (
    <div className="space-y-6">
      {/* Kind switch + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-lg border border-slate-700 bg-slate-900/60 p-1" role="tablist" aria-label="Pipeline">
          {CRM_KINDS.map((k) => {
            const count = items.filter((item) => item.kind === k.value && !isClosed(item.stage)).length
            return (
              <button
                key={k.value}
                type="button"
                role="tab"
                aria-selected={kind === k.value}
                onClick={() => {
                  if (k.value === kind || !confirmDiscard()) return
                  setEditing(null)
                  setKind(k.value)
                  setStageFilter(null)
                  setListFilter("all")
                  setLimit(PAGE_SIZE)
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  kind === k.value ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {k.label} <span className="ml-1 font-mono text-xs opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => confirmDiscard() && (setEditing(null), load())}
            className="text-slate-400 hover:text-white"
            title="Reload"
          >
            <RefreshCw size={14} />
          </Button>
          <Button type="button" onClick={openNew} className="ai-glow flex items-center gap-1.5">
            <Plus size={16} /> {kindMeta.newLabel}
          </Button>
        </div>
      </div>

      {/* Stage summary (also filters) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        <button
          type="button"
          onClick={() => {
            setStageFilter(stageFilter === "due" ? null : "due")
            setLimit(PAGE_SIZE)
          }}
          aria-pressed={stageFilter === "due"}
          className={`rounded-lg border p-3 text-left transition-colors ${
            stageFilter === "due" ? "border-amber-400/60 bg-amber-500/10" : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
          }`}
        >
          <span className="flex items-center gap-1.5 text-xs text-amber-300">
            <AlarmClock size={13} aria-hidden="true" /> Follow-ups due
          </span>
          <span className="mt-1 block font-mono text-lg text-white">{dueCount}</span>
        </button>
        {CRM_STAGES.map((stage) => {
          const count = ofKind.filter((item) => item.stage === stage.value).length
          return (
            <button
              key={stage.value}
              type="button"
              onClick={() => {
                setStageFilter(stageFilter === stage.value ? null : stage.value)
                setLimit(PAGE_SIZE)
              }}
              aria-pressed={stageFilter === stage.value}
              className={`rounded-lg border p-3 text-left transition-colors ${
                stageFilter === stage.value ? "border-cyan-400/60 bg-cyan-500/10" : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
              }`}
            >
              <span className="block truncate text-xs text-slate-400">{stage[kind]}</span>
              <span className="mt-1 block font-mono text-lg text-white">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search pipeline"
            placeholder="Search company, role, notes, tags…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setLimit(PAGE_SIZE)
            }}
            className="border-slate-700 bg-slate-900/60 pl-9 text-sm text-white"
          />
        </div>
        {lists.length > 1 && (
          <Select
            value={listFilter}
            onValueChange={(value) => {
              setListFilter(value)
              setLimit(PAGE_SIZE)
            }}
          >
            <SelectTrigger aria-label="Filter by list" className="border-slate-700 bg-slate-900/60 text-sm text-white sm:w-[230px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900 text-white">
              <SelectItem value="all">All lists ({allOfKind.length})</SelectItem>
              {lists.map(([source, count]) => (
                <SelectItem key={source} value={source}>
                  {source} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} className="accent-cyan-400" />
          Show closed
        </label>
        {stageFilter && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setStageFilter(null)} className="text-xs text-slate-400">
            <X size={13} className="mr-1" /> Clear filter
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* List */}
        <div className={editing ? "lg:col-span-5" : "lg:col-span-12"}>
          {visible.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 py-14 text-center text-sm text-slate-400">
              {ofKind.length === 0 ? `Nothing here yet — add your first ${kind === "job" ? "job" : "lead"}.` : "No records match the current filters."}
            </div>
          ) : (
            <>
            <ul className={`grid grid-cols-1 gap-3 ${editing ? "" : "xl:grid-cols-2"}`}>
              {visible.slice(0, limit).map((item) => {
                const due = dueState(item)
                return (
                  <li
                    key={item.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      editing?.id === item.id
                        ? "border-blue-500/50 bg-blue-950/40 ring-1 ring-blue-500/30"
                        : "border-slate-700/60 bg-slate-900/40 hover:border-slate-600"
                    } ${isClosed(item.stage) ? "opacity-60" : ""}`}
                  >
                    <button type="button" onClick={() => openItem(item)} className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[item.priority]}`} title={`Priority ${item.priority}`} />
                        <span className="truncate font-semibold text-white">{item.company}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-slate-300">{item.title || "—"}</span>
                      {(item.location || item.compensation) && (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {[item.location, item.compensation].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {item.nextStep && (
                        <span className={`mt-1.5 flex items-start gap-1.5 text-xs ${DUE_CLASS[due ?? "upcoming"]}`}>
                          <AlarmClock size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                          <span>
                            {item.nextStep}
                            {item.nextStepDate && ` · ${due === "overdue" ? "overdue, " : ""}${formatDate(item.nextStepDate)}`}
                          </span>
                        </span>
                      )}
                      {item.tags.length > 0 && (
                        <span className="mt-2 flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span key={tag} className="rounded border border-slate-700 px-1.5 py-px text-[10px] text-slate-400">
                              {tag}
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Select value={item.stage} onValueChange={(value) => quickStage(item, value as CrmStage)}>
                        <SelectTrigger
                          aria-label={`Stage for ${item.company}`}
                          className="h-8 w-[136px] border-slate-700 bg-slate-900/80 text-xs text-white"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-slate-700 bg-slate-900 text-white">
                          {CRM_STAGES.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value} className="text-xs">
                              {stage[item.kind]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                        >
                          Posting <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {Math.min(limit, visible.length)} of {visible.length}
              </span>
              {visible.length > limit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLimit(limit + PAGE_SIZE)}
                  className="border-slate-700 text-xs text-slate-300"
                >
                  Show {Math.min(PAGE_SIZE, visible.length - limit)} more
                </Button>
              )}
            </div>
            </>
          )}
        </div>

        {/* Editor */}
        {editing && (
          <div className="lg:col-span-7">
            <Card className="ai-glow border-slate-700 bg-slate-800/60 lg:sticky lg:top-6">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-xl">
                    {editing.id ? editing.company || "Untitled" : CRM_KINDS.find((k) => k.value === editing.kind)?.newLabel}
                  </CardTitle>
                  {dirty && <p className="mt-1 text-xs text-amber-400">Unsaved changes</p>}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={closeEditor} className="text-slate-400 hover:text-white" aria-label="Close editor">
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardContent className="max-h-[78vh] space-y-5 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-slate-200">Pipeline</Label>
                    <Select value={editing.kind} onValueChange={(v) => set("kind", v as CrmKind)}>
                      <SelectTrigger className="mt-1 border-slate-700 bg-slate-900/80 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-900 text-white">
                        {CRM_KINDS.map((k) => (
                          <SelectItem key={k.value} value={k.value}>
                            {k.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-200">Stage</Label>
                    <Select value={editing.stage} onValueChange={(v) => set("stage", v as CrmStage)}>
                      <SelectTrigger className="mt-1 border-slate-700 bg-slate-900/80 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-900 text-white">
                        {CRM_STAGES.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage[editing.kind]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-200">Priority</Label>
                    <Select value={String(editing.priority)} onValueChange={(v) => set("priority", Number(v) as 1 | 2 | 3)}>
                      <SelectTrigger className="mt-1 border-slate-700 bg-slate-900/80 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-900 text-white">
                        <SelectItem value="1">P1 · high</SelectItem>
                        <SelectItem value="2">P2 · medium</SelectItem>
                        <SelectItem value="3">P3 · low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="crm-company" className="text-slate-200">
                      Company *
                    </Label>
                    <Input
                      id="crm-company"
                      value={editing.company}
                      onChange={(e) => set("company", e.target.value)}
                      className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                      autoFocus={!editing.id}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crm-title" className="text-slate-200">
                      {isJob ? "Role" : "Project / opportunity"}
                    </Label>
                    <Input
                      id="crm-title"
                      value={editing.title}
                      onChange={(e) => set("title", e.target.value)}
                      className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr]">
                  <div>
                    <Label htmlFor="crm-url" className="text-slate-200">
                      {isJob ? "Posting URL" : "Website"}
                    </Label>
                    <Input
                      id="crm-url"
                      value={editing.url ?? ""}
                      placeholder="https://"
                      onChange={(e) => set("url", e.target.value || null)}
                      className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="crm-source" className="text-slate-200">
                      Source
                    </Label>
                    <Input
                      id="crm-source"
                      value={editing.source ?? ""}
                      placeholder={isJob ? "Ashby, LinkedIn, referral…" : "Referral, outbound, inbound…"}
                      onChange={(e) => set("source", e.target.value || null)}
                      className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="crm-location" className="text-slate-200">
                      Location
                    </Label>
                    <Input
                      id="crm-location"
                      value={editing.location ?? ""}
                      onChange={(e) => set("location", e.target.value || null)}
                      className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="crm-comp" className="text-slate-200">
                      {isJob ? "Compensation" : "Budget / deal size"}
                    </Label>
                    <Input
                      id="crm-comp"
                      value={editing.compensation ?? ""}
                      onChange={(e) => set("compensation", e.target.value || null)}
                      className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_170px]">
                  <div>
                    <Label htmlFor="crm-next" className="text-slate-200">
                      Next step
                    </Label>
                    <Input
                      id="crm-next"
                      value={editing.nextStep ?? ""}
                      placeholder="e.g. Follow up with the hiring manager"
                      onChange={(e) => set("nextStep", e.target.value || null)}
                      className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="crm-next-date" className="text-slate-200">
                      Due
                    </Label>
                    <Input
                      id="crm-next-date"
                      type="date"
                      value={editing.nextStepDate ?? ""}
                      onChange={(e) => set("nextStepDate", e.target.value || null)}
                      className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                    />
                  </div>
                </div>

                <fieldset className="space-y-3 rounded-lg border border-slate-700/70 p-3">
                  <legend className="px-1 text-xs uppercase tracking-wider text-slate-400">Contact</legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      aria-label="Contact name"
                      placeholder="Name"
                      value={editing.contactName ?? ""}
                      onChange={(e) => set("contactName", e.target.value || null)}
                      className="border-slate-700 bg-slate-900/80 text-white"
                    />
                    <Input
                      aria-label="Contact role"
                      placeholder={isJob ? "Role (e.g. Head of RevOps)" : "Role (e.g. Founder)"}
                      value={editing.contactRole ?? ""}
                      onChange={(e) => set("contactRole", e.target.value || null)}
                      className="border-slate-700 bg-slate-900/80 text-white"
                    />
                    <Input
                      aria-label="Contact email"
                      type="email"
                      placeholder="Email"
                      value={editing.contactEmail ?? ""}
                      onChange={(e) => set("contactEmail", e.target.value || null)}
                      className="border-slate-700 bg-slate-900/80 text-white"
                    />
                    <Input
                      aria-label="Contact LinkedIn or URL"
                      placeholder="LinkedIn URL"
                      value={editing.contactUrl ?? ""}
                      onChange={(e) => set("contactUrl", e.target.value || null)}
                      className="border-slate-700 bg-slate-900/80 text-white"
                    />
                  </div>
                </fieldset>

                <div>
                  <Label htmlFor="crm-tags" className="text-slate-200">
                    Tags <span className="font-normal text-slate-500">(comma separated)</span>
                  </Label>
                  <Input
                    id="crm-tags"
                    value={tagsText}
                    placeholder="verified, us-remote, martech"
                    onChange={(e) => setTagsText(e.target.value)}
                    className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="crm-notes" className="text-slate-200">
                    Notes
                  </Label>
                  <Textarea
                    id="crm-notes"
                    value={editing.notes ?? ""}
                    onChange={(e) => set("notes", e.target.value || null)}
                    rows={5}
                    className="mt-1 border-slate-700 bg-slate-900/80 text-white"
                  />
                </div>

                {/* Activity log */}
                <div className="space-y-3">
                  <Label className="text-slate-200">Activity</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select value={activityType} onValueChange={(v) => setActivityType(v as CrmActivityType)}>
                      <SelectTrigger aria-label="Activity type" className="border-slate-700 bg-slate-900/80 text-white sm:w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-900 text-white">
                        {CRM_ACTIVITY_TYPES.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      aria-label="Activity details"
                      placeholder="What happened?"
                      value={activityText}
                      onChange={(e) => setActivityText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          logActivity()
                        }
                      }}
                      className="flex-1 border-slate-700 bg-slate-900/80 text-white"
                    />
                    <Button type="button" variant="outline" onClick={logActivity} disabled={!activityText.trim() || saving} className="border-slate-700 text-slate-300">
                      Log
                    </Button>
                  </div>
                  {editing.activities.length > 0 ? (
                    <ol className="space-y-2 border-l border-slate-700 pl-4">
                      {[...editing.activities].reverse().map((activity) => (
                        <li key={activity.id} className="group relative text-sm">
                          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-600" aria-hidden="true" />
                          <span className="text-xs text-slate-500">
                            {formatDate(activity.at)} ·{" "}
                            {CRM_ACTIVITY_TYPES.find((a) => a.value === activity.type)?.label ?? "Stage change"}
                          </span>
                          <p className="text-slate-300">{activity.text}</p>
                          <button
                            type="button"
                            onClick={() => removeActivity(activity.id)}
                            className="absolute right-0 top-0 text-slate-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Remove activity"
                          >
                            <X size={13} />
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs text-slate-500">No activity yet.</p>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-slate-700 pt-4">
                  <Button
                    type="button"
                    onClick={() => persist(editing, editing.id ? "Saved." : "Added to the pipeline.")}
                    disabled={saving}
                    className="ai-glow flex flex-1 items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {saving ? "Saving…" : editing.id ? "Save" : "Add to pipeline"}
                  </Button>
                  {editing.id && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={remove}
                      className="border-slate-700 text-slate-400 hover:border-red-400 hover:text-red-400"
                      title="Delete record"
                      aria-label="Delete record"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
