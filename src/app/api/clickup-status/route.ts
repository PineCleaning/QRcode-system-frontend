import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Proxies the backend's GET /clickup/status for the client-side
 * ClickupStatusBanner (see that component for why it can't just be a
 * plain server-rendered part of the layout). Same pattern as
 * src/app/api/qr/[siteId]/route.ts - runs server-side, reads the
 * admin's session from cookies, attaches the Bearer token the browser
 * can't send itself.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/clickup/status`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    });
  } catch {
    // Backend unreachable - the banner treats this the same as "no data", not an error to surface.
    return NextResponse.json({ connected: false, needsReconnect: false }, { status: 200 });
  }

  if (!res.ok) {
    return NextResponse.json({ connected: false, needsReconnect: false }, { status: 200 });
  }

  const body = await res.json();
  return NextResponse.json(body);
}
