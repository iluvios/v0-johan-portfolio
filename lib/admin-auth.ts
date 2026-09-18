import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"

// Server-side admin session. The passcode lives only in ADMIN_PASSCODE (never NEXT_PUBLIC_*),
// and a successful login sets an HMAC-signed, httpOnly cookie that every write route verifies.

export const ADMIN_COOKIE = "admin_session"
const SESSION_SECONDS = 60 * 60 * 24 * 7

function getSecret(): string | undefined {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSCODE
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSCODE)
}

function digest(value: string): Uint8Array {
  return new Uint8Array(createHash("sha256").update(value).digest())
}

// Hash both sides first so the comparison is constant-time regardless of input length.
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b))
}

function sign(expires: number, secret: string): string {
  return createHmac("sha256", secret).update(`admin:${expires}`).digest("hex")
}

export function checkPasscode(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSCODE
  return Boolean(expected) && typeof input === "string" && safeEqual(input, expected!)
}

export function isAdmin(request: NextRequest): boolean {
  const secret = getSecret()
  const value = request.cookies.get(ADMIN_COOKIE)?.value
  if (!secret || !value) return false
  const [expiresRaw, signature] = value.split(".")
  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || expires < Date.now() || !signature) return false
  return safeEqual(signature, sign(expires, secret))
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  return isAdmin(request)
    ? null
    : NextResponse.json({ error: "Unauthorized. Please log in to the admin again." }, { status: 401 })
}

export function setAdminSession(response: NextResponse): void {
  const secret = getSecret()
  if (!secret) return
  const expires = Date.now() + SESSION_SECONDS * 1000
  response.cookies.set(ADMIN_COOKIE, `${expires}.${sign(expires, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  })
}

export function clearAdminSession(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 })
}
