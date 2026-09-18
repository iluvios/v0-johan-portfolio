import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/admin-auth"
import { ensureCrmTable, getDatabaseUrl, memoryStore, nextMemoryId, sanitizeDraft } from "@/lib/crm-db"
import type { CrmDraft } from "@/lib/crm"

// Bulk import (e.g. lists produced by the scraping scripts). Skips records that already exist,
// matched by same pipeline + company + title, or by the same URL.

const MAX_ITEMS = 500

const key = (d: CrmDraft) => `${d.kind}|${d.company.toLowerCase()}|${d.title.toLowerCase()}`

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const body = await request.json().catch(() => null)
  const raw: unknown[] = Array.isArray(body?.items) ? body.items : []
  if (raw.length === 0) return NextResponse.json({ error: "Send { items: [...] }" }, { status: 400 })
  if (raw.length > MAX_ITEMS) {
    return NextResponse.json({ error: `Send at most ${MAX_ITEMS} items per request` }, { status: 413 })
  }

  const seen = new Set<string>()
  const drafts = raw
    .map((item) => sanitizeDraft(item))
    .filter((d): d is CrmDraft => d !== null && !seen.has(key(d)) && Boolean(seen.add(key(d))))

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    const existing = new Set(memoryStore.map(key))
    const urls = new Set(memoryStore.map((i) => i.url).filter(Boolean))
    const fresh = drafts.filter((d) => !existing.has(key(d)) && !(d.url && urls.has(d.url)))
    const at = new Date().toISOString()
    fresh.forEach((d) => memoryStore.push({ ...d, id: nextMemoryId(), createdAt: at, updatedAt: at }))
    return NextResponse.json({ received: raw.length, valid: drafts.length, inserted: fresh.length })
  }

  const rows = drafts.map((d) => ({
    kind: d.kind,
    company: d.company,
    title: d.title,
    url: d.url,
    location: d.location,
    compensation: d.compensation,
    source: d.source,
    stage: d.stage,
    priority: d.priority,
    contact_name: d.contactName,
    contact_role: d.contactRole,
    contact_email: d.contactEmail,
    contact_url: d.contactUrl,
    next_step: d.nextStep,
    next_step_date: d.nextStepDate,
    notes: d.notes,
    tags: d.tags,
    activities: d.activities,
  }))

  try {
    const sql = neon(dbUrl)
    await ensureCrmTable(sql)
    const inserted = (await sql`
      INSERT INTO crm_items (
        kind, company, title, url, location, compensation, source, stage, priority,
        contact_name, contact_role, contact_email, contact_url, next_step, next_step_date,
        notes, tags, activities
      )
      SELECT
        x.kind, x.company, x.title, x.url, x.location, x.compensation, x.source, x.stage, x.priority,
        x.contact_name, x.contact_role, x.contact_email, x.contact_url, x.next_step, x.next_step_date,
        x.notes, COALESCE(x.tags, '[]'::jsonb), COALESCE(x.activities, '[]'::jsonb)
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS x(
        kind text, company text, title text, url text, location text, compensation text, source text,
        stage text, priority int, contact_name text, contact_role text, contact_email text,
        contact_url text, next_step text, next_step_date text, notes text, tags jsonb, activities jsonb
      )
      WHERE NOT EXISTS (
        SELECT 1 FROM crm_items c
        WHERE (c.kind = x.kind AND lower(c.company) = lower(x.company) AND lower(c.title) = lower(x.title))
           OR (x.url IS NOT NULL AND c.url = x.url)
      )
      RETURNING id
    `) as { id: number }[]
    return NextResponse.json({ received: raw.length, valid: drafts.length, inserted: inserted.length })
  } catch (error) {
    console.error("Error importing CRM items:", error)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
