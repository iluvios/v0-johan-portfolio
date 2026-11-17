import fs from "node:fs"
import path from "node:path"
import {
  sanitizeProspectEmails,
  sanitizeProspectSocialLinks,
  type CanItSellVerdict,
  type OutreachAngle,
  type PriorityTier,
  type ProspectAuditDraft,
  type ProspectCohort,
  type ProspectFourPillarReport,
} from "../../lib/prospects"
import {
  ACTIVE_LOCAL_COHORTS,
  analyzeReviewsVoice,
  CRAWLED_FILE,
  detectFreeBuilderSubdomainCms,
  DISCOVERED_FILE,
  ensureAuditDirs,
  EXPORTS_DIR,
  isFreeBuilderSubdomain,
  sanitizePrimaryCtaText,
  SCORED_FILE,
  VISION_OVERRIDES_FILE,
  W2W_DIR,
} from "./config"
import type { DiscoveredProspect } from "./01-discover"
import type { CrawledProspectRecord } from "./02-crawl-and-stitch"
import type { W2wCohortBenchmark } from "./04a-web2wave-benchmarks"

export interface VisionOverrideEntry {
  domain: string
  aestheticsScore?: number
  brandingScore?: number
  uxCroScore?: number
  marketingScore?: number
  creativeScore?: number
  priorityTier?: PriorityTier
  outreachAngle?: OutreachAngle
  visualCritique: string
  visualGoods?: string[]
  visualBads?: string[]
  personalizedHook?: string
}

function clamp(n: number, min = 1, max = 10): number {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function humanizeCrawlIssue(rawErr?: string | null): {
  shortLabel: string
  proseReason: string
  isMissingUrl: boolean
} {
  const cleaned = String(rawErr || "")
    .replace(/\u001b\[[0-9;]*m/g, "")
    .split(/\r?\nCall log:/i)[0]
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned || cleaned === "missing_website_url") {
    return {
      shortLabel: "no active website URL linked on profile",
      proseReason: "couldn't find an active website linked to your profile",
      isMissingUrl: true,
    }
  }
  if (cleaned === "social_only_no_website") {
    return {
      shortLabel: "social-only profile (no standalone website)",
      proseReason: "operates exclusively via social profile without a standalone website",
      isMissingUrl: true,
    }
  }
  if (/ERR_NAME_NOT_RESOLVED|ENOTFOUND|DNS/i.test(cleaned)) {
    return {
      shortLabel: "domain DNS did not resolve",
      proseReason: "your domain failed to resolve (DNS error)",
      isMissingUrl: false,
    }
  }
  if (/ERR_CERT|ERR_SSL|SSL|TLS/i.test(cleaned)) {
    return {
      shortLabel: "SSL security certificate warning",
      proseReason: "browsers hit an SSL security certificate warning before the page can open",
      isMissingUrl: false,
    }
  }
  if (/ERR_CONNECTION_REFUSED|ECONNREFUSED/i.test(cleaned)) {
    return {
      shortLabel: "server refused connection",
      proseReason: "the web server refused the connection",
      isMissingUrl: false,
    }
  }
  if (/ERR_CONNECTION_RESET|ECONNRESET|ERR_EMPTY_RESPONSE|ERR_NETWORK/i.test(cleaned)) {
    return {
      shortLabel: "connection dropped by host",
      proseReason: "the server dropped the connection before rendering",
      isMissingUrl: false,
    }
  }
  if (
    /fonts to load|page\.screenshot|Target page, context or browser has been closed|newCDPSession|no object with guid|browserContext/i.test(
      cleaned,
    )
  ) {
    return {
      shortLabel: "page stalled rendering visual assets",
      proseReason: "the page stalled while loading fonts and hero assets",
      isMissingUrl: false,
    }
  }
  if (/Timeout|timed out/i.test(cleaned)) {
    return {
      shortLabel: "timed out loading (>10s)",
      proseReason: "the page timed out before finishing its initial load",
      isMissingUrl: false,
    }
  }
  const safeSnippet = cleaned
    .replace(/^(page\.goto|page\.screenshot|browserContext\.\w+):\s*/i, "")
    .slice(0, 72)
  return {
    shortLabel: safeSnippet || "connection error",
    proseReason: `the site failed to load cleanly (${safeSnippet || "connection error"})`,
    isMissingUrl: false,
  }
}

function firstNameOf(fullName?: string | null): string | null {
  if (!fullName) return null
  const cleaned = fullName.replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?|Attorney)\s+/i, "").trim()
  const first = cleaned.split(/\s+/)[0]
  if (!first || first.length < 2 || /^(Founding|Team|Admin|Office|Info|Owner)$/i.test(first)) return null
  return first
}

function scoreProspect(
  rec: CrawledProspectRecord,
  w2wMap: Record<string, W2wCohortBenchmark>,
  visionOverride?: VisionOverrideEntry,
): ProspectAuditDraft {
  const cleanEmails = sanitizeProspectEmails(rec.emails || []).slice(0, 15)
  const cleanSocials = sanitizeProspectSocialLinks(rec.socialLinks || {})
  rec.socialLinks = cleanSocials
  if (Array.isArray(rec.decisionMakers) && rec.decisionMakers.length > 1) {
    const seenDm = new Set<string>()
    rec.decisionMakers = rec.decisionMakers.filter((dm) => {
      const k = (dm?.name || "").trim().toLowerCase()
      if (!k || seenDm.has(k)) return false
      seenDm.add(k)
      return true
    })
  }

  const usesFreeBuilderSubdomain = isFreeBuilderSubdomain(rec.domain)
  const subdomainCms = detectFreeBuilderSubdomainCms(rec.domain)
  if (subdomainCms && (!rec.cmsPlatform || rec.cmsPlatform === "Custom / Static HTML")) {
    rec.cmsPlatform = subdomainCms
  }

  const d = rec.diagnostics
  if (d?.branding) {
    d.branding.primaryCtaText = sanitizePrimaryCtaText(d.branding.primaryCtaText)
  }
  if (d?.socialReputation) {
    d.socialReputation.socialLinks = sanitizeProspectSocialLinks(d.socialReputation.socialLinks || cleanSocials)
    const reviewVoice = analyzeReviewsVoice(rec.googleReviewsSample || [])
    d.socialReputation.reviewPraiseThemes = reviewVoice.praiseThemes
    d.socialReputation.reviewComplaintThemes = reviewVoice.complaintThemes
    if (Array.isArray(d.socialReputation.flaws)) {
      d.socialReputation.flaws = d.socialReputation.flaws.filter(
        (f) => !/^Customer review complaint pattern:/i.test(f) && !/^No Instagram or Facebook profile linked/i.test(f),
      )
      if (!cleanSocials.instagram && !cleanSocials.facebook && rec.cohort !== "funded_startups") {
        d.socialReputation.flaws.push("No Instagram or Facebook profile linked from website")
      }
      for (const cTheme of reviewVoice.complaintThemes) {
        d.socialReputation.flaws.push(`Customer review complaint pattern: ${cTheme}`)
      }
    }
  }
  if (d?.emailDns) {
    const usesFreeWebmailClean = cleanEmails.some((e) =>
      /@(gmail|yahoo|hotmail|aol|icloud|outlook)\.com$/i.test(e.address),
    )
    d.emailDns.usesFreeWebmailOnSite = usesFreeWebmailClean
    if (usesFreeBuilderSubdomain) {
      d.emailDns.mxProvider = null
      d.emailDns.mxRecords = []
      d.emailDns.hasSpf = false
      d.emailDns.spfRaw = null
      d.emailDns.detectedEspCrmFromSpf = []
      d.emailDns.hasDmarc = false
      d.emailDns.dmarcPolicy = null
      d.emailDns.flaws = [
        `Operates on a third-party builder subdomain (${rec.domain}) without custom-domain SPF/DMARC email authentication`,
        ...(usesFreeWebmailClean
          ? ["Uses free personal webmail (@gmail/@yahoo) instead of branded domain inbox"]
          : []),
      ]
    } else if (!usesFreeWebmailClean && Array.isArray(d.emailDns.flaws)) {
      d.emailDns.flaws = d.emailDns.flaws.filter((f) => !/free personal webmail/i.test(f))
    }
  }

  const cohortCfg = ACTIVE_LOCAL_COHORTS.find((c) => c.cohort === rec.cohort)
  const w2w = w2wMap[rec.cohort]

  const rating = rec.googleRating ?? null
  const reviews = rec.googleReviewsCount ?? 0

  // 1. Business Strength (Money / Ability to afford $10K build + $3K/mo + $3K-$6K/mo ad spend)
  let strength = 5
  if (rec.cohort === "funded_startups") {
    strength = rec.source.includes("YC") ? 8 : 7
  } else {
    if (reviews >= 350 && (rating ?? 0) >= 4.3) strength = 9
    else if (reviews > 100 && (rating ?? 0) >= 4.0) strength = 8
    else if (reviews > 100 && (rating ?? 0) >= 3.5) strength = 8
    else if (reviews >= 35 && (rating ?? 0) >= 3.5) strength = 7
    else if (reviews >= 25) strength = 6
    else strength = 5
  }
  const hasPaidAds = Boolean(
    d?.tracking.hasGoogleAds ||
      d?.tracking.hasMetaPixel ||
      d?.tracking.hasTikTokPixel ||
      d?.tracking.hasLinkedInInsight ||
      d?.tracking.hasBingUet,
  )
  if (hasPaidAds) strength += 1
  if ((d?.commercialPagesCount ?? 0) >= 8) strength += 1
  const businessStrengthScore = clamp(strength)

  // Handle unreachable / social-only / missing-URL records gracefully
  if (!rec.crawlOk || !d) {
    const isSocialWhale = rec.websiteStatus === "social_only_whale"
    const issue = humanizeCrawlIssue(rec.crawlError)
    const angle: OutreachAngle =
      rec.cohort === "funded_startups"
        ? "startup_gtm_sprint"
        : isSocialWhale
        ? "upgrade_social_and_ads"
        : rating !== null && rating < 4.0 && reviews > 50
        ? "reputation_and_intake_rescue"
        : "modernize_website"

    const gap = isSocialWhale && reviews > 50 ? 8 : rec.websiteStatus === "unreachable" && reviews > 80 ? 8 : 5
    const tier: PriorityTier =
      reviews > 100 && (rating ?? 0) >= 3.5 ? "A" : reviews > 50 ? "B" : rec.crmItemId ? "C" : "skip"

    const loc = [rec.city, rec.state].filter(Boolean).join(", ") || rec.metro || "your area"
    const hook = isSocialWhale
      ? `Hi ${rec.company} team — earning ${reviews} Google reviews (${rating}★) in ${loc} without a dedicated conversion website is impressive, but you're leaking high-intent buyers searching outside Instagram/Facebook. For less than the cost of one US marketing hire, we can launch a fast, high-converting website + instant quote/booking flow + 24/7 web/IG/FB intake assistant in 30 days.`
      : issue.isMissingUrl
      ? `Hi ${rec.company} team — while reviewing ${reviews > 0 ? `your ${reviews}-review profile` : rec.company} in ${loc}, I noticed there's no active conversion website linked for high-intent buyers searching online. For less than a single US hire, we build a fast conversion site + CRM + 24/7 web/IG/FB intake system in 30 days.`
      : `Hi ${rec.company} team — I tried opening your website from your ${reviews > 0 ? `${reviews}-review ` : ""}profile in ${loc} and noticed ${issue.proseReason}. Because high-ticket buyers bounce immediately when a site stalls or errors out, we help established companies ship a fast, modern conversion site + CRM + 24/7 intake system for less than a single US hire.`

    const fallbackPillars: ProspectFourPillarReport = {
      brandingUxUi: {
        score: 2,
        cmsPlatform: null,
        goods: reviews > 50 ? [`Established offline brand reputation (${reviews} Google reviews)`] : [],
        bads: [
          isSocialWhale
            ? "No standalone conversion website linked"
            : issue.isMissingUrl
            ? "No active website URL linked on profile"
            : `Website unreachable during audit (${issue.shortLabel})`,
        ],
        summary: isSocialWhale
          ? "Operates exclusively via social/directory profile without an owned brand website."
          : issue.isMissingUrl
          ? "No active standalone website linked to capture search or ad traffic."
          : `Website failed to render reliably (${issue.shortLabel}).`,
      },
      marketingSales: {
        score: 3,
        canItSellVerdict: "No — Static Brochure / Needs Foundation + Creative",
        goods: rating && rating >= 4.2 ? [`Strong ${rating}★ customer satisfaction on Google Maps`] : [],
        bads: ["Zero owned landing-page funnel to convert Google or paid social traffic"],
        summary: "Cannot systematically capture or qualify high-ticket search/ad traffic right now.",
      },
      technicalStack: {
        score: 2,
        detectedStack: [],
        goods: [],
        bads: ["No active GA4, Google Ads, Meta Pixel, or SEO service-page architecture"],
        summary: "Missing owned technical search & attribution foundation.",
      },
      creativePart: {
        score: 3,
        isGenericCliche: true,
        observedHeadlineOrHook: null,
        goods: [],
        bads: ["No structured front-end offer or instant estimator"],
        creativeUpsidePitch:
          cohortCfg?.highRoiLever ||
          "Ship a clean, fast conversion website + instant quote funnel + 24/7 lead response for <1 US hire.",
        summary: "Huge greenfield upside by putting a clean, reliable local conversion funnel online.",
      },
      automation: {
        score: 2,
        isSecondarySignal: true,
        confidence: "external_surface_only",
        detectedTools: [],
        goods: [],
        bads: ["No visible web chat or self-serve booking flow"],
        summary: "Secondary signal: no external intake widgets observable.",
      },
    }

    return {
      domain: rec.domain,
      company: rec.company,
      websiteUrl: rec.websiteUrl,
      websiteStatus: rec.websiteStatus,
      cohort: rec.cohort,
      subCategory: rec.subCategory,
      city: rec.city,
      state: rec.state,
      metro: rec.metro,
      formattedAddress: rec.formattedAddress,
      googlePlaceId: rec.googlePlaceId,
      googleRating: rating,
      googleReviewsCount: rec.googleReviewsCount,
      googleMapsUrl: rec.googleMapsUrl,
      googleReviewsSample: rec.googleReviewsSample || [],
      isPeRollup: false,
      crmItemId: rec.crmItemId,
      source: rec.source,
      emails: cleanEmails,
      phones: rec.phones || [],
      decisionMakers: rec.decisionMakers || [],
      socialLinks: rec.socialLinks || {},
      hasVerifiedEmail: cleanEmails.length > 0,
      hasPaidAds: false,
      hasChatBot: false,
      hasDmarcRisk: true,
      diagnostics: null,
      fourPillars: fallbackPillars,
      priorityTier: tier,
      businessStrengthScore,
      aestheticsScore: 2,
      brandingScore: 3,
      uxCroScore: 2,
      seoAeoScore: 2,
      trackingCrmScore: 2,
      marketingScore: 3,
      creativeScore: 3,
      automationScore: 2,
      modernizationGapScore: gap,
      reviewMethod: "diagnostic_rubric",
      outreachAngle: angle,
      topFlaws: [
        isSocialWhale
          ? `Has ${reviews} Google reviews (${rating}★) with zero owned conversion website`
          : issue.isMissingUrl
          ? "No standalone conversion website linked to capture search buyers"
          : `Website failed live render (${issue.shortLabel})`,
        "Zero search/ad attribution pixels or dedicated local service landing pages",
        "No 24/7 web/social intake flow to capture after-hours inquiries",
      ],
      visualCritique: fallbackPillars.brandingUxUi.summary,
      personalizedHook: hook,
      benchmarkAdRef: w2w?.referenceAdSummary ?? null,
      specAdUrl: null,
      demoFunnelUrl: null,
      localSheetFile: null,
      auditedAt: new Date().toISOString(),
    }
  }

  // --- BROKEN / 404 / OFFLINE CMS PAGE DETECTION vs WAF / BOT-CHALLENGE DETECTION ---
  const h1Raw = (d.branding.heroHeadline || "").trim()
  const titleRaw = (d.seo.title || "").trim()
  const combinedHead = `${titleRaw} ${h1Raw} ${d.branding.heroSubheadline || ""}`.toLowerCase()

  const isBrokenErrorPage =
    !visionOverride &&
    (/^error 404\b|\b404 not found\b|^404\s*[-–|:]|^page not found\b|^site not found\b|^site is offline\b|wordpress\s*›\s*error|^service unavailable\b|^502 bad gateway\b|^503 service\b|database error|error establishing a database connection|account suspended|cgi-sys\/suspendedpage|domain parked|this site can['’]t be reached/i.test(
      titleRaw,
    ) ||
      /^error 404\b|\b404 not found\b|^page not found\b|^site not found\b|^site is offline\b|account suspended/i.test(
        h1Raw,
      ))

  if (isBrokenErrorPage) {
    const loc = [rec.city, rec.state].filter(Boolean).join(", ") || rec.metro || "your area"
    const errLabel = (titleRaw || h1Raw || "404 / Page Not Found").slice(0, 60)
    const brokenTier: PriorityTier =
      reviews > 100 && (rating ?? 0) >= 3.5 ? "S" : reviews > 50 ? "A" : rec.crmItemId ? "B" : "C"
    const brokenAngle: OutreachAngle =
      rating !== null && rating < 4.0 && reviews > 50 ? "reputation_and_intake_rescue" : "modernize_website"
    const dmarcRisk = !d.emailDns.hasDmarc || d.emailDns.dmarcPolicy === "none"
    const brokenFlaws = [
      `Google Business / primary URL lands on a broken "${errLabel}" error screen instead of a working homepage`,
      ...(dmarcRisk ? d.emailDns.flaws.slice(0, 1) : []),
      "Leaking 100% of high-intent search & Maps clicks with no live booking or 24/7 intake fallback",
    ].slice(0, 3)

    const brokenPillars: ProspectFourPillarReport = {
      brandingUxUi: {
        score: 2,
        cmsPlatform: rec.cmsPlatform,
        goods: reviews > 50 ? [`Strong offline reputation (${reviews} Google reviews at ${rating}★)`] : [],
        bads: [`Primary website link renders an error/offline screen ("${errLabel}")`],
        summary: `Linked URL returns a broken "${errLabel}" page, creating immediate trust loss for searchers.`,
      },
      marketingSales: {
        score: 2,
        canItSellVerdict: "No — Static Brochure / Needs Foundation + Creative",
        goods: rating && reviews > 50 ? [`Proven demand: ${rating}★ across ${reviews} Google reviews`] : [],
        bads: ["Broken landing page bounces 100% of Google Maps and organic website clicks"],
        summary: "Every click from Google Maps currently hits a dead-end error page.",
      },
      technicalStack: {
        score: d.emailDns.hasSpf && d.emailDns.hasDmarc ? 4 : 2,
        detectedStack: [rec.cmsPlatform, d.emailDns.mxProvider].filter(Boolean) as string[],
        goods: d.emailDns.hasSpf ? [`SPF configured (${d.emailDns.mxProvider || "MX active"})`] : [],
        bads: [`Broken HTTP/CMS route ("${errLabel}")`, ...d.emailDns.flaws.slice(0, 2)],
        summary: "Broken web routing destroys SEO/AEO visibility and paid media readiness.",
      },
      creativePart: {
        score: 2,
        isGenericCliche: true,
        observedHeadlineOrHook: errLabel,
        goods: [],
        bads: ["No active front-end offer, service showcase, or instant estimator"],
        creativeUpsidePitch:
          cohortCfg?.highRoiLever ||
          "Replace broken web link with a sub-second conversion site + instant quote flow + 24/7 intake assistant.",
        summary: "Immediate high-ROI rescue opportunity: fixing the broken Maps link recovers lost daily buyers.",
      },
      automation: {
        score: 2,
        isSecondarySignal: true,
        confidence: "external_surface_only",
        detectedTools: [],
        goods: [],
        bads: ["No working web chat, form, or online booking flow"],
        summary: "Secondary signal: landing page is broken/offline.",
      },
    }

    const brokenHook = `Hi ${rec.company} team — ${reviews > 50 ? `you've built a strong ${reviews}-review (${rating}★) reputation in ${loc}, ` : `while checking ${rec.company} in ${loc}, `}I clicked your website link and noticed it currently lands on a "${errLabel}" error page — meaning buyers clicking through from Google Maps are bouncing immediately. For less than one US hire, we can launch a fast replacement conversion site, CRM, and 24/7 web/IG/FB intake system in 30 days. Worth sending a quick screenshot and fix plan?`

    return {
      domain: rec.domain,
      company: rec.company,
      websiteUrl: rec.websiteUrl,
      websiteStatus: rec.websiteStatus,
      cohort: rec.cohort,
      subCategory: rec.subCategory,
      city: rec.city,
      state: rec.state,
      metro: rec.metro,
      formattedAddress: rec.formattedAddress,
      googlePlaceId: rec.googlePlaceId,
      googleRating: rating,
      googleReviewsCount: rec.googleReviewsCount,
      googleMapsUrl: rec.googleMapsUrl,
      googleReviewsSample: rec.googleReviewsSample || [],
      isPeRollup: rec.isPeRollup,
      crmItemId: rec.crmItemId,
      source: rec.source,
      emails: cleanEmails,
      phones: rec.phones || [],
      decisionMakers: rec.decisionMakers || [],
      socialLinks: rec.socialLinks || {},
      hasVerifiedEmail: cleanEmails.length > 0,
      hasPaidAds,
      hasChatBot: false,
      hasDmarcRisk: dmarcRisk,
      diagnostics: d,
      fourPillars: brokenPillars,
      priorityTier: brokenTier,
      businessStrengthScore,
      aestheticsScore: 2,
      brandingScore: 3,
      uxCroScore: 2,
      seoAeoScore: 2,
      trackingCrmScore: d.emailDns.hasDmarc ? 4 : 2,
      marketingScore: 2,
      creativeScore: 2,
      automationScore: 2,
      modernizationGapScore: reviews > 80 ? 9 : 7,
      reviewMethod: "diagnostic_rubric",
      outreachAngle: brokenAngle,
      topFlaws: brokenFlaws,
      visualCritique: brokenPillars.brandingUxUi.summary,
      personalizedHook: brokenHook,
      benchmarkAdRef: w2w?.referenceAdSummary ?? null,
      specAdUrl: null,
      demoFunnelUrl: null,
      localSheetFile: rec.localSheetFile,
      auditedAt: new Date().toISOString(),
    }
  }

  const isWafChallenge =
    !visionOverride &&
    (((h1Raw.toLowerCase() === rec.domain.toLowerCase() || titleRaw.toLowerCase() === rec.domain.toLowerCase()) &&
      d.seo.imgCount <= 1 &&
      d.commercialPagesCount === 0) ||
      (!titleRaw &&
        d.seo.h1Count === 0 &&
        d.seo.imgCount === 0 &&
        d.commercialPagesCount === 0 &&
        (d.perf.requestCount ?? 0) <= 5) ||
      /checking the site connection security|checking your browser|please wait while your request is being verified|just a moment|one moment, please|verify you are human|attention required! \| cloudflare|sucuri website firewall|robot validate|robot or human|ddos-guard|bot verification|^403 forbidden|^access denied|^forbidden$/i.test(
        combinedHead,
      ))

  if (isWafChallenge) {
    const loc = [rec.city, rec.state].filter(Boolean).join(", ") || rec.metro || "your market"
    const wafAngle: OutreachAngle =
      rec.cohort === "funded_startups"
        ? "startup_gtm_sprint"
        : rating !== null && rating < 4.0 && reviews > 50
        ? "reputation_and_intake_rescue"
        : "scale_50pct_more"
    const wafTier: PriorityTier =
      reviews > 100 && (rating ?? 0) >= 4.0 ? "A" : reviews > 50 ? "B" : "C"
    const dmarcRisk = !d.emailDns.hasDmarc || d.emailDns.dmarcPolicy === "none"
    const wafFlaws: string[] = [
      "Full-screen WAF / bot-verification challenge blocks ChatGPT, Perplexity & AI search crawlers and adds mobile click friction",
      ...(dmarcRisk ? d.emailDns.flaws.slice(0, 1) : []),
      "Paid ad & AI search traffic benefits from dedicated fast-loading conversion landing pages without interstitial friction",
    ].slice(0, 3)

    const wafStack: string[] = ["WAF / Bot-Challenge Wall"]
    if (d.emailDns.mxProvider) wafStack.push(d.emailDns.mxProvider)
    for (const esp of d.emailDns.detectedEspCrmFromSpf) wafStack.push(`${esp} (SPF)`)

    const wafPillars: ProspectFourPillarReport = {
      brandingUxUi: {
        score: 5,
        cmsPlatform: "Behind WAF / Bot Challenge",
        goods: reviews > 50 ? [`Strong established brand authority (${reviews} Google reviews at ${rating}★)`] : [],
        bads: ["Visitors/crawlers hit a full-screen 'Checking site connection / request verification' security wall"],
        summary: "Homepage sits behind an aggressive bot-verification interstitial (Cloudflare/SiteGround WAF), obscuring instant visual load.",
      },
      marketingSales: {
        score: 5,
        canItSellVerdict: "Partially — Leaks High-Intent Leads",
        goods: rating && reviews > 50 ? [`Proven customer demand: ${rating}★ across ${reviews} Google reviews`] : [],
        bads: ["Security verification screen adds multi-second drop-off friction on cold mobile ad clicks"],
        summary: "Strong offline reputation, but interstitial friction and lack of dedicated fast ad landing pages leak paid/search leads.",
      },
      technicalStack: {
        score: d.emailDns.hasSpf && d.emailDns.hasDmarc ? 6 : 4,
        detectedStack: wafStack,
        goods: d.emailDns.hasSpf ? [`Authenticated SPF email DNS (${d.emailDns.mxProvider || "configured"})`] : [],
        bads: [
          "Bot-verification wall blocks AI answer engines (ChatGPT / Perplexity / Claude) from reading services & reviews",
          ...d.emailDns.flaws.slice(0, 2),
        ],
        summary: "WAF challenge blocks AI search/AEO indexing; DNS & external email deliverability audited directly.",
      },
      creativePart: {
        score: 5,
        isGenericCliche: true,
        observedHeadlineOrHook: null,
        goods: d.socialReputation.reviewPraiseThemes.map((t) => `Customer review strength: ${t}`).slice(0, 2),
        bads: ["Needs dedicated sub-second paid-media funnel + 24/7 instant quote/intake assistant"],
        creativeUpsidePitch:
          cohortCfg?.highRoiLever ||
          "Deploy fast, AI-indexable conversion landing pages + 1st-party ad tracking + 24/7 web/IG/FB lead response for <1 US hire.",
        summary: "High-trust operator where a dedicated sub-second funnel + 24/7 response unlocks immediate conversion lift.",
      },
      automation: {
        score: d.emailDns.detectedEspCrmFromSpf.length > 0 ? 5 : 4,
        isSecondarySignal: true,
        confidence: "external_surface_only",
        detectedTools: d.emailDns.detectedEspCrmFromSpf.map((e) => `${e} (SPF)`),
        goods: [],
        bads: [],
        summary: "Secondary signal: homepage behind WAF interstitial; external SPF/DNS tools checked.",
      },
    }

    const wafHook = `Hi ${rec.company} team — ${reviews > 50 ? `earning ${reviews} Google reviews (${rating}★) in ${loc} puts you in the top tier locally` : `I was researching ${rec.company} in ${loc}`}. When testing ${rec.domain}, I noticed visitors and AI search engines (ChatGPT/Perplexity) hit a full-screen connection-verification wall before the page loads — which blocks AI answer-engine referrals and costs 15–25% of mobile ad clicks. For less than one US hire, my UX partner and I deploy sub-second conversion funnels, 1st-party ad attribution, and a 24/7 web/IG/FB intake assistant. Worth sending a quick 60-second walkthrough?`

    return {
      domain: rec.domain,
      company: rec.company,
      websiteUrl: rec.websiteUrl,
      websiteStatus: rec.websiteStatus,
      cohort: rec.cohort,
      subCategory: rec.subCategory,
      city: rec.city,
      state: rec.state,
      metro: rec.metro,
      formattedAddress: rec.formattedAddress,
      googlePlaceId: rec.googlePlaceId,
      googleRating: rating,
      googleReviewsCount: rec.googleReviewsCount,
      googleMapsUrl: rec.googleMapsUrl,
      googleReviewsSample: rec.googleReviewsSample || [],
      isPeRollup: rec.isPeRollup,
      crmItemId: rec.crmItemId,
      source: rec.source,
      emails: cleanEmails,
      phones: rec.phones || [],
      decisionMakers: rec.decisionMakers || [],
      socialLinks: rec.socialLinks || {},
      hasVerifiedEmail: cleanEmails.length > 0,
      hasPaidAds,
      hasChatBot: false,
      hasDmarcRisk: dmarcRisk,
      diagnostics: d,
      fourPillars: wafPillars,
      priorityTier: wafTier,
      businessStrengthScore,
      aestheticsScore: 5,
      brandingScore: 6,
      uxCroScore: 5,
      seoAeoScore: 4,
      trackingCrmScore: d.emailDns.hasDmarc ? 6 : 4,
      marketingScore: 5,
      creativeScore: 5,
      automationScore: 4,
      modernizationGapScore: reviews > 100 ? 7 : 6,
      reviewMethod: "diagnostic_rubric",
      outreachAngle: wafAngle,
      topFlaws: wafFlaws,
      visualCritique: wafPillars.brandingUxUi.summary,
      personalizedHook: wafHook,
      benchmarkAdRef: w2w?.referenceAdSummary ?? null,
      specAdUrl: null,
      demoFunnelUrl: null,
      localSheetFile: rec.localSheetFile,
      auditedAt: new Date().toISOString(),
    }
  }

  // --- LIVE CRAWLED WEBSITE SCORING ---

  // Guard against false positives from earlier 16-tab rush crawls over a 2.95 Mbps link where window.onload hadn't finished
  const isVerifiedSingleTab = Boolean(d.perf.verifiedSingleTab)
  const isUnverifiedRushCrawl = !isVerifiedSingleTab && (d.perf.loadMs === null || d.perf.loadMs === 0)
  const effectiveBrokenImagesCount = isUnverifiedRushCrawl ? 0 : d.uiFlaws.brokenImagesCount
  const effectiveUiFlaws = isUnverifiedRushCrawl
    ? d.uiFlaws.flaws.filter((f) => !/renders nearly blank|broken image/i.test(f))
    : d.uiFlaws.flaws

  const totalMB = d.perf.totalBytes && d.perf.totalBytes > 0 ? d.perf.totalBytes / (1024 * 1024) : null
  const imageMB = d.perf.imageBytes && d.perf.imageBytes > 0 ? d.perf.imageBytes / (1024 * 1024) : null
  const isObjectivelyHeavyPayload = totalMB !== null && totalMB >= 3.5
  const isVerifiedServerSlow =
    isVerifiedSingleTab &&
    !isObjectivelyHeavyPayload &&
    (d.perf.ttfbMs ?? 0) >= 2400 &&
    (d.perf.lcpMs ?? 0) > 5000

  // STEP 1: Branding & UX/UI (Visual Best Practices)
  const uiFlawJoined = effectiveUiFlaws.join(" | ")
  const hasBlankHero = /renders nearly blank|Blank or unrendered above-the-fold hero/i.test(uiFlawJoined)
  const hasTemplatePlaceholder = /template placeholder/i.test(uiFlawJoined)
  const hasFrozenZeroCounter = /frozen at '0\+'|Frozen '0\+' animated/i.test(uiFlawJoined)

  let aes = 6
  if (rec.cmsPlatform === "Webflow" || rec.cmsPlatform === "Next.js" || rec.cmsPlatform === "Squarespace") aes += 1
  if (rec.cmsPlatform === "GoDaddy Builder") aes -= 1
  if (d.branding.hasVectorOrCrispLogo) aes += 1
  else aes -= 1
  if (d.uiFlaws.mobileHorizontalOverflow) aes -= 2
  if (d.uiFlaws.stickyHeaderOverlapPx > 15) aes -= 1
  if (effectiveBrokenImagesCount > 0) aes -= 1
  if (d.uiFlaws.tinyMobileTextCount > 2) aes -= 1
  if (d.uiFlaws.fontFamilyCount > 4) aes -= 1
  if ((d.perf.cls ?? 0) > 0.25) aes -= 1
  if (hasBlankHero) aes -= 2
  if (hasTemplatePlaceholder) aes -= 2
  if (hasFrozenZeroCounter) aes -= 1

  let brand = 6
  if (d.branding.hasVectorOrCrispLogo) brand += 1
  if (d.branding.phoneConsistentAcrossSite && rec.phones.length > 0 && !hasTemplatePlaceholder) brand += 1
  if (!d.branding.genericHeadline && d.branding.heroHeadline) brand += 1
  else brand -= 1
  if (d.emailDns.usesFreeWebmailOnSite) brand -= 2
  if (usesFreeBuilderSubdomain) brand -= 1
  if (hasTemplatePlaceholder) brand -= 2

  const aestheticsScore = clamp(visionOverride?.aestheticsScore ?? aes)
  const brandingScore = clamp(visionOverride?.brandingScore ?? brand)
  const step1Score = clamp(Math.round((aestheticsScore + brandingScore) / 2))

  const step1Goods: string[] = [...(visionOverride?.visualGoods || [])]
  if (d.branding.hasVectorOrCrispLogo) step1Goods.push("Crisp vector/high-DPI brand logo in header")
  if (!d.uiFlaws.mobileHorizontalOverflow) step1Goods.push("Responsive 390px mobile layout with zero horizontal overflow")
  if (!isUnverifiedRushCrawl && effectiveBrokenImagesCount === 0 && d.seo.imgCount >= 4) {
    step1Goods.push(`All ${d.seo.imgCount} homepage visual assets loaded intact`)
  }
  if (d.branding.phoneConsistentAcrossSite && rec.phones.length > 0) step1Goods.push(`Consistent primary phone (${rec.phones[0]}) across header & contact`)
  if (d.uiFlaws.fontFamilyCount >= 1 && d.uiFlaws.fontFamilyCount <= 3) {
    step1Goods.push(`Clean typography discipline (${d.uiFlaws.fontFamilies.slice(0, 2).join(", ")})`)
  }

  const step1Bads: string[] = [
    ...(visionOverride?.visualBads || []),
    ...(usesFreeBuilderSubdomain
      ? [`Operates on a free third-party builder subdomain (${rec.domain}) instead of an owned custom brand domain`]
      : []),
    ...effectiveUiFlaws,
    ...d.branding.flaws.filter((f) => f.includes("logo")),
  ]
  if (d.emailDns.usesFreeWebmailOnSite) {
    step1Bads.push("Displays personal @gmail/@yahoo inbox instead of branded company email")
  }

  // STEP 2: Conversion & Sales ("Can This Website Sell?")
  let cro = 5
  if (d.branding.primaryCtaText) cro += 1
  if (d.branding.hasClearGuaranteeOrOffer) cro += 1
  else cro -= 1
  if (d.socialReputation.showcasesReviewsOnHome) cro += 1
  if (d.socialReputation.reputationDisconnect) cro -= 1
  if (d.crmIntake.bookingWidgets.length > 0 || d.crmIntake.hasInstantQuoteOrCalculator) cro += 2
  if (d.crmIntake.usesMailtoOnly) cro -= 2
  if (d.crmIntake.maxFormFields >= 8) cro -= 1
  if (rec.websiteStatus === "unlinked_on_gbp") cro -= 2

  let mkt = cro
  if (hasPaidAds) mkt += 1
  if (rec.socialLinks.instagram || rec.socialLinks.facebook) mkt += 1
  else if (rec.cohort !== "funded_startups") mkt -= 1

  const uxCroScore = clamp(visionOverride?.uxCroScore ?? cro)
  const marketingScore = clamp(visionOverride?.marketingScore ?? mkt)
  const step2Score = clamp(Math.round((uxCroScore + marketingScore) / 2))

  const step2Goods: string[] = []
  if (rating && reviews > 50) step2Goods.push(`Strong Google Maps authority: ${rating}★ across ${reviews} customer reviews`)
  if (d.socialReputation.showcasesReviewsOnHome) step2Goods.push("Actively showcases customer review proof on homepage")
  if (d.branding.hasClearGuaranteeOrOffer) step2Goods.push("Clear front-end offer, financing cue, or free-estimate hook")
  if (d.crmIntake.bookingWidgets.length > 0) step2Goods.push(`Self-serve online booking (${d.crmIntake.bookingWidgets.join(", ")})`)
  if (d.crmIntake.hasInstantQuoteOrCalculator) step2Goods.push("Interactive quote / pricing calculator lowers buyer friction")
  if (d.commercialPagesCount >= 5) step2Goods.push(`${d.commercialPagesCount} dedicated service/commercial pages supporting buyer intent`)

  const step2Bads: string[] = []
  if (d.socialReputation.reputationDisconnect) {
    step2Bads.push(`Earned ${reviews} Google reviews (${rating}★) off-site, but hides that social proof on the homepage`)
  }
  if (!d.branding.hasClearGuaranteeOrOffer) {
    step2Bads.push("Missing concrete front-end offer, monthly financing anchor, or risk-reversal guarantee")
  }
  if (d.crmIntake.usesMailtoOnly) step2Bads.push("No interactive lead capture form or online scheduler on homepage")
  else if (d.crmIntake.maxFormFields >= 8) step2Bads.push(`High-friction ${d.crmIntake.maxFormFields}-field contact form suppresses mobile leads`)
  if (d.crmIntake.bookingWidgets.length === 0 && !d.crmIntake.hasInstantQuoteOrCalculator) {
    step2Bads.push("Relies on static 'contact us and wait' form instead of instant booking or 60-second ballpark quote")
  }
  if (rec.websiteStatus === "unlinked_on_gbp") {
    step2Bads.push("Website is missing from Google Business Profile button — leaking direct Maps searchers")
  }
  for (const c of d.socialReputation.reviewComplaintThemes) {
    step2Bads.push(`GBP review friction: ${c}`)
  }

  // Pragmatic Positioning & High-ROI Edge (Creative / Industry Conventions Part)
  let crScore = 5
  if (!d.branding.genericHeadline && d.branding.heroHeadline && d.branding.heroHeadline.length >= 16) crScore += 1
  if (d.branding.hasClearGuaranteeOrOffer) crScore += 1
  if (d.crmIntake.hasInstantQuoteOrCalculator || d.crmIntake.bookingWidgets.length > 0) crScore += 1
  if (d.seo.hasLocalCityInTitleOrH1) crScore += 1
  if (d.branding.genericHeadline) crScore -= 1
  const creativeScore = clamp(visionOverride?.creativeScore ?? crScore)
  const isStandardConvention = d.branding.genericHeadline || !d.crmIntake.hasInstantQuoteOrCalculator

  const creativeGoods: string[] = []
  if (d.seo.hasLocalCityInTitleOrH1 && rec.city) creativeGoods.push(`Clear local ${rec.city} proximity & service positioning`)
  if (d.branding.hasClearGuaranteeOrOffer) creativeGoods.push("Includes practical buyer-decision offer/financing/warranty language")
  for (const pTheme of d.socialReputation.reviewPraiseThemes.slice(0, 2)) {
    creativeGoods.push(`Customers validate core promise in reviews: ${pTheme}`)
  }

  const creativeBads: string[] = []
  if (d.branding.genericHeadline) {
    creativeBads.push(
      `Hero headline (${d.branding.heroHeadline ? `"${d.branding.heroHeadline.slice(0, 55)}"` : "missing"}) doesn't immediately state local specialty + speed/offer`,
    )
  }
  if (!d.crmIntake.hasInstantQuoteOrCalculator) {
    creativeBads.push("No interactive 60-second quote/package/tour funnel to convert cold ad traffic above industry average")
  }

  let canItSellVerdict: CanItSellVerdict
  if (step1Score >= 7 && step2Score >= 8 && creativeScore >= 7) {
    canItSellVerdict = "Yes — Best Practices + Creative Edge"
  } else if (step1Score >= 6 && step2Score >= 6) {
    canItSellVerdict = "Decent Best Practices — Needs Creative Twist (+50% Upside)"
  } else if (step2Score >= 4) {
    canItSellVerdict = "Partially — Leaks High-Intent Leads"
  } else {
    canItSellVerdict = "No — Static Brochure / Needs Foundation + Creative"
  }

  // STEP 3: Technical Stack (SEO, AEO/GEO, CWV Speed, CRM, Tracking, Email DNS)
  let seoAeo = 6
  if (d.seo.h1Count === 1) seoAeo += 1
  else if (d.seo.h1Count === 0) seoAeo -= 1
  if (d.seo.hasLocalCityInTitleOrH1) seoAeo += 1
  if (d.seo.hasSitemapXml) seoAeo += 1
  else seoAeo -= 1
  if (d.aeoGeo.hasLocalBusinessSchema) seoAeo += 1
  else seoAeo -= 1
  if (d.aeoGeo.hasFaqSchema || d.aeoGeo.questionHeadingsCount >= 2) seoAeo += 1
  if (isObjectivelyHeavyPayload || isVerifiedServerSlow) seoAeo -= 1
  else if (totalMB !== null && totalMB <= 1.6 && isVerifiedSingleTab) seoAeo += 1
  const seoAeoScore = clamp(seoAeo)

  let trackCrm = 4
  if (d.tracking.hasGa4 || d.tracking.hasGtm) trackCrm += 1
  if (d.tracking.hasGoogleAds) trackCrm += 1
  if (d.tracking.hasMetaPixel) trackCrm += 1
  if (d.tracking.hasServerSideGtm) trackCrm += 1
  if (d.tracking.callTrackingProvider) trackCrm += 1
  if (d.crmIntake.detectedCrms.length > 0 || d.emailDns.detectedEspCrmFromSpf.length > 0) trackCrm += 1
  if (d.emailDns.hasSpf && d.emailDns.hasDmarc && d.emailDns.dmarcPolicy !== "none") trackCrm += 1
  else if (!d.emailDns.hasDmarc) trackCrm -= 1
  const trackingCrmScore = clamp(trackCrm)
  const step3Score = clamp(Math.round((seoAeoScore + trackingCrmScore) / 2))

  const detectedStack: string[] = []
  if (rec.cmsPlatform) detectedStack.push(rec.cmsPlatform)
  if (d.tracking.hasGtm) detectedStack.push("GTM")
  if (d.tracking.hasServerSideGtm) detectedStack.push("sGTM (1st-Party CAPI)")
  if (d.tracking.hasGa4) detectedStack.push("GA4")
  if (d.tracking.hasGoogleAds) detectedStack.push("Google Ads")
  if (d.tracking.hasMetaPixel) detectedStack.push("Meta Pixel")
  if (d.tracking.hasTikTokPixel) detectedStack.push("TikTok Pixel")
  if (d.tracking.hasLinkedInInsight) detectedStack.push("LinkedIn Insight")
  if (d.tracking.callTrackingProvider) detectedStack.push(d.tracking.callTrackingProvider)
  for (const hm of d.tracking.heatmapTools) detectedStack.push(hm)
  for (const crm of d.crmIntake.detectedCrms) detectedStack.push(crm)
  for (const esp of d.emailDns.detectedEspCrmFromSpf) {
    if (!detectedStack.includes(esp)) detectedStack.push(`${esp} (SPF)`)
  }
  if (d.emailDns.mxProvider) detectedStack.push(d.emailDns.mxProvider)

  const step3Goods: string[] = []
  if (totalMB !== null && totalMB <= 1.8 && isVerifiedSingleTab) {
    step3Goods.push(`Lean ${totalMB.toFixed(1)} MB homepage payload loads cleanly even on 3 Mbps cellular data`)
  } else if (isVerifiedSingleTab && d.perf.lcpMs && d.perf.lcpMs <= 2500) {
    step3Goods.push(`Fast Largest Contentful Paint (${(d.perf.lcpMs / 1000).toFixed(1)}s LCP)`)
  }
  if (d.aeoGeo.hasLocalBusinessSchema) step3Goods.push(`Structured JSON-LD schema (${d.aeoGeo.jsonLdTypes.slice(0, 3).join(", ")})`)
  if (d.tracking.hasGoogleAds || d.tracking.hasMetaPixel) {
    step3Goods.push(
      `Active ad conversion tracking (${[d.tracking.hasGoogleAds ? "Google Ads" : "", d.tracking.hasMetaPixel ? "Meta Pixel" : ""].filter(Boolean).join(" + ")})`,
    )
  }
  if (d.tracking.callTrackingProvider) step3Goods.push(`Dynamic phone attribution via ${d.tracking.callTrackingProvider}`)
  if (d.emailDns.hasSpf && d.emailDns.hasDmarc) step3Goods.push(`Authenticated email DNS (SPF + DMARC p=${d.emailDns.dmarcPolicy})`)
  if (d.crmIntake.detectedCrms.length > 0) step3Goods.push(`Connected CRM (${d.crmIntake.detectedCrms.join(", ")})`)

  const payloadBloatFlaw = isObjectivelyHeavyPayload
    ? `Bloated ${totalMB!.toFixed(1)} MB homepage payload${
        imageMB && imageMB >= 2.0 ? ` (${imageMB.toFixed(1)} MB unoptimized images)` : ""
      } across ${d.perf.requestCount || "80+"} requests — stalls mobile 4G/cellular visitors for ${Math.max(
        8,
        Math.round((d.perf.totalBytes || 0) / (360 * 1024)),
      )}+ seconds`
    : isVerifiedServerSlow
    ? `Slow ${((d.perf.ttfbMs || 2500) / 1000).toFixed(1)}s server response time (TTFB) delays mobile page render`
    : null

  const step3Bads: string[] = []
  if (payloadBloatFlaw) {
    step3Bads.push(payloadBloatFlaw)
  }
  for (const f of d.tracking.flaws.slice(0, 2)) step3Bads.push(f)
  for (const f of d.seo.flaws.slice(0, 2)) step3Bads.push(f)
  for (const f of d.aeoGeo.flaws.slice(0, 2)) step3Bads.push(f)
  for (const f of d.emailDns.flaws.slice(0, 2)) step3Bads.push(f)

  // STEP 4: Visible Automation (Secondary / Optional Signal — <= 8% weight)
  const autoTools: string[] = []
  if (d.crmIntake.chatProvider) autoTools.push(d.crmIntake.chatProvider)
  for (const bw of d.crmIntake.bookingWidgets) autoTools.push(bw)
  for (const esp of d.emailDns.detectedEspCrmFromSpf) autoTools.push(`${esp} Email Automation`)

  let autoScore = 4
  if (d.crmIntake.hasChatBot) autoScore += 3
  if (d.crmIntake.bookingWidgets.length > 0) autoScore += 2
  if (d.emailDns.detectedEspCrmFromSpf.length > 0) autoScore += 1
  const automationScore = clamp(autoScore)

  // Outreach Angle Selection (User's exact cohort & reputation logic)
  let outreachAngle: OutreachAngle
  if (visionOverride?.outreachAngle) {
    outreachAngle = visionOverride.outreachAngle
  } else if (rec.cohort === "funded_startups") {
    outreachAngle = "startup_gtm_sprint"
  } else if (
    (rating !== null && rating >= 3.5 && rating < 4.0 && reviews > 50) ||
    rec.websiteStatus === "unlinked_on_gbp" ||
    d.socialReputation.reviewComplaintThemes.length > 0
  ) {
    outreachAngle = "reputation_and_intake_rescue"
  } else if (step1Score >= 7 && step2Score >= 6) {
    // Website already looks solid -> pitch practical funnel + CAPI + 24/7 response to sell 50% more in 3 months!
    outreachAngle = "scale_50pct_more"
  } else if (step1Score >= 6 && !hasPaidAds && (!rec.socialLinks.instagram || d.socialReputation.brokenSocialIconCount > 0)) {
    outreachAngle = "upgrade_social_and_ads"
  } else {
    outreachAngle = "modernize_website"
  }

  // Modernization Opportunity Gap Score (Step 1-3 primary weights + Business Strength; Step 4 automation only 5% bonus)
  const weightedFoundationAvg =
    step1Score * 0.34 + step2Score * 0.36 + step3Score * 0.25 + automationScore * 0.05
  const rawDeficit = Math.max(1, 10 - weightedFoundationAvg)
  let computedGap = Math.round(businessStrengthScore * 0.45 + rawDeficit * 0.72)

  const isVisuallyOrTechBroken =
    step1Score <= 5 ||
    step2Score <= 4 ||
    effectiveBrokenImagesCount > 0 ||
    d.uiFlaws.mobileHorizontalOverflow ||
    hasBlankHero ||
    hasTemplatePlaceholder ||
    hasFrozenZeroCounter ||
    isObjectivelyHeavyPayload ||
    isVerifiedServerSlow

  const isChallengerSweetSpot =
    !rec.isPeRollup &&
    rating !== null &&
    rating >= 3.5 &&
    rating <= 4.6 &&
    reviews >= 35 &&
    reviews <= 250

  const isMidMarketChallenger =
    isChallengerSweetSpot ||
    (!rec.isPeRollup &&
      rating !== null &&
      rating >= 3.5 &&
      rating <= 4.6 &&
      reviews > 250 &&
      reviews <= 300)

  const lacksModernCroOrAiIntake =
    !d.crmIntake.hasInstantQuoteOrCalculator ||
    !d.crmIntake.hasChatBot ||
    step2Score <= 6 ||
    trackingCrmScore <= 6

  const isTechMatureMegaWhale =
    ((reviews >= 2500 && seoAeoScore >= 8 && trackingCrmScore >= 8) ||
      (reviews >= 1500 && seoAeoScore >= 7 && trackingCrmScore >= 7)) &&
    !isVisuallyOrTechBroken

  if (rec.isPeRollup && !isVisuallyOrTechBroken) {
    computedGap = Math.min(computedGap - 1, 6)
  } else if (isTechMatureMegaWhale) {
    computedGap = Math.min(computedGap - 1, 6)
  } else if (isMidMarketChallenger && lacksModernCroOrAiIntake) {
    // +1 closeability boost for owner-operated 3.5★–4.6★ / 40–300 review Mid-Market Challengers with website/CRO/tracking/intake gaps
    computedGap += 1
  }

  const modernizationGapScore = clamp(computedGap)

  // Priority Tier (elevating hungry Mid-Market Challengers while moderating PE rollups & tech-mature mega-whales)
  let priorityTier: PriorityTier
  if (visionOverride?.priorityTier) {
    priorityTier = visionOverride.priorityTier
  } else if (rec.isPeRollup || d.crmIntake.rivalAgencyCredit === "Scorpion") {
    priorityTier = "B"
  } else if (isTechMatureMegaWhale) {
    priorityTier = modernizationGapScore >= 6 ? "A" : "B"
  } else if (isMidMarketChallenger && modernizationGapScore >= 7) {
    priorityTier = "S"
  } else if (
    reviews >= 100 &&
    (rating ?? 0) >= 4.0 &&
    modernizationGapScore >= 7
  ) {
    priorityTier = "S"
  } else if (
    (businessStrengthScore >= 7 || isMidMarketChallenger) &&
    modernizationGapScore >= 6
  ) {
    priorityTier = "A"
  } else if (businessStrengthScore >= 5) {
    priorityTier = "B"
  } else {
    priorityTier = "C"
  }

  // Top 3 Concrete Flaws for instant scanning & cold-email personalization
  const candidateFlaws: string[] = [
    ...(visionOverride?.visualBads || []),
    ...(rec.websiteStatus === "unlinked_on_gbp"
      ? [`Website isn't linked on your ${reviews}-review Google Maps profile`]
      : []),
    ...(d.socialReputation.reputationDisconnect
      ? [`Earned ${reviews} Google reviews (${rating}★) but doesn't showcase them above the fold`]
      : []),
    ...effectiveUiFlaws,
    ...step2Bads.filter((f) => !f.startsWith("Earned ")),
    ...d.tracking.flaws,
    ...(payloadBloatFlaw ? [payloadBloatFlaw] : []),
    ...d.emailDns.flaws,
    ...d.aeoGeo.flaws,
  ]
  const uniqueFlaws: string[] = []
  for (const f of candidateFlaws) {
    if (f && !uniqueFlaws.includes(f)) uniqueFlaws.push(f)
    if (uniqueFlaws.length >= 3) break
  }

  const creativeUpsidePitch =
    step1Score >= 7 && step2Score >= 6
      ? `Your visual & brand foundation is already strong — add ${
          cohortCfg?.highRoiLever || "an instant-quote funnel + 1st-party ad tracking + 24/7 web/IG/FB response"
        } to convert 30–50% more leads in 90 days for less than one US hire.`
      : `Upgrade ${rec.domain} to an above-average modern conversion site + ${
          cohortCfg?.highRoiLever || "instant estimate flow & 24/7 lead response"
        } — full build + ongoing growth for less than hiring 1 junior marketer in the US.`

  const fourPillars: ProspectFourPillarReport = {
    brandingUxUi: {
      score: step1Score,
      cmsPlatform: rec.cmsPlatform,
      goods: step1Goods.slice(0, 4),
      bads: step1Bads.slice(0, 4),
      summary:
        visionOverride?.visualCritique ||
        `${rec.cmsPlatform || "Web"} build scoring ${step1Score}/10 on visual polish & layout consistency (${
          step1Bads[0] || "clean responsive structure"
        }).`,
    },
    marketingSales: {
      score: step2Score,
      canItSellVerdict,
      goods: step2Goods.slice(0, 4),
      bads: step2Bads.slice(0, 4),
      summary: `${canItSellVerdict}. ${
        step2Bads[0] || "Covers core local trust & CTA fundamentals, with clear upside from interactive quote/booking capture."
      }`,
    },
    technicalStack: {
      score: step3Score,
      detectedStack: detectedStack.slice(0, 12),
      goods: step3Goods.slice(0, 4),
      bads: step3Bads.slice(0, 4),
      summary: `SEO/AEO ${seoAeoScore}/10 • Tracking/CRM/DNS ${trackingCrmScore}/10${
        totalMB ? ` • ${totalMB.toFixed(1)} MB` : ""
      }${isVerifiedSingleTab && d.perf.lcpMs ? ` • LCP ${(d.perf.lcpMs / 1000).toFixed(1)}s` : ""}.`,
    },
    creativePart: {
      score: creativeScore,
      isGenericCliche: isStandardConvention,
      observedHeadlineOrHook: d.branding.heroHeadline,
      goods: creativeGoods.slice(0, 3),
      bads: creativeBads.slice(0, 3),
      creativeUpsidePitch,
      summary: isStandardConvention
        ? "Uses standard local industry messaging — doesn't need reinventing the wheel, just a cleaner offer + instant estimator flow."
        : "Clear local positioning & offer framing; ready to scale paid conversion volume.",
    },
    automation: {
      score: automationScore,
      isSecondarySignal: true,
      confidence: autoTools.length > 0 ? "observed_widget" : "external_surface_only",
      detectedTools: autoTools.slice(0, 6),
      goods: autoTools.length > 0 ? [`Active intake/automation surface: ${autoTools.join(", ")}`] : [],
      bads: !d.crmIntake.hasChatBot ? ["No visible 24/7 web/social AI response assistant on site"] : [],
      summary:
        autoTools.length > 0
          ? `Observed external tools (${autoTools.join(", ")}); internal CRM workflows weighted lightly.`
          : "No external chat/booking widget detected (weighted lightly since backend automations aren't public).",
    },
  }

  // Personalized Cold Outreach Hook
  const firstName = firstNameOf(rec.decisionMakers[0]?.name)
  const greeting = firstName ? `Hi ${firstName},` : `Hi ${rec.company} team,`
  const cityLabel = rec.city || rec.metro || "your market"
  const rawFlawOne = uniqueFlaws[0]
    ? uniqueFlaws[0].charAt(0).toLowerCase() + uniqueFlaws[0].slice(1)
    : "high-intent visitors have to wait on a static contact form"
  const flawOne = /^earned /.test(rawFlawOne)
    ? `it has ${rawFlawOne}`
    : /^(hides |relies |displays |operates |uses |lacks )/.test(rawFlawOne)
    ? `the site ${rawFlawOne}`
    : /^missing /.test(rawFlawOne)
    ? `the page is ${rawFlawOne}`
    : /^bloated /.test(rawFlawOne)
    ? `it ships a ${rawFlawOne}`
    : rawFlawOne

  let hook: string
  if (visionOverride?.personalizedHook) {
    hook = visionOverride.personalizedHook
  } else if (outreachAngle === "scale_50pct_more") {
    hook = `${greeting} ${rec.domain} is honestly one of the cleaner ${
      rec.subCategory || "sites"
    } in ${cityLabel}${reviews >= 40 ? ` (and ${reviews} Google reviews at ${rating}★ backs it up)` : ""}. The main leak I spotted auditing your funnel is that ${flawOne}. My UX partner and I plug in an interactive quote/booking flow + 1st-party ad tracking + 24/7 web/IG/FB intake assistant designed to lift booked jobs 30–50% in 90 days — for less than half the cost of one US marketing hire. Open to a 90-second teardown video?`
  } else if (outreachAngle === "reputation_and_intake_rescue") {
    hook = `${greeting} you clearly have real volume in ${cityLabel} (${reviews} Google reviews), so I ran a quick conversion audit on ${rec.domain}. Right now ${flawOne}, which quietly costs high-ticket inquiries before your team even speaks to them. For less than a single junior US hire, my UX partner and I rebuild your intake funnel, automate 5★ review capture after every job, and add 24/7 web/IG/FB response so leads never wait. Worth sending over the 3-point audit sheet?`
  } else if (outreachAngle === "upgrade_social_and_ads") {
    hook = `${greeting} with ${reviews} reviews (${rating}★) in ${cityLabel}, your offline reputation is already proven — yet ${flawOne}. We help established ${
      rec.subCategory || "teams"
    } turn that local trust into predictable booked appointments with local paid social/search funnels, conversion landing pages, and a 24/7 IG/FB/web booking assistant for less than one in-house hire. Can I share a quick mockup for ${rec.company}?`
  } else if (outreachAngle === "startup_gtm_sprint") {
    hook = `${greeting} congrats on the momentum at ${rec.company}. Auditing ${rec.domain}, I noticed ${flawOne}. My UX partner and I run 30-day GTM & conversion sprints — sharpening product positioning, AEO/SEO schema, attribution, and automated inbound qualification for less than a single US growth hire. Open to a quick teardown of ${rec.domain}?`
  } else {
    hook = `${greeting} ${rec.company} has earned serious local trust in ${cityLabel}${
      reviews >= 40 ? ` (${reviews} Google reviews at ${rating}★)` : ""
    }, which is the hardest part — but right now ${rec.domain} holds that back because ${flawOne}. My UX partner and I build fast, above-average conversion websites + CRM + paid ad tracking + 24/7 web/IG/FB lead response for less than hiring one person in the US. Mind if I send over the visual audit sheet we put together for ${rec.company}?`
  }

  const visualCritique =
    visionOverride?.visualCritique ||
    `[Step 1 Brand/UX ${step1Score}/10 | Step 2 Sales ${step2Score}/10 (${canItSellVerdict}) | Step 3 Tech ${step3Score}/10 | Positioning ${creativeScore}/10] ${
      uniqueFlaws.join("; ") || "Clean baseline execution with funnel automation upside."
    }`

  return {
    domain: rec.domain,
    company: rec.company,
    websiteUrl: rec.websiteUrl || rec.websiteUrl,
    websiteStatus: rec.websiteStatus,
    cohort: rec.cohort,
    subCategory: rec.subCategory,
    city: rec.city,
    state: rec.state,
    metro: rec.metro,
    formattedAddress: rec.formattedAddress,
    googlePlaceId: rec.googlePlaceId,
    googleRating: rating,
    googleReviewsCount: rec.googleReviewsCount,
    googleMapsUrl: rec.googleMapsUrl,
    googleReviewsSample: rec.googleReviewsSample || [],
    isPeRollup: rec.isPeRollup,
    crmItemId: rec.crmItemId,
    source: rec.source,
    emails: cleanEmails,
    phones: rec.phones || [],
    decisionMakers: rec.decisionMakers || [],
    socialLinks: rec.socialLinks || {},
    hasVerifiedEmail: cleanEmails.length > 0,
    hasPaidAds,
    hasChatBot: Boolean(d.crmIntake.hasChatBot),
    hasDmarcRisk: !d.emailDns.hasDmarc || d.emailDns.dmarcPolicy === "none",
    diagnostics: d,
    fourPillars,
    priorityTier,
    businessStrengthScore,
    aestheticsScore,
    brandingScore,
    uxCroScore,
    seoAeoScore,
    trackingCrmScore,
    marketingScore,
    creativeScore,
    automationScore,
    modernizationGapScore,
    reviewMethod: visionOverride ? "multimodal_vision" : "diagnostic_rubric",
    outreachAngle,
    topFlaws: uniqueFlaws,
    visualCritique,
    personalizedHook: hook,
    benchmarkAdRef: w2w?.referenceAdSummary ?? null,
    specAdUrl: null,
    demoFunnelUrl: null,
    localSheetFile: rec.localSheetFile,
    auditedAt: new Date().toISOString(),
  }
}

function writeIndustryBenchmarksReport(scored: ProspectAuditDraft[]): void {
  const byCohort = new Map<ProspectCohort, ProspectAuditDraft[]>()
  for (const s of scored) {
    const arr = byCohort.get(s.cohort) || []
    arr.push(s)
    byCohort.set(s.cohort, arr)
  }

  const reportJson: Record<string, any> = {}
  const mdLines: string[] = [
    "# Local Vault Industry Benchmarks & Winning Conventions Report",
    "",
    `Generated from **${scored.length.toLocaleString()}** audited companies across 50 US Metros + Existing CRM.`,
    "",
  ]

  Array.from(byCohort.entries()).forEach(([cohort, list]) => {
    const live = list.filter((x) => x.diagnostics !== null)
    const n = Math.max(1, live.length)
    const cmsCounts: Record<string, number> = {}
    const ctaCounts: Record<string, number> = {}
    let withOffer = 0
    let withReviewsOnHome = 0
    let withBooking = 0
    let withAds = 0
    let withBot = 0
    let withDmarcRisk = 0
    const lcps: number[] = []

    for (const p of live) {
      const cms = p.fourPillars?.brandingUxUi.cmsPlatform || "Unknown"
      cmsCounts[cms] = (cmsCounts[cms] || 0) + 1
      const cta = p.diagnostics?.branding.primaryCtaText
      if (cta) ctaCounts[cta] = (ctaCounts[cta] || 0) + 1
      if (p.diagnostics?.branding.hasClearGuaranteeOrOffer) withOffer++
      if (p.diagnostics?.socialReputation.showcasesReviewsOnHome) withReviewsOnHome++
      if ((p.diagnostics?.crmIntake.bookingWidgets.length || 0) > 0) withBooking++
      if (p.hasPaidAds) withAds++
      if (p.hasChatBot) withBot++
      if (p.hasDmarcRisk) withDmarcRisk++
      if (p.diagnostics?.perf.lcpMs) lcps.push(p.diagnostics.perf.lcpMs)
    }

    lcps.sort((a, b) => a - b)
    const medianLcpMs = lcps.length > 0 ? lcps[Math.floor(lcps.length / 2)] : null
    const topCms = Object.entries(cmsCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
    const topCtas = Object.entries(ctaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k]) => k)

    const stats = {
      totalCompanies: list.length,
      liveCrawledSites: live.length,
      tierS: list.filter((x) => x.priorityTier === "S").length,
      tierA: list.filter((x) => x.priorityTier === "A").length,
      withVerifiedEmailPct: Math.round((list.filter((x) => x.hasVerifiedEmail).length / Math.max(1, list.length)) * 100),
      withClearOfferOrFinancingPct: Math.round((withOffer / n) * 100),
      showcasesReviewsOnHomePct: Math.round((withReviewsOnHome / n) * 100),
      onlineBookingWidgetPct: Math.round((withBooking / n) * 100),
      activePaidAdPixelsPct: Math.round((withAds / n) * 100),
      visibleChatBotPct: Math.round((withBot / n) * 100),
      dmarcEmailRiskPct: Math.round((withDmarcRisk / n) * 100),
      medianLcpMs,
      topCms,
      topCtas,
    }
    reportJson[cohort] = stats

    mdLines.push(`## ${cohort} (${list.length} companies | ${stats.tierS} Tier-S, ${stats.tierA} Tier-A)`)
    mdLines.push(`- **Verified Email Extracted:** ${stats.withVerifiedEmailPct}%`)
    mdLines.push(`- **Active Paid Ads (Google Ads / Meta Pixel):** ${stats.activePaidAdPixelsPct}%`)
    mdLines.push(`- **Clear Offer / Financing / Free Estimate on Homepage:** ${stats.withClearOfferOrFinancingPct}%`)
    mdLines.push(`- **Showcases Google Reviews on Homepage:** ${stats.showcasesReviewsOnHomePct}%`)
    mdLines.push(`- **Self-Serve Online Booking Widget:** ${stats.onlineBookingWidgetPct}% | **Visible Chat Widget:** ${stats.visibleChatBotPct}%`)
    mdLines.push(`- **DMARC Email Deliverability Risk:** ${stats.dmarcEmailRiskPct}% | **Median Hero LCP:** ${medianLcpMs ? `${(medianLcpMs / 1000).toFixed(2)}s` : "n/a"}`)
    mdLines.push(`- **Top CMS Platforms:** ${topCms.map(([c, cnt]) => `${c} (${cnt})`).join(", ")}`)
    mdLines.push(`- **Most Common CTAs:** ${topCtas.join(" • ") || "n/a"}`)
    mdLines.push("")
  })

  fs.writeFileSync(path.join(EXPORTS_DIR, "industry-benchmarks-report.json"), JSON.stringify(reportJson, null, 2), "utf8")
  fs.writeFileSync(path.join(EXPORTS_DIR, "industry-benchmarks-report.md"), mdLines.join("\n"), "utf8")
}

async function main() {
  ensureAuditDirs()

  const discoveredByDomain = new Map<string, DiscoveredProspect>()
  if (fs.existsSync(DISCOVERED_FILE)) {
    const lines = fs.readFileSync(DISCOVERED_FILE, "utf8").split(/\r?\n/).filter(Boolean)
    for (const l of lines) {
      try {
        const d = JSON.parse(l) as DiscoveredProspect
        if (d && d.domain) discoveredByDomain.set(d.domain, d)
      } catch {
        // skip
      }
    }
  }

  const crawledByDomain = new Map<string, CrawledProspectRecord>()
  if (fs.existsSync(CRAWLED_FILE)) {
    const lines = fs.readFileSync(CRAWLED_FILE, "utf8").split(/\r?\n/).filter(Boolean)
    for (const l of lines) {
      try {
        const rec = JSON.parse(l) as CrawledProspectRecord
        if (!rec || !rec.domain) continue
        if (discoveredByDomain.size > 0 && !discoveredByDomain.has(rec.domain)) continue
        crawledByDomain.set(rec.domain, rec)
      } catch {
        // skip
      }
    }
  }

  // Also ensure any discovered record not yet in crawled file still gets scored cleanly
  Array.from(discoveredByDomain.values()).forEach((d) => {
    if (!crawledByDomain.has(d.domain)) {
      crawledByDomain.set(d.domain, {
        ...d,
        crawledAt: new Date().toISOString(),
        crawlOk: false,
        crawlError: "not_crawled_yet",
        finalUrl: d.websiteUrl,
        cmsPlatform: null,
        isPeRollup: false,
        emails: d.seedEmails || [],
        phones: d.seedPhones || [],
        decisionMakers: [],
        socialLinks: d.seedSocialLinks || {},
        diagnostics: null,
        localSheetFile: null,
      })
    }
  })

  let w2wMap: Record<string, W2wCohortBenchmark> = {}
  const w2wFile = path.join(W2W_DIR, "benchmarks.json")
  if (fs.existsSync(w2wFile)) {
    try {
      w2wMap = JSON.parse(fs.readFileSync(w2wFile, "utf8"))
    } catch {
      w2wMap = {}
    }
  }

  const visionMap = new Map<string, VisionOverrideEntry>()
  if (fs.existsSync(VISION_OVERRIDES_FILE)) {
    try {
      const arr = JSON.parse(fs.readFileSync(VISION_OVERRIDES_FILE, "utf8")) as VisionOverrideEntry[]
      if (Array.isArray(arr)) {
        for (const v of arr) {
          if (v && v.domain) visionMap.set(v.domain.toLowerCase(), v)
        }
      }
    } catch {
      // ignore
    }
  }

  const scored: ProspectAuditDraft[] = []
  Array.from(crawledByDomain.values()).forEach((rec) => {
    scored.push(scoreProspect(rec, w2wMap, visionMap.get(rec.domain.toLowerCase())))
  })

  fs.writeFileSync(
    SCORED_FILE,
    scored.map((s) => JSON.stringify(s).replace(/[\u2028\u2029]/g, " ")).join("\n") + "\n",
    "utf8",
  )
  writeIndustryBenchmarksReport(scored)

  // Print summary
  const tierCounts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, skip: 0 }
  const angleCounts: Record<string, number> = {}
  for (const s of scored) {
    tierCounts[s.priorityTier] = (tierCounts[s.priorityTier] || 0) + 1
    angleCounts[s.outreachAngle] = (angleCounts[s.outreachAngle] || 0) + 1
  }

  console.log(`\n=== Stage 4 Scoring & Hook Generation Complete: ${scored.length} Companies ===`)
  console.log("Priority Tiers:", tierCounts)
  console.log("Outreach Angles:", angleCounts)
  console.log(`Vision-audited overrides merged: ${visionMap.size}`)
  console.log(`Saved to: ${SCORED_FILE}`)
}

main().catch((err) => {
  console.error("Scoring failed:", err)
  process.exit(1)
})
