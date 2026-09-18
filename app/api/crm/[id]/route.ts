import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/admin-auth"
import { ensureCrmTable, getDatabaseUrl, memoryStore, sanitizeDraft, updateItem } from "@/lib/crm-db"

type Params = { params: Promise<{ id: string }> }

async function parseId(params: Params["params"]): Promise<number | null> {
  const id = Number.parseInt((await params).id, 10)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export async function PUT(request: NextRequest, { params }: Params) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const id = await parseId(params)
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  const draft = sanitizeDraft(await request.json().catch(() => null))
  if (!draft) return NextResponse.json({ error: "Company is required" }, { status: 400 })

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    const index = memoryStore.findIndex((item) => item.id === id)
    if (index < 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    memoryStore[index] = { ...memoryStore[index], ...draft, updatedAt: new Date().toISOString() }
    return NextResponse.json(memoryStore[index])
  }

  try {
    const sql = neon(dbUrl)
    await ensureCrmTable(sql)
    const item = await updateItem(sql, id, draft)
    return item ? NextResponse.json(item) : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (error) {
    console.error("Error updating CRM item:", error)
    return NextResponse.json({ error: "Failed to save the record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const id = await parseId(params)
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    const index = memoryStore.findIndex((item) => item.id === id)
    if (index >= 0) memoryStore.splice(index, 1)
    return NextResponse.json({ success: true })
  }

  try {
    const sql = neon(dbUrl)
    await sql`DELETE FROM crm_items WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting CRM item:", error)
    return NextResponse.json({ error: "Failed to delete the record" }, { status: 500 })
  }
}
