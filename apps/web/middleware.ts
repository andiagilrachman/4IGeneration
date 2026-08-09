/**
 * Middleware Next.js — proteksi route (placeholder).
 * TODO (Week 2-3 roadmap): verifikasi JWT dari cookies,
 * redirect ke /login jika tidak terautentikasi.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // TODO: cek session/JWT di sini
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
