import { type NextRequest, NextResponse } from "next/server"
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { requireAdmin } from "@/lib/admin-auth"
import { DEFAULT_ROADMAP, type Roadmap } from "@/lib/roadmap"

// The roadmap is private: both reading and writing require an admin session.

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

// In-memory fallback for local development without a database.
let memoryRoadmap: Roadmap = DEFAULT_ROADMAP

async function ensureTable(sql: NeonQueryFunction<false, false>) {
  await sql`
    CREATE TABLE IF NOT EXISTS skill_roadmap (
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
  if (!dbUrl) return NextResponse.json(memoryRoadmap)

  try {
    const sql = neon(dbUrl)
    await ensureTable(sql)
    const rows = (await sql`SELECT data FROM skill_roadmap WHERE id = 'primary';`) as { data: Roadmap }[]
    if (rows.length > 0) return NextResponse.json(rows[0].data)

    await sql`
      INSERT INTO skill_roadmap (id, data, updated_at)
      VALUES ('primary', ${JSON.stringify(DEFAULT_ROADMAP)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING;
    `
    return NextResponse.json(DEFAULT_ROADMAP)
  } catch (error) {
    console.error("Error loading roadmap:", error)
    return NextResponse.json({ error: "Failed to load roadmap" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const body = (await request.json().catch(() => null)) as Roadmap | null
  if (!body || typeof body.goal !== "string" || !Array.isArray(body.tracks)) {
    return NextResponse.json({ error: "Invalid roadmap data" }, { status: 400 })
  }
  const roadmap: Roadmap = { ...body, updatedAt: new Date().toISOString() }

  const dbUrl = getDatabaseUrl()
  if (!dbUrl) {
    memoryRoadmap = roadmap
    return NextResponse.json(memoryRoadmap)
  }

  try {
    const sql = neon(dbUrl)
    await ensureTable(sql)
    const result = (await sql`
      INSERT INTO skill_roadmap (id, data, updated_at)
      VALUES ('primary', ${JSON.stringify(roadmap)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
      RETURNING data;
    `) as { data: Roadmap }[]
    return NextResponse.json(result[0].data)
  } catch (error) {
    console.error("Error saving roadmap:", error)
    return NextResponse.json({ error: "Failed to save roadmap" }, { status: 500 })
  }
}
