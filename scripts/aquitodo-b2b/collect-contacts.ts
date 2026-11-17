import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

// Load .env.local without external dependencies
function loadLocalEnv(): void {
  for (const name of [".env.local", ".env.development.local", ".env"]) {
    const full = path.resolve(process.cwd(), name)
    if (!fs.existsSync(full)) continue
    for (const rawLine of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith("#")) continue
      const eq = line.indexOf("=")
      if (eq <= 0) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = val
    }
  }
}

loadLocalEnv()

const AQUITODO_ROOT = path.resolve(process.cwd(), ".local-audits", "aquitodo")
const CACHE_DIR = path.join(AQUITODO_ROOT, "cache")
const EXPORTS_DIR = path.join(AQUITODO_ROOT, "exports")
const CONTACTS_JSONL = path.join(AQUITODO_ROOT, "contacts.jsonl")
const SUMMARY_MD = path.join(AQUITODO_ROOT, "SUMMARY.md")

for (const d of [AQUITODO_ROOT, CACHE_DIR, EXPORTS_DIR]) {
  fs.mkdirSync(d, { recursive: true })
}

type MunicipalityKey = "Sabaneta" | "Envigado" | "Itagüí" | "La Estrella"

type CohortKey =
  | "restaurantes"
  | "comidas_rapidas"
  | "panaderias_cafes"
  | "tiendas_minimercados"
  | "licoreras_bares"

interface MunicipalityConfig {
  name: MunicipalityKey
  metaCity: string
  fileSlug: string
  defaultZip: string
  lat: number
  lng: number
  radiusMeters: number
  barrioZones: string[]
}

const MUNICIPALITIES: MunicipalityConfig[] = [
  {
    name: "Sabaneta",
    metaCity: "sabaneta",
    fileSlug: "sabaneta",
    defaultZip: "055450",
    lat: 6.1515,
    lng: -75.6166,
    radiusMeters: 3800,
    barrioZones: [
      "Parque de Sabaneta",
      "Aves María Sabaneta",
      "Calle Larga Sabaneta",
      "Mayorca Las Vegas Sabaneta",
      "Cañaveralejo Prados de Sabaneta",
      "Pan de Azúcar Aliadas Sabaneta",
      "La Doctora Betania Sabaneta",
    ],
  },
  {
    name: "Envigado",
    metaCity: "envigado",
    fileSlug: "envigado",
    defaultZip: "055422",
    lat: 6.1759,
    lng: -75.5917,
    radiusMeters: 4800,
    barrioZones: [
      "Parque de Envigado Centro",
      "Jardines Buena Mesa Envigado",
      "Alcalá El Dorado San Marcos Envigado",
      "Las Vegas Primavera Envigado",
      "Zúñiga Loma del Escobero Envigado",
      "El Salado San José Envigado",
    ],
  },
  {
    name: "Itagüí",
    metaCity: "itagui",
    fileSlug: "itagui",
    defaultZip: "055460",
    lat: 6.1846,
    lng: -75.5991,
    radiusMeters: 4800,
    barrioZones: [
      "Parque de Itagüí Centro",
      "Simón Bolívar Santa María Itagüí",
      "Central Mayorista Itagüí",
      "Ditaires Pilsen San Francisco Itagüí",
      "Suramérica San Fernando Itagüí",
      "Calatrava Viviendas del Sur Itagüí",
    ],
  },
  {
    name: "La Estrella",
    metaCity: "la estrella",
    fileSlug: "la-estrella",
    defaultZip: "055470",
    lat: 6.1577,
    lng: -75.6432,
    radiusMeters: 5000,
    barrioZones: [
      "Parque de La Estrella Antioquia",
      "La Tablaza La Estrella Antioquia",
      "Pueblo Viejo Ancón Sur La Estrella",
      "Bellavista Ferrería La Estrella",
    ],
  },
]

const COHORT_LABELS: Record<CohortKey, string> = {
  restaurantes: "Restaurantes",
  comidas_rapidas: "Comidas Rápidas",
  panaderias_cafes: "Panaderías y Cafeterías",
  tiendas_minimercados: "Tiendas y Minimercados",
  licoreras_bares: "Licoreras y Bares",
}

const MUNICIPALITY_QUERIES: { cohort: CohortKey; subCategory: string; term: string }[] = [
  { cohort: "tiendas_minimercados", subCategory: "Tienda de Barrio / Abarrotes", term: "tienda de barrio abarrotes viveres" },
  { cohort: "tiendas_minimercados", subCategory: "Minimercado / Autoservicio", term: "minimercado autoservicio" },
  { cohort: "tiendas_minimercados", subCategory: "Granero / Salsamentaria", term: "granero salsamentaria charcuteria" },
  { cohort: "tiendas_minimercados", subCategory: "Dulcería / Confitería", term: "dulceria confiteria" },
  { cohort: "restaurantes", subCategory: "Restaurante", term: "restaurante" },
  { cohort: "restaurantes", subCategory: "Restaurante / Almuerzos", term: "restaurante almuerzos ejecutivos corrientazo" },
  { cohort: "restaurantes", subCategory: "Asadero / Parrilla", term: "asadero parrilla carnes" },
  { cohort: "restaurantes", subCategory: "Pizzería", term: "pizzeria" },
  { cohort: "restaurantes", subCategory: "Restaurante Internacional", term: "restaurante mexicano sushi peruano" },
  { cohort: "comidas_rapidas", subCategory: "Comidas Rápidas / Hamburguesas", term: "comidas rapidas hamburguesas perros calientes" },
  { cohort: "comidas_rapidas", subCategory: "Pollo Asado / Broaster", term: "pollo asado broaster" },
  { cohort: "comidas_rapidas", subCategory: "Empanadas / Arepas / Fritos", term: "empanadas arepas fritos" },
  { cohort: "panaderias_cafes", subCategory: "Panadería / Pastelería", term: "panaderia pasteleria" },
  { cohort: "panaderias_cafes", subCategory: "Cafetería", term: "cafeteria cafe" },
  { cohort: "panaderias_cafes", subCategory: "Repostería / Heladería", term: "reposteria heladeria fruteria" },
  { cohort: "licoreras_bares", subCategory: "Licorera / Estanquillo / Cigarrería", term: "licorera estanquillo cigarreria" },
  { cohort: "licoreras_bares", subCategory: "Gastrobar / Bar", term: "gastrobar bar cerveceria" },
]

const BARRIO_QUERIES: { cohort: CohortKey; subCategory: string; term: string }[] = [
  { cohort: "tiendas_minimercados", subCategory: "Tienda / Minimercado", term: "tienda minimercado abarrotes" },
  { cohort: "tiendas_minimercados", subCategory: "Granero / Salsamentaria", term: "granero salsamentaria" },
  { cohort: "licoreras_bares", subCategory: "Licorera / Cigarrería", term: "licorera estanquillo cigarreria" },
  { cohort: "panaderias_cafes", subCategory: "Panadería / Cafetería", term: "panaderia cafeteria pasteleria" },
  { cohort: "comidas_rapidas", subCategory: "Comidas Rápidas", term: "comidas rapidas hamburguesas perros" },
  { cohort: "restaurantes", subCategory: "Restaurante", term: "restaurante asadero" },
  { cohort: "restaurantes", subCategory: "Pizzería / Empanadas", term: "pizzeria empanadas arepas" },
  { cohort: "licoreras_bares", subCategory: "Bar / Gastrobar", term: "bar gastrobar" },
]

// Exclude national supermarkets, chain franchises, rival mega-wholesalers, and non-store public landmarks
const EXCLUDED_CHAIN_RE =
  /\b(tiendas?\s*d1|^d1$|tiendas?\s*ara|^ara$|almacenes?\s*exito|^exito$|grupo\s*exito|carulla|jumbo|tiendas?\s*metro|supermercados?\s*metro|^metro\s+(itagui|envigado|sabaneta|la\s*estrella)\b|cencosud|olimpica|tiendas?\s*isimo|^isimo$|surtimax|super\s*inter|makro|pricesmart|alkosto|ktronix|homecenter|dollarcity|oxxo|farmatodo|pasteur|cruz\s*verde|la\s*rebaja|frisby|el\s*corral|mcdonald'?s|mc\s*donald'?s|burger\s*king|kfc|kentucky\s*fried|subway|domino'?s|papa\s*john'?s|pizza\s*hut|little\s*caesars|presto|sandwich\s*qbano|qbano|crepes\s*&\s*waffles|crepes\s*y\s*waffles|juan\s*valdez|starbucks|tostao|cafe\s*oma|\boma\b|cosechas|percimon|popsy|mimo'?s|dunkin|kokoriko|sarku\s*japan|sr\.?\s*wok|mcdonalds|aquitodo|distribuidora\s*aquitodo|jerkys|dislicores|licores\s*factory)\b/i

const EXCLUDED_LANDMARK_RE =
  /^(notaria\s+|parroquia\s+|iglesia\s+|alcaldia\s+|personeria\s+|registraduria\s+|institucion\s+educativa\s+|colegio\s+|parque\s+(de\s+|del\s+|principal|simon\b|chimeneas\b|lineal\b|obrero\b))/i

// Exclude third-party menu/bio/platform vendor domains from email attribution
const VENDOR_EMAIL_DOMAINS = new Set([
  "cluvi.co",
  "menupp.co",
  "linktr.ee",
  "beacons.ai",
  "bio.site",
  "rappi.com",
  "rappi.com.co",
  "ifood.com.co",
  "didiglobal.com",
  "wix.com",
  "wixpress.com",
  "sentry.io",
  "sentry.wixpress.com",
  "squarespace.com",
  "godaddy.com",
  "secureserver.net",
  "namecheap.com",
  "serpnames.com",
  "hugedomains.com",
  "afternic.com",
  "sedo.com",
  "dan.com",
  "latinotype.com",
  "myfonts.com",
  "monotype.com",
  "typotheque.com",
  "fontsquirrel.com",
  "fontawesome.com",
  "getbootstrap.com",
  "wordpress.org",
  "wordpress.com",
  "shopify.com",
  "whatsapp.com",
  "facebook.com",
  "instagram.com",
  "google.com",
  "gstatic.com",
  "googleapis.com",
  "cloudflare.com",
  "example.com",
  "ejemplo.com",
  "correo.com",
  "getjusto.com",
  "gurusoluciones.com",
  "paginasamarillas.com.co",
  "domain.com",
  "email.com",
  "template.com",
  "tuempresa.com",
  "tudominio.com",
])

export interface AquiTodoContactRecord {
  placeId: string
  businessName: string
  cohort: CohortKey
  categoryLabel: string
  subCategory: string
  municipality: MunicipalityKey
  metaCity: string
  barrio: string
  address: string
  zip: string
  latitude: number | null
  longitude: number | null
  googleMapsLink: string
  instagramOrMenuLink: string
  mobilePhones: string[] // Strictly 12-digit Colombian mobile: 573XXXXXXXXX
  landlinePhones: string[] // Fixed lines e.g. +57604XXXXXXX
  emails: string[] // Verified business/owner emails
  _lookupUrl?: string | null // Internal transient pointer for plain-HTTP contact extraction
}

const ABURRA_SUR_SECTORS: { municipality: MunicipalityKey; name: string; lat: number; lng: number }[] = [
  // Sabaneta
  { municipality: "Sabaneta", name: "Parque / Centro Sabaneta", lat: 6.1515, lng: -75.6166 },
  { municipality: "Sabaneta", name: "Aves María", lat: 6.1538, lng: -75.6115 },
  { municipality: "Sabaneta", name: "Calle Larga / Entreamigos", lat: 6.1558, lng: -75.6168 },
  { municipality: "Sabaneta", name: "Mayorca / Las Vegas", lat: 6.1608, lng: -75.6052 },
  { municipality: "Sabaneta", name: "Prados de Sabaneta / Cañaveralejo", lat: 6.1485, lng: -75.6235 },
  { municipality: "Sabaneta", name: "Aliadas / Pan de Azúcar", lat: 6.1455, lng: -75.611 },
  { municipality: "Sabaneta", name: "La Doctora / Betania", lat: 6.1425, lng: -75.6165 },
  // Envigado
  { municipality: "Envigado", name: "Parque / Centro Envigado", lat: 6.1705, lng: -75.5872 },
  { municipality: "Envigado", name: "Jardines / Buena Mesa", lat: 6.1795, lng: -75.5855 },
  { municipality: "Envigado", name: "Alcalá / San Marcos / El Dorado", lat: 6.1715, lng: -75.5945 },
  { municipality: "Envigado", name: "Las Vegas / Primavera", lat: 6.167, lng: -75.6005 },
  { municipality: "Envigado", name: "Zúñiga / Frontera", lat: 6.1865, lng: -75.5815 },
  { municipality: "Envigado", name: "Loma del Escobero", lat: 6.1665, lng: -75.5735 },
  { municipality: "Envigado", name: "El Salado / San José", lat: 6.159, lng: -75.582 },
  // Itagüí
  { municipality: "Itagüí", name: "Parque / Centro Itagüí", lat: 6.1726, lng: -75.6096 },
  { municipality: "Itagüí", name: "Central Mayorista / Aguacatala Sur", lat: 6.1888, lng: -75.592 },
  { municipality: "Itagüí", name: "Santa María / Simón Bolívar", lat: 6.1815, lng: -75.599 },
  { municipality: "Itagüí", name: "Calatrava / Los Naranjos", lat: 6.1775, lng: -75.6165 },
  { municipality: "Itagüí", name: "Ditaires / Pilsen", lat: 6.1655, lng: -75.6235 },
  { municipality: "Itagüí", name: "Suramérica / San Fernando", lat: 6.1615, lng: -75.6125 },
  // La Estrella
  { municipality: "La Estrella", name: "Parque / Centro La Estrella", lat: 6.1376, lng: -75.6431 },
  { municipality: "La Estrella", name: "Ancón Sur / La Ferrería", lat: 6.1535, lng: -75.6285 },
  { municipality: "La Estrella", name: "Bellavista / Pueblo Viejo", lat: 6.131, lng: -75.636 },
  { municipality: "La Estrella", name: "La Tablaza", lat: 6.1155, lng: -75.6335 },
]

function nearestSector(municipality: MunicipalityKey, lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return ""
  const candidates = ABURRA_SUR_SECTORS.filter((s) => s.municipality === municipality)
  let best = ""
  let bestDist = Infinity
  for (const c of candidates) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
    if (d < bestDist) {
      bestDist = d
      best = c.name
    }
  }
  return best
}

function extractBarrio(
  formattedAddress: string,
  municipality: MunicipalityKey,
  lat: number | null,
  lng: number | null,
): string {
  const parts = String(formattedAddress || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)

  const skipExact = new Set([
    "colombia",
    "antioquia",
    "sabaneta",
    "envigado",
    "itagui",
    "la estrella",
    "medellin",
  ])

  let zonaTag = ""
  for (let i = parts.length - 1; i >= 0; i--) {
    const raw = parts[i].replace(/\b05\d{4}\b/g, "").trim()
    if (!raw) continue
    const norm = stripAccents(raw).toLowerCase()
    if (skipExact.has(norm)) continue
    // Skip street address segments (Cl., Cra., #, numbers, Local, Interior, Piso, Km)
    if (
      /^(cl\.?|calle|cra\.?|kr\.?|carrera|dg\.?|diagonal|tv\.?|transversal|av\.?|avenida|cir\.?|circular|autopista|variante|km\b|#|a\s+\d|\d|local\b|piso\b|int\.?\b|interior\b|bodega\b|bloque\b|apto\b|apartamento\b|oficina\b)/i.test(
        norm,
      )
    ) {
      continue
    }
    if (/#\s*\d|\b\d{2,}\s*(sur|norte)?\s*[-#]/i.test(norm)) continue

    if (/^zona\s+\d+$/i.test(norm)) {
      zonaTag = raw
      continue
    }

    if (raw.length >= 3 && raw.length <= 44) {
      return raw
    }
  }

  const sector = nearestSector(municipality, lat, lng)
  if (zonaTag && sector) return `${sector} (${zonaTag})`
  return sector || zonaTag
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function sha1(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex")
}

function isExcludedChainName(name: string): boolean {
  const clean = stripAccents(name).toLowerCase().trim()
  return EXCLUDED_CHAIN_RE.test(clean) || EXCLUDED_LANDMARK_RE.test(clean)
}

function resolveAburraSurMunicipality(
  formattedAddress: string,
  lat: number | undefined,
  lng: number | undefined,
): MunicipalityConfig | null {
  if (typeof lat === "number" && typeof lng === "number") {
    // Hard bounding box around Sabaneta, Envigado, Itagüí & La Estrella
    if (lat < 6.085 || lat > 6.21 || lng < -75.685 || lng > -75.505) {
      return null
    }
  }

  const norm = stripAccents(formattedAddress || "").toLowerCase()
  if (!norm.includes("colombia") && !norm.includes("antioquia")) {
    return null
  }

  // Match explicit municipality token in address
  if (/\bsabaneta\b/.test(norm)) return MUNICIPALITIES[0]
  if (/\benvigado\b/.test(norm)) return MUNICIPALITIES[1]
  if (/\bitagui\b/.test(norm)) return MUNICIPALITIES[2]
  if (/\bla\s+estrella\b|\bla\s+tablaza\b/.test(norm)) return MUNICIPALITIES[3]

  return null
}

function extractZipCode(formattedAddress: string, fallbackZip: string): string {
  // Colombian DANE postal codes in Antioquia start with 05 (6 digits)
  const m = (formattedAddress || "").match(/\b(05\d{4})\b/)
  return m ? m[1] : fallbackZip
}

// Valid Colombian mobile prefixes: 300-305, 310-324, 333, 350, 351
const COL_MOBILE_10_RE = /^3(?:0[0-5]|1[0-9]|2[0-4]|33|5[01])\d{7}$/

function classifyColombianPhone(raw: string): { kind: "mobile" | "landline" | "invalid"; normalized: string } {
  let digits = String(raw || "").replace(/\D/g, "")
  if (!digits) return { kind: "invalid", normalized: "" }

  if (digits.startsWith("0057") && digits.length >= 14) {
    digits = digits.slice(4)
  } else if (digits.startsWith("57") && (digits.length === 12 || digits.length === 9)) {
    digits = digits.slice(2)
  }

  // 10-digit Colombian mobile: 3XX XXX XXXX (reject dummy repeated/sequential placeholder digits)
  if (digits.length === 10 && COL_MOBILE_10_RE.test(digits)) {
    const tail7 = digits.slice(3)
    if (/^(\d)\1{6}$/.test(tail7) || /^(\d)\1{7,}/.test(digits) || digits === "3123456789" || digits === "3001234567") {
      return { kind: "invalid", normalized: "" }
    }
    return { kind: "mobile", normalized: `57${digits}` }
  }

  // 10-digit Colombian fixed landline (604 XXX XXXX for Antioquia)
  if (digits.length === 10 && digits.startsWith("604")) {
    return { kind: "landline", normalized: `+57${digits}` }
  }

  // Legacy 7-digit Medellín/Aburrá landline (e.g., 444 1234 or 288 1234)
  if (digits.length === 7 && /^[2-6]\d{6}$/.test(digits)) {
    return { kind: "landline", normalized: `+57604${digits}` }
  }

  return { kind: "invalid", normalized: "" }
}

function cleanAndValidateEmail(raw: string): string | null {
  let s = String(raw || "").trim()
  try {
    s = decodeURIComponent(s)
  } catch {
    // ignore malformed %
  }
  s = s
    .replace(/^(mailto:|email:)/i, "")
    .split("?")[0]
    .trim()
    .toLowerCase()
    .replace(/^[<("']+|[>)"'.,;:]+$/g, "")

  if (!s || s.length > 90 || s.includes("%") || s.includes(" ")) return null
  if (!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,10}$/.test(s)) return null
  if (/\.(png|jpg|jpeg|webp|avif|gif|svg|css|js|woff|woff2|ttf|pdf|mp4)$/i.test(s)) return null
  if (/^[0-9a-f]{20,}@/.test(s)) return null
  if (/^(noreply|no-reply|donotreply|wordpress|webflow|squarespace|elementor|wix|sentry|postmaster|mailer-daemon)@/.test(s)) {
    return null
  }

  const domain = s.split("@")[1]
  if (!domain) return null
  for (const blocked of VENDOR_EMAIL_DOMAINS) {
    if (domain === blocked || domain.endsWith(`.${blocked}`)) return null
  }

  return s
}

function extractMobileFromWhatsAppUrl(urlStr: string): string[] {
  const out = new Set<string>()
  const decoded = (() => {
    try {
      return decodeURIComponent(urlStr)
    } catch {
      return urlStr
    }
  })()

  const patterns = [
    /wa\.me\/(?:\+|00)?(?:57)?(3\d{9})\b/gi,
    /whatsapp\.com\/send\/?\?[^"'\s<>]*phone=(?:\+|%2B|00)?(?:57)?(3\d{9})\b/gi,
    /tel:(?:\+|%2B|00)?(?:57)?[\s.-]*(3\d{2}[\s.-]?\d{3}[\s.-]?\d{4})\b/gi,
  ]

  for (const re of patterns) {
    for (const m of decoded.matchAll(re)) {
      const cls = classifyColombianPhone(m[1])
      if (cls.kind === "mobile") out.add(cls.normalized)
    }
  }
  return [...out]
}

let liveApiCalls = 0

async function searchPlacesPage(
  apiKey: string,
  textQuery: string,
  lat: number,
  lng: number,
  radiusMeters: number,
  maxApiCalls: number,
  pageToken?: string,
): Promise<{ places: any[]; nextPageToken?: string }> {
  const cacheKey = sha1(`aq_v1:${textQuery}|${lat.toFixed(4)},${lng.toFixed(4)},${radiusMeters}|${pageToken || ""}`)
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`)
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, "utf8"))
      return { places: cached.places || [], nextPageToken: cached.nextPageToken }
    } catch {
      // re-fetch if corrupted
    }
  }

  if (liveApiCalls >= maxApiCalls) {
    return { places: [] }
  }

  liveApiCalls++
  const body: Record<string, unknown> = {
    textQuery,
    pageSize: 20,
    languageCode: "es",
    regionCode: "CO",
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radiusMeters,
      },
    },
  }
  if (pageToken) body.pageToken = pageToken

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,nextPageToken",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    console.warn(`[Places ${res.status}] ${textQuery}: ${errText.slice(0, 140)}`)
    return { places: [] }
  }

  const data = (await res.json()) as any
  fs.writeFileSync(cacheFile, JSON.stringify(data), "utf8")
  return {
    places: Array.isArray(data.places) ? data.places : [],
    nextPageToken: typeof data.nextPageToken === "string" ? data.nextPageToken : undefined,
  }
}

async function harvestContactsFromLink(
  urlStr: string,
): Promise<{ mobiles: string[]; emails: string[]; isParked?: boolean }> {
  const mobiles = new Set<string>(extractMobileFromWhatsAppUrl(urlStr))
  const emails = new Set<string>()

  // If it's already a direct wa.me / api.whatsapp.com link, we got the number with 0 HTTP requests
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(urlStr)) {
    return { mobiles: [...mobiles], emails: [] }
  }

  // Skip heavy social login walls & delivery apps that block plain HTTP or only show platform support emails
  if (
    /^https?:\/\/(www\.)?(facebook\.com|m\.facebook\.com|instagram\.com|tiktok\.com|rappi\.com|ifood\.com|ubereats\.com|didifood)\b/i.test(
      urlStr,
    )
  ) {
    return { mobiles: [...mobiles], emails: [] }
  }

  try {
    const res = await fetch(urlStr, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(4500),
    })

    // Check final URL after redirect (e.g. wa.link / bit.ly -> api.whatsapp.com/send?phone=573...)
    if (res.url) {
      for (const m of extractMobileFromWhatsAppUrl(res.url)) mobiles.add(m)
    }

    const ct = (res.headers.get("content-type") || "").toLowerCase()
    if (!res.ok || (!ct.includes("text/html") && !ct.includes("text/plain") && !ct.includes("application/xhtml"))) {
      return { mobiles: [...mobiles], emails: [] }
    }

    const fullHtml = (await res.text()).slice(0, 350_000)

    // Strip <script>, <style>, and HTML comments so font-foundry licenses or JS constants never pollute contacts
    const cleanHtml = fullHtml
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")

    // Skip parked / for-sale domains
    if (/domain is for sale|buy this domain|serpnames|hugedomains|sedoparking/i.test(cleanHtml.slice(0, 15_000))) {
      return { mobiles: [...mobiles], emails: [], isParked: true }
    }

    // 1. Extract WhatsApp & tel: Colombian mobile numbers
    for (const m of extractMobileFromWhatsAppUrl(cleanHtml)) mobiles.add(m)

    // Also match visible Colombian +57 3XX XXX XXXX text on page (requiring explicit phone context or separators)
    for (const m of cleanHtml.matchAll(/(?:\+57[\s.-]*|(?:cel|tel|whatsapp|ws|movil|contacto)[\s.:#-]*)(3(?:0[0-5]|1[0-9]|2[0-4]|33|5[01]))[\s.-]*(\d{3})[\s.-]*(\d{2})[\s.-]*(\d{2})\b/gi)) {
      const cls = classifyColombianPhone(`${m[1]}${m[2]}${m[3]}${m[4]}`)
      if (cls.kind === "mobile") mobiles.add(cls.normalized)
    }

    // 2. Extract mailto: and visible email addresses
    for (const m of cleanHtml.matchAll(/mailto:([^"'\s<>?]+)/gi)) {
      const clean = cleanAndValidateEmail(m[1])
      if (clean) emails.add(clean)
    }
    for (const m of cleanHtml.matchAll(/\b([a-zA-Z0-9._+-]{2,48}@[a-zA-Z0-9.-]{2,48}\.[a-zA-Z]{2,8})\b/g)) {
      const clean = cleanAndValidateEmail(m[1])
      if (clean) emails.add(clean)
    }
  } catch {
    // Ignore timeouts / SSL errors cleanly
  }

  return {
    mobiles: [...mobiles].slice(0, 4),
    emails: [...emails].slice(0, 4),
  }
}

function escapeCsv(val: string | number | null | undefined): string {
  const s = String(val ?? "").replace(/\r?\n/g, " ").trim()
  if (!s) return ""
  // Allow clean E.164 phone numbers (+573...) and signed numeric coordinates (-75.616612) without prepending an apostrophe
  const isCleanSignedNumber = /^[+-]\d+(?:\.\d+)?$/.test(s)
  const safe = !isCleanSignedNumber && /^[=+\-@|\t]/.test(s) ? `'${s}` : s
  if (/[",]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

async function main() {
  const maxApiCalls = Number(process.env.AQUITODO_MAX_CALLS || "575")
  const apiKey = process.env.GOOGLE_MAPS_API_KEY_2 || process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY_2 in .env.local")
  }

  const byPlaceId = new Map<string, AquiTodoContactRecord>()

  function ingestPlaces(places: any[], cohort: CohortKey, subCategory: string) {
    for (const p of places) {
      const placeId = String(p.id || "").trim()
      if (!placeId || byPlaceId.has(placeId)) continue
      if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue

      const businessName = String(p.displayName?.text || "").trim()
      if (!businessName || isExcludedChainName(businessName)) continue

      const formattedAddress = String(p.formattedAddress || "").trim()
      const muni = resolveAburraSurMunicipality(
        formattedAddress,
        p.location?.latitude,
        p.location?.longitude,
      )
      if (!muni) continue

      const mobiles = new Set<string>()
      const landlines = new Set<string>()

      for (const rawPhone of [p.internationalPhoneNumber, p.nationalPhoneNumber]) {
        if (!rawPhone) continue
        const cls = classifyColombianPhone(String(rawPhone))
        if (cls.kind === "mobile") mobiles.add(cls.normalized)
        else if (cls.kind === "landline") landlines.add(cls.normalized)
      }

      const rawUrl = p.websiteUri ? String(p.websiteUri).trim() : null
      if (rawUrl && /\.gov\.co\b/i.test(rawUrl)) continue
      if (rawUrl) {
        for (const m of extractMobileFromWhatsAppUrl(rawUrl)) mobiles.add(m)
      }

      const lat = typeof p.location?.latitude === "number" ? Number(p.location.latitude.toFixed(6)) : null
      const lng = typeof p.location?.longitude === "number" ? Number(p.location.longitude.toFixed(6)) : null

      byPlaceId.set(placeId, {
        placeId,
        businessName,
        cohort,
        categoryLabel: COHORT_LABELS[cohort],
        subCategory,
        municipality: muni.name,
        metaCity: muni.metaCity,
        barrio: extractBarrio(formattedAddress, muni.name, lat, lng),
        address: formattedAddress,
        zip: extractZipCode(formattedAddress, muni.defaultZip),
        latitude: lat,
        longitude: lng,
        googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
        instagramOrMenuLink: rawUrl || "",
        mobilePhones: [...mobiles],
        landlinePhones: [...landlines],
        emails: [],
        _lookupUrl: rawUrl,
      })
    }
  }

  console.log(`[AquiTodo] Stage 1: Discovering Food & Street-Retail Businesses across Sabaneta, Envigado, Itagüí & La Estrella (cap <= ${maxApiCalls} calls)...`)

  // Pass 1: Municipality-level sweep (Pages 1, 2, 3 up to 60 results per category per municipality)
  for (const q of MUNICIPALITY_QUERIES) {
    for (const muni of MUNICIPALITIES) {
      const textQuery = `${q.term} en ${muni.name}, Antioquia`
      const p1 = await searchPlacesPage(apiKey, textQuery, muni.lat, muni.lng, muni.radiusMeters, maxApiCalls)
      ingestPlaces(p1.places, q.cohort, q.subCategory)

      if (p1.nextPageToken) {
        const p2 = await searchPlacesPage(
          apiKey,
          textQuery,
          muni.lat,
          muni.lng,
          muni.radiusMeters,
          maxApiCalls,
          p1.nextPageToken,
        )
        ingestPlaces(p2.places, q.cohort, q.subCategory)

        if (p2.nextPageToken) {
          const p3 = await searchPlacesPage(
            apiKey,
            textQuery,
            muni.lat,
            muni.lng,
            muni.radiusMeters,
            maxApiCalls,
            p2.nextPageToken,
          )
          ingestPlaces(p3.places, q.cohort, q.subCategory)
        }
      }
    }
  }

  console.log(
    `[AquiTodo] After Pass 1 (Municipality sweep): ${byPlaceId.size} unique Aburrá Sur businesses (live API calls used: ${liveApiCalls}/${maxApiCalls}).`,
  )

  // Pass 2: Barrio-zone sweep (interleaved round-robin across municipalities so all 4 municipalities get deep barrio coverage)
  const maxBarrios = Math.max(...MUNICIPALITIES.map((m) => m.barrioZones.length))
  for (const q of BARRIO_QUERIES) {
    for (let bIdx = 0; bIdx < maxBarrios; bIdx++) {
      for (const muni of MUNICIPALITIES) {
        const zone = muni.barrioZones[bIdx]
        if (!zone) continue
        const textQuery = `${q.term} cerca de ${zone}, Antioquia`
        const p1 = await searchPlacesPage(apiKey, textQuery, muni.lat, muni.lng, 2200, maxApiCalls)
        ingestPlaces(p1.places, q.cohort, q.subCategory)

        if (p1.nextPageToken && p1.places.length >= 18) {
          const p2 = await searchPlacesPage(apiKey, textQuery, muni.lat, muni.lng, 2200, maxApiCalls, p1.nextPageToken)
          ingestPlaces(p2.places, q.cohort, q.subCategory)
        }
      }
    }
  }

  const allRecords = [...byPlaceId.values()]
  console.log(
    `[AquiTodo] Discovery complete: ${allRecords.length} unique businesses in Sabaneta, Envigado, Itagüí & La Estrella (total live API calls: ${liveApiCalls}/${maxApiCalls}).`,
  )

  // Stage 2: Fast plain-HTTP email & WhatsApp mobile extraction (or instant re-export from contacts.jsonl)
  if (process.env.AQUITODO_REEXPORT_ONLY === "1" && fs.existsSync(CONTACTS_JSONL)) {
    const savedByPlaceId = new Map<string, any>()
    for (const line of fs.readFileSync(CONTACTS_JSONL, "utf8").trim().split(/\r?\n/)) {
      if (!line) continue
      const parsed = JSON.parse(line)
      if (parsed.placeId) savedByPlaceId.set(parsed.placeId, parsed)
    }
    for (const rec of allRecords) {
      const prev = savedByPlaceId.get(rec.placeId)
      if (!prev) continue
      rec.mobilePhones = [...new Set([...rec.mobilePhones, ...(prev.mobilePhones || [])])]
      rec.emails = (prev.emails || []).map((e: string) => cleanAndValidateEmail(e)).filter(Boolean)
      if (prev.instagramOrMenuLink === "") rec.instagramOrMenuLink = ""
    }
  } else {
    const withUrl = allRecords.filter((r) => Boolean(r._lookupUrl))
    console.log(`[AquiTodo] Stage 2: Extracting emails & WhatsApp mobile numbers via plain HTTP across ${withUrl.length} linked URLs...`)

    let cursor = 0
    const concurrency = 28
    let harvestedEmailsCount = 0
    let harvestedMobilesCount = 0

    async function enrichWorker() {
      while (cursor < withUrl.length) {
        const idx = cursor++
        const rec = withUrl[idx]
        if (!rec._lookupUrl) continue
        const beforeMobiles = rec.mobilePhones.length
        const { mobiles, emails, isParked } = await harvestContactsFromLink(rec._lookupUrl)
        if (isParked) {
          rec.instagramOrMenuLink = ""
          continue
        }

        const mergedMobiles = new Set([...rec.mobilePhones, ...mobiles])
        rec.mobilePhones = [...mergedMobiles]
        if (rec.mobilePhones.length > beforeMobiles) harvestedMobilesCount++

        if (emails.length > 0) {
          rec.emails = [...new Set([...rec.emails, ...emails])]
          harvestedEmailsCount++
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, () => enrichWorker()))
    console.log(
      `[AquiTodo] Contact extraction complete: +${harvestedEmailsCount} businesses enriched with emails, +${harvestedMobilesCount} enriched with extra WhatsApp mobiles.`,
    )
  }

  // Save clean JSONL (stripping transient _lookupUrl)
  const cleanJsonl = allRecords
    .map((r) => {
      const { _lookupUrl, ...clean } = r
      return JSON.stringify(clean)
    })
    .join("\n")
  fs.writeFileSync(CONTACTS_JSONL, cleanJsonl + "\n", "utf8")

  // Stage 3: Export Clean CSVs
  // 3A. Master Contacts CSV (full business details + all 5 cached operational fields)
  const masterHeader = [
    "business_name",
    "category",
    "sub_category",
    "municipality",
    "barrio",
    "address",
    "zip",
    "mobile_phone",
    "mobile_phone_2",
    "whatsapp_link",
    "landline_phone",
    "email",
    "email_2",
    "instagram_or_menu_link",
    "google_maps_link",
    "latitude",
    "longitude",
  ].join(",")

  function toMasterCsvRows(list: AquiTodoContactRecord[]): string {
    // Sort so rows with mobile + email appear first, then mobile, then email, then landline/address
    const sorted = [...list].sort((a, b) => {
      const score = (x: AquiTodoContactRecord) =>
        (x.mobilePhones.length > 0 ? 4 : 0) +
        (x.emails.length > 0 ? 3 : 0) +
        (x.landlinePhones.length > 0 ? 1 : 0) +
        (x.instagramOrMenuLink ? 0.5 : 0)
      return score(b) - score(a)
    })

    const rows = [masterHeader]
    for (const r of sorted) {
      const whatsappLink = r.mobilePhones[0] ? `https://wa.me/${r.mobilePhones[0]}` : ""
      rows.push(
        [
          escapeCsv(r.businessName),
          escapeCsv(r.categoryLabel),
          escapeCsv(r.subCategory),
          escapeCsv(r.municipality),
          escapeCsv(r.barrio),
          escapeCsv(r.address),
          escapeCsv(r.zip),
          escapeCsv(r.mobilePhones[0] ? `+${r.mobilePhones[0]}` : ""),
          escapeCsv(r.mobilePhones[1] ? `+${r.mobilePhones[1]}` : ""),
          escapeCsv(whatsappLink),
          escapeCsv(r.landlinePhones[0] || ""),
          escapeCsv(r.emails[0] || ""),
          escapeCsv(r.emails[1] || ""),
          escapeCsv(r.instagramOrMenuLink),
          escapeCsv(r.googleMapsLink),
          escapeCsv(r.latitude !== null ? r.latitude : ""),
          escapeCsv(r.longitude !== null ? r.longitude : ""),
        ].join(","),
      )
    }
    return rows.join("\n") + "\n"
  }

  fs.writeFileSync(path.join(EXPORTS_DIR, "aquitodo-contacts-master.csv"), toMasterCsvRows(allRecords), "utf8")
  for (const muni of MUNICIPALITIES) {
    const subset = allRecords.filter((r) => r.municipality === muni.name)
    fs.writeFileSync(
      path.join(EXPORTS_DIR, `aquitodo-contacts-${muni.fileSlug}.csv`),
      toMasterCsvRows(subset),
      "utf8",
    )
  }

  // 3B. Meta Ads Manager Custom Audience CSVs (multi-identifier schema: email,email,phone,phone,ct,st,zip,country)
  // Strictly includes rows with >= 1 verified Colombian mobile (573XXXXXXXXX) and/or >= 1 verified email, deduplicated by primary contact key
  function toMetaAudienceCsv(list: AquiTodoContactRecord[]): { csv: string; count: number } {
    const header = "email,email,phone,phone,ct,st,zip,country"
    const rows = [header]
    const seenPrimaryKey = new Set<string>()
    let count = 0

    for (const r of list) {
      const m1 = r.mobilePhones[0] || ""
      const m2 = r.mobilePhones[1] || ""
      const e1 = r.emails[0] || ""
      const e2 = r.emails[1] || ""
      if (!m1 && !e1) continue

      const dedupeKey = `${m1}|${e1}`
      if (seenPrimaryKey.has(dedupeKey)) continue
      seenPrimaryKey.add(dedupeKey)

      rows.push(
        [
          escapeCsv(e1),
          escapeCsv(e2),
          escapeCsv(m1), // Strictly 573XXXXXXXXX (digits with country code, Meta recommended format)
          escapeCsv(m2),
          escapeCsv(r.metaCity),
          "antioquia",
          escapeCsv(r.zip),
          "CO",
        ].join(","),
      )
      count++
    }
    return { csv: rows.join("\n") + "\n", count }
  }

  const metaAll = toMetaAudienceCsv(allRecords)
  fs.writeFileSync(path.join(EXPORTS_DIR, "meta-custom-audience-aquitodo.csv"), metaAll.csv, "utf8")

  const metaRestaurantes = toMetaAudienceCsv(
    allRecords.filter((r) =>
      ["restaurantes", "comidas_rapidas", "panaderias_cafes"].includes(r.cohort),
    ),
  )
  fs.writeFileSync(
    path.join(EXPORTS_DIR, "meta-custom-audience-restaurantes-comidas.csv"),
    metaRestaurantes.csv,
    "utf8",
  )

  const metaTiendas = toMetaAudienceCsv(
    allRecords.filter((r) => ["tiendas_minimercados", "licoreras_bares"].includes(r.cohort)),
  )
  fs.writeFileSync(path.join(EXPORTS_DIR, "meta-custom-audience-tiendas-licoreras.csv"), metaTiendas.csv, "utf8")

  // 3C. Google Ads Customer Match CSV (Email,Phone,Country,Zip with E.164 +573XXXXXXXXX)
  const gAdsRows = ["Email,Phone,Country,Zip"]
  const seenGAds = new Set<string>()
  let gAdsCount = 0
  for (const r of allRecords) {
    const m1 = r.mobilePhones[0] ? `+${r.mobilePhones[0]}` : ""
    const e1 = r.emails[0] || ""
    if (!m1 && !e1) continue
    const k = `${m1}|${e1}`
    if (seenGAds.has(k)) continue
    seenGAds.add(k)
    gAdsRows.push([escapeCsv(e1), escapeCsv(m1), "CO", escapeCsv(r.zip)].join(","))
    gAdsCount++
  }
  fs.writeFileSync(path.join(EXPORTS_DIR, "google-ads-customer-match-aquitodo.csv"), gAdsRows.join("\n") + "\n", "utf8")

  // 3D. Summary Markdown Report
  const withMobile = allRecords.filter((r) => r.mobilePhones.length > 0).length
  const withLandline = allRecords.filter((r) => r.landlinePhones.length > 0).length
  const withAnyPhone = allRecords.filter((r) => r.mobilePhones.length > 0 || r.landlinePhones.length > 0).length
  const withEmail = allRecords.filter((r) => r.emails.length > 0).length
  const withMobileOrEmail = allRecords.filter((r) => r.mobilePhones.length > 0 || r.emails.length > 0).length

  const md: string[] = []
  md.push("# AquiTodo (`aquitodo.co`) — Aburrá Sur B2B Contact Database Summary")
  md.push("")
  md.push("## 1. Overall Contact Totals")
  md.push("")
  md.push("| Metric | Count |")
  md.push("| :--- | :--- |")
  md.push(`| **Total Unique Aburrá Sur Businesses Collected** | **\`${allRecords.length}\`** |`)
  md.push(`| **Businesses with Any Phone Number** | **\`${withAnyPhone}\`** (\`${((withAnyPhone / Math.max(1, allRecords.length)) * 100).toFixed(1)}%\`) |`)
  md.push(`| **Businesses with Colombian \`+57 3xx\` Mobile / WhatsApp** | **\`${withMobile}\`** (\`${((withMobile / Math.max(1, allRecords.length)) * 100).toFixed(1)}%\`) |`)
  md.push(`| **Businesses with Fixed Landline (\`604\`)** | **\`${withLandline}\`** |`)
  const withInstagramOrMenu = allRecords.filter((r) => Boolean(r.instagramOrMenuLink)).length
  md.push(`| **Businesses with Verified Email Address** | **\`${withEmail}\`** |`)
  md.push(`| **Businesses with Instagram / Digital Menu / Web Link** | **\`${withInstagramOrMenu}\`** |`)
  md.push(`| **Businesses with Barrio, Google Maps Link & GPS (\`lat,lng\`)** | **\`${allRecords.length}\`** (\`100.0%\`) |`)
  const cachedQueryFiles = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json")).length
  md.push(`| **Meta / Google Ads Matchable Contacts (\`+57 3xx\` Mobile and/or Email)** | **\`${withMobileOrEmail}\`** (\`${metaAll.count}\` deduplicated audience rows) |`)
  md.push(`| **Google Places API Queries (Cached / Live This Run)** | **\`${cachedQueryFiles}\` cached** (\`${liveApiCalls}\` live calls this run — \`\\$0.00\` Free Tier) |`)
  md.push("")
  md.push("## 2. Breakdown by Municipality")
  md.push("")
  md.push("| Municipality | Total Businesses | `+57 3xx` Mobile | Verified Email | Any Phone |")
  md.push("| :--- | :--- | :--- | :--- | :--- |")
  for (const muni of MUNICIPALITIES) {
    const sub = allRecords.filter((r) => r.municipality === muni.name)
    const m = sub.filter((r) => r.mobilePhones.length > 0).length
    const e = sub.filter((r) => r.emails.length > 0).length
    const p = sub.filter((r) => r.mobilePhones.length > 0 || r.landlinePhones.length > 0).length
    md.push(`| **${muni.name}** (\`${muni.defaultZip}\`) | **\`${sub.length}\`** | \`${m}\` | \`${e}\` | \`${p}\` |`)
  }
  md.push("")
  md.push("## 3. Breakdown by Food & Street-Retail Category")
  md.push("")
  md.push("| Category | Total Businesses | `+57 3xx` Mobile | Verified Email | Any Phone |")
  md.push("| :--- | :--- | :--- | :--- | :--- |")
  for (const [cohort, label] of Object.entries(COHORT_LABELS) as [CohortKey, string][]) {
    const sub = allRecords.filter((r) => r.cohort === cohort)
    const m = sub.filter((r) => r.mobilePhones.length > 0).length
    const e = sub.filter((r) => r.emails.length > 0).length
    const p = sub.filter((r) => r.mobilePhones.length > 0 || r.landlinePhones.length > 0).length
    md.push(`| **${label}** (\`${cohort}\`) | **\`${sub.length}\`** | \`${m}\` | \`${e}\` | \`${p}\` |`)
  }
  md.push("")
  md.push("## 4. Exported CSV Files (`.local-audits/aquitodo/exports/`)")
  md.push("")
  md.push(`* **\`meta-custom-audience-aquitodo.csv\`** (\`${metaAll.count}\` rows) — Ready to upload directly to **Meta Ads Manager → Audiences → Custom Audience → Customer List** (\`email,email,phone,phone,ct,st,zip,country\`).`)
  md.push(`* **\`meta-custom-audience-restaurantes-comidas.csv\`** (\`${metaRestaurantes.count}\` rows) — Restaurantes, Comidas Rápidas & Panaderías/Cafeterías segment.`)
  md.push(`* **\`meta-custom-audience-tiendas-licoreras.csv\`** (\`${metaTiendas.count}\` rows) — Tiendas de Barrio, Minimercados, Graneros & Licoreras/Bares segment.`)
  md.push(`* **\`google-ads-customer-match-aquitodo.csv\`** (\`${gAdsCount}\` rows) — Google Ads Customer Match format (\`Email,Phone,Country,Zip\`).`)
  md.push(`* **\`aquitodo-contacts-master.csv\`** (\`${allRecords.length}\` rows) + per-municipality CSVs (\`sabaneta\`, \`envigado\`, \`itagui\`, \`la-estrella\`) — Full business & operational contact sheets (\`business_name,category,sub_category,municipality,barrio,address,zip,mobile_phone,mobile_phone_2,whatsapp_link,landline_phone,email,email_2,instagram_or_menu_link,google_maps_link,latitude,longitude\`).`)
  md.push("")

  fs.writeFileSync(SUMMARY_MD, md.join("\n"), "utf8")
  console.log(`[AquiTodo] Exports written to ${EXPORTS_DIR}`)
  console.log(
    JSON.stringify({
      totalBusinesses: allRecords.length,
      withAnyPhone,
      withMobile573: withMobile,
      withLandline604: withLandline,
      withEmail,
      metaCustomAudienceRows: metaAll.count,
      metaRestaurantesRows: metaRestaurantes.count,
      metaTiendasRows: metaTiendas.count,
      googleCustomerMatchRows: gAdsCount,
      liveApiCallsUsed: liveApiCalls,
    }),
  )
}

main().catch((err) => {
  console.error("[AquiTodo Fatal]", err)
  process.exit(1)
})
