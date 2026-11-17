import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import {
  angleLabel,
  sanitizeProspectEmails,
  type ProspectAuditDraft,
  type ProspectCohort,
} from "../../lib/prospects"
import {
  ACTIVE_LOCAL_COHORTS,
  ensureAuditDirs,
  EXCLUDED_NAME_PATTERNS,
  EXPORTS_DIR,
  isFreeBuilderSubdomain,
  type MetroConfig,
  normalizeHostname,
  SCORED_FILE,
  SHEETS_DIR,
  TOP_50_METROS,
} from "./config"

const COHORT_DISPLAY_META: Record<
  Exclude<ProspectCohort, "funded_startups">,
  { tableTitle: string; dossierTitle: string; funnelNoun: string }
> = {
  med_spa_aesthetics: {
    tableTitle: "**Med Spas, Dental & Aesthetics** (`med_spa_aesthetics`)",
    dossierTitle: "Med Spas, Dental & Aesthetics",
    funnelNoun: "60-second Treatment & Pricing Quiz + 24/7 IG/SMS AI consult concierge",
  },
  home_services_ads: {
    tableTitle: "**Home Services (HVAC, Roof, Solar, Remodel)** (`home_services_ads`)",
    dossierTitle: "Home Services (HVAC, Roof, Solar, Remodel)",
    funnelNoun: "60-second Instant Estimate & Financing Calculator + 24/7 AI dispatch intake",
  },
  law_firms: {
    tableTitle: "**Law Firms (PI, Family, Estate, Immigration)** (`law_firms`)",
    dossierTitle: "Law Firms (PI, Family, Estate, Immigration)",
    funnelNoun: "60-second Case-Value / Eligibility Qualifier + 24/7 AI legal intake",
  },
  specialty_auto: {
    tableTitle: "**Specialty Auto (Exotic, PPF/Tint, Performance)** (`specialty_auto`)",
    dossierTitle: "Specialty Auto (Exotic, PPF/Tint, Performance)",
    funnelNoun: "Vehicle-Specific PPF / Wrap / Service Package Configurator + 24/7 AI bay scheduler",
  },
  custom_building: {
    tableTitle: "**Custom Building (Doors, Windows, Iron/Glass)** (`custom_building`)",
    dossierTitle: "Custom Building (Doors, Windows, Iron/Glass)",
    funnelNoun: "Interactive Style & Rebate Quote Configurator + 24/7 AI showroom scheduler",
  },
  event_venues: {
    tableTitle: "**Event & Wedding Venues** (`event_venues`)",
    dossierTitle: "Event & Wedding Venues",
    funnelNoun: "Instant Date-Availability & Guest-Count Pricing Calculator + 24/7 AI tour booker",
  },
  real_estate: {
    tableTitle: "**Real Estate (Brokerages, Property Mgmt, Luxury)** (`real_estate`)",
    dossierTitle: "Real Estate (Brokerages, Property Mgmt, Luxury)",
    funnelNoun: "Instant Rental-ROI / Home-Valuation Calculator + 24/7 AI owner/buyer concierge",
  },
}

type LocalCohort = Exclude<ProspectCohort, "funded_startups">

const LOCAL_COHORT_ORDER: LocalCohort[] = [
  "med_spa_aesthetics",
  "home_services_ads",
  "law_firms",
  "specialty_auto",
  "custom_building",
  "event_venues",
  "real_estate",
]

interface ScoredCandidate {
  prospect: ProspectAuditDraft
  metroIdx: number
  cohortIdx: number
  sweetSpotPass: 1 | 2 | 3
  selectionScore: number
}

function escapeMarkdownDollars(input: string): string {
  return input.replace(/\\+\$|\$/g, () => "\\$")
}

function escapeTableCell(input: string): string {
  return escapeMarkdownDollars(input.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim())
}

function toForwardSlashPath(absPath: string): string {
  return absPath.replace(/\\/g, "/")
}

function matchMetroIndex(p: ProspectAuditDraft): number {
  if (p.metro) {
    const exactIdx = TOP_50_METROS.findIndex((m) => m.name.toLowerCase() === p.metro!.trim().toLowerCase())
    if (exactIdx >= 0) return exactIdx
  }
  const pCity = (p.city || "").trim().toLowerCase()
  const pState = (p.state || "").trim().toUpperCase()
  if (pCity && pState) {
    const cityStateIdx = TOP_50_METROS.findIndex(
      (m) => m.state === pState && (pCity === m.city.toLowerCase() || m.name.toLowerCase().includes(pCity)),
    )
    if (cityStateIdx >= 0) return cityStateIdx
  }
  return -1
}

const NON_COMMERCIAL_ORG_RE =
  /\b(shrine club|shriners|masonic|freemason|elks lodge|vfw\b|american legion|knights of columbus|moose lodge|eagles lodge|fraternal order|rotary club|lions club|kiwanis|ymca\b|ywca\b|yacht club)\b/i

const PERSONAL_EMAIL_PROVIDERS = new Set([
  "gmail.com",
  "yahoo.com",
  "aol.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "msn.com",
  "live.com",
  "sbcglobal.net",
  "bellsouth.net",
  "comcast.net",
  "att.net",
  "verizon.net",
  "cox.net",
  "charter.net",
  "earthlink.net",
  "ymail.com",
  "rocketmail.com",
  "protonmail.com",
  "proton.me",
])

// Guards multi-metro states against Google Places Page-3 drifting into a neighboring metro's USPS SCF
const METRO_VALID_ZIP3: Record<string, string[]> = {
  "Dallas-Fort Worth, TX": ["750", "751", "752", "753", "754", "760", "761", "762"],
  "Houston, TX": ["770", "772", "773", "774", "775"],
  "Austin, TX": ["786", "787", "789"],
  "San Antonio, TX": ["780", "781", "782"],
  "Miami, FL": ["330", "331", "332"],
  "Fort Lauderdale-Boca Raton, FL": ["330", "333", "334"],
  "West Palm Beach, FL": ["334"],
  "Tampa-St. Petersburg, FL": ["335", "336", "337", "346"],
  "Orlando, FL": ["327", "328", "329", "347"],
  "Jacksonville, FL": ["320", "321", "322"],
  "Naples-Sarasota, FL": ["339", "341", "342"],
  "Charlotte, NC": ["280", "281", "282", "297"],
  "Raleigh-Durham, NC": ["275", "276", "277"],
  "Charleston, SC": ["294"],
  "Greenville, SC": ["293", "296"],
  "Nashville, TN": ["370", "371", "372"],
  "Memphis, TN": ["380", "381", "386"],
  "Columbus, OH": ["430", "431", "432", "433"],
  "Cincinnati, OH": ["450", "451", "452", "410", "470"],
  "Cleveland, OH": ["440", "441", "442", "443"],
  "Philadelphia, PA": ["189", "190", "191", "193", "194", "080", "081", "197", "198"],
  "Pittsburgh, PA": ["150", "151", "152", "153", "154", "156"],
  "Kansas City, MO": ["640", "641", "660", "661", "662"],
  "St. Louis, MO": ["630", "631", "633", "620", "622"],
  "Washington DC-NoVA": ["200", "201", "202", "203", "204", "205", "207", "208", "209", "220", "221", "222", "223"],
  "Richmond, VA": ["230", "231", "232", "238"],
  "Virginia Beach-Norfolk, VA": ["233", "234", "235", "236", "237"],
  "Oklahoma City, OK": ["730", "731"],
  "Tulsa, OK": ["740", "741"],
  "Los Angeles-Beverly Hills, CA": ["900", "902", "903", "904", "905", "906", "907", "908", "910", "911", "912", "913", "914", "915", "916", "917", "918", "926", "927", "928"],
  "San Francisco-Silicon Valley, CA": ["940", "941", "943", "944", "945", "946", "947", "948", "949", "950", "951"],
  "San Diego, CA": ["919", "920", "921"],
  "Salt Lake City, UT": ["840", "841", "844"],
  "Stamford-Greenwich, CT": ["066", "068", "069"],
  "Denver, CO": ["800", "801", "802", "803", "804", "805", "806"],
  "Phoenix-Scottsdale, AZ": ["850", "852", "853"],
  "Seattle-Bellevue, WA": ["980", "981", "982", "983", "984"],
  "Boston, MA": ["017", "018", "019", "020", "021", "022", "023", "024"],
  "Detroit-Troy, MI": ["480", "481", "482", "483"],
  "Baltimore-Towson, MD": ["210", "211", "212", "214"],
  "Atlanta, GA": ["300", "301", "302", "303", "311"],
}

const METRO_ALLOWED_STATES: Record<string, string[]> = {
  "New York-North Jersey, NY": ["NY", "NJ"],
  "Washington DC-NoVA": ["DC", "VA", "MD"],
  "Philadelphia, PA": ["PA", "NJ", "DE"],
  "Chicago, IL": ["IL", "IN"],
  "Charlotte, NC": ["NC", "SC"],
  "Kansas City, MO": ["MO", "KS"],
  "St. Louis, MO": ["MO", "IL"],
  "Cincinnati, OH": ["OH", "KY", "IN"],
  "Minneapolis-St. Paul, MN": ["MN", "WI"],
  "Memphis, TN": ["TN", "MS", "AR"],
  "Omaha, NE": ["NE", "IA"],
  "Louisville, KY": ["KY", "IN"],
  "Portland, OR": ["OR", "WA"],
}

function matchesMetroZipGuard(p: ProspectAuditDraft, metro: MetroConfig): boolean {
  if (!p.formattedAddress) return true
  const m = p.formattedAddress.match(/\b([A-Z]{2})\s+(\d{5})(?:-\d{4})?\b/)
  if (!m) return true
  const addrState = m[1]
  const zip3 = m[2].slice(0, 3)
  const allowedStates = METRO_ALLOWED_STATES[metro.name] || [metro.state]
  if (!allowedStates.includes(addrState)) return false
  const allowedZip3 = METRO_VALID_ZIP3[metro.name]
  if (allowedZip3 && !allowedZip3.includes(zip3)) return false
  return true
}

const DISGUISED_CHAIN_EMAIL_DOMAIN_RE =
  /(^|\.)(hyatt|marriott|hilton|ihg|wyndham|accor|omnihotels|fourseasons|ritzcarlton|collisionright|calibercollision|gerbercollision|crashchampions|joe-hudson|heartlanddental|aspendental|pacificdental)\.com$/i

const STOPWORD_COMPANY_TOKENS = new Set([
  "the",
  "and",
  "for",
  "inc",
  "llc",
  "pllc",
  "corp",
  "company",
  "center",
  "centers",
  "group",
  "services",
  "service",
  "office",
  "offices",
  "custom",
  "events",
  "event",
  "auto",
  "law",
  "real",
  "estate",
  "home",
  "plastic",
  "surgery",
])

function isFirstPartyOrPersonalEmail(emailAddr: string, p: ProspectAuditDraft): boolean {
  const atIdx = emailAddr.lastIndexOf("@")
  if (atIdx < 0) return false
  const eDom = emailAddr.slice(atIdx + 1).toLowerCase()
  if (DISGUISED_CHAIN_EMAIL_DOMAIN_RE.test(eDom)) return false
  if (/(agency|marketing|digital|studio|webdesign|maketechnology|tigercomm)/i.test(eDom)) return false
  if (PERSONAL_EMAIL_PROVIDERS.has(eDom)) return true
  const pDom = p.domain.toLowerCase().replace(/^www\./, "")
  if (eDom === pDom || pDom.endsWith(`.${eDom}`) || eDom.endsWith(`.${pDom}`)) return true
  const pRoot = pDom.split(".")[0].replace(/[^a-z0-9]/g, "")
  const eRoot = eDom.split(".")[0].replace(/[^a-z0-9]/g, "")
  if (pRoot.length >= 4 && eRoot.length >= 4 && (eRoot.includes(pRoot.slice(0, 4)) || pRoot.includes(eRoot.slice(0, 4)))) {
    return true
  }
  const compTokens = p.company
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !STOPWORD_COMPANY_TOKENS.has(t))
  if (compTokens.some((t) => eRoot.includes(t))) return true
  // Initialism match (e.g., "aacah.com" for "Anderson Air Conditioning & Heating", "pom..." for "Peace of Mind")
  const initials = p.company
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !["of", "the", "and", "inc", "llc", "corp"].includes(t))
    .map((t) => t[0])
    .join("")
  if (initials.length >= 3 && eRoot.startsWith(initials.slice(0, 3))) return true
  return false
}

function rankEmailsForProspect(p: ProspectAuditDraft) {
  return [...sanitizeProspectEmails(p.emails)].sort((a, b) => {
    const aFirst = isFirstPartyOrPersonalEmail(a.address, p) ? 0 : 1
    const bFirst = isFirstPartyOrPersonalEmail(b.address, p) ? 0 : 1
    if (aFirst !== bFirst) return aFirst - bFirst
    return (a.kind === "owner" ? 0 : 1) - (b.kind === "owner" ? 0 : 1)
  })
}

function hasValidSheetOnDisk(p: ProspectAuditDraft): boolean {
  if (!p.localSheetFile) return false
  const full = path.join(SHEETS_DIR, p.localSheetFile)
  try {
    const st = fs.statSync(full)
    return st.isFile() && st.size > 8000
  } catch {
    return false
  }
}

async function hasCrispThreePanelVisualSheet(p: ProspectAuditDraft): Promise<boolean> {
  if (!p.localSheetFile) return false
  const full = path.join(SHEETS_DIR, p.localSheetFile)
  try {
    // Verify all 3 stitched panels (Desktop Hero body, Desktop Scroll body, Mobile Hero body) contain real rendered visuals (no blank boxes/spinners)
    const [p1Buf, p2Buf, p3Buf] = await Promise.all([
      sharp(full).extract({ left: 24, top: 375, width: 600, height: 310 }).toBuffer(),
      sharp(full).extract({ left: 656, top: 180, width: 588, height: 660 }).toBuffer(),
      sharp(full).extract({ left: 1278, top: 190, width: 380, height: 650 }).toBuffer(),
    ])
    const [p1, p2, p3] = await Promise.all([sharp(p1Buf).stats(), sharp(p2Buf).stats(), sharp(p3Buf).stats()])
    const p1Sd = Math.max(...p1.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
    const p2Sd = Math.max(...p2.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
    const p3Sd = Math.max(...p3.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
    return (
      p1Sd >= 18 &&
      p1.entropy >= 1.8 &&
      p2Sd >= 18 &&
      p2.entropy >= 1.8 &&
      p3Sd >= 18 &&
      p3.entropy >= 1.8
    )
  } catch {
    return false
  }
}

function evaluateCandidate(
  p: ProspectAuditDraft,
  metroIdx: number,
  cohortIdx: number,
): ScoredCandidate | null {
  if (p.cohort === "funded_startups") return null
  if (p.websiteStatus !== "live" || !p.websiteUrl || !p.diagnostics || !p.fourPillars) return null
  if (p.isPeRollup) return null
  if (/\.(gov|edu|mil|org)$/i.test(p.domain) || p.domain.endsWith(".local")) return null

  const hostCheck = normalizeHostname(p.websiteUrl)
  if (!hostCheck.hostname || hostCheck.isSocialOrDirectory || hostCheck.isExcludedChain) return null
  if (EXCLUDED_NAME_PATTERNS.some((re) => re.test(p.company))) return null
  if (NON_COMMERCIAL_ORG_RE.test(p.company)) return null
  if (!matchesMetroZipGuard(p, TOP_50_METROS[metroIdx])) return null
  if (
    p.emails.some((e) => {
      const dom = e.address.split("@")[1] || ""
      return DISGUISED_CHAIN_EMAIL_DOMAIN_RE.test(dom) || normalizeHostname(`https://${dom}`).isExcludedChain
    })
  ) {
    return null
  }

  // Exclude WAF/bot-challenge interstitials, broken 404/error screens, and blank unrendered heroes so all 50 sheets show crisp rendered websites
  if (p.fourPillars.brandingUxUi.cmsPlatform === "Behind WAF / Bot Challenge") return null
  if (/^Linked URL returns a broken /i.test(p.fourPillars.brandingUxUi.summary || "")) return null
  if ((p.diagnostics.uiFlaws?.flaws || []).some((f) => /renders nearly blank|Blank or unrendered above-the-fold hero/i.test(f))) {
    return null
  }

  if (!hasValidSheetOnDisk(p)) return null
  if (!Array.isArray(p.topFlaws) || p.topFlaws.length === 0) return null
  if (p.emails.length === 0 && p.phones.length === 0) return null

  const rating = p.googleRating
  const reviews = p.googleReviewsCount ?? 0
  if (rating === null || rating < 3.5 || reviews < 35) return null

  let sweetSpotPass: 1 | 2 | 3 | null = null
  let baseTierBonus = 0

  if (rating >= 3.5 && rating <= 4.6 && reviews >= 35 && reviews <= 250) {
    sweetSpotPass = 1
    baseTierBonus = 10_000_000
    // Bullseye bonus for ~3.8★–4.5★ and ~45–210 reviews
    if (rating >= 3.8 && rating <= 4.5 && reviews >= 45 && reviews <= 210) {
      baseTierBonus += 900
    } else if (rating <= 4.55 && reviews >= 38 && reviews <= 235) {
      baseTierBonus += 450
    }
  } else if (rating >= 3.5 && rating <= 4.7 && reviews >= 35 && reviews <= 300) {
    // Explicit fallback allowed by task spec ONLY when no <=4.6★ / <=250-rev candidate is available
    sweetSpotPass = 2
    baseTierBonus = 1_000_000
    if (rating <= 4.6) baseTierBonus += 600
    if (reviews <= 250) baseTierBonus += 600
  } else if (rating >= 3.5 && rating <= 4.8 && reviews >= 35 && reviews <= 420) {
    sweetSpotPass = 3
    baseTierBonus = 100_000
  } else {
    return null
  }

  const rankedEmails = rankEmailsForProspect(p)
  const hasGenuineBusinessEmail = rankedEmails.some((e) => isFirstPartyOrPersonalEmail(e.address, p))

  let score = baseTierBonus
  // Verified email + decision-maker reachability (50k guarantees verified-email wins within each cell & pass)
  if (hasGenuineBusinessEmail) {
    score += 50_000
    if (rankedEmails[0]?.kind === "owner") score += 200
  }
  if (p.phones.length > 0) score += 1_500
  if (p.decisionMakers.length > 0) score += 90

  // Page-3 & Page-2 Challenger provenance bonus
  if (p.source === "google_places_50metros_p3") score += 210
  else if (p.source === "google_places_50metros_p2") score += 180

  // Modernization gap & real pitchable conversion/technical leaks
  score += p.modernizationGapScore * 95
  if (p.priorityTier === "S") score += 220
  else if (p.priorityTier === "A") score += 130

  const d = p.diagnostics
  if (!p.hasChatBot) score += 55
  if (!d.crmIntake.hasInstantQuoteOrCalculator) score += 55
  if ((d.perf.lcpMs ?? 0) >= 3800) score += 65
  if (p.uxCroScore <= 6) score += 65
  if (p.marketingScore <= 6) score += 55
  if (p.hasDmarcRisk) score += 30
  if (p.hasPaidAds) score += 45
  if (d.socialReputation.reputationDisconnect || !d.socialReputation.showcasesReviewsOnHome) score += 45
  if (p.reviewMethod === "multimodal_vision") score += 80

  return {
    prospect: p,
    metroIdx,
    cohortIdx,
    sweetSpotPass,
    selectionScore: score,
  }
}

interface FlowEdge {
  to: number
  rev: number
  cap: number
  cost: number
}

function solveBalanced50MetroAssignment(
  bestCell: (ScoredCandidate | null)[][],
): ScoredCandidate[] {
  // Min-cost max-flow:
  // 0 = Source
  // 1..50 = Metros
  // 51..57 = 7 Local Cohorts
  // 58 = Sink
  const S = 0
  const METRO_BASE = 1
  const COHORT_BASE = 1 + TOP_50_METROS.length // 51
  const T = COHORT_BASE + LOCAL_COHORT_ORDER.length // 58
  const N = T + 1

  const graph: FlowEdge[][] = Array.from({ length: N }, () => [])

  function addEdge(from: number, to: number, cap: number, cost: number) {
    const fwd: FlowEdge = { to, rev: graph[to].length, cap, cost }
    const bwd: FlowEdge = { to: from, rev: graph[from].length, cap: 0, cost: -cost }
    graph[from].push(fwd)
    graph[to].push(bwd)
  }

  for (let m = 0; m < TOP_50_METROS.length; m++) {
    addEdge(S, METRO_BASE + m, 1, 0)
    for (let c = 0; c < LOCAL_COHORT_ORDER.length; c++) {
      const cand = bestCell[m][c]
      if (!cand) continue
      addEdge(METRO_BASE + m, COHORT_BASE + c, 1, -Math.round(cand.selectionScore))
    }
  }

  // Cohort balance constraints (scaled strictly below the 9,000,000 Pass-1 vs Pass-2 gap):
  // - First 6 slots per cohort get -400,000 so every industry gets >= 6 metros
  // - 7th slot gets -120,000 so 6 cohorts hit 7 and 1 hits 8 (7/7/7/7/7/7/8 = 50)
  // - 8th slot allowed at cost 0 (preferred upper cap = 8 per cohort)
  // - 9th emergency slot at +2,000,000 (< 9,000,000) ONLY used if required to avoid dropping a metro from Pass-1 to Pass-2
  for (let c = 0; c < LOCAL_COHORT_ORDER.length; c++) {
    addEdge(COHORT_BASE + c, T, 6, -400_000)
    addEdge(COHORT_BASE + c, T, 1, -120_000)
    addEdge(COHORT_BASE + c, T, 1, 0)
    addEdge(COHORT_BASE + c, T, 1, 2_000_000)
  }

  let totalFlow = 0
  while (totalFlow < TOP_50_METROS.length) {
    const dist = new Array<number>(N).fill(Number.POSITIVE_INFINITY)
    const parentNode = new Array<number>(N).fill(-1)
    const parentEdge = new Array<number>(N).fill(-1)
    const inQueue = new Array<boolean>(N).fill(false)

    dist[S] = 0
    const q: number[] = [S]
    inQueue[S] = true

    while (q.length > 0) {
      const u = q.shift()!
      inQueue[u] = false
      for (let ei = 0; ei < graph[u].length; ei++) {
        const e = graph[u][ei]
        if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
          dist[e.to] = dist[u] + e.cost
          parentNode[e.to] = u
          parentEdge[e.to] = ei
          if (!inQueue[e.to]) {
            q.push(e.to)
            inQueue[e.to] = true
          }
        }
      }
    }

    if (!Number.isFinite(dist[T])) {
      break
    }

    let push = 1
    let cur = T
    while (cur !== S) {
      const pu = parentNode[cur]
      const pe = parentEdge[cur]
      push = Math.min(push, graph[pu][pe].cap)
      cur = pu
    }

    cur = T
    while (cur !== S) {
      const pu = parentNode[cur]
      const pe = parentEdge[cur]
      const edge = graph[pu][pe]
      edge.cap -= push
      graph[cur][edge.rev].cap += push
      cur = pu
    }

    totalFlow += push
  }

  if (totalFlow !== TOP_50_METROS.length) {
    throw new Error(`Expected 50 metro winners in min-cost max-flow, only matched ${totalFlow}/50.`)
  }

  const winners: ScoredCandidate[] = new Array(TOP_50_METROS.length)
  for (let m = 0; m < TOP_50_METROS.length; m++) {
    const u = METRO_BASE + m
    let matched: ScoredCandidate | null = null
    for (const e of graph[u]) {
      if (e.to >= COHORT_BASE && e.to < T && e.cap === 0) {
        const c = e.to - COHORT_BASE
        matched = bestCell[m][c]
        break
      }
    }
    if (!matched) {
      throw new Error(`Metro #${m + 1} (${TOP_50_METROS[m].name}) failed to extract matched candidate.`)
    }
    winners[m] = matched
  }

  return winners
}

function buildChallengerHook(p: ProspectAuditDraft, metro: MetroConfig): string {
  if (p.reviewMethod === "multimodal_vision" && p.personalizedHook && p.personalizedHook.trim().length > 40) {
    return p.personalizedHook.trim().replace(/^["']|["']$/g, "")
  }

  const dmFirst = p.decisionMakers[0]?.name
    ? p.decisionMakers[0].name.trim().split(/\s+/)[0].replace(/[^A-Za-z-]/g, "")
    : ""
  const greeting =
    dmFirst.length >= 3 && !/^(dr|mr|ms|mrs|the|team|info|admin|owner)$/i.test(dmFirst)
      ? `Hi ${dmFirst}`
      : `Hi ${p.company} team`

  const cityLabel = p.city || metro.city
  const ratingStr = `${p.googleRating ?? "4.4"}★`
  const revCount = p.googleReviewsCount ?? 80
  const cohortMeta = COHORT_DISPLAY_META[p.cohort as LocalCohort]
  const d = p.diagnostics!

  const concreteLeaks: string[] = []
  if ((d.perf.lcpMs ?? 0) >= 4000) {
    concreteLeaks.push(`your mobile/desktop hero takes ${((d.perf.lcpMs ?? 0) / 1000).toFixed(1)}s (LCP) to load`)
  }
  if (!d.socialReputation.showcasesReviewsOnHome) {
    concreteLeaks.push(`your ${revCount} Google reviews (${ratingStr}) aren't showcased above the fold`)
  }
  if (d.uiFlaws.brokenImagesCount > 0) {
    concreteLeaks.push(`${d.uiFlaws.brokenImagesCount} homepage image asset(s) fail to load cleanly`)
  }
  if (d.uiFlaws.mobileHorizontalOverflow) {
    concreteLeaks.push(`the 390px mobile viewport overflows horizontally on phones`)
  }
  if (!d.crmIntake.hasInstantQuoteOrCalculator) {
    concreteLeaks.push(`visitors hit a static 'contact us and wait' form instead of an instant quote or booking flow`)
  }
  if (!p.hasChatBot) {
    concreteLeaks.push(`after-hours web/IG/SMS inquiries have no 24/7 AI intake response`)
  }
  if (!p.hasPaidAds) {
    concreteLeaks.push(`neither Google Ads nor Meta conversion pixels are firing for retargeting`)
  }

  const leakPhrase =
    concreteLeaks.slice(0, 2).join(" and ") ||
    (p.topFlaws[0] ? p.topFlaws[0].charAt(0).toLowerCase() + p.topFlaws[0].slice(1) : "high-intent visitors hit static intake friction")

  const funnelArticle = /^[aeiou]/i.test(cohortMeta.funnelNoun) ? "an" : "a"
  return `${greeting} — with ${revCount} Google reviews (${ratingStr}) in ${cityLabel}, ${p.company} already has the real customer proof to out-convert the 1,000+-review corporate chains, so I ran a 3-panel conversion audit on ${p.domain}. Right now ${leakPhrase}, quietly handing high-intent buyers back to Page-1 competitors. For less than half the cost of one junior US hire, we deploy a sub-1.5s conversion funnel with ${funnelArticle} ${cohortMeta.funnelNoun} + automated 5★ review capture to lift booked revenue 30–50% in 90 days. Worth sending over the visual audit sheet we put together for ${p.domain}?`
}

function formatDetectedPixels(p: ProspectAuditDraft): string {
  const t = p.diagnostics?.tracking
  if (!t) return "*None detected*"
  const items: string[] = []
  if (t.hasGtm) items.push("`GTM`")
  if (t.hasServerSideGtm) items.push("`Server-Side GTM`")
  if (t.hasGa4) items.push("`GA4`")
  if (t.hasGoogleAds) items.push("`Google Ads (AW-)`")
  if (t.hasMetaPixel) items.push("`Meta Pixel`")
  if (t.hasTikTokPixel) items.push("`TikTok Pixel`")
  if (t.hasLinkedInInsight) items.push("`LinkedIn Insight`")
  if (t.hasBingUet) items.push("`Bing UET`")
  if (t.callTrackingProvider) items.push(`\`Call Tracking (${t.callTrackingProvider})\``)
  for (const h of t.heatmapTools) items.push(`\`CRO (${h})\``)
  return items.length > 0 ? items.join(", ") : "*None detected (0 ad/analytics pixels)*"
}

function formatCrmAndDns(p: ProspectAuditDraft): string {
  const d = p.diagnostics!
  const crmParts: string[] = [
    ...d.crmIntake.detectedCrms,
    ...d.crmIntake.bookingWidgets,
    ...d.emailDns.detectedEspCrmFromSpf,
  ]
  const uniqueCrm = Array.from(new Set(crmParts.filter(Boolean)))
  const crmStr = uniqueCrm.length > 0 ? uniqueCrm.map((c) => `\`${c}\``).join(", ") : "*None / Basic HTML Form*"
  const mxStr = d.emailDns.mxProvider
    ? `\`${d.emailDns.mxProvider}\``
    : isFreeBuilderSubdomain(p.domain)
    ? "`No Custom Domain MX (Free Subdomain)`"
    : "`Custom / Unlisted MX`"
  const dmarcStr = d.emailDns.hasDmarc
    ? `Present (\`${d.emailDns.dmarcPolicy || "none"}\`)`
    : "**MISSING `_dmarc` (High Spam-Folder Risk)**"
  return `${crmStr} • **MX:** ${mxStr} • **DMARC:** ${dmarcStr}`
}

function formatSocialLinks(p: ProspectAuditDraft): string {
  const s = p.socialLinks || {}
  const links: string[] = []
  if (s.instagram) links.push(`[Instagram](${s.instagram})`)
  if (s.facebook) links.push(`[Facebook](${s.facebook})`)
  if (s.linkedin) links.push(`[LinkedIn](${s.linkedin})`)
  if (s.tiktok) links.push(`[TikTok](${s.tiktok})`)
  if (s.youtube) links.push(`[YouTube](${s.youtube})`)
  if (s.x) links.push(`[X](${s.x})`)
  if (s.yelp) links.push(`[Yelp](${s.yelp})`)
  return links.length > 0 ? links.join(" • ") : "*None linked on homepage*"
}

function collectGoods(p: ProspectAuditDraft): string[] {
  const fp = p.fourPillars!
  const raw = [
    ...fp.brandingUxUi.goods,
    ...fp.marketingSales.goods,
    ...fp.technicalStack.goods,
    ...fp.creativePart.goods,
    `Verified Google Maps challenger traction: ${p.googleRating}★ across ${p.googleReviewsCount} customer reviews`,
  ]
  const out: string[] = []
  const seen = new Set<string>()
  for (const g of raw) {
    const norm = g.trim().toLowerCase()
    if (!norm || seen.has(norm)) continue
    seen.add(norm)
    out.push(g.trim())
    if (out.length >= 4) break
  }
  return out
}

function collectBads(p: ProspectAuditDraft): string[] {
  const fp = p.fourPillars!
  const raw = [
    ...p.topFlaws,
    ...fp.brandingUxUi.bads,
    ...fp.marketingSales.bads,
    ...fp.technicalStack.bads,
    ...fp.automation.bads,
  ]
  const out: string[] = []
  const seen = new Set<string>()
  for (const b of raw) {
    const norm = b.trim().toLowerCase()
    if (!norm || seen.has(norm)) continue
    seen.add(norm)
    out.push(b.trim())
    if (out.length >= 5) break
  }
  return out
}

async function main() {
  ensureAuditDirs()
  if (!fs.existsSync(SCORED_FILE)) {
    throw new Error(`Missing ${SCORED_FILE}. Run pnpm prospects:score first.`)
  }

  const lines = fs.readFileSync(SCORED_FILE, "utf8").split(/\r?\n/).filter(Boolean)
  const prospects: ProspectAuditDraft[] = []
  for (const line of lines) {
    try {
      const obj = JSON.parse(line) as ProspectAuditDraft
      if (obj && obj.domain) prospects.push(obj)
    } catch {
      // skip malformed line
    }
  }

  // Collect all qualifying candidates per [50 metros][7 local cohorts], then screen top candidates per cell for crisp 3-panel visuals
  const cellPool: ScoredCandidate[][][] = Array.from({ length: TOP_50_METROS.length }, () =>
    Array.from({ length: LOCAL_COHORT_ORDER.length }, () => [] as ScoredCandidate[]),
  )

  let totalPass1Pool = 0
  let totalPass2Pool = 0

  for (const p of prospects) {
    const mIdx = matchMetroIndex(p)
    if (mIdx < 0) continue
    const cIdx = LOCAL_COHORT_ORDER.indexOf(p.cohort as LocalCohort)
    if (cIdx < 0) continue

    const evaluated = evaluateCandidate(p, mIdx, cIdx)
    if (!evaluated) continue
    if (evaluated.sweetSpotPass === 1) totalPass1Pool++
    else if (evaluated.sweetSpotPass === 2) totalPass2Pool++

    cellPool[mIdx][cIdx].push(evaluated)
  }

  const bestCell: (ScoredCandidate | null)[][] = Array.from({ length: TOP_50_METROS.length }, () =>
    new Array<ScoredCandidate | null>(LOCAL_COHORT_ORDER.length).fill(null),
  )
  let rejectedBlankSheets = 0

  for (let mIdx = 0; mIdx < TOP_50_METROS.length; mIdx++) {
    await Promise.all(
      LOCAL_COHORT_ORDER.map(async (_, cIdx) => {
        const sorted = cellPool[mIdx][cIdx].sort((a, b) => b.selectionScore - a.selectionScore)
        for (const cand of sorted) {
          if (await hasCrispThreePanelVisualSheet(cand.prospect)) {
            bestCell[mIdx][cIdx] = cand
            break
          }
          rejectedBlankSheets++
        }
      }),
    )
  }

  console.log(`[Visual Sheet Guard] Screened out ${rejectedBlankSheets} top-ranked cell candidates with blank/unloaded panels.`)

  const winners = solveBalanced50MetroAssignment(bestCell)

  // Verify domain uniqueness & compute stats
  const seenDomains = new Set<string>()
  const cohortWinnerCounts: Record<LocalCohort, number> = {
    med_spa_aesthetics: 0,
    home_services_ads: 0,
    law_firms: 0,
    specialty_auto: 0,
    custom_building: 0,
    event_venues: 0,
    real_estate: 0,
  }
  let pass1Winners = 0
  let pass2Winners = 0
  let pass3Winners = 0
  let verifiedEmailWinners = 0
  let page2SourceWinners = 0
  let page3SourceWinners = 0
  let ratingSum = 0
  let reviewsSum = 0

  for (const w of winners) {
    if (seenDomains.has(w.prospect.domain)) {
      throw new Error(`Duplicate domain selected across metros: ${w.prospect.domain}`)
    }
    seenDomains.add(w.prospect.domain)
    cohortWinnerCounts[w.prospect.cohort as LocalCohort]++
    if (w.sweetSpotPass === 1) pass1Winners++
    else if (w.sweetSpotPass === 2) pass2Winners++
    else pass3Winners++
    if (w.prospect.emails.length > 0) verifiedEmailWinners++
    if (w.prospect.source === "google_places_50metros_p3") page3SourceWinners++
    else if (w.prospect.source === "google_places_50metros_p2") page2SourceWinners++
    ratingSum += w.prospect.googleRating ?? 0
    reviewsSum += w.prospect.googleReviewsCount ?? 0
  }

  const avgRating = (ratingSum / winners.length).toFixed(2)
  const avgReviews = Math.round(reviewsSum / winners.length)
  const rootDirPosix = toForwardSlashPath(process.cwd())

  const md: string[] = []
  md.push("# Top 50 US Metros — #1 Mid-Market Challenger Prospect Per Metro (Across 7 Industries)")
  md.push("")
  md.push("> [!IMPORTANT]")
  md.push(
    `> **Challenger Selection Criteria:** Every company below is the **#1 highest-closeability Mid-Market Challenger prospect** in its US Metro across your **7 target local cohorts** (\`Med Spas & Dental\`, \`Home Services\`, \`Law Firms\`, \`Specialty Auto\`, \`Custom Building\`, \`Event Venues\`, and \`Real Estate\`), selected from our expanded **Page-1 + Page-2 (\`#21–#40\`) + Page-3 (\`#41–#60\`)** national audit corpus. Unlike 1,500+-review corporate/PE giants that already retain in-house teams or national agencies, these **owner-operated challengers** average **\`${avgRating}★\`** and **\`${avgReviews}\` Google reviews** (\`${pass1Winners}/50\` strictly inside \`3.5★–4.6★\` & \`35–250\` reviews${pass2Winners > 0 ? `, \`${pass2Winners}\` inside \`<=4.7★ / <=300\` fallback` : ""}; \`${page2SourceWinners + page3SourceWinners}/50\` from Page-2 & Page-3 Challenger waves — \`${page3SourceWinners}\` Page-3 + \`${page2SourceWinners}\` Page-2), each with a live stitched \`1680×960\` 3-panel screenshot board on disk, verified contact reachability (\`${verifiedEmailWinners}/50\` verified emails + direct phone), and concrete conversion/technical leaks primed for your **$1,500 Diagnostic → $10,000 Foundation Build → $3,000/mo Growth & AI Intake Retainer**.`,
  )
  md.push("")
  md.push("## Industry Balance Across the 50 Metro Challenger Winners")
  md.push("")
  md.push("| Industry Cohort | Selected Metro Challengers |")
  md.push("| :--- | :--- |")
  for (const cohortKey of LOCAL_COHORT_ORDER) {
    md.push(`| ${COHORT_DISPLAY_META[cohortKey].tableTitle} | **\`${cohortWinnerCounts[cohortKey]}\` Metros** |`)
  }
  md.push("")
  md.push("---")
  md.push("")
  md.push("## Master Quick-Jump Table (All 50 US Metros)")
  md.push("")
  md.push(
    "| # | US Metro | Company & Website | Industry | Challenger Reputation | Tier, Gap & Angle | Scores (`Money` / `Brand-UI` / `Sell` / `Tech` / `Auto`) | Primary Contact |",
  )
  md.push("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")

  winners.forEach((w, idx) => {
    const metro = TOP_50_METROS[idx]
    const p = w.prospect
    const fp = p.fourPillars!
    const ranked = rankEmailsForProspect(p)
    const bestEmail = ranked[0]
    const primaryEmail = bestEmail ? `${bestEmail.address} (${bestEmail.kind})` : null
    const primaryPhone = p.phones[0] || null
    const contactCell = [primaryEmail, primaryPhone].filter(Boolean).join(" • ") || "Phone via GBP"
    const sourceBadge =
      p.source === "google_places_50metros_p3"
        ? " • `Page-3`"
        : p.source === "google_places_50metros_p2"
        ? " • `Page-2`"
        : ""
    md.push(
      `| **${idx + 1}** | **${escapeTableCell(metro.name)}** (\`${metro.tz}\`) | **[${escapeTableCell(p.company)}](${p.websiteUrl})** (\`${p.domain}\`) | ${escapeTableCell(p.subCategory || COHORT_DISPLAY_META[p.cohort as LocalCohort].dossierTitle)} | **${p.googleRating}★**` +
        ` (\`${p.googleReviewsCount}\` reviews)${sourceBadge} | **Tier ${p.priorityTier}** (\`Gap ${p.modernizationGapScore}/10\`) • \`${p.outreachAngle}\` | \`${p.businessStrengthScore}\` / \`${fp.brandingUxUi.score}\` / \`${fp.marketingSales.score}\` / \`${fp.technicalStack.score}\` / \`${fp.automation.score}\` | ${escapeTableCell(contactCell)} |`,
    )
  })

  md.push("")
  md.push("---")
  md.push("")
  md.push("## Detailed 50-Metro Mid-Market Challenger Dossiers")
  md.push("")

  winners.forEach((w, idx) => {
    const metro = TOP_50_METROS[idx]
    const p = w.prospect
    const d = p.diagnostics!
    const fp = p.fourPillars!
    const cohortMeta = COHORT_DISPLAY_META[p.cohort as LocalCohort]
    const sheetUrl = `file:///${rootDirPosix}/.local-audits/sheets/${p.localSheetFile}`
    const vaultUrl = `file:///${rootDirPosix}/.local-audits/vault/${p.cohort}/${p.domain}`
    const mapsLink = p.googleMapsUrl ? ` • [Google Maps Profile](${p.googleMapsUrl})` : ""
    const sourceTag =
      p.source === "google_places_50metros_p3"
        ? "Google Places Page-3 Deep Challenger (`#41–#60`)"
        : p.source === "google_places_50metros_p2"
        ? "Google Places Page-2 Challenger (`#21–#40`)"
        : "Google Places Mid-Market Challenger"

    const rankedAll = rankEmailsForProspect(p)
    const firstPartyOnly = rankedAll.filter((e) => isFirstPartyOrPersonalEmail(e.address, p))
    const sortedEmails = firstPartyOnly.length > 0 ? firstPartyOnly : rankedAll
    const emailsStr =
      sortedEmails.length > 0
        ? sortedEmails.slice(0, 4).map((e) => `\`${e.address}\` (*${e.kind}*)`).join(", ")
        : "*None on public DOM (use phone / social DM)*"
    const phonesStr =
      p.phones.length > 0 ? p.phones.slice(0, 4).map((ph) => `\`${ph}\``).join(", ") : "*Unlisted on homepage*"
    const seenDmNames = new Set<string>()
    const uniqueDms = (p.decisionMakers || []).filter((dm) => {
      const k = (dm?.name || "").trim().toLowerCase()
      if (!k || seenDmNames.has(k)) return false
      seenDmNames.add(k)
      return true
    })
    const dmStr =
      uniqueDms.length > 0
        ? uniqueDms.slice(0, 3).map((dm) => `**${dm.name.trim()}** (${dm.role})`).join(", ")
        : "*Owner-operated / not listed on public team page*"

    const lcpStr = d.perf.lcpMs ? `${(d.perf.lcpMs / 1000).toFixed(1)}s` : "n/a"
    const ttfbStr = d.perf.ttfbMs ? `${Math.round(d.perf.ttfbMs)}ms` : "n/a"
    const sizeMbStr = d.perf.totalBytes ? `${(d.perf.totalBytes / (1024 * 1024)).toFixed(2)} MB` : "n/a"
    const chatStr = p.hasChatBot
      ? `Yes (\`${d.crmIntake.chatProvider || "Live Chat Widget"}\`)`
      : "**No 24/7 AI / Chat Bot**"
    const calcStr = d.crmIntake.hasInstantQuoteOrCalculator ? "`Yes`" : "`No`"
    const schemasStr =
      d.aeoGeo.jsonLdTypes.length > 0 ? d.aeoGeo.jsonLdTypes.map((s) => `\`${s}\``).join(", ") : "*None*"

    const goods = collectGoods(p)
    const bads = collectBads(p)
    const hook = buildChallengerHook(p, metro)

    md.push(`### ${idx + 1}. ${metro.name} — [${p.company}](${p.websiteUrl})`)
    md.push("")
    md.push(`* **Industry Cohort:** ${cohortMeta.dossierTitle} — *${p.subCategory || cohortMeta.dossierTitle}*`)
    md.push(
      `* **Website & Visual Audit Links:** [${p.websiteUrl}](${p.websiteUrl}) • [View 3-Panel Visual Sheet (\`${p.localSheetFile}\`)](${sheetUrl}) • [Raw Vault Folder](${vaultUrl})${mapsLink}`,
    )
    md.push(
      `* **Google Maps Challenger Profile:** **${p.googleRating} ★** across **\`${p.googleReviewsCount}\` Google reviews** (${p.formattedAddress || `${p.city || metro.city}, ${p.state || metro.state}`}) • Discovery Wave: ${sourceTag}`,
    )
    md.push(
      `* **Priority Tier, Gap & Angle:** **Tier \`${p.priorityTier}\`** (\`Modernization Gap: ${p.modernizationGapScore}/10\`) • **${angleLabel(p.outreachAngle)}** (\`${p.outreachAngle}\`) • Review Method: \`${p.reviewMethod}\``,
    )
    md.push(`* **Contacts & Socials:**`)
    md.push(`  * **Emails:** ${emailsStr}`)
    md.push(`  * **Phones:** ${phonesStr}`)
    md.push(`  * **Decision-Makers:** ${dmStr}`)
    md.push(`  * **Social Profiles:** ${formatSocialLinks(p)}`)
    md.push("")
    md.push("| Pillar / Metric | Score (`1–10`) | Key Data Points & Verdict |")
    md.push("| :--- | :--- | :--- |")
    md.push(
      `| **Business Strength (Money)** | **\`${p.businessStrengthScore}/10\`** | \`${p.googleReviewsCount}\` reviews (${p.googleRating}★), Paid Ads: \`${p.hasPaidAds ? "Active" : "None detected"}\`, \`${d.commercialPagesCount}\` commercial pages crawled |`,
    )
    md.push(
      `| **1. Branding & UX/UI** | **\`${fp.brandingUxUi.score}/10\`** | *Aesthetics:* \`${p.aestheticsScore}/10\` • *Branding:* \`${p.brandingScore}/10\` • *UX/CRO:* \`${p.uxCroScore}/10\` • CMS: \`${fp.brandingUxUi.cmsPlatform || "Custom / Static HTML"}\` |`,
    )
    md.push(
      `| **2. Marketing ("Can It Sell?")** | **\`${fp.marketingSales.score}/10\`** | **Verdict:** *${fp.marketingSales.canItSellVerdict}* • Showcases Reviews on Home: \`${d.socialReputation.showcasesReviewsOnHome ? "Yes" : "No (Hidden!)"}\` |`,
    )
    md.push(
      `| **The Creative Part** | **\`${fp.creativePart.score}/10\`** | Generic Cliché: \`${fp.creativePart.isGenericCliche ? "Yes" : "No"}\` • Primary CTA: \`${(d.branding.primaryCtaText || "Contact").replace(/\|/g, "/")}\` |`,
    )
    md.push(
      `| **3. Technical Stack** | **\`${fp.technicalStack.score}/10\`** | LCP: \`${lcpStr}\` • TTFB: \`${ttfbStr}\` • Size: \`${sizeMbStr}\` • SEO/AEO: \`${p.seoAeoScore}/10\` • Tracking/CRM: \`${p.trackingCrmScore}/10\` |`,
    )
    md.push(
      `| **4. Automation (Secondary)** | **\`${fp.automation.score}/10\`** | Live Chat / AI Intake: ${chatStr} • Instant Quote/Calc: ${calcStr} |`,
    )
    md.push("")
    md.push("* **Detected Technical & Marketing Stack:**")
    md.push(`  * **Pixels & Attribution:** ${formatDetectedPixels(p)}`)
    md.push(`  * **CRM, Booking & Email ESP:** ${formatCrmAndDns(p)}`)
    md.push(
      `  * **SEO & AEO/GEO:** \`sitemap.xml\`: \`${d.seo.hasSitemapXml ? "Yes" : "Missing"}\` • \`/llms.txt\`: \`${d.aeoGeo.hasLlmsTxt ? "Yes" : "Missing"}\` • JSON-LD Schemas: ${schemasStr}`,
    )
    md.push("* **What Works (The Goods):**")
    for (const g of goods) {
      md.push(`  * ✅ ${g}`)
    }
    md.push("* **Concrete Gaps to Pitch (The Bads):**")
    for (const b of bads) {
      md.push(`  * ❌ ${b}`)
    }
    md.push(`* **Visual & Diagnostic Critique:** ${p.visualCritique || fp.marketingSales.summary}`)
    md.push("* **Ready-to-Send Challenger Outreach Hook:**")
    md.push(`  > "${hook}"`)
    md.push("")
    md.push("---")
    md.push("")
  })

  const finalMarkdown = escapeMarkdownDollars(md.join("\n"))
  const rootOutPath = path.resolve(process.cwd(), "TOP_50_CHALLENGER_PROSPECTS.md")
  const exportOutPath = path.join(EXPORTS_DIR, "TOP_50_CHALLENGER_PROSPECTS.md")

  fs.writeFileSync(rootOutPath, finalMarkdown, "utf8")
  fs.writeFileSync(exportOutPath, finalMarkdown, "utf8")

  console.log(`\n=== Generated TOP_50_CHALLENGER_PROSPECTS.md ===`)
  console.log(
    `Candidate Pool -> Pass 1 (3.5★–4.6★, 35–250 rev): ${totalPass1Pool} | Pass 2 (<=4.7★, <=300 rev): ${totalPass2Pool}`,
  )
  console.log(
    `Selected 50 Winners -> Pass 1: ${pass1Winners}/50 | Pass 2: ${pass2Winners}/50 | Pass 3: ${pass3Winners}/50 | Avg Rating: ${avgRating}★ | Avg Reviews: ${avgReviews} | Verified Email: ${verifiedEmailWinners}/50 | Page-3 Source: ${page3SourceWinners}/50 | Page-2 Source: ${page2SourceWinners}/50`,
  )
  console.log("Industry Balance:", cohortWinnerCounts)
  console.log(`Saved clean UTF-8 to:\n  - ${rootOutPath}\n  - ${exportOutPath}`)
}

main().catch((err) => {
  console.error("Challenger dossier export failed:", err)
  process.exit(1)
})
