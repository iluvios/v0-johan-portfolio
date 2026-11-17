import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/admin-auth"
import { getDatabaseUrl } from "@/lib/crm-db"
import { PROSPECT_SOURCE_FILTERS } from "@/lib/prospects"
import {
  InvalidProspectPatchError,
  patchProspectAudit,
  PROSPECT_CSV_EXPORT_MAX_ROWS,
  prospectsToCsv,
  queryProspects,
  upsertProspectAudits,
} from "@/lib/prospects-db"

function parseOptionalNumber(raw: string | null): { value: number | undefined; valid: boolean } {
  if (raw === null || raw.trim() === "") return { value: undefined, valid: true }
  const n = Number(raw)
  if (!Number.isFinite(n)) return { value: undefined, valid: false }
  return { value: n, valid: true }
}

const CSV_EXPORT_MAX_ROWS = Math.max(20000, PROSPECT_CSV_EXPORT_MAX_ROWS)
const VALID_SOURCE_FILTERS = new Set<string>(PROSPECT_SOURCE_FILTERS.map((s) => s.value))

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const sp = request.nextUrl.searchParams
  const minRatingParsed = parseOptionalNumber(sp.get("minRating"))
  const maxRatingParsed = parseOptionalNumber(sp.get("maxRating"))
  const minReviewsParsed = parseOptionalNumber(sp.get("minReviews"))
  const maxReviewsParsed = parseOptionalNumber(sp.get("maxReviews"))

  if (!minRatingParsed.valid || !maxRatingParsed.valid || !minReviewsParsed.valid || !maxReviewsParsed.valid) {
    return NextResponse.json(
      { error: "Invalid numeric filter parameter (minRating, maxRating, minReviews, maxReviews must be finite numbers)" },
      { status: 400 },
    )
  }

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    return NextResponse.json({ items: [], total: 0, kpis: [] })
  }

  const format = sp.get("format")
  const rawSource = sp.get("source")
  const normalizedSource = rawSource && VALID_SOURCE_FILTERS.has(rawSource) ? rawSource : undefined
  const filters = {
    cohort: sp.get("cohort") ?? undefined,
    tier: sp.get("tier") ?? undefined,
    angle: sp.get("angle") ?? undefined,
    source: normalizedSource,
    metro: sp.get("metro") ?? undefined,
    hasEmail: sp.get("hasEmail") === "1" || sp.get("hasEmail") === "true",
    hasAds: sp.get("hasAds") === "1" || sp.get("hasAds") === "true",
    needsBot: sp.get("needsBot") === "1" || sp.get("needsBot") === "true",
    minRating: minRatingParsed.value,
    maxRating: maxRatingParsed.value,
    minReviews: minReviewsParsed.value,
    maxReviews: maxReviewsParsed.value,
    search: sp.get("search") ?? undefined,
    limit: format === "csv" ? CSV_EXPORT_MAX_ROWS : Number(sp.get("limit")) || 80,
    offset: format === "csv" ? 0 : Number(sp.get("offset")) || 0,
  }

  try {
    const sql = neon(dbUrl)
    const result = await queryProspects(
      sql,
      filters,
      format === "csv" ? CSV_EXPORT_MAX_ROWS : 250,
      { omitHeavyJson: format === "csv" },
    )
    if (format === "csv") {
      const csv = prospectsToCsv(result.items)
      const rawSlug = filters.cohort && filters.cohort !== "all" ? filters.cohort : "all-cohorts"
      const cohortSlug = rawSlug.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "all-cohorts"
      const filename = `prospects-${cohortSlug}-${new Date().toISOString().slice(0, 10)}.csv`
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error loading prospect audits:", error)
    return NextResponse.json({ error: "Failed to load prospect audits" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
  }

  if (!Array.isArray(body) && body.action !== undefined && body.action !== "patch" && body.action !== "upsert") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
  }

  try {
    const sql = neon(dbUrl)
    if (!Array.isArray(body) && body.action === "patch") {
      const id = Number(body.id)
      if (!Number.isSafeInteger(id) || id <= 0) {
        return NextResponse.json({ error: "Valid prospect id is required" }, { status: 400 })
      }
      if (!body.patch || typeof body.patch !== "object" || Array.isArray(body.patch)) {
        return NextResponse.json({ error: "Valid patch object is required" }, { status: 400 })
      }
      const updated = await patchProspectAudit(sql, id, body.patch)
      if (!updated) return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
      return NextResponse.json(updated)
    }

    const items = Array.isArray(body) ? body : Array.isArray(body.items) ? body.items : [body]
    const upserted = await upsertProspectAudits(sql, items)
    if (upserted === 0) {
      return NextResponse.json(
        { error: "No valid prospect records with domain and company provided" },
        { status: 400 },
      )
    }
    return NextResponse.json({ upserted })
  } catch (error) {
    if (error instanceof InvalidProspectPatchError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error saving prospect audits:", error)
    return NextResponse.json({ error: "Failed to save prospect audits" }, { status: 500 })
  }
}
