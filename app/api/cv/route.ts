import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { DEFAULT_CV_DATA, type CVProfile } from "@/lib/profile-data"

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

export async function GET() {
  const dbUrl = getDatabaseUrl()

  if (!dbUrl) {
    return NextResponse.json(DEFAULT_CV_DATA)
  }

  try {
    const sql = neon(dbUrl)

    // Ensure cv_profile table exists
    await sql`
      CREATE TABLE IF NOT EXISTS cv_profile (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `.catch(() => {})

    const rows = await sql`
      SELECT data FROM cv_profile WHERE id = 'primary';
    `

    if (rows && rows.length > 0) {
      return NextResponse.json(rows[0].data)
    }

    // Seed default CV data if table is currently empty
    await sql`
      INSERT INTO cv_profile (id, data, updated_at)
      VALUES ('primary', ${JSON.stringify(DEFAULT_CV_DATA)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING;
    `.catch(() => {})

    return NextResponse.json(DEFAULT_CV_DATA)
  } catch (error) {
    console.warn("Database query error in GET /api/cv, returning fallback:", error)
    return NextResponse.json(DEFAULT_CV_DATA)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: CVProfile = await request.json()

    if (!body || !body.name) {
      return NextResponse.json({ error: "Invalid CV profile data provided" }, { status: 400 })
    }

    const dbUrl = getDatabaseUrl()

    if (!dbUrl) {
      Object.assign(DEFAULT_CV_DATA, body)
      return NextResponse.json(DEFAULT_CV_DATA)
    }

    const sql = neon(dbUrl)

    await sql`
      CREATE TABLE IF NOT EXISTS cv_profile (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `.catch(() => {})

    const result = await sql`
      INSERT INTO cv_profile (id, data, updated_at)
      VALUES ('primary', ${JSON.stringify(body)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data,
          updated_at = CURRENT_TIMESTAMP
      RETURNING data;
    `

    return NextResponse.json(result[0].data)
  } catch (error) {
    console.error("Error saving CV profile data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update CV data" },
      { status: 500 }
    )
  }
}
