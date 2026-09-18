import { type NextRequest, NextResponse } from "next/server"
import {
  checkPasscode,
  clearAdminSession,
  isAdmin,
  isAdminConfigured,
  setAdminSession,
} from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdmin(request), configured: isAdminConfigured() })
}

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin is disabled: set the ADMIN_PASSCODE environment variable in Vercel (or .env.local)." },
      { status: 503 },
    )
  }

  const body = await request.json().catch(() => ({}))
  if (!checkPasscode(body?.passcode)) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 })
  }

  const response = NextResponse.json({ authenticated: true })
  setAdminSession(response)
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false })
  clearAdminSession(response)
  return response
}
