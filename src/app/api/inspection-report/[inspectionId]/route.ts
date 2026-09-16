import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Proxies the backend's GET /inspections/:id/report.pdf, same reasoning
 * as src/app/api/qr/[siteId]/route.ts - the backend route requires a
 * Bearer token that a plain <a href> can't send, so this server-side
 * route reads the admin's session from cookies and forwards it.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/report.pdf`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    return new NextResponse(body, { status: res.status });
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'application/pdf',
      'Content-Disposition': res.headers.get('Content-Disposition') ?? 'inline',
    },
  });
}
