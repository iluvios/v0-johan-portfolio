import fs from "node:fs"
import { CRAWLED_FILE, ensureAuditDirs } from "./config"
import type { CrawledProspectRecord } from "./02-crawl-and-stitch"

function parseArg(name: string, fallback: string): string {
  const prefix = `--${name}=`
  const found = process.argv.find((a) => a.startsWith(prefix))
  return found ? found.slice(prefix.length) : fallback
}

async function main() {
  ensureAuditDirs()

  const enabled = process.argv.includes("--enable-apify")
  if (!enabled) {
    console.log(
      "[Apify Shield] Apify enrichment is OFF by default ($0.00 spent) per user preference.\n" +
        "Pass --enable-apify --mode=profile12 --max-apify-usd=2.50 only if you explicitly wish to spend Apify credits on shortlisted leads.",
    )
    return
  }

  const token = process.env.APIFY_API_TOKEN
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set in .env.local")
  }

  const mode = parseArg("mode", "profile12") // profile12 | deep50
  const maxUsd = Math.max(0.1, Math.min(15, Number(parseArg("max-apify-usd", "2.50")) || 2.5))
  const costPerCompany = mode === "deep50" ? 0.45 : 0.0026
  const maxCompanies = Math.floor(maxUsd / costPerCompany)

  if (!fs.existsSync(CRAWLED_FILE)) {
    throw new Error(`Missing ${CRAWLED_FILE}. Run pnpm prospects:crawl first.`)
  }

  const rows: CrawledProspectRecord[] = fs
    .readFileSync(CRAWLED_FILE, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => JSON.parse(l))

  const igHandles: string[] = []
  for (const r of rows) {
    const ig = r.socialLinks?.instagram
    if (!ig) continue
    const m = ig.match(/instagram\.com\/([a-zA-Z0-9._]{2,40})/i)
    if (m && !["p", "reel", "explore", "stories"].includes(m[1].toLowerCase())) {
      if (!igHandles.includes(m[1])) igHandles.push(m[1])
    }
    if (igHandles.length >= maxCompanies) break
  }

  console.log(
    `[Apify] Running ${mode} on ${igHandles.length} Instagram handles (estimated spend <= $${(
      igHandles.length * costPerCompany
    ).toFixed(2)} / cap $${maxUsd.toFixed(2)})...`,
  )

  if (igHandles.length === 0) {
    console.log("[Apify] No Instagram handles queued.")
    return
  }

  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(
      token,
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: igHandles.slice(0, 50) }),
      signal: AbortSignal.timeout(90000),
    },
  )

  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    throw new Error(`Apify call failed (${res.status}): ${txt.slice(0, 200)}`)
  }

  const items = await res.json()
  console.log(`[Apify] Retrieved ${Array.isArray(items) ? items.length : 0} enriched social profiles.`)
}

main().catch((err) => {
  console.error("Apify enrichment failed:", err)
  process.exit(1)
})
