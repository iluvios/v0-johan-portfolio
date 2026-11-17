// Shared types, constants, and client API helpers for the Prospect Intelligence & Audit Engine.
// Stored in Neon table `prospect_audits` (zero image binaries in DB; screenshots stay in `.local-audits/`).

export type ProspectCohort =
  | "med_spa_aesthetics"
  | "home_services_ads"
  | "law_firms"
  | "specialty_auto"
  | "custom_building"
  | "event_venues"
  | "real_estate"
  | "funded_startups"

export type OutreachAngle =
  | "modernize_website"
  | "scale_50pct_more"
  | "reputation_and_intake_rescue"
  | "upgrade_social_and_ads"
  | "startup_gtm_sprint"

export type PriorityTier = "S" | "A" | "B" | "C" | "skip"

export type WebsiteStatus =
  | "live"
  | "unlinked_on_gbp"
  | "social_only_whale"
  | "unreachable"
  | "missing"

export interface ProspectEmail {
  address: string
  kind: "owner" | "role"
  source?: string
}

export interface ProspectDecisionMaker {
  name: string
  role: string
  email?: string | null
  linkedin?: string | null
}

export interface ProspectReviewSnippet {
  rating: number
  author?: string
  relativeTime?: string
  text: string
}

export interface ProspectSocialLinks {
  instagram?: string | null
  facebook?: string | null
  linkedin?: string | null
  tiktok?: string | null
  youtube?: string | null
  x?: string | null
  yelp?: string | null
}

export interface ProspectPerfMetrics {
  ttfbMs: number | null
  fcpMs: number | null
  lcpMs: number | null
  cls: number | null
  domContentLoadedMs: number | null
  loadMs: number | null
  totalBytes: number | null
  imageBytes?: number | null
  largestImageBytes?: number | null
  jsBytes: number | null
  requestCount: number | null
  verifiedSingleTab?: boolean
  fullPageVisualsVerified?: boolean
  capturedFullHeightPx?: number | null
}

export interface ProspectDiagnostics {
  perf: ProspectPerfMetrics
  commercialPagesCount: number
  servicesDetected: string[]
  seo: {
    title: string | null
    titleLength: number
    metaDescription: string | null
    metaDescLength: number
    h1Count: number
    h1Texts: string[]
    hasCanonical: boolean
    hasSitemapXml: boolean
    sitemapUrlCount: number
    imgCount: number
    missingAltRatio: number
    internalServicePageCount: number
    hasLocalCityInTitleOrH1: boolean
    flaws: string[]
  }
  aeoGeo: {
    hasLlmsTxt: boolean
    robotsBlocksAi: string[]
    jsonLdTypes: string[]
    hasLocalBusinessSchema: boolean
    hasFaqSchema: boolean
    hasServiceSchema: boolean
    hasAggregateRatingSchema: boolean
    hasSameAsLinks: boolean
    questionHeadingsCount: number
    flaws: string[]
  }
  emailDns: {
    mxProvider: string | null
    mxRecords: string[]
    hasSpf: boolean
    spfRaw: string | null
    detectedEspCrmFromSpf: string[]
    hasDmarc: boolean
    dmarcPolicy: string | null
    usesFreeWebmailOnSite: boolean
    flaws: string[]
  }
  tracking: {
    hasGtm: boolean
    hasServerSideGtm: boolean
    hasGa4: boolean
    hasLegacyUa: boolean
    hasGoogleAds: boolean
    hasMetaPixel: boolean
    hasTikTokPixel: boolean
    hasLinkedInInsight: boolean
    hasBingUet: boolean
    callTrackingProvider: string | null
    heatmapTools: string[]
    flaws: string[]
  }
  crmIntake: {
    detectedCrms: string[]
    bookingWidgets: string[]
    hasChatBot: boolean
    chatProvider: string | null
    formCount: number
    maxFormFields: number
    usesMailtoOnly: boolean
    hasInstantQuoteOrCalculator: boolean
    rivalAgencyCredit: string | null
    flaws: string[]
  }
  uiFlaws: {
    mobileHorizontalOverflow: boolean
    stickyHeaderOverlapPx: number
    brokenImagesCount: number
    tinyMobileTextCount: number
    fontFamilyCount: number
    fontFamilies: string[]
    mixedContentCount: number
    flaws: string[]
  }
  branding: {
    hasVectorOrCrispLogo: boolean
    primaryColors: string[]
    genericHeadline: boolean
    heroHeadline: string | null
    heroSubheadline: string | null
    primaryCtaText: string | null
    phoneConsistentAcrossSite: boolean
    hasClearGuaranteeOrOffer: boolean
    flaws: string[]
  }
  socialReputation: {
    socialLinks: ProspectSocialLinks
    brokenSocialIconCount: number
    showcasesReviewsOnHome: boolean
    reputationDisconnect: boolean
    reviewComplaintThemes: string[]
    reviewPraiseThemes: string[]
    flaws: string[]
  }
}

export type CanItSellVerdict =
  | "Yes — Best Practices + Creative Edge"
  | "Decent Best Practices — Needs Creative Twist (+50% Upside)"
  | "Partially — Leaks High-Intent Leads"
  | "No — Static Brochure / Needs Foundation + Creative"

export interface ProspectPillarAssessment {
  score: number
  goods: string[]
  bads: string[]
  summary: string
}

export interface ProspectCreativeAssessment extends ProspectPillarAssessment {
  isGenericCliche: boolean
  observedHeadlineOrHook: string | null
  creativeUpsidePitch: string
}

export interface ProspectFourPillarReport {
  /** Step 1 (Visual Best Practices): Beauty, visual polish, UI layout clarity, brand & communication consistency */
  brandingUxUi: ProspectPillarAssessment & {
    cmsPlatform: string | null
  }
  /** Step 2 (Conversion Best Practices): Can this website sell? Value prop clarity, offers, CTAs, social proof/reviews placement */
  marketingSales: ProspectPillarAssessment & {
    canItSellVerdict: CanItSellVerdict
  }
  /** Step 3 (Technical Best Practices): SEO, AEO/GEO, CWV speed, CRM/forms, tracking (pixels, GA4, GAds, sGTM, CallRail), DNS/DMARC */
  technicalStack: ProspectPillarAssessment & {
    detectedStack: string[]
  }
  /** The Creative Part: Hook originality, brand voice/storytelling, offer framing/twists vs. generic industry cliches */
  creativePart: ProspectCreativeAssessment
  /** Step 4 (Secondary / Optional Bonus): Visible chat bot, booking/intake widgets (harder to observe internal automations externally) */
  automation: ProspectPillarAssessment & {
    isSecondarySignal: true
    confidence: "observed_widget" | "external_surface_only"
    detectedTools: string[]
  }
}

export interface ProspectAuditDraft {
  domain: string
  company: string
  websiteUrl: string | null
  websiteStatus: WebsiteStatus
  cohort: ProspectCohort
  subCategory: string | null
  city: string | null
  state: string | null
  metro: string | null
  formattedAddress: string | null
  googlePlaceId: string | null
  googleRating: number | null
  googleReviewsCount: number | null
  googleMapsUrl: string | null
  googleReviewsSample: ProspectReviewSnippet[]
  isPeRollup: boolean
  crmItemId: number | null
  source: string

  // Contacts
  emails: ProspectEmail[]
  phones: string[]
  decisionMakers: ProspectDecisionMaker[]
  socialLinks: ProspectSocialLinks

  // Indexed Quick-Filter Flags
  hasVerifiedEmail: boolean
  hasPaidAds: boolean
  hasChatBot: boolean
  hasDmarcRisk: boolean

  // 8-Pillar Raw Diagnostics + Structured Best-Practices & Creative Breakdown
  diagnostics: ProspectDiagnostics | null
  fourPillars: ProspectFourPillarReport | null

  // 1-10 Scores + Tier (Visual + Technical Best Practices + Creative Part primary; Automation secondary/optional)
  priorityTier: PriorityTier
  businessStrengthScore: number
  aestheticsScore: number
  brandingScore: number
  uxCroScore: number
  seoAeoScore: number
  trackingCrmScore: number
  marketingScore: number
  creativeScore: number
  automationScore: number
  modernizationGapScore: number
  reviewMethod: "multimodal_vision" | "diagnostic_rubric" | "hybrid"

  // Outreach Copy & Assets
  outreachAngle: OutreachAngle
  topFlaws: string[]
  visualCritique: string | null
  personalizedHook: string | null
  benchmarkAdRef: string | null
  specAdUrl: string | null
  demoFunnelUrl: string | null
  localSheetFile: string | null
  auditedAt: string | null
}

export interface ProspectAudit extends ProspectAuditDraft {
  id: number
  promotedCrmId: number | null
  createdAt: string
  updatedAt: string
}

export const PROSPECT_COHORTS: {
  value: ProspectCohort
  label: string
  shortLabel: string
  colorClass: string
}[] = [
  {
    value: "med_spa_aesthetics",
    label: "Med Spas, Cosmetic Dental & Aesthetics",
    shortLabel: "Med Spa / Dental",
    colorClass: "bg-pink-950/60 text-pink-300 border-pink-500/30",
  },
  {
    value: "home_services_ads",
    label: "Solar, Roofing, Remodeling & HVAC",
    shortLabel: "Solar / Roof / HVAC",
    colorClass: "bg-amber-950/60 text-amber-300 border-amber-500/30",
  },
  {
    value: "law_firms",
    label: "Law Firms (PI, Immigration, Family, Estate)",
    shortLabel: "Law Firms",
    colorClass: "bg-indigo-950/60 text-indigo-300 border-indigo-500/30",
  },
  {
    value: "specialty_auto",
    label: "Specialty Auto, Wraps, PPF & Collision",
    shortLabel: "Specialty Auto",
    colorClass: "bg-cyan-950/60 text-cyan-300 border-cyan-500/30",
  },
  {
    value: "custom_building",
    label: "Custom Doors, Windows & Luxury Building",
    shortLabel: "Custom Doors / Build",
    colorClass: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
  },
  {
    value: "event_venues",
    label: "Event Venues, Wedding & Banquet Spaces",
    shortLabel: "Event Venues",
    colorClass: "bg-rose-950/60 text-rose-300 border-rose-500/30",
  },
  {
    value: "real_estate",
    label: "Real Estate Teams, Brokerages & Property Mgmt",
    shortLabel: "Real Estate",
    colorClass: "bg-teal-950/60 text-teal-300 border-teal-500/30",
  },
  {
    value: "funded_startups",
    label: "YC & Funded Startups (Existing CRM)",
    shortLabel: "Funded Startups",
    colorClass: "bg-violet-950/60 text-violet-300 border-violet-500/30",
  },
]

export const OUTREACH_ANGLES: {
  value: OutreachAngle
  label: string
  pitchSummary: string
}[] = [
  {
    value: "modernize_website",
    label: "Modernize Website & UX",
    pitchSummary: "Strong offline reputation paired with dated design, mobile layout friction, or weak conversion UX.",
  },
  {
    value: "scale_50pct_more",
    label: "Scale 50% More in 3 Mo",
    pitchSummary: "Solid brand & site; unlock +50% lead conversion via 24/7 AI web/IG/FB intake bot, sGTM CAPI, and interactive quote funnel.",
  },
  {
    value: "reputation_and_intake_rescue",
    label: "Reputation & Intake Rescue",
    pitchSummary: "High review volume at 3.5★–3.9★ (or unlinked GBP); fix slow response, intake leaks, and automate 5★ review capture.",
  },
  {
    value: "upgrade_social_and_ads",
    label: "Upgrade Social & Paid Ads",
    pitchSummary: "Strong reviews & service delivery, under-leveraged paid social creatives, missing pixels, or social-only presence.",
  },
  {
    value: "startup_gtm_sprint",
    label: "Startup GTM & Conversion Sprint",
    pitchSummary: "Funded startup needing conversion architecture, AEO/GEO visibility, and automated inbound/outbound sales pipeline.",
  },
]

export const PRIORITY_TIERS: {
  value: PriorityTier
  label: string
  badgeClass: string
}[] = [
  { value: "S", label: "Tier S (VIP Whale)", badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/50" },
  { value: "A", label: "Tier A (High Fit)", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50" },
  { value: "B", label: "Tier B (Qualified)", badgeClass: "bg-blue-500/20 text-blue-300 border-blue-400/50" },
  { value: "C", label: "Tier C (Low Priority)", badgeClass: "bg-slate-700/60 text-slate-300 border-slate-600" },
  { value: "skip", label: "Skip", badgeClass: "bg-red-950/60 text-red-300 border-red-500/30" },
]

export function cohortLabel(cohort: ProspectCohort): string {
  return PROSPECT_COHORTS.find((c) => c.value === cohort)?.shortLabel ?? cohort
}

export function angleLabel(angle: OutreachAngle): string {
  return OUTREACH_ANGLES.find((a) => a.value === angle)?.label ?? angle
}

export interface ProspectCohortKpi {
  cohort: ProspectCohort
  total: number
  tierS: number
  tierA: number
  withEmail: number
  withPaidAds: number
  withoutBot: number
  avgBusinessStrength: number
  avgModernizationGap: number
}

export interface ProspectsListResponse {
  items: ProspectAudit[]
  total: number
  kpis: ProspectCohortKpi[]
}

const ASSET_OR_FAKE_TLDS = new Set<string>([
  "avif",
  "webp",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "ico",
  "bmp",
  "tiff",
  "tif",
  "heic",
  "mp4",
  "webm",
  "mov",
  "avi",
  "mp3",
  "wav",
  "pdf",
  "zip",
  "css",
  "scss",
  "less",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "jsx",
  "json",
  "xml",
  "map",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "otf",
  "blink",
  "mhtml",
  "tld",
  "local",
  "localhost",
  "invalid",
  "test",
  "example",
  "gov",
  "edu",
  "mil",
])

const JUNK_EMAIL_EXACT = new Set<string>([
  "impallari@gmail.com",
  "amkryukov@gmail.com",
  "typesetit@att.net",
  "template.placeholder@gmail.com",
  "johndoe@gmail.com",
  "janedoe@gmail.com",
  "john.doe@gmail.com",
  "jane.doe@gmail.com",
  "abc@xyz.com",
  "seo.loginuser@growth99.com",
  "you@yourbusiness.com",
  "john@myemail.com",
])

const JUNK_EMAIL_ROOT_HOSTS = new Set<string>([
  "sentry.io",
  "wixpress.com",
  "wix.com",
  "squarespace.com",
  "godaddy.com",
  "wordpress.com",
  "wordpress.org",
  "wpengine.com",
  "wpenginepowered.com",
  "kinsta.cloud",
  "hostingersite.com",
  "cloudwaysapps.com",
  "myftpupload.com",
  "sg-host.com",
  "pantheonsite.io",
  "tempurl.host",
  "cloudflare.com",
  "moatable.com",
  "mhtml.blink",
  "example.com",
  "example.org",
  "example.net",
  "domain.com",
  "yourdomain.com",
  "mydomain.com",
  "yoursite.com",
  "yoursite.org",
  "yoursite.net",
  "yourbusiness.com",
  "yourwebsite.com",
  "email.com",
  "myemail.com",
  "mysite.com",
  "company.com",
  "yourcompany.com",
  "acme.com",
  "acme.co",
  "doe.com",
  "johndoe.com",
  "xyz.com",
  "mailservice.com",
  "emailservices.com",
  "djguy.com",
  "placeholder.com",
  "sample.com",
  "test.com",
  "latofonts.com",
  "indiantypefoundry.com",
  "rfuenzalida.com",
  "micahrich.com",
  "eyebytes.com",
  "pixelspread.com",
  "typemade.mx",
  "ndiscovered.com",
  "greensock.com",
  "sansoxygen.com",
  "sparksites.com",
  "lab6.com",
  "template.com",
])

const JUNK_EMAIL_LOCAL_RE =
  /^(example|user|username|name|yourname|firstname|lastname|email|myemail|youremail|test|testing|template\.placeholder|johndoe|janedoe|john\.doe|jane\.doe|noreply|no-reply|no_reply|donotreply|do-not-reply|mailer-daemon|postmaster|hostmaster|abuse|webmaster|sentry|bugreport|privacyquestions|wordpress|webflow|squarespace|elementor|wix)$/i

export const ROLE_EMAIL_PREFIX_RE =
  /^(?:(?:info|information|contact|contactus|hello|hi|support|supportme|sales|admin|administration|office|frontoffice|mainoffice|backoffice|lawoffice|intake|service|services|servicemanager|servicedepartment|customerservice|customer[._-]service|customercare|customer[._-]care|clientservices?|clientcare|team|help|helpdesk|reception|receptionist|frontdesk|front[._-]desk|frontdesks|appointments?|booking|bookings|consults?|consultations?|reservations?|scheduling|scheduler|dispatch|concierge|events?|inquiries|inquiry|estimates?|estimating|quotes?|billing|accounting|accounts|leasing|management|propertymanagement|orders?|parts|warranty|claims|careers|hr|jobs|recruiting|marketing|media|press|pr|legal|attorneys?|lawyers?|compliance|privacy|security|general|mail|email|welcome|feedback|care)(?:[0-9]+|[._-][a-z0-9._-]+)?|[a-z0-9._-]+(?:office|frontdesk|reception|intake|inquiries|appointments|bookings|customerservice|dispatch))@/i

export function sanitizeEmailAddress(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  let cleaned = raw
    .trim()
    .replace(/^(?:mailto:|email:|email%3a)+/gi, "")
    .split("?")[0]
    .trim()
    .replace(/^(?:%20)+|(?:%20)+$/gi, "")
    .replace(/^(?:\\?u00[0-9a-f]{2})+/gi, "")
    .toLowerCase()
    .replace(/^[._<>'"()[\]\s-]+|[._<>'"()[\]\s-]+$/g, "")

  if (cleaned.length < 6 || cleaned.length > 120) return null
  if (cleaned.includes("%")) return null
  const m = cleaned.match(/^([a-z0-9._+-]{1,64})@([a-z0-9.-]{2,120}\.([a-z]{2,18}))$/)
  if (!m) return null

  const [, local, rawHost, tld] = m
  const host = rawHost.startsWith("www.") && rawHost.slice(4).includes(".") ? rawHost.slice(4) : rawHost
  cleaned = `${local}@${host}`

  if (local.startsWith(".") || local.endsWith(".") || local.includes("..") || host.includes("..")) return null
  if (ASSET_OR_FAKE_TLDS.has(tld)) return null
  if (JUNK_EMAIL_EXACT.has(cleaned)) return null
  if (/^[0-9a-f]{20,}$/i.test(local)) return null
  if (JUNK_EMAIL_LOCAL_RE.test(local)) return null
  if (/sentry|wixpress/i.test(host) || /wixpress|yoursite/i.test(cleaned)) return null
  if (/(?:example\.com|domain\.com)$/i.test(host)) return null

  // Reject responsive retina / DPI image suffixes masquerading as email domains (e.g. hero@1.2x.avif, logo@2x.jpg, @1., @2., @3.)
  if (/^[123]\./.test(host)) return null
  if (/^(\d+(?:\.\d+)?x|\d+(?:ppi|dpi))(?:[.-]|$)/.test(host)) return null
  if (/\.(?:avif|webp|png|jpg|jpeg|gif|svg|ico|pdf|css|js)(?:[.-]|$)/.test(host)) return null

  const hostParts = host.split(".")
  for (let i = 0; i <= hostParts.length - 2; i++) {
    const candidateHost = hostParts.slice(i).join(".")
    if (JUNK_EMAIL_ROOT_HOSTS.has(candidateHost)) return null
  }

  return cleaned
}

export function sanitizeProspectEmails(emails: ProspectEmail[] | null | undefined): ProspectEmail[] {
  if (!Array.isArray(emails) || emails.length === 0) return []
  const seen = new Set<string>()
  const out: ProspectEmail[] = []
  for (const item of emails) {
    if (!item || typeof item !== "object") continue
    const cleanAddr = sanitizeEmailAddress(item.address)
    if (!cleanAddr || seen.has(cleanAddr)) continue
    seen.add(cleanAddr)
    const kind: "owner" | "role" =
      item.kind === "role" || ROLE_EMAIL_PREFIX_RE.test(cleanAddr) ? "role" : "owner"
    out.push({
      address: cleanAddr,
      kind,
      ...(item.source ? { source: item.source } : {}),
    })
  }
  return out
}

const VALID_SOCIAL_ROOTS: Record<keyof ProspectSocialLinks, string[]> = {
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com"],
  linkedin: ["linkedin.com"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com", "youtu.be"],
  x: ["x.com", "twitter.com"],
  yelp: ["yelp.com"],
}

// Reject unedited website-builder template social icons (e.g. instagram.com/wix, facebook.com/WixStudio, linkedin.com/company/wix-com)
const CMS_PLACEHOLDER_SOCIAL_PATH_RE =
  /^\/(?:@|(?:company|user|c|in|pages)\/)?(?:wix|wix-com|wixstudio|wix-studio|squarespace|godaddy|wordpress|elementor|weebly|shopify|webflow|duda|jimdo|vistaprint|hostinger)(?:\/|$)/i

// Reject social share/intent widgets, video embeds, and auth/utility pages mistaken for company social profiles
const NON_PROFILE_SOCIAL_PATH_RE =
  /^\/(?:sharer(?:\.php)?|share(?:\.php|article)?|sharing|dialog|plugins|intent|embed|watch|login|signup|help|privacy|terms|policies|hashtag)(?:\/|$)/i

export function sanitizeProspectSocialLinks(
  links: ProspectSocialLinks | null | undefined,
): ProspectSocialLinks {
  if (!links || typeof links !== "object") return {}
  const out: ProspectSocialLinks = {}
  for (const key of Object.keys(VALID_SOCIAL_ROOTS) as (keyof ProspectSocialLinks)[]) {
    const raw = links[key]
    if (typeof raw !== "string" || !raw.trim()) continue
    try {
      const u = new URL(raw.trim())
      const h = u.hostname.toLowerCase().replace(/^www\./, "")
      const allowed = VALID_SOCIAL_ROOTS[key]
      if (!allowed.some((root) => h === root || h.endsWith(`.${root}`))) continue
      u.hash = ""
      const cleanPath = u.pathname.replace(/\/+$/, "")
      if (!cleanPath || cleanPath === "/") continue
      if (CMS_PLACEHOLDER_SOCIAL_PATH_RE.test(cleanPath)) continue
      if (NON_PROFILE_SOCIAL_PATH_RE.test(cleanPath)) continue
      if (key === "x" && /^\/home(?:\/|$)/i.test(cleanPath)) continue
      if (key === "facebook" && /^\/profile\.php$/i.test(cleanPath) && !u.searchParams.get("id")) continue
      out[key] = u.toString()
    } catch {
      // drop malformed URL
    }
  }
  return out
}

export type ProspectSourceFilter =
  | "all"
  | "net_new"
  | "page2_challengers"
  | "page3_challengers"
  | "existing_crm"

export const PROSPECT_SOURCE_FILTERS: {
  value: ProspectSourceFilter
  label: string
}[] = [
  { value: "all", label: "All Sources" },
  { value: "net_new", label: "Net-New Cold Leads" },
  { value: "page2_challengers", label: "Page 2 & 3 Challengers (#21–#60)" },
  { value: "page3_challengers", label: "Page 3 Deep Challengers (#41–#60)" },
  { value: "existing_crm", label: "Existing CRM Recheck" },
]

export interface ProspectFilterParams {
  cohort?: string
  tier?: string
  angle?: string
  source?: ProspectSourceFilter | string
  metro?: string
  hasEmail?: boolean
  hasAds?: boolean
  needsBot?: boolean
  minRating?: number
  maxRating?: number
  minReviews?: number
  maxReviews?: number
  search?: string
  limit?: number
  offset?: number
}

export type ProspectListFilters = ProspectFilterParams

export function buildProspectsQuery(params: ProspectFilterParams, format?: "csv"): string {
  const sp = new URLSearchParams()
  if (params.cohort && params.cohort !== "all") sp.set("cohort", params.cohort)
  if (params.tier && params.tier !== "all") sp.set("tier", params.tier)
  if (params.angle && params.angle !== "all") sp.set("angle", params.angle)
  if (params.source && params.source !== "all") sp.set("source", params.source)
  if (params.metro && params.metro !== "all") sp.set("metro", params.metro)
  if (params.hasEmail) sp.set("hasEmail", "1")
  if (params.hasAds) sp.set("hasAds", "1")
  if (params.needsBot) sp.set("needsBot", "1")
  if (typeof params.minRating === "number" && Number.isFinite(params.minRating)) {
    sp.set("minRating", String(params.minRating))
  }
  if (typeof params.maxRating === "number" && Number.isFinite(params.maxRating)) {
    sp.set("maxRating", String(params.maxRating))
  }
  if (typeof params.minReviews === "number" && Number.isFinite(params.minReviews)) {
    sp.set("minReviews", String(params.minReviews))
  }
  if (typeof params.maxReviews === "number" && Number.isFinite(params.maxReviews)) {
    sp.set("maxReviews", String(params.maxReviews))
  }
  if (params.search && params.search.trim()) sp.set("search", params.search.trim())
  if (typeof params.limit === "number") sp.set("limit", String(params.limit))
  if (typeof params.offset === "number") sp.set("offset", String(params.offset))
  if (format === "csv") sp.set("format", "csv")
  const qs = sp.toString()
  return qs ? `/api/prospects?${qs}` : "/api/prospects"
}

export const buildProspectsQueryString = buildProspectsQuery

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export function listProspects(params: ProspectFilterParams): Promise<ProspectsListResponse> {
  return apiRequest<ProspectsListResponse>(buildProspectsQuery(params))
}

export function updateProspectFields(
  id: number,
  patch: Partial<Pick<ProspectAuditDraft, "priorityTier" | "outreachAngle" | "personalizedHook" | "visualCritique">>,
): Promise<ProspectAudit> {
  return apiRequest<ProspectAudit>("/api/prospects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "patch", id, patch }),
  })
}

export function promoteProspects(
  ids: number[],
): Promise<{ promoted: number; crmIds: number[]; promotedMap?: Record<string, number> }> {
  return apiRequest<{ promoted: number; crmIds: number[]; promotedMap?: Record<string, number> }>(
    "/api/prospects/promote",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    },
  )
}
