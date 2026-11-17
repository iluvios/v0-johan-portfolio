import fs from "node:fs"
import path from "node:path"
import { neon } from "@neondatabase/serverless"
import type { ProspectAudit, ProspectAuditDraft } from "../../lib/prospects"
import { PROSPECT_CSV_EXPORT_MAX_ROWS, prospectsToCsv, queryProspects, upsertProspectAudits } from "../../lib/prospects-db"
import { ensureAuditDirs, EXPORTS_DIR, SCORED_FILE } from "./config"

async function main() {
  ensureAuditDirs()
  if (!fs.existsSync(SCORED_FILE)) {
    throw new Error(`Missing ${SCORED_FILE}. Run pnpm prospects:score first.`)
  }

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error("DATABASE_URL is missing in .env.local")
  }

  const lines = fs.readFileSync(SCORED_FILE, "utf8").split(/\r?\n/).filter(Boolean)
  const drafts: ProspectAuditDraft[] = []
  for (const line of lines) {
    try {
      const d = JSON.parse(line) as ProspectAuditDraft
      if (d && d.domain && d.company) drafts.push(d)
    } catch {
      // skip
    }
  }

  const csvOnly = process.argv.includes("--csv-only")
  const sql = neon(dbUrl)
  const beforeSize = (await sql`SELECT pg_size_pretty(pg_database_size(current_database())) AS sz`) as any[]
  let upserted = 0

  if (!csvOnly) {
    console.log(`[Neon Sync] Upserting ${drafts.length} audited prospect records into Neon prospect_audits (batches of 50 with retry)...`)
    upserted = await upsertProspectAudits(sql, drafts, 50)

    const validDomains = drafts.map((d) => d.domain.trim().toLowerCase())
    if (validDomains.length > 0) {
      const prunedRows = (await sql`
        DELETE FROM prospect_audits
        WHERE NOT (domain = ANY(${validDomains}::text[]))
          AND promoted_crm_id IS NULL
        RETURNING domain
      `) as any[]
      if (prunedRows.length > 0) {
        console.log(`[Neon Sync] Pruned ${prunedRows.length} stale/excluded unpromoted domains from prospect_audits.`)
      }
    }
  }

  const afterSize = (await sql`SELECT pg_size_pretty(pg_database_size(current_database())) AS sz`) as any[]
  const crmCountRows = (await sql`SELECT count(*)::int AS cnt FROM crm_items`) as any[]

  // Paginate readback in 1,500-row chunks so slow ISP connections never hit Neon HTTP single-response timeouts
  const pageSize = 1500
  const allItems: ProspectAudit[] = []
  let kpis: Awaited<ReturnType<typeof queryProspects>>["kpis"] = []
  let offset = 0
  while (offset < Math.max(20000, PROSPECT_CSV_EXPORT_MAX_ROWS)) {
    let pageRes: Awaited<ReturnType<typeof queryProspects>> | null = null
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        pageRes = await queryProspects(sql, { limit: pageSize, offset }, pageSize, { omitHeavyJson: true })
        break
      } catch (err) {
        if (attempt === 4) throw err
        await new Promise((r) => setTimeout(r, attempt * 1500))
      }
    }
    if (!pageRes) break
    if (offset === 0) kpis = pageRes.kpis
    allItems.push(...pageRes.items)
    if (pageRes.items.length < pageSize || allItems.length >= pageRes.total) break
    offset += pageSize
  }

  const allCsv = prospectsToCsv(allItems)
  fs.writeFileSync(path.join(EXPORTS_DIR, "prospects-all.csv"), allCsv, "utf8")
  fs.writeFileSync(path.join(EXPORTS_DIR, "prospects-all-cohorts.csv"), allCsv, "utf8")

  const byCohort = new Map<string, ProspectAudit[]>()
  for (const item of allItems) {
    const arr = byCohort.get(item.cohort) || []
    arr.push(item)
    byCohort.set(item.cohort, arr)
  }
  Array.from(byCohort.entries()).forEach(([cohort, list]) => {
    fs.writeFileSync(path.join(EXPORTS_DIR, `prospects-${cohort}.csv`), prospectsToCsv(list), "utf8")
  })

  console.log(`\n=== Stage 5 Neon Sync & CSV Export Complete ===`)
  console.log(`Upserted rows:  ${csvOnly ? `${allItems.length} (csv-only)` : upserted}`)
  console.log(`crm_items rows: ${crmCountRows[0]?.cnt ?? "n/a"} (preserved untouched)`)
  console.log(`Neon DB size:   ${beforeSize[0]?.sz} -> ${afterSize[0]?.sz} (out of 512 MB Free limit; 0 image binaries in DB)`)
  console.table(kpis)
  console.log(`Cohort CSVs exported to: ${EXPORTS_DIR}`)
}

main().catch((err) => {
  console.error("Neon sync failed:", err)
  process.exit(1)
})
