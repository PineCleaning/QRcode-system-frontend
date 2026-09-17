import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Proxies GET /clients/:clientId/sites?pageSize=200 for the client-side
 * Client -> Site picker in AddGlobalInventoryItemModal - a 'use client'
 * component can't call apiFetch() directly (it reads cookies via a
 * server-only Supabase client), same reasoning as the existing
 * /api/qr and /api/inspection-report proxy routes.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/clients/${clientId}/sites?pageSize=200`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}
