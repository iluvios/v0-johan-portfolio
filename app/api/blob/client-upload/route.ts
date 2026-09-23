import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"

// Issues short-lived tokens so the browser uploads straight to Vercel Blob. Needed for ad
// videos: a serverless function body is capped at ~4.5 MB, far below a typical video file.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody

  // Only token requests come from the admin's browser. The completion callback comes from
  // Vercel and is verified by handleUpload itself, so it must not require the cookie.
  if (body.type === "blob.generate-client-token" && !isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*", "video/mp4", "video/webm", "video/quicktime"],
        maximumSizeInBytes: 200 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    )
  }
}
