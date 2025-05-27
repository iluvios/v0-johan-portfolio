import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Project {
  id: number
  title: string
  client: string | null
  impact: string | null
  description: string | null
  image_url: string | null
  category: string | null
  tags: string[]
  gallery: string[]
  website_url: string | null
  featured: boolean
  created_at: string
  updated_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    let query
    if (featured === "true") {
      query = sql`
        SELECT * FROM projects 
        WHERE featured = true
        ORDER BY created_at DESC
        LIMIT 2
      `
    } else if (category && category !== "All") {
      query = sql`
        SELECT * FROM projects 
        WHERE category = ${category}
        ORDER BY featured DESC, created_at DESC
      `
    } else {
      query = sql`
        SELECT * FROM projects 
        ORDER BY featured DESC, created_at DESC
      `
    }

    const projects = await query
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const project = await request.json()

    const result = await sql`
      INSERT INTO projects (title, client, impact, description, image_url, category, tags, gallery, website_url, featured)
      VALUES (${project.title}, ${project.client}, ${project.impact}, ${project.description}, 
              ${project.image_url}, ${project.category}, ${project.tags}, ${project.gallery}, ${project.website_url}, ${project.featured})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
