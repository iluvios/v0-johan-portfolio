import { type NextRequest, NextResponse } from "next/server"
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/admin-auth"
import { DEFAULT_WORKSPACE, type WorkspaceData } from "@/lib/workspace"

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

let memoryWorkspace: WorkspaceData = DEFAULT_WORKSPACE

async function ensureTable(sql: NeonQueryFunction<false, false>) {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_workspace (
      id VARCHAR(50) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) return NextResponse.json(memoryWorkspace)

  try {
    const sql = neon(dbUrl)
    await ensureTable(sql)
    const rows = (await sql`SELECT data FROM admin_workspace WHERE id = 'primary';`) as {
      data: WorkspaceData
    }[]
    if (rows.length > 0 && rows[0].data?.projects) {
      return NextResponse.json(rows[0].data)
    }

    await sql`
      INSERT INTO admin_workspace (id, data, updated_at)
      VALUES ('primary', ${JSON.stringify(DEFAULT_WORKSPACE)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING;
    `
    return NextResponse.json(DEFAULT_WORKSPACE)
  } catch (error) {
    console.error("Error loading workspace:", error)
    return NextResponse.json(memoryWorkspace)
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const body = (await request.json().catch(() => null)) as WorkspaceData | null
  if (!body || !Array.isArray(body.projects) || !Array.isArray(body.buckets)) {
    return NextResponse.json({ error: "Invalid workspace data" }, { status: 400 })
  }

  const workspace: WorkspaceData = {
    ...body,
    updatedAt: new Date().toISOString(),
  }

  memoryWorkspace = workspace

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    return NextResponse.json(memoryWorkspace)
  }

  try {
    const sql = neon(dbUrl)
    await ensureTable(sql)
    const result = (await sql`
      INSERT INTO admin_workspace (id, data, updated_at)
      VALUES ('primary', ${JSON.stringify(workspace)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
      RETURNING data;
    `) as { data: WorkspaceData }[]
    return NextResponse.json(result[0].data)
  } catch (error) {
    console.error("Error saving workspace:", error)
    return NextResponse.json({ error: "Failed to save workspace" }, { status: 500 })
  }
}
