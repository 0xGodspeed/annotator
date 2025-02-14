import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Development bypass - always allow access
  return NextResponse.next()

  // Original authentication logic commented out
  /*
  const currentUser = request.cookies.get("user")
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/signup")

  if (isAuthPage && currentUser) {
    return NextResponse.redirect(new URL("/annotate", request.url))
  }

  if (!currentUser && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: [
    "/annotate/:path*",
    "/login",
    "/signup",
  ],
} 