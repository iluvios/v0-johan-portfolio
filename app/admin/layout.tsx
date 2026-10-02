import type React from "react"
import { AdminApp } from "@/components/admin/admin-app"

// The admin lives in the layout so it stays mounted while the URL changes between tabs and
// open items (/admin/projects/25); a page-level component would remount and refetch on every click.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminApp />
      {children}
    </>
  )
}
