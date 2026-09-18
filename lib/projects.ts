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
  order_index?: number
  created_at: string
  updated_at: string
}

export function normalizeProject(raw: any): Project {
  if (!raw) return raw

  let tags: string[] = []
  if (Array.isArray(raw.tags)) {
    tags = raw.tags
  } else if (typeof raw.tags === "string") {
    try {
      const parsed = JSON.parse(raw.tags)
      tags = Array.isArray(parsed) ? parsed : [raw.tags]
    } catch {
      tags = raw.tags
        .replace(/^\{|\}$/g, "")
        .split(",")
        .map((s: string) => s.trim().replace(/^"|"$/g, ""))
        .filter(Boolean)
    }
  }

  let gallery: string[] = []
  if (Array.isArray(raw.gallery)) {
    gallery = raw.gallery
  } else if (typeof raw.gallery === "string") {
    try {
      const parsed = JSON.parse(raw.gallery)
      gallery = Array.isArray(parsed) ? parsed : [raw.gallery]
    } catch {
      gallery = raw.gallery
        .replace(/^\{|\}$/g, "")
        .split(",")
        .map((s: string) => s.trim().replace(/^"|"$/g, ""))
        .filter(Boolean)
    }
  }

  return {
    id: Number(raw.id),
    title: (raw.title || "Untitled Project").trim(),
    client: raw.client || null,
    impact: raw.impact || null,
    description: raw.description || null,
    image_url: raw.image_url || "/placeholder.svg",
    category: raw.category || "General",
    tags,
    gallery,
    website_url: raw.website_url || null,
    featured: Boolean(raw.featured),
    order_index: raw.order_index !== undefined && raw.order_index !== null ? Number(raw.order_index) : 0,
    created_at: raw.created_at ? new Date(raw.created_at).toISOString() : new Date().toISOString(),
    updated_at: raw.updated_at ? new Date(raw.updated_at).toISOString() : new Date().toISOString(),
  }
}

// Fallback shown only when the database is unavailable (e.g. local development).
// A subset of the real projects stored in Neon.
export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 45,
    title: "Refio.so",
    client: "Pvragon",
    impact: "Built end-to-end with AI — idea to active users in under 2 months",
    description:
      "Reference-checking platform for hiring teams. I built the whole platform with AI coding tools on Next.js and Supabase, with Twilio for messaging, and took it from idea to a working product with active users in under two months.",
    image_url: "https://bds5xmchxu0in9qb.public.blob.vercel-storage.com/blog-images/1788994715822-refio.so%20home.png",
    category: "Product & MVP",
    tags: ["Next.js", "Supabase", "Twilio", "Figma", "Framer"],
    gallery: [],
    website_url: "https://refio.so/",
    featured: true,
    order_index: 0,
    created_at: "2026-01-15T00:00:00.000Z",
    updated_at: "2026-01-15T00:00:00.000Z",
  },
  {
    id: 46,
    title: "Milo Track",
    client: "Pvragon",
    impact: "Mileage logging and reporting for non-profit health providers",
    description:
      "Mileage tracking app for non-profit health service providers. It makes it easy to log transportation miles and produce accurate, fast reports for insurance companies and government agencies.",
    image_url: "https://bds5xmchxu0in9qb.public.blob.vercel-storage.com/blog-images/1788994834852-Milotrack.png",
    category: "Product & MVP",
    tags: ["Next.js", "Supabase", "Mailchimp", "v0"],
    gallery: [],
    website_url: "https://getmilotrack.com/",
    featured: true,
    order_index: 1,
    created_at: "2026-01-10T00:00:00.000Z",
    updated_at: "2026-01-10T00:00:00.000Z",
  },
  {
    id: 44,
    title: "Agentic Software",
    client: "Agus",
    impact: "Complete brand and website revamp",
    description: null,
    image_url: "https://bds5xmchxu0in9qb.public.blob.vercel-storage.com/blog-images/1788994150369-agentic%20software.png",
    category: "Web Development",
    tags: ["Lovable", "AI content generation"],
    gallery: [],
    website_url: "https://agenticsoftwareinc.com/",
    featured: true,
    order_index: 2,
    created_at: "2026-01-05T00:00:00.000Z",
    updated_at: "2026-01-05T00:00:00.000Z",
  },
  {
    id: 43,
    title: "International Nurses",
    client: "International Nurses",
    impact: "Professional services platform",
    description:
      "Consulting platform for Latin American nurses seeking to work in the United States.",
    image_url: "https://energymedia.com.co/wp-content/uploads/2024/02/international-nurses.png",
    category: "Full-Funnel Strategy",
    tags: ["Healthcare", "Professional Services", "Consulting"],
    gallery: [],
    website_url: "https://international-nurses.com/",
    featured: false,
    order_index: 3,
    created_at: "2024-02-01T00:00:00.000Z",
    updated_at: "2024-02-01T00:00:00.000Z",
  },
  {
    id: 28,
    title: "Savant International",
    client: "Savant International",
    impact: "Business process outsourcing website",
    description:
      "Corporate website for an international BPO offering RPA, automation services, and business process optimization.",
    image_url: "https://energymedia.com.co/wp-content/uploads/2024/09/savant-international.png",
    category: "Marketing Automation",
    tags: ["BPO", "Automation", "Corporate Website"],
    gallery: [],
    website_url: "https://www.savant-international.com/",
    featured: false,
    order_index: 4,
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
  },
]

export async function getProjects(category?: string): Promise<Project[]> {
  try {
    const params = new URLSearchParams()
    if (category) {
      params.append("category", category)
    }

    const response = await fetch(`/api/projects?${params.toString()}`)
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.map(normalizeProject)
      }
    }
  } catch (error) {
    console.warn("Could not fetch projects from API, falling back to default projects:", error)
  }

  // Fallback
  if (category && category !== "All") {
    return DEFAULT_PROJECTS.filter((p) => p.category === category).map(normalizeProject)
  }
  return DEFAULT_PROJECTS.map(normalizeProject)
}

// Alias for getProjects to match expected export name
export async function getAllProjects(category?: string): Promise<Project[]> {
  return getProjects(category)
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const response = await fetch("/api/projects?featured=true")
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        return data.map(normalizeProject)
      }
    }
  } catch (error) {
    console.warn("Could not fetch featured projects from API, using fallback:", error)
  }

  const featured = DEFAULT_PROJECTS.filter((p) => p.featured)
  return (featured.length > 0 ? featured : DEFAULT_PROJECTS.slice(0, 3)).map(normalizeProject)
}

export async function getProject(id: number): Promise<Project | null> {
  try {
    const response = await fetch(`/api/projects/${id}`)
    if (response.ok) {
      const data = await response.json()
      if (data && data.id) {
        return normalizeProject(data)
      }
    }
  } catch (error) {
    console.warn(`Could not fetch project ${id} from API, using fallback:`, error)
  }

  const found = DEFAULT_PROJECTS.find((p) => p.id === id)
  return found ? normalizeProject(found) : null
}

export async function createProject(project: Omit<Project, "id" | "created_at" | "updated_at">): Promise<Project> {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to create project")
    }

    const data = await response.json()
    return normalizeProject(data)
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

export async function updateProject(id: number, project: Partial<Project>): Promise<Project> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to update project")
    }

    const data = await response.json()
    return normalizeProject(data)
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
  }
}

export async function deleteProject(id: number): Promise<void> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to delete project")
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}

export async function reorderProjects(projectIds: number[]): Promise<void> {
  try {
    const response = await fetch("/api/projects/reorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectIds }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to reorder projects")
    }
  } catch (error) {
    console.error("Error reordering projects:", error)
    throw error
  }
}
