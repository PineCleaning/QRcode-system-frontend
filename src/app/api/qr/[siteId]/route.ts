import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Proxies the backend's GET /sites/:id/qr, which requires a Bearer token -
 * something a plain <img src> or download <a href> can't send. This route
 * runs server-side, reads the admin's session from cookies, and forwards
 * the request with the Authorization header attached.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const search = request.nextUrl.search;
  const ifNoneMatch = request.headers.get('if-none-match');
  const res = await fetch(`${API_BASE_URL}/sites/${siteId}/qr${search}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {}),
    },
    // This no-store is about Next's own server-side fetch Data Cache
    // (which would otherwise risk one admin's request serving a
    // different admin's cached response body) - unrelated to, and safe
    // alongside, the browser-facing Cache-Control/ETag forwarded below.
    // The backend's own in-memory QrService cache is what actually
    // avoids redoing the sharp/pdfkit render on every hit.
    cache: 'no-store',
  });

  if (res.status === 304) {
    return new NextResponse(null, { status: 304, headers: { ETag: res.headers.get('ETag') ?? '' } });
  }

  if (!res.ok) {
    const body = await res.text();
    return new NextResponse(body, { status: res.status });
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
      'Content-Disposition': res.headers.get('Content-Disposition') ?? 'inline',
      'Cache-Control': res.headers.get('Cache-Control') ?? 'no-store',
      ...(res.headers.get('ETag') ? { ETag: res.headers.get('ETag')! } : {}),
    },
  });
}
