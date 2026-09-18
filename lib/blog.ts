export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime: string
  image?: string
  tags: string[]
  published: boolean
}

export interface BlogMetadata {
  posts: BlogPost[]
  lastUpdated: string
}

// Articles published to every visitor. The admin editor below still saves drafts to the
// admin's own browser (localStorage), so those drafts are intentionally NOT read here —
// otherwise each visitor would see whatever happens to be in their own storage.
export const DEFAULT_ARTICLES: BlogPost[] = []

export async function getBlogPosts(): Promise<BlogPost[]> {
  return DEFAULT_ARTICLES.filter((post) => post.published)
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts()
  return posts.find((post) => post.id === id) || null
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  try {
    const posts = await getAllBlogPosts()
    const existingIndex = posts.findIndex((p) => p.id === post.id)

    if (existingIndex >= 0) {
      posts[existingIndex] = post
    } else {
      posts.push(post)
    }

    const metadata: BlogMetadata = {
      posts,
      lastUpdated: new Date().toISOString(),
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("blog-posts", JSON.stringify(metadata))
    }
  } catch (error) {
    console.error("Error saving blog post:", error)
    throw error
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    if (typeof window === "undefined") {
      return DEFAULT_ARTICLES
    }

    const stored = localStorage.getItem("blog-posts")
    if (stored) {
      const metadata: BlogMetadata = JSON.parse(stored)
      return metadata.posts
    }
    return DEFAULT_ARTICLES
  } catch (error) {
    console.error("Error fetching all blog posts:", error)
    return DEFAULT_ARTICLES
  }
}

// Alias for getAllBlogPosts to match expected export name
export async function getAllArticles(): Promise<BlogPost[]> {
  return getAllBlogPosts()
}

export async function uploadBlogImage(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/blog/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to upload image")
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  try {
    const posts = await getAllBlogPosts()
    const filtered = posts.filter((p) => p.id !== id)
    const metadata: BlogMetadata = {
      posts: filtered,
      lastUpdated: new Date().toISOString(),
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("blog-posts", JSON.stringify(metadata))
    }
  } catch (error) {
    console.error("Error deleting blog post:", error)
    throw error
  }
}
