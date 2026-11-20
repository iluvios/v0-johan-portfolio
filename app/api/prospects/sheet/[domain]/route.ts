import fs from "node:fs"
import path from "node:path"
import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { requireAdmin } from "@/lib/admin-auth"
import { PROSPECT_COHORTS } from "@/lib/prospects"

type Params = { params: Promise<{ domain: string }> }

type AssetView = "sheet" | "desktop-full" | "mobile-hero" | "desktop-hero"

const KNOWN_COHORTS = PROSPECT_COHORTS.map((c) => c.value)

const VIEW_TO_VAULT_FILE: Record<Exclude<AssetView, "sheet">, string> = {
  "desktop-full": "desktop-full.webp",
  "mobile-hero": "mobile-hero.webp",
  "desktop-hero": "desktop-hero.webp",
}

export async function GET(request: NextRequest, { params }: Params) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  let decoded = ""
  try {
    decoded = decodeURIComponent((await params).domain || "")
  } catch {
    return NextResponse.json({ error: "Invalid domain slug" }, { status: 400 })
  }

  const raw = decoded
    .trim()
    .toLowerCase()
    .replace(/\.(jpg|jpeg|webp|png)$/i, "")

  if (!raw || !/^[a-z0-9][a-z0-9._-]*[a-z0-9]$/.test(raw) || raw.includes("..")) {
    return NextResponse.json({ error: "Invalid domain slug" }, { status: 400 })
  }

  const sp = request.nextUrl.searchParams
  const rawView = (sp.get("view") || "sheet").toLowerCase()
  const view: AssetView =
    rawView === "desktop-full" || rawView === "mobile-hero" || rawView === "desktop-hero" ? rawView : "sheet"
  const requestedFormat = (sp.get("format") || "").toLowerCase()
  const isDownload = sp.get("download") === "1" || sp.get("download") === "true"
  const cohortHint = (sp.get("cohort") || "").toLowerCase().replace(/[^a-z0-9_]/g, "")

  const auditsRoot = path.resolve(process.cwd(), ".local-audits")
  let sourcePath: string | null = null
  let nativeExt: "jpg" | "webp" = "jpg"

  if (view === "sheet") {
    const sheetsRoot = path.resolve(auditsRoot, "sheets")
    const candidate = path.resolve(sheetsRoot, `${raw}.jpg`)
    if (candidate.startsWith(sheetsRoot + path.sep) && fs.existsSync(candidate)) {
      sourcePath = candidate
      nativeExt = "jpg"
    }
  } else {
    const vaultRoot = path.resolve(auditsRoot, "vault")
    const vaultFilename = VIEW_TO_VAULT_FILE[view]
    const cohortsToTry = cohortHint
      ? [cohortHint, ...KNOWN_COHORTS.filter((c) => c !== cohortHint)]
      : [...KNOWN_COHORTS]

    for (const c of cohortsToTry) {
      const candidate = path.resolve(vaultRoot, c, raw, vaultFilename)
      if (candidate.startsWith(vaultRoot + path.sep) && fs.existsSync(candidate)) {
        sourcePath = candidate
        nativeExt = "webp"
        break
      }
    }
  }

  if (!sourcePath) {
    return NextResponse.json({ error: `Local visual asset (${view}) not available` }, { status: 404 })
  }

  try {
    const rawBuffer = await fs.promises.readFile(sourcePath)
    const outFormat: "jpg" | "png" | "webp" =
      requestedFormat === "png"
        ? "png"
        : requestedFormat === "jpg" || requestedFormat === "jpeg"
        ? "jpg"
        : requestedFormat === "webp"
        ? "webp"
        : nativeExt

    let finalBuffer: Buffer = rawBuffer
    if (outFormat !== nativeExt) {
      if (outFormat === "png") {
        finalBuffer = await sharp(rawBuffer).png().toBuffer()
      } else if (outFormat === "jpg") {
        finalBuffer = await sharp(rawBuffer).jpeg({ quality: 88, mozjpeg: true }).toBuffer()
      } else {
        finalBuffer = await sharp(rawBuffer).webp({ quality: 86 }).toBuffer()
      }
    }

    const contentType =
      outFormat === "png" ? "image/png" : outFormat === "webp" ? "image/webp" : "image/jpeg"
    const downloadFilename = `${raw}-${view}.${outFormat}`

    return new NextResponse(new Uint8Array(finalBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=60",
        ...(isDownload ? { "Content-Disposition": `attachment; filename="${downloadFilename}"` } : {}),
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to read local visual asset" }, { status: 500 })
  }
}
