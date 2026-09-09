import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { DEFAULT_PROJECTS, normalizeProject, type Project } from "@/lib/projects"

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const featured = searchParams.get("featured")

  const dbUrl = getDatabaseUrl()

  if (!dbUrl) {
    let projects = [...DEFAULT_PROJECTS]
    if (featured === "true") {
      projects = projects.filter((p) => p.featured)
      if (projects.length === 0) projects = DEFAULT_PROJECTS.slice(0, 2)
    } else if (category && category !== "All") {
      projects = projects.filter((p) => p.category === category)
    }
    return NextResponse.json(projects.map(normalizeProject))
  }

  try {
    const sql = neon(dbUrl)

    // Ensure order_index column exists
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;`.catch(() => {})

    let projects
    if (featured === "true") {
      projects = await sql`
        SELECT * FROM projects 
        WHERE featured = true
        ORDER BY order_index ASC NULLS LAST, created_at DESC NULLS LAST, id DESC
        LIMIT 2
      `
      // If no projects are marked as featured, fallback to latest 2 projects
      if (!projects || projects.length === 0) {
        projects = await sql`
          SELECT * FROM projects 
          ORDER BY order_index ASC NULLS LAST, created_at DESC NULLS LAST, id DESC
          LIMIT 2
        `
      }
    } else if (category && category !== "All") {
      projects = await sql`
        SELECT * FROM projects 
        WHERE category = ${category}
        ORDER BY order_index ASC NULLS LAST, featured DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
      `
    } else {
      projects = await sql`
        SELECT * FROM projects 
        ORDER BY order_index ASC NULLS LAST, featured DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
      `
    }

    if (!projects || projects.length === 0) {
      let fallback = [...DEFAULT_PROJECTS]
      if (featured === "true") {
        fallback = fallback.filter((p) => p.featured)
        if (fallback.length === 0) fallback = DEFAULT_PROJECTS.slice(0, 2)
      } else if (category && category !== "All") {
        fallback = fallback.filter((p) => p.category === category)
      }
      return NextResponse.json(fallback.map(normalizeProject))
    }

    return NextResponse.json(projects.map(normalizeProject))
  } catch (error) {
    console.warn("Database query error, returning fallback projects:", error)
    let projects = [...DEFAULT_PROJECTS]
    if (featured === "true") {
      projects = projects.filter((p) => p.featured)
      if (projects.length === 0) projects = DEFAULT_PROJECTS.slice(0, 2)
    } else if (category && category !== "All") {
      projects = projects.filter((p) => p.category === category)
    }
    return NextResponse.json(projects.map(normalizeProject))
  }
}

export async function POST(request: NextRequest) {
  try {
    const dbUrl = getDatabaseUrl()
    const project = await request.json()

    if (!dbUrl) {
      const newProject: Project = normalizeProject({
        ...project,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      DEFAULT_PROJECTS.unshift(newProject)
      return NextResponse.json(newProject)
    }

    const sql = neon(dbUrl)
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;`.catch(() => {})

    const tagsArray = Array.isArray(project.tags) ? project.tags : []
    const galleryArray = Array.isArray(project.gallery) ? project.gallery : []

    const result = await sql`
      INSERT INTO projects (title, client, impact, description, image_url, category, tags, gallery, website_url, featured, order_index)
      VALUES (
        ${project.title || "Untitled Project"},
        ${project.client || null},
        ${project.impact || null},
        ${project.description || null},
        ${project.image_url || "/placeholder.svg"},
        ${project.category || "General"},
        ${tagsArray},
        ${galleryArray},
        ${project.website_url || null},
        ${Boolean(project.featured)},
        ${project.order_index !== undefined ? Number(project.order_index) : 0}
      )
      RETURNING *
    `

    return NextResponse.json(normalizeProject(result[0]))
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create project" },
      { status: 500 }
    )
  }
}
