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

export async function getProjects(category?: string): Promise<Project[]> {
  try {
    const params = new URLSearchParams()
    if (category) {
      params.append("category", category)
    }

    const response = await fetch(`/api/projects?${params.toString()}`)
    if (!response.ok) {
      throw new Error("Failed to fetch projects")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

// Alias for getProjects to match expected export name
export async function getAllProjects(category?: string): Promise<Project[]> {
  return getProjects(category)
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const response = await fetch("/api/projects?featured=true")
    if (!response.ok) {
      throw new Error("Failed to fetch featured projects")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching featured projects:", error)
    return []
  }
}

export async function getProject(id: number): Promise<Project | null> {
  try {
    const response = await fetch(`/api/projects/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch project")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
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
      throw new Error("Failed to create project")
    }

    return await response.json()
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
      throw new Error("Failed to update project")
    }

    return await response.json()
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
      throw new Error("Failed to delete project")
    }
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}
