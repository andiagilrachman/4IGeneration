/**
 * Middleware Next.js — proteksi route dashboard.
 * Cek cookie `4ig_auth` (di-set saat login/register) → redirect ke /login
 * bila tidak ada. TODO lanjutan: validasi JWT sungguhan di server.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const hasAuth = request.cookies.get("4ig_auth")?.value === "1";

  if (isProtected && !hasAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
