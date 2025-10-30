import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes must include Clerk's auth pages to avoid redirect loops
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/uploadthing(.*)",
  "/api/webhook(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
