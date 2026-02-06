import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = [
  "/event",
  "/challenges",
  "/teams",
  "/scoreboard",
  "/notifications",
  "/profile",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("ctf_token")?.value;

  // not logged in → go login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/event/:path*", "/challenges/:path*", "/teams/:path*", "/scoreboard/:path*", "/notifications/:path*", "/profile/:path*"],
};
