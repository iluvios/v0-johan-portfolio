import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/admin-auth"
import {
  ensureCrmTable,
  getDatabaseUrl,
  insertItem,
  memoryStore,
  nextMemoryId,
  rowToItem,
  sanitizeDraft,
} from "@/lib/crm-db"

// Private CRM data: every method requires an admin session.

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) return NextResponse.json(memoryStore)

  try {
    const sql = neon(dbUrl)
    await ensureCrmTable(sql)
    const rows = (await sql`SELECT * FROM crm_items ORDER BY updated_at DESC, id DESC`) as any[]
    return NextResponse.json(rows.map(rowToItem))
  } catch (error) {
    console.error("Error loading CRM items:", error)
    return NextResponse.json({ error: "Failed to load the pipeline" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const draft = sanitizeDraft(await request.json().catch(() => null))
  if (!draft) return NextResponse.json({ error: "Company is required" }, { status: 400 })

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    const at = new Date().toISOString()
    const item = { ...draft, id: nextMemoryId(), createdAt: at, updatedAt: at }
    memoryStore.unshift(item)
    return NextResponse.json(item)
  }

  try {
    const sql = neon(dbUrl)
    await ensureCrmTable(sql)
    return NextResponse.json(await insertItem(sql, draft))
  } catch (error) {
    console.error("Error creating CRM item:", error)
    return NextResponse.json({ error: "Failed to create the record" }, { status: 500 })
  }
}
