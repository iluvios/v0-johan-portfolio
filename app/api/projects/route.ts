import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { DEFAULT_PROJECTS, cleanCaseStudy, normalizeCaseStudy, normalizeProject, type Project } from "@/lib/projects"
import { isAdmin, requireAdmin } from "@/lib/admin-auth"
import { SITE_HEADER, isSiteId, resolveSiteFromHost, type SiteId } from "@/lib/tenant"

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING
  )
}

function resolveRequestSite(request: NextRequest): SiteId {
  const querySite = new URL(request.url).searchParams.get("site")
  if (isSiteId(querySite)) return querySite
  const headerSite = request.headers.get(SITE_HEADER)
  if (isSiteId(headerSite)) return headerSite
  return resolveSiteFromHost(request.headers.get("x-forwarded-host") || request.headers.get("host"))
}

function filterFallbackProjects(
  projects: Project[],
  options: { category: string | null; featured: string | null; site: SiteId; includeAll: boolean },
): Project[] {
  let list = projects.map(normalizeProject)
  if (!options.includeAll) {
    list = list.filter((p) => {
      if (p.hidden) return false
      return options.site === "energymedia" ? p.show_on_energymedia !== false : p.show_on_asjohan !== false
    })
  }
  if (options.featured === "true") {
    const featured = list.filter((p) => p.featured)
    return (featured.length > 0 ? featured : list.slice(0, 3)).slice(0, 3)
  }
  if (options.category && options.category !== "All") {
    return list.filter((p) => p.category === options.category)
  }
  return list
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const featured = searchParams.get("featured")
  const scopeAllRequested = searchParams.get("scope") === "all"
  const includeAll = scopeAllRequested && isAdmin(request)
  const site = resolveRequestSite(request)

  const dbUrl = getDatabaseUrl()

  if (!dbUrl) {
    return NextResponse.json(
      filterFallbackProjects(DEFAULT_PROJECTS, { category, featured, site, includeAll }),
    )
  }

  try {
    const sql = neon(dbUrl)

    // Ensure order_index, hidden, and per-site activation columns exist (both sites default ON)
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;`.catch(() => {})
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;`.catch(() => {})
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_on_asjohan BOOLEAN DEFAULT true;`.catch(() => {})
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_on_energymedia BOOLEAN DEFAULT true;`.catch(() => {})

    const isAgency = site === "energymedia"
    const isPersonal = site === "asjohan"

    let projects
    if (featured === "true") {
      projects = await sql`
        SELECT * FROM projects
        WHERE featured = true
          AND (
            ${includeAll}
            OR (
              hidden IS NOT TRUE
              AND ((${isPersonal} AND show_on_asjohan IS NOT FALSE) OR (${isAgency} AND show_on_energymedia IS NOT FALSE))
            )
          )
        ORDER BY order_index ASC NULLS LAST, created_at DESC NULLS LAST, id DESC
        LIMIT 3
      `
      // If no projects are marked as featured for this site, fall back to the first 3 active projects
      if (!projects || projects.length === 0) {
        projects = await sql`
          SELECT * FROM projects
          WHERE ${includeAll}
            OR (
              hidden IS NOT TRUE
              AND ((${isPersonal} AND show_on_asjohan IS NOT FALSE) OR (${isAgency} AND show_on_energymedia IS NOT FALSE))
            )
          ORDER BY order_index ASC NULLS LAST, created_at DESC NULLS LAST, id DESC
          LIMIT 3
        `
      }
    } else if (category && category !== "All") {
      projects = await sql`
        SELECT * FROM projects
        WHERE category = ${category}
          AND (
            ${includeAll}
            OR (
              hidden IS NOT TRUE
              AND ((${isPersonal} AND show_on_asjohan IS NOT FALSE) OR (${isAgency} AND show_on_energymedia IS NOT FALSE))
            )
          )
        ORDER BY order_index ASC NULLS LAST, featured DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
      `
    } else {
      projects = await sql`
        SELECT * FROM projects
        WHERE ${includeAll}
          OR (
            hidden IS NOT TRUE
            AND ((${isPersonal} AND show_on_asjohan IS NOT FALSE) OR (${isAgency} AND show_on_energymedia IS NOT FALSE))
          )
        ORDER BY order_index ASC NULLS LAST, featured DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
      `
    }

    if (!projects || projects.length === 0) {
      // Only fall back to DEFAULT_PROJECTS when the table itself has zero rows.
      // If the table has rows and none match this site's filter, return an empty list honestly.
      const [anyRow] = await sql`SELECT 1 FROM projects LIMIT 1`
      if (!anyRow) {
        return NextResponse.json(
          filterFallbackProjects(DEFAULT_PROJECTS, { category, featured, site, includeAll }),
        )
      }
      return NextResponse.json([])
    }

    return NextResponse.json(projects.map(normalizeProject))
  } catch (error) {
    console.warn("Database query error, returning fallback projects:", error)
    return NextResponse.json(
      filterFallbackProjects(DEFAULT_PROJECTS, { category, featured, site, includeAll }),
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

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
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study JSONB;`.catch(() => {})
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;`.catch(() => {})
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_on_asjohan BOOLEAN DEFAULT true;`.catch(() => {})
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_on_energymedia BOOLEAN DEFAULT true;`.catch(() => {})

    const caseStudy = normalizeCaseStudy(project.case_study)
    const caseStudyJson = caseStudy ? JSON.stringify(cleanCaseStudy(caseStudy)) : null
    const tagsArray = Array.isArray(project.tags) ? project.tags : []
    const galleryArray = Array.isArray(project.gallery) ? project.gallery : []
    const showOnAsjohan = project.show_on_asjohan !== false
    const showOnEnergymedia = project.show_on_energymedia !== false

    const result = await sql`
      INSERT INTO projects (
        title, client, impact, description, image_url, category, tags, gallery,
        website_url, featured, hidden, show_on_asjohan, show_on_energymedia, case_study, order_index
      )
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
        ${Boolean(project.hidden)},
        ${showOnAsjohan},
        ${showOnEnergymedia},
        ${caseStudyJson}::jsonb,
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
