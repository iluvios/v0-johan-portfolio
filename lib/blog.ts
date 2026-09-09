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

export const DEFAULT_ARTICLES: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Marketing Automation: AI-Driven Personalization",
    excerpt:
      "Exploring how artificial intelligence is revolutionizing customer journey mapping and personalized marketing experiences at scale. From predictive analytics to dynamic content optimization.",
    content: `# The Future of Marketing Automation: AI-Driven Personalization

The landscape of marketing automation is undergoing a fundamental transformation. As we move deeper into the digital age, artificial intelligence is not just enhancing our existing tools—it's completely redefining what's possible in customer engagement and personalization.

## The Current State of Marketing Automation

Traditional marketing automation has served us well, but it's largely been rule-based and reactive. We set up workflows, define triggers, and hope our assumptions about customer behavior hold true. While effective, this approach has limitations in our increasingly dynamic marketplace.

## Enter AI-Driven Personalization

Artificial intelligence changes the game entirely. Instead of static rules, we now have systems that learn, adapt, and predict. Here's what this means for marketing automation:

### 1. Predictive Customer Journey Mapping
AI can analyze vast amounts of customer data to predict the most likely path a customer will take. This allows us to proactively position the right content, offers, and touchpoints before the customer even realizes they need them.

### 2. Dynamic Content Optimization
Rather than A/B testing static variations, AI can generate and test thousands of content combinations in real-time, optimizing for each individual user's preferences and behavior patterns.

### 3. Behavioral Pattern Recognition
Machine learning algorithms can identify subtle patterns in customer behavior that humans might miss, enabling more nuanced segmentation and targeting strategies.

## Implementation Strategies

The key to successful AI-driven marketing automation lies in:

- **Data Quality**: Ensuring clean, comprehensive data feeds
- **Integration**: Connecting all customer touchpoints for a unified view
- **Testing**: Continuous experimentation and optimization
- **Human Oversight**: Maintaining strategic control while letting AI handle tactical execution

## The Road Ahead

As AI technology continues to evolve, we can expect even more sophisticated capabilities: real-time sentiment analysis, predictive lifetime value modeling, and autonomous campaign optimization.

The future belongs to marketers who can effectively blend human creativity and strategic thinking with AI's analytical power and scale.`,
    category: "Innovation",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "/marketing-automation-dashboard.png",
    tags: ["AI", "Marketing Automation", "Personalization", "Machine Learning"],
    published: true,
  },
  {
    id: "2",
    title: "Data-Driven Decision Making in Modern Marketing",
    excerpt:
      "A deep dive into leveraging analytics and data science to inform strategic marketing decisions and optimize campaign performance across all channels.",
    content: `# Data-Driven Decision Making in Modern Marketing

In today's competitive landscape, intuition alone isn't enough. The most successful marketing strategies are built on a foundation of solid data analysis and evidence-based decision making.

## The Data Revolution

The amount of data available to marketers today is unprecedented. Every click, view, purchase, and interaction generates valuable insights. The challenge isn't collecting data—it's knowing how to interpret and act on it effectively.

## Key Metrics That Matter

### Customer Acquisition Cost (CAC)
Understanding the true cost of acquiring customers across different channels helps optimize budget allocation and identify the most efficient growth strategies.

### Lifetime Value (LTV)
Looking beyond initial purchases to understand the long-term value of customer relationships enables more strategic investment in retention and upselling.

### Attribution Modeling
Moving beyond last-click attribution to understand the full customer journey and the role each touchpoint plays in conversion.

## Building a Data-Driven Culture

### 1. Establish Clear KPIs
Define what success looks like for each campaign, channel, and initiative. Ensure these metrics align with broader business objectives.

### 2. Invest in the Right Tools
From Google Analytics to advanced attribution platforms, having the right technology stack is crucial for accurate measurement and analysis.

### 3. Develop Analytical Skills
Train your team to think critically about data, question assumptions, and look for actionable insights rather than just reporting numbers.

## Advanced Analytics Techniques

### Cohort Analysis
Track how different groups of customers behave over time to identify trends and optimize retention strategies.

### Predictive Modeling
Use historical data to forecast future performance and identify opportunities for growth.

### Statistical Significance Testing
Ensure your test results are statistically valid before making strategic decisions based on them.

## Common Pitfalls to Avoid

- **Correlation vs. Causation**: Just because two metrics move together doesn't mean one causes the other
- **Sample Size Issues**: Ensure your data sets are large enough to draw meaningful conclusions
- **Survivorship Bias**: Don't only analyze successful campaigns—failed experiments often provide the most valuable insights

## The Future of Marketing Analytics

As privacy regulations evolve and third-party cookies disappear, marketers must adapt their measurement strategies. First-party data collection, server-side tracking, and privacy-compliant analytics will become increasingly important.

The organizations that thrive will be those that can effectively balance data-driven insights with creative innovation and customer-centric thinking.`,
    category: "Marketing",
    date: "2024-01-08",
    readTime: "6 min read",
    image: "/modern-ecommerce-platform.jpg",
    tags: ["Data Analytics", "KPIs", "Attribution", "Performance Marketing"],
    published: true,
  },
]

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    if (typeof window === "undefined") {
      return DEFAULT_ARTICLES.filter((post) => post.published)
    }

    // Seed test articles if none exist
    await seedTestArticles()

    const stored = localStorage.getItem("blog-posts")
    if (stored) {
      const metadata: BlogMetadata = JSON.parse(stored)
      return metadata.posts.filter((post) => post.published)
    }
    return DEFAULT_ARTICLES.filter((post) => post.published)
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return DEFAULT_ARTICLES.filter((post) => post.published)
  }
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

export async function deleteBlogImage(url: string): Promise<void> {
  // Client safe no-op or server notification
  console.log("Delete image requested for:", url)
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

export async function seedTestArticles(): Promise<void> {
  if (typeof window === "undefined") return

  const existingPosts = await getAllBlogPosts()
  if (existingPosts.length === 0) {
    const metadata: BlogMetadata = {
      posts: DEFAULT_ARTICLES,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem("blog-posts", JSON.stringify(metadata))
  }
}
