import fs from "node:fs"
import path from "node:path"
import type { ProspectCohort, ProspectReviewSnippet } from "../../lib/prospects"

// Auto-load .env.local for standalone CLI scripts without extra dependencies
export function loadLocalEnv(): void {
  const envFiles = [".env.local", ".env.development.local", ".env"]
  for (const name of envFiles) {
    const full = path.resolve(process.cwd(), name)
    if (!fs.existsSync(full)) continue
    const content = fs.readFileSync(full, "utf8")
    const lines = content.split(/\r?\n/)
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line || line.startsWith("#")) continue
      const eq = line.indexOf("=")
      if (eq <= 0) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = val
      }
    }
  }
}

loadLocalEnv()

export const AUDIT_ROOT = path.resolve(process.cwd(), ".local-audits")
export const PLACES_CACHE_DIR = path.join(AUDIT_ROOT, "cache", "places")
export const WEB_LOOKUP_CACHE_DIR = path.join(AUDIT_ROOT, "cache", "weblookup")
export const SHEETS_DIR = path.join(AUDIT_ROOT, "sheets")
export const VAULT_DIR = path.join(AUDIT_ROOT, "vault")
export const W2W_DIR = path.join(AUDIT_ROOT, "w2w-benchmarks")
export const EXPORTS_DIR = path.join(AUDIT_ROOT, "exports")

export const DISCOVERED_FILE = path.join(AUDIT_ROOT, "01-discovered.jsonl")
export const CRAWLED_FILE = path.join(AUDIT_ROOT, "02-crawled.jsonl")
export const SCORED_FILE = path.join(AUDIT_ROOT, "04-scored.jsonl")
export const VISION_OVERRIDES_FILE = path.join(AUDIT_ROOT, "04-vision-overrides.json")

export function ensureAuditDirs(): void {
  const dirs = [
    AUDIT_ROOT,
    PLACES_CACHE_DIR,
    WEB_LOOKUP_CACHE_DIR,
    SHEETS_DIR,
    VAULT_DIR,
    W2W_DIR,
    EXPORTS_DIR,
  ]
  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true })
  }
}

export interface MetroConfig {
  name: string
  city: string
  state: string
  tz: "EST" | "CST" | "MST" | "PST"
}

// Top 50 Wealthy & Growing US Commercial Metros (prioritizing CST & EST hubs + major national markets)
export const TOP_50_METROS: MetroConfig[] = [
  { name: "Dallas-Fort Worth, TX", city: "Dallas", state: "TX", tz: "CST" },
  { name: "Houston, TX", city: "Houston", state: "TX", tz: "CST" },
  { name: "Austin, TX", city: "Austin", state: "TX", tz: "CST" },
  { name: "San Antonio, TX", city: "San Antonio", state: "TX", tz: "CST" },
  { name: "Miami, FL", city: "Miami", state: "FL", tz: "EST" },
  { name: "Fort Lauderdale-Boca Raton, FL", city: "Boca Raton", state: "FL", tz: "EST" },
  { name: "Tampa-St. Petersburg, FL", city: "Tampa", state: "FL", tz: "EST" },
  { name: "Orlando, FL", city: "Orlando", state: "FL", tz: "EST" },
  { name: "Atlanta, GA", city: "Atlanta", state: "GA", tz: "EST" },
  { name: "Charlotte, NC", city: "Charlotte", state: "NC", tz: "EST" },
  { name: "Raleigh-Durham, NC", city: "Raleigh", state: "NC", tz: "EST" },
  { name: "Nashville, TN", city: "Nashville", state: "TN", tz: "CST" },
  { name: "Chicago, IL", city: "Chicago", state: "IL", tz: "CST" },
  { name: "Minneapolis-St. Paul, MN", city: "Minneapolis", state: "MN", tz: "CST" },
  { name: "Columbus, OH", city: "Columbus", state: "OH", tz: "EST" },
  { name: "Indianapolis, IN", city: "Indianapolis", state: "IN", tz: "EST" },
  { name: "Kansas City, MO", city: "Kansas City", state: "MO", tz: "CST" },
  { name: "Washington DC-NoVA", city: "Arlington", state: "VA", tz: "EST" },
  { name: "Boston, MA", city: "Boston", state: "MA", tz: "EST" },
  { name: "Philadelphia, PA", city: "Philadelphia", state: "PA", tz: "EST" },
  { name: "Detroit-Troy, MI", city: "Troy", state: "MI", tz: "EST" },
  { name: "Denver, CO", city: "Denver", state: "CO", tz: "MST" },
  { name: "Phoenix-Scottsdale, AZ", city: "Scottsdale", state: "AZ", tz: "MST" },
  { name: "Las Vegas, NV", city: "Las Vegas", state: "NV", tz: "PST" },
  { name: "Salt Lake City, UT", city: "Salt Lake City", state: "UT", tz: "MST" },
  { name: "New York-North Jersey, NY", city: "New York", state: "NY", tz: "EST" },
  { name: "Stamford-Greenwich, CT", city: "Stamford", state: "CT", tz: "EST" },
  { name: "Baltimore-Towson, MD", city: "Baltimore", state: "MD", tz: "EST" },
  { name: "Richmond, VA", city: "Richmond", state: "VA", tz: "EST" },
  { name: "Virginia Beach-Norfolk, VA", city: "Virginia Beach", state: "VA", tz: "EST" },
  { name: "Jacksonville, FL", city: "Jacksonville", state: "FL", tz: "EST" },
  { name: "Naples-Sarasota, FL", city: "Sarasota", state: "FL", tz: "EST" },
  { name: "West Palm Beach, FL", city: "West Palm Beach", state: "FL", tz: "EST" },
  { name: "Charleston, SC", city: "Charleston", state: "SC", tz: "EST" },
  { name: "Greenville, SC", city: "Greenville", state: "SC", tz: "EST" },
  { name: "Cincinnati, OH", city: "Cincinnati", state: "OH", tz: "EST" },
  { name: "Cleveland, OH", city: "Cleveland", state: "OH", tz: "EST" },
  { name: "Pittsburgh, PA", city: "Pittsburgh", state: "PA", tz: "EST" },
  { name: "Louisville, KY", city: "Louisville", state: "KY", tz: "EST" },
  { name: "St. Louis, MO", city: "St. Louis", state: "MO", tz: "CST" },
  { name: "Milwaukee, WI", city: "Milwaukee", state: "WI", tz: "CST" },
  { name: "Oklahoma City, OK", city: "Oklahoma City", state: "OK", tz: "CST" },
  { name: "Tulsa, OK", city: "Tulsa", state: "OK", tz: "CST" },
  { name: "New Orleans, LA", city: "New Orleans", state: "LA", tz: "CST" },
  { name: "Birmingham, AL", city: "Birmingham", state: "AL", tz: "CST" },
  { name: "Memphis, TN", city: "Memphis", state: "TN", tz: "CST" },
  { name: "Omaha, NE", city: "Omaha", state: "NE", tz: "CST" },
  { name: "Los Angeles-Beverly Hills, CA", city: "Los Angeles", state: "CA", tz: "PST" },
  { name: "San Diego, CA", city: "San Diego", state: "CA", tz: "PST" },
  { name: "Seattle-Bellevue, WA", city: "Bellevue", state: "WA", tz: "PST" },
]

export const TOP_25_METROS = TOP_50_METROS

export const COASTAL_LAKE_METROS: string[] = [
  "Miami, FL",
  "Fort Lauderdale-Boca Raton, FL",
  "Tampa-St. Petersburg, FL",
  "West Palm Beach, FL",
  "Naples-Sarasota, FL",
  "Jacksonville, FL",
  "Charleston, SC",
  "Virginia Beach-Norfolk, VA",
  "New Orleans, LA",
  "Houston, TX",
  "Austin, TX",
  "New York-North Jersey, NY",
  "Stamford-Greenwich, CT",
  "Boston, MA",
  "Baltimore-Towson, MD",
  "Chicago, IL",
  "Milwaukee, WI",
  "Los Angeles-Beverly Hills, CA",
  "San Diego, CA",
  "Seattle-Bellevue, WA",
]

export const TOURISM_OUTDOOR_METROS: string[] = [
  ...COASTAL_LAKE_METROS,
  "Orlando, FL",
  "Las Vegas, NV",
  "Denver, CO",
  "Salt Lake City, UT",
  "Phoenix-Scottsdale, AZ",
  "Nashville, TN",
  "Atlanta, GA",
  "Philadelphia, PA",
]

export interface CohortQueryConfig {
  subCategory: string
  term: string
  maxMetros?: number
  metroNames?: string[]
}

export interface CohortDiscoveryConfig {
  cohort: ProspectCohort
  label: string
  targetNewLeads: number
  queries: CohortQueryConfig[]
  w2wCategories: string[]
  w2wKeywords: string[]
  provenConventions: string[]
  highRoiLever: string
}

export const ACTIVE_LOCAL_COHORTS: CohortDiscoveryConfig[] = [
  {
    cohort: "med_spa_aesthetics",
    label: "Med Spas, Cosmetic Dental & Aesthetics",
    targetNewLeads: 380,
    queries: [
      { subCategory: "Med Spa & Aesthetics", term: "medical spa aesthetics clinic" },
      { subCategory: "Cosmetic & Implant Dentistry", term: "cosmetic dentist dental implants" },
      { subCategory: "Plastic Surgery & Body Contouring", term: "plastic surgery center medspa" },
    ],
    w2wCategories: ["beauty_skincare", "beauty_services", "dental_services"],
    w2wKeywords: ["skincare", "dental", "aesthetic"],
    provenConventions: [
      "Real before/after gallery & provider credentials visible early",
      "Frictionless online consultation / treatment booking CTA",
      "Transparent monthly financing (Cherry / CareCredit) & new-patient offer",
    ],
    highRoiLever:
      "24/7 IG/FB/Web consultation booking assistant + instant treatment-finder funnel & automated post-visit review engine",
  },
  {
    cohort: "home_services_ads",
    label: "Solar, Roofing, Remodeling, Plumbing & HVAC",
    targetNewLeads: 380,
    queries: [
      { subCategory: "Roofing & Storm Restoration", term: "roofing contractor roof replacement" },
      { subCategory: "HVAC & Plumbing", term: "HVAC air conditioning plumbing company" },
      { subCategory: "Solar & Energy Storage", term: "solar panel installation company" },
    ],
    w2wCategories: ["diy_home_improvement", "energy_storage_solutions", "instant_quote_services"],
    w2wKeywords: ["solar", "roof", "home"],
    provenConventions: [
      "Immediate service-area proximity, 24/7 phone click-to-call & fast dispatch promise",
      "100+ Google review badge, licensing/insurance proof, and $0-down financing above the fold",
      "30-second instant roof/HVAC/solar estimate request without 10-field friction",
    ],
    highRoiLever:
      "60-second instant-estimate funnel + missed-call/after-hours AI dispatch & Google Ads/Meta call-tracked lead capture",
  },
  {
    cohort: "law_firms",
    label: "Law Firms (PI, Immigration, Family, Estate)",
    targetNewLeads: 380,
    queries: [
      { subCategory: "Personal Injury Law", term: "personal injury law firm attorney" },
      { subCategory: "Immigration & Family Law", term: "immigration divorce family law firm" },
      { subCategory: "Estate Planning & Business Law", term: "estate planning probate law firm" },
    ],
    w2wCategories: ["business_services", "high_ticket_sales"],
    w2wKeywords: ["legal", "lawyer", "claim"],
    provenConventions: [
      "Clear case verdicts/settlements or client review proof above the fold",
      "Bilingual / 24-hour confidential case-evaluation intake",
      "Dedicated practice-area pages structured for local search & AI answers (FAQ schema)",
    ],
    highRoiLever:
      "24/7 confidential AI case-intake qualifier (web + SMS/social) + local SEO/AEO practice-area architecture",
  },
  {
    cohort: "specialty_auto",
    label: "Specialty Auto, Wraps, PPF & Collision",
    targetNewLeads: 380,
    queries: [
      { subCategory: "PPF, Vinyl Wraps & Ceramic Coating", term: "car wrap paint protection film ceramic coating" },
      { subCategory: "Exotic & European Auto Repair", term: "european exotic performance auto repair shop" },
      { subCategory: "Custom Collision & Restyling", term: "auto body collision repair custom shop" },
    ],
    w2wCategories: ["auto_accessories", "instant_quote_services"],
    w2wKeywords: ["car", "auto", "detail"],
    provenConventions: [
      "Crisp shop portfolio photos of real vehicles (PPF/wraps/exotics) + warranty badges (XPEL/3M)",
      "Fast vehicle-model quote builder instead of generic 'email us' contact form",
      "Strong Google star rating & Instagram showcase synced directly on homepage",
    ],
    highRoiLever:
      "Interactive vehicle-package quote builder + automated IG DM / web quote follow-up & Meta local enthusiast ads",
  },
  {
    cohort: "custom_building",
    label: "Custom Doors, Windows & Luxury Building",
    targetNewLeads: 370,
    queries: [
      { subCategory: "Custom Iron & Entry Doors", term: "custom doors iron doors window replacement" },
      { subCategory: "Luxury Kitchen, Bath & Home Remodeling", term: "luxury home remodeling kitchen bath contractor" },
      { subCategory: "Custom Pools & Outdoor Living", term: "custom pool builder outdoor living contractor" },
    ],
    w2wCategories: ["diy_home_improvement", "high_ticket_sales"],
    w2wKeywords: ["remodel", "window", "custom"],
    provenConventions: [
      "High-resolution project gallery organized by style + showroom/local service trust",
      "Clear design-consultation / in-home measurement booking flow + financing options",
      "Verified homeowner reviews & warranty guarantees prominent on landing pages",
    ],
    highRoiLever:
      "Visual project-style estimator + CRM automated follow-up sequence & showroom consultation booking engine",
  },
  {
    cohort: "event_venues",
    label: "Event Venues, Wedding & Banquet Spaces",
    targetNewLeads: 370,
    queries: [
      { subCategory: "Wedding & Reception Venues", term: "wedding venue event space" },
      { subCategory: "Corporate & Luxury Banquet Venues", term: "banquet hall corporate event venue" },
    ],
    w2wCategories: ["high_ticket_sales", "instant_quote_services"],
    w2wKeywords: ["event", "wedding", "venue"],
    provenConventions: [
      "Emotional high-res venue gallery + clear guest capacity & package/pricing guide download",
      "1-click private tour scheduler (instead of waiting 48 hours for an email reply)",
      " prominent 5-star couple/corporate reviews & transparent amenities list",
    ],
    highRoiLever:
      "Instant pricing-brochure unlock + automated private-tour calendar booking & 24/7 IG/Web date-availability assistant",
  },
  {
    cohort: "real_estate",
    label: "Real Estate Teams, Brokerages & Property Mgmt",
    targetNewLeads: 370,
    queries: [
      { subCategory: "Boutique Real Estate Brokerage & Luxury Teams", term: "luxury real estate brokerage group" },
      { subCategory: "Residential & Commercial Property Management", term: "property management company real estate" },
    ],
    w2wCategories: ["high_ticket_sales", "business_services"],
    w2wKeywords: ["property", "home", "estate"],
    provenConventions: [
      "Local neighborhood authority, sold/managed portfolio stats & Google client reviews",
      "Instant home-valuation / rental-ROI calculator lead magnet",
      "Fast mobile listing/owner-portal UX with instant SMS/chat response",
    ],
    highRoiLever:
      "Interactive home-valuation / owner-rental-estimate funnel + CRM speed-to-lead automation & local Meta retargeting",
  },
  {
    cohort: "healthcare_clinics",
    label: "Dental, Vet, Chiro & PT Clinics",
    targetNewLeads: 900,
    queries: [
      { subCategory: "Emergency & Specialty Veterinary", term: "emergency vet animal hospital veterinary clinic", maxMetros: 40 },
      { subCategory: "Cosmetic, Implant & Ortho Dentistry", term: "cosmetic dentist dental implants orthodontist", maxMetros: 40 },
      { subCategory: "Chiropractic, PT & Pain Clinics", term: "chiropractor physical therapy pain clinic", maxMetros: 40 },
    ],
    w2wCategories: ["dental_services", "health_wellness"],
    w2wKeywords: ["dental", "vet", "clinic"],
    provenConventions: [
      "Clear insurance/financing accepted badges & new-patient intro offer above the fold",
      "Direct online booking or 60-second symptom/appointment triage without phone hold loops",
      "Doctor/vet credentials + 100+ local Google patient/pet-parent reviews featured early",
    ],
    highRoiLever:
      "24/7 Web/SMS/IG AI patient triage & appointment-booking assistant + insurance Q&A & automated missed-call rescue",
  },
  {
    cohort: "longevity_specialty_med",
    label: "Fertility, LASIK, Hair & Longevity Clinics",
    targetNewLeads: 750,
    queries: [
      { subCategory: "Fertility & IVF Clinics", term: "fertility clinic IVF reproductive center", maxMetros: 30 },
      { subCategory: "Hair Transplant & Restoration", term: "hair transplant hair restoration clinic", maxMetros: 30 },
      { subCategory: "LASIK & Refractive Eye Centers", term: "LASIK eye surgery vision center", maxMetros: 30 },
      { subCategory: "TRT, Hormone & Medical Weight Loss", term: "hormone replacement TRT longevity weight loss clinic", maxMetros: 30 },
    ],
    w2wCategories: ["beauty_services", "health_wellness", "high_ticket_sales"],
    w2wKeywords: ["fertility", "lasik", "hormone"],
    provenConventions: [
      "Discreet, fast eligibility quiz ('Am I a candidate?') + monthly financing breakdown",
      "Surgeon/MD authority bio, clinical outcomes proof, and real patient transformations",
      "Private 24/7 consultation scheduler for late-night researchers",
    ],
    highRoiLever:
      "24/7 discreet AI candidacy & financing qualifier + instant private consultation booking (Web + IG/FB)",
  },
  {
    cohort: "urgent_home_dispatch",
    label: "24/7 Urgent Home Dispatch & Pest",
    targetNewLeads: 1000,
    queries: [
      { subCategory: "Water, Fire & Mold Restoration", term: "water damage mold restoration 24 hour", maxMetros: 40 },
      { subCategory: "24/7 Emergency HVAC & Plumbing", term: "24 hour emergency HVAC plumbing repair", maxMetros: 40 },
      { subCategory: "Garage Door Repair & Installation", term: "garage door repair installation service", maxMetros: 35 },
      { subCategory: "Pest & Termite Control", term: "pest control termite exterminator company", maxMetros: 35 },
    ],
    w2wCategories: ["diy_home_improvement", "instant_quote_services"],
    w2wKeywords: ["emergency", "repair", "pest"],
    provenConventions: [
      "Sticky 24/7 live dispatch promise, response-time SLA, and local service-area ZIP checker",
      "Instant issue triage & ballpark repair/service estimate instead of generic email forms",
      "100+ local Google reviews, licensing/insurance proof, and upfront dispatch fee clarity",
    ],
    highRoiLever:
      "24/7 AI emergency dispatch & SMS missed-call textback + 60-second ZIP/issue quote & crew booking bot",
  },
  {
    cohort: "moving_cleaning",
    label: "Moving, Storage & Commercial Cleaning",
    targetNewLeads: 750,
    queries: [
      { subCategory: "Local & Long-Distance Moving", term: "moving company long distance movers", maxMetros: 40 },
      { subCategory: "Commercial & Post-Construction Cleaning", term: "commercial janitorial post construction cleaning", maxMetros: 35 },
      { subCategory: "Junk Removal & Dumpster Rental", term: "junk removal hauling dumpster rental", maxMetros: 35 },
    ],
    w2wCategories: ["instant_quote_services", "business_services"],
    w2wKeywords: ["moving", "cleaning", "quote"],
    provenConventions: [
      "Instant room/sqft/truck-load ballpark estimator without waiting 24 hours for a callback",
      "Transparent insurance, licensing/DOT numbers, and damage-protection guarantee",
      "Fast date-availability checker + recurring/commercial walkthrough scheduler",
    ],
    highRoiLever:
      "Interactive move-size / sqft instant quote chatbot + 24/7 crew-availability & walkthrough scheduler",
  },
  {
    cohort: "hospitality_rentals",
    label: "Charters, Exotic Cars, Cabins & Tours",
    targetNewLeads: 750,
    queries: [
      { subCategory: "Yacht & Boat Charters", term: "yacht charter boat rental", metroNames: COASTAL_LAKE_METROS },
      { subCategory: "Exotic & Luxury Car Rentals", term: "exotic luxury car rental", maxMetros: 25 },
      { subCategory: "Limousine, Party Bus & Sprinter Charters", term: "limousine party bus charter rental", maxMetros: 30 },
      { subCategory: "Direct-Booking Vacation Rentals & Cabins", term: "vacation rental property management cabin rentals", metroNames: TOURISM_OUTDOOR_METROS },
      { subCategory: "Fishing Charters & Guided Adventure Tours", term: "fishing charter guided adventure tours", maxMetros: 25, metroNames: TOURISM_OUTDOOR_METROS },
    ],
    w2wCategories: ["high_ticket_sales", "instant_quote_services"],
    w2wKeywords: ["charter", "rental", "tour"],
    provenConventions: [
      "Crisp fleet/property photography with guest capacity, rates, and departure rules clear upfront",
      "Real-time date availability & instant group-package quote without slow email back-and-forth",
      "Direct-booking incentive + verified 5-star TripAdvisor/Google guest proof",
    ],
    highRoiLever:
      "24/7 Web + Instagram DM AI concierge for instant date availability, group pricing & deposit booking",
  },
  {
    cohort: "pet_resorts_grooming",
    label: "Luxury Pet Resorts & Mobile Grooming",
    targetNewLeads: 550,
    queries: [
      { subCategory: "Luxury Dog Boarding & Daycare Resorts", term: "luxury dog boarding pet resort doggy daycare", maxMetros: 40 },
      { subCategory: "Mobile Pet & Dog Grooming", term: "mobile dog pet grooming service", maxMetros: 40 },
    ],
    w2wCategories: ["instant_quote_services", "beauty_services"],
    w2wKeywords: ["pet", "grooming", "boarding"],
    provenConventions: [
      "Clear vaccine requirements, suite/webcam tour photos, and breed/size pricing clarity",
      "Self-serve temperament evaluation & holiday/weekend boarding availability booking",
      "Verified pet-parent Google reviews & recurring grooming subscription CTA",
    ],
    highRoiLever:
      "24/7 AI pet-parent intake bot answering vaccine/pricing Q&A + instant suite/van booking & rebooking reminders",
  },
  {
    cohort: "academies_fitness",
    label: "Boutique Fitness, Swim & Private Schools",
    targetNewLeads: 800,
    queries: [
      { subCategory: "Pilates, Barre & Boutique Fitness", term: "pilates reformer boutique fitness studio", maxMetros: 35 },
      { subCategory: "Martial Arts, BJJ & MMA Academies", term: "martial arts BJJ MMA karate academy", maxMetros: 35 },
      { subCategory: "Swim Schools & Private Montessori Preschools", term: "swim school private montessori preschool", maxMetros: 35 },
      { subCategory: "Flight, Trade & Vocational Academies", term: "flight school trade vocational academy", maxMetros: 25 },
    ],
    w2wCategories: ["health_wellness", "business_services"],
    w2wKeywords: ["fitness", "school", "academy"],
    provenConventions: [
      "Clear class schedule, age/skill-level placement guide, and low-friction intro trial pass or campus tour",
      "Transparent program tuition/membership cues & instructor safety credentials",
      "Parent/student review proof + SMS/IG instant follow-up on trial inquiries",
    ],
    highRoiLever:
      "24/7 Web & IG DM AI class-matcher & trial/campus-tour booking bot + automated no-show/enrollment follow-up",
  },
  {
    cohort: "event_vendors",
    label: "Wedding Catering, Photo/AV & Rentals",
    targetNewLeads: 750,
    queries: [
      { subCategory: "Luxury Wedding & Event Catering", term: "luxury wedding event catering", maxMetros: 35 },
      { subCategory: "Wedding Photography, Video & AV Production", term: "wedding photography videography DJ AV production", maxMetros: 35 },
      { subCategory: "Event Tent, Lounge & Bridal Boutiques", term: "event tent furniture rental bridal boutique", maxMetros: 40 },
    ],
    w2wCategories: ["high_ticket_sales", "instant_quote_services"],
    w2wKeywords: ["wedding", "catering", "rental"],
    provenConventions: [
      "Editorial portfolio / sample tasting menus + transparent starting-package tiers",
      "Instant wedding/event date-availability & guest-count estimator instead of 48-hour inbox waits",
      "Prominent Knot/Google couple testimonials & fast tasting/bridal-appointment scheduler",
    ],
    highRoiLever:
      "24/7 IG DM & Web date-availability + guest-count package concierge that books tastings/consults automatically",
  },
]

// Social, link-in-bio, booking marketplaces & directory hosts (NOT standalone company domains)
export const SOCIAL_OR_DIRECTORY_HOSTS = new Set<string>([
  "instagram.com",
  "facebook.com",
  "m.facebook.com",
  "fb.com",
  "linktr.ee",
  "beacons.ai",
  "bio.site",
  "vagaro.com",
  "glossgenius.com",
  "styleseat.com",
  "booksire.com",
  "booksy.com",
  "fresha.com",
  "mindbodyonline.com",
  "yelp.com",
  "tiktok.com",
  "youtube.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
  "google.com",
  "maps.google.com",
  "sites.google.com",
  "theknot.com",
  "weddingwire.com",
  "eventective.com",
  "peerspace.com",
  "zola.com",
  "zillow.com",
  "realtor.com",
  "redfin.com",
  "trulia.com",
  "apartments.com",
  "loopnet.com",
  "angi.com",
  "homeadvisor.com",
  "thumbtack.com",
  "houzz.com",
  "bbb.org",
  "nextdoor.com",
  "avvo.com",
  "justia.com",
  "findlaw.com",
  "martindale.com",
  "superlawyers.com",
  "healthgrades.com",
  "zocdoc.com",
  "realself.com",
  "carfax.com",
  "cars.com",
  "autotrader.com",
  "boatsetter.com",
  "getmyboat.com",
  "viator.com",
  "getyourguide.com",
  "tripadvisor.com",
  "classpass.com",
  "care.com",
  "bark.com",
  "weddingpro.com",
])

// National corporate chains / mega-franchises to exclude (we target independent/regional $1M-$30M businesses)
export const EXCLUDED_CHAIN_DOMAINS = new Set<string>([
  "idealimage.com",
  "laseraway.com",
  "milanlaser.com",
  "sonobello.com",
  "aspendental.com",
  "heartland.com",
  "pacificdentalservices.com",
  "affordabledentures.com",
  "western-dental.com",
  "handandstone.com",
  "massageenvy.com",
  "europeanwaxcenter.com",
  "orangetheory.com",
  "sunrun.com",
  "tesla.com",
  "adt.com",
  "vivint.com",
  "homedepot.com",
  "lowes.com",
  "menards.com",
  "pella.com",
  "andersenwindows.com",
  "renewalbyandersen.com",
  "windowworld.com",
  "championwindow.com",
  "leaffilter.com",
  "eriehome.com",
  "ars.com",
  "onehourheatandair.com",
  "benjaminfranklinplumbing.com",
  "mrrooter.com",
  "rotorooter.com",
  "servpro.com",
  "servicemaster.com",
  "StanleySteemer.com".toLowerCase(),
  "trugreen.com",
  "terminix.com",
  "orkin.com",
  "caliber.com",
  "calibercollision.com",
  "gerbercollision.com",
  "crashchampions.com",
  "serviceking.com",
  "maaco.com",
  "safelite.com",
  "meineke.com",
  "midas.com",
  "jiffylube.com",
  "valvoline.com",
  "firestonecompleteautocare.com",
  "goodyearautoservice.com",
  "pepboys.com",
  "discounttire.com",
  "tintworld.com",
  "ziebart.com",
  "forthepeople.com",
  "morganandmorgan.com",
  "legalzoom.com",
  "rocketlawyer.com",
  "kw.com",
  "remax.com",
  "coldwellbanker.com",
  "coldwellbankerhomes.com",
  "century21.com",
  "compass.com",
  "sothebysrealty.com",
  "bhhs.com",
  "exprealty.com",
  "elliman.com",
  "weichert.com",
  "longandfoster.com",
  "cbre.com",
  "jll.com",
  "colliers.com",
  "cushmanwakefield.com",
  "greystar.com",
  "invitationhomes.com",
  "marriott.com",
  "hilton.com",
  "hyatt.com",
  "ihg.com",
  "omnihotels.com",
  "fourseasons.com",
  "invitedclubs.com",
  "clubcorp.com",
  "daveandbusters.com",
  "topgolf.com",
  "mainevent.com",
  "bowlero.com",
  "maggianos.com",
  "ruthschris.com",
  "thecapitalgrille.com",
  "1stclassrealestate.com",
  "1stclassre.com",
  "evrealestate.com",
  "porsche.com",
  "turbotint.com",
  "theaestheticsloungeandspa.com",
  "828venues.com",
  "lutherauto.com",
  "duraservcorp.com",
  "vcahospitals.com",
  "banfield.com",
  "bluepearlvet.com",
  "thrivepetcare.com",
  "lasikplus.com",
  "bosley.com",
  "puroclean.com",
  "belfor.com",
  "precisiondoor.net",
  "orkin.com",
  "twomenandatruck.com",
  "uhaul.com",
  "pods.com",
  "publicstorage.com",
  "extraspace.com",
  "cubesmart.com",
  "1800gotjunk.com",
  "collegehunkshaulingjunk.com",
  "jani-king.com",
  "coverall.com",
  "enterprise.com",
  "hertz.com",
  "avis.com",
  "turo.com",
  "airbnb.com",
  "vrbo.com",
  "vacasa.com",
  "evolve.com",
  "rover.com",
  "wagwalking.com",
  "dogtopia.com",
  "campbowwow.com",
  "clubpilates.com",
  "purebarre.com",
  "solidcore.co",
  "barrys.com",
  "kindercare.com",
  "brighthorizons.com",
  "goddardschool.com",
  "primroseschools.com",
  "davidsbridal.com",
  "cort.com",
])

export const EXCLUDED_NAME_PATTERNS: RegExp[] = [
  /\b(walmart|home depot|lowe'?s|costco|target|ikea|menards)\b/i,
  /\b(caliber collision|gerber collision|safelite|jiffy lube|pep boys|midas|maaco|meineke|discount tire|turbo tint|luther automotive)\b/i,
  /\b(aspen dental|ideal image|laseraway|milan laser|sono bello|massage envy|european wax|aesthetics lounge and spa)\b/i,
  /\b(vca\b|banfield|bluepearl|lasikplus|bosley|two men and a truck|u-haul|public storage|extra space storage|cubesmart|1-800-got-junk|college hunks|precision garage door|puroclean|belfor|jani-king)\b/i,
  /\b(club pilates|pure barre|kindercare|bright horizons|goddard school|primrose school|dogtopia|camp bow wow|david'?s bridal|enterprise rent-a-car|hertz|vacasa)\b/i,
  /\b(morgan\s*&\s*morgan)\b/i,
  /\b(marriott|hilton|hyatt|sheraton|westin|holiday inn|courtyard by|embassy suites|ritz-carlton)\b/i,
  /\b(keller williams|re\/max|coldwell banker|century 21|berkshire hathaway|sotheby'?s|cbre|greystar|1st class real estate|engel\s*&\s*v[oö]lkers)\b/i,
  /\b(roto-rooter|mr\.\s*rooter|servpro|one hour heating|benjamin franklin plumbing|renewal by andersen|window world|leaffilter|sunrun|duraserv|a division of)\b/i,
]

export const NON_COMMERCIAL_OR_NEWS_HOSTS = new Set<string>([
  "tmj4.com",
  "patch.com",
  "nytimes.com",
  "forbes.com",
  "bloomberg.com",
  "usatoday.com",
  "cnn.com",
  "foxnews.com",
  "nbcnews.com",
  "cbsnews.com",
  "go.com",
  "chicagotribune.com",
  "latimes.com",
  "miamiherald.com",
  "dallasnews.com",
  "houstonchronicle.com",
  "wikipedia.org",
  "reddit.com",
  "medium.com",
  "substack.com",
  "crunchbase.com",
  "pitchbook.com",
  "techcrunch.com",
])

export function normalizeHostname(rawUrl: string | null | undefined): {
  hostname: string | null
  cleanUrl: string | null
  isSocialOrDirectory: boolean
  isExcludedChain: boolean
} {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { hostname: null, cleanUrl: null, isSocialOrDirectory: false, isExcludedChain: false }
  }
  let trimmed = rawUrl.trim()
  if (!trimmed) {
    return { hostname: null, cleanUrl: null, isSocialOrDirectory: false, isExcludedChain: false }
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`
  }
  try {
    const u = new URL(trimmed)
    const host = u.hostname.toLowerCase().replace(/^www\./, "")
    if (!host || !host.includes(".")) {
      return { hostname: null, cleanUrl: null, isSocialOrDirectory: false, isExcludedChain: false }
    }
    // Strip tracking query params for clean storage
    u.hash = ""
    const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"]
    for (const p of trackingParams) u.searchParams.delete(p)

    const parts = host.split(".")
    const baseTwo = parts.length >= 2 ? parts.slice(-2).join(".") : host

    const isGovEduMil = /\.(gov|edu|mil)$/i.test(host) || /\.(gov|edu|mil)\.[a-z]{2}$/i.test(host)
    const isNewsHostOrStory =
      NON_COMMERCIAL_OR_NEWS_HOSTS.has(host) ||
      NON_COMMERCIAL_OR_NEWS_HOSTS.has(baseTwo) ||
      /\/news\/local-news\//i.test(u.pathname)

    // Allow *.wixsite.com, *.wixstudio.com, *.square.site, and *.squarespace.com free-subdomain business sites
    // (prime $10K website rebuild leads), while rejecting bare platform roots and Square Appointments directory URLs.
    const isBarePlatformOrCheckoutHost =
      host === "wix.com" ||
      host === "wixsite.com" ||
      host === "wixstudio.com" ||
      host === "square.site" ||
      host === "squarespace.com" ||
      host === "squareup.com" ||
      baseTwo === "squareup.com"

    const isSocialOrDirectory =
      SOCIAL_OR_DIRECTORY_HOSTS.has(host) ||
      SOCIAL_OR_DIRECTORY_HOSTS.has(baseTwo) ||
      isBarePlatformOrCheckoutHost ||
      isNewsHostOrStory
    const isExcludedChain =
      EXCLUDED_CHAIN_DOMAINS.has(host) || EXCLUDED_CHAIN_DOMAINS.has(baseTwo) || isGovEduMil || isNewsHostOrStory

    return {
      hostname: host,
      cleanUrl: u.toString(),
      isSocialOrDirectory,
      isExcludedChain,
    }
  } catch {
    return { hostname: null, cleanUrl: null, isSocialOrDirectory: false, isExcludedChain: false }
  }
}

export function slugifyCompanyDomain(company: string, city?: string | null, state?: string | null): string {
  const base = [company, city, state]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  return `no-web--${base || "unknown"}.local`
}

const FREE_BUILDER_SUBDOMAIN_CMS_MAP: [RegExp, string | null][] = [
  [/\.wixsite\.com$/i, "Wix"],
  [/\.wixstudio\.com$/i, "Wix"],
  [/\.square\.site$/i, "Square Online"],
  [/\.squarespace\.com$/i, "Squarespace"],
  [/\.godaddysites\.com$/i, "GoDaddy Builder"],
  [/\.weebly\.com$/i, "Weebly"],
  [/\.myshopify\.com$/i, "Shopify"],
  [/\.framer\.website$/i, "Framer"],
  [/\.webflow\.io$/i, "Webflow"],
  [/\.wordpress\.com$/i, "WordPress"],
  [/\.(?:my\.)?canva\.site$/i, "Canva Website"],
  [/\.gamma\.site$/i, "Gamma"],
  [/\.jobbersites\.com$/i, "Jobber"],
  [/\.business\.site$/i, "Google Business Site"],
  [/\.lovable\.app$/i, null],
  [/\.netlify\.app$/i, null],
  [/\.vercel\.app$/i, null],
  [/\.azurewebsites\.net$/i, null],
  [/\.github\.io$/i, null],
  [/\.blogspot\.com$/i, null],
]

export function isFreeBuilderSubdomain(domain: string | null | undefined): boolean {
  if (!domain) return false
  const clean = domain.trim().toLowerCase().replace(/^www\./, "")
  return FREE_BUILDER_SUBDOMAIN_CMS_MAP.some(([re]) => re.test(clean))
}

export function detectFreeBuilderSubdomainCms(domain: string | null | undefined): string | null {
  if (!domain) return null
  const clean = domain.trim().toLowerCase().replace(/^www\./, "")
  for (const [re, cms] of FREE_BUILDER_SUBDOMAIN_CMS_MAP) {
    if (re.test(clean)) return cms
  }
  return null
}

export function sanitizePrimaryCtaText(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null
  const t = raw.replace(/\s+/g, " ").trim()
  if (t.length < 3 || t.length > 52) return null
  if (
    /^(facebook|instagram|linkedin|tiktok|youtube|twitter|x|yelp|pinterest|nextdoor|quickbooks|ebook|e-book|lookbook|handbook|yearbook|scrapbook|textbook|macbook)\b/i.test(
      t,
    )
  ) {
    return null
  }
  if (/\b(facebook|instagram|linkedin|tiktok|youtube|quickbooks)\b/i.test(t)) {
    return null
  }
  if (
    !/\b(book|booking|schedule|quote|estimate|call|contact|consult|consultation|tour|get started|free|apply|pricing|appointment|claim|inquire|inquiry|reserve|reservation|request|order|buy|shop)\b/i.test(
      t,
    )
  ) {
    return null
  }
  return t
}

export function analyzeReviewsVoice(reviews: ProspectReviewSnippet[] | null | undefined): {
  praiseThemes: string[]
  complaintThemes: string[]
} {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { praiseThemes: [], complaintThemes: [] }
  }
  const praiseCounts = new Map<string, number>()
  const complaintCounts = new Map<string, number>()

  for (const r of reviews) {
    if (!r || typeof r.text !== "string") continue
    const t = r.text.toLowerCase()
    if (r.rating >= 4) {
      if (/fast|quick|on time|same day|prompt|responsive/.test(t))
        praiseCounts.set("Fast & responsive service", (praiseCounts.get("Fast & responsive service") || 0) + 1)
      if (/honest|transparent|fair price|reasonable|affordable|quote/.test(t))
        praiseCounts.set("Fair, transparent pricing", (praiseCounts.get("Fair, transparent pricing") || 0) + 1)
      if (/professional|clean|knowledgeable|detail|quality|craftsmanship/.test(t))
        praiseCounts.set(
          "High craftsmanship & professionalism",
          (praiseCounts.get("High craftsmanship & professionalism") || 0) + 1,
        )
      if (/friendly|caring|staff|comfortable|communicat/.test(t))
        praiseCounts.set("Warm staff & clear communication", (praiseCounts.get("Warm staff & clear communication") || 0) + 1)
    }
    // Extract complaints ONLY from <=3★ reviews, or 4★ reviews with explicit negative service complaints — NEVER from 5★ praise
    const isExplicit4StarComplaint =
      r.rating === 4 &&
      /\b(never called|no callback|hard to reach|unresponsive|rude|overcharged|hidden fee|took forever|waited\s+\d+\s*(?:min|hour|week|day))\b/.test(
        t,
      )
    if (r.rating <= 3 || isExplicit4StarComplaint) {
      if (
        /\b(never called|no callback|hard to reach|unresponsive|no response|didn'?t call|never heard back|phone|voicemail|answer|reply)\b/.test(
          t,
        )
      ) {
        complaintCounts.set(
          "Slow callback / unanswered inquiries",
          (complaintCounts.get("Slow callback / unanswered inquiries") || 0) + 1,
        )
      }
      if (/\b(wait|waited|waiting|reschedul|cancel|no[- ]show|delay|delayed|late|hours late|took forever)\b/.test(t)) {
        complaintCounts.set(
          "Scheduling & wait-time friction",
          (complaintCounts.get("Scheduling & wait-time friction") || 0) + 1,
        )
      }
      if (
        /\b(overcharg|rip[- ]?off|expensive|overpriced|hidden fee|surprise bill|bait and switch|price|bill|charge|quote|estimate)\b/.test(
          t,
        )
      ) {
        complaintCounts.set(
          "Pricing / estimate clarity friction",
          (complaintCounts.get("Pricing / estimate clarity friction") || 0) + 1,
        )
      }
    }
  }

  return {
    praiseThemes: Array.from(praiseCounts.keys()).slice(0, 3),
    complaintThemes: Array.from(complaintCounts.keys()).slice(0, 3),
  }
}

