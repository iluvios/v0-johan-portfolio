import type { NeonQueryFunction } from "@neondatabase/serverless"
import {
  CRM_ACTIVITY_TYPES,
  CRM_STAGES,
  type CrmActivity,
  type CrmDraft,
  type CrmItem,
  type CrmKind,
  type CrmStage,
} from "@/lib/crm"
import { CRM_SEED } from "@/lib/crm-seed"

// Server-only helpers for the CRM API routes.

export type Sql = NeonQueryFunction<false, false>

export function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

const STAGE_VALUES = CRM_STAGES.map((s) => s.value)
const ACTIVITY_VALUES = [...CRM_ACTIVITY_TYPES.map((a) => a.value), "stage"]

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null
}

// Validates and normalizes a request body. Returns null when the company is missing.
export function sanitizeDraft(body: any): CrmDraft | null {
  const company = text(body?.company, 200)
  if (!company) return null
  const priority = Number(body.priority)
  return {
    kind: (body.kind === "client" ? "client" : "job") as CrmKind,
    company,
    title: text(body.title, 200) ?? "",
    url: text(body.url, 600),
    location: text(body.location, 200),
    compensation: text(body.compensation, 200),
    source: text(body.source, 120),
    stage: (STAGE_VALUES.includes(body.stage) ? body.stage : "lead") as CrmStage,
    priority: (priority === 1 || priority === 3 ? priority : 2) as 1 | 2 | 3,
    contactName: text(body.contactName, 200),
    contactRole: text(body.contactRole, 200),
    contactEmail: text(body.contactEmail, 254),
    contactUrl: text(body.contactUrl, 600),
    nextStep: text(body.nextStep, 400),
    nextStepDate:
      typeof body.nextStepDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.nextStepDate)
        ? body.nextStepDate
        : null,
    notes: text(body.notes, 20000),
    tags: Array.isArray(body.tags)
      ? [...new Set(body.tags.filter((t: unknown) => typeof t === "string" && t.trim()).map((t: string) => t.trim().slice(0, 40)))].slice(0, 20) as string[]
      : [],
    activities: Array.isArray(body.activities)
      ? body.activities
          .filter((a: any) => a && typeof a.text === "string" && a.text.trim())
          .slice(0, 1000)
          .map(
            (a: any): CrmActivity => ({
              id: typeof a.id === "string" && a.id ? a.id.slice(0, 64) : crypto.randomUUID(),
              at: typeof a.at === "string" && !Number.isNaN(Date.parse(a.at)) ? a.at : new Date().toISOString(),
              type: ACTIVITY_VALUES.includes(a.type) ? a.type : "note",
              text: a.text.trim().slice(0, 4000),
            }),
          )
      : [],
  }
}

export function rowToItem(row: any): CrmItem {
  return {
    id: Number(row.id),
    kind: row.kind,
    company: row.company,
    title: row.title ?? "",
    url: row.url,
    location: row.location,
    compensation: row.compensation,
    source: row.source,
    stage: row.stage,
    priority: Number(row.priority) as 1 | 2 | 3,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    contactEmail: row.contact_email,
    contactUrl: row.contact_url,
    nextStep: row.next_step,
    nextStepDate: row.next_step_date,
    notes: row.notes,
    tags: Array.isArray(row.tags) ? row.tags : [],
    activities: Array.isArray(row.activities) ? row.activities : [],
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export async function insertItem(sql: Sql, d: CrmDraft): Promise<CrmItem> {
  const rows = (await sql`
    INSERT INTO crm_items (
      kind, company, title, url, location, compensation, source, stage, priority,
      contact_name, contact_role, contact_email, contact_url, next_step, next_step_date,
      notes, tags, activities
    ) VALUES (
      ${d.kind}, ${d.company}, ${d.title}, ${d.url}, ${d.location}, ${d.compensation}, ${d.source},
      ${d.stage}, ${d.priority}, ${d.contactName}, ${d.contactRole}, ${d.contactEmail}, ${d.contactUrl},
      ${d.nextStep}, ${d.nextStepDate}, ${d.notes}, ${JSON.stringify(d.tags)}::jsonb,
      ${JSON.stringify(d.activities)}::jsonb
    )
    RETURNING *
  `) as any[]
  return rowToItem(rows[0])
}

export async function updateItem(sql: Sql, id: number, d: CrmDraft): Promise<CrmItem | null> {
  const rows = (await sql`
    UPDATE crm_items SET
      kind = ${d.kind}, company = ${d.company}, title = ${d.title}, url = ${d.url},
      location = ${d.location}, compensation = ${d.compensation}, source = ${d.source},
      stage = ${d.stage}, priority = ${d.priority}, contact_name = ${d.contactName},
      contact_role = ${d.contactRole}, contact_email = ${d.contactEmail}, contact_url = ${d.contactUrl},
      next_step = ${d.nextStep}, next_step_date = ${d.nextStepDate}, notes = ${d.notes},
      tags = ${JSON.stringify(d.tags)}::jsonb, activities = ${JSON.stringify(d.activities)}::jsonb,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `) as any[]
  return rows[0] ? rowToItem(rows[0]) : null
}

// Creates the table on first use and imports the seed data exactly once (only when the
// table didn't exist yet), so deleting every record later won't bring the seed back.
export async function ensureCrmTable(sql: Sql): Promise<void> {
  const [{ exists }] = (await sql`SELECT to_regclass('public.crm_items') IS NOT NULL AS exists`) as any[]
  if (exists) return
  await sql`
    CREATE TABLE IF NOT EXISTS crm_items (
      id SERIAL PRIMARY KEY,
      kind VARCHAR(20) NOT NULL DEFAULT 'job',
      company TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      url TEXT,
      location TEXT,
      compensation TEXT,
      source TEXT,
      stage VARCHAR(30) NOT NULL DEFAULT 'lead',
      priority INTEGER NOT NULL DEFAULT 2,
      contact_name TEXT,
      contact_role TEXT,
      contact_email TEXT,
      contact_url TEXT,
      next_step TEXT,
      next_step_date TEXT,
      notes TEXT,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      activities JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `
  const [{ count }] = (await sql`SELECT count(*)::int AS count FROM crm_items`) as any[]
  if (count > 0) return
  for (const draft of CRM_SEED) {
    const clean = sanitizeDraft(draft)
    if (clean) await insertItem(sql, clean)
  }
}

// In-memory store for local development without a database.
let memoryId = 0
const now = () => new Date().toISOString()
export const memoryStore: CrmItem[] = CRM_SEED.map((draft) => ({
  ...(sanitizeDraft(draft) as CrmDraft),
  id: ++memoryId,
  createdAt: now(),
  updatedAt: now(),
}))
export function nextMemoryId(): number {
  return ++memoryId
}
