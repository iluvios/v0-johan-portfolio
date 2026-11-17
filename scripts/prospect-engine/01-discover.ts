import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { neon } from "@neondatabase/serverless"
import {
  sanitizeProspectEmails,
  type ProspectCohort,
  type ProspectEmail,
  type ProspectReviewSnippet,
  type ProspectSocialLinks,
  type WebsiteStatus,
} from "../../lib/prospects"
import {
  ACTIVE_LOCAL_COHORTS,
  DISCOVERED_FILE,
  ensureAuditDirs,
  EXCLUDED_NAME_PATTERNS,
  normalizeHostname,
  PLACES_CACHE_DIR,
  slugifyCompanyDomain,
  TOP_50_METROS,
  WEB_LOOKUP_CACHE_DIR,
  type CohortDiscoveryConfig,
  type MetroConfig,
} from "./config"

export interface DiscoveredProspect {
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
  crmItemId: number | null
  source: string
  seedEmails: ProspectEmail[]
  seedPhones: string[]
  seedSocialLinks: ProspectSocialLinks
  seedNotes: string | null
}

function parseArg(name: string, fallback: string): string {
  const prefix = `--${name}=`
  const found = process.argv.find((a) => a.startsWith(prefix))
  return found ? found.slice(prefix.length) : fallback
}

function sha1(text: string): string {
  return crypto.createHash("sha1").update(text).digest("hex")
}

// HARD MONTHLY FREE-TIER GUARDRAIL:
// Key #1 (GOOGLE_MAPS_API_KEY) is frozen at 977 / 1,000 calls (0 live calls allowed on Key #1).
// Key #2 (GOOGLE_MAPS_API_KEY_2) starts at 1 / 1,000 calls + max 420 new calls = 421 <= 1,000 monthly free limit ($0.00 spend).
const HARD_LIVE_PLACES_CALL_CAP = 420
const HARD_TOTAL_CACHE_FILES_CAP = 977 + HARD_LIVE_PLACES_CALL_CAP

let livePlacesCalls = 0
let initialPlacesCacheCount = 0
let allowLivePlacesCalls = false

async function searchPlacesNew(
  apiKey: string,
  textQuery: string,
  maxCalls: number,
  pageSize = 20,
  pageToken?: string,
): Promise<{ places: any[]; nextPageToken?: string; fromCache: boolean; status?: number }> {
  const cacheKey = sha1(`v1:${textQuery}|${pageSize}|${pageToken || ""}`)
  const cacheFile = path.join(PLACES_CACHE_DIR, `${cacheKey}.json`)
  if (fs.existsSync(cacheFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
      return { places: parsed.places || [], nextPageToken: parsed.nextPageToken, fromCache: true, status: 200 }
    } catch {
      // If a cache file was corrupted, do not silently burn unbudgeted calls if cap is reached
    }
  }

  const effectiveCap = allowLivePlacesCalls ? Math.min(maxCalls, HARD_LIVE_PLACES_CALL_CAP) : 0
  if (
    !allowLivePlacesCalls ||
    livePlacesCalls >= effectiveCap ||
    initialPlacesCacheCount + livePlacesCalls >= HARD_TOTAL_CACHE_FILES_CAP
  ) {
    return { places: [], fromCache: false, status: 429 }
  }

  // Synchronous increment BEFORE await fetch guarantees parallel workers can never overshoot effectiveCap
  livePlacesCalls++
  const body: Record<string, unknown> = {
    textQuery,
    pageSize,
    languageCode: "en",
  }
  if (pageToken) body.pageToken = pageToken

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.reviews,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,nextPageToken",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const errTxt = await res.text().catch(() => "")
    console.warn(`[Places API ${res.status}] ${textQuery}: ${errTxt.slice(0, 180)}`)
    return { places: [], fromCache: false, status: res.status }
  }

  const data = (await res.json()) as any
  fs.writeFileSync(cacheFile, JSON.stringify(data), "utf8")
  return {
    places: Array.isArray(data.places) ? data.places : [],
    nextPageToken: typeof data.nextPageToken === "string" ? data.nextPageToken : undefined,
    fromCache: false,
    status: 200,
  }
}

function extractReviews(rawReviews: any): ProspectReviewSnippet[] {
  if (!Array.isArray(rawReviews)) return []
  const out: ProspectReviewSnippet[] = []
  for (const r of rawReviews.slice(0, 5)) {
    const txt = r?.text?.text || r?.originalText?.text || ""
    if (!txt || typeof txt !== "string") continue
    out.push({
      rating: Number(r.rating) || 5,
      author: r?.authorAttribution?.displayName || undefined,
      relativeTime: r?.relativePublishTimeDescription || undefined,
      text: txt.trim().slice(0, 500),
    })
  }
  return out
}

function parseCityStateFromAddress(addr: string | null | undefined, fallbackCity?: string, fallbackState?: string) {
  if (!addr) return { city: fallbackCity ?? null, state: fallbackState ?? null }
  // Typical US formattedAddress: "123 Main St, Austin, TX 78701, USA"
  const parts = addr.split(",").map((p) => p.trim())
  if (parts.length >= 3) {
    const cityPart = parts[parts.length - 3] || fallbackCity || null
    const stateZip = parts[parts.length - 2] || ""
    const m = stateZip.match(/^([A-Z]{2})\b/)
    return {
      city: cityPart,
      state: m ? m[1] : fallbackState ?? null,
    }
  }
  return { city: fallbackCity ?? null, state: fallbackState ?? null }
}

function assignSocialLink(url: string, target: ProspectSocialLinks): void {
  const lower = url.toLowerCase()
  if (lower.includes("instagram.com/") && !target.instagram) target.instagram = url
  else if ((lower.includes("facebook.com/") || lower.includes("fb.com/")) && !target.facebook) target.facebook = url
  else if (lower.includes("linkedin.com/") && !target.linkedin) target.linkedin = url
  else if (lower.includes("tiktok.com/") && !target.tiktok) target.tiktok = url
  else if (lower.includes("youtube.com/") && !target.youtube) target.youtube = url
  else if (lower.includes("yelp.com/") && !target.yelp) target.yelp = url
}

function isExcludedCompanyName(name: string): boolean {
  for (const re of EXCLUDED_NAME_PATTERNS) {
    if (re.test(name)) return true
  }
  return false
}

// Safe web lookup for >50-review businesses missing a GBP website link & FinSMEs startup links
async function safeWebDomainLookup(
  company: string,
  city?: string | null,
  state?: string | null,
  articleSourceUrl?: string | null,
): Promise<{ hostname: string; url: string } | null> {
  const cacheKey = sha1(`lookup:${company}|${city || ""}|${state || ""}|${articleSourceUrl || ""}`)
  const cacheFile = path.join(WEB_LOOKUP_CACHE_DIR, `${cacheKey}.json`)
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
      return cached.result ?? null
    } catch {
      // continue
    }
  }

  const companyTokens = company
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !["llc", "inc", "the", "and", "for", "group", "company", "services"].includes(w))

  // 1. If we have a FinSMEs / funding article URL in CRM notes, parse external links directly from it!
  if (articleSourceUrl && /^https?:\/\//i.test(articleSourceUrl)) {
    try {
      const res = await fetch(articleSourceUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(6000),
      })
      if (res.ok) {
        const html = await res.text()
        const hrefMatches = html.match(/href=["'](https?:\/\/[^"'#\s>]+)["']/gi) || []
        for (const rawHref of hrefMatches) {
          const url = rawHref.replace(/^href=["']|["']$/gi, "")
          if (/finsmes\.com|wp\.com|wordpress|cloudflare|googleapis|gstatic|gravatar|doubleclick/i.test(url)) {
            continue
          }
          const norm = normalizeHostname(url)
          if (!norm.hostname || norm.isSocialOrDirectory || norm.isExcludedChain) continue
          const hostClean = norm.hostname.replace(/[^a-z0-9]/g, "")
          if (companyTokens.length === 0 || companyTokens.some((tok) => hostClean.includes(tok))) {
            const result = { hostname: norm.hostname, url: `https://${norm.hostname}` }
            fs.writeFileSync(cacheFile, JSON.stringify({ result }), "utf8")
            return result
          }
        }
      }
    } catch {
      // fall through
    }
  }

  // 2. Safe DuckDuckGo HTML lookup
  const q = [company, city, state].filter(Boolean).join(" ")
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`
    const res = await fetch(ddgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const html = await res.text()
      const uddgMatches = html.match(/uddg=([^&"'>]+)/g) || []
      for (const m of uddgMatches.slice(0, 8)) {
        const decoded = decodeURIComponent(m.slice(5))
        if (/duckduckgo\.com/i.test(decoded)) continue
        const norm = normalizeHostname(decoded)
        if (!norm.hostname || norm.isSocialOrDirectory || norm.isExcludedChain) continue
        const hostClean = norm.hostname.replace(/[^a-z0-9]/g, "")
        if (companyTokens.some((tok) => hostClean.includes(tok))) {
          const result = { hostname: norm.hostname, url: `https://${norm.hostname}` }
          fs.writeFileSync(cacheFile, JSON.stringify({ result }), "utf8")
          return result
        }
      }
    }
  } catch {
    // fall through
  }

  // 3. Direct brand-slug .com HEAD probe (safe, zero search-engine dependency)
  const slugGuess = company
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(llc|inc|corp|pllc|pc|ltd|co)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
  if (slugGuess.length >= 5 && slugGuess.length <= 32) {
    try {
      const guessUrl = `https://${slugGuess}.com`
      const probe = await fetch(guessUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(3500),
      })
      if (probe.ok) {
        const norm = normalizeHostname(probe.url || guessUrl)
        if (norm.hostname && !norm.isSocialOrDirectory && !norm.isExcludedChain) {
          const result = { hostname: norm.hostname, url: `https://${norm.hostname}` }
          fs.writeFileSync(cacheFile, JSON.stringify({ result }), "utf8")
          return result
        }
      }
    } catch {
      // ignore unreachable guess
    }
  }

  fs.writeFileSync(cacheFile, JSON.stringify({ result: null }), "utf8")
  return null
}

function classifyExistingCrmCohort(row: any): { cohort: ProspectCohort; subCategory: string | null } {
  const tags: string[] = Array.isArray(row.tags) ? row.tags.map((t: unknown) => String(t).toLowerCase()) : []
  const text = `${row.company || ""} ${row.title || ""} ${row.source || ""} ${row.notes || ""} ${tags.join(" ")}`.toLowerCase()

  if (row.source === "YC directory" || row.source === "Funding news" || tags.includes("funded-startup") || tags.includes("yc")) {
    return { cohort: "funded_startups", subCategory: row.source === "YC directory" ? "YC Startup" : "Seed / Funded Startup" }
  }
  if (/med\s*spa|dental|dentist|orthodont|plastic|aesthetic|dermatol/.test(text)) {
    return { cohort: "med_spa_aesthetics", subCategory: "Aesthetics / Dental (CRM)" }
  }
  if (/law\s*firm|attorney|lawyer|legal|injury/.test(text)) {
    return { cohort: "law_firms", subCategory: "Law Firm (CRM)" }
  }
  if (/event\s*venue|wedding|banquet/.test(text)) {
    return { cohort: "event_venues", subCategory: "Event Venue (CRM)" }
  }
  if (/real\s*estate|realty|property\s*management|brokerage/.test(text)) {
    return { cohort: "real_estate", subCategory: "Real Estate (CRM)" }
  }
  if (/auto|wrap|collision|car\s|detailing|tint/.test(text)) {
    return { cohort: "specialty_auto", subCategory: "Specialty Auto (CRM)" }
  }
  if (/solar|roof|hvac|plumb|air\s*conditioning/.test(text)) {
    return { cohort: "home_services_ads", subCategory: "Home Services (CRM)" }
  }
  const catMatch = String(row.notes || "").match(/Category:\s*([^\n]+)/i)
  return {
    cohort: "custom_building",
    subCategory: catMatch ? catMatch[1].trim() : "Custom Doors, Windows & Building (CRM)",
  }
}

async function discoverFromExistingCrm(
  apiKey: string | undefined,
  maxApiCalls: number,
  byDomain: Map<string, DiscoveredProspect>,
): Promise<number> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.warn("DATABASE_URL missing; skipping CRM discovery.")
    return 0
  }
  const sql = neon(dbUrl)
  const rows = (await sql`SELECT * FROM crm_items WHERE kind = 'client' ORDER BY id ASC`) as any[]
  console.log(`[CRM] Loaded ${rows.length} existing client records from Neon crm_items.`)

  let added = 0
  const concurrency = 8
  let idx = 0

  async function worker() {
    while (idx < rows.length) {
      const current = idx++
      const row = rows[current]
      const { cohort, subCategory } = classifyExistingCrmCohort(row)
      const notes = String(row.notes || "")

      // Parse embedded metadata from notes if present
      const ratingMatch = notes.match(/Google rating:\s*([\d.]+)\s*\((\d+)\s*reviews?\)/i)
      let googleRating = ratingMatch ? Number(ratingMatch[1]) : null
      let googleReviewsCount = ratingMatch ? Number(ratingMatch[2]) : null
      const phoneMatch = notes.match(/Phone:\s*([^\n]+)/i)
      const addrMatch = notes.match(/Address:\s*([^\n]+)/i)
      const mapsMatch = notes.match(/Maps:\s*(https?:\/\/[^\s\n]+)/i)
      const sourceUrlMatch = notes.match(/Source:\s*(https?:\/\/[^\s\n]+)/i)

      let googleMapsUrl = mapsMatch ? mapsMatch[1].trim() : null
      let googlePlaceId: string | null = null
      let googleReviewsSample: ProspectReviewSnippet[] = []
      let formattedAddress = addrMatch ? addrMatch[1].trim() : null

      const locParts = String(row.location || "").split(",").map((s) => s.trim()).filter(Boolean)
      let city = locParts[0] || null
      let state = locParts[1] || null

      const seedSocialLinks: ProspectSocialLinks = {}
      if (row.contact_url) assignSocialLink(String(row.contact_url), seedSocialLinks)

      let rawUrl: string | null = row.url ? String(row.url).trim() : null

      // Enrich local Google Maps CRM leads via Places API (New) to capture fresh reviews + missing URLs
      if (apiKey && row.source === "Google Maps scan") {
        const query = `${row.company} ${row.location || ""}`.trim()
        const found = await searchPlacesNew(apiKey, query, maxApiCalls, 1)
        const place = found.places[0]
        if (place) {
          googlePlaceId = place.id ?? null
          if (typeof place.rating === "number") googleRating = place.rating
          if (typeof place.userRatingCount === "number") googleReviewsCount = place.userRatingCount
          if (place.googleMapsUri) googleMapsUrl = place.googleMapsUri
          if (place.formattedAddress) {
            formattedAddress = place.formattedAddress
            const parsed = parseCityStateFromAddress(place.formattedAddress, city ?? undefined, state ?? undefined)
            city = parsed.city
            state = parsed.state
          }
          googleReviewsSample = extractReviews(place.reviews)
          if (!rawUrl && place.websiteUri) {
            rawUrl = place.websiteUri
          }
        }
      }

      let norm = normalizeHostname(rawUrl)
      let websiteStatus: WebsiteStatus = "live"
      let websiteUrl: string | null = norm.cleanUrl

      if (!norm.hostname || norm.isSocialOrDirectory) {
        if (rawUrl && norm.isSocialOrDirectory) {
          assignSocialLink(rawUrl, seedSocialLinks)
        }
        // Try resolving unlinked website (especially for Funding news startups or >50-review local companies)
        const resolved = await safeWebDomainLookup(
          String(row.company),
          city,
          state,
          sourceUrlMatch ? sourceUrlMatch[1] : null,
        )
        if (resolved) {
          norm = normalizeHostname(resolved.url)
          websiteUrl = resolved.url
          websiteStatus = row.source === "Google Maps scan" ? "unlinked_on_gbp" : "live"
        } else {
          websiteStatus = Object.keys(seedSocialLinks).length > 0 ? "social_only_whale" : "missing"
        }
      }

      const domain =
        norm.hostname && !norm.isSocialOrDirectory
          ? norm.hostname
          : `${slugifyCompanyDomain(String(row.company), city, state).replace(/\.local$/, "")}-${row.id}.local`

      const seedEmails: ProspectEmail[] = []
      if (row.contact_email && String(row.contact_email).includes("@")) {
        const addr = String(row.contact_email).trim().toLowerCase()
        const isRole = /^(info|contact|hello|support|sales|admin|office|intake|service|team)@/i.test(addr)
        seedEmails.push({ address: addr, kind: isRole ? "role" : "owner", source: "crm_items" })
      }
      const seedPhones: string[] = []
      if (phoneMatch && phoneMatch[1].trim()) seedPhones.push(phoneMatch[1].trim())

      const existing = byDomain.get(domain)
      if (!existing) {
        byDomain.set(domain, {
          domain,
          company: String(row.company).trim(),
          websiteUrl,
          websiteStatus,
          cohort,
          subCategory,
          city,
          state,
          metro: row.location ? String(row.location) : null,
          formattedAddress,
          googlePlaceId,
          googleRating,
          googleReviewsCount,
          googleMapsUrl,
          googleReviewsSample,
          crmItemId: Number(row.id),
          source: `crm:${row.source || "existing"}`,
          seedEmails,
          seedPhones,
          seedSocialLinks,
          seedNotes: notes.slice(0, 1500) || null,
        })
        added++
      } else if (!existing.crmItemId) {
        existing.crmItemId = Number(row.id)
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  console.log(`[CRM] Prepared ${added} unique CRM client companies (live Places calls used so far: ${livePlacesCalls}).`)
  return added
}

async function discoverFromGooglePlaces(
  apiKey: string,
  maxApiCalls: number,
  targetCohortFilter: string,
  maxPerMetroCell: number,
  minRating: number,
  minReviews: number,
  byDomain: Map<string, DiscoveredProspect>,
): Promise<number> {
  const seenPlaceIds = new Set<string>()
  Array.from(byDomain.values()).forEach((p) => {
    if (p.googlePlaceId) seenPlaceIds.add(p.googlePlaceId)
  })

  const cohortsToRun = ACTIVE_LOCAL_COHORTS.filter(
    (c) => targetCohortFilter === "all" || c.cohort === targetCohortFilter,
  )

  let totalNew = 0

  for (const cohortCfg of cohortsToRun) {
    let cohortAdded = 0
    let cellsWithLeads = 0
    console.log(
      `\n[Places] 50-Metro Sweep for '${cohortCfg.cohort}' (1 Page-1 call/metro, top <=${maxPerMetroCell} w/ website, >=${minRating}★, >=${minReviews} reviews)...`,
    )

    let metroCursor = 0
    const cellConcurrency = 6

    async function cellWorker() {
      while (metroCursor < TOP_50_METROS.length) {
        const metroIdx = metroCursor++
        if (maxApiCalls > 0 && livePlacesCalls >= maxApiCalls) break

        const metro = TOP_50_METROS[metroIdx]
        // Keep queries[0] for metros 0..24 (hits existing cache for 0 API calls) and rotate sub-categories across metros 25..49
        const q =
          metroIdx < 25
            ? cohortCfg.queries[0]
            : cohortCfg.queries[metroIdx % cohortCfg.queries.length]

        const textQuery = `${q.term} in ${metro.city}, ${metro.state}`
        // Strictly 1 Page-1 call (pageSize: 20, zero pagination into Page-2 filler!)
        const res = await searchPlacesNew(apiKey, textQuery, maxApiCalls, 20)
        if (res.places.length === 0) continue

        let cellKept = 0
        for (const place of res.places) {
          if (cellKept >= maxPerMetroCell) break

          const placeId = String(place.id || "")
          const company = String(place.displayName?.text || "").trim()
          if (!company || isExcludedCompanyName(company)) continue

          const rating = typeof place.rating === "number" ? place.rating : null
          const reviewsCount = typeof place.userRatingCount === "number" ? place.userRatingCount : 0

          // Quality gate: >= 3.5★ and > 50 reviews (>= 51)
          if (rating === null || rating < minRating || reviewsCount < minReviews) {
            continue
          }

          // Strictly keep Page-1 winners that have a real standalone website (not social/directory/chain/gov/edu/news)
          const rawWebsite: string | null = place.websiteUri ? String(place.websiteUri).trim() : null
          const norm = normalizeHostname(rawWebsite)
          if (!norm.hostname || norm.isSocialOrDirectory || norm.isExcludedChain) {
            continue
          }

          const domain = norm.hostname
          if ((placeId && seenPlaceIds.has(placeId)) || byDomain.has(domain)) {
            cellKept++
            continue
          }
          if (placeId) seenPlaceIds.add(placeId)

          const { city, state } = parseCityStateFromAddress(
            place.formattedAddress,
            metro.city,
            metro.state,
          )
          const seedPhones: string[] = []
          if (place.nationalPhoneNumber) seedPhones.push(String(place.nationalPhoneNumber).trim())

          byDomain.set(domain, {
            domain,
            company,
            websiteUrl: norm.cleanUrl,
            websiteStatus: "live",
            cohort: cohortCfg.cohort,
            subCategory: q.subCategory,
            city,
            state,
            metro: metro.name,
            formattedAddress: place.formattedAddress ?? null,
            googlePlaceId: placeId || null,
            googleRating: rating,
            googleReviewsCount: reviewsCount,
            googleMapsUrl: place.googleMapsUri ?? null,
            googleReviewsSample: extractReviews(place.reviews),
            crmItemId: null,
            source: "google_places_50metros",
            seedEmails: [],
            seedPhones,
            seedSocialLinks: {},
            seedNotes: null,
          })

          cellKept++
          cohortAdded++
          totalNew++
        }
        if (cellKept > 0) cellsWithLeads++
      }
    }

    await Promise.all(Array.from({ length: cellConcurrency }, () => cellWorker()))

    console.log(
      `[Places] Cohort '${cohortCfg.cohort}': ${cohortAdded} Page-1 website leads across ${cellsWithLeads}/${TOP_50_METROS.length} metros (live API calls used this run: ${livePlacesCalls}/${maxApiCalls}).`,
    )
  }

  return totalNew
}

async function discoverPage2FromCachedTokens(
  apiKey: string,
  maxApiCalls: number,
  targetCohortFilter: string,
  maxPerMetroCell: number,
  minRating: number,
  minReviews: number,
  byDomain: Map<string, DiscoveredProspect>,
): Promise<number> {
  const effectiveCap = Math.min(maxApiCalls, HARD_LIVE_PLACES_CALL_CAP)
  const seenPlaceIds = new Set<string>()
  Array.from(byDomain.values()).forEach((p) => {
    if (p.googlePlaceId) seenPlaceIds.add(p.googlePlaceId)
  })

  const cohortsToRun = ACTIVE_LOCAL_COHORTS.filter(
    (c) => targetCohortFilter === "all" || c.cohort === targetCohortFilter,
  )

  // Metro-major iteration order across 50 Metros x 7 Local Cohorts = 350 cells
  const cells: { metroIdx: number; metro: MetroConfig; cohortCfg: CohortDiscoveryConfig }[] = []
  for (let metroIdx = 0; metroIdx < TOP_50_METROS.length; metroIdx++) {
    for (const cohortCfg of cohortsToRun) {
      cells.push({ metroIdx, metro: TOP_50_METROS[metroIdx], cohortCfg })
    }
  }

  console.log(
    `\n[Places Page-2] Starting Metro-Major Page-2 Challenger Sweep across ${cells.length} cells (0 Page-1 calls; hard live cap <= ${effectiveCap}; >=${minRating}★, >=${minReviews} reviews, <=${maxPerMetroCell} new/cell)...`,
  )

  let cellCursor = 0
  const cellConcurrency = 4
  let totalNewP2 = 0
  let p2CacheHits = 0
  let p1MissingOrNoToken = 0
  let expiredTokens400 = 0
  const cohortNewCounts: Record<string, number> = {}

  async function p2Worker() {
    while (cellCursor < cells.length) {
      const idx = cellCursor++
      const { metroIdx, metro, cohortCfg } = cells[idx]

      const q =
        metroIdx < 25
          ? cohortCfg.queries[0]
          : cohortCfg.queries[metroIdx % cohortCfg.queries.length]

      const textQuery = `${q.term} in ${metro.city}, ${metro.state}`
      const p1CacheKey = sha1(`v1:${textQuery}|20|`)
      const p1CacheFile = path.join(PLACES_CACHE_DIR, `${p1CacheKey}.json`)

      // Strictly read Page-1 nextPageToken from local disk cache (0 Page-1 calls!)
      if (!fs.existsSync(p1CacheFile)) {
        p1MissingOrNoToken++
        continue
      }

      let nextPageToken: string | undefined
      try {
        const p1Parsed = JSON.parse(fs.readFileSync(p1CacheFile, "utf8"))
        if (typeof p1Parsed?.nextPageToken === "string" && p1Parsed.nextPageToken.trim()) {
          nextPageToken = p1Parsed.nextPageToken.trim()
        }
      } catch {
        // skip unreadable Page-1 cache
      }

      if (!nextPageToken) {
        p1MissingOrNoToken++
        continue
      }

      // Check if Page-2 is already cached or if live budget remains
      const p2CacheKey = sha1(`v1:${textQuery}|20|${nextPageToken}`)
      const p2CacheFile = path.join(PLACES_CACHE_DIR, `${p2CacheKey}.json`)
      if (!fs.existsSync(p2CacheFile)) {
        if (
          livePlacesCalls >= effectiveCap ||
          initialPlacesCacheCount + livePlacesCalls >= HARD_TOTAL_CACHE_FILES_CAP
        ) {
          continue
        }
      }

      const res = await searchPlacesNew(apiKey, textQuery, effectiveCap, 20, nextPageToken)
      if (res.fromCache) {
        p2CacheHits++
      } else if (res.status === 400) {
        expiredTokens400++
        console.warn(`[Places Page-2] Expired/invalid nextPageToken (400) for '${textQuery}' — skipped without Page-1 refetch.`)
        continue
      }

      if (res.places.length === 0) continue

      let cellNewKept = 0
      for (const place of res.places) {
        if (cellNewKept >= maxPerMetroCell) break

        const placeId = String(place.id || "")
        const company = String(place.displayName?.text || "").trim()
        if (!company || isExcludedCompanyName(company)) continue

        const rating = typeof place.rating === "number" ? place.rating : null
        const reviewsCount = typeof place.userRatingCount === "number" ? place.userRatingCount : 0

        // Page-2 Challenger quality gate: >= 3.5★ and >= 40 reviews
        if (rating === null || rating < minRating || reviewsCount < minReviews) {
          continue
        }

        const rawWebsite: string | null = place.websiteUri ? String(place.websiteUri).trim() : null
        const norm = normalizeHostname(rawWebsite)
        if (!norm.hostname || norm.isSocialOrDirectory || norm.isExcludedChain) {
          continue
        }

        const domain = norm.hostname
        if ((placeId && seenPlaceIds.has(placeId)) || byDomain.has(domain)) {
          continue
        }
        if (placeId) seenPlaceIds.add(placeId)

        const { city, state } = parseCityStateFromAddress(
          place.formattedAddress,
          metro.city,
          metro.state,
        )
        const seedPhones: string[] = []
        if (place.nationalPhoneNumber) seedPhones.push(String(place.nationalPhoneNumber).trim())

        byDomain.set(domain, {
          domain,
          company,
          websiteUrl: norm.cleanUrl,
          websiteStatus: "live",
          cohort: cohortCfg.cohort,
          subCategory: q.subCategory,
          city,
          state,
          metro: metro.name,
          formattedAddress: place.formattedAddress ?? null,
          googlePlaceId: placeId || null,
          googleRating: rating,
          googleReviewsCount: reviewsCount,
          googleMapsUrl: place.googleMapsUri ?? null,
          googleReviewsSample: extractReviews(place.reviews),
          crmItemId: null,
          source: "google_places_50metros_p2",
          seedEmails: [],
          seedPhones,
          seedSocialLinks: {},
          seedNotes: null,
        })

        cellNewKept++
        totalNewP2++
        cohortNewCounts[cohortCfg.cohort] = (cohortNewCounts[cohortCfg.cohort] || 0) + 1
      }
    }
  }

  await Promise.all(Array.from({ length: cellConcurrency }, () => p2Worker()))

  console.log(
    `[Places Page-2] Added ${totalNewP2} net-new Page-2 Challenger leads | Cache hits: ${p2CacheHits} | Live API calls: ${livePlacesCalls}/${effectiveCap} | No/missing token: ${p1MissingOrNoToken} | Expired 400 tokens: ${expiredTokens400}`,
  )
  console.log("[Places Page-2] New Page-2 leads by cohort:", cohortNewCounts)
  return totalNewP2
}

async function discoverPage3FromCachedTokens(
  apiKey: string,
  maxApiCalls: number,
  targetCohortFilter: string,
  maxPerPage: number,
  minRating: number,
  minReviews: number,
  byDomain: Map<string, DiscoveredProspect>,
): Promise<{ addedP2: number; addedP3: number }> {
  const effectiveCap = Math.min(maxApiCalls, HARD_LIVE_PLACES_CALL_CAP)
  const seenPlaceIds = new Set<string>()
  Array.from(byDomain.values()).forEach((p) => {
    if (p.googlePlaceId) seenPlaceIds.add(p.googlePlaceId)
  })

  const cohortsToRun = ACTIVE_LOCAL_COHORTS.filter(
    (c) => targetCohortFilter === "all" || c.cohort === targetCohortFilter,
  )

  // Metro-major iteration order across 50 Metros x 7 Local Cohorts = 350 cells
  const cells: { metroIdx: number; metro: MetroConfig; cohortCfg: CohortDiscoveryConfig }[] = []
  for (let metroIdx = 0; metroIdx < TOP_50_METROS.length; metroIdx++) {
    for (const cohortCfg of cohortsToRun) {
      cells.push({ metroIdx, metro: TOP_50_METROS[metroIdx], cohortCfg })
    }
  }

  console.log(
    `\n[Places Page-3] Starting Metro-Major Page-2 + Page-3 (#41–#60) Challenger Sweep across ${cells.length} cells on Key #2 (0 Key #1 calls; 0 Page-1 calls; hard live cap <= ${effectiveCap}; >=${minRating}★, >=${minReviews} reviews, <=${maxPerPage} leads/page)...`,
  )

  let cellCursor = 0
  const cellConcurrency = 4
  let addedP2 = 0
  let addedP3 = 0
  let p2CacheHits = 0
  let p2LiveFetched = 0
  let p3CacheHits = 0
  let p3LiveFetched = 0
  let p1MissingOrNoToken = 0
  let p2NoNextToken = 0
  let expiredTokens400 = 0
  const cohortNewP2: Record<string, number> = {}
  const cohortNewP3: Record<string, number> = {}

  function ingestPlacesFromPage(
    places: any[],
    sourceLabel: "google_places_50metros_p2" | "google_places_50metros_p3",
    metro: MetroConfig,
    cohortCfg: CohortDiscoveryConfig,
    subCategory: string,
  ): number {
    let pageQualifyingCount = 0
    let pageNewlyAdded = 0
    for (const place of places) {
      if (pageQualifyingCount >= maxPerPage) break

      const placeId = String(place.id || "")
      const company = String(place.displayName?.text || "").trim()
      if (!company || isExcludedCompanyName(company)) continue

      const rating = typeof place.rating === "number" ? place.rating : null
      const reviewsCount = typeof place.userRatingCount === "number" ? place.userRatingCount : 0
      if (rating === null || rating < minRating || reviewsCount < minReviews) {
        continue
      }

      const rawWebsite: string | null = place.websiteUri ? String(place.websiteUri).trim() : null
      const norm = normalizeHostname(rawWebsite)
      if (!norm.hostname || norm.isSocialOrDirectory || norm.isExcludedChain) {
        continue
      }

      const domain = norm.hostname
      if ((placeId && seenPlaceIds.has(placeId)) || byDomain.has(domain)) {
        pageQualifyingCount++
        continue
      }
      if (placeId) seenPlaceIds.add(placeId)

      const { city, state } = parseCityStateFromAddress(
        place.formattedAddress,
        metro.city,
        metro.state,
      )
      const seedPhones: string[] = []
      if (place.nationalPhoneNumber) seedPhones.push(String(place.nationalPhoneNumber).trim())

      byDomain.set(domain, {
        domain,
        company,
        websiteUrl: norm.cleanUrl,
        websiteStatus: "live",
        cohort: cohortCfg.cohort,
        subCategory,
        city,
        state,
        metro: metro.name,
        formattedAddress: place.formattedAddress ?? null,
        googlePlaceId: placeId || null,
        googleRating: rating,
        googleReviewsCount: reviewsCount,
        googleMapsUrl: place.googleMapsUri ?? null,
        googleReviewsSample: extractReviews(place.reviews),
        crmItemId: null,
        source: sourceLabel,
        seedEmails: [],
        seedPhones,
        seedSocialLinks: {},
        seedNotes: null,
      })

      pageQualifyingCount++
      pageNewlyAdded++
    }
    return pageNewlyAdded
  }

  async function p3Worker() {
    while (cellCursor < cells.length) {
      const idx = cellCursor++
      const { metroIdx, metro, cohortCfg } = cells[idx]

      const q =
        metroIdx < 25
          ? cohortCfg.queries[0]
          : cohortCfg.queries[metroIdx % cohortCfg.queries.length]

      const textQuery = `${q.term} in ${metro.city}, ${metro.state}`
      const p1CacheKey = sha1(`v1:${textQuery}|20|`)
      const p1CacheFile = path.join(PLACES_CACHE_DIR, `${p1CacheKey}.json`)

      // 1. Strictly read Page-1 nextPageToken from local disk cache (0 Page-1 calls!)
      if (!fs.existsSync(p1CacheFile)) {
        p1MissingOrNoToken++
        continue
      }

      let p1NextToken: string | undefined
      try {
        const p1Parsed = JSON.parse(fs.readFileSync(p1CacheFile, "utf8"))
        if (typeof p1Parsed?.nextPageToken === "string" && p1Parsed.nextPageToken.trim()) {
          p1NextToken = p1Parsed.nextPageToken.trim()
        }
      } catch {
        // skip unreadable Page-1 cache
      }

      if (!p1NextToken) {
        p1MissingOrNoToken++
        continue
      }

      // 2. Read cached Page-2 file, OR fetch Page-2 via GOOGLE_MAPS_API_KEY_2 if not yet cached
      const p2CacheKey = sha1(`v1:${textQuery}|20|${p1NextToken}`)
      const p2CacheFile = path.join(PLACES_CACHE_DIR, `${p2CacheKey}.json`)
      if (!fs.existsSync(p2CacheFile)) {
        if (
          livePlacesCalls >= effectiveCap ||
          initialPlacesCacheCount + livePlacesCalls >= HARD_TOTAL_CACHE_FILES_CAP
        ) {
          continue
        }
      }

      const p2Res = await searchPlacesNew(apiKey, textQuery, effectiveCap, 20, p1NextToken)
      if (p2Res.fromCache) {
        p2CacheHits++
      } else if (p2Res.status === 400) {
        expiredTokens400++
        console.warn(`[Places Page-2] Expired/invalid nextPageToken (400) for '${textQuery}' — skipped without Page-1 refetch.`)
        continue
      } else if (p2Res.status === 200) {
        p2LiveFetched++
      } else {
        continue
      }

      if (p2Res.places.length > 0) {
        const newFromP2 = ingestPlacesFromPage(
          p2Res.places,
          "google_places_50metros_p2",
          metro,
          cohortCfg,
          q.subCategory,
        )
        if (newFromP2 > 0) {
          addedP2 += newFromP2
          cohortNewP2[cohortCfg.cohort] = (cohortNewP2[cohortCfg.cohort] || 0) + newFromP2
        }
      }

      // 3. If Page-2 has nextPageToken, read or fetch Page-3 (#41–#60) via GOOGLE_MAPS_API_KEY_2
      const p2NextToken = typeof p2Res.nextPageToken === "string" && p2Res.nextPageToken.trim()
        ? p2Res.nextPageToken.trim()
        : undefined
      if (!p2NextToken) {
        p2NoNextToken++
        continue
      }

      const p3CacheKey = sha1(`v1:${textQuery}|20|${p2NextToken}`)
      const p3CacheFile = path.join(PLACES_CACHE_DIR, `${p3CacheKey}.json`)
      if (!fs.existsSync(p3CacheFile)) {
        if (
          livePlacesCalls >= effectiveCap ||
          initialPlacesCacheCount + livePlacesCalls >= HARD_TOTAL_CACHE_FILES_CAP
        ) {
          continue
        }
      }

      const p3Res = await searchPlacesNew(apiKey, textQuery, effectiveCap, 20, p2NextToken)
      if (p3Res.fromCache) {
        p3CacheHits++
      } else if (p3Res.status === 400) {
        expiredTokens400++
        console.warn(`[Places Page-3] Expired/invalid nextPageToken (400) for '${textQuery}' — skipped without refetch.`)
        continue
      } else if (p3Res.status === 200) {
        p3LiveFetched++
      } else {
        continue
      }

      if (p3Res.places.length > 0) {
        const newFromP3 = ingestPlacesFromPage(
          p3Res.places,
          "google_places_50metros_p3",
          metro,
          cohortCfg,
          q.subCategory,
        )
        if (newFromP3 > 0) {
          addedP3 += newFromP3
          cohortNewP3[cohortCfg.cohort] = (cohortNewP3[cohortCfg.cohort] || 0) + newFromP3
        }
      }
    }
  }

  await Promise.all(Array.from({ length: cellConcurrency }, () => p3Worker()))

  console.log(
    `[Places Page-3] Added ${addedP3} net-new Page-3 leads + ${addedP2} net-new Page-2 leads | P2 (cache=${p2CacheHits}, live=${p2LiveFetched}) | P3 (cache=${p3CacheHits}, live=${p3LiveFetched}) | Live Key #2 calls: ${livePlacesCalls}/${effectiveCap} | P1 missing/no-token: ${p1MissingOrNoToken} | P2 no-token: ${p2NoNextToken} | Expired 400 tokens: ${expiredTokens400}`,
  )
  console.log("[Places Page-3] New Page-2 leads by cohort:", cohortNewP2)
  console.log("[Places Page-3] New Page-3 leads by cohort:", cohortNewP3)
  return { addedP2, addedP3 }
}

async function main() {
  ensureAuditDirs()
  initialPlacesCacheCount = fs.readdirSync(PLACES_CACHE_DIR).filter((f) => f.endsWith(".json")).length

  const isPage3Flag = process.argv.includes("--page3")
  const sourceMode = isPage3Flag ? "places-p3" : parseArg("source", "all") // all | crm | places | places-p2 | places-p3
  const cohortFilter = parseArg("cohort", "all")
  const defaultMaxPerCell = sourceMode === "places-p3" ? "18" : "15"
  const maxPerMetroCell = Number(parseArg("max-per-cell", defaultMaxPerCell)) || Number(defaultMaxPerCell)
  const defaultMaxCalls = sourceMode === "places-p3" ? "420" : "310"
  const rawMaxApiCalls = Number(parseArg("max-api-calls", defaultMaxCalls))
  const maxApiCalls = Math.min(
    HARD_LIVE_PLACES_CALL_CAP,
    Number.isFinite(rawMaxApiCalls) && rawMaxApiCalls >= 0 ? rawMaxApiCalls : HARD_LIVE_PLACES_CALL_CAP,
  )
  const minRating = Number(parseArg("min-rating", "3.5")) || 3.5
  const defaultMinReviews = sourceMode === "places-p3" ? "35" : sourceMode === "places-p2" ? "40" : "51"
  const minReviews = Number(parseArg("min-reviews", defaultMinReviews)) || Number(defaultMinReviews)
  const reset = process.argv.includes("--reset")

  const key1 = (process.env.GOOGLE_MAPS_API_KEY || "").trim()
  const key2 = (process.env.GOOGLE_MAPS_API_KEY_2 || "").trim()
  const apiKey = key2 || key1

  if (sourceMode === "places-p3") {
    if (!key2) {
      throw new Error("GOOGLE_MAPS_API_KEY_2 is required for Page-3 sweep (Key #1 is frozen at 977/1,000 calls).")
    }
    if (key1 && key2 === key1) {
      throw new Error("GOOGLE_MAPS_API_KEY_2 must be distinct from GOOGLE_MAPS_API_KEY so 0 calls hit Key #1.")
    }
  } else if (!apiKey && sourceMode !== "crm") {
    throw new Error("GOOGLE_MAPS_API_KEY_2 or GOOGLE_MAPS_API_KEY is missing in .env.local")
  }

  // Strictly forbid live API calls unless GOOGLE_MAPS_API_KEY_2 (distinct from Key #1) is active
  allowLivePlacesCalls = Boolean(key2 && (!key1 || key2 !== key1))

  const byDomain = new Map<string, DiscoveredProspect>()

  if (!reset && fs.existsSync(DISCOVERED_FILE)) {
    const lines = fs.readFileSync(DISCOVERED_FILE, "utf8").split(/\r?\n/).filter(Boolean)
    let droppedExcluded = 0
    for (const line of lines) {
      try {
        const obj = JSON.parse(line) as DiscoveredProspect
        if (!obj || !obj.domain) continue
        // Preserve 100% of existing discovered records during Page-3 expansion
        if (sourceMode !== "places-p3" && !obj.crmItemId) {
          const check = normalizeHostname(obj.websiteUrl || obj.domain)
          if (!check.hostname || check.isExcludedChain || check.isSocialOrDirectory || isExcludedCompanyName(obj.company)) {
            droppedExcluded++
            continue
          }
        }
        obj.seedEmails = sanitizeProspectEmails(obj.seedEmails || [])
        byDomain.set(obj.domain, obj)
      } catch {
        // ignore malformed line
      }
    }
    console.log(
      `[Resume] Loaded ${byDomain.size} existing discovered records from ${DISCOVERED_FILE}${
        droppedExcluded > 0 ? ` (dropped ${droppedExcluded} excluded gov/edu/news/chain rows)` : ""
      } | Initial Places cache files: ${initialPlacesCacheCount} | Using Key #2 for live calls: ${allowLivePlacesCalls}`,
    )
  }

  if (sourceMode === "all" || sourceMode === "crm") {
    await discoverFromExistingCrm(apiKey, maxApiCalls, byDomain)
  }

  if ((sourceMode === "all" || sourceMode === "places") && apiKey) {
    await discoverFromGooglePlaces(
      apiKey,
      maxApiCalls,
      cohortFilter,
      maxPerMetroCell,
      minRating,
      minReviews,
      byDomain,
    )
  }

  if (sourceMode === "places-p2" && apiKey) {
    await discoverPage2FromCachedTokens(
      apiKey,
      maxApiCalls,
      cohortFilter,
      maxPerMetroCell,
      minRating,
      minReviews,
      byDomain,
    )
  }

  if (sourceMode === "places-p3" && key2) {
    await discoverPage3FromCachedTokens(
      key2,
      maxApiCalls,
      cohortFilter,
      maxPerMetroCell,
      minRating,
      minReviews,
      byDomain,
    )
  }

  // Write deduplicated JSONL output
  const all = Array.from(byDomain.values())
  const outLines = all.map((item) => JSON.stringify(item)).join("\n") + "\n"
  fs.writeFileSync(DISCOVERED_FILE, outLines, "utf8")

  // Print Cohort Summary Table
  const summary: Record<
    string,
    {
      total: number
      fromCrm: number
      page1Places: number
      page2Challengers: number
      page3Challengers: number
      unlinked: number
      socialOnly: number
    }
  > = {}
  for (const p of all) {
    if (!summary[p.cohort]) {
      summary[p.cohort] = {
        total: 0,
        fromCrm: 0,
        page1Places: 0,
        page2Challengers: 0,
        page3Challengers: 0,
        unlinked: 0,
        socialOnly: 0,
      }
    }
    const s = summary[p.cohort]
    s.total++
    if (p.crmItemId) s.fromCrm++
    else if (p.source === "google_places_50metros_p3") s.page3Challengers++
    else if (p.source === "google_places_50metros_p2") s.page2Challengers++
    else s.page1Places++
    if (p.websiteStatus === "unlinked_on_gbp") s.unlinked++
    if (p.websiteStatus === "social_only_whale") s.socialOnly++
  }

  const finalPlacesCacheCount = fs.readdirSync(PLACES_CACHE_DIR).filter((f) => f.endsWith(".json")).length
  console.log(`\n=== Stage 1 Discovery Complete: ${all.length} Total Unique Companies ===`)
  console.table(summary)
  console.log(
    `Live Google Places API calls used this run (Key #2): ${livePlacesCalls} (hard cap: <= ${HARD_LIVE_PLACES_CALL_CAP}; Key #1 calls: 0) | Total cache files: ${finalPlacesCacheCount} (hard cap: <= ${HARD_TOTAL_CACHE_FILES_CAP})`,
  )
  console.log(`Saved to: ${DISCOVERED_FILE}`)
}

main().catch((err) => {
  console.error("Discovery failed:", err)
  process.exit(1)
})
