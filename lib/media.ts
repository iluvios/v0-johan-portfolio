import { upload } from "@vercel/blob/client"

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)(\?|#|$)/i

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.test(url)
}

/** Uploads an image or video straight from the browser to Vercel Blob (no 4.5 MB function limit). */
export async function uploadMedia(file: File): Promise<string> {
  const blob = await upload(`creatives/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/blob/client-upload",
  })
  return blob.url
}
