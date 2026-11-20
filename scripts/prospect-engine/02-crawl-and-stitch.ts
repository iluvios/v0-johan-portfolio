import dns from "node:dns"
import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { chromium, type Browser } from "playwright"
import sharp from "sharp"
import {
  ROLE_EMAIL_PREFIX_RE,
  sanitizeEmailAddress,
  sanitizeProspectEmails,
  sanitizeProspectSocialLinks,
  type ProspectDecisionMaker,
  type ProspectDiagnostics,
  type ProspectEmail,
  type ProspectPerfMetrics,
  type ProspectSocialLinks,
  type WebsiteStatus,
} from "../../lib/prospects"
import {
  analyzeReviewsVoice,
  CRAWLED_FILE,
  DISCOVERED_FILE,
  ensureAuditDirs,
  isFreeBuilderSubdomain,
  sanitizePrimaryCtaText,
  SHEETS_DIR,
  VAULT_DIR,
} from "./config"
import type { DiscoveredProspect } from "./01-discover"

export interface CrawledProspectRecord extends DiscoveredProspect {
  crawledAt: string
  crawlOk: boolean
  crawlError: string | null
  finalUrl: string | null
  cmsPlatform: string | null
  isPeRollup: boolean
  emails: ProspectEmail[]
  phones: string[]
  decisionMakers: ProspectDecisionMaker[]
  socialLinks: ProspectSocialLinks
  diagnostics: ProspectDiagnostics | null
  localSheetFile: string | null
}

function parseArg(name: string, fallback: string): string {
  const prefix = `--${name}=`
  const found = process.argv.find((a) => a.startsWith(prefix))
  return found ? found.slice(prefix.length) : fallback
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms)
    promise
      .then((val) => {
        clearTimeout(timer)
        resolve(val)
      })
      .catch(() => {
        clearTimeout(timer)
        resolve(fallback)
      })
  })
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function sanitizeCrawlError(err: unknown): string {
  const raw = typeof err === "string" ? err : (err as any)?.message ? String((err as any).message) : "crawl_failed"
  const noAnsi = raw.replace(/\x1b\[[0-9;]*m/g, "")
  const firstLine = noAnsi.split(/\r?\nCall log:/i)[0].replace(/\s+/g, " ").trim()
  if (/ERR_NAME_NOT_RESOLVED/i.test(firstLine)) return "DNS domain did not resolve"
  if (/ERR_CERT|ERR_SSL|ERR_TLS/i.test(firstLine)) return "SSL/TLS certificate handshake failed"
  if (/ERR_CONNECTION_REFUSED/i.test(firstLine)) return "Server refused connection"
  if (/ERR_CONNECTION_RESET|ERR_EMPTY_RESPONSE/i.test(firstLine)) return "Server reset connection"
  if (/Timeout \d+ms exceeded|Navigation timeout|worker_hard_timeout/i.test(firstLine)) return "Page load timed out (>10s)"
  if (/Target page, context or browser has been closed|newCDPSession|no object with guid|browserContext/i.test(firstLine)) {
    return "Render timed out waiting on page assets"
  }
  return firstLine.replace(/^(?:page|browserContext)\.\w+:\s*/i, "").slice(0, 140) || "Connection error"
}

async function takeJpegScreenshotSafe(
  context: import("playwright").BrowserContext,
  page: import("playwright").Page,
  opts: { quality: number; clip?: { x: number; y: number; width: number; height: number } },
): Promise<Buffer> {
  const shotTimeout = opts.clip ? 7500 : 4500
  try {
    return await page.screenshot({
      type: "jpeg",
      quality: opts.quality,
      fullPage: Boolean(opts.clip),
      animations: "allow",
      ...(opts.clip ? { clip: opts.clip } : {}),
      timeout: shotTimeout,
    })
  } catch (err: any) {
    const msg = String(err?.message || err || "")
    // If Playwright timed out waiting on document.fonts.ready, capture directly from Chromium compositor via CDP
    if (/Timeout|fonts/i.test(msg)) {
      const cdp = await context.newCDPSession(page)
      try {
        const snap = (await withTimeout(
          cdp.send("Page.captureScreenshot", {
            format: "jpeg",
            quality: opts.quality,
            ...(opts.clip
              ? {
                  clip: { ...opts.clip, scale: 1 },
                  captureBeyondViewport: true,
                }
              : { captureBeyondViewport: false }),
          }),
          shotTimeout,
          null,
        )) as { data?: string } | null
        if (snap?.data) {
          return Buffer.from(snap.data, "base64")
        }
      } finally {
        await cdp.detach().catch(() => {})
      }
    }
    throw err
  }
}

// Cached DNS MX / SPF / DMARC resolver (3.5s cap per lookup)
const dnsCache = new Map<
  string,
  {
    mxProvider: string | null
    mxRecords: string[]
    hasSpf: boolean
    spfRaw: string | null
    detectedEspCrmFromSpf: string[]
    hasDmarc: boolean
    dmarcPolicy: string | null
  }
>()

async function inspectEmailDns(domain: string) {
  if (domain.endsWith(".local") || isFreeBuilderSubdomain(domain)) {
    return {
      mxProvider: null,
      mxRecords: [],
      hasSpf: false,
      spfRaw: null,
      detectedEspCrmFromSpf: [],
      hasDmarc: false,
      dmarcPolicy: null,
    }
  }
  const parts = domain.split(".")
  const rootDomain = parts.length > 2 && !domain.endsWith(".co.uk") ? parts.slice(-2).join(".") : domain
  const cached = dnsCache.get(rootDomain)
  if (cached) return cached

  const resolver = dns.promises
  const [mxList, txtRoot, txtDmarc] = await Promise.all([
    withTimeout(resolver.resolveMx(rootDomain), 2500, []),
    withTimeout(resolver.resolveTxt(rootDomain), 2500, []),
    withTimeout(resolver.resolveTxt(`_dmarc.${rootDomain}`), 2500, []),
  ])

  const mxRecords = mxList
    .sort((a, b) => a.priority - b.priority)
    .map((m) => m.exchange.toLowerCase())
    .slice(0, 6)
  const mxJoined = mxRecords.join(" ")
  let mxProvider: string | null = null
  if (/google\.com|googlemail\.com/.test(mxJoined)) mxProvider = "Google Workspace"
  else if (/protection\.outlook\.com|mail\.eo\.outlook/.test(mxJoined)) mxProvider = "Microsoft 365"
  else if (/secureserver\.net/.test(mxJoined)) mxProvider = "GoDaddy Email"
  else if (/pphosted\.com/.test(mxJoined)) mxProvider = "Proofpoint"
  else if (/mimecast\.com/.test(mxJoined)) mxProvider = "Mimecast"
  else if (/zoho\.com/.test(mxJoined)) mxProvider = "Zoho Mail"
  else if (/yahoodns\.net/.test(mxJoined)) mxProvider = "Yahoo Business"
  else if (/protonmail\.ch/.test(mxJoined)) mxProvider = "Proton"
  else if (mxRecords.length > 0) mxProvider = mxRecords[0]

  const flatRootTxt = txtRoot.map((chunks) => chunks.join(""))
  const spfRaw = flatRootTxt.find((t) => /^v=spf1\b/i.test(t.trim())) ?? null
  const hasSpf = Boolean(spfRaw)

  const detectedEspCrmFromSpf: string[] = []
  if (spfRaw) {
    const s = spfRaw.toLowerCase()
    if (s.includes("hubspot")) detectedEspCrmFromSpf.push("HubSpot")
    if (s.includes("klaviyo")) detectedEspCrmFromSpf.push("Klaviyo")
    if (s.includes("emsd1.com") || s.includes("activecampaign")) detectedEspCrmFromSpf.push("ActiveCampaign")
    if (s.includes("mcsv.net") || s.includes("mailchimp") || s.includes("mandrill")) detectedEspCrmFromSpf.push("Mailchimp")
    if (s.includes("salesforce") || s.includes("exacttarget") || s.includes("pardot")) detectedEspCrmFromSpf.push("Salesforce")
    if (s.includes("sendgrid")) detectedEspCrmFromSpf.push("SendGrid")
    if (s.includes("mailgun")) detectedEspCrmFromSpf.push("Mailgun")
    if (s.includes("constantcontact") || s.includes("ccsend.com")) detectedEspCrmFromSpf.push("Constant Contact")
    if (s.includes("sendinblue") || s.includes("brevo")) detectedEspCrmFromSpf.push("Brevo")
    if (s.includes("mktomail")) detectedEspCrmFromSpf.push("Marketo")
    if (s.includes("zendesk")) detectedEspCrmFromSpf.push("Zendesk")
    if (s.includes("freshdesk")) detectedEspCrmFromSpf.push("Freshdesk")
  }

  const flatDmarcTxt = txtDmarc.map((chunks) => chunks.join(""))
  const dmarcRaw = flatDmarcTxt.find((t) => /^v=dmarc1\b/i.test(t.trim())) ?? null
  const hasDmarc = Boolean(dmarcRaw)
  let dmarcPolicy: string | null = null
  if (dmarcRaw) {
    const m = dmarcRaw.match(/\bp\s*=\s*(none|quarantine|reject)\b/i)
    dmarcPolicy = m ? m[1].toLowerCase() : "unknown"
  }

  const result = {
    mxProvider,
    mxRecords,
    hasSpf,
    spfRaw: spfRaw ? spfRaw.slice(0, 300) : null,
    detectedEspCrmFromSpf,
    hasDmarc,
    dmarcPolicy,
  }
  dnsCache.set(rootDomain, result)
  return result
}

async function fetchTextSafe(url: string, timeoutMs = 4000, maxChars = 180000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    const ct = (res.headers.get("content-type") || "").toLowerCase()
    if (/image\/|video\/|audio\/|application\/pdf|application\/zip/.test(ct)) return null
    const txt = await res.text()
    return txt.slice(0, maxChars)
  } catch {
    return null
  }
}

function extractEmailsFromText(text: string, sourceLabel: string, outMap: Map<string, ProspectEmail>): void {
  // Strip inline CSS (<style>) and executable JS (<script> except ld+json) so font OFL headers & Sentry DSNs are ignored
  const cleanedSource = text
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, " ")
  const matches = cleanedSource.match(/[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{2,120}\.[a-zA-Z]{2,18}/g) || []
  for (const raw of matches) {
    const addr = sanitizeEmailAddress(raw)
    if (!addr) continue
    if (outMap.has(addr)) continue
    const kind: "owner" | "role" = ROLE_EMAIL_PREFIX_RE.test(addr) ? "role" : "owner"
    outMap.set(addr, { address: addr, kind, source: sourceLabel })
  }
}

function extractPhonesFromText(text: string, outSet: Set<string>): void {
  const matches = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g) || []
  for (const raw of matches) {
    const digits = raw.replace(/\D/g, "")
    const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
    if (ten.length !== 10) continue
    if (/^(000|111|123|555|999)/.test(ten)) continue
    const formatted = `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
    if (outSet.size < 8) outSet.add(formatted)
  }
}

function stripHtmlClean(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
}

// Pure string scripts evaluated inside Chromium so esbuild/tsx NEVER injects __name() helpers
const DISMISS_POPUPS_SCRIPT = `(() => {
  const selectors = [
    '[id*="cookie" i] button',
    '[class*="cookie" i] button',
    '[aria-label*="close" i]',
    '[aria-label*="dismiss" i]',
    'button[class*="close" i]',
    '.klaviyo-close-form',
    '.pum-close'
  ];
  for (const sel of selectors) {
    const nodes = document.querySelectorAll(sel);
    for (let i = 0; i < Math.min(nodes.length, 4); i++) {
      const el = nodes[i];
      const txt = (el.innerText || el.getAttribute('aria-label') || '').toLowerCase();
      if (/accept|agree|got it|allow|close|dismiss|^x$|×/.test(txt)) {
        try { el.click(); } catch (e) {}
      }
    }
  }
})()`

const FULL_PAGE_MAX_HEIGHT_PX = 9000

let globalWireBytesTransferred = 0

async function probeInternetSpeedMbps(): Promise<number> {
  const endpoints = [
    "https://speed.cloudflare.com/__down?bytes=1200000",
    "https://ajax.googleapis.com/ajax/libs/threejs/r84/three.min.js",
  ]
  for (const url of endpoints) {
    try {
      const crawlStartBytes = globalWireBytesTransferred
      const t0 = performance.now()
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
        signal: AbortSignal.timeout(6500),
      })
      if (!res.ok) continue
      const buf = await res.arrayBuffer()
      const elapsedSec = Math.max(0.05, (performance.now() - t0) / 1000)
      const concurrentCrawlBytes = Math.max(0, globalWireBytesTransferred - crawlStartBytes)
      const totalPipeBytes = buf.byteLength + concurrentCrawlBytes
      if (buf.byteLength < 50000) continue
      const mbps = (totalPipeBytes * 8) / (elapsedSec * 1_000_000)
      return Number(Math.max(0.8, Math.min(250, mbps)).toFixed(2))
    } catch {
      // try fallback CDN
    }
  }
  return 3.0
}

function recommendedConcurrencyForMbps(mbps: number, maxCap = 8): number {
  let target = 1
  if (mbps < 4.5) target = 1
  else if (mbps < 8.0) target = 2
  else if (mbps < 12.5) target = 3
  else if (mbps < 17.5) target = 4
  else if (mbps < 24.0) target = 5
  else if (mbps < 32.0) target = 6
  else target = 8
  return Math.max(1, Math.min(maxCap, target))
}

function isKnownWafPage(rec: CrawledProspectRecord | undefined): boolean {
  const d = rec?.diagnostics
  if (!d) return false
  const h1Raw = (d.branding?.heroHeadline || "").trim()
  const titleRaw = (d.seo?.title || "").trim()
  const combinedHead = `${titleRaw} ${h1Raw} ${d.branding?.heroSubheadline || ""}`.toLowerCase()
  return (
    ((h1Raw.toLowerCase() === rec.domain.toLowerCase() || titleRaw.toLowerCase() === rec.domain.toLowerCase()) &&
      (d.seo?.imgCount ?? 0) <= 1 &&
      (d.commercialPagesCount ?? 0) === 0) ||
    (!titleRaw &&
      (d.seo?.h1Count ?? 0) === 0 &&
      (d.seo?.imgCount ?? 0) === 0 &&
      (d.commercialPagesCount ?? 0) === 0 &&
      (d.perf?.requestCount ?? 0) <= 5) ||
    /checking the site connection security|checking your browser|please wait while your request is being verified|just a moment|one moment, please|verify you are human|attention required! \| cloudflare|sucuri website firewall|robot validate|robot or human|ddos-guard|bot verification|^403\b.*\bforbidden|^access denied|^forbidden$/i.test(
      combinedHead,
    )
  )
}

const HIDE_PRELOADER_CURTAINS_SCRIPT = `(() => {
  const vw = window.innerWidth || 1440;
  const vh = window.innerHeight || 900;
  const sel = '#preloader, .preloader, [class*="preloader" i], [id*="preloader" i], [class*="page-loader" i], [id*="page-loader" i], [class*="loader-wrapper" i], [class*="loading-screen" i]';
  const nodes = document.querySelectorAll(sel);
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    const cs = window.getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'absolute') {
      const r = el.getBoundingClientRect();
      if (r.width >= vw * 0.65 && r.height >= vh * 0.65) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      }
    }
  }
  const heroCandidates = document.querySelectorAll('main > section:first-of-type, main > div:first-of-type, [class*="hero" i], [id*="hero" i]');
  for (let j = 0; j < Math.min(heroCandidates.length, 24); j++) {
    const h = heroCandidates[j];
    const cs = window.getComputedStyle(h);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (parseFloat(cs.opacity || '1') < 0.9) {
      h.style.setProperty('opacity', '1', 'important');
      h.style.setProperty('transform', 'none', 'important');
    }
  }
})()`

const PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT = `(() => {
  const imgs = document.querySelectorAll('img');
  for (let i = 0; i < imgs.length; i++) {
    const im = imgs[i];
    if (im.getAttribute('loading') === 'lazy') im.setAttribute('loading', 'eager');
    if (im.getAttribute('decoding') === 'async') im.setAttribute('decoding', 'sync');
    const curSrc = (im.getAttribute('src') || '').trim();
    const isPlaceholder = !curSrc || curSrc.startsWith('data:image/svg') || curSrc.startsWith('data:image/gif') || curSrc.includes('1x1') || curSrc.includes('blank.');
    if (isPlaceholder) {
      const lazySrc = im.getAttribute('data-src') || im.getAttribute('data-lazy-src') || im.getAttribute('data-original') || im.getAttribute('data-lazyload') || im.getAttribute('data-image');
      if (lazySrc && !lazySrc.startsWith('data:')) im.setAttribute('src', lazySrc);
    }
    const curSrcset = (im.getAttribute('srcset') || '').trim();
    if (!curSrcset) {
      const lazySet = im.getAttribute('data-srcset') || im.getAttribute('data-lazy-srcset');
      if (lazySet) im.setAttribute('srcset', lazySet);
    }
  }
  const sources = document.querySelectorAll('picture source[data-srcset]');
  for (let s = 0; s < sources.length; s++) {
    const srcEl = sources[s];
    const ds = srcEl.getAttribute('data-srcset');
    if (ds && !srcEl.getAttribute('srcset')) srcEl.setAttribute('srcset', ds);
  }
  const bgNodes = document.querySelectorAll('[data-bg], [data-background-image], [data-bg-hidpi]');
  for (let j = 0; j < bgNodes.length; j++) {
    const el = bgNodes[j];
    const bg = el.getAttribute('data-bg') || el.getAttribute('data-background-image') || el.getAttribute('data-bg-hidpi');
    if (bg && (!el.style.backgroundImage || el.style.backgroundImage === 'none')) {
      el.style.backgroundImage = 'url("' + bg + '")';
    }
  }
  // Finish active Web Animations API transitions cleanly
  try {
    if (document.getAnimations) {
      const anims = document.getAnimations();
      for (let a = 0; a < anims.length; a++) {
        try {
          const playState = anims[a].playState;
          if (playState === 'running' || playState === 'pending') {
            const effect = anims[a].effect;
            const timing = effect && effect.getComputedTiming ? effect.getComputedTiming() : null;
            if (!timing || (timing.iterations && timing.iterations < 5)) {
              anims[a].finish();
            }
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  // Unlock Elementor, AOS, Divi, WPBakery, and custom scroll-reveal containers that have entered or passed the viewport
  const revealSel = '.elementor-invisible, [data-aos], .et-waypoint, .wpb_animate_when_almost_visible, [data-sal], [data-scroll]';
  const revNodes = document.querySelectorAll(revealSel);
  for (let k = 0; k < revNodes.length; k++) {
    const rn = revNodes[k];
    rn.classList.remove('elementor-invisible');
    if (rn.hasAttribute('data-aos')) rn.classList.add('aos-animate');
    if (rn.classList.contains('et-waypoint')) rn.classList.add('et-animated');
    if (rn.classList.contains('wpb_animate_when_almost_visible')) rn.classList.add('wpb_start_animation', 'animated');
  }

  // Lock in normal-flow content blocks already scrolled to/past so reversible scroll-out observers or mid-fade transitions stay at opacity: 1
  const maxReachedY = window.scrollY + window.innerHeight + 120;
  const flowCandidates = document.querySelectorAll('main section, main article, main div, main h1, main h2, main h3, main p, main img, main figure, body > div section, .wp-block-group, .wp-block-columns, .wp-block-cover, .wp-block-image');
  for (let m = 0; m < Math.min(flowCandidates.length, 900); m++) {
    const el = flowCandidates[m];
    const r = el.getBoundingClientRect();
    const absTop = r.top + window.scrollY;
    if (absTop > maxReachedY || r.width < 48 || r.height < 16) continue;
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.position !== 'static' && cs.position !== 'relative') continue;
    const op = parseFloat(cs.opacity || '1');
    if (op < 0.92) {
      if (el.closest('header, nav, [aria-hidden="true"], [role="dialog"], [class*="menu" i], [class*="modal" i], [class*="popup" i], [class*="dropdown" i], [class*="tooltip" i], [class*="swiper" i], [class*="carousel" i], [class*="slider" i]')) {
        continue;
      }
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('transform', 'none', 'important');
      el.style.setProperty('transition', 'none', 'important');
    }
  }
})()`

const buildWaitVisibleImagesAndFontsScript = (maxScrollPx: number, maxWaitMs: number) => `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const started = Date.now();
  let lastPending = 999999;
  let lastProgressAt = started;

  const inspectVisible = () => {
    const imgs = document.querySelectorAll('img');
    let pending = 0;
    let total = 0;
    for (let i = 0; i < imgs.length; i++) {
      const im = imgs[i];
      const src = (im.currentSrc || im.getAttribute('src') || '').trim();
      if (!src || src.startsWith('data:')) continue;
      const r = im.getBoundingClientRect();
      const absTop = r.top + window.scrollY;
      if (absTop > ${maxScrollPx + 150}) continue;
      if (r.width < 12 && r.height < 12) continue;
      const cs = window.getComputedStyle(im);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      total++;
      if (!im.complete) pending++;
    }
    return { pending, total };
  };

  while (Date.now() - started < ${maxWaitMs}) {
    const info = inspectVisible();
    if (info.pending === 0) break;
    if (info.pending < lastPending) {
      lastPending = info.pending;
      lastProgressAt = Date.now();
    } else if (Date.now() - lastProgressAt > 4200) {
      break;
    }
    await sleep(250);
  }

  try {
    if (document.fonts && document.fonts.ready) {
      await Promise.race([document.fonts.ready, sleep(2000)]);
    }
  } catch (e) {}

  return inspectVisible();
})()`

const HIDE_BOTTOM_FIXED_WIDGETS_SCRIPT = `(() => {
  const all = document.querySelectorAll('body *');
  for (let i = 0; i < Math.min(all.length, 1800); i++) {
    const el = all[i];
    const cs = window.getComputedStyle(el);
    if (cs.position === 'fixed') {
      const r = el.getBoundingClientRect();
      // Hide floating chat widgets, sticky bottom promo bars, or cookie badges anchored below y=360 so they don't stamp mid-page on full-height captures
      if (r.top > 360 && r.height < 520) {
        el.setAttribute('data-audit-hidden-fixed', el.style.getPropertyValue('visibility') || '');
        el.style.setProperty('visibility', 'hidden', 'important');
      }
    }
  }
})()`

const RESTORE_BOTTOM_FIXED_WIDGETS_SCRIPT = `(() => {
  const hidden = document.querySelectorAll('[data-audit-hidden-fixed]');
  for (let i = 0; i < hidden.length; i++) {
    const el = hidden[i];
    const prev = el.getAttribute('data-audit-hidden-fixed');
    if (prev) el.style.setProperty('visibility', prev);
    else el.style.removeProperty('visibility');
    el.removeAttribute('data-audit-hidden-fixed');
  }
})()`

async function simulateHumanScrollAndSettle(
  page: import("playwright").Page,
  maxHeightCap = FULL_PAGE_MAX_HEIGHT_PX,
): Promise<{ pendingImages: number; pageHeight: number }> {
  await page.evaluate(PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT).catch(() => {})
  let pageHeight = Number(
    await page
      .evaluate(`Math.max(document.body ? document.body.scrollHeight : 0, document.documentElement ? document.documentElement.scrollHeight : 0, 900)`)
      .catch(() => 2400),
  )
  const targetMaxY = Math.min(maxHeightCap, Math.max(900, pageHeight))
  const stepPx = 480
  let currentY = 0

  while (currentY + 600 < targetMaxY) {
    const beforeY = Number(await page.evaluate(`window.scrollY || 0`).catch(() => currentY))
    await page.mouse.wheel(0, stepPx).catch(() => {})
    await new Promise((r) => setTimeout(r, 120))
    const afterWheelY = Number(await page.evaluate(`window.scrollY || 0`).catch(() => beforeY))
    if (afterWheelY <= beforeY + 20) {
      await page.evaluate(`window.scrollBy({ top: ${stepPx}, behavior: 'instant' })`).catch(() => {})
    }
    currentY += stepPx
    await new Promise((r) => setTimeout(r, 340))
    await page.evaluate(PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT).catch(() => {})
    // Re-check scrollHeight in case lazy sections expanded page height
    const grownH = Number(
      await page
        .evaluate(`Math.max(document.body ? document.body.scrollHeight : 0, document.documentElement ? document.documentElement.scrollHeight : 0, 900)`)
        .catch(() => pageHeight),
    )
    if (grownH > pageHeight) pageHeight = grownH
  }

  // Final scroll to bottom cap + 1,500ms animation & lazy-footer settle dwell
  const finalBottomY = Math.min(maxHeightCap, Math.max(0, pageHeight - 850))
  await page.evaluate(`window.scrollTo({ top: ${finalBottomY}, behavior: 'instant' })`).catch(() => {})
  await new Promise((r) => setTimeout(r, 1500))
  await page.evaluate(PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT).catch(() => {})

  // Wait up to 15s for visible images across the full homepage height to finish decoding
  const imgState = (await page
    .evaluate(buildWaitVisibleImagesAndFontsScript(Math.min(maxHeightCap, pageHeight), 15000))
    .catch(() => ({ pending: 0, total: 0 }))) as { pending: number; total: number }

  // Return to top (0, 0), dismiss any scroll-triggered modal, and allow 1,200ms for sticky nav / hero parallax to settle
  await page.evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`).catch(() => {})
  await new Promise((r) => setTimeout(r, 600))
  await page.evaluate(DISMISS_POPUPS_SCRIPT).catch(() => {})
  await page.evaluate(PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT).catch(() => {})
  await new Promise((r) => setTimeout(r, 600))

  const settledHeight = Number(
    await page
      .evaluate(`Math.max(document.body ? document.body.scrollHeight : 0, document.documentElement ? document.documentElement.scrollHeight : 0, 900)`)
      .catch(() => pageHeight),
  )

  return {
    pendingImages: Number(imgState?.pending) || 0,
    pageHeight: settledHeight || pageHeight,
  }
}

const DESKTOP_EXTRACTOR_SCRIPT = `(() => {
  const getMeta = (name) => {
    const el = document.querySelector('meta[name="' + name + '" i], meta[property="' + name + '" i]');
    return el ? (el.getAttribute('content') || '').trim() : null;
  };
  const title = (document.title || '').trim() || null;
  const metaDescription = getMeta('description') || getMeta('og:description');
  const canonicalEl = document.querySelector('link[rel="canonical" i]');
  const hasCanonical = Boolean(canonicalEl && canonicalEl.getAttribute('href'));

  const h1s = Array.from(document.querySelectorAll('h1')).map(e => (e.innerText || '').replace(/\\s+/g, ' ').trim()).filter(Boolean);
  const h2s = Array.from(document.querySelectorAll('h2')).map(e => (e.innerText || '').replace(/\\s+/g, ' ').trim()).filter(Boolean);
  const h3s = Array.from(document.querySelectorAll('h3')).map(e => (e.innerText || '').replace(/\\s+/g, ' ').trim()).filter(Boolean);

  const imgs = Array.from(document.querySelectorAll('img'));
  const imgCount = imgs.length;
  let missingAlt = 0;
  let brokenImagesCount = 0;
  let mixedContentCount = 0;
  const isHttps = location.protocol === 'https:';
  for (const im of imgs) {
    const alt = im.getAttribute('alt');
    if (alt === null || alt.trim() === '') missingAlt++;
    const src = im.getAttribute('src') || '';
    if (src.length > 3 && !/\\.svg(\\?|$)|^data:image\\/svg/i.test(src)) {
      const r = im.getBoundingClientRect();
      const cs = window.getComputedStyle(im);
      const isVisibleLayoutImg = r.width > 16 && r.height > 16 && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
      if (isVisibleLayoutImg && im.complete && im.naturalWidth === 0) {
        brokenImagesCount++;
      }
    }
    if (isHttps && src.startsWith('http://')) mixedContentCount++;
  }

  // Logo crispness check
  const logoCand = document.querySelector('header svg, nav svg, [class*="logo" i] svg, header img[src*=".svg" i], [class*="logo" i] img');
  let hasVectorOrCrispLogo = false;
  if (logoCand) {
    if (logoCand.tagName.toLowerCase() === 'svg') hasVectorOrCrispLogo = true;
    else if (logoCand.tagName.toLowerCase() === 'img') {
      const s = (logoCand.getAttribute('src') || '').toLowerCase();
      if (s.includes('.svg') || (logoCand.naturalWidth && logoCand.clientWidth && logoCand.naturalWidth >= logoCand.clientWidth * 1.5)) {
        hasVectorOrCrispLogo = true;
      }
    }
  }

  // Sticky header overlap check against first visible H1
  let stickyHeaderOverlapPx = 0;
  const headerEl = document.querySelector('header, nav, [class*="header" i]');
  const firstH1 = document.querySelector('h1');
  if (headerEl && firstH1) {
    const hs = window.getComputedStyle(headerEl);
    if (hs.position === 'fixed' || hs.position === 'sticky') {
      const hr = headerEl.getBoundingClientRect();
      const h1r = firstH1.getBoundingClientRect();
      if (hr.bottom > h1r.top && h1r.top >= 0 && hr.height < 260) {
        stickyHeaderOverlapPx = Math.round(hr.bottom - h1r.top);
      }
    }
  }

  // Fonts & Color Tokens
  const fontSet = new Set();
  const colorCounts = {};
  const sampleSelectors = ['body', 'h1', 'h2', 'header', 'button', 'a[class*="btn" i]', 'a[class*="button" i]'];
  for (const sel of sampleSelectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const cs = window.getComputedStyle(el);
    if (cs.fontFamily) {
      const primaryFont = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      if (primaryFont) fontSet.add(primaryFont);
    }
    for (const c of [cs.backgroundColor, cs.color]) {
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
        colorCounts[c] = (colorCounts[c] || 0) + 1;
      }
    }
  }

  // CTAs & Hero subheadline
  const ctaButtons = Array.from(document.querySelectorAll('a, button'))
    .map(el => (el.innerText || '').replace(/\\s+/g, ' ').trim())
    .filter(t => t.length >= 3 && t.length <= 48 && !/\\b(facebook|instagram|linkedin|tiktok|youtube|twitter|yelp|quickbooks)\\b/i.test(t) && /\\b(book|booking|schedule|quote|estimate|call|contact|consult|consultation|tour|get started|free|apply|pricing|appointment|claim|inquire|reserve)\\b/i.test(t));
  const uniqueCtas = Array.from(new Set(ctaButtons)).slice(0, 12);

  let heroSubheadline = null;
  if (firstH1 && firstH1.parentElement) {
    const p = firstH1.parentElement.querySelector('p');
    if (p) heroSubheadline = (p.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 240);
  }

  // Forms
  const forms = Array.from(document.querySelectorAll('form'));
  let maxFormFields = 0;
  for (const f of forms) {
    const inputs = f.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea, select');
    if (inputs.length > maxFormFields) maxFormFields = inputs.length;
  }

  // Links: internal commercial links, mailto, tel, social
  const anchors = Array.from(document.querySelectorAll('a'));
  const mailtos = [];
  const tels = [];
  const socials = {};
  let brokenSocialIconCount = 0;
  const internalLinks = [];

  for (const a of anchors) {
    const rawHref = (a.getAttribute('href') || '').trim();
    const ariaAndClass = ((a.getAttribute('aria-label') || '') + ' ' + (a.className || '')).toLowerCase();
    if ((!rawHref || rawHref === '#' || rawHref.startsWith('javascript:')) && /instagram|facebook|linkedin|tiktok|youtube|twitter/.test(ariaAndClass)) {
      brokenSocialIconCount++;
      continue;
    }
    if (!rawHref) continue;
    if (rawHref.toLowerCase().startsWith('mailto:')) {
      mailtos.push(rawHref.slice(7).split('?')[0].trim());
      continue;
    }
    if (rawHref.toLowerCase().startsWith('tel:')) {
      tels.push(rawHref.slice(4).trim());
      continue;
    }
    let abs = '';
    let linkHost = '';
    try {
      const parsed = new URL(rawHref, location.href);
      abs = parsed.toString();
      linkHost = parsed.hostname.toLowerCase().replace(/^www\\./, '');
    } catch (e) { continue; }
    const low = abs.toLowerCase();
    if ((linkHost === 'instagram.com' || linkHost.endsWith('.instagram.com')) && !socials.instagram) socials.instagram = abs;
    else if ((linkHost === 'facebook.com' || linkHost.endsWith('.facebook.com') || linkHost === 'fb.com') && !low.includes('sharer') && !socials.facebook) socials.facebook = abs;
    else if ((linkHost === 'linkedin.com' || linkHost.endsWith('.linkedin.com')) && !low.includes('sharearticle') && !socials.linkedin) socials.linkedin = abs;
    else if ((linkHost === 'tiktok.com' || linkHost.endsWith('.tiktok.com')) && !socials.tiktok) socials.tiktok = abs;
    else if ((linkHost === 'youtube.com' || linkHost.endsWith('.youtube.com') || linkHost === 'youtu.be') && !socials.youtube) socials.youtube = abs;
    else if ((linkHost === 'twitter.com' || linkHost === 'x.com') && !low.includes('intent/') && !socials.x) socials.x = abs;
    else if ((linkHost === 'yelp.com' || linkHost.endsWith('.yelp.com')) && low.includes('/biz/') && !socials.yelp) socials.yelp = abs;

    try {
      const u = new URL(abs);
      if (u.hostname.replace(/^www\\./, '') === location.hostname.replace(/^www\\./, '')) {
        const p = u.pathname.toLowerCase();
        if (p !== '/' && p.length > 1 && !/\\.(jpg|jpeg|png|webp|pdf|svg|zip|css|js)$/i.test(p)) {
          internalLinks.push({ url: u.origin + u.pathname, text: (a.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 80) });
        }
      }
    } catch (e) {}
  }

  // JSON-LD Structured Data
  const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json" i]'));
  const jsonLdTypes = [];
  let hasSameAsLinks = false;
  const schemaPeople = [];
  const collectLd = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(collectLd); return; }
    if (node['@type']) {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      for (const t of types) {
        if (typeof t === 'string') jsonLdTypes.push(t);
        if ((t === 'Person' || t === 'Physician' || t === 'Attorney' || t === 'Dentist') && node.name) {
          schemaPeople.push({ name: String(node.name).slice(0, 80), role: String(node.jobTitle || t).slice(0, 80) });
        }
      }
    }
    if (Array.isArray(node.sameAs) && node.sameAs.length > 0) hasSameAsLinks = true;
    if (node.founder) collectLd(node.founder);
    if (node.employee) collectLd(node.employee);
    if (node['@graph']) collectLd(node['@graph']);
  };
  for (const s of jsonLdScripts) {
    try { collectLd(JSON.parse(s.textContent || '{}')); } catch (e) {}
  }

  // Performance metrics (including buffered PerformanceObserver window.__cwv)
  const nav = performance.getEntriesByType('navigation')[0];
  const paints = performance.getEntriesByType('paint');
  const fcpEntry = paints.find(p => p.name === 'first-contentful-paint');
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  const lastLcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1] : null;
  const clsEntries = performance.getEntriesByType('layout-shift');
  let cls = 0;
  for (const c of clsEntries) { if (!c.hadRecentInput && typeof c.value === 'number') cls += c.value; }
  const cwv = window.__cwv || { lcp: null, cls: 0 };
  const resolvedLcp = (typeof cwv.lcp === 'number' && cwv.lcp > 0)
    ? Math.round(cwv.lcp)
    : (lastLcp ? Math.round(lastLcp.startTime) : (fcpEntry ? Math.round(fcpEntry.startTime) : null));
  const resolvedCls = (typeof cwv.cls === 'number' && cwv.cls > 0) ? cwv.cls : cls;

  const bodyText = (document.body ? document.body.innerText : '') || '';

  return {
    title,
    metaDescription,
    hasCanonical,
    h1s: h1s.slice(0, 8),
    h2s: h2s.slice(0, 25),
    h3s: h3s.slice(0, 25),
    imgCount,
    missingAltRatio: imgCount > 0 ? Number((missingAlt / imgCount).toFixed(2)) : 0,
    brokenImagesCount,
    mixedContentCount,
    hasVectorOrCrispLogo,
    stickyHeaderOverlapPx,
    fontFamilies: Array.from(fontSet).slice(0, 8),
    primaryColors: Object.keys(colorCounts).slice(0, 6),
    uniqueCtas,
    heroSubheadline,
    formCount: forms.length,
    maxFormFields,
    mailtos,
    tels,
    socials,
    brokenSocialIconCount,
    internalLinks: internalLinks.slice(0, 90),
    jsonLdTypes: Array.from(new Set(jsonLdTypes)),
    hasSameAsLinks,
    schemaPeople: schemaPeople.slice(0, 6),
    perfNav: {
      ttfbMs: nav ? Math.round(nav.responseStart) : null,
      fcpMs: fcpEntry ? Math.round(fcpEntry.startTime) : null,
      lcpMs: resolvedLcp,
      cls: Number(resolvedCls.toFixed(3)),
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadMs: nav && nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd) : null,
    },
    pageHeight: document.documentElement.scrollHeight || 900,
    bodyTextSample: bodyText.replace(/\\s+/g, ' ').trim().slice(0, 12000),
  };
})()`

const MOBILE_EXTRACTOR_SCRIPT = `(() => {
  const docEl = document.documentElement;
  const mobileHorizontalOverflow = (docEl.scrollWidth || 0) > (window.innerWidth + 10);
  const paras = Array.from(document.querySelectorAll('p, li')).slice(0, 40);
  let tinyMobileTextCount = 0;
  for (const p of paras) {
    const txt = (p.innerText || '').trim();
    if (txt.length < 20) continue;
    const fs = parseFloat(window.getComputedStyle(p).fontSize || '16');
    if (fs > 0 && fs < 12.5) tinyMobileTextCount++;
  }
  return { mobileHorizontalOverflow, tinyMobileTextCount };
})()`

function detectCmsAndStack(html: string, networkUrls: string[]) {
  const h = html.toLowerCase()
  const net = networkUrls.join(" ").toLowerCase()
  const combined = `${h} ${net}`

  let cmsPlatform: string | null = null
  if (combined.includes("wp-content") || combined.includes("wp-includes")) cmsPlatform = "WordPress"
  else if (combined.includes("webflow.com") || combined.includes("data-wf-site")) cmsPlatform = "Webflow"
  else if (combined.includes("squarespace.com") || combined.includes("static1.squarespace")) cmsPlatform = "Squarespace"
  else if (combined.includes("wixstatic.com") || combined.includes("wix.com") || combined.includes("wixsite.com") || combined.includes("wixstudio.com")) cmsPlatform = "Wix"
  else if (combined.includes("square.site") || combined.includes("editmysite.com")) cmsPlatform = "Square Online"
  else if (combined.includes("cdn.shopify.com")) cmsPlatform = "Shopify"
  else if (combined.includes("_next/static")) cmsPlatform = "Next.js"
  else if (combined.includes("wsimg.com") || combined.includes("godaddysites")) cmsPlatform = "GoDaddy Builder"
  else if (combined.includes("irp.cdn-website.com") || combined.includes("duda")) cmsPlatform = "Duda"
  else if (combined.includes("hubspotusercontent") || combined.includes("hs-scripts.com")) cmsPlatform = "HubSpot CMS"
  else cmsPlatform = "Custom / Static HTML"

  // Tracking & Pixels (live network + HTML catches tags inside GTM!)
  const hasGtm = /googletagmanager\.com\/gtm\.js|gtm-[a-z0-9]{5,}/i.test(combined)
  const hasGa4 = /google-analytics\.com\/g\/collect|gtag\(['"]config['"],\s*['"]g-|G-[A-Z0-9]{7,}/i.test(`${html} ${networkUrls.join(" ")}`)
  const hasLegacyUa = /UA-\d{5,}-\d+/i.test(html)
  const hasGoogleAds = /googleadservices\.com|googlesyndication|AW-\d{7,}|doubleclick\.net\/pagead\/viewthroughconversion/i.test(`${html} ${networkUrls.join(" ")}`)
  const hasMetaPixel = /connect\.facebook\.net.*fbevents\.js|facebook\.com\/tr\?id=|fbq\(['"]init['"]/i.test(combined)
  const hasTikTokPixel = /analytics\.tiktok\.com/i.test(combined)
  const hasLinkedInInsight = /snap\.licdn\.com|px\.ads\.linkedin\.com/i.test(combined)
  const hasBingUet = /bat\.bing\.com/i.test(combined)
  // Server-side GTM / 1st party CAPI (g/collect sent to non-google custom subdomain)
  const hasServerSideGtm = networkUrls.some(
    (u) => /\/g\/collect\?v=2/i.test(u) && !/google-analytics\.com|analytics\.google\.com/i.test(u),
  )

  let callTrackingProvider: string | null = null
  if (/callrail\.com|cdn\.callrail/i.test(combined)) callTrackingProvider = "CallRail"
  else if (/whatconverts\.com|ksrndkehqnwntyxlhgto/i.test(combined)) callTrackingProvider = "WhatConverts"
  else if (/invoca\.net|invocacdn/i.test(combined)) callTrackingProvider = "Invoca"
  else if (/calltrackingmetrics\.com|tctm\.co/i.test(combined)) callTrackingProvider = "CallTrackingMetrics"

  const heatmapTools: string[] = []
  if (/clarity\.ms/i.test(combined)) heatmapTools.push("Microsoft Clarity")
  if (/hotjar\.com/i.test(combined)) heatmapTools.push("Hotjar")
  if (/posthog\.com/i.test(combined)) heatmapTools.push("PostHog")
  if (/fullstory\.com/i.test(combined)) heatmapTools.push("FullStory")

  // Vertical CRMs, Schedulers & Chat Bots
  const detectedCrms: string[] = []
  const bookingWidgets: string[] = []
  const addUnique = (arr: string[], item: string) => {
    if (!arr.includes(item)) arr.push(item)
  }

  if (/servicetitan/i.test(combined)) addUnique(detectedCrms, "ServiceTitan")
  if (/getjobber\.com|clienthub\.getjobber/i.test(combined)) addUnique(detectedCrms, "Jobber")
  if (/housecallpro\.com/i.test(combined)) addUnique(detectedCrms, "Housecall Pro")
  if (/joinboulevard\.com|blvd\.app/i.test(combined)) {
    addUnique(detectedCrms, "Boulevard")
    addUnique(bookingWidgets, "Boulevard Booking")
  }
  if (/zenoti\.com/i.test(combined)) {
    addUnique(detectedCrms, "Zenoti")
    addUnique(bookingWidgets, "Zenoti Booking")
  }
  if (/janeapp\.com|jane\.app/i.test(combined)) {
    addUnique(detectedCrms, "JaneApp")
    addUnique(bookingWidgets, "JaneApp Scheduler")
  }
  if (/mindbodyonline\.com|healcode\.com/i.test(combined)) {
    addUnique(detectedCrms, "Mindbody")
    addUnique(bookingWidgets, "Mindbody Widget")
  }
  if (/vagaro\.com/i.test(combined)) addUnique(bookingWidgets, "Vagaro")
  if (/glossgenius\.com/i.test(combined)) addUnique(bookingWidgets, "GlossGenius")
  if (/clio\.com|goclio/i.test(combined)) addUnique(detectedCrms, "Clio")
  if (/lawmatics\.com/i.test(combined)) addUnique(detectedCrms, "Lawmatics")
  if (/followupboss\.com/i.test(combined)) addUnique(detectedCrms, "Follow Up Boss")
  if (/kvcore\.com|insiderealestate/i.test(combined)) addUnique(detectedCrms, "kvCORE")
  if (/appfolio\.com/i.test(combined)) addUnique(detectedCrms, "AppFolio")
  if (/buildium\.com/i.test(combined)) addUnique(detectedCrms, "Buildium")
  if (/honeybook\.com/i.test(combined)) addUnique(detectedCrms, "HoneyBook")
  if (/tripleseat\.com/i.test(combined)) {
    addUnique(detectedCrms, "TripleSeat")
    addUnique(bookingWidgets, "TripleSeat Event Lead Form")
  }
  if (/hs-scripts\.com|hbspt\.forms/i.test(combined)) addUnique(detectedCrms, "HubSpot")
  if (/leadconnectorhq\.com|msgsndr\.com|gohighlevel/i.test(combined)) addUnique(detectedCrms, "GoHighLevel / LeadConnector")
  if (/calendly\.com/i.test(combined)) addUnique(bookingWidgets, "Calendly")
  if (/acuityscheduling\.com/i.test(combined)) addUnique(bookingWidgets, "Acuity Scheduling")
  if (/zocdoc\.com/i.test(combined)) addUnique(bookingWidgets, "Zocdoc")
  if (/nexhealth\.com/i.test(combined)) addUnique(bookingWidgets, "NexHealth")
  if (/localmed\.com|dentalintel/i.test(combined)) addUnique(bookingWidgets, "DentalIntel / LocalMed")

  let chatProvider: string | null = null
  if (/podium\.com/i.test(combined)) chatProvider = "Podium Webchat"
  else if (/birdeye\.com/i.test(combined)) chatProvider = "Birdeye Webchat"
  else if (/intercom\.io|intercomcdn/i.test(combined)) chatProvider = "Intercom"
  else if (/drift\.com/i.test(combined)) chatProvider = "Drift"
  else if (/tidio\.co/i.test(combined)) chatProvider = "Tidio"
  else if (/livechatinc\.com/i.test(combined)) chatProvider = "LiveChat"
  else if (/zdassets\.com|zendesk/i.test(combined)) chatProvider = "Zendesk Chat"
  else if (/tawk\.to/i.test(combined)) chatProvider = "Tawk.to"
  else if (/smith\.ai/i.test(combined)) chatProvider = "Smith.ai"
  else if (/apexchat\.com/i.test(combined)) chatProvider = "ApexChat"
  else if (/ngageics\.com|ngaged/i.test(combined)) chatProvider = "Ngage Live Chat"
  else if (/widgets\.leadconnectorhq\.com.*chat-widget/i.test(combined)) chatProvider = "GoHighLevel Chat Widget"

  let rivalAgencyCredit: string | null = null
  if (/scorpion\.co|scorpiondesign/i.test(combined)) rivalAgencyCredit = "Scorpion"
  else if (/findlaw\.com/i.test(h)) rivalAgencyCredit = "FindLaw"
  else if (/justia\.com/i.test(h)) rivalAgencyCredit = "Justia"
  else if (/tebra\.com|patientpop\.com/i.test(combined)) rivalAgencyCredit = "PatientPop / Tebra"
  else if (/thryv\.com/i.test(combined)) rivalAgencyCredit = "Thryv"
  else if (/townsquareinteractive/i.test(combined)) rivalAgencyCredit = "Townsquare Interactive"

  const isPeRollup =
    /heartland dental|apex service partners|wrench group|turnpoint services|mb2 dental|us dermatology partners|forefront dermatology|crash champions|caliber collision/i.test(
      h,
    )

  return {
    cmsPlatform,
    isPeRollup,
    tracking: {
      hasGtm,
      hasServerSideGtm,
      hasGa4,
      hasLegacyUa,
      hasGoogleAds,
      hasMetaPixel,
      hasTikTokPixel,
      hasLinkedInInsight,
      hasBingUet,
      callTrackingProvider,
      heatmapTools,
    },
    crm: {
      detectedCrms,
      bookingWidgets,
      hasChatBot: Boolean(chatProvider),
      chatProvider,
      rivalAgencyCredit,
    },
  }
}

async function stitchAuditSheet(
  desktopHeroBuf: Buffer,
  desktopFullBuf: Buffer,
  mobileHeroBuf: Buffer,
  meta: {
    company: string
    domain: string
    cohort: string
    rating: number | null
    reviews: number | null
    cms: string | null
    lcpMs: number | null
    totalBytes?: number | null
  },
  outFile: string,
): Promise<void> {
  // 1680 x 960 3-panel board:
  // Header: 1680 x 56
  // Panel 1 (Desktop Hero 1440x900 -> 616x880): x=16, y=66
  // Panel 2 (Desktop Mid/Footer Scroll -> 604x880): x=648, y=66
  // Panel 3 (Mobile Hero 390x844 -> 400x880): x=1268, y=66
  const fullMeta = await sharp(desktopFullBuf).metadata()
  const fullW = fullMeta.width || 1440
  const fullH = fullMeta.height || 900

  let midSliceBuf: Buffer
  if (fullH > 1100) {
    const extractTop = Math.min(880, Math.max(0, fullH - 1100))
    const extractH = Math.max(100, Math.min(2096, fullH - extractTop))
    midSliceBuf = await sharp(desktopFullBuf)
      .extract({ left: 0, top: extractTop, width: fullW, height: extractH })
      .resize(604, 880, { fit: "contain", background: { r: 15, g: 23, b: 42 } })
      .toBuffer()
  } else {
    midSliceBuf = await sharp(desktopFullBuf)
      .resize(604, 880, { fit: "contain", background: { r: 15, g: 23, b: 42 } })
      .toBuffer()
  }

  const p1 = await sharp(desktopHeroBuf)
    .resize(616, 880, { fit: "contain", background: { r: 15, g: 23, b: 42 } })
    .toBuffer()

  const p3 = await sharp(mobileHeroBuf)
    .resize(400, 880, { fit: "contain", background: { r: 15, g: 23, b: 42 } })
    .toBuffer()

  const ratingStr = meta.rating ? `${meta.rating}★ (${meta.reviews ?? 0} reviews)` : "No GBP rating"
  const weightStr =
    meta.totalBytes && meta.totalBytes > 0 ? `${(meta.totalBytes / (1024 * 1024)).toFixed(1)} MB` : null
  const lcpStr = meta.lcpMs ? `LCP ${(meta.lcpMs / 1000).toFixed(1)}s` : null
  const perfBadge = [weightStr, lcpStr].filter(Boolean).join(" • ") || "Live Render"
  const titleLine = xmlEscape(`${meta.company.slice(0, 42)}  •  ${meta.domain.slice(0, 36)}  •  ${ratingStr}  •  ${meta.cms || "Web"}  •  ${perfBadge}`)

  const headerSvg = Buffer.from(
    `<svg width="1680" height="62" xmlns="http://www.w3.org/2000/svg">
      <rect width="1680" height="62" fill="#0f172a"/>
      <text x="20" y="25" fill="#f8fafc" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${titleLine}</text>
      <text x="20" y="48" fill="#38bdf8" font-family="Arial, sans-serif" font-size="12" font-weight="bold">[1] DESKTOP ABOVE-THE-FOLD (1440x900)</text>
      <text x="652" y="48" fill="#34d399" font-family="Arial, sans-serif" font-size="12" font-weight="bold">[2] DESKTOP SCROLL / PROOF &amp; FOOTER</text>
      <text x="1272" y="48" fill="#f472b6" font-family="Arial, sans-serif" font-size="12" font-weight="bold">[3] MOBILE VIEWPORT (390x844)</text>
    </svg>`,
  )

  await sharp({
    create: {
      width: 1680,
      height: 960,
      channels: 3,
      background: { r: 9, g: 14, b: 28 },
    },
  })
    .composite([
      { input: headerSvg, left: 0, top: 0 },
      { input: p1, left: 16, top: 66 },
      { input: midSliceBuf, left: 648, top: 66 },
      { input: p3, left: 1268, top: 66 },
    ])
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(outFile)
}

async function crawlCommercialSubpages(
  origin: string,
  navLinks: { url: string; text: string }[],
  sitemapXml: string | null,
): Promise<{
  sitemapUrlCount: number
  pages: { url: string; title: string; h1: string | null; kind: string }[]
  extraEmails: Map<string, ProspectEmail>
  extraPhones: Set<string>
  decisionMakers: ProspectDecisionMaker[]
  servicesDetected: string[]
  corpusSnippets: string[]
}> {
  const candidateUrls = new Map<string, string>()

  const classifySubpage = (u: string): string | null => {
    const p = u.toLowerCase()
    if (/\/(blog|news|press|tag|category|author|wp-json|feed|cart|checkout|my-account|login|privacy|terms|cookie)\b/.test(p)) {
      return null
    }
    if (/\/(about|our-story|who-we-are|leadership|team|attorneys|doctors|providers|staff|meet-the|agents|brokers)/.test(p)) {
      return "about_team"
    }
    if (/\/(contact|get-in-touch|locations?|schedule|book|appointment|inquire|tour)/.test(p)) {
      return "contact"
    }
    if (/\/(pricing|packages|financing|specials|offers|promotions|rates|fees|calculator|estimate|quote)/.test(p)) {
      return "pricing_offer"
    }
    if (/\/(services?|treatments?|procedures?|practice-areas?|solutions|capabilities|products|doors|windows|roofing|solar|hvac|wraps|ppf|collision|venues?|weddings?|events?|listings|properties|management)/.test(p)) {
      return "service"
    }
    return "commercial"
  }

  for (const link of navLinks) {
    const kind = classifySubpage(link.url)
    if (kind && candidateUrls.size < 25) {
      candidateUrls.set(link.url.replace(/\/$/, ""), kind)
    }
  }

  let sitemapUrlCount = 0
  if (sitemapXml) {
    const locMatches = sitemapXml.match(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi) || []
    sitemapUrlCount = locMatches.length
    for (const m of locMatches.slice(0, 120)) {
      if (candidateUrls.size >= 25) break
      const u = m.replace(/<\/?loc>/gi, "").trim().replace(/\/$/, "")
      const kind = classifySubpage(u)
      if (kind && kind !== "commercial") {
        candidateUrls.set(u, kind)
      }
    }
  }

  // Prioritize contact, about_team, pricing_offer, and service pages (up to 10 subpages in 1 fast parallel burst)
  const prioritized = Array.from(candidateUrls.entries())
    .sort((a, b) => {
      const rank = (k: string) =>
        k === "contact" ? 1 : k === "about_team" ? 2 : k === "pricing_offer" ? 3 : k === "service" ? 4 : 5
      return rank(a[1]) - rank(b[1])
    })
    .slice(0, 10)

  const extraEmails = new Map<string, ProspectEmail>()
  const extraPhones = new Set<string>()
  const decisionMakers: ProspectDecisionMaker[] = []
  const servicesDetected: string[] = []
  const corpusSnippets: string[] = []
  const pages: { url: string; title: string; h1: string | null; kind: string }[] = []

  await Promise.all(
    prioritized.map(async ([url, kind]) => {
      const html = await fetchTextSafe(url, 2600, 120000)
      if (!html) return
      const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
      const title = titleM ? stripHtmlClean(titleM[1]).slice(0, 140) : ""
      const h1 = h1M ? stripHtmlClean(h1M[1]).slice(0, 140) : null
      pages.push({ url, title, h1, kind })

      if (kind === "service" && (h1 || title)) {
        const svc = (h1 || title.split(/[|\-–]/)[0]).trim()
        if (svc.length >= 3 && svc.length <= 70 && !servicesDetected.includes(svc)) {
          servicesDetected.push(svc)
        }
      }

      const clean = stripHtmlClean(html)
      extractEmailsFromText(html, `subpage:${kind}`, extraEmails)
      extractPhonesFromText(clean, extraPhones)

      if (corpusSnippets.length < 10) {
        corpusSnippets.push(`[${kind.toUpperCase()} — ${url}] ${clean.slice(0, 700)}`)
      }

      if (kind === "about_team" && decisionMakers.length < 5) {
        const roleRe =
          /\b([A-Z][a-z]{2,18}(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]{2,20})(?:,\s*|\s+[-–|]\s+|\s+is\s+(?:the\s+)?)(Founder|Co-Founder|Owner|CEO|President|Managing Partner|Principal|Medical Director|Lead Dentist|DDS|DMD|MD|DO|Attorney|Broker)\b/g
        let rm: RegExpExecArray | null
        while ((rm = roleRe.exec(clean)) !== null && decisionMakers.length < 5) {
          const name = rm[1].trim()
          const role = rm[2].trim()
          if (!/Privacy|Contact|Schedule|Welcome|Service|Company|Our Team/i.test(name)) {
            if (!decisionMakers.some((d) => d.name === name)) {
              decisionMakers.push({ name, role })
            }
          }
        }
      }
    }),
  )

  // Fallback check on /robots.txt or /sitemap_index.xml count
  if (sitemapUrlCount === 0) sitemapUrlCount = pages.length

  return {
    sitemapUrlCount,
    pages,
    extraEmails,
    extraPhones,
    decisionMakers,
    servicesDetected: servicesDetected.slice(0, 20),
    corpusSnippets,
  }
}

async function crawlSingleProspect(
  browser: Browser,
  item: DiscoveredProspect,
  slowSingleTabMode = false,
  homeOnly = false,
  prevRecord?: CrawledProspectRecord,
): Promise<CrawledProspectRecord> {
  const emailMap = new Map<string, ProspectEmail>()
  for (const e of sanitizeProspectEmails([...(item.seedEmails || []), ...(prevRecord?.emails || [])])) {
    emailMap.set(e.address.toLowerCase(), e)
  }
  const phoneSet = new Set<string>([...(item.seedPhones || []), ...(prevRecord?.phones || [])])
  const mergedSocials: ProspectSocialLinks = { ...(item.seedSocialLinks || {}), ...(prevRecord?.socialLinks || {}) }

  // Social-only or missing-website record: skip Playwright render, still build clean record
  if (!item.websiteUrl || item.domain.endsWith(".local") || item.websiteStatus === "social_only_whale" || item.websiteStatus === "missing") {
    return {
      ...item,
      crawledAt: new Date().toISOString(),
      crawlOk: false,
      crawlError: item.websiteStatus === "social_only_whale" ? "social_only_no_website" : "missing_website_url",
      finalUrl: item.websiteUrl,
      cmsPlatform: null,
      isPeRollup: false,
      emails: Array.from(emailMap.values()),
      phones: Array.from(phoneSet),
      decisionMakers: [],
      socialLinks: mergedSocials,
      diagnostics: null,
      localSheetFile: null,
    }
  }

  const vaultFolder = path.join(VAULT_DIR, item.cohort, item.domain.replace(/[^a-z0-9._-]/gi, "_"))
  fs.mkdirSync(vaultFolder, { recursive: true })
  const sheetFilename = `${item.domain.replace(/[^a-z0-9._-]/gi, "_")}.jpg`
  const sheetFullPath = path.join(SHEETS_DIR, sheetFilename)

  const context = await withTimeout(
    browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      deviceScaleFactor: 1,
    }),
    4500,
    null,
  )
  if (!context) {
    throw new Error("BROWSER_WEDGED_NEW_CONTEXT_TIMEOUT")
  }
  // Hard context kill timer guarantees zero leaked/zombie Chromium contexts on hung pages
  const contextBudgetMs = slowSingleTabMode ? 82000 : 24500
  const killTimer = setTimeout(() => {
    context.close().catch(() => {})
  }, contextBudgetMs)

  const networkUrls: string[] = []
  let totalBytes = 0
  let imageBytes = 0
  let largestImageBytes = 0
  let jsBytes = 0
  let requestCount = 0
  const countedRequests = new WeakSet<object>()

  try {
    await context.addInitScript(`(() => {
      window.__cwv = { lcp: null, cls: 0 };
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) window.__cwv.lcp = entries[entries.length - 1].startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput && typeof entry.value === 'number') window.__cwv.cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}
    })()`)

    const page = await context.newPage()

    // Abort heavy video streams so sites never stall on 50MB background hero MP4s
    await page.route("**/*", (route) => {
      const req = route.request()
      const rt = req.resourceType()
      const u = req.url()
      if (rt === "media" || /\.(mp4|webm|mov|avi)(\?|$)/i.test(u)) {
        return route.abort()
      }
      requestCount++
      if (networkUrls.length < 250) networkUrls.push(u)
      return route.continue()
    })

    const recordTransferBytes = (req: import("playwright").Request, bytes: number) => {
      if (bytes <= 0 || countedRequests.has(req)) return
      countedRequests.add(req)
      totalBytes += bytes
      globalWireBytesTransferred += bytes
      const rt = req.resourceType()
      if (rt === "script") jsBytes += bytes
      else if (rt === "image") {
        imageBytes += bytes
        if (bytes > largestImageBytes) largestImageBytes = bytes
      }
    }

    page.on("requestfinished", async (req) => {
      try {
        const sizes = await req.sizes()
        const wireBytes =
          sizes && sizes.responseBodySize > 0
            ? sizes.responseBodySize
            : Number((await req.response())?.headers()["content-length"] || 0)
        recordTransferBytes(req, wireBytes)
      } catch {
        // ignore
      }
    })

    page.on("response", async (res) => {
      try {
        const len = Number(res.headers()["content-length"] || 0)
        if (len > 0) recordTransferBytes(res.request(), len)
      } catch {
        // ignore
      }
    })

    let startUrl = item.websiteUrl
    if (!/^https?:\/\//i.test(startUrl)) startUrl = `https://${startUrl}`

    // In homeOnly mode, reuse cached DNS if available and skip all extra HTTP fetches (robots/llms/sitemap/subpages)
    const originGuess = new URL(startUrl).origin
    const prevDiag = prevRecord?.diagnostics ?? null
    const dnsPromise = prevDiag?.emailDns
      ? Promise.resolve({
          mxProvider: prevDiag.emailDns.mxProvider,
          mxRecords: prevDiag.emailDns.mxRecords,
          hasSpf: prevDiag.emailDns.hasSpf,
          spfRaw: prevDiag.emailDns.spfRaw,
          detectedEspCrmFromSpf: prevDiag.emailDns.detectedEspCrmFromSpf,
          hasDmarc: prevDiag.emailDns.hasDmarc,
          dmarcPolicy: prevDiag.emailDns.dmarcPolicy,
        })
      : inspectEmailDns(item.domain)
    const earlyAuxPromise =
      slowSingleTabMode || homeOnly
        ? null
        : Promise.all([
            fetchTextSafe(`${originGuess}/robots.txt`, 2500, 30000),
            fetchTextSafe(`${originGuess}/llms.txt`, 2500, 20000),
            fetchTextSafe(`${originGuess}/sitemap.xml`, 2800, 220000),
          ])

    const gotoCommitTimeout = slowSingleTabMode ? 22000 : 9500
    const gotoDclTimeout = slowSingleTabMode ? 16000 : 8500

    // Use waitUntil: "commit" so slow 3rd-party blocking scripts never kill otherwise healthy local business sites
    let navResp = await page
      .goto(startUrl, { waitUntil: "commit", timeout: gotoCommitTimeout })
      .catch(async (navErr: any) => {
        const msg = String(navErr?.message || navErr || "")
        if (/ERR_ABORTED/i.test(msg)) {
          // Redirect chains (e.g. apex -> www or http -> https or meta-refresh) can abort waitUntil:"commit"; retry with domcontentloaded
          await new Promise((r) => setTimeout(r, 200))
          if (page.url() && page.url() !== "about:blank" && /^https?:\/\//i.test(page.url())) {
            await Promise.race([
              page.waitForLoadState("domcontentloaded").catch(() => {}),
              new Promise((r) => setTimeout(r, slowSingleTabMode ? 10000 : 5000)),
            ])
            return { ok: () => true } as any
          }
          return page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: gotoDclTimeout })
        }
        if (/ERR_SSL|ERR_CERT|ERR_TLS|ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_HTTP2|ERR_EMPTY_RESPONSE/i.test(msg)) {
          const httpFallback = startUrl.replace(/^https:\/\//i, "http://")
          return page.goto(httpFallback, { waitUntil: "domcontentloaded", timeout: gotoDclTimeout })
        }
        throw navErr
      })

    if (!navResp && (page.url() === "about:blank" || !/^https?:\/\//i.test(page.url()))) {
      throw new Error("Navigation timeout / unreachable")
    }

    // Bounded wait for DOMContentLoaded + full window.onload (20s in reportQualityMode so heavy image galleries finish cleanly)
    await Promise.race([
      page.waitForLoadState("domcontentloaded").catch(() => {}),
      new Promise((r) => setTimeout(r, slowSingleTabMode ? 12000 : 4500)),
    ])
    await Promise.race([
      page.waitForLoadState("load").catch(() => {}),
      new Promise((r) => setTimeout(r, slowSingleTabMode ? 20000 : 1200)),
    ])
    const initialTextLen = Number(
      await page.evaluate(`document.body ? (document.body.innerText || '').trim().length : 0`).catch(() => 0),
    )
    if (initialTextLen < 40) {
      await new Promise((r) => setTimeout(r, slowSingleTabMode ? 2500 : 1100))
    }
    await page.evaluate(DISMISS_POPUPS_SCRIPT).catch(() => {})

    // 1. In reportQualityMode: run human scroll & animation/image settle FIRST so hero preloaders & reveals finish cleanly
    let pendingImagesAfterScroll = 0
    let settledPageHeight = 2400
    let desktopHeroBuf: Buffer

    if (slowSingleTabMode) {
      await page.evaluate(HIDE_PRELOADER_CURTAINS_SCRIPT).catch(() => {})
      const scrollRes = await simulateHumanScrollAndSettle(page, FULL_PAGE_MAX_HEIGHT_PX)
      pendingImagesAfterScroll = scrollRes.pendingImages
      settledPageHeight = scrollRes.pageHeight
      await page.evaluate(HIDE_PRELOADER_CURTAINS_SCRIPT).catch(() => {})
      await page.evaluate(PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT).catch(() => {})
      await page.evaluate(buildWaitVisibleImagesAndFontsScript(950, 4000)).catch(() => {})
      await new Promise((r) => setTimeout(r, 600))
      desktopHeroBuf = await takeJpegScreenshotSafe(context, page, { quality: 84 })

      const heroCheck = await sharp(desktopHeroBuf).stats().catch(() => null)
      const heroSd = heroCheck?.channels?.length
        ? Math.max(...heroCheck.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
        : 20
      if (heroSd < 9) {
        await new Promise((r) => setTimeout(r, 1500))
        await page.evaluate(DISMISS_POPUPS_SCRIPT).catch(() => {})
        await page.evaluate(HIDE_PRELOADER_CURTAINS_SCRIPT).catch(() => {})
        await page.evaluate(PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT).catch(() => {})
        desktopHeroBuf = await takeJpegScreenshotSafe(context, page, { quality: 84 })
      }
    } else {
      await new Promise((r) => setTimeout(r, 180))
      desktopHeroBuf = await takeJpegScreenshotSafe(context, page, { quality: 84 })
      await page.evaluate(`window.scrollTo(0, Math.min(1800, document.body.scrollHeight))`).catch(() => {})
      await new Promise((r) => setTimeout(r, 150))
      await page.evaluate(`window.scrollTo(0, 0)`).catch(() => {})
      await new Promise((r) => setTimeout(r, 80))
    }

    const finalUrl = page.url()
    const rawHtml = await page.content()
    const domData = (await page.evaluate(DESKTOP_EXTRACTOR_SCRIPT)) as any
    const finalOrigin = new URL(finalUrl).origin
    const internalLinks = Array.isArray(domData?.internalLinks) ? domData.internalLinks : []

    const maxClipCap = slowSingleTabMode ? FULL_PAGE_MAX_HEIGHT_PX : 3600
    const rawPageHeight = Math.max(settledPageHeight, Number(domData?.pageHeight) || 2400)
    const clipHeight = Math.max(900, Math.min(maxClipCap, rawPageHeight))

    if (slowSingleTabMode && clipHeight > 1050) {
      await page.evaluate(HIDE_BOTTOM_FIXED_WIDGETS_SCRIPT).catch(() => {})
    }
    const desktopFullBuf = await takeJpegScreenshotSafe(context, page, {
      quality: 80,
      clip: { x: 0, y: 0, width: 1440, height: clipHeight },
    })
    if (slowSingleTabMode && clipHeight > 1050) {
      await page.evaluate(RESTORE_BOTTOM_FIXED_WIDGETS_SCRIPT).catch(() => {})
    }

    // 3. Resize viewport to Mobile (390x844) -> 1,800ms reflow/animation settle -> Clean Mobile Hero Full
    await page.setViewportSize({ width: 390, height: 844 })
    await page.evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`).catch(() => {})
    await new Promise((r) => setTimeout(r, slowSingleTabMode ? 1800 : 150))
    if (slowSingleTabMode) {
      await page.evaluate(DISMISS_POPUPS_SCRIPT).catch(() => {})
      await page.evaluate(HIDE_PRELOADER_CURTAINS_SCRIPT).catch(() => {})
      await page.evaluate(PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT).catch(() => {})
      await page.evaluate(buildWaitVisibleImagesAndFontsScript(950, 4000)).catch(() => {})
      await new Promise((r) => setTimeout(r, 300))
    }
    const mobileData = (await page.evaluate(MOBILE_EXTRACTOR_SCRIPT).catch(() => ({
      mobileHorizontalOverflow: false,
      tinyMobileTextCount: 0,
    }))) as { mobileHorizontalOverflow: boolean; tinyMobileTextCount: number }
    let mobileHeroBuf = await takeJpegScreenshotSafe(context, page, { quality: 86 })
    if (slowSingleTabMode) {
      const mobCheck = await sharp(mobileHeroBuf).stats().catch(() => null)
      const mobSd = mobCheck?.channels?.length
        ? Math.max(...mobCheck.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
        : 20
      if (mobSd < 9) {
        await new Promise((r) => setTimeout(r, 1500))
        await page.evaluate(DISMISS_POPUPS_SCRIPT).catch(() => {})
        await page.evaluate(HIDE_PRELOADER_CURTAINS_SCRIPT).catch(() => {})
        await page.evaluate(PROMOTE_LAZY_AND_FINISH_REVEALS_SCRIPT).catch(() => {})
        mobileHeroBuf = await takeJpegScreenshotSafe(context, page, { quality: 86 })
      }
    }

    // Give any trailing requestfinished sizes() events 80ms to settle before stamping byte weight on the sheet
    await new Promise((r) => setTimeout(r, 80))

    // In homeOnly mode, skip downloading sitemap/robots/llms & subpages completely (preserving any previously crawled metadata)
    const auxTextPromise: Promise<[string | null, string | null, string | null]> = homeOnly
      ? Promise.resolve([
          null,
          prevDiag?.aeoGeo?.hasLlmsTxt ? "cached_llms_txt_present_valid_summary" : null,
          prevDiag?.seo?.hasSitemapXml ? "<urlset/>" : null,
        ])
      : (earlyAuxPromise ??
        Promise.all([
          fetchTextSafe(`${finalOrigin}/robots.txt`, 3500, 30000),
          fetchTextSafe(`${finalOrigin}/llms.txt`, 3500, 20000),
          fetchTextSafe(`${finalOrigin}/sitemap.xml`, 4000, 220000),
        ]))
    const subpagePromise = homeOnly
      ? Promise.resolve({
          sitemapUrlCount: prevDiag?.seo?.sitemapUrlCount ?? internalLinks.length,
          pages: Array.from({ length: prevDiag?.seo?.internalServicePageCount ?? 0 }, (_, idx) => ({
            url: `${finalOrigin}/service-${idx}`,
            title: "Service",
            h1: null,
            kind: "service",
          })),
          extraEmails: new Map<string, ProspectEmail>(),
          extraPhones: new Set<string>(),
          decisionMakers: prevRecord?.decisionMakers || [],
          servicesDetected: prevDiag?.servicesDetected || [],
          corpusSnippets: [],
        })
      : auxTextPromise.then(([, , sitemapXml]) =>
          crawlCommercialSubpages(finalOrigin, internalLinks, sitemapXml),
        )

    // 4. Save Clean Free-Report Assets (desktop-full.webp, mobile-hero.webp, desktop-hero.webp) + 3-Panel Stitch
    const stackInfo = detectCmsAndStack(rawHtml, networkUrls)
    const gzHtml = new Uint8Array(zlib.gzipSync(rawHtml))
    const [dnsInfo, [robotsTxt, llmsTxt, sitemapXml], subpageInfo, heroPixelStats, mobPixelStats] = await Promise.all([
      dnsPromise,
      auxTextPromise,
      subpagePromise,
      sharp(desktopHeroBuf).stats().catch(() => null),
      sharp(mobileHeroBuf).stats().catch(() => null),
      sharp(desktopHeroBuf).webp({ quality: 82 }).toFile(path.join(vaultFolder, "desktop-hero.webp")),
      sharp(desktopFullBuf).webp({ quality: 80 }).toFile(path.join(vaultFolder, "desktop-full.webp")),
      sharp(mobileHeroBuf).webp({ quality: 86 }).toFile(path.join(vaultFolder, "mobile-hero.webp")),
      fs.promises.writeFile(path.join(vaultFolder, "home.html.gz"), gzHtml),
      stitchAuditSheet(
        desktopHeroBuf,
        desktopFullBuf,
        mobileHeroBuf,
        {
          company: item.company,
          domain: item.domain,
          cohort: item.cohort,
          rating: item.googleRating,
          reviews: item.googleReviewsCount,
          cms: stackInfo.cmsPlatform,
          lcpMs: domData?.perfNav?.lcpMs ?? null,
          totalBytes: totalBytes > 0 ? totalBytes : null,
        },
        sheetFullPath,
      ),
    ])
    // Also copy audit-sheet.jpg into the company vault folder
    await fs.promises.copyFile(sheetFullPath, path.join(vaultFolder, "audit-sheet.jpg")).catch(() => {})

    // Merge contacts
    for (const m of domData?.mailtos || []) extractEmailsFromText(m, "homepage_mailto", emailMap)
    extractEmailsFromText(rawHtml, "homepage_html", emailMap)
    Array.from(subpageInfo.extraEmails.entries()).forEach(([k, v]) => {
      if (!emailMap.has(k)) emailMap.set(k, v)
    })

    for (const t of domData?.tels || []) extractPhonesFromText(t, phoneSet)
    extractPhonesFromText(domData?.bodyTextSample || "", phoneSet)
    Array.from(subpageInfo.extraPhones).forEach((p) => {
      if (phoneSet.size < 8) phoneSet.add(p)
    })

    const domSocials = sanitizeProspectSocialLinks(domData?.socials || {})
    for (const key of ["instagram", "facebook", "linkedin", "tiktok", "youtube", "x", "yelp"] as const) {
      if (!mergedSocials[key] && domSocials[key]) {
        mergedSocials[key] = domSocials[key]
      }
    }

    const decisionMakers: ProspectDecisionMaker[] = [...(domData?.schemaPeople || [])]
    for (const dm of subpageInfo.decisionMakers) {
      if (!decisionMakers.some((d) => d.name.toLowerCase() === dm.name.toLowerCase())) {
        decisionMakers.push(dm)
      }
    }

    // Save Vault JSON research corpora (copy-corpus.json, design-tokens.json, services-catalog.json)
    const bodyTextLower = (domData?.bodyTextSample || "").toLowerCase()
    const hasClearGuaranteeOrOffer =
      /free estimate|free consultation|free quote|0%\s*apr|financing|warranty|guarantee|\$\d+\s*off|new patient|complimentary|no fee unless/i.test(
        bodyTextLower,
      )
    const hasInstantQuoteOrCalculator =
      /instant quote|cost calculator|price estimator|payment calculator|instant valuation|check availability/i.test(
        bodyTextLower,
      )

    const copyCorpus = {
      company: item.company,
      domain: item.domain,
      cohort: item.cohort,
      title: domData?.title ?? null,
      metaDescription: domData?.metaDescription ?? null,
      h1s: domData?.h1s ?? [],
      h2s: domData?.h2s ?? [],
      h3s: domData?.h3s ?? [],
      heroSubheadline: domData?.heroSubheadline ?? null,
      ctas: domData?.uniqueCtas ?? [],
      hasClearGuaranteeOrOffer,
      homepageText: domData?.bodyTextSample ?? "",
      subpageSnippets: subpageInfo.corpusSnippets,
    }
    const designTokens = {
      cmsPlatform: stackInfo.cmsPlatform,
      fontFamilies: domData?.fontFamilies ?? [],
      primaryColors: domData?.primaryColors ?? [],
      hasVectorOrCrispLogo: Boolean(domData?.hasVectorOrCrispLogo),
    }
    const servicesCatalog = {
      sitemapUrlCount: subpageInfo.sitemapUrlCount,
      crawledCommercialPages: subpageInfo.pages,
      servicesDetected: subpageInfo.servicesDetected,
    }

    await Promise.all([
      fs.promises.writeFile(path.join(vaultFolder, "copy-corpus.json"), JSON.stringify(copyCorpus, null, 2)),
      fs.promises.writeFile(path.join(vaultFolder, "design-tokens.json"), JSON.stringify(designTokens, null, 2)),
      fs.promises.writeFile(path.join(vaultFolder, "services-catalog.json"), JSON.stringify(servicesCatalog, null, 2)),
    ])

    // Assemble 8-Pillar Diagnostics
    const h1Texts: string[] = domData?.h1s || []
    const titleStr: string | null = domData?.title || null
    const metaDescStr: string | null = domData?.metaDescription || null
    const cityLower = (item.city || "").toLowerCase()
    const hasLocalCityInTitleOrH1 = Boolean(
      cityLower &&
        ((titleStr && titleStr.toLowerCase().includes(cityLower)) ||
          h1Texts.some((h) => h.toLowerCase().includes(cityLower))),
    )

    const seoFlaws: string[] = []
    if (!titleStr || titleStr.length < 15) seoFlaws.push("Weak or missing <title> tag")
    if (!metaDescStr || metaDescStr.length < 50) seoFlaws.push("Missing or thin meta description")
    if (h1Texts.length === 0) seoFlaws.push("Missing H1 headline on homepage")
    else if (h1Texts.length > 2) seoFlaws.push(`Multiple competing H1 tags (${h1Texts.length}) diluting page hierarchy`)
    if (!hasLocalCityInTitleOrH1 && item.city && item.cohort !== "funded_startups") {
      seoFlaws.push(`Homepage title/H1 misses local '${item.city}' geo-intent keyword`)
    }
    if (!sitemapXml) seoFlaws.push("Missing /sitemap.xml for search indexing")
    if ((domData?.missingAltRatio || 0) > 0.4 && (domData?.imgCount || 0) >= 5) {
      seoFlaws.push(`${Math.round((domData.missingAltRatio || 0) * 100)}% of images lack alt text`)
    }
    if (finalUrl.startsWith("http://")) seoFlaws.push("Site served over insecure HTTP without forced SSL")

    // AEO & GEO
    const hasLlmsTxt = Boolean(llmsTxt && llmsTxt.length > 20 && !/<html/i.test(llmsTxt))
    const robotsBlocksAi: string[] = homeOnly && prevDiag?.aeoGeo?.robotsBlocksAi ? [...prevDiag.aeoGeo.robotsBlocksAi] : []
    if (robotsTxt) {
      for (const bot of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
        const re = new RegExp(`User-agent:\\s*${bot}[\\s\\S]{0,120}?Disallow:\\s*\\/\\s*$`, "im")
        if (re.test(robotsTxt)) robotsBlocksAi.push(bot)
      }
    }
    const jsonLdTypes: string[] = domData?.jsonLdTypes || []
    const jsonLdJoined = jsonLdTypes.join(" ").toLowerCase()
    const hasLocalBusinessSchema =
      /localbusiness|medicalbusiness|dentist|physician|legalservice|attorney|autorepair|homeandconstruction|roofer|hvacbusiness|plumber|eventvenue|realestateagent|organization/.test(
        jsonLdJoined,
      )
    const hasFaqSchema = /faqpage/.test(jsonLdJoined)
    const hasServiceSchema = /\bservice\b|offer|product/.test(jsonLdJoined)
    const hasAggregateRatingSchema = /aggregaterating/.test(jsonLdJoined)
    const questionHeadingsCount = [...(domData?.h2s || []), ...(domData?.h3s || [])].filter((h: string) =>
      /\?$|^(how|what|why|when|how much|do you|can i|is it)\b/i.test(h),
    ).length

    const aeoFlaws: string[] = []
    if (!hasLocalBusinessSchema) aeoFlaws.push("No LocalBusiness/Industry JSON-LD schema for Google & AI entity graphs")
    if (!hasFaqSchema && questionHeadingsCount === 0) {
      aeoFlaws.push("No FAQPage schema or Q&A headings for ChatGPT / Perplexity / Google AI Overviews")
    }
    if (!hasLlmsTxt) aeoFlaws.push("No /llms.txt machine-readable summary for LLM answer engines")
    if (robotsBlocksAi.length > 0) aeoFlaws.push(`robots.txt blocks AI search crawlers (${robotsBlocksAi.join(", ")})`)

    // Email DNS flaws
    const allEmails = Array.from(emailMap.values())
    const usesFreeWebmailOnSite = allEmails.some((e) => /@(gmail|yahoo|hotmail|aol|icloud|outlook)\.com$/i.test(e.address))
    const emailFlaws: string[] = []
    if (!dnsInfo.hasSpf) emailFlaws.push("Missing SPF record on domain (high email spoofing/deliverability risk)")
    if (!dnsInfo.hasDmarc) emailFlaws.push("Missing _dmarc DNS record (outbound quotes/emails risk landing in spam)")
    else if (dnsInfo.dmarcPolicy === "none") emailFlaws.push("DMARC policy is p=none (monitoring only, unhardened)")
    if (usesFreeWebmailOnSite) emailFlaws.push("Uses free personal webmail (@gmail/@yahoo) instead of branded domain inbox")

    // Tracking flaws
    const tr = stackInfo.tracking
    const trackingFlaws: string[] = []
    if (!tr.hasGa4 && !tr.hasGtm) trackingFlaws.push("No GA4 or Google Tag Manager analytics detected")
    if (!tr.hasMetaPixel && !tr.hasGoogleAds) {
      trackingFlaws.push("Zero paid media conversion pixels (neither Google Ads nor Meta Pixel firing)")
    } else if ((tr.hasMetaPixel || tr.hasGoogleAds) && !tr.hasServerSideGtm) {
      trackingFlaws.push("Client-side ad pixels without Server-Side GTM / 1st-party CAPI (20-35% iOS attribution loss)")
    }
    if (!tr.callTrackingProvider && item.cohort !== "funded_startups") {
      trackingFlaws.push("No dynamic call tracking (CallRail/WhatConverts) attributing phone leads to ad spend")
    }
    if (tr.hasLegacyUa && !tr.hasGa4) trackingFlaws.push("Dead legacy Universal Analytics (UA-) tag left on site")

    // CRM / Intake flaws
    const formCount = Number(domData?.formCount) || 0
    const maxFormFields = Number(domData?.maxFormFields) || 0
    const usesMailtoOnly = formCount === 0 && stackInfo.crm.bookingWidgets.length === 0
    const crmFlaws: string[] = []
    if (usesMailtoOnly) crmFlaws.push("No interactive lead form or online booking widget on homepage")
    if (maxFormFields >= 8) crmFlaws.push(`High-friction form (${maxFormFields} fields) suppresses mobile conversion`)
    if (!stackInfo.crm.hasChatBot) crmFlaws.push("No 24/7 web chat / instant response widget visible")
    if (stackInfo.crm.bookingWidgets.length === 0 && !hasInstantQuoteOrCalculator) {
      crmFlaws.push("No self-serve calendar scheduler or instant quote/pricing estimator")
    }

    // UI flaws (including blank hero pixel variance & unreplaced template placeholders)
    const uiFlawsList: string[] = []
    if (heroPixelStats && Array.isArray(heroPixelStats.channels) && heroPixelStats.channels.length >= 3) {
      const maxChannelStdev = Math.max(...heroPixelStats.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
      if (maxChannelStdev < 7.5) {
        uiFlawsList.push("Above-the-fold desktop hero renders nearly blank (unloaded media or missing video poster fallback)")
      }
    }
    const visibleSample = `${domData?.bodyTextSample || ""} ${(domData?.uniqueCtas || []).join(" ")}`
    if (/\(123\)\s*456[-.\s]*7890|\b123[-.\s]456[-.\s]7890\b|\(555\)\s*555[-.\s]*5555|\b555[-.\s]555[-.\s]5555\b/.test(visibleSample)) {
      uiFlawsList.push("Unreplaced template placeholder phone number (e.g. 123-456-7890) visible on page")
    }
    if (/\blorem ipsum\b/i.test(visibleSample)) {
      uiFlawsList.push("Unreplaced 'Lorem ipsum' template placeholder copy visible on page")
    }
    if (/\b0\+\s*(years|homes|clients|patients|projects|cases|reviews)\b|\$0[BMK]?\+\s*(sales|sold|recovered|won)/i.test(visibleSample)) {
      uiFlawsList.push("Animated authority counter frozen at '0+' on initial render")
    }
    if (mobileData.mobileHorizontalOverflow) uiFlawsList.push("Horizontal overflow bug on 390px mobile viewport")
    if ((domData?.stickyHeaderOverlapPx || 0) > 12) {
      uiFlawsList.push(`Sticky header overlaps hero H1 by ${domData.stickyHeaderOverlapPx}px`)
    }
    if ((domData?.brokenImagesCount || 0) > 0) uiFlawsList.push(`${domData.brokenImagesCount} broken image(s) on homepage`)
    if (mobileData.tinyMobileTextCount > 2) uiFlawsList.push("Unreadable <12.5px body text on mobile")
    if ((domData?.fontFamilies?.length || 0) > 4) uiFlawsList.push(`Typography bloat (${domData.fontFamilies.length} font families loaded)`)
    if ((domData?.mixedContentCount || 0) > 0) uiFlawsList.push("Mixed HTTP assets loaded on HTTPS page")

    // Branding flaws
    const heroHeadline = h1Texts[0] || domData?.h2s?.[0] || null
    const genericHeadline =
      !heroHeadline ||
      /^(welcome to|home|about us|contact us|quality service|trusted|your local|#1)/i.test(heroHeadline.trim())
    const brandingFlaws: string[] = []
    if (!domData?.hasVectorOrCrispLogo) brandingFlaws.push("Raster/low-DPI header logo instead of crisp SVG vector")
    if (!hasClearGuaranteeOrOffer) brandingFlaws.push("No clear front-end offer, financing cue, or risk-reversal guarantee")
    if ((domData?.uniqueCtas?.length || 0) === 0) brandingFlaws.push("Weak above-the-fold CTA hierarchy")

    // Social & Reputation disconnect
    const showcasesReviewsOnHome =
      /google reviews|5\.0|4\.[789]\s*stars?|rated\s*4\.|testimonials|what our (clients|patients|customers) say/i.test(
        bodyTextLower,
      )
    const reputationDisconnect = Boolean(
      (item.googleReviewsCount || 0) >= 80 && (item.googleRating || 0) >= 4.2 && !showcasesReviewsOnHome,
    )
    const reviewVoice = analyzeReviewsVoice(item.googleReviewsSample || [])
    const socialFlaws: string[] = []
    if (reputationDisconnect) {
      socialFlaws.push(
        `Earned ${item.googleReviewsCount} Google reviews (${item.googleRating}★) but fails to showcase that proof prominently on homepage`,
      )
    }
    if (item.websiteStatus === "unlinked_on_gbp") {
      socialFlaws.push("Official website is NOT linked on their Google Business Profile (leaking high-intent Maps traffic)")
    }
    if (!mergedSocials.instagram && !mergedSocials.facebook && item.cohort !== "funded_startups") {
      socialFlaws.push("No Instagram or Facebook profile linked from website")
    }
    if ((domData?.brokenSocialIconCount || 0) > 0) {
      socialFlaws.push(`${domData.brokenSocialIconCount} dead/unlinked '#' social icon(s) in header/footer`)
    }
    for (const cTheme of reviewVoice.complaintThemes) {
      socialFlaws.push(`Customer review complaint pattern: ${cTheme}`)
    }

    const heroMaxStdev =
      heroPixelStats && Array.isArray(heroPixelStats.channels) && heroPixelStats.channels.length >= 3
        ? Math.max(...heroPixelStats.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
        : 20
    const mobMaxStdev =
      mobPixelStats && Array.isArray(mobPixelStats.channels) && mobPixelStats.channels.length >= 3
        ? Math.max(...mobPixelStats.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
        : 20

    const perf: ProspectPerfMetrics = {
      ttfbMs: domData?.perfNav?.ttfbMs ?? null,
      fcpMs: domData?.perfNav?.fcpMs ?? null,
      lcpMs: domData?.perfNav?.lcpMs ?? null,
      cls: domData?.perfNav?.cls ?? null,
      domContentLoadedMs: domData?.perfNav?.domContentLoadedMs ?? null,
      loadMs: domData?.perfNav?.loadMs ?? null,
      totalBytes: totalBytes > 0 ? totalBytes : null,
      imageBytes: imageBytes > 0 ? imageBytes : null,
      largestImageBytes: largestImageBytes > 0 ? largestImageBytes : null,
      jsBytes: jsBytes > 0 ? jsBytes : null,
      requestCount,
      verifiedSingleTab: slowSingleTabMode,
      fullPageVisualsVerified:
        slowSingleTabMode && pendingImagesAfterScroll === 0 && heroMaxStdev >= 9 && mobMaxStdev >= 9,
      capturedFullHeightPx: clipHeight,
    }

    const diagnostics: ProspectDiagnostics = {
      perf,
      commercialPagesCount: homeOnly
        ? Math.max(prevDiag?.commercialPagesCount ?? 0, internalLinks.length > 0 ? Math.min(12, internalLinks.length) : 0)
        : subpageInfo.pages.length,
      servicesDetected: subpageInfo.servicesDetected,
      seo: {
        title: titleStr,
        titleLength: titleStr ? titleStr.length : 0,
        metaDescription: metaDescStr,
        metaDescLength: metaDescStr ? metaDescStr.length : 0,
        h1Count: h1Texts.length,
        h1Texts,
        hasCanonical: Boolean(domData?.hasCanonical),
        hasSitemapXml: Boolean(sitemapXml),
        sitemapUrlCount: subpageInfo.sitemapUrlCount,
        imgCount: Number(domData?.imgCount) || 0,
        missingAltRatio: Number(domData?.missingAltRatio) || 0,
        internalServicePageCount: subpageInfo.pages.filter((p) => p.kind === "service").length,
        hasLocalCityInTitleOrH1,
        flaws: seoFlaws,
      },
      aeoGeo: {
        hasLlmsTxt,
        robotsBlocksAi,
        jsonLdTypes,
        hasLocalBusinessSchema,
        hasFaqSchema,
        hasServiceSchema,
        hasAggregateRatingSchema,
        hasSameAsLinks: Boolean(domData?.hasSameAsLinks),
        questionHeadingsCount,
        flaws: aeoFlaws,
      },
      emailDns: {
        ...dnsInfo,
        usesFreeWebmailOnSite,
        flaws: emailFlaws,
      },
      tracking: {
        ...stackInfo.tracking,
        flaws: trackingFlaws,
      },
      crmIntake: {
        ...stackInfo.crm,
        formCount,
        maxFormFields,
        usesMailtoOnly,
        hasInstantQuoteOrCalculator,
        flaws: crmFlaws,
      },
      uiFlaws: {
        mobileHorizontalOverflow: mobileData.mobileHorizontalOverflow,
        stickyHeaderOverlapPx: Number(domData?.stickyHeaderOverlapPx) || 0,
        brokenImagesCount: Number(domData?.brokenImagesCount) || 0,
        tinyMobileTextCount: mobileData.tinyMobileTextCount,
        fontFamilyCount: domData?.fontFamilies?.length || 0,
        fontFamilies: domData?.fontFamilies || [],
        mixedContentCount: Number(domData?.mixedContentCount) || 0,
        flaws: uiFlawsList,
      },
      branding: {
        hasVectorOrCrispLogo: Boolean(domData?.hasVectorOrCrispLogo),
        primaryColors: domData?.primaryColors || [],
        genericHeadline,
        heroHeadline,
        heroSubheadline: domData?.heroSubheadline ?? null,
        primaryCtaText: sanitizePrimaryCtaText((domData?.uniqueCtas || []).find((c: string) => sanitizePrimaryCtaText(c)) ?? null),
        phoneConsistentAcrossSite: phoneSet.size <= 3,
        hasClearGuaranteeOrOffer,
        flaws: brandingFlaws,
      },
      socialReputation: {
        socialLinks: mergedSocials,
        brokenSocialIconCount: Number(domData?.brokenSocialIconCount) || 0,
        showcasesReviewsOnHome,
        reputationDisconnect,
        reviewComplaintThemes: reviewVoice.complaintThemes,
        reviewPraiseThemes: reviewVoice.praiseThemes,
        flaws: socialFlaws,
      },
    }

    return {
      ...item,
      crawledAt: new Date().toISOString(),
      crawlOk: true,
      crawlError: null,
      finalUrl,
      cmsPlatform: stackInfo.cmsPlatform,
      isPeRollup: stackInfo.isPeRollup,
      emails: allEmails.slice(0, 15),
      phones: Array.from(phoneSet).slice(0, 8),
      decisionMakers: decisionMakers.slice(0, 8),
      socialLinks: mergedSocials,
      diagnostics,
      localSheetFile: sheetFilename,
    }
  } catch (err: any) {
    const unreachableStatus: WebsiteStatus =
      item.websiteStatus === "unlinked_on_gbp" ? "unlinked_on_gbp" : "unreachable"
    return {
      ...item,
      websiteStatus: unreachableStatus,
      crawledAt: new Date().toISOString(),
      crawlOk: false,
      crawlError: sanitizeCrawlError(err),
      finalUrl: null,
      cmsPlatform: null,
      isPeRollup: false,
      emails: Array.from(emailMap.values()),
      phones: Array.from(phoneSet),
      decisionMakers: [],
      socialLinks: mergedSocials,
      diagnostics: null,
      localSheetFile: null,
    }
  } finally {
    clearTimeout(killTimer)
    await context.close().catch(() => {})
  }
}

interface BrowserSlot {
  id: number
  browser: Browser | null
  uses: number
  wedged: boolean
  relaunching: Promise<Browser> | null
}

async function launchChromium(): Promise<Browser> {
  return chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-gpu"],
  })
}

const ANIMATION_OR_LAZY_HTML_TRAP_RE =
  /data-src=|data-lazy-src=|data-original=|loading=["']lazy["']|elementor-invisible|data-aos=|animation\.js|gsap|ScrollTrigger|framer-motion|locomotive-scroll|lenis|wow\.min\.js|opacity\s*:\s*0\b/i

async function verifyExistingCleanHomepage(
  rec: CrawledProspectRecord,
  allow4200Clip = false,
): Promise<boolean> {
  if (!rec.crawlOk || !rec.diagnostics) return false
  const safeDom = rec.domain.replace(/[^a-z0-9._-]/gi, "_")
  const vf = path.join(VAULT_DIR, rec.cohort, safeDom)
  const fFull = path.join(vf, "desktop-full.webp")
  const fHero = path.join(vf, "desktop-hero.webp")
  const fMob = path.join(vf, "mobile-hero.webp")
  const fHtml = path.join(vf, "home.html.gz")
  const fSheet = path.join(SHEETS_DIR, `${safeDom}.jpg`)

  try {
    const [stFull, stHero, stMob, stSheet] = await Promise.all([
      fs.promises.stat(fFull),
      fs.promises.stat(fHero),
      fs.promises.stat(fMob),
      fs.promises.stat(fSheet),
    ])
    if (stFull.size < 16000 || stHero.size < 10000 || stMob.size < 7500 || stSheet.size < 14000) {
      return false
    }
  } catch {
    return false
  }

  // Reject blank-hero warnings before fast-pathing verified runs
  if ((rec.diagnostics.uiFlaws?.flaws || []).some((f) => /nearly blank/i.test(f))) {
    return false
  }

  // Fast-path: already captured & verified by the upgraded full-page human-scroll crawler
  if (rec.diagnostics.perf.fullPageVisualsVerified) {
    return true
  }

  // Gate 2: Legacy crawl must have completed window.onload with 0 broken images and no blank-hero warning
  const perf = rec.diagnostics.perf
  const ui = rec.diagnostics.uiFlaws
  if (!perf.loadMs || perf.loadMs <= 0) return false
  if ((ui?.brokenImagesCount || 0) > 0) return false
  if ((ui?.flaws || []).some((f) => /nearly blank|broken image/i.test(f))) return false

  // Gate 5 (fast HTML check before Sharp decode): Reject legacy 150ms-scroll pages that use lazy-load or scroll/fade animations
  try {
    const gzBuf = await fs.promises.readFile(fHtml)
    const htmlStr = zlib.gunzipSync(new Uint8Array(gzBuf)).toString("utf8")
    if (ANIMATION_OR_LAZY_HTML_TRAP_RE.test(htmlStr)) {
      return false
    }
  } catch {
    return false
  }

  // Gates 3 & 4: Check full-page unclipped height (<4185px) and multi-band pixel/entropy integrity on desktop-full & mobile-hero
  try {
    const fullImg = sharp(fFull)
    const meta = await fullImg.metadata()
    const w = meta.width || 0
    const h = meta.height || 0
    if (w < 1200 || h < 700) return false
    if (!allow4200Clip && (h >= 4185 || h === 3600)) {
      return false
    }

    const bandH = Math.min(340, Math.floor(h / 4))
    if (bandH < 140) return false

    const bandPromises = [0, 1, 2, 3].map((b) => {
      const top = Math.min(h - bandH, Math.floor((h * b) / 4))
      return sharp(fFull).extract({ left: 0, top, width: w, height: bandH }).stats()
    })
    const [b0, b1, b2, b3, mobStats] = await Promise.all([...bandPromises, sharp(fMob).stats()])

    for (const bs of [b0, b1, b2, b3]) {
      const maxSd = Math.max(...bs.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
      if (maxSd < 12 || bs.entropy < 1.2) return false
    }
    const mobSd = Math.max(...mobStats.channels.slice(0, 3).map((c) => Number(c.stdev) || 0))
    if (mobSd < 18 || mobStats.entropy < 1.8) return false

    return true
  } catch {
    return false
  }
}

async function main() {
  ensureAuditDirs()
  if (!fs.existsSync(DISCOVERED_FILE)) {
    throw new Error(`Missing ${DISCOVERED_FILE}. Run pnpm prospects:discover first.`)
  }

  const hasExplicitConcurrencyArg = process.argv.some((a) => a.startsWith("--concurrency="))
  const concurrencyArgVal = Math.max(1, Math.min(28, Number(parseArg("concurrency", "16")) || 16))
  const maxAdaptiveCap = Math.max(1, Math.min(10, Number(parseArg("max-concurrency", "8")) || 8))
  const allow4200Clip = process.argv.includes("--allow-4200-clip")

  const cohortFilter = parseArg("cohort", "all")
  const domainsArg = parseArg("domains", "")
  const targetDomainsSet = domainsArg
    ? new Set(
        domainsArg
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
      )
    : null
  const limit = Number(parseArg("limit", "0")) || 0
  const reset = process.argv.includes("--reset")
  const retryFailed = process.argv.includes("--retry-failed")
  const recrawlIncomplete = process.argv.includes("--recrawl-incomplete")
  const retryWaf = process.argv.includes("--retry-waf")
  const skipUncrawled = process.argv.includes("--skip-uncrawled")
  const homeOnly = process.argv.includes("--home-only") || recrawlIncomplete || Boolean(targetDomainsSet)
  const adaptiveMode =
    !process.argv.includes("--fixed-concurrency") &&
    (process.argv.includes("--adaptive") || (recrawlIncomplete && !hasExplicitConcurrencyArg))
  const reportQualityMode =
    homeOnly || recrawlIncomplete || adaptiveMode || concurrencyArgVal <= 4 || process.argv.includes("--slow-net")

  const retrySource = parseArg("retry-source", "all")
  const retrySince = parseArg("retry-since", "")
  const retryNxdomain = process.argv.includes("--retry-nxdomain")
  const retrySourceSet =
    retrySource === "all"
      ? null
      : new Set(
          retrySource
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        )

  const toSafeJsonLine = (obj: unknown): string => JSON.stringify(obj).replace(/[\u2028\u2029]/g, " ")

  const discoveredLines = fs.readFileSync(DISCOVERED_FILE, "utf8").split(/\r?\n/).filter(Boolean)
  const allDiscoveredSet = new Set<string>()
  const discovered: DiscoveredProspect[] = []
  for (const line of discoveredLines) {
    try {
      const obj = JSON.parse(line) as DiscoveredProspect
      if (obj && obj.domain) {
        allDiscoveredSet.add(obj.domain)
        if (cohortFilter === "all" || obj.cohort === cohortFilter) {
          discovered.push(obj)
        }
      }
    } catch {
      // skip
    }
  }

  const sanitizeStoredCrawledRecord = (obj: CrawledProspectRecord): CrawledProspectRecord => {
    obj.seedEmails = sanitizeProspectEmails(obj.seedEmails || [])
    obj.emails = sanitizeProspectEmails(obj.emails || []).slice(0, 15)
    if (
      obj.crawlError &&
      obj.crawlError !== "missing_website_url" &&
      obj.crawlError !== "social_only_no_website"
    ) {
      obj.crawlError = sanitizeCrawlError(obj.crawlError)
    }
    if (obj.diagnostics?.emailDns) {
      const stillFreeWebmail = obj.emails.some((e) =>
        /@(gmail|yahoo|hotmail|aol|icloud|outlook)\.com$/i.test(e.address),
      )
      obj.diagnostics.emailDns.usesFreeWebmailOnSite = stillFreeWebmail
      if (!stillFreeWebmail && Array.isArray(obj.diagnostics.emailDns.flaws)) {
        obj.diagnostics.emailDns.flaws = obj.diagnostics.emailDns.flaws.filter(
          (f) => !/free personal webmail/i.test(f),
        )
      }
    }
    return obj
  }

  if (retryFailed && !reset && fs.existsSync(CRAWLED_FILE)) {
    const rawLines = fs.readFileSync(CRAWLED_FILE, "utf8").split(/\r?\n/).filter(Boolean)
    const keptLines: string[] = []
    const seenKept = new Set<string>()
    let droppedFailed = 0
    for (const l of rawLines) {
      try {
        const obj = sanitizeStoredCrawledRecord(JSON.parse(l) as CrawledProspectRecord)
        const permanentNoSite =
          obj.crawlError === "missing_website_url" ||
          obj.crawlError === "social_only_no_website" ||
          (!retryNxdomain && obj.crawlError === "DNS domain did not resolve")
        const outsideSourceScope = retrySourceSet !== null && !retrySourceSet.has(obj.source)
        const outsideTimeScope = Boolean(retrySince && (!obj.crawledAt || obj.crawledAt < retrySince))
        const outsideRetryScope = outsideSourceScope || outsideTimeScope
        if (
          obj &&
          obj.domain &&
          allDiscoveredSet.has(obj.domain) &&
          (obj.crawlOk || permanentNoSite || outsideRetryScope) &&
          !seenKept.has(obj.domain)
        ) {
          seenKept.add(obj.domain)
          keptLines.push(toSafeJsonLine(obj))
        } else {
          droppedFailed++
        }
      } catch {
        droppedFailed++
      }
    }
    fs.writeFileSync(CRAWLED_FILE, keptLines.length > 0 ? keptLines.join("\n") + "\n" : "", "utf8")
    console.log(
      `[Crawler] --retry-failed (source=${retrySource}, since=${retrySince || "any"}): Retained ${keptLines.length} records, requeued/pruned ${droppedFailed} transient failed or excluded records.`,
    )
  }

  const existingByDomain = new Map<string, CrawledProspectRecord>()
  if (!reset && fs.existsSync(CRAWLED_FILE)) {
    const lines = fs.readFileSync(CRAWLED_FILE, "utf8").split(/\r?\n/).filter(Boolean)
    for (const l of lines) {
      try {
        const obj = sanitizeStoredCrawledRecord(JSON.parse(l) as CrawledProspectRecord)
        if (obj && obj.domain) {
          // Last-write-wins so appended single-tab re-crawls cleanly override earlier concurrency=16 rush records
          existingByDomain.set(String(obj.domain), obj)
        }
      } catch {
        // skip
      }
    }
  } else if (reset && fs.existsSync(CRAWLED_FILE)) {
    fs.unlinkSync(CRAWLED_FILE)
  }

  let queue: DiscoveredProspect[]
  if (targetDomainsSet) {
    queue = discovered.filter((d) => targetDomainsSet.has(d.domain.toLowerCase()))
  } else if (recrawlIncomplete) {
    console.log(`[Pre-Flight] Auditing ${existingByDomain.size} local vault folders with 5-Gate Visual & Animation Inspector...`)
    const cleanSet = new Set<string>()
    let permanentSkipCount = 0
    let wafSkipCount = 0
    let uncrawledSkipCount = 0
    let newlyStampedClean = 0

    const inspectPool = 16
    let inspectIdx = 0
    const inspectWorkers = Array.from({ length: inspectPool }, async () => {
      while (inspectIdx < discovered.length) {
        const d = discovered[inspectIdx++]
        const prev = existingByDomain.get(d.domain)
        if (!prev) {
          if (skipUncrawled) {
            uncrawledSkipCount++
            cleanSet.add(d.domain)
          }
          continue
        }
        const permanentNoSite =
          prev.crawlError === "missing_website_url" ||
          prev.crawlError === "social_only_no_website" ||
          prev.crawlError === "DNS domain did not resolve"
        if (permanentNoSite) {
          permanentSkipCount++
          cleanSet.add(d.domain)
          continue
        }
        if (!retryWaf && isKnownWafPage(prev)) {
          wafSkipCount++
          cleanSet.add(d.domain)
          continue
        }
        const isClean = await verifyExistingCleanHomepage(prev, allow4200Clip)
        if (isClean) {
          cleanSet.add(d.domain)
          if (prev.diagnostics && !prev.diagnostics.perf.fullPageVisualsVerified) {
            prev.diagnostics.perf.fullPageVisualsVerified = true
            newlyStampedClean++
          }
        }
      }
    })
    await Promise.all(inspectWorkers)

    if (!reset && existingByDomain.size > 0) {
      const compactedLines = Array.from(existingByDomain.values()).map((o) => toSafeJsonLine(o))
      fs.writeFileSync(CRAWLED_FILE, compactedLines.join("\n") + "\n", "utf8")
    }

    queue = discovered.filter((d) => !cleanSet.has(d.domain))

    // 4-Wave Priority Queue Sorting:
    // Wave 1: Live Tier-S Mid-Market Challengers (3.5★-4.6★, 35-300 rev, non-PE) WITH Verified Email
    // Wave 2: Remaining Live sites WITH Verified Email
    // Wave 3: Remaining incomplete Live sites without email
    // Wave 4: Earlier 16-tab transient timeouts
    let w1 = 0
    let w2 = 0
    let w3 = 0
    let w4 = 0
    const classifyWaveAndScore = (item: DiscoveredProspect) => {
      const prev = existingByDomain.get(item.domain)
      const isLive = Boolean(prev?.crawlOk)
      const hasEmail = (prev?.emails?.length || item.seedEmails?.length || 0) > 0
      const rev = item.googleReviewsCount ?? 0
      const rat = item.googleRating ?? 0
      const isChallenger = !prev?.isPeRollup && rat >= 3.5 && rat <= 4.6 && rev >= 35 && rev <= 300
      const revBonus = Math.min(45, Math.round(Math.log10(Math.max(1, rev)) * 15))
      if (isLive && hasEmail && isChallenger) return { wave: 1, pts: 1000 + revBonus }
      if (isLive && hasEmail) return { wave: 2, pts: 700 + (isChallenger ? 40 : 0) + revBonus }
      if (isLive) return { wave: 3, pts: 400 + (isChallenger ? 40 : 0) + revBonus }
      return { wave: 4, pts: 100 + (hasEmail ? 50 : 0) + (isChallenger ? 30 : 0) + revBonus }
    }

    for (const q of queue) {
      const w = classifyWaveAndScore(q).wave
      if (w === 1) w1++
      else if (w === 2) w2++
      else if (w === 3) w3++
      else w4++
    }
    queue.sort((a, b) => classifyWaveAndScore(b).pts - classifyWaveAndScore(a).pts)

    const cleanVisualCount = cleanSet.size - permanentSkipCount - wafSkipCount - uncrawledSkipCount
    console.log(
      `[Pre-Flight] Clean & complete (skipped): ${cleanVisualCount} (${newlyStampedClean} newly verified) | Permanent no-site (skipped): ${permanentSkipCount} | Confirmed WAF walls (skipped): ${wafSkipCount}${uncrawledSkipCount > 0 ? ` | Uncrawled deferred: ${uncrawledSkipCount}` : ""}`,
    )
    console.log(
      `[Pre-Flight] Queued ${queue.length} homepages -> Wave 1 (Tier-S Challenger+Email): ${w1} | Wave 2 (Live+Email): ${w2} | Wave 3 (Live No-Email): ${w3} | Wave 4 (Timeout Recovery): ${w4}`,
    )
  } else {
    if (!reset && existingByDomain.size > 0) {
      const compactedLines = Array.from(existingByDomain.values()).map((o) => toSafeJsonLine(o))
      fs.writeFileSync(CRAWLED_FILE, compactedLines.join("\n") + "\n", "utf8")
    }
    const rawQueue = discovered.filter((d) => !existingByDomain.has(d.domain))
    // Interleave uncrawled sites round-robin across cohorts (new chatbot cohorts prioritized, highest review challengers first)
    const CHATBOT_PRIORITY_COHORTS = [
      "healthcare_clinics",
      "urgent_home_dispatch",
      "longevity_specialty_med",
      "moving_cleaning",
      "hospitality_rentals",
      "pet_resorts_grooming",
      "academies_fitness",
      "event_vendors",
    ]
    const priorityRank = (cohort: string) => {
      const idx = CHATBOT_PRIORITY_COHORTS.indexOf(cohort)
      return idx >= 0 ? idx : 100
    }
    const buckets = new Map<string, DiscoveredProspect[]>()
    for (const item of rawQueue) {
      const arr = buckets.get(item.cohort) || []
      arr.push(item)
      buckets.set(item.cohort, arr)
    }
    const sortedCohortKeys = Array.from(buckets.keys()).sort((a, b) => priorityRank(a) - priorityRank(b))
    for (const key of sortedCohortKeys) {
      buckets.get(key)!.sort((a, b) => {
        const aRev = a.googleReviewsCount ?? 0
        const bRev = b.googleReviewsCount ?? 0
        const aSweet = aRev >= 35 && aRev <= 250 && (a.googleRating ?? 0) <= 4.6 ? 1 : 0
        const bSweet = bRev >= 35 && bRev <= 250 && (b.googleRating ?? 0) <= 4.6 ? 1 : 0
        if (aSweet !== bSweet) return bSweet - aSweet
        return bRev - aRev
      })
    }
    const interleaved: DiscoveredProspect[] = []
    let round = 0
    while (interleaved.length < rawQueue.length) {
      let addedInRound = false
      for (const key of sortedCohortKeys) {
        const arr = buckets.get(key)!
        if (round < arr.length) {
          interleaved.push(arr[round])
          addedInRound = true
        }
      }
      if (!addedInRound) break
      round++
    }
    queue = interleaved
  }
  if (limit > 0) queue = queue.slice(0, limit)

  if (queue.length === 0) {
    console.log("[Crawler] All target pages are already clean and complete. Nothing to crawl.")
    return
  }

  // Adaptive Internet Speed Probe & Dynamic Concurrency Controller
  let currentMbps = 3.0
  let activeConcurrency = hasExplicitConcurrencyArg ? concurrencyArgVal : 1
  if (adaptiveMode) {
    currentMbps = await probeInternetSpeedMbps()
    activeConcurrency = recommendedConcurrencyForMbps(currentMbps, Math.min(maxAdaptiveCap, queue.length))
    console.log(
      `[SpeedGuard] Initial ISP speed probe: ${currentMbps.toFixed(2)} Mbps -> starting with ${activeConcurrency} concurrent tab(s) (adaptive range 1..${maxAdaptiveCap})`,
    )
  } else {
    activeConcurrency = Math.min(concurrencyArgVal, queue.length)
  }

  const maxWorkerPool = adaptiveMode ? Math.min(maxAdaptiveCap, queue.length) : activeConcurrency

  console.log(
    `[Crawler] Total discovered: ${discovered.length} | Stored in JSONL: ${existingByDomain.size} | Queued now: ${queue.length} (activeTabs=${activeConcurrency}, maxPool=${maxWorkerPool}, adaptive=${adaptiveMode}, homeOnly=${homeOnly}, reportQuality=${reportQualityMode})`,
  )

  const browserCount = Math.min(3, Math.max(1, Math.ceil(maxWorkerPool / 3)))
  const retiringBrowsers = new Set<Browser>()
  const slots: BrowserSlot[] = []
  for (let b = 0; b < browserCount; b++) {
    slots.push({
      id: b,
      browser: await launchChromium(),
      uses: 0,
      wedged: false,
      relaunching: null,
    })
  }

  async function acquireBrowser(slot: BrowserSlot): Promise<Browser> {
    if (slot.relaunching) {
      return slot.relaunching
    }
    const needsCrashRecovery = !slot.browser || !slot.browser.isConnected() || slot.wedged
    const needsMemoryRotation = !needsCrashRecovery && slot.uses >= 120

    if (needsCrashRecovery || needsMemoryRotation) {
      const oldBrowser = slot.browser
      slot.relaunching = (async () => {
        try {
          const fresh = await launchChromium()
          slot.browser = fresh
          slot.uses = 0
          slot.wedged = false
          if (oldBrowser) {
            if (!oldBrowser.isConnected()) {
              withTimeout(oldBrowser.close(), 2000, undefined).catch(() => {})
            } else {
              retiringBrowsers.add(oldBrowser)
              const t = setTimeout(() => {
                retiringBrowsers.delete(oldBrowser)
                withTimeout(oldBrowser.close(), 2500, undefined).catch(() => {})
              }, 45000)
              t.unref()
            }
          }
          return fresh
        } finally {
          slot.relaunching = null
        }
      })()
      return slot.relaunching
    }

    slot.uses++
    return slot.browser!
  }

  const outStream = fs.createWriteStream(CRAWLED_FILE, { flags: "a", encoding: "utf8" })
  const startedAt = Date.now()
  let cursor = 0
  let completed = 0
  let okCount = 0

  const attemptBudgetMs = reportQualityMode ? 86000 : 27500
  const logEvery = reportQualityMode ? 10 : 50

  // Adaptive congestion & periodic speed-probe state
  const recentStallWindow: boolean[] = []
  let lastSpeedProbeAt = Date.now()
  let lastSpeedProbeCompleted = 0
  let speedProbeInFlight = false

  function evaluateAdaptiveSpeedAfterPage(rec: CrawledProspectRecord, wasLiveBefore: boolean) {
    if (!adaptiveMode) return
    const timedOut = !rec.crawlOk && /timed out/i.test(rec.crawlError || "")
    const stalledImages = Boolean(rec.crawlOk && rec.diagnostics && !rec.diagnostics.perf.fullPageVisualsVerified)
    // Only count timeouts on known-live sites (Wave 1-3) as ISP congestion so dead Wave 4 servers don't falsely throttle
    const isCongestionSignal = stalledImages || (timedOut && wasLiveBefore)

    recentStallWindow.push(isCongestionSignal)
    if (recentStallWindow.length > 6) recentStallWindow.shift()

    const recentStalls = recentStallWindow.filter(Boolean).length
    if (recentStalls >= 2 && activeConcurrency > 1) {
      const prevTabs = activeConcurrency
      activeConcurrency = Math.max(1, activeConcurrency - 1)
      recentStallWindow.length = 0
      console.log(
        `[SpeedGuard] Image/load stall detected on 2 of last 6 pages -> backing off ${prevTabs} -> ${activeConcurrency} tab(s)`,
      )
    }

    const pagesSinceProbe = completed - lastSpeedProbeCompleted
    const msSinceProbe = Date.now() - lastSpeedProbeAt
    if (!speedProbeInFlight && (pagesSinceProbe >= 18 || msSinceProbe >= 75000) && cursor < queue.length) {
      speedProbeInFlight = true
      lastSpeedProbeAt = Date.now()
      lastSpeedProbeCompleted = completed
      probeInternetSpeedMbps()
        .then((measured) => {
          // Smooth EMA (70% new reading + 30% prior) to prevent momentary spikes from oscillating wildly
          currentMbps = Number((measured * 0.7 + currentMbps * 0.3).toFixed(2))
          const recTabs = recommendedConcurrencyForMbps(currentMbps, maxAdaptiveCap)
          if (recTabs !== activeConcurrency) {
            // Scale up by at most +2 at a time, scale down immediately
            const nextTabs =
              recTabs > activeConcurrency ? Math.min(recTabs, activeConcurrency + 2) : recTabs
            if (nextTabs !== activeConcurrency) {
              console.log(
                `[SpeedGuard] ISP speed ${measured.toFixed(2)} Mbps (smoothed ${currentMbps.toFixed(2)} Mbps) -> adjusting concurrency ${activeConcurrency} -> ${nextTabs} tab(s)`,
              )
              activeConcurrency = nextTabs
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          speedProbeInFlight = false
        })
    }
  }

  async function runAttempt(slot: BrowserSlot, item: DiscoveredProspect): Promise<CrawledProspectRecord> {
    const browser = await acquireBrowser(slot)
    const prevRecord = existingByDomain.get(item.domain)
    return withTimeout<CrawledProspectRecord>(
      crawlSingleProspect(browser, item, reportQualityMode, homeOnly, prevRecord),
      attemptBudgetMs,
      {
        ...item,
        websiteStatus: "unreachable",
        crawledAt: new Date().toISOString(),
        crawlOk: false,
        crawlError: `Page load timed out (>${Math.round(attemptBudgetMs / 1000)}s)`,
        finalUrl: null,
        cmsPlatform: null,
        isPeRollup: false,
        emails: sanitizeProspectEmails(item.seedEmails || []),
        phones: item.seedPhones || [],
        decisionMakers: [],
        socialLinks: item.seedSocialLinks || {},
        diagnostics: null,
        localSheetFile: null,
      },
    )
  }

  async function worker(workerId: number) {
    const slot = slots[workerId % slots.length]
    while (cursor < queue.length) {
      while (adaptiveMode && workerId >= activeConcurrency && cursor < queue.length) {
        await new Promise((r) => setTimeout(r, 350))
      }
      if (cursor >= queue.length) break

      const idx = cursor++
      const item = queue[idx]
      const prev = existingByDomain.get(item.domain)
      const wasLiveBefore = Boolean(prev?.crawlOk)

      let rec = await runAttempt(slot, item)
      if (!rec.crawlOk && (/BROWSER_WEDGED/i.test(rec.crawlError || "") || !slot.browser?.isConnected())) {
        slot.wedged = true
        rec = await runAttempt(slot, item)
      }

      if (!rec.crawlOk && prev?.crawlOk) {
        // Never overwrite a previously parsed DOM record with a transient timeout during re-crawl
        completed++
      } else {
        existingByDomain.set(item.domain, rec)
        outStream.write(toSafeJsonLine(rec) + "\n")
        completed++
        if (rec.crawlOk) okCount++
      }

      evaluateAdaptiveSpeedAfterPage(rec, wasLiveBefore)

      if (completed % logEvery === 0 || completed === queue.length) {
        const elapsedSec = Math.max(1, (Date.now() - startedAt) / 1000)
        const secPerSite = (elapsedSec / Math.max(1, completed)).toFixed(1)
        const pctOk = Math.round((okCount / Math.max(1, completed)) * 100)
        const etaMin = Math.round(((queue.length - completed) * (elapsedSec / Math.max(1, completed))) / 60)
        const speedInfo = adaptiveMode ? ` | ${currentMbps.toFixed(1)} Mbps (${activeConcurrency} tabs)` : ""
        console.log(
          `[Crawler] ${completed}/${queue.length} (${okCount} live = ${pctOk}%)${speedInfo} | ${secPerSite}s/site eff | ETA ~${etaMin} min`,
        )
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: maxWorkerPool }, (_, i) => worker(i)))
  } finally {
    await new Promise<void>((resolve) => outStream.end(() => resolve()))
    await Promise.all([
      ...slots.map((s) => (s.browser ? withTimeout(s.browser.close(), 2500, undefined) : Promise.resolve())),
      ...Array.from(retiringBrowsers).map((b) => withTimeout(b.close(), 2500, undefined)),
    ])
  }

  console.log(`\n=== Stage 2 Crawl & Stitch Complete: ${completed} processed (${okCount} live sites rendered & stitched) ===`)
  console.log(`Sheets dir: ${SHEETS_DIR}`)
  console.log(`Vault dir:  ${VAULT_DIR}`)
}

main().catch((err) => {
  console.error("Crawler failed:", err)
  process.exit(1)
})
