import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Next.js 16+ Proxy for Better Auth Route Protection
 * 
 * This proxy performs full session validation using auth.api.getSession
 * which validates against the database for maximum security.
 * 
 * For SaaS applications, this ensures that only authenticated users
 * can access protected routes like /home.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session with full database validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Protect /home route - require authentication
  if (pathname.startsWith("/home")) {
    if (!session) {
      // Redirect unauthenticated users to sign-in
      const signInUrl = new URL("/sign-in", request.url);
      // Preserve the intended destination for redirect after login
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/sign-in" || pathname === "/sign-up") && session) {
    // Get redirect parameter or default to /home
    const redirect = new URL(request.url).searchParams.get("redirect") || "/home";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // Required for auth.api calls to access database
  matcher: [
    "/home/:path*", // Protect all routes under /home
    "/sign-in",
    "/sign-up",
  ],
};

