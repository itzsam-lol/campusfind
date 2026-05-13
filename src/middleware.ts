// Edge middleware: adds security headers, plus light gating for /admin and
// the authenticated app shell. Cookie-presence check only here — the real
// authorization happens inside server actions / API routes.

import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/home",
  "/listings",
  "/post",
  "/activity",
  "/notifications",
  "/chat",
  "/claim",
  "/admin",
];

const ADMIN_PREFIX = "/admin";

const SESSION_COOKIE = process.env.SESSION_COOKIE || "cf_session";

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.get(SESSION_COOKIE)?.value;

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  // The real admin check requires DB lookup (role), but blocking unauth users
  // at the edge cuts noise. The page itself also calls requireAdmin.
  if (pathname.startsWith(ADMIN_PREFIX) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // Run on every page request but skip Next.js internals.
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
