import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const GUEST_COOKIE = "pp_guest";

// Issue a guest token on first visit so anonymous draft trips can be saved to
// Convex before the visitor signs in. Readable by JS (not httpOnly) because the
// client passes it to Convex as `guestId`; it's a random capability token, not
// a credential. On sign-in, claimGuestTrips migrates those drafts to the user.
export default clerkMiddleware(async (_auth, req) => {
  const res = NextResponse.next();
  if (!req.cookies.get(GUEST_COOKIE)) {
    res.cookies.set(GUEST_COOKIE, crypto.randomUUID(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return res;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
