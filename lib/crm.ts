// Simple CRM for the job search (applications) and client search (startup leads).
// Stored in the Neon table `crm_items`; every API call requires an admin session.

export type CrmKind = "job" | "client"
export type CrmStage = "lead" | "qualified" | "contacted" | "conversation" | "proposal" | "won" | "lost"
export type CrmActivityType = "note" | "email" | "call" | "meeting" | "applied" | "stage"

export interface CrmActivity {
  id: string
  at: string
  type: CrmActivityType
  text: string
}

export interface CrmItem {
  id: number
  kind: CrmKind
  company: string
  title: string
  url: string | null
  location: string | null
  compensation: string | null
  source: string | null
  stage: CrmStage
  priority: 1 | 2 | 3
  contactName: string | null
  contactRole: string | null
  contactEmail: string | null
  contactUrl: string | null
  nextStep: string | null
  // YYYY-MM-DD
  nextStepDate: string | null
  notes: string | null
  tags: string[]
  activities: CrmActivity[]
  createdAt: string
  updatedAt: string
}

export type CrmDraft = Omit<CrmItem, "id" | "createdAt" | "updatedAt">

export const CRM_KINDS: { value: CrmKind; label: string; newLabel: string }[] = [
  { value: "job", label: "Job search", newLabel: "New job" },
  { value: "client", label: "Client search", newLabel: "New lead" },
]

export const CRM_STAGES: { value: CrmStage; job: string; client: string }[] = [
  { value: "lead", job: "Researching", client: "Lead" },
  { value: "qualified", job: "Ready to apply", client: "Qualified" },
  { value: "contacted", job: "Applied", client: "Contacted" },
  { value: "conversation", job: "Interviewing", client: "In talks" },
  { value: "proposal", job: "Offer", client: "Proposal sent" },
  { value: "won", job: "Hired", client: "Won" },
  { value: "lost", job: "Closed", client: "Lost" },
]

export const CLOSED_STAGES: CrmStage[] = ["won", "lost"]

export const CRM_ACTIVITY_TYPES: { value: CrmActivityType; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "email", label: "Email / DM" },
  { value: "call", label: "Call" },
  { value: "meeting", label: "Meeting / interview" },
  { value: "applied", label: "Applied" },
]

export function stageLabel(stage: CrmStage, kind: CrmKind): string {
  const entry = CRM_STAGES.find((s) => s.value === stage)
  return entry ? entry[kind] : stage
}

export function isClosed(stage: CrmStage): boolean {
  return CLOSED_STAGES.includes(stage)
}

export function emptyDraft(kind: CrmKind): CrmDraft {
  return {
    kind,
    company: "",
    title: "",
    url: null,
    location: null,
    compensation: null,
    source: null,
    stage: "lead",
    priority: 2,
    contactName: null,
    contactRole: null,
    contactEmail: null,
    contactUrl: null,
    nextStep: null,
    nextStepDate: null,
    notes: null,
    tags: [],
    activities: [],
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export function listCrmItems(): Promise<CrmItem[]> {
  return request<CrmItem[]>("/api/crm")
}

export function createCrmItem(draft: CrmDraft): Promise<CrmItem> {
  return request<CrmItem>("/api/crm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  })
}

export function updateCrmItem(item: CrmItem): Promise<CrmItem> {
  return request<CrmItem>(`/api/crm/${item.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  })
}

export function deleteCrmItem(id: number): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/crm/${id}`, { method: "DELETE" })
}
