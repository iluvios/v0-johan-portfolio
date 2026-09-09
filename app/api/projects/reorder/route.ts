import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { DEFAULT_PROJECTS } from "@/lib/projects"

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectIds } = body

    if (!Array.isArray(projectIds)) {
      return NextResponse.json({ error: "projectIds must be an array of project IDs" }, { status: 400 })
    }

    const dbUrl = getDatabaseUrl()

    if (!dbUrl) {
      // In-memory fallback: rearrange DEFAULT_PROJECTS to match order of projectIds
      const projectMap = new Map(DEFAULT_PROJECTS.map((p) => [p.id, p]))
      const reordered = []

      for (let i = 0; i < projectIds.length; i++) {
        const p = projectMap.get(projectIds[i])
        if (p) {
          p.order_index = i
          reordered.push(p)
          projectMap.delete(projectIds[i])
        }
      }

      // Append any remaining projects
      for (const remaining of projectMap.values()) {
        reordered.push(remaining)
      }

      DEFAULT_PROJECTS.length = 0
      DEFAULT_PROJECTS.push(...reordered)

      return NextResponse.json({ success: true, count: projectIds.length })
    }

    const sql = neon(dbUrl)

    // Ensure order_index column exists in Neon PostgreSQL
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;`

    // Batch update order_index for all projects in the list
    for (let index = 0; index < projectIds.length; index++) {
      await sql`
        UPDATE projects 
        SET order_index = ${index}
        WHERE id = ${projectIds[index]}
      `
    }

    return NextResponse.json({ success: true, count: projectIds.length })
  } catch (error) {
    console.error("Error updating project order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update project order" },
      { status: 500 }
    )
  }
}
