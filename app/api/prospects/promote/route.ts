import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/admin-auth"
import { getDatabaseUrl } from "@/lib/crm-db"
import { promoteProspectsToCrm } from "@/lib/prospects-db"

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const rawIds: unknown[] = Array.isArray(body?.ids) ? body.ids : body?.id ? [body.id] : []
  const ids = rawIds.map((x) => Number(x)).filter((n) => Number.isSafeInteger(n) && n > 0)

  if (ids.length === 0) {
    return NextResponse.json({ error: "At least one valid prospect id is required" }, { status: 400 })
  }

  try {
    const sql = neon(dbUrl)
    const result = await promoteProspectsToCrm(sql, ids)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error promoting prospects to CRM:", error)
    return NextResponse.json({ error: "Failed to promote prospects to pipeline" }, { status: 500 })
  }
}
