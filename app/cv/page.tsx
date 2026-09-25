import type { Metadata } from "next"
import CVDocument from "@/components/cv-document"

export const metadata: Metadata = {
  title: "CV",
  // Same document as /about; point search engines at the in-site version.
  alternates: { canonical: "/about" },
}

// Standalone, chrome-free CV for sharing and printing. /about renders the same document inside the site.
export default function CVPage() {
  return <CVDocument />
}
