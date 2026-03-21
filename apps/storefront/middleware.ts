import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect /cont/* routes
  if (pathname.startsWith("/cont")) {
    const token = request.cookies.get("_medusa_jwt")?.value

    if (!token) {
      // Redirect to login with return URL
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set(
        "redirect",
        request.nextUrl.pathname + request.nextUrl.search
      )
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/cont/:path*"],
}
