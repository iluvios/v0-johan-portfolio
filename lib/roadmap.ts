export type RoadmapItemType = "study" | "project" | "certification" | "portfolio"
export type RoadmapStatus = "todo" | "in_progress" | "done"

export interface RoadmapItem {
  id: string
  type: RoadmapItemType
  title: string
  detail?: string
  url?: string
  status: RoadmapStatus
  due?: string
  // Link to the finished proof (repo, case study, certificate) once it's done.
  proofUrl?: string
}

export interface RoadmapTrack {
  id: string
  skill: string
  why: string
  priority: 1 | 2 | 3
  level: number
  target: number
  items: RoadmapItem[]
}

export interface Roadmap {
  goal: string
  targetDate?: string
  tracks: RoadmapTrack[]
  updatedAt?: string
}

export const ROADMAP_TYPES: { value: RoadmapItemType; label: string }[] = [
  { value: "study", label: "Study" },
  { value: "project", label: "Project" },
  { value: "certification", label: "Certification" },
  { value: "portfolio", label: "Portfolio" },
]

export const ROADMAP_STATUSES: { value: RoadmapStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
]

// Seeded from the Sept 2026 gap analysis against live GTM Engineer postings
// (ClickHouse, Oscilar, Level AI, Assembly). Edit freely in /admin.
export const DEFAULT_ROADMAP: Roadmap = {
  goal: "Land a remote GTM Engineer / Senior Martech role at $7K+ USD/month",
  targetDate: "2026-12-15",
  tracks: [
    {
      id: "portfolio-proof",
      skill: "Portfolio proof (case studies)",
      why: "The experience is already there; recruiters need to see it. Every target posting asks for systems shipped and run in production — case studies with real numbers are that proof.",
      priority: 1,
      level: 2,
      target: 4,
      items: [
        {
          id: "refio-case-study",
          type: "portfolio",
          title: "Refio.so case study: built end-to-end with AI, idea to active users in under 2 months",
          detail: "Problem, stack (Next.js, Supabase, Twilio), how Claude Code / Codex were used, timeline, users. Screenshots + a 2-minute Loom.",
          status: "todo",
          due: "2026-09-30",
        },
        {
          id: "building-intelligence-case-study",
          type: "portfolio",
          title: "Building Intelligence outbound case study (Clay + Apollo + Salesforce)",
          detail: "Needs numbers: accounts/contacts enriched, reply rate, meetings booked, hours saved. Include a diagram of the enrichment waterfall.",
          status: "todo",
          due: "2026-10-07",
        },
        {
          id: "salesforce-case-study",
          type: "portfolio",
          title: "Salesforce implementation case study (one of the 4 orgs set up from scratch)",
          detail: "Object model diagram, key Flows, the custom Apex, and what it integrated with. Anonymize the client if needed.",
          status: "todo",
          due: "2026-10-14",
        },
        {
          id: "attribution-case-study",
          type: "portfolio",
          title: "Attribution case study: server-side GTM + Triple Whale / Wicked Reports",
          detail: "What data was lost to ad blockers, what server-side events recovered, and how it changed budget decisions on up to $70K/month in spend.",
          status: "todo",
          due: "2026-10-21",
        },
        {
          id: "content-pipeline-case-study",
          type: "portfolio",
          title: "n8n + Claude content pipeline case study",
          detail: "Workflow diagram, what it automated, volume produced, hours saved per week.",
          status: "todo",
          due: "2026-10-28",
        },
        {
          id: "github-profile",
          type: "project",
          title: "Public GitHub profile with pinned proof projects",
          detail: "Pin the repos from the tracks below. Clean READMEs with an architecture diagram and a short Loom each.",
          url: "https://github.com",
          status: "todo",
          due: "2026-10-15",
        },
      ],
    },
    {
      id: "sql-data",
      skill: "SQL & data modeling (warehouse, dbt, reverse ETL)",
      why: "Biggest gap vs. top-paying roles. ClickHouse asks for SQL, dbt and moving warehouse data into the GTM stack; Oscilar asks for data warehouses and ETL pipelines.",
      priority: 1,
      level: 2,
      target: 4,
      items: [
        {
          id: "sql-advanced",
          type: "study",
          title: "SQL: joins, CTEs, window functions, aggregations",
          detail: "Practice on real data in your Neon Postgres DB. Goal: write funnel and cohort queries without help.",
          status: "todo",
          due: "2026-10-05",
        },
        {
          id: "dbt-fundamentals",
          type: "study",
          title: "dbt Fundamentals (free course by dbt Labs)",
          url: "https://www.getdbt.com",
          status: "todo",
          due: "2026-10-19",
        },
        {
          id: "gtm-warehouse-project",
          type: "project",
          title: "GTM data warehouse project",
          detail: "Load CRM + ad-spend data into Postgres or BigQuery → dbt models for funnel, CAC and pipeline → sync scored accounts back to the CRM (reverse ETL). Public repo + case study.",
          status: "todo",
          due: "2026-11-09",
        },
        {
          id: "dbt-certification",
          type: "certification",
          title: "dbt Analytics Engineering certification (optional, paid)",
          detail: "Only after the project — the project carries more weight than the badge.",
          status: "todo",
        },
      ],
    },
    {
      id: "ai-agents",
      skill: "AI agents & evals for GTM",
      why: "ClickHouse wants agents in production with evals and observability (e.g. Langfuse); Level AI wants GTM agents 'productionized, not prototyped'. You already build with Claude — the gap is evals, monitoring and guardrails.",
      priority: 1,
      level: 2,
      target: 4,
      items: [
        {
          id: "claude-api",
          type: "study",
          title: "Claude API: tool use, structured outputs, prompt caching",
          url: "https://docs.anthropic.com",
          status: "todo",
          due: "2026-10-12",
        },
        {
          id: "langfuse-evals",
          type: "study",
          title: "LLM evals & tracing with Langfuse",
          url: "https://langfuse.com/docs",
          status: "todo",
          due: "2026-10-26",
        },
        {
          id: "lead-agent-project",
          type: "project",
          title: "Lead research & qualification agent",
          detail: "Domain in → agent researches the account, scores ICP fit with a structured output, drafts a first line, writes to the CRM. Add a labeled eval set (50+ accounts), Langfuse tracing, and a human-review queue for low-confidence results.",
          status: "todo",
          due: "2026-11-16",
        },
        {
          id: "lead-agent-case-study",
          type: "portfolio",
          title: "Agent case study with eval results",
          detail: "Accuracy vs. the labeled set, cost per lead, and the failure modes you fixed.",
          status: "todo",
          due: "2026-11-23",
        },
      ],
    },
    {
      id: "salesforce",
      skill: "Salesforce depth",
      why: "Salesforce is the system of record in every top GTM posting checked. You've set up 4 orgs from scratch and written custom Apex — a certification makes that visible and closes the gaps you still feel.",
      priority: 2,
      level: 3,
      target: 4,
      items: [
        {
          id: "trailhead-admin",
          type: "study",
          title: "Trailhead admin trails: security, data model, Flow, reports",
          url: "https://trailhead.salesforce.com",
          status: "todo",
          due: "2026-10-31",
        },
        {
          id: "apex-testing",
          type: "study",
          title: "Apex: triggers, test classes, callouts to external APIs",
          detail: "Formalize what you've already built. Production deploys need at least 75% test coverage — practice writing those tests.",
          status: "todo",
          due: "2026-11-15",
        },
        {
          id: "sf-admin-cert",
          type: "certification",
          title: "Salesforce Certified Administrator",
          detail: "Book the exam date first — it locks in the timeline.",
          url: "https://trailhead.salesforce.com",
          status: "todo",
          due: "2026-11-30",
        },
        {
          id: "sf-app-builder",
          type: "certification",
          title: "Salesforce Platform App Builder (later, optional)",
          status: "todo",
        },
      ],
    },
    {
      id: "python",
      skill: "Python for automation & data",
      why: "ClickHouse and Oscilar list hands-on Python. You can already build with AI assistance; the goal is to read, debug and own the code with confidence in an interview.",
      priority: 2,
      level: 2,
      target: 3,
      items: [
        {
          id: "python-apis-data",
          type: "study",
          title: "Python for APIs & data: httpx, pandas, error handling, retries",
          status: "todo",
          due: "2026-10-20",
        },
        {
          id: "n8n-to-python",
          type: "project",
          title: "Rebuild one n8n workflow as a Python service",
          detail: "e.g. an enrichment waterfall with retries, rate limiting and logging, running on a schedule. Compare reliability and cost vs. n8n in the README.",
          status: "todo",
          due: "2026-11-02",
        },
      ],
    },
    {
      id: "clay-outbound",
      skill: "Clay & outbound engineering",
      why: "Clay, enrichment and outbound automation appear in 3 of the 4 postings checked. You have real client work here — go deeper on waterfalls and signals, and make it visible.",
      priority: 2,
      level: 3,
      target: 4,
      items: [
        {
          id: "clay-university",
          type: "study",
          title: "Clay University: advanced waterfalls, HTTP API columns, signals",
          url: "https://www.clay.com/university",
          status: "todo",
          due: "2026-10-12",
        },
        {
          id: "clay-certification",
          type: "certification",
          title: "Clay certification (check current programs)",
          url: "https://www.clay.com/university",
          status: "todo",
        },
        {
          id: "signal-outbound-project",
          type: "project",
          title: "Signal-based outbound playbook",
          detail: "Hiring or job-change signals → Clay enrichment → scored list → sequencing tool, documented end to end.",
          status: "todo",
          due: "2026-11-30",
        },
      ],
    },
    {
      id: "martech-certs",
      skill: "Martech certifications (quick wins)",
      why: "Free, fast credentials that recruiters and ATS filters recognize for marketing-ops roles.",
      priority: 3,
      level: 3,
      target: 4,
      items: [
        {
          id: "hubspot-cert",
          type: "certification",
          title: "HubSpot Academy: Marketing Hub Software certification (free)",
          url: "https://academy.hubspot.com",
          status: "todo",
          due: "2026-10-10",
        },
        {
          id: "ga4-cert",
          type: "certification",
          title: "Google Analytics certification (free, Skillshop)",
          url: "https://skillshop.withgoogle.com",
          status: "todo",
          due: "2026-10-17",
        },
      ],
    },
  ],
}

export async function getRoadmap(): Promise<Roadmap> {
  const res = await fetch("/api/roadmap", { cache: "no-store" })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to load roadmap")
  }
  return res.json()
}

export async function saveRoadmap(roadmap: Roadmap): Promise<Roadmap> {
  const res = await fetch("/api/roadmap", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roadmap),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to save roadmap")
  }
  return res.json()
}
