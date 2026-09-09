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
    title: raw.title || "Untitled Project",
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

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 25,
    title: "Autobruder 4WD",
    client: "Autobruder",
    impact: "Advanced Car Marketplace Platform",
    description:
      "Comprehensive digital marketplace architecture, inventory management synchronization, and high-conversion vehicle sales funnels.",
    image_url: "/marketing-automation-dashboard.png",
    category: "Full-Funnel Strategy",
    tags: ["Marketplace", "Automotive", "Conversion Optimization", "CRM Sync"],
    gallery: ["/marketing-automation-dashboard.png"],
    website_url: "https://example.com",
    featured: true,
    created_at: "2024-02-01T00:00:00.000Z",
    updated_at: "2024-02-01T00:00:00.000Z",
  },
  {
    id: 27,
    title: "Darwin UX Designer Portfolio",
    client: "Darwin Ramirez",
    impact: "Professional UX Designer Portfolio",
    description:
      "High-impact personal branding platform showcasing product design case studies with interactive prototyping galleries.",
    image_url: "/modern-ecommerce-platform.jpg",
    category: "Innovation",
    tags: ["UI/UX", "Portfolio", "Design Systems", "Web Performance"],
    gallery: ["/modern-ecommerce-platform.jpg"],
    website_url: "https://example.com",
    featured: true,
    created_at: "2024-01-25T00:00:00.000Z",
    updated_at: "2024-01-25T00:00:00.000Z",
  },
  {
    id: 29,
    title: "Rainforest Foundation",
    client: "Rainforest Foundation",
    impact: "Environmental Conservation Platform",
    description:
      "Global donor acquisition funnels, digital storytelling experience, and automated non-profit contribution pipelines.",
    image_url: "/mobile-app-interface.png",
    category: "Marketing Automation",
    tags: ["Non-Profit", "Donor Journeys", "Email Automation", "Analytics"],
    gallery: ["/mobile-app-interface.png"],
    website_url: "https://example.com",
    featured: true,
    created_at: "2024-01-20T00:00:00.000Z",
    updated_at: "2024-01-20T00:00:00.000Z",
  },
  {
    id: 34,
    title: "Grupo MP",
    client: "Grupo MP",
    impact: "E-commerce & Distribution Platform",
    description:
      "B2B and B2C omnichannel distribution hub with automated order routing, inventory tracking, and wholesale reorder workflows.",
    image_url: "/modern-ecommerce-platform.jpg",
    category: "Full-Funnel Strategy",
    tags: ["E-commerce", "B2B Logistics", "Automation", "Payment Gateways"],
    gallery: ["/modern-ecommerce-platform.jpg"],
    website_url: "https://example.com",
    featured: false,
    created_at: "2024-01-18T00:00:00.000Z",
    updated_at: "2024-01-18T00:00:00.000Z",
  },
  {
    id: 36,
    title: "Clínica ActiveCare",
    client: "Clínica ActiveCare",
    impact: "Medical Facility Digital Presence",
    description:
      "Patient onboarding workflows, automated appointment reminder integrations, and HIPAA-compliant patient communication channels.",
    image_url: "/marketing-automation-dashboard.png",
    category: "Marketing Automation",
    tags: ["Healthcare", "Patient Portals", "WhatsApp Automation", "HubSpot"],
    gallery: ["/marketing-automation-dashboard.png"],
    website_url: "https://example.com",
    featured: false,
    created_at: "2024-01-15T00:00:00.000Z",
    updated_at: "2024-01-15T00:00:00.000Z",
  },
  {
    id: 30,
    title: "Zen Bonsai",
    client: "Zen Bonsai",
    impact: "E-commerce & Educational Platform",
    description:
      "D2C botanical specialty store featuring video-based care courses, recurring subscription boxes, and dynamic email nurturing.",
    image_url: "/modern-ecommerce-platform.jpg",
    category: "Full-Funnel Strategy",
    tags: ["D2C", "Course Delivery", "Klaviyo", "Shopify"],
    gallery: ["/modern-ecommerce-platform.jpg"],
    website_url: "https://example.com",
    featured: false,
    created_at: "2024-01-12T00:00:00.000Z",
    updated_at: "2024-01-12T00:00:00.000Z",
  },
  {
    id: 31,
    title: "Triada Academy",
    client: "Triada Academy",
    impact: "Educational Platform Development",
    description:
      "Student learning management ecosystem with automated grading, certification issuance, and engagement tracking.",
    image_url: "/mobile-app-interface.png",
    category: "Innovation",
    tags: ["EdTech", "LMS", "Automation", "Student Success"],
    gallery: ["/mobile-app-interface.png"],
    website_url: "https://example.com",
    featured: false,
    created_at: "2024-01-10T00:00:00.000Z",
    updated_at: "2024-01-10T00:00:00.000Z",
  },
  {
    id: 32,
    title: "Inmobiliaria Lleras",
    client: "Inmobiliaria Lleras",
    impact: "Real Estate Digital Transformation",
    description:
      "Automated property lead qualification funnel connecting Google Ads to localized WhatsApp agents in Medellín.",
    image_url: "/marketing-automation-dashboard.png",
    category: "Marketing Automation",
    tags: ["Real Estate", "Lead Scoring", "Meta Ads", "CRM"],
    gallery: ["/marketing-automation-dashboard.png"],
    website_url: "https://example.com",
    featured: false,
    created_at: "2024-01-08T00:00:00.000Z",
    updated_at: "2024-01-08T00:00:00.000Z",
  },
  {
    id: 26,
    title: "LOC Platform",
    client: "LOC",
    impact: "Digital Platform Solution",
    description:
      "Scalable web application for real-time asset tracking, resource allocation, and team collaboration.",
    image_url: "/mobile-app-interface.png",
    category: "Innovation",
    tags: ["SaaS", "Product Architecture", "Next.js", "APIs"],
    gallery: ["/mobile-app-interface.png"],
    website_url: "https://example.com",
    featured: false,
    created_at: "2024-01-05T00:00:00.000Z",
    updated_at: "2024-01-05T00:00:00.000Z",
  },
  {
    id: 28,
    title: "Savant International BPO",
    client: "Savant International",
    impact: "Business Process Outsourcing Platform",
    description:
      "Enterprise lead generation pipeline and client acquisition engine for nearshore outsourcing services.",
    image_url: "/marketing-automation-dashboard.png",
    category: "Analytics & Data",
    tags: ["BPO", "Outbound Automation", "Salesforce", "LinkedIn Ads"],
    gallery: ["/marketing-automation-dashboard.png"],
    website_url: "https://example.com",
    featured: false,
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
  return (featured.length > 0 ? featured : DEFAULT_PROJECTS.slice(0, 2)).map(normalizeProject)
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
