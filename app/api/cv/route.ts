import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { DEFAULT_CV_DATA, type CVProfile } from "@/lib/profile-data"
import { requireAdmin } from "@/lib/admin-auth"

// The row's updated_at as an exact ISO string (microseconds, UTC). The admin sends it back on save,
// and comparing the same text in SQL avoids millisecond rounding in JS dates.
const VERSION_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'

const CONFLICT_MESSAGE = "The CV changed since you opened it. Reload to get the latest version."

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

    // updated_at rides along with the CV fields so existing readers (/cv, home) keep working unchanged.
    const rows = await sql`
      SELECT data, to_char(updated_at AT TIME ZONE 'UTC', ${VERSION_FORMAT}) AS version
      FROM cv_profile WHERE id = 'primary';
    `

    if (rows && rows.length > 0) {
      return NextResponse.json({ ...rows[0].data, updated_at: rows[0].version })
    }

    // Seed default CV data if table is currently empty
    const seeded = await sql`
      INSERT INTO cv_profile (id, data, updated_at)
      VALUES ('primary', ${JSON.stringify(DEFAULT_CV_DATA)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
      RETURNING to_char(updated_at AT TIME ZONE 'UTC', ${VERSION_FORMAT}) AS version;
    `.catch(() => [])

    return NextResponse.json({ ...DEFAULT_CV_DATA, updated_at: seeded[0]?.version ?? null })
  } catch (error) {
    console.warn("Database query error in GET /api/cv, returning fallback:", error)
    return NextResponse.json(DEFAULT_CV_DATA)
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const { updated_at: loadedVersion, ...body }: CVProfile & { updated_at?: string | null } = await request.json()

    if (!body || !body.name) {
      return NextResponse.json({ error: "Invalid CV profile data provided" }, { status: 400 })
    }

    const dbUrl = getDatabaseUrl()

    if (!dbUrl) {
      Object.assign(DEFAULT_CV_DATA, body)
      return NextResponse.json({ ...DEFAULT_CV_DATA, updated_at: new Date().toISOString() })
    }

    const sql = neon(dbUrl)

    await sql`
      CREATE TABLE IF NOT EXISTS cv_profile (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `.catch(() => {})

    // The admin sends back the updated_at it loaded. If the CV changed since (another tab, a script),
    // refuse the save instead of silently reverting the newer version. Requests without the field
    // (older scripts) keep the previous unconditional behavior.
    if (loadedVersion !== undefined) {
      const result = await sql`
        UPDATE cv_profile
        SET data = ${JSON.stringify(body)},
            updated_at = NOW()
        WHERE id = 'primary'
          AND to_char(updated_at AT TIME ZONE 'UTC', ${VERSION_FORMAT}) IS NOT DISTINCT FROM ${loadedVersion}
        RETURNING data, to_char(updated_at AT TIME ZONE 'UTC', ${VERSION_FORMAT}) AS version;
      `

      if (result.length > 0) {
        return NextResponse.json({ ...result[0].data, updated_at: result[0].version })
      }

      const [exists] = await sql`SELECT 1 FROM cv_profile WHERE id = 'primary'`
      if (exists || loadedVersion !== null) {
        return NextResponse.json({ error: CONFLICT_MESSAGE }, { status: 409 })
      }
    }

    const result = await sql`
      INSERT INTO cv_profile (id, data, updated_at)
      VALUES ('primary', ${JSON.stringify(body)}, NOW())
      ON CONFLICT (id) DO UPDATE
      SET data = EXCLUDED.data,
          updated_at = NOW()
      RETURNING data, to_char(updated_at AT TIME ZONE 'UTC', ${VERSION_FORMAT}) AS version;
    `

    return NextResponse.json({ ...result[0].data, updated_at: result[0].version })
  } catch (error) {
    console.error("Error saving CV profile data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update CV data" },
      { status: 500 }
    )
  }
}
