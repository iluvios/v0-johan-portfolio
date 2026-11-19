import { NextResponse, type NextRequest } from "next/server";
import {
  LANG_HEADER,
  PREVIEW_SITE_COOKIE,
  SITE_CONFIGS,
  SITE_HEADER,
  detectPreferredLanguage,
  isPreviewHost,
  isSiteId,
  resolveSiteFromHost,
  type SiteId,
} from "@/lib/tenant";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const preview = isPreviewHost(host);

  let site: SiteId = resolveSiteFromHost(host);
  let setPreviewCookie: SiteId | null = null;

  // On localhost / Vercel preview URLs, allow ?site=energymedia | ?site=asjohan
  // (and persist via cookie) so both brands can be previewed without editing /etc/hosts.
  if (preview) {
    const querySite = searchParams.get("site");
    const cookieSite = request.cookies.get(PREVIEW_SITE_COOKIE)?.value;
    if (isSiteId(querySite)) {
      site = querySite;
      setPreviewCookie = querySite;
    } else if (site === "asjohan" && isSiteId(cookieSite)) {
      site = cookieSite;
    }
  }

  // Keep /admin anchored on asjohan.com in production so the agency domain doesn't expose it.
  if (!preview && site === "energymedia" && pathname.startsWith("/admin")) {
    const target = new URL(pathname, SITE_CONFIGS.asjohan.origin);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 307);
  }

  // Energy Media is an agency, not a personal CV.
  if (site === "energymedia" && pathname === "/cv") {
    const target = request.nextUrl.clone();
    target.pathname = "/about";
    return NextResponse.redirect(target, 307);
  }

  // Keep asjohan.com's legacy /services -> /projects redirect while allowing
  // /services to render the Energy Media services page.
  if (site === "asjohan" && pathname === "/services") {
    const target = request.nextUrl.clone();
    target.pathname = "/projects";
    return NextResponse.redirect(target, 308);
  }

  const detectedLang = detectPreferredLanguage({
    acceptLanguage: request.headers.get("accept-language"),
    country:
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry"),
    site,
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SITE_HEADER, site);
  requestHeaders.set(LANG_HEADER, detectedLang);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (setPreviewCookie) {
    response.cookies.set(PREVIEW_SITE_COOKIE, setPreviewCookie, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|pdf|woff2?)$).*)",
  ],
};
