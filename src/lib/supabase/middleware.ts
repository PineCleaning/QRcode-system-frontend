import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Everything under these prefixes requires an admin session. Everything
// else - "/", "/login", and any "/qrfeedback/{slug}" (the public feedback
// form) - is public by design, not "public because we forgot to protect it".
const PROTECTED_PREFIXES = ['/clients', '/feedback', '/assets', '/settings'];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isLoginPath = pathname === '/login';

  // Only /login and protected routes ever branch on session state. Every
  // other route (the public feedback form, "/") used to pay for a full
  // auth check whose result was then thrown away unused - a real, measured
  // ~220-700ms cost per load for zero benefit, worst on the public form a
  // customer lands on straight from a QR scan.
  if (!isProtectedPath && !isLoginPath) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() verifies the JWT locally against Supabase's cached JWKS
  // (this project uses asymmetric ES256 signing) instead of always making
  // a network round-trip to the Auth server like getUser() did - measured
  // ~1-2ms here vs ~220-700ms for getUser(), on every request that reaches
  // this point. Still refreshes an about-to-expire session first, same as
  // getUser() did, so the cookie-refresh behavior the redirect logic below
  // depends on is preserved.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  if (!isLoggedIn && isProtectedPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPath) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/clients';
    return NextResponse.redirect(homeUrl);
  }

  return response;
}
