export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "backlog"
export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none"
export type ProjectStatus = "active" | "starting" | "on_hold" | "idea" | "completed" | "archived"
export type WorkspaceBucketId =
  | "job-hunt"
  | "freelance-active"
  | "freelance-new"
  | "ideas"
  | "vr-journey"
  | string

export interface WorkspaceBucket {
  id: WorkspaceBucketId
  name: string
  description: string
  color: string // e.g., "blue" | "emerald" | "amber" | "violet" | "cyan" | "rose"
  order: number
}

export interface WorkspaceAttachment {
  id: string
  name: string
  url: string
  size?: number
  mimeType?: string
  kind: "file" | "image" | "link" | "repo"
  createdAt: string
}

/**
 * Recursive Task / Objective node.
 * A task can contain unlimited nested `children` (sub-objectives),
 * its own rich HTML `description` (WYSIWYG), flexible `status` & `priority`,
 * and `attachments` (files, images, links).
 * Nothing blocks nothing: parents and children can be toggled independently.
 */
export interface WorkspaceTask {
  id: string
  title: string
  description: string // Rich HTML content from WYSIWYG editor
  status: TaskStatus
  priority: TaskPriority
  completed: boolean
  dueDate?: string
  tags: string[]
  attachments: WorkspaceAttachment[]
  children: WorkspaceTask[] // Nested objectives inside this task
  expanded?: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkspaceProject {
  id: string
  name: string
  bucketId: WorkspaceBucketId
  status: ProjectStatus
  priority: TaskPriority
  summary: string
  description: string // Rich HTML project overview / notes (Notion-like page body)
  repoPath?: string
  liveUrl?: string
  dueDate?: string
  tags: string[]
  attachments: WorkspaceAttachment[]
  tasks: WorkspaceTask[]
  order: number
  updatedAt: string
}

export interface WorkspaceData {
  buckets: WorkspaceBucket[]
  projects: WorkspaceProject[]
  updatedAt: string
}

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "todo", label: "To Do", color: "border-slate-600 bg-slate-800/80 text-slate-300" },
  { value: "in_progress", label: "In Progress", color: "border-blue-500/40 bg-blue-500/15 text-blue-300" },
  { value: "review", label: "Review / Waiting", color: "border-amber-500/40 bg-amber-500/15 text-amber-300" },
  { value: "backlog", label: "Backlog", color: "border-purple-500/40 bg-purple-500/15 text-purple-300" },
  { value: "done", label: "Done", color: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" },
]

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; badgeClass: string; dotClass: string }[] = [
  {
    value: "urgent",
    label: "Urgent (P0)",
    badgeClass: "border-rose-500/50 bg-rose-500/15 text-rose-300",
    dotClass: "bg-rose-500",
  },
  {
    value: "high",
    label: "High (P1)",
    badgeClass: "border-amber-500/50 bg-amber-500/15 text-amber-300",
    dotClass: "bg-amber-400",
  },
  {
    value: "medium",
    label: "Medium (P2)",
    badgeClass: "border-sky-500/50 bg-sky-500/15 text-sky-300",
    dotClass: "bg-sky-400",
  },
  {
    value: "low",
    label: "Low (P3)",
    badgeClass: "border-slate-600 bg-slate-800/80 text-slate-400",
    dotClass: "bg-slate-400",
  },
  {
    value: "none",
    label: "No Priority",
    badgeClass: "border-slate-700/60 bg-slate-900/40 text-slate-500",
    dotClass: "bg-slate-600",
  },
]

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string; badgeClass: string }[] = [
  { value: "active", label: "Active", badgeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300" },
  { value: "starting", label: "Starting / Setup", badgeClass: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300" },
  { value: "on_hold", label: "On Hold", badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-300" },
  { value: "idea", label: "Idea / Sandbox", badgeClass: "border-violet-500/40 bg-violet-500/15 text-violet-300" },
  { value: "completed", label: "Completed", badgeClass: "border-blue-500/40 bg-blue-500/15 text-blue-300" },
  { value: "archived", label: "Archived", badgeClass: "border-slate-700 bg-slate-800/70 text-slate-400" },
]

export function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const nowIso = () => new Date().toISOString()

function makeTask(
  title: string,
  opts?: Partial<Omit<WorkspaceTask, "id" | "title" | "createdAt" | "updatedAt">>
): WorkspaceTask {
  const status = opts?.status ?? (opts?.completed ? "done" : "todo")
  const completed = opts?.completed ?? status === "done"
  return {
    id: createId(),
    title,
    description: opts?.description ?? "",
    status,
    priority: opts?.priority ?? "medium",
    completed,
    dueDate: opts?.dueDate,
    tags: opts?.tags ?? [],
    attachments: opts?.attachments ?? [],
    children: opts?.children ?? [],
    expanded: opts?.expanded ?? true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

export const DEFAULT_BUCKETS: WorkspaceBucket[] = [
  {
    id: "freelance-active",
    name: "2. Finish Freelancing Projects",
    description: "Active client commitments to wrap up, ship, and collect payment.",
    color: "emerald",
    order: 1,
  },
  {
    id: "freelance-new",
    name: "3. New Freelancing (Start Right)",
    description: "New client projects starting up — clear scope, onboarding, and clean structure.",
    color: "cyan",
    order: 2,
  },
  {
    id: "job-hunt",
    name: "1. Get a Job (Career & Portfolio)",
    description: "Full-time remote GTM Engineer / Senior Martech & Full-Stack role hunt, CV, and case studies.",
    color: "blue",
    order: 3,
  },
  {
    id: "ideas",
    name: "4. Long-Standing Ideas & Own Products",
    description: "Personal product ideas, civic platforms, and SaaS concepts to bring to life.",
    color: "violet",
    order: 4,
  },
  {
    id: "vr-journey",
    name: "5. VR Journey",
    description: "VR hardware, Unreal/OpenXR experiments, and immersive project exploration.",
    color: "amber",
    order: 5,
  },
]

export const DEFAULT_WORKSPACE: WorkspaceData = {
  buckets: DEFAULT_BUCKETS,
  updatedAt: nowIso(),
  projects: [
    // =========================================================================
    // BUCKET 2: FINISH FREELANCING PROJECTS
    // =========================================================================
    {
      id: "proj-biotrails",
      name: "Biotrails.co",
      bucketId: "freelance-active",
      status: "active",
      priority: "urgent",
      summary: "Next.js app, 6 Natural Regions brand book (81 PNGs), and curated Drive catalog.",
      description:
        "<h3>Project Overview</h3><p>BIOTRAILS.CO Next.js platform featuring Colombia's 6 Natural Regions brand book, competitor & codebase audits, and curated travel catalog.</p><p><strong>Git status:</strong> 33 uncommitted files in local repository (<code>audit_report.md</code>, <code>BRIEFING.md</code>, <code>DISPATCH.md</code>, <code>handoff.md</code>, <code>progress.md</code>).</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Biotrails.co",
      tags: ["Next.js", "Client", "Brand Book"],
      attachments: [],
      order: 1,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Review and commit 33 uncommitted workspace changes", {
          priority: "urgent",
          status: "in_progress",
          description: "<p>Check <code>handoff.md</code>, <code>progress.md</code>, and <code>audit_report.md</code> and commit clean state to Git.</p>",
          children: [
            makeTask("Verify 6 Natural Regions brand book assets & routes", { priority: "high" }),
            makeTask("Review audit_report.md findings and close remaining UI fixes", { priority: "medium" }),
          ],
        }),
        makeTask("Client review & final delivery handoff", {
          priority: "high",
          status: "todo",
        }),
      ],
    },
    {
      id: "proj-rfus",
      name: "RFUS (Rainforest Foundation US)",
      bucketId: "freelance-active",
      status: "active",
      priority: "high",
      summary: "Rainforest Foundation US Next.js site, speed optimization, and translation workflows.",
      description:
        "<h3>Project Overview</h3><p>Includes <code>RFUS</code> (Next.js app with recent <em>Final speed update</em> commit), <code>Rainforestfoundation.org</code>, and <code>Rfus_translation</code>.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\RFUS",
      tags: ["Next.js", "Performance", "Translations"],
      attachments: [],
      order: 2,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Verify final speed update in production", {
          priority: "high",
          status: "in_progress",
          children: [
            makeTask("Check page outlines (Brazil Amazon Fires, News, Peru, Indigenous Firefighting)", {
              priority: "medium",
            }),
            makeTask("Confirm Rfus_translation deliverables status", { priority: "medium" }),
          ],
        }),
      ],
    },
    {
      id: "proj-lenestudio",
      name: "Lene Studio (lenestudio)",
      bucketId: "freelance-active",
      status: "active",
      priority: "high",
      summary: "Switched production DB to Neon Postgres; 2 uncommitted files locally.",
      description: "<p>Recent commit switched production DB to Neon Postgres and untracked seed media.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\lenestudio",
      tags: ["Neon DB", "Next.js", "Client"],
      attachments: [],
      order: 3,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Inspect & commit the 2 pending local files", { priority: "medium", status: "todo" }),
        makeTask("Confirm final client sign-off and production stability", { priority: "high", status: "todo" }),
      ],
    },
    {
      id: "proj-maria-maria",
      name: "Maria & Maria",
      bucketId: "freelance-active",
      status: "active",
      priority: "medium",
      summary: "CMS update and listing/PDP/proyectos page trees.",
      description: "<p>Last commit: <code>Update CMS</code>. Includes home, listing, PDP, and proyectos page structures.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Maria&Maria",
      tags: ["CMS", "E-commerce"],
      attachments: [],
      order: 4,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Verify CMS update with client and list remaining revisions", { priority: "medium" }),
      ],
    },
    {
      id: "proj-motoride",
      name: "Motoride Medellin",
      bucketId: "freelance-active",
      status: "active",
      priority: "medium",
      summary: "Motoride Medellin web app (23 uncommitted files in repo).",
      description: "<p>Has 23 uncommitted files in <code>C:\\Users\\JohanDanielA\\Documents\\GitHub\\Motoride</code>.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Motoride",
      tags: ["Medellin", "Next.js"],
      attachments: [],
      order: 5,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Commit or stash 23 uncommitted changes in Motoride repo", { priority: "medium" }),
        makeTask("Define remaining milestones to finish project", { priority: "medium" }),
      ],
    },
    {
      id: "proj-qrvas",
      name: "Qrvas Website",
      bucketId: "freelance-active",
      status: "active",
      priority: "medium",
      summary: "All pages committed + 8 uncommitted changes locally.",
      description: "<p>Repository at <code>C:\\Users\\JohanDanielA\\Documents\\GitHub\\Qrvas</code>.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Qrvas",
      tags: ["Website", "Next.js"],
      attachments: [],
      order: 6,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Review 8 uncommitted files and finalize Qrvas pages", { priority: "medium" }),
      ],
    },
    {
      id: "proj-qcoffe",
      name: "Qcoffe",
      bucketId: "freelance-active",
      status: "active",
      priority: "medium",
      summary: "Qcoffe v1 shipped in repo; check if final adjustments are needed.",
      description: "<p>Clean git working tree at <code>Qcoffe v1</code>.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Qcoffe",
      tags: ["Client", "Next.js"],
      attachments: [],
      order: 7,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Confirm if Qcoffe v1 is fully delivered or needs follow-up", { priority: "low" }),
      ],
    },
    {
      id: "proj-olsolutions",
      name: "OlSolutions & WhatsApp Bot",
      bucketId: "freelance-active",
      status: "on_hold",
      priority: "low",
      summary: "OlSolutions web project + WhatsApp-Bot-OlSolutions.",
      description: "<p>Includes both <code>OlSolutions</code> and <code>Whatsapp-Bot-OlSolutions-</code> folders.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\OlSolutions",
      tags: ["WhatsApp Bot", "Automation"],
      attachments: [],
      order: 8,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Decide status: active delivery, maintenance, or completed", { priority: "low" }),
      ],
    },

    // =========================================================================
    // BUCKET 3: NEW FREELANCING (START WITH THE RIGHT FOOT)
    // =========================================================================
    {
      id: "proj-ecoastilleros",
      name: "Ecoastilleros",
      bucketId: "freelance-new",
      status: "starting",
      priority: "high",
      summary: "New Next.js web project (Initial commit Oct 12).",
      description:
        "<h3>Starting on the Right Foot</h3><p>Define clear scope, deliverables, timeline, and client assets before deep build.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Ecoastilleros",
      tags: ["New Client", "Next.js"],
      attachments: [],
      order: 1,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Client Onboarding & Scope Alignment", {
          priority: "high",
          status: "in_progress",
          children: [
            makeTask("Lock in sitemap, deliverables list, and revision boundaries", { priority: "high" }),
            makeTask("Collect all brand assets, copy, and credentials upfront", { priority: "high" }),
            makeTask("Set milestone dates & payment schedule", { priority: "medium" }),
          ],
        }),
      ],
    },
    {
      id: "proj-psicosanar",
      name: "Psicosanar",
      bucketId: "freelance-new",
      status: "starting",
      priority: "high",
      summary: "New Next.js project with 18 uncommitted files in progress.",
      description: "<p>Initial commit Oct 7; 18 uncommitted files currently in working tree.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Psicosanar",
      tags: ["New Client", "Next.js"],
      attachments: [],
      order: 2,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Commit initial work (18 uncommitted files) and document scope", {
          priority: "high",
          children: [
            makeTask("Define exact pages & features for v1 launch", { priority: "high" }),
            makeTask("Set client check-in date", { priority: "medium" }),
          ],
        }),
      ],
    },
    {
      id: "proj-uribelending",
      name: "Uribelending",
      bucketId: "freelance-new",
      status: "starting",
      priority: "high",
      summary: "New Next.js lending platform (17 uncommitted files locally).",
      description: "<p>Initial commit Oct 7; 17 uncommitted files in local working directory.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Uribelending",
      tags: ["Fintech", "Next.js"],
      attachments: [],
      order: 3,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Commit 17 local files & structure v1 milestones", {
          priority: "high",
          children: [
            makeTask("Clarify lending calculator / lead capture flow requirements", { priority: "high" }),
          ],
        }),
      ],
    },
    {
      id: "proj-inmobiliaria-lleras",
      name: "Inmobiliaria Lleras",
      bucketId: "freelance-new",
      status: "starting",
      priority: "medium",
      summary: "Real estate project (currently not initialized with Git).",
      description: "<p>Located at <code>C:\\Users\\JohanDanielA\\Documents\\GitHub\\Inmobiliaria Llleras</code>.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Inmobiliaria Llleras",
      tags: ["Real Estate", "Next.js"],
      attachments: [],
      order: 4,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Initialize Git repository & push initial commit", { priority: "medium" }),
        makeTask("Define property listing requirements & client expectations", { priority: "medium" }),
      ],
    },

    // =========================================================================
    // BUCKET 1: GET A JOB (CAREER, PORTFOLIO & INTERVIEWS)
    // =========================================================================
    {
      id: "proj-job-hunt-engine",
      name: "GTM Engineer / Senior Martech Job Hunt",
      bucketId: "job-hunt",
      status: "active",
      priority: "urgent",
      summary: "Target: Remote GTM Engineer / Marketing Ops / AI Automation role ($7k+/mo).",
      description:
        "<h3>Job Search Assets</h3><p>Local folder <code>C:\\Users\\JohanDanielA\\Documents\\GitHub\\Job search</code> already includes:</p><ul><li><code>Johan_Alvarez_GTM_Engineer_Resume.md</code></li><li><code>active_postings_deep_dive.md</code></li><li><code>cold_outreach_playbook.md</code></li><li><code>founder_outreach_templates.md</code></li><li><code>high_value_offer_blueprint.md</code></li></ul>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Job search",
      tags: ["GTM Engineer", "Outreach", "Resume"],
      attachments: [],
      order: 1,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Daily / Weekly Application & Outreach Rhythm", {
          priority: "urgent",
          status: "in_progress",
          children: [
            makeTask("Send 5 tailored applications + founder/hiring-manager outreach messages per week", {
              priority: "urgent",
            }),
            makeTask("Log all active applications in /admin Pipeline CRM", { priority: "high" }),
          ],
        }),
        makeTask("Ship Top Portfolio Case Studies on v0-johan-portfolio", {
          priority: "high",
          status: "in_progress",
          children: [
            makeTask("Refio.so end-to-end AI case study + 2-min Loom", { priority: "high" }),
            makeTask("Building Intelligence outbound waterfall case study (Clay + Apollo + Salesforce)", {
              priority: "high",
            }),
            makeTask("Salesforce org implementation & attribution case studies", { priority: "medium" }),
          ],
        }),
        makeTask("Fxreplay Technical Assessment (acme-backtest-growth-engine)", {
          priority: "high",
          status: "review",
          description: "<p>Repo: <code>C:\\Users\\JohanDanielA\\Documents\\GitHub\\Fxreplay-technical-assessment</code></p>",
        }),
      ],
    },

    // =========================================================================
    // BUCKET 4: LONG-STANDING IDEAS & OWN PRODUCTS
    // =========================================================================
    {
      id: "proj-ciudad-bosque",
      name: "Selva de Cemento / Ciudad Bosque Sabaneta",
      bucketId: "ideas",
      status: "active",
      priority: "high",
      summary: "3D Sabaneta urban forest transformation experience (Three.js scroll-first + Unreal Engine 5.8).",
      description:
        "<h3>Vision</h3><p>Interactive urban-ecological proposal for Sabaneta (Track A Car-Free Forest Plaza & Track B 10 km/h Plataforma Única), combining spatial queueing audits, solar shade studies, Three.js web experience, and UE 5.8 archvis renders.</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Selva de cemento",
      tags: ["Three.js", "Unreal 5.8", "Civic Tech", "Sabaneta"],
      attachments: [],
      order: 1,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Commit 17 local changes in Selva de cemento repo", {
          priority: "medium",
          status: "todo",
        }),
        makeTask("Three.js Scroll-First Experience & UE 5.8 Renders", {
          priority: "medium",
          children: [
            makeTask("Complete Three.js scroll-first corridor experience", { priority: "medium" }),
            makeTask("Export Before / Track A / Track B renders from Unreal Engine 5.8", { priority: "low" }),
          ],
        }),
      ],
    },
    {
      id: "proj-restaurante-os",
      name: "Restaurante OS / Chic Dish Hub (MenuDigital)",
      bucketId: "ideas",
      status: "idea",
      priority: "medium",
      summary: "Digital menu and restaurant operating system (Restaurante_OS + chic-dish-hub).",
      description:
        "<p>Includes <code>Restaurante_OS</code> (clean git) and <code>chic-dish-hub</code> (296 uncommitted files, <code>HANDOFF.md</code>).</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Restaurante_OS",
      tags: ["SaaS", "Hospitality", "Product Idea"],
      attachments: [],
      order: 2,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Consolidate chic-dish-hub and Restaurante_OS into one clean repo", {
          priority: "medium",
          children: [
            makeTask("Review HANDOFF.md and commit or clean up 296 modified files in chic-dish-hub", {
              priority: "medium",
            }),
            makeTask("Delete duplicate 'chic-dish-hub - Copy' folder once verified", { priority: "low" }),
          ],
        }),
      ],
    },
    {
      id: "proj-petprinted",
      name: "PetPrinted Agent Hub",
      bucketId: "ideas",
      status: "idea",
      priority: "medium",
      summary: "AI Creative Engine: variant studio, AI video, trend agent (Apify), and occasion radar.",
      description:
        "<p>Repo: <code>C:\\Users\\JohanDanielA\\Documents\\GitHub\\petprinted-agent-hub</code>. Includes phase 1 variant studio, AI video, and detailed agent briefings (00–04).</p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\petprinted-agent-hub",
      tags: ["AI Agents", "E-commerce", "Apify"],
      attachments: [],
      order: 3,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Review agent roadmap (01-trend-agent-apify to 04-design-system)", { priority: "low" }),
      ],
    },
    {
      id: "proj-other-ideas",
      name: "Infinity Teacher / Gemini Life Story / Other Ideas",
      bucketId: "ideas",
      status: "idea",
      priority: "low",
      summary: "Personal AI & education ideas parking lot (Infinity Teacher, Gemini Life Story, Pepti-dos, Aquitodo).",
      description:
        "<p>Use this project to capture long-standing product ideas, notes, and specs without cluttering active client work.</p>",
      tags: ["Ideas", "R&D"],
      attachments: [],
      order: 4,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Infinity Teacher: write core concept & MVP scope in description", { priority: "low" }),
        makeTask("Gemini Life Story: organize biographical & psychology synthesis docs", { priority: "low" }),
        makeTask("Brain-dump any other multi-year ideas here as tasks", { priority: "low" }),
      ],
    },

    // =========================================================================
    // BUCKET 5: VR JOURNEY
    // =========================================================================
    {
      id: "proj-opensource-canon-vr",
      name: "OpenSourceCanonVR",
      bucketId: "vr-journey",
      status: "idea",
      priority: "medium",
      summary: "VR exploration & OpenSourceCanonVR setup (active Oct 17).",
      description:
        "<h3>VR Journey — Project 1</h3><p>Folder: <code>C:\\Users\\JohanDanielA\\Documents\\GitHub\\OpenSourceCanonVR</code></p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\OpenSourceCanonVR",
      tags: ["VR", "Hardware", "OpenXR"],
      attachments: [],
      order: 1,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Document OpenSourceCanonVR goals, pipeline, and hardware setup", {
          priority: "medium",
          children: [
            makeTask("Initialize Git repo and add README with architecture notes", { priority: "low" }),
          ],
        }),
      ],
    },
    {
      id: "proj-vreathe",
      name: "Vreathe",
      bucketId: "vr-journey",
      status: "idea",
      priority: "low",
      summary: "VR breathing / mindfulness experience.",
      description: "<p>Repository: <code>C:\\Users\\JohanDanielA\\Documents\\GitHub\\Vreathe</code></p>",
      repoPath: "C:\\Users\\JohanDanielA\\Documents\\GitHub\\Vreathe",
      tags: ["VR", "Mindfulness"],
      attachments: [],
      order: 2,
      updatedAt: nowIso(),
      tasks: [
        makeTask("Define Vreathe prototype scope and target engine/headset", { priority: "low" }),
      ],
    },
  ],
}

// ============================================================================
// Recursive Task Tree Helpers
// ============================================================================

export function countTasksRecursive(tasks: WorkspaceTask[]): { done: number; total: number; pct: number } {
  let done = 0
  let total = 0
  const walk = (list: WorkspaceTask[]) => {
    for (const t of list) {
      total += 1
      if (t.completed || t.status === "done") done += 1
      if (t.children?.length) walk(t.children)
    }
  }
  walk(tasks)
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export function findTaskRecursive(tasks: WorkspaceTask[], taskId: string): WorkspaceTask | null {
  for (const t of tasks) {
    if (t.id === taskId) return t
    if (t.children?.length) {
      const found = findTaskRecursive(t.children, taskId)
      if (found) return found
    }
  }
  return null
}

export function updateTaskRecursive(
  tasks: WorkspaceTask[],
  taskId: string,
  updater: (task: WorkspaceTask) => WorkspaceTask
): WorkspaceTask[] {
  return tasks.map((t) => {
    if (t.id === taskId) {
      return updater({ ...t, updatedAt: new Date().toISOString() })
    }
    if (t.children?.length) {
      return { ...t, children: updateTaskRecursive(t.children, taskId, updater) }
    }
    return t
  })
}

export function deleteTaskRecursive(tasks: WorkspaceTask[], taskId: string): WorkspaceTask[] {
  return tasks
    .filter((t) => t.id !== taskId)
    .map((t) => ({
      ...t,
      children: t.children?.length ? deleteTaskRecursive(t.children, taskId) : [],
    }))
}

export function addChildTaskRecursive(
  tasks: WorkspaceTask[],
  parentTaskId: string,
  newChild: WorkspaceTask
): WorkspaceTask[] {
  return tasks.map((t) => {
    if (t.id === parentTaskId) {
      return {
        ...t,
        expanded: true,
        updatedAt: new Date().toISOString(),
        children: [...(t.children ?? []), newChild],
      }
    }
    if (t.children?.length) {
      return { ...t, children: addChildTaskRecursive(t.children, parentTaskId, newChild) }
    }
    return t
  })
}

export function createBlankTask(title = "New task", priority: TaskPriority = "medium"): WorkspaceTask {
  return makeTask(title, { priority, status: "todo", completed: false })
}

// ============================================================================
// Client Persistence Helpers (API + localStorage backup)
// ============================================================================

const LOCAL_STORAGE_KEY = "johan_admin_workspace_v1"

export async function getWorkspace(): Promise<WorkspaceData> {
  try {
    const res = await fetch("/api/workspace", { cache: "no-store" })
    if (res.ok) {
      const data = (await res.json()) as WorkspaceData
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
      }
      return data
    }
  } catch (err) {
    console.warn("Falling back to local workspace cache:", err)
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      try {
        return JSON.parse(cached) as WorkspaceData
      } catch {}
    }
  }
  return DEFAULT_WORKSPACE
}

export async function saveWorkspace(workspace: WorkspaceData): Promise<WorkspaceData> {
  const payload: WorkspaceData = {
    ...workspace,
    updatedAt: new Date().toISOString(),
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
    } catch {}
  }

  const res = await fetch("/api/workspace", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to save workspace")
  }
  return res.json()
}

export async function uploadWorkspaceFile(file: File): Promise<WorkspaceAttachment> {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const res = await fetch("/api/workspace/upload", {
      method: "POST",
      body: formData,
    })
    if (res.ok) {
      const data = await res.json()
      return {
        id: createId(),
        name: file.name,
        url: data.url,
        size: file.size,
        mimeType: file.type,
        kind: file.type.startsWith("image/") ? "image" : "file",
        createdAt: new Date().toISOString(),
      }
    }
  } catch (err) {
    console.warn("Cloud upload unavailable, using local data URL fallback:", err)
  }

  // Fallback for local dev without BLOB_READ_WRITE_TOKEN (up to 4MB files)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })

  return {
    id: createId(),
    name: file.name,
    url: dataUrl,
    size: file.size,
    mimeType: file.type,
    kind: file.type.startsWith("image/") ? "image" : "file",
    createdAt: new Date().toISOString(),
  }
}
