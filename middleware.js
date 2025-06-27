import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * The root domain of the application.
 * You can load this from an environment variable.
 * @example
 * const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';
 */
const rootDomain = process.env.ROOT_DOMAIN || 'localhost:3000';

/**
 * Extracts the subdomain from a NextRequest object.
 * This function handles localhost development, Vercel preview URLs, and production domains.
 * @param {NextRequest} request - The incoming request.
 * @returns {string | null} The extracted subdomain or null if not found.
 */
function extractSubdomain(request) {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Handle local development where the hostname might be "sub.localhost"
  if (hostname.includes('.localhost')) {
    return hostname.split('.')[0];
  }

  // Handle Vercel preview deployments (e.g., "tenant---branch-name.vercel.app")
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    return hostname.split('---')[0];
  }

  // Handle production environment
  const rootDomainFormatted = rootDomain.split(':')[0];
  if (
    hostname !== rootDomainFormatted &&
    hostname.endsWith(`.${rootDomainFormatted}`)
  ) {
    return hostname.replace(`.${rootDomainFormatted}`, '');
  }

  return null;
}

// --- Route Matchers for Clerk ---

// These routes are publicly accessible and do not require authentication.
const isPublicRoute = createRouteMatcher([
  '/', // The main marketing page
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/s/(.*)',
  // NOTE: If you want tenant pages to be public, add '/s/(.*)' here.
  // By default, they are considered private.
]);

// This route is used for the user onboarding flow.
const isOnboardingRoute = createRouteMatcher(['/onboarding']);


// --- Main Middleware Function ---

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // 1. MULTI-TENANT LOGIC
  const subdomain = extractSubdomain(req);

  if (subdomain) {
    // Block direct access to /admin on subdomains
    if (pathname.startsWith('/admin')) {
      const absoluteUrl = new URL('/', req.url);
      return NextResponse.redirect(absoluteUrl);
    }

    // Rewrite the root path of a subdomain to its dedicated page
    // e.g., "acme.example.com/" is rewritten to "/s/acme"
    if (pathname === '/') {
      const rewrittenUrl = new URL(`/s/${subdomain}`, req.url);
      return NextResponse.rewrite(rewrittenUrl);
    }
  }

  // 2. CLERK AUTHENTICATION & ONBOARDING LOGIC

  // Allow users to access the onboarding page if they are signed in.
  if (userId && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // If the user is not signed in and the route is not public, redirect to sign-in.
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // If the user is signed in but has not completed onboarding,
  // redirect them to the onboarding page.
  // We also check that they are not already on the onboarding page to prevent a redirect loop.
  if (userId && !sessionClaims?.metadata?.onboardingComplete) {
    if (!isOnboardingRoute(req)) {
      const onboardingUrl = new URL('/onboarding', req.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // If all checks pass, allow the request to proceed.
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/trpc (tRPC routes)
     * Feel free to add more static assets here.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/trpc).*)',
  ],
};