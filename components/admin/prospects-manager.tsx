"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Layers,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Phone,
  RefreshCw,
  Rocket,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Wrench,
  XCircle,
} from "lucide-react"
import type { AdminNotify } from "@/components/admin/admin-utils"
import {
  angleLabel,
  buildProspectsQuery,
  cohortLabel,
  listProspects,
  OUTREACH_ANGLES,
  PRIORITY_TIERS,
  promoteProspects,
  PROSPECT_COHORTS,
  PROSPECT_SOURCE_FILTERS,
  updateProspectFields,
  type OutreachAngle,
  type PriorityTier,
  type ProspectAudit,
  type ProspectCohort,
  type ProspectCohortKpi,
} from "@/lib/prospects"

const PAGE_SIZE = 60

interface ProspectsManagerProps {
  notify: AdminNotify
  onCountChange?: (count: number) => void
}

function scoreColorClass(score: number): string {
  if (score >= 8) return "text-emerald-300 bg-emerald-950/60 border-emerald-500/40"
  if (score >= 6) return "text-blue-300 bg-blue-950/60 border-blue-500/40"
  if (score >= 4) return "text-amber-300 bg-amber-950/60 border-amber-500/40"
  return "text-rose-300 bg-rose-950/60 border-rose-500/40"
}

function gapColorClass(gap: number): string {
  if (gap >= 8) return "text-amber-300 bg-amber-500/20 border-amber-400/50"
  if (gap >= 6) return "text-emerald-300 bg-emerald-500/15 border-emerald-500/40"
  return "text-slate-300 bg-slate-800 border-slate-700"
}

function tierBadgeClass(tier: PriorityTier): string {
  return PRIORITY_TIERS.find((t) => t.value === tier)?.badgeClass ?? "bg-slate-800 text-slate-300"
}

function cohortBadgeClass(cohort: ProspectCohort): string {
  return PROSPECT_COHORTS.find((c) => c.value === cohort)?.colorClass ?? "bg-slate-800 text-slate-300"
}

export function ProspectsManager({ notify, onCountChange }: ProspectsManagerProps) {
  const [items, setItems] = useState<ProspectAudit[]>([])
  const [total, setTotal] = useState(0)
  const [kpis, setKpis] = useState<ProspectCohortKpi[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [cohort, setCohort] = useState<string>("all")
  const [tier, setTier] = useState<string>("all")
  const [angle, setAngle] = useState<string>("all")
  const [source, setSource] = useState<string>("all")
  const [sweetSpotOnly, setSweetSpotOnly] = useState(false)
  const [hasEmail, setHasEmail] = useState(false)
  const [hasAds, setHasAds] = useState(false)
  const [needsBot, setNeedsBot] = useState(false)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [offset, setOffset] = useState(0)

  // Selection & drawer state
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [promoting, setPromoting] = useState(false)
  const [activeProspect, setActiveProspect] = useState<ProspectAudit | null>(null)
  const [assetView, setAssetView] = useState<"sheet" | "desktop-full" | "mobile-hero" | "desktop-hero">("sheet")
  const [sheetImgError, setSheetImgError] = useState(false)
  const [copiedHook, setCopiedHook] = useState(false)

  // Editable fields inside drawer
  const [editTier, setEditTier] = useState<PriorityTier>("B")
  const [editAngle, setEditAngle] = useState<OutreachAngle>("modernize_website")
  const [editHook, setEditHook] = useState("")
  const [editCritique, setEditCritique] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setOffset(0)
    }, 260)
    return () => clearTimeout(t)
  }, [searchInput])

  // Clear selection whenever active filter scope changes so hidden items cannot be bulk-promoted accidentally
  useEffect(() => {
    setSelectedIds([])
  }, [cohort, tier, angle, source, sweetSpotOnly, hasEmail, hasAds, needsBot, debouncedSearch])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listProspects({
        cohort,
        tier,
        angle,
        source,
        hasEmail,
        hasAds,
        needsBot,
        ...(sweetSpotOnly ? { minRating: 3.5, maxRating: 4.6, minReviews: 35, maxReviews: 250 } : {}),
        search: debouncedSearch,
        limit: PAGE_SIZE,
        offset,
      })
      setItems(res.items)
      setTotal(res.total)
      setKpis(res.kpis)
      if (onCountChange) {
        const grandTotal = res.kpis.reduce((acc, k) => acc + k.total, 0)
        onCountChange(grandTotal || res.total)
      }
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to load prospects.")
    } finally {
      setLoading(false)
    }
  }, [cohort, tier, angle, source, sweetSpotOnly, hasEmail, hasAds, needsBot, debouncedSearch, offset, notify, onCountChange])

  useEffect(() => {
    load()
  }, [load])

  const openDrawer = (p: ProspectAudit) => {
    setActiveProspect(p)
    setAssetView("sheet")
    setSheetImgError(false)
    setCopiedHook(false)
    setEditTier(p.priorityTier)
    setEditAngle(p.outreachAngle)
    setEditHook(p.personalizedHook ?? "")
    setEditCritique(p.visualCritique ?? "")
  }

  const handleSaveDrawer = async () => {
    if (!activeProspect) return
    const tierChanged = editTier !== activeProspect.priorityTier
    setSavingEdit(true)
    try {
      const updated = await updateProspectFields(activeProspect.id, {
        priorityTier: editTier,
        outreachAngle: editAngle,
        personalizedHook: editHook,
        visualCritique: editCritique,
      })
      setActiveProspect(updated)
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      if (tierChanged) {
        await load()
      }
      notify("success", `Saved updates for ${updated.company}.`)
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to save changes.")
    } finally {
      setSavingEdit(false)
    }
  }

  const handlePromote = async (ids: number[]) => {
    if (ids.length === 0) return
    setPromoting(true)
    try {
      const res = await promoteProspects(ids)
      notify("success", `Synced ${res.promoted} company(s) into Pipeline CRM!`)
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)))
      await load()
      if (activeProspect && ids.includes(activeProspect.id)) {
        const mappedCrmId =
          res.promotedMap?.[String(activeProspect.id)] ??
          (ids.length === 1 ? res.crmIds[0] : undefined)
        setActiveProspect((prev) =>
          prev ? { ...prev, promotedCrmId: mappedCrmId ?? prev.promotedCrmId } : null,
        )
      }
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to promote prospects.")
    } finally {
      setPromoting(false)
    }
  }

  const handleCopyHook = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedHook(true)
      setTimeout(() => setCopiedHook(false), 2000)
      notify("success", "Personalized outreach hook copied to clipboard!")
    } catch {
      notify("error", "Could not access clipboard.")
    }
  }

  const handleExportCsv = () => {
    const url = buildProspectsQuery(
      {
        cohort,
        tier,
        angle,
        source,
        hasEmail,
        hasAds,
        needsBot,
        ...(sweetSpotOnly ? { minRating: 3.5, maxRating: 4.6, minReviews: 35, maxReviews: 250 } : {}),
        search: debouncedSearch,
      },
      "csv",
    )
    window.open(url, "_blank")
  }

  const allVisibleSelected = items.length > 0 && items.every((i) => selectedIds.includes(i.id))

  const toggleSelectAll = () => {
    const pageIds = items.map((i) => i.id)
    if (allVisibleSelected) {
      const pageSet = new Set(pageIds)
      setSelectedIds((prev) => prev.filter((id) => !pageSet.has(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
    }
  }

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const grandTotal = kpis.reduce((sum, k) => sum + k.total, 0)

  return (
    <div className="space-y-6">
      {/* Top A/B Cohort KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          type="button"
          onClick={() => {
            setCohort("all")
            setOffset(0)
          }}
          className={`text-left p-3 rounded-lg border transition-all ${
            cohort === "all"
              ? "bg-blue-950/50 border-blue-500/60 shadow-md"
              : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">All Cohorts</div>
          <div className="text-2xl font-bold text-white mt-1">{grandTotal.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpis.reduce((s, k) => s + k.tierS + k.tierA, 0).toLocaleString()} Tier S/A
          </div>
        </button>

        {PROSPECT_COHORTS.map((c) => {
          const stat = kpis.find((k) => k.cohort === c.value)
          const count = stat?.total ?? 0
          const emailPct = count > 0 ? Math.round(((stat?.withEmail ?? 0) / count) * 100) : 0
          const adsPct = count > 0 ? Math.round(((stat?.withPaidAds ?? 0) / count) * 100) : 0
          const active = cohort === c.value
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setCohort(active ? "all" : c.value)
                setOffset(0)
              }}
              className={`text-left p-3 rounded-lg border transition-all ${
                active
                  ? "bg-blue-950/50 border-blue-500/60 shadow-md"
                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="text-xs font-semibold text-slate-200 truncate">{c.shortLabel}</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-white">{count.toLocaleString()}</span>
                <span className="text-[11px] text-amber-300 font-medium">
                  Gap {stat?.avgModernizationGap ?? "—"}/10
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{emailPct}% email</span>
                <span>{adsPct}% ads</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Filter & Bulk Action Toolbar */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="flex flex-1 flex-wrap gap-2.5 items-center">
              <div className="relative min-w-[210px] flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search company, domain, city, metro, service..."
                  className="pl-9 bg-slate-950/70 border-slate-800 text-sm text-white"
                />
              </div>

              <Select
                value={cohort}
                onValueChange={(v) => {
                  setCohort(v)
                  setOffset(0)
                }}
              >
                <SelectTrigger className="w-[215px] bg-slate-950/70 border-slate-800 text-sm text-slate-200">
                  <SelectValue placeholder="Industry Cohort" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="all">All Cohorts</SelectItem>
                  {PROSPECT_COHORTS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.shortLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={source}
                onValueChange={(v) => {
                  setSource(v)
                  setOffset(0)
                }}
              >
                <SelectTrigger className="w-[235px] bg-slate-950/70 border-slate-800 text-sm text-slate-200">
                  <SelectValue placeholder="Lead Source" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  {PROSPECT_SOURCE_FILTERS.map((sf) => (
                    <SelectItem key={sf.value} value={sf.value}>
                      {sf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={tier}
                onValueChange={(v) => {
                  setTier(v)
                  setOffset(0)
                }}
              >
                <SelectTrigger className="w-[155px] bg-slate-950/70 border-slate-800 text-sm text-slate-200">
                  <SelectValue placeholder="Priority Tier" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="all">All Tiers</SelectItem>
                  {PRIORITY_TIERS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={angle}
                onValueChange={(v) => {
                  setAngle(v)
                  setOffset(0)
                }}
              >
                <SelectTrigger className="w-[215px] bg-slate-950/70 border-slate-800 text-sm text-slate-200">
                  <SelectValue placeholder="Outreach Angle" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="all">All Outreach Angles</SelectItem>
                  {OUTREACH_ANGLES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => handlePromote(selectedIds)}
                  disabled={promoting}
                  className="ai-glow flex items-center gap-1.5"
                >
                  {promoting ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                  Promote {selectedIds.length} to Pipeline
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="border-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5"
              >
                <Download size={14} />
                Export CSV ({total.toLocaleString()})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={load}
                disabled={loading}
                className="border-slate-700 text-slate-300 hover:text-white"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>

          {/* Quick Boolean Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="challenger-sweet-spot-toggle"
                aria-pressed={sweetSpotOnly}
                onClick={() => {
                  setSweetSpotOnly((v) => !v)
                  setOffset(0)
                }}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  sweetSpotOnly
                    ? "bg-amber-500/20 text-amber-200 border-amber-400/70 shadow-sm shadow-amber-500/20"
                    : "bg-amber-950/30 text-amber-300/90 border-amber-500/30 hover:bg-amber-950/50 hover:text-amber-200"
                }`}
              >
                <span aria-hidden="true">🎯</span>
                <span>Challenger Sweet Spot (3.5★–4.6★ • 35–250 rev)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHasEmail((v) => !v)
                  setOffset(0)
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  hasEmail
                    ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/50"
                    : "bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <Mail size={12} />
                Has Verified Email
              </button>

              <button
                type="button"
                onClick={() => {
                  setHasAds((v) => !v)
                  setOffset(0)
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  hasAds
                    ? "bg-cyan-950/70 text-cyan-300 border-cyan-500/50"
                    : "bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <Megaphone size={12} />
                Active Paid Ads / Pixels
              </button>

              <button
                type="button"
                onClick={() => {
                  setNeedsBot((v) => !v)
                  setOffset(0)
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  needsBot
                    ? "bg-violet-950/70 text-violet-300 border-violet-500/50"
                    : "bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <Bot size={12} />
                No Visible Chat Bot (Bonus)
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Showing{" "}
              <span className="text-slate-200 font-medium">
                {total === 0 ? 0 : offset + 1}–{Math.min(offset + items.length, total)}
              </span>{" "}
              of <span className="text-slate-200 font-medium">{total.toLocaleString()}</span> audited companies
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prospects Table */}
      <Card className="bg-slate-900/70 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 w-9">
                  <input
                    type="checkbox"
                    aria-label="Select all visible prospects"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900"
                  />
                </th>
                <th className="p-3">Tier / Gap</th>
                <th className="p-3">Company & Metro</th>
                <th className="p-3">Cohort</th>
                <th className="p-3">Google Reviews</th>
                <th className="p-3">Best Practices (Visual • Sales • Tech) + Creative</th>
                <th className="p-3">Contacts</th>
                <th className="p-3">Outreach Angle</th>
                <th className="p-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <Loader2 size={20} className="animate-spin inline mr-2" />
                    Loading audited prospect database...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    No prospects match the active filters.
                  </td>
                </tr>
              ) : (
                items.map((p) => {
                  const primaryEmail =
                    p.emails.find((e) => e.kind === "owner")?.address ?? p.emails[0]?.address ?? null
                  const fp = p.fourPillars
                  const step1Score = fp?.brandingUxUi.score ?? Math.round((p.aestheticsScore + p.brandingScore) / 2)
                  const step2Score = fp?.marketingSales.score ?? p.marketingScore
                  const step3Score = fp?.technicalStack.score ?? Math.round((p.seoAeoScore + p.trackingCrmScore) / 2)
                  const creativeScore = fp?.creativePart?.score ?? p.creativeScore

                  return (
                    <tr
                      key={p.id}
                      onClick={() => openDrawer(p)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${p.company}`}
                          checked={selectedIds.includes(p.id)}
                          onChange={() => toggleSelectOne(p.id)}
                          className="rounded border-slate-700 bg-slate-900"
                        />
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={`font-bold ${tierBadgeClass(p.priorityTier)}`}>
                            {p.priorityTier}
                          </Badge>
                          <Badge variant="outline" className={`text-[11px] ${gapColorClass(p.modernizationGapScore)}`}>
                            Gap {p.modernizationGapScore}/10
                          </Badge>
                        </div>
                        {p.promotedCrmId ? (
                          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                            <Check size={10} /> In Pipeline
                          </div>
                        ) : p.crmItemId ? (
                          <div className="text-[10px] text-sky-400 mt-1 flex items-center gap-1">
                            <Check size={10} /> Existing CRM
                          </div>
                        ) : null}
                      </td>

                      <td className="p-3 max-w-[250px]">
                        <div className="font-semibold text-white truncate">{p.company}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                          <span className="truncate">{p.domain.endsWith(".local") ? "No standalone domain" : p.domain}</span>
                          {p.source === "google_places_50metros_p2" && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-indigo-950/70 text-indigo-300 border-indigo-500/40">
                              Page-2
                            </Badge>
                          )}
                          {p.source === "google_places_50metros_p3" && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-violet-950/70 text-violet-300 border-violet-500/40">
                              Page-3
                            </Badge>
                          )}
                          {p.websiteStatus === "unlinked_on_gbp" && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-950/70 text-amber-300 border-amber-500/40">
                              Unlinked GBP
                            </Badge>
                          )}
                          {p.websiteStatus === "social_only_whale" && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-pink-950/70 text-pink-300 border-pink-500/40">
                              Social-Only
                            </Badge>
                          )}
                        </div>
                        {(p.city || p.metro) && (
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {[p.city, p.state].filter(Boolean).join(", ") || p.metro}
                          </div>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <Badge variant="outline" className={`text-xs ${cohortBadgeClass(p.cohort)}`}>
                          {cohortLabel(p.cohort)}
                        </Badge>
                        {p.subCategory && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px] mt-1">{p.subCategory}</div>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {p.googleRating ? (
                          <div>
                            <div className="flex items-center gap-1 text-amber-300 font-semibold">
                              <Star size={13} className="fill-amber-400 text-amber-400" />
                              <span>{p.googleRating.toFixed(1)}</span>
                              <span className="text-slate-400 font-normal text-xs">
                                ({(p.googleReviewsCount ?? 0).toLocaleString()})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Money {p.businessStrengthScore}/10
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            title="Step 1: Branding & UX/UI Visual Best Practices"
                            className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${scoreColorClass(step1Score)}`}
                          >
                            UX {step1Score}
                          </span>
                          <span
                            title="Step 2: Sales & Conversion Best Practices"
                            className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${scoreColorClass(step2Score)}`}
                          >
                            Sell {step2Score}
                          </span>
                          <span
                            title="Step 3: Technical Stack (SEO/AEO, Speed, Pixels, CRM, DNS)"
                            className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${scoreColorClass(step3Score)}`}
                          >
                            Tech {step3Score}
                          </span>
                          <span
                            title="The Creative Part (Differentiation, Hook & Offer Twist)"
                            className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${scoreColorClass(creativeScore)}`}
                          >
                            Creative {creativeScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                          {p.hasPaidAds && <span className="text-cyan-300">• Paid Ads</span>}
                          {p.hasDmarcRisk && <span className="text-amber-300">• DMARC Risk</span>}
                          {fp?.creativePart?.isGenericCliche && <span className="text-rose-300">• Cliché Copy</span>}
                        </div>
                      </td>

                      <td className="p-3 max-w-[190px]">
                        {primaryEmail ? (
                          <div className="text-xs text-emerald-300 truncate">{primaryEmail}</div>
                        ) : (
                          <div className="text-xs text-slate-500">No email on site</div>
                        )}
                        {p.phones[0] && <div className="text-[11px] text-slate-400 mt-0.5">{p.phones[0]}</div>}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <Badge variant="secondary" className="bg-slate-800 text-slate-200 text-xs">
                          {angleLabel(p.outreachAngle)}
                        </Badge>
                      </td>

                      <td className="p-3 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDrawer(p)
                          }}
                        >
                          Inspect
                          <ArrowUpRight size={13} className="ml-1" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/60">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0 || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              className="border-slate-700 text-slate-300"
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <span className="text-xs text-slate-400">
              Page {Math.floor(offset / PAGE_SIZE) + 1} of {Math.ceil(total / PAGE_SIZE)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              className="border-slate-700 text-slate-300"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        )}
      </Card>

      {/* Slide-Over 360° Visual + 4-Step & Creative Audit Drawer */}
      <Sheet open={Boolean(activeProspect)} onOpenChange={(open) => !open && setActiveProspect(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-3xl overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 p-6"
        >
          {activeProspect && (
            <div className="space-y-6 pb-8">
              <SheetHeader className="border-b border-slate-800 pb-4 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={tierBadgeClass(activeProspect.priorityTier)}>
                    Tier {activeProspect.priorityTier}
                  </Badge>
                  <Badge variant="outline" className={cohortBadgeClass(activeProspect.cohort)}>
                    {cohortLabel(activeProspect.cohort)}
                  </Badge>
                  <Badge variant="outline" className={gapColorClass(activeProspect.modernizationGapScore)}>
                    Opportunity Gap {activeProspect.modernizationGapScore}/10
                  </Badge>
                  {activeProspect.reviewMethod === "multimodal_vision" && (
                    <Badge variant="outline" className="bg-violet-950/60 text-violet-300 border-violet-500/40">
                      <Sparkles size={11} className="mr-1" /> Vision Audited
                    </Badge>
                  )}
                </div>

                <SheetTitle className="text-2xl font-bold text-white mt-1">{activeProspect.company}</SheetTitle>
                <SheetDescription className="text-slate-400 flex flex-wrap items-center gap-3 text-xs">
                  {activeProspect.websiteUrl && (
                    <a
                      href={activeProspect.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Globe size={12} />
                      {activeProspect.domain}
                      <ExternalLink size={11} />
                    </a>
                  )}
                  {activeProspect.googleMapsUrl && (
                    <a
                      href={activeProspect.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-300 hover:underline inline-flex items-center gap-1"
                    >
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {activeProspect.googleRating ?? "—"}★ ({activeProspect.googleReviewsCount ?? 0} reviews)
                      <ExternalLink size={11} />
                    </a>
                  )}
                  {(activeProspect.city || activeProspect.metro) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {[activeProspect.city, activeProspect.state].filter(Boolean).join(", ") || activeProspect.metro}
                    </span>
                  )}
                </SheetDescription>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handlePromote([activeProspect.id])}
                    disabled={promoting}
                    className="ai-glow flex items-center gap-1.5"
                  >
                    <Rocket size={14} />
                    {activeProspect.promotedCrmId
                      ? "Sync / Refresh in Pipeline"
                      : activeProspect.crmItemId
                      ? "Sync Audit to CRM Entry"
                      : "Promote to Pipeline"}
                  </Button>
                  {editHook && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyHook(editHook)}
                      className="border-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5"
                    >
                      {copiedHook ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedHook ? "Copied!" : "Copy Outreach Hook"}
                    </Button>
                  )}
                </div>
              </SheetHeader>

              {/* Local Visual Audit Sheet & Clean Free-Report Assets (Stitch | Desktop Full | Mobile Hero | Desktop Hero) */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Homepage Visual Assets (Free Reports & Audit Stitch)
                  </h3>
                  {Boolean(activeProspect.localSheetFile) && !activeProspect.domain.endsWith(".local") && (
                    <a
                      href={`/api/prospects/sheet/${encodeURIComponent(activeProspect.domain)}?view=${assetView}&cohort=${encodeURIComponent(activeProspect.cohort)}&format=png&download=1`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-slate-800/80 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
                    >
                      <Download size={12} />
                      Download PNG ({assetView})
                    </a>
                  )}
                </div>

                {Boolean(activeProspect.localSheetFile) && !activeProspect.domain.endsWith(".local") && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: "sheet", label: "3-Panel Stitch" },
                        { id: "desktop-full", label: "Desktop Full (Report)" },
                        { id: "mobile-hero", label: "Mobile Hero (Report)" },
                        { id: "desktop-hero", label: "Desktop Hero" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setAssetView(tab.id)
                          setSheetImgError(false)
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                          assetView === tab.id
                            ? "bg-blue-950/80 text-blue-200 border-blue-500/60"
                            : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {Boolean(activeProspect.localSheetFile) &&
                !sheetImgError &&
                !activeProspect.domain.endsWith(".local") ? (
                  <div
                    className={`rounded-lg border border-slate-800 bg-slate-950 ${
                      assetView === "desktop-full"
                        ? "max-h-[620px] overflow-y-auto"
                        : assetView === "mobile-hero"
                        ? "flex justify-center p-4"
                        : "overflow-hidden"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/prospects/sheet/${encodeURIComponent(activeProspect.domain)}?view=${assetView}&cohort=${encodeURIComponent(activeProspect.cohort)}`}
                      alt={`${assetView} screenshot for ${activeProspect.company}`}
                      className={
                        assetView === "mobile-hero"
                          ? "max-w-[360px] w-full h-auto rounded-md border border-slate-800 shadow-lg"
                          : "w-full h-auto object-contain"
                      }
                      onError={() => setSheetImgError(true)}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                    {activeProspect.websiteStatus === "social_only_whale"
                      ? "Social-only business (no standalone website to screenshot — prime $10K Foundation Build target)."
                      : !activeProspect.localSheetFile
                      ? "Website failed live render or had no active URL during audit — no visual screenshot sheet captured."
                      : `Local visual asset (${assetView}) not present on this host (media stays 100% local in .local-audits/).`}
                  </div>
                )}
              </div>

              {/* Personalized Outreach Hook & Tier/Angle Controls */}
              <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                    Personalized Outreach Angle & Hook
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={editTier} onValueChange={(v) => setEditTier(v as PriorityTier)}>
                      <SelectTrigger className="h-8 w-[130px] bg-slate-950 border-slate-800 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                        {PRIORITY_TIERS.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={editAngle} onValueChange={(v) => setEditAngle(v as OutreachAngle)}>
                      <SelectTrigger className="h-8 w-[205px] bg-slate-950 border-slate-800 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                        {OUTREACH_ANGLES.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Textarea
                  rows={4}
                  value={editHook}
                  onChange={(e) => setEditHook(e.target.value)}
                  placeholder="Personalized cold email / DM hook..."
                  className="bg-slate-950/80 border-slate-800 text-sm text-slate-100"
                />

                {activeProspect.topFlaws.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">Top Concrete Audit Findings:</div>
                    <ul className="space-y-1">
                      {activeProspect.topFlaws.map((flaw, idx) => (
                        <li key={idx} className="text-xs text-amber-200/90 flex items-start gap-1.5">
                          <ShieldAlert size={13} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>{flaw}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveDrawer}
                    disabled={savingEdit}
                    className="border-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    {savingEdit ? "Saving..." : "Save Angle & Hook"}
                  </Button>
                </div>
              </div>

              {/* Marketing = Visual Best Practices + Conversion/Technical Best Practices + The Creative Part */}
              {activeProspect.fourPillars && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    4-Step Audit Breakdown: Best Practices (Visual + Conversion + Technical) & The Creative Part
                  </h3>

                  {/* Step 1: Branding & UX/UI */}
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-white text-sm">
                        <Palette size={15} className="text-pink-400" />
                        <span>1. Branding & UX/UI (Visual Best Practices)</span>
                        {activeProspect.fourPillars.brandingUxUi.cmsPlatform && (
                          <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                            {activeProspect.fourPillars.brandingUxUi.cmsPlatform}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={scoreColorClass(activeProspect.fourPillars.brandingUxUi.score)}
                      >
                        {activeProspect.fourPillars.brandingUxUi.score}/10
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300">{activeProspect.fourPillars.brandingUxUi.summary}</p>
                    <GoodsAndBads
                      goods={activeProspect.fourPillars.brandingUxUi.goods}
                      bads={activeProspect.fourPillars.brandingUxUi.bads}
                    />
                  </div>

                  {/* Step 2: Marketing & Sales Conversion */}
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-white text-sm">
                        <Layers size={15} className="text-emerald-400" />
                        <span>2. Conversion & Sales ("Can This Website Sell?")</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-800 text-slate-200 text-[11px]">
                          {activeProspect.fourPillars.marketingSales.canItSellVerdict}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={scoreColorClass(activeProspect.fourPillars.marketingSales.score)}
                        >
                          {activeProspect.fourPillars.marketingSales.score}/10
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">{activeProspect.fourPillars.marketingSales.summary}</p>
                    <GoodsAndBads
                      goods={activeProspect.fourPillars.marketingSales.goods}
                      bads={activeProspect.fourPillars.marketingSales.bads}
                    />
                  </div>

                  {/* Positioning, Industry Conventions & High-ROI Edge */}
                  <div className="rounded-lg border border-violet-500/30 bg-violet-950/15 p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-white text-sm">
                        <Sparkles size={15} className="text-violet-400" />
                        <span>Positioning, Industry Standards & Practical High-ROI Edge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            activeProspect.fourPillars.creativePart.isGenericCliche
                              ? "bg-slate-800 text-slate-300 border-slate-600 text-[11px]"
                              : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 text-[11px]"
                          }
                        >
                          {activeProspect.fourPillars.creativePart.isGenericCliche
                            ? "Standard Local Convention"
                            : "Sharp Offer / Positioning"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={scoreColorClass(activeProspect.fourPillars.creativePart.score)}
                        >
                          {activeProspect.fourPillars.creativePart.score}/10
                        </Badge>
                      </div>
                    </div>
                    {activeProspect.fourPillars.creativePart.observedHeadlineOrHook && (
                      <div className="text-xs text-slate-400 italic">
                        Observed Hero Copy: &ldquo;{activeProspect.fourPillars.creativePart.observedHeadlineOrHook}&rdquo;
                      </div>
                    )}
                    <p className="text-xs text-violet-200/90 font-medium">
                      Practical High-ROI Lever (&lt;1 US Hire Cost): {activeProspect.fourPillars.creativePart.creativeUpsidePitch}
                    </p>
                    <GoodsAndBads
                      goods={activeProspect.fourPillars.creativePart.goods}
                      bads={activeProspect.fourPillars.creativePart.bads}
                    />
                  </div>

                  {/* Step 3: Technical Stack */}
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-white text-sm">
                        <Wrench size={15} className="text-cyan-400" />
                        <span>3. Technical Stack (SEO, AEO/GEO, Speed, CRM, Tracking & DNS)</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={scoreColorClass(activeProspect.fourPillars.technicalStack.score)}
                      >
                        {activeProspect.fourPillars.technicalStack.score}/10
                      </Badge>
                    </div>
                    {activeProspect.fourPillars.technicalStack.detectedStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {activeProspect.fourPillars.technicalStack.detectedStack.map((item, i) => (
                          <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-200 text-[11px]">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-300">{activeProspect.fourPillars.technicalStack.summary}</p>
                    <GoodsAndBads
                      goods={activeProspect.fourPillars.technicalStack.goods}
                      bads={activeProspect.fourPillars.technicalStack.bads}
                    />
                  </div>

                  {/* Step 4: Visible Automation (Secondary / Optional Bonus Signal) */}
                  <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-medium text-slate-300 text-sm">
                        <Bot size={15} className="text-slate-400" />
                        <span>4. Visible Automation & Intake Widgets</span>
                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                          Secondary / External Signal Only
                        </Badge>
                      </div>
                      <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                        {activeProspect.fourPillars.automation.score}/10
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{activeProspect.fourPillars.automation.summary}</p>
                    {activeProspect.fourPillars.automation.detectedTools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {activeProspect.fourPillars.automation.detectedTools.map((t, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visual Critique Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Visual & Diagnostic Critique Notes
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveDrawer}
                    disabled={savingEdit}
                    className="h-7 px-2.5 border-slate-700 text-slate-200 hover:text-white text-xs flex items-center gap-1.5"
                  >
                    <Save size={12} />
                    {savingEdit ? "Saving..." : "Save Critique & Changes"}
                  </Button>
                </div>
                <Textarea
                  rows={3}
                  value={editCritique}
                  onChange={(e) => setEditCritique(e.target.value)}
                  className="bg-slate-950/70 border-slate-800 text-xs text-slate-200"
                />
              </div>

              {/* Contacts, Decision-Makers & Socials */}
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Contacts, Decision-Makers & Social Footprint
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="text-slate-400 font-medium">Emails</div>
                    {activeProspect.emails.length > 0 ? (
                      activeProspect.emails.map((em, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <a href={`mailto:${em.address}`} className="text-emerald-300 hover:underline">
                            {em.address}
                          </a>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-slate-700 text-slate-400">
                            {em.kind}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500">None extracted</div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-slate-400 font-medium">Phones & Socials</div>
                    {activeProspect.phones.map((ph, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-200">
                        <Phone size={12} className="text-slate-400" />
                        <span>{ph}</span>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(activeProspect.socialLinks)
                        .filter(([, url]) => Boolean(url))
                        .map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url as string}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 hover:text-white capitalize inline-flex items-center gap-1"
                          >
                            {platform}
                            <ExternalLink size={10} />
                          </a>
                        ))}
                    </div>
                  </div>
                </div>

                {activeProspect.decisionMakers.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="text-xs text-slate-400 font-medium">Decision-Makers / Leadership</div>
                    <div className="flex flex-wrap gap-2">
                      {activeProspect.decisionMakers.map((dm, idx) => (
                        <div
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200"
                        >
                          <span className="font-semibold">{dm.name}</span>
                          {dm.role && <span className="text-slate-400"> • {dm.role}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Google Business Profile Customer Review Voice */}
              {activeProspect.googleReviewsSample.length > 0 && (
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Google Business Profile Review Voice ({activeProspect.googleReviewsSample.length} sampled)
                  </div>
                  <div className="space-y-2">
                    {activeProspect.googleReviewsSample.map((rev, idx) => (
                      <div key={idx} className="text-xs border-l-2 border-amber-500/40 pl-3 py-0.5 text-slate-300">
                        <div className="flex items-center gap-2 text-[11px] text-amber-300 font-medium">
                          <span>{rev.rating}★</span>
                          {rev.author && <span className="text-slate-400">{rev.author}</span>}
                          {rev.relativeTime && <span className="text-slate-500">({rev.relativeTime})</span>}
                        </div>
                        <p className="mt-0.5 line-clamp-3">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function GoodsAndBads({ goods, bads }: { goods: string[]; bads: string[] }) {
  if (goods.length === 0 && bads.length === 0) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">The Goods</div>
        {goods.length > 0 ? (
          <ul className="space-y-1">
            {goods.map((g, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-slate-500 italic">No standout positives observed</div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide">The Bads / Gaps</div>
        {bads.length > 0 ? (
          <ul className="space-y-1">
            {bads.map((b, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <XCircle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-slate-500 italic">No critical gaps detected</div>
        )}
      </div>
    </div>
  )
}
