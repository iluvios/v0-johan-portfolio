import {
  angleLabel,
  cohortLabel,
  OUTREACH_ANGLES,
  PRIORITY_TIERS,
  PROSPECT_COHORTS,
  sanitizeProspectEmails,
  sanitizeProspectSocialLinks,
  type OutreachAngle,
  type PriorityTier,
  type ProspectAudit,
  type ProspectAuditDraft,
  type ProspectCohort,
  type ProspectCohortKpi,
  type ProspectFilterParams,
  type WebsiteStatus,
} from "@/lib/prospects"
import { ensureCrmTable, insertItem, sanitizeDraft, type Sql } from "@/lib/crm-db"

const VALID_COHORTS = new Set<string>(PROSPECT_COHORTS.map((c) => c.value))
const VALID_ANGLES = new Set<string>(OUTREACH_ANGLES.map((a) => a.value))
const VALID_TIERS = new Set<string>(PRIORITY_TIERS.map((t) => t.value))
const VALID_STATUSES = new Set<string>([
  "live",
  "unlinked_on_gbp",
  "social_only_whale",
  "unreachable",
  "missing",
])

let tableEnsured = false

export async function ensureProspectsTable(sql: Sql): Promise<void> {
  if (tableEnsured) return
  await sql`
    CREATE TABLE IF NOT EXISTS prospect_audits (
      id SERIAL PRIMARY KEY,
      domain TEXT NOT NULL UNIQUE,
      company TEXT NOT NULL,
      website_url TEXT,
      website_status VARCHAR(32) NOT NULL DEFAULT 'live',
      cohort VARCHAR(40) NOT NULL,
      sub_category TEXT,
      city TEXT,
      state TEXT,
      metro TEXT,
      formatted_address TEXT,
      google_place_id TEXT,
      google_rating NUMERIC(3,2),
      google_reviews_count INTEGER,
      google_maps_url TEXT,
      google_reviews_sample JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_pe_rollup BOOLEAN NOT NULL DEFAULT FALSE,
      crm_item_id INTEGER,
      promoted_crm_id INTEGER,
      source TEXT NOT NULL DEFAULT 'google_places',
      emails JSONB NOT NULL DEFAULT '[]'::jsonb,
      phones JSONB NOT NULL DEFAULT '[]'::jsonb,
      decision_makers JSONB NOT NULL DEFAULT '[]'::jsonb,
      social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
      has_verified_email BOOLEAN NOT NULL DEFAULT FALSE,
      has_paid_ads BOOLEAN NOT NULL DEFAULT FALSE,
      has_chat_bot BOOLEAN NOT NULL DEFAULT FALSE,
      has_dmarc_risk BOOLEAN NOT NULL DEFAULT FALSE,
      diagnostics JSONB,
      four_pillars JSONB,
      priority_tier VARCHAR(12) NOT NULL DEFAULT 'B',
      business_strength_score SMALLINT NOT NULL DEFAULT 5,
      aesthetics_score SMALLINT NOT NULL DEFAULT 5,
      branding_score SMALLINT NOT NULL DEFAULT 5,
      ux_cro_score SMALLINT NOT NULL DEFAULT 5,
      seo_aeo_score SMALLINT NOT NULL DEFAULT 5,
      tracking_crm_score SMALLINT NOT NULL DEFAULT 5,
      marketing_score SMALLINT NOT NULL DEFAULT 5,
      creative_score SMALLINT NOT NULL DEFAULT 5,
      automation_score SMALLINT NOT NULL DEFAULT 5,
      modernization_gap_score SMALLINT NOT NULL DEFAULT 5,
      review_method VARCHAR(32) NOT NULL DEFAULT 'diagnostic_rubric',
      outreach_angle VARCHAR(48) NOT NULL DEFAULT 'modernize_website',
      top_flaws JSONB NOT NULL DEFAULT '[]'::jsonb,
      visual_critique TEXT,
      personalized_hook TEXT,
      benchmark_ad_ref TEXT,
      spec_ad_url TEXT,
      demo_funnel_url TEXT,
      local_sheet_file TEXT,
      audited_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `
  await sql`ALTER TABLE prospect_audits ADD COLUMN IF NOT EXISTS four_pillars JSONB`
  await sql`ALTER TABLE prospect_audits ADD COLUMN IF NOT EXISTS creative_score SMALLINT NOT NULL DEFAULT 5`
  await sql`CREATE INDEX IF NOT EXISTS idx_prospect_audits_cohort_tier ON prospect_audits (cohort, priority_tier)`
  await sql`CREATE INDEX IF NOT EXISTS idx_prospect_audits_angle ON prospect_audits (outreach_angle)`
  await sql`CREATE INDEX IF NOT EXISTS idx_prospect_audits_gap ON prospect_audits (modernization_gap_score DESC, business_strength_score DESC)`
  tableEnsured = true
}

function clampScore(val: unknown, fallback = 5): number {
  const n = Number(val)
  if (!Number.isFinite(n)) return fallback
  return Math.max(1, Math.min(10, Math.round(n)))
}

export function rowToProspect(row: any): ProspectAudit {
  return {
    id: Number(row.id),
    domain: String(row.domain),
    company: String(row.company),
    websiteUrl: row.website_url ?? null,
    websiteStatus: (VALID_STATUSES.has(row.website_status) ? row.website_status : "live") as WebsiteStatus,
    cohort: (VALID_COHORTS.has(row.cohort) ? row.cohort : "custom_building") as ProspectCohort,
    subCategory: row.sub_category ?? null,
    city: row.city ?? null,
    state: row.state ?? null,
    metro: row.metro ?? null,
    formattedAddress: row.formatted_address ?? null,
    googlePlaceId: row.google_place_id ?? null,
    googleRating: row.google_rating !== null && row.google_rating !== undefined ? Number(row.google_rating) : null,
    googleReviewsCount:
      row.google_reviews_count !== null && row.google_reviews_count !== undefined
        ? Number(row.google_reviews_count)
        : null,
    googleMapsUrl: row.google_maps_url ?? null,
    googleReviewsSample: Array.isArray(row.google_reviews_sample) ? row.google_reviews_sample : [],
    isPeRollup: Boolean(row.is_pe_rollup),
    crmItemId: row.crm_item_id !== null && row.crm_item_id !== undefined ? Number(row.crm_item_id) : null,
    promotedCrmId:
      row.promoted_crm_id !== null && row.promoted_crm_id !== undefined ? Number(row.promoted_crm_id) : null,
    source: row.source ?? "google_places",
    emails: sanitizeProspectEmails(Array.isArray(row.emails) ? row.emails : []),
    phones: Array.isArray(row.phones) ? row.phones : [],
    decisionMakers: Array.isArray(row.decision_makers) ? row.decision_makers : [],
    socialLinks: sanitizeProspectSocialLinks(
      row.social_links && typeof row.social_links === "object" ? row.social_links : {},
    ),
    hasVerifiedEmail: sanitizeProspectEmails(Array.isArray(row.emails) ? row.emails : []).length > 0,
    hasPaidAds: Boolean(row.has_paid_ads),
    hasChatBot: Boolean(row.has_chat_bot),
    hasDmarcRisk: Boolean(row.has_dmarc_risk),
    diagnostics: row.diagnostics && typeof row.diagnostics === "object" ? row.diagnostics : null,
    fourPillars: row.four_pillars && typeof row.four_pillars === "object" ? row.four_pillars : null,
    priorityTier: (VALID_TIERS.has(row.priority_tier) ? row.priority_tier : "B") as PriorityTier,
    businessStrengthScore: clampScore(row.business_strength_score),
    aestheticsScore: clampScore(row.aesthetics_score),
    brandingScore: clampScore(row.branding_score),
    uxCroScore: clampScore(row.ux_cro_score),
    seoAeoScore: clampScore(row.seo_aeo_score),
    trackingCrmScore: clampScore(row.tracking_crm_score),
    marketingScore: clampScore(row.marketing_score),
    creativeScore: clampScore(row.creative_score),
    automationScore: clampScore(row.automation_score),
    modernizationGapScore: clampScore(row.modernization_gap_score),
    reviewMethod:
      row.review_method === "multimodal_vision" || row.review_method === "hybrid"
        ? row.review_method
        : "diagnostic_rubric",
    outreachAngle: (VALID_ANGLES.has(row.outreach_angle) ? row.outreach_angle : "modernize_website") as OutreachAngle,
    topFlaws: Array.isArray(row.top_flaws) ? row.top_flaws : [],
    visualCritique: row.visual_critique ?? null,
    personalizedHook: row.personalized_hook ?? null,
    benchmarkAdRef: row.benchmark_ad_ref ?? null,
    specAdUrl: row.spec_ad_url ?? null,
    demoFunnelUrl: row.demo_funnel_url ?? null,
    localSheetFile: row.local_sheet_file ?? null,
    auditedAt: row.audited_at ? new Date(row.audited_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  }
}

export function normalizeProspectDraft(input: Partial<ProspectAuditDraft>): ProspectAuditDraft | null {
  const domain = typeof input.domain === "string" ? input.domain.trim().toLowerCase().slice(0, 255) : ""
  const company = typeof input.company === "string" ? input.company.trim().slice(0, 250) : ""
  if (!domain || !company) return null

  const emails = sanitizeProspectEmails(Array.isArray(input.emails) ? input.emails : []).slice(0, 15)
  const diagnostics = input.diagnostics && typeof input.diagnostics === "object" ? input.diagnostics : null
  const fourPillars = input.fourPillars && typeof input.fourPillars === "object" ? input.fourPillars : null
  const hasPaidAds =
    typeof input.hasPaidAds === "boolean"
      ? input.hasPaidAds
      : Boolean(
          diagnostics?.tracking?.hasGoogleAds ||
            diagnostics?.tracking?.hasMetaPixel ||
            diagnostics?.tracking?.hasTikTokPixel ||
            diagnostics?.tracking?.hasLinkedInInsight ||
            diagnostics?.tracking?.hasBingUet,
        )
  const hasChatBot =
    typeof input.hasChatBot === "boolean" ? input.hasChatBot : Boolean(diagnostics?.crmIntake?.hasChatBot)
  const hasDmarcRisk =
    typeof input.hasDmarcRisk === "boolean"
      ? input.hasDmarcRisk
      : Boolean(
          diagnostics?.emailDns &&
            (!diagnostics.emailDns.hasDmarc || diagnostics.emailDns.dmarcPolicy === "none"),
        )

  return {
    domain,
    company,
    websiteUrl: input.websiteUrl ? String(input.websiteUrl).slice(0, 600) : null,
    websiteStatus: (VALID_STATUSES.has(String(input.websiteStatus)) ? input.websiteStatus : "live") as WebsiteStatus,
    cohort: (VALID_COHORTS.has(String(input.cohort)) ? input.cohort : "custom_building") as ProspectCohort,
    subCategory: input.subCategory ? String(input.subCategory).slice(0, 160) : null,
    city: input.city ? String(input.city).slice(0, 120) : null,
    state: input.state ? String(input.state).slice(0, 60) : null,
    metro: input.metro ? String(input.metro).slice(0, 120) : null,
    formattedAddress: input.formattedAddress ? String(input.formattedAddress).slice(0, 300) : null,
    googlePlaceId: input.googlePlaceId ? String(input.googlePlaceId).slice(0, 160) : null,
    googleRating:
      input.googleRating !== null && input.googleRating !== undefined && Number.isFinite(Number(input.googleRating))
        ? Number(Number(input.googleRating).toFixed(2))
        : null,
    googleReviewsCount:
      input.googleReviewsCount !== null &&
      input.googleReviewsCount !== undefined &&
      Number.isFinite(Number(input.googleReviewsCount))
        ? Math.max(0, Math.round(Number(input.googleReviewsCount)))
        : null,
    googleMapsUrl: input.googleMapsUrl ? String(input.googleMapsUrl).slice(0, 600) : null,
    googleReviewsSample: Array.isArray(input.googleReviewsSample) ? input.googleReviewsSample.slice(0, 5) : [],
    isPeRollup: Boolean(input.isPeRollup),
    crmItemId:
      input.crmItemId !== null && input.crmItemId !== undefined && Number.isFinite(Number(input.crmItemId))
        ? Math.round(Number(input.crmItemId))
        : null,
    source: input.source ? String(input.source).slice(0, 80) : "google_places",
    emails,
    phones: Array.isArray(input.phones) ? input.phones.map((p) => String(p).slice(0, 40)).slice(0, 10) : [],
    decisionMakers: Array.isArray(input.decisionMakers) ? input.decisionMakers.slice(0, 10) : [],
    socialLinks: sanitizeProspectSocialLinks(
      input.socialLinks && typeof input.socialLinks === "object" ? input.socialLinks : {},
    ),
    hasVerifiedEmail: emails.length > 0,
    hasPaidAds,
    hasChatBot,
    hasDmarcRisk,
    diagnostics,
    fourPillars,
    priorityTier: (VALID_TIERS.has(String(input.priorityTier)) ? input.priorityTier : "B") as PriorityTier,
    businessStrengthScore: clampScore(input.businessStrengthScore),
    aestheticsScore: clampScore(input.aestheticsScore),
    brandingScore: clampScore(input.brandingScore),
    uxCroScore: clampScore(input.uxCroScore),
    seoAeoScore: clampScore(input.seoAeoScore),
    trackingCrmScore: clampScore(input.trackingCrmScore),
    marketingScore: clampScore(input.marketingScore),
    creativeScore: clampScore(input.creativeScore ?? fourPillars?.creativePart?.score),
    automationScore: clampScore(input.automationScore),
    modernizationGapScore: clampScore(input.modernizationGapScore),
    reviewMethod:
      input.reviewMethod === "multimodal_vision" || input.reviewMethod === "hybrid"
        ? input.reviewMethod
        : "diagnostic_rubric",
    outreachAngle: (VALID_ANGLES.has(String(input.outreachAngle))
      ? input.outreachAngle
      : "modernize_website") as OutreachAngle,
    topFlaws: Array.isArray(input.topFlaws)
      ? input.topFlaws.map((f) => String(f).slice(0, 300)).slice(0, 6)
      : [],
    visualCritique: input.visualCritique ? String(input.visualCritique).slice(0, 4000) : null,
    personalizedHook: input.personalizedHook ? String(input.personalizedHook).slice(0, 4000) : null,
    benchmarkAdRef: input.benchmarkAdRef ? String(input.benchmarkAdRef).slice(0, 500) : null,
    specAdUrl: input.specAdUrl ? String(input.specAdUrl).slice(0, 600) : null,
    demoFunnelUrl: input.demoFunnelUrl ? String(input.demoFunnelUrl).slice(0, 600) : null,
    localSheetFile: input.localSheetFile ? String(input.localSheetFile).slice(0, 300) : null,
    auditedAt: input.auditedAt ? String(input.auditedAt) : new Date().toISOString(),
  }
}

function cleanPgString(raw: string): string {
  const noNul = raw.indexOf("\u0000") >= 0 ? raw.replace(/\u0000/g, "") : raw
  const maybeToWellFormed = (noNul as unknown as { toWellFormed?: () => string }).toWellFormed
  if (typeof maybeToWellFormed === "function") {
    return maybeToWellFormed.call(noNul)
  }
  return noNul.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "\uFFFD")
}

export async function upsertProspectAudits(sql: Sql, drafts: ProspectAuditDraft[], batchSize = 100): Promise<number> {
  await ensureProspectsTable(sql)
  const dedupedMap = new Map<string, ProspectAuditDraft>()
  for (const raw of drafts) {
    const clean = normalizeProspectDraft(raw)
    if (clean) dedupedMap.set(clean.domain, clean)
  }
  const all = Array.from(dedupedMap.values())
  let upserted = 0

  for (let i = 0; i < all.length; i += batchSize) {
    const chunk = all.slice(i, i + batchSize)
    const payload = JSON.stringify(chunk, (_k, v) => (typeof v === "string" ? cleanPgString(v) : v))
    let res: any[] = []
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        res = (await sql`
      INSERT INTO prospect_audits (
        domain, company, website_url, website_status, cohort, sub_category,
        city, state, metro, formatted_address, google_place_id, google_rating,
        google_reviews_count, google_maps_url, google_reviews_sample, is_pe_rollup,
        crm_item_id, source, emails, phones, decision_makers, social_links,
        has_verified_email, has_paid_ads, has_chat_bot, has_dmarc_risk,
        diagnostics, four_pillars,
        priority_tier, business_strength_score, aesthetics_score, branding_score,
        ux_cro_score, seo_aeo_score, tracking_crm_score, marketing_score,
        creative_score, automation_score, modernization_gap_score, review_method,
        outreach_angle, top_flaws, visual_critique, personalized_hook,
        benchmark_ad_ref, spec_ad_url, demo_funnel_url, local_sheet_file,
        audited_at, updated_at
      )
      SELECT
        (elem->>'domain')::text,
        (elem->>'company')::text,
        NULLIF(elem->>'websiteUrl', ''),
        COALESCE(NULLIF(elem->>'websiteStatus', ''), 'live'),
        (elem->>'cohort')::text,
        NULLIF(elem->>'subCategory', ''),
        NULLIF(elem->>'city', ''),
        NULLIF(elem->>'state', ''),
        NULLIF(elem->>'metro', ''),
        NULLIF(elem->>'formattedAddress', ''),
        NULLIF(elem->>'googlePlaceId', ''),
        NULLIF(elem->>'googleRating', '')::numeric(3,2),
        NULLIF(elem->>'googleReviewsCount', '')::integer,
        NULLIF(elem->>'googleMapsUrl', ''),
        COALESCE(elem->'googleReviewsSample', '[]'::jsonb),
        COALESCE((elem->>'isPeRollup')::boolean, FALSE),
        NULLIF(elem->>'crmItemId', '')::integer,
        COALESCE(NULLIF(elem->>'source', ''), 'google_places'),
        COALESCE(elem->'emails', '[]'::jsonb),
        COALESCE(elem->'phones', '[]'::jsonb),
        COALESCE(elem->'decisionMakers', '[]'::jsonb),
        COALESCE(elem->'socialLinks', '{}'::jsonb),
        COALESCE((elem->>'hasVerifiedEmail')::boolean, FALSE),
        COALESCE((elem->>'hasPaidAds')::boolean, FALSE),
        COALESCE((elem->>'hasChatBot')::boolean, FALSE),
        COALESCE((elem->>'hasDmarcRisk')::boolean, FALSE),
        CASE WHEN jsonb_typeof(elem->'diagnostics') = 'object' THEN elem->'diagnostics' ELSE NULL END,
        CASE WHEN jsonb_typeof(elem->'fourPillars') = 'object' THEN elem->'fourPillars' ELSE NULL END,
        COALESCE(NULLIF(elem->>'priorityTier', ''), 'B'),
        COALESCE((elem->>'businessStrengthScore')::smallint, 5),
        COALESCE((elem->>'aestheticsScore')::smallint, 5),
        COALESCE((elem->>'brandingScore')::smallint, 5),
        COALESCE((elem->>'uxCroScore')::smallint, 5),
        COALESCE((elem->>'seoAeoScore')::smallint, 5),
        COALESCE((elem->>'trackingCrmScore')::smallint, 5),
        COALESCE((elem->>'marketingScore')::smallint, 5),
        COALESCE((elem->>'creativeScore')::smallint, 5),
        COALESCE((elem->>'automationScore')::smallint, 5),
        COALESCE((elem->>'modernizationGapScore')::smallint, 5),
        COALESCE(NULLIF(elem->>'reviewMethod', ''), 'diagnostic_rubric'),
        COALESCE(NULLIF(elem->>'outreachAngle', ''), 'modernize_website'),
        COALESCE(elem->'topFlaws', '[]'::jsonb),
        NULLIF(elem->>'visualCritique', ''),
        NULLIF(elem->>'personalizedHook', ''),
        NULLIF(elem->>'benchmarkAdRef', ''),
        NULLIF(elem->>'specAdUrl', ''),
        NULLIF(elem->>'demoFunnelUrl', ''),
        NULLIF(elem->>'localSheetFile', ''),
        NULLIF(elem->>'auditedAt', '')::timestamptz,
        CURRENT_TIMESTAMP
      FROM jsonb_array_elements(${payload}::jsonb) AS elem
      ON CONFLICT (domain) DO UPDATE SET
        company = EXCLUDED.company,
        website_url = COALESCE(EXCLUDED.website_url, prospect_audits.website_url),
        website_status = EXCLUDED.website_status,
        cohort = EXCLUDED.cohort,
        sub_category = COALESCE(EXCLUDED.sub_category, prospect_audits.sub_category),
        city = COALESCE(EXCLUDED.city, prospect_audits.city),
        state = COALESCE(EXCLUDED.state, prospect_audits.state),
        metro = COALESCE(EXCLUDED.metro, prospect_audits.metro),
        formatted_address = COALESCE(EXCLUDED.formatted_address, prospect_audits.formatted_address),
        google_place_id = COALESCE(EXCLUDED.google_place_id, prospect_audits.google_place_id),
        google_rating = COALESCE(EXCLUDED.google_rating, prospect_audits.google_rating),
        google_reviews_count = COALESCE(EXCLUDED.google_reviews_count, prospect_audits.google_reviews_count),
        google_maps_url = COALESCE(EXCLUDED.google_maps_url, prospect_audits.google_maps_url),
        google_reviews_sample = CASE
          WHEN jsonb_array_length(EXCLUDED.google_reviews_sample) > 0 THEN EXCLUDED.google_reviews_sample
          ELSE prospect_audits.google_reviews_sample
        END,
        is_pe_rollup = EXCLUDED.is_pe_rollup,
        crm_item_id = COALESCE(EXCLUDED.crm_item_id, prospect_audits.crm_item_id),
        source = EXCLUDED.source,
        emails = EXCLUDED.emails,
        phones = EXCLUDED.phones,
        decision_makers = EXCLUDED.decision_makers,
        social_links = EXCLUDED.social_links,
        has_verified_email = EXCLUDED.has_verified_email,
        has_paid_ads = EXCLUDED.has_paid_ads,
        has_chat_bot = EXCLUDED.has_chat_bot,
        has_dmarc_risk = EXCLUDED.has_dmarc_risk,
        diagnostics = COALESCE(EXCLUDED.diagnostics, prospect_audits.diagnostics),
        four_pillars = COALESCE(EXCLUDED.four_pillars, prospect_audits.four_pillars),
        priority_tier = EXCLUDED.priority_tier,
        business_strength_score = EXCLUDED.business_strength_score,
        aesthetics_score = EXCLUDED.aesthetics_score,
        branding_score = EXCLUDED.branding_score,
        ux_cro_score = EXCLUDED.ux_cro_score,
        seo_aeo_score = EXCLUDED.seo_aeo_score,
        tracking_crm_score = EXCLUDED.tracking_crm_score,
        marketing_score = EXCLUDED.marketing_score,
        creative_score = EXCLUDED.creative_score,
        automation_score = EXCLUDED.automation_score,
        modernization_gap_score = EXCLUDED.modernization_gap_score,
        review_method = EXCLUDED.review_method,
        outreach_angle = EXCLUDED.outreach_angle,
        top_flaws = EXCLUDED.top_flaws,
        visual_critique = COALESCE(EXCLUDED.visual_critique, prospect_audits.visual_critique),
        personalized_hook = COALESCE(EXCLUDED.personalized_hook, prospect_audits.personalized_hook),
        benchmark_ad_ref = COALESCE(EXCLUDED.benchmark_ad_ref, prospect_audits.benchmark_ad_ref),
        spec_ad_url = COALESCE(EXCLUDED.spec_ad_url, prospect_audits.spec_ad_url),
        demo_funnel_url = COALESCE(EXCLUDED.demo_funnel_url, prospect_audits.demo_funnel_url),
        local_sheet_file = COALESCE(EXCLUDED.local_sheet_file, prospect_audits.local_sheet_file),
        audited_at = COALESCE(EXCLUDED.audited_at, prospect_audits.audited_at),
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `) as any[]
        break
      } catch (err) {
        if (attempt === 4) throw err
        await new Promise((r) => setTimeout(r, attempt * 1500))
      }
    }
    upserted += res.length
  }
  return upserted
}

export const PROSPECT_CSV_EXPORT_MAX_ROWS = 20000

export async function queryProspects(
  sql: Sql,
  filters: ProspectFilterParams,
  maxRows = 150,
  options?: { omitHeavyJson?: boolean },
): Promise<{ items: ProspectAudit[]; total: number; kpis: ProspectCohortKpi[] }> {
  await ensureProspectsTable(sql)
  const cohort = filters.cohort && filters.cohort !== "all" && VALID_COHORTS.has(filters.cohort) ? filters.cohort : null
  const tier = filters.tier && filters.tier !== "all" && VALID_TIERS.has(filters.tier) ? filters.tier : null
  const angle = filters.angle && filters.angle !== "all" && VALID_ANGLES.has(filters.angle) ? filters.angle : null
  const sourceFilter =
    filters.source === "net_new" ||
    filters.source === "existing_crm" ||
    filters.source === "page2_challengers" ||
    filters.source === "page3_challengers"
      ? filters.source
      : null
  const metro = filters.metro && filters.metro !== "all" ? filters.metro.slice(0, 120) : null
  const hasEmail = Boolean(filters.hasEmail)
  const hasAds = Boolean(filters.hasAds)
  const needsBot = Boolean(filters.needsBot)
  const minRating =
    typeof filters.minRating === "number" && Number.isFinite(filters.minRating)
      ? String(filters.minRating)
      : null
  const maxRating =
    typeof filters.maxRating === "number" && Number.isFinite(filters.maxRating)
      ? String(filters.maxRating)
      : null
  const PG_INT_MIN = -2147483648
  const PG_INT_MAX = 2147483647
  const minReviews =
    typeof filters.minReviews === "number" && Number.isFinite(filters.minReviews)
      ? Math.max(PG_INT_MIN, Math.min(PG_INT_MAX, Math.ceil(filters.minReviews)))
      : null
  const maxReviews =
    typeof filters.maxReviews === "number" && Number.isFinite(filters.maxReviews)
      ? Math.max(PG_INT_MIN, Math.min(PG_INT_MAX, Math.floor(filters.maxReviews)))
      : null
  const escapedSearch =
    filters.search && filters.search.trim()
      ? filters.search.trim().slice(0, 100).replace(/[\\%_]/g, "\\$&")
      : null
  const searchPattern = escapedSearch ? `%${escapedSearch}%` : null
  const rawLimit = Number(filters.limit)
  const limit = Math.max(1, Math.min(maxRows, Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : 80))
  const rawOffset = Number(filters.offset)
  const offset = Math.min(1_000_000, Math.max(0, Number.isFinite(rawOffset) ? Math.floor(rawOffset) : 0))
  const omitHeavyJson = Boolean(options?.omitHeavyJson)

  const fetchRowsSlice = (sliceLimit: number, sliceOffset: number): Promise<any[]> => {
    if (omitHeavyJson) {
      return sql`
        SELECT
          id, domain, company, website_url, website_status, cohort, sub_category,
          city, state, metro, formatted_address, google_place_id, google_rating,
          google_reviews_count, google_maps_url, '[]'::jsonb AS google_reviews_sample,
          is_pe_rollup, crm_item_id, promoted_crm_id, source, emails, phones,
          decision_makers, social_links, has_verified_email, has_paid_ads,
          has_chat_bot, has_dmarc_risk, NULL::jsonb AS diagnostics, four_pillars,
          priority_tier, business_strength_score, aesthetics_score, branding_score,
          ux_cro_score, seo_aeo_score, tracking_crm_score, marketing_score,
          creative_score, automation_score, modernization_gap_score, review_method,
          outreach_angle, top_flaws, visual_critique, personalized_hook,
          benchmark_ad_ref, spec_ad_url, demo_funnel_url, local_sheet_file,
          audited_at, created_at, updated_at
        FROM prospect_audits
        WHERE (${cohort}::text IS NULL OR cohort = ${cohort})
          AND (${tier}::text IS NULL OR priority_tier = ${tier})
          AND (${angle}::text IS NULL OR outreach_angle = ${angle})
          AND (
            ${sourceFilter}::text IS NULL
            OR (${sourceFilter} = 'net_new' AND crm_item_id IS NULL)
            OR (${sourceFilter} = 'existing_crm' AND crm_item_id IS NOT NULL)
            OR (${sourceFilter} = 'page2_challengers' AND source IN ('google_places_50metros_p2', 'google_places_50metros_p3'))
            OR (${sourceFilter} = 'page3_challengers' AND source = 'google_places_50metros_p3')
          )
          AND (${metro}::text IS NULL OR metro = ${metro})
          AND (${hasEmail}::boolean IS FALSE OR has_verified_email = TRUE)
          AND (${hasAds}::boolean IS FALSE OR has_paid_ads = TRUE)
          AND (${needsBot}::boolean IS FALSE OR has_chat_bot = FALSE)
          AND (${minRating}::numeric IS NULL OR (google_rating IS NOT NULL AND google_rating >= ${minRating}::numeric))
          AND (${maxRating}::numeric IS NULL OR (google_rating IS NOT NULL AND google_rating <= ${maxRating}::numeric))
          AND (${minReviews}::int IS NULL OR (google_reviews_count IS NOT NULL AND google_reviews_count >= ${minReviews}::int))
          AND (${maxReviews}::int IS NULL OR (google_reviews_count IS NOT NULL AND google_reviews_count <= ${maxReviews}::int))
          AND (
            ${searchPattern}::text IS NULL
            OR company ILIKE ${searchPattern} ESCAPE '\\'
            OR domain ILIKE ${searchPattern} ESCAPE '\\'
            OR COALESCE(city, '') ILIKE ${searchPattern} ESCAPE '\\'
            OR COALESCE(metro, '') ILIKE ${searchPattern} ESCAPE '\\'
            OR COALESCE(sub_category, '') ILIKE ${searchPattern} ESCAPE '\\'
          )
        ORDER BY
          CASE priority_tier
            WHEN 'S' THEN 1
            WHEN 'A' THEN 2
            WHEN 'B' THEN 3
            WHEN 'C' THEN 4
            ELSE 5
          END ASC,
          modernization_gap_score DESC,
          business_strength_score DESC,
          COALESCE(google_reviews_count, 0) DESC,
          id ASC
        LIMIT ${sliceLimit} OFFSET ${sliceOffset}
      ` as Promise<any[]>
    }

    return sql`
      SELECT *
      FROM prospect_audits
      WHERE (${cohort}::text IS NULL OR cohort = ${cohort})
        AND (${tier}::text IS NULL OR priority_tier = ${tier})
        AND (${angle}::text IS NULL OR outreach_angle = ${angle})
        AND (
          ${sourceFilter}::text IS NULL
          OR (${sourceFilter} = 'net_new' AND crm_item_id IS NULL)
          OR (${sourceFilter} = 'existing_crm' AND crm_item_id IS NOT NULL)
          OR (${sourceFilter} = 'page2_challengers' AND source IN ('google_places_50metros_p2', 'google_places_50metros_p3'))
          OR (${sourceFilter} = 'page3_challengers' AND source = 'google_places_50metros_p3')
        )
        AND (${metro}::text IS NULL OR metro = ${metro})
        AND (${hasEmail}::boolean IS FALSE OR has_verified_email = TRUE)
        AND (${hasAds}::boolean IS FALSE OR has_paid_ads = TRUE)
        AND (${needsBot}::boolean IS FALSE OR has_chat_bot = FALSE)
        AND (${minRating}::numeric IS NULL OR (google_rating IS NOT NULL AND google_rating >= ${minRating}::numeric))
        AND (${maxRating}::numeric IS NULL OR (google_rating IS NOT NULL AND google_rating <= ${maxRating}::numeric))
        AND (${minReviews}::int IS NULL OR (google_reviews_count IS NOT NULL AND google_reviews_count >= ${minReviews}::int))
        AND (${maxReviews}::int IS NULL OR (google_reviews_count IS NOT NULL AND google_reviews_count <= ${maxReviews}::int))
        AND (
          ${searchPattern}::text IS NULL
          OR company ILIKE ${searchPattern} ESCAPE '\\'
          OR domain ILIKE ${searchPattern} ESCAPE '\\'
          OR COALESCE(city, '') ILIKE ${searchPattern} ESCAPE '\\'
          OR COALESCE(metro, '') ILIKE ${searchPattern} ESCAPE '\\'
          OR COALESCE(sub_category, '') ILIKE ${searchPattern} ESCAPE '\\'
        )
      ORDER BY
        CASE priority_tier
          WHEN 'S' THEN 1
          WHEN 'A' THEN 2
          WHEN 'B' THEN 3
          WHEN 'C' THEN 4
          ELSE 5
        END ASC,
        modernization_gap_score DESC,
        business_strength_score DESC,
        COALESCE(google_reviews_count, 0) DESC,
        id ASC
      LIMIT ${sliceLimit} OFFSET ${sliceOffset}
    ` as Promise<any[]>
  }

  // Neon serverless HTTP enforces a 64 MB single-response limit; chunk queries > 2,000 rows automatically
  const fetchAllRows = async (): Promise<any[]> => {
    const CHUNK_SIZE = 2000
    if (limit <= CHUNK_SIZE) {
      return fetchRowsSlice(limit, offset)
    }
    const collected: any[] = []
    let remaining = limit
    let curOffset = offset
    while (remaining > 0) {
      const chunkLimit = Math.min(CHUNK_SIZE, remaining)
      const chunk = await fetchRowsSlice(chunkLimit, curOffset)
      collected.push(...chunk)
      if (chunk.length < chunkLimit) break
      remaining -= chunk.length
      curOffset += chunk.length
    }
    return collected
  }

  const [rows, countRows, kpiRows] = await Promise.all([
    fetchAllRows(),
    sql`
      SELECT count(*)::int AS total
      FROM prospect_audits
      WHERE (${cohort}::text IS NULL OR cohort = ${cohort})
        AND (${tier}::text IS NULL OR priority_tier = ${tier})
        AND (${angle}::text IS NULL OR outreach_angle = ${angle})
        AND (
          ${sourceFilter}::text IS NULL
          OR (${sourceFilter} = 'net_new' AND crm_item_id IS NULL)
          OR (${sourceFilter} = 'existing_crm' AND crm_item_id IS NOT NULL)
          OR (${sourceFilter} = 'page2_challengers' AND source IN ('google_places_50metros_p2', 'google_places_50metros_p3'))
          OR (${sourceFilter} = 'page3_challengers' AND source = 'google_places_50metros_p3')
        )
        AND (${metro}::text IS NULL OR metro = ${metro})
        AND (${hasEmail}::boolean IS FALSE OR has_verified_email = TRUE)
        AND (${hasAds}::boolean IS FALSE OR has_paid_ads = TRUE)
        AND (${needsBot}::boolean IS FALSE OR has_chat_bot = FALSE)
        AND (${minRating}::numeric IS NULL OR (google_rating IS NOT NULL AND google_rating >= ${minRating}::numeric))
        AND (${maxRating}::numeric IS NULL OR (google_rating IS NOT NULL AND google_rating <= ${maxRating}::numeric))
        AND (${minReviews}::int IS NULL OR (google_reviews_count IS NOT NULL AND google_reviews_count >= ${minReviews}::int))
        AND (${maxReviews}::int IS NULL OR (google_reviews_count IS NOT NULL AND google_reviews_count <= ${maxReviews}::int))
        AND (
          ${searchPattern}::text IS NULL
          OR company ILIKE ${searchPattern} ESCAPE '\\'
          OR domain ILIKE ${searchPattern} ESCAPE '\\'
          OR COALESCE(city, '') ILIKE ${searchPattern} ESCAPE '\\'
          OR COALESCE(metro, '') ILIKE ${searchPattern} ESCAPE '\\'
          OR COALESCE(sub_category, '') ILIKE ${searchPattern} ESCAPE '\\'
        )
    ` as Promise<any[]>,
    sql`
      SELECT
        cohort,
        count(*)::int AS total,
        count(*) FILTER (WHERE priority_tier = 'S')::int AS tier_s,
        count(*) FILTER (WHERE priority_tier = 'A')::int AS tier_a,
        count(*) FILTER (WHERE has_verified_email = TRUE)::int AS with_email,
        count(*) FILTER (WHERE has_paid_ads = TRUE)::int AS with_paid_ads,
        count(*) FILTER (WHERE has_chat_bot = FALSE)::int AS without_bot,
        ROUND(AVG(business_strength_score)::numeric, 1) AS avg_strength,
        ROUND(AVG(modernization_gap_score)::numeric, 1) AS avg_gap
      FROM prospect_audits
      GROUP BY cohort
      ORDER BY total DESC
    ` as Promise<any[]>,
  ])

  const kpis: ProspectCohortKpi[] = kpiRows
    .filter((r) => VALID_COHORTS.has(r.cohort))
    .map((r) => ({
      cohort: r.cohort as ProspectCohort,
      total: Number(r.total) || 0,
      tierS: Number(r.tier_s) || 0,
      tierA: Number(r.tier_a) || 0,
      withEmail: Number(r.with_email) || 0,
      withPaidAds: Number(r.with_paid_ads) || 0,
      withoutBot: Number(r.without_bot) || 0,
      avgBusinessStrength: Number(r.avg_strength) || 0,
      avgModernizationGap: Number(r.avg_gap) || 0,
    }))

  return {
    items: rows.map(rowToProspect),
    total: Number(countRows[0]?.total) || 0,
    kpis,
  }
}

export const listProspectAudits = queryProspects

export class InvalidProspectPatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidProspectPatchError"
  }
}

export async function patchProspectAudit(
  sql: Sql,
  id: number,
  patch: {
    priorityTier?: string
    outreachAngle?: string
    personalizedHook?: string | null
    visualCritique?: string | null
  },
): Promise<ProspectAudit | null> {
  if (patch.priorityTier !== undefined && (typeof patch.priorityTier !== "string" || !VALID_TIERS.has(patch.priorityTier))) {
    throw new InvalidProspectPatchError("Invalid priorityTier value")
  }
  if (patch.outreachAngle !== undefined && (typeof patch.outreachAngle !== "string" || !VALID_ANGLES.has(patch.outreachAngle))) {
    throw new InvalidProspectPatchError("Invalid outreachAngle value")
  }

  await ensureProspectsTable(sql)
  const tier = patch.priorityTier ?? null
  const angle = patch.outreachAngle ?? null
  const hook =
    patch.personalizedHook !== undefined
      ? patch.personalizedHook
        ? cleanPgString(String(patch.personalizedHook).slice(0, 4000))
        : null
      : undefined
  const critique =
    patch.visualCritique !== undefined
      ? patch.visualCritique
        ? cleanPgString(String(patch.visualCritique).slice(0, 4000))
        : null
      : undefined

  const rows = (await sql`
    UPDATE prospect_audits
    SET
      priority_tier = COALESCE(${tier}, priority_tier),
      outreach_angle = COALESCE(${angle}, outreach_angle),
      personalized_hook = CASE WHEN ${hook !== undefined} THEN ${hook ?? null} ELSE personalized_hook END,
      visual_critique = CASE WHEN ${critique !== undefined} THEN ${critique ?? null} ELSE visual_critique END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `) as any[]
  return rows[0] ? rowToProspect(rows[0]) : null
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  const raw = String(value)
  const startsWithTabOrCr = /^[\t\r]/.test(raw)
  const s = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const safe = startsWithTabOrCr || /^[\t\r\n\s]*[=+\-@|]/.test(s) ? `'${s}` : s
  if (/[",\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

function mergeIdempotentAuditNotes(existingNotes: string | null | undefined, auditSummary: string): string {
  const marker = "[360° Prospect Audit —"
  if (!existingNotes) return auditSummary.slice(0, 20000)
  const raw = String(existingNotes)
  const sepIdx = raw.indexOf(`\n\n---\n${marker}`)
  if (sepIdx >= 0) {
    return `${raw.slice(0, sepIdx).trim()}\n\n---\n${auditSummary}`.slice(0, 20000)
  }
  if (raw.trimStart().startsWith(marker)) {
    return auditSummary.slice(0, 20000)
  }
  return `${raw.trim()}\n\n---\n${auditSummary}`.slice(0, 20000)
}

export function prospectsToCsv(items: ProspectAudit[]): string {
  const headers = [
    "id",
    "priority_tier",
    "cohort",
    "sub_category",
    "company",
    "domain",
    "website_url",
    "website_status",
    "city",
    "state",
    "metro",
    "google_rating",
    "google_reviews_count",
    "google_maps_url",
    "primary_email",
    "all_emails",
    "primary_phone",
    "decision_maker_name",
    "decision_maker_role",
    "instagram",
    "facebook",
    "linkedin",
    "has_paid_ads",
    "has_chat_bot",
    "has_dmarc_risk",
    "business_strength_score",
    "modernization_gap_score",
    "step1_branding_ux_score",
    "step1_branding_ux_goods",
    "step1_branding_ux_bads",
    "step2_can_it_sell_verdict",
    "step2_marketing_sales_score",
    "step2_marketing_goods",
    "step2_marketing_bads",
    "step3_technical_stack_score",
    "step3_detected_stack",
    "step3_technical_goods",
    "step3_technical_bads",
    "creative_differentiation_score",
    "creative_is_cliche",
    "creative_upside_pitch",
    "step4_automation_optional_score",
    "step4_automation_tools",
    "outreach_angle",
    "top_flaws",
    "visual_critique",
    "personalized_hook",
  ]
  const lines = [headers.join(",")]
  for (const p of items) {
    const ownerEmail = p.emails.find((e) => e.kind === "owner")?.address ?? p.emails[0]?.address ?? ""
    const dm = p.decisionMakers[0]
    const fp = p.fourPillars
    const row = [
      p.id,
      p.priorityTier,
      p.cohort,
      p.subCategory ?? "",
      p.company,
      p.domain,
      p.websiteUrl ?? "",
      p.websiteStatus,
      p.city ?? "",
      p.state ?? "",
      p.metro ?? "",
      p.googleRating ?? "",
      p.googleReviewsCount ?? "",
      p.googleMapsUrl ?? "",
      ownerEmail,
      p.emails.map((e) => e.address).join("; "),
      p.phones[0] ?? "",
      dm?.name ?? "",
      dm?.role ?? "",
      p.socialLinks.instagram ?? "",
      p.socialLinks.facebook ?? "",
      p.socialLinks.linkedin ?? dm?.linkedin ?? "",
      p.hasPaidAds ? "yes" : "no",
      p.hasChatBot ? "yes" : "no",
      p.hasDmarcRisk ? "yes" : "no",
      p.businessStrengthScore,
      p.modernizationGapScore,
      fp?.brandingUxUi.score ?? Math.round((p.aestheticsScore + p.brandingScore) / 2),
      fp?.brandingUxUi.goods.join(" | ") ?? "",
      fp?.brandingUxUi.bads.join(" | ") ?? "",
      fp?.marketingSales.canItSellVerdict ?? "",
      fp?.marketingSales.score ?? p.marketingScore,
      fp?.marketingSales.goods.join(" | ") ?? "",
      fp?.marketingSales.bads.join(" | ") ?? "",
      fp?.technicalStack.score ?? Math.round((p.seoAeoScore + p.trackingCrmScore) / 2),
      fp?.technicalStack.detectedStack.join(", ") ?? "",
      fp?.technicalStack.goods.join(" | ") ?? "",
      fp?.technicalStack.bads.join(" | ") ?? "",
      fp?.creativePart.score ?? p.creativeScore,
      fp?.creativePart.isGenericCliche ? "yes" : "no",
      fp?.creativePart.creativeUpsidePitch ?? "",
      fp?.automation.score ?? p.automationScore,
      fp?.automation.detectedTools.join(", ") ?? "",
      p.outreachAngle,
      p.topFlaws.join(" | "),
      p.visualCritique ?? "",
      p.personalizedHook ?? "",
    ]
    lines.push(row.map(escapeCsvCell).join(","))
  }
  return lines.join("\n")
}

function extractNormalizedHost(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const u = new URL(withProto)
    const host = u.hostname.toLowerCase().replace(/^www\./, "")
    if (!host || !host.includes(".") || host.endsWith(".local")) return null
    return host
  } catch {
    return null
  }
}

export async function promoteProspectsToCrm(
  sql: Sql,
  ids: number[],
): Promise<{ promoted: number; crmIds: number[]; promotedMap: Record<string, number> }> {
  await ensureProspectsTable(sql)
  await ensureCrmTable(sql)
  const cleanIds = Array.from(new Set(ids.filter((n) => Number.isSafeInteger(n) && n > 0))).slice(0, 100)
  if (cleanIds.length === 0) return { promoted: 0, crmIds: [], promotedMap: {} }

  const rows = (await sql`
    SELECT * FROM prospect_audits WHERE id = ANY(${cleanIds}::int[])
  `) as any[]

  const crmIds: number[] = []
  const promotedMap: Record<string, number> = {}
  let promoted = 0

  for (const raw of rows) {
    const p = rowToProspect(raw)
    const linkedId = p.promotedCrmId ?? p.crmItemId
    const primaryEmail = p.emails.find((e) => e.kind === "owner")?.address ?? p.emails[0]?.address ?? null
    const dm = p.decisionMakers[0]
    const fp = p.fourPillars
    const auditSummary = [
      `[360° Prospect Audit — Tier ${p.priorityTier} | Angle: ${angleLabel(p.outreachAngle)}]`,
      p.googleRating ? `GBP: ${p.googleRating}★ (${p.googleReviewsCount ?? 0} reviews)` : null,
      fp ? `Can It Sell?: ${fp.marketingSales.canItSellVerdict}` : null,
      `Scores (1-10): Strength ${p.businessStrengthScore} | Gap ${p.modernizationGapScore} | Step 1 Brand/UX ${fp?.brandingUxUi.score ?? p.aestheticsScore} | Step 2 Sales/CRO ${fp?.marketingSales.score ?? p.marketingScore} | Step 3 Tech ${fp?.technicalStack.score ?? p.trackingCrmScore} | Creative ${p.creativeScore} | Step 4 Auto (bonus) ${p.automationScore}`,
      fp?.creativePart?.creativeUpsidePitch ? `Creative Twist: ${fp.creativePart.creativeUpsidePitch}` : null,
      p.topFlaws.length > 0 ? `Top Flaws:\n- ${p.topFlaws.join("\n- ")}` : null,
      p.visualCritique ? `Audit Critique: ${p.visualCritique}` : null,
      p.personalizedHook ? `\nOutreach Hook:\n${p.personalizedHook}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    if (linkedId) {
      const existing = (await sql`SELECT id, notes, contact_email, contact_name, contact_role FROM crm_items WHERE id = ${linkedId}`) as any[]
      if (existing[0]) {
        const nextNotes = mergeIdempotentAuditNotes(existing[0].notes, auditSummary)
        await sql`
          UPDATE crm_items
          SET
            contact_email = COALESCE(contact_email, ${primaryEmail}),
            contact_name = COALESCE(contact_name, ${dm?.name ?? null}),
            contact_role = COALESCE(contact_role, ${dm?.role ?? null}),
            notes = ${nextNotes},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${linkedId}
        `
        await sql`UPDATE prospect_audits SET promoted_crm_id = ${linkedId}, updated_at = CURRENT_TIMESTAMP WHERE id = ${p.id}`
        crmIds.push(linkedId)
        promotedMap[String(p.id)] = linkedId
        promoted++
        continue
      }
    }

    // Safe fallback match: NEVER match by company name alone (prevents multi-city / distinct-domain collisions).
    // Require exact normalized domain match (or for .local domainless records, matching city + no conflicting URL),
    // and ensure the crm_items row is not already claimed by a different prospect_audits record.
    const candidates = (await sql`
      SELECT id, notes, url, location
      FROM crm_items
      WHERE kind = 'client'
        AND LOWER(company) = LOWER(${p.company})
        AND NOT EXISTS (
          SELECT 1
          FROM prospect_audits pa
          WHERE pa.id <> ${p.id}
            AND (pa.crm_item_id = crm_items.id OR pa.promoted_crm_id = crm_items.id)
        )
    `) as any[]

    const pDomain = p.domain.trim().toLowerCase()
    const isSyntheticDomain = pDomain.endsWith(".local")
    const matchedCrm = candidates.find((c) => {
      const crmHost = extractNormalizedHost(c.url)
      if (!isSyntheticDomain) {
        return crmHost !== null && crmHost === pDomain
      }
      if (crmHost !== null) return false
      if (!p.city) return false
      return String(c.location || "").toLowerCase().includes(p.city.trim().toLowerCase())
    })

    if (matchedCrm) {
      const existingId = Number(matchedCrm.id)
      const nextNotes = mergeIdempotentAuditNotes(matchedCrm.notes, auditSummary)
      await sql`
        UPDATE crm_items
        SET
          contact_email = COALESCE(contact_email, ${primaryEmail}),
          contact_name = COALESCE(contact_name, ${dm?.name ?? null}),
          contact_role = COALESCE(contact_role, ${dm?.role ?? null}),
          notes = ${nextNotes},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingId}
      `
      await sql`UPDATE prospect_audits SET promoted_crm_id = ${existingId}, updated_at = CURRENT_TIMESTAMP WHERE id = ${p.id}`
      crmIds.push(existingId)
      promotedMap[String(p.id)] = existingId
      promoted++
      continue
    }

    const draft = sanitizeDraft({
      kind: "client",
      company: p.company,
      title: `${cohortLabel(p.cohort)} — ${angleLabel(p.outreachAngle)}`,
      url: p.websiteUrl ?? p.googleMapsUrl,
      location: [p.city, p.state].filter(Boolean).join(", ") || p.metro,
      compensation: "$10K build + $3K/mo",
      source: `Prospect Engine (${cohortLabel(p.cohort)})`,
      stage: "qualified",
      priority: p.priorityTier === "S" ? 1 : p.priorityTier === "A" ? 2 : 3,
      contactName: dm?.name ?? null,
      contactRole: dm?.role ?? null,
      contactEmail: dm?.email ?? primaryEmail,
      contactUrl: dm?.linkedin ?? p.socialLinks.linkedin ?? p.socialLinks.instagram ?? null,
      nextStep: "Send personalized audit outreach",
      nextStepDate: new Date().toISOString().slice(0, 10),
      notes: auditSummary,
      tags: [p.cohort, `tier-${p.priorityTier.toLowerCase()}`, p.outreachAngle],
      activities: [
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          type: "note",
          text: `Promoted from Prospect Database (Tier ${p.priorityTier}, Gap ${p.modernizationGapScore}/10).`,
        },
      ],
    })
    if (draft) {
      const created = await insertItem(sql, draft)
      await sql`UPDATE prospect_audits SET promoted_crm_id = ${created.id}, updated_at = CURRENT_TIMESTAMP WHERE id = ${p.id}`
      crmIds.push(created.id)
      promotedMap[String(p.id)] = created.id
      promoted++
    }
  }

  return { promoted, crmIds, promotedMap }
}
