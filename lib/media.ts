import { upload } from "@vercel/blob/client"

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)(\?|#|$)/i
const COMPRESSIBLE_TYPES = /^image\/(png|jpe?g|webp|bmp|avif)$/
const MAX_IMAGE_WIDTH = 1600
const IMAGE_QUALITY = 0.8
// WebP can't exceed 16383 px per side; taller page captures are saved as JPEG instead
const WEBP_MAX_SIDE = 16383

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.test(url)
}

/**
 * Shrinks screenshots before upload: at most 1600 px wide, re-encoded as WebP. Tall captures keep
 * their full height. Returns the original file when it's already small, not a raster image, or
 * when re-encoding wouldn't save much.
 */
export async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.test(file.type) || file.size < 300_000) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const type = height > WEBP_MAX_SIDE ? "image/jpeg" : "image/webp"
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, IMAGE_QUALITY))
    if (!blob || blob.size >= file.size * 0.9) return file
    const name = `${file.name.replace(/\.[^.]+$/, "")}.${type === "image/webp" ? "webp" : "jpg"}`
    return new File([blob], name, { type })
  } catch {
    return file
  }
}

/** Uploads an image or video straight from the browser to Vercel Blob (no 4.5 MB function limit). */
export async function uploadMedia(file: File): Promise<string> {
  const toUpload = await compressImage(file)
  const blob = await upload(`creatives/${toUpload.name}`, toUpload, {
    access: "public",
    handleUploadUrl: "/api/blob/client-upload",
  })
  return blob.url
}
