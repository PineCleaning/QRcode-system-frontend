import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Excludes /api/* too - those routes do their own auth check and must
  // return a real JSON response (e.g. 401), not an HTML redirect to
  // /login. An <img src="/api/qr/..."> would otherwise render as a
  // broken image the moment a session expires mid-page instead of
  // failing in a way the app could handle.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
