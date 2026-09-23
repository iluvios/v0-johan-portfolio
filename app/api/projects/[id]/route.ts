import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { DEFAULT_PROJECTS, cleanCaseStudy, normalizeCaseStudy, normalizeProject, type Project } from "@/lib/projects"
import { requireAdmin } from "@/lib/admin-auth"

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params
  const id = Number.parseInt(idParam)
  const dbUrl = getDatabaseUrl()

  if (!dbUrl) {
    const project = DEFAULT_PROJECTS.find((p) => p.id === id)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    return NextResponse.json(normalizeProject(project))
  }

  try {
    const sql = neon(dbUrl)
    const result = await sql`
      SELECT * FROM projects 
      WHERE id = ${id}
    `

    if (!result || result.length === 0) {
      const fallback = DEFAULT_PROJECTS.find((p) => p.id === id)
      if (fallback) return NextResponse.json(normalizeProject(fallback))
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(normalizeProject(result[0]))
  } catch (error) {
    console.warn("Database query error, checking fallback projects:", error)
    const project = DEFAULT_PROJECTS.find((p) => p.id === id)
    if (project) {
      return NextResponse.json(normalizeProject(project))
    }
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const { id: idParam } = await params
    const id = Number.parseInt(idParam)
    const project = await request.json()
    const dbUrl = getDatabaseUrl()

    if (!dbUrl) {
      const index = DEFAULT_PROJECTS.findIndex((p) => p.id === id)
      if (index >= 0) {
        DEFAULT_PROJECTS[index] = normalizeProject({
          ...DEFAULT_PROJECTS[index],
          ...project,
          id,
          updated_at: new Date().toISOString(),
        })
        return NextResponse.json(DEFAULT_PROJECTS[index])
      }
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const sql = neon(dbUrl)
    // Fields missing from the request keep their stored value (partial updates must not wipe data).
    const tagsArray = Array.isArray(project.tags) ? project.tags : null
    const galleryArray = Array.isArray(project.gallery) ? project.gallery : null
    const featured = typeof project.featured === "boolean" ? project.featured : null
    const caseStudy = normalizeCaseStudy(project.case_study)
    const caseStudyJson = caseStudy ? JSON.stringify(cleanCaseStudy(caseStudy)) : null

    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study JSONB;`.catch(() => {})

    const result = await sql`
      UPDATE projects
      SET title = COALESCE(${project.title}, title),
          client = COALESCE(${project.client}, client),
          impact = COALESCE(${project.impact}, impact),
          description = COALESCE(${project.description}, description),
          image_url = COALESCE(${project.image_url}, image_url),
          category = COALESCE(${project.category}, category),
          tags = COALESCE(${tagsArray}, tags),
          gallery = COALESCE(${galleryArray}, gallery),
          website_url = COALESCE(${project.website_url}, website_url),
          featured = COALESCE(${featured}, featured),
          case_study = COALESCE(${caseStudyJson}::jsonb, case_study),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(normalizeProject(result[0]))
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update project" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const { id: idParam } = await params
    const id = Number.parseInt(idParam)
    const dbUrl = getDatabaseUrl()

    if (!dbUrl) {
      const index = DEFAULT_PROJECTS.findIndex((p) => p.id === id)
      if (index >= 0) {
        DEFAULT_PROJECTS.splice(index, 1)
      }
      return NextResponse.json({ success: true })
    }

    const sql = neon(dbUrl)
    await sql`DELETE FROM projects WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete project" },
      { status: 500 }
    )
  }
}
