import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN is not configured." },
        { status: 503 }
      )
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const blob = await put(`workspace-files/${Date.now()}-${safeName}`, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error("Workspace upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
