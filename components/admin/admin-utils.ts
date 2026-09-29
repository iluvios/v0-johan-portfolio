import type React from "react"

export type AdminNotify = (type: "success" | "error" | "info", text: string) => void

/**
 * Synchronously extracts image files from a React ClipboardEvent.
 * Checks both clipboardData.items and clipboardData.files for browser compatibility.
 */
export function extractImageFiles(e: React.ClipboardEvent): File[] {
  const files: File[] = []
  const items = e.clipboardData?.items

  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }
  }

  if (files.length === 0 && e.clipboardData?.files) {
    for (let i = 0; i < e.clipboardData.files.length; i++) {
      const file = e.clipboardData.files[i]
      if (
        file.type.startsWith("image/") ||
        /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(file.name)
      ) {
        files.push(file)
      }
    }
  }

  return files
}
