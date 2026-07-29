'use server';

import { createClient } from '@/lib/supabase/server';
import type { CsvImportResult } from '@/lib/api/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Deliberately not using apiFetch() here - it always sets
 * Content-Type: application/json whenever a body is present, which
 * would break this multipart file upload (the browser/undici need to
 * set their own multipart boundary header, not have it overridden).
 */
export async function bulkUploadAction(formData: FormData): Promise<CsvImportResult> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/clients/bulk-upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
      cache: 'no-store',
    });
  } catch {
    throw new Error("Couldn't reach the server. Please check your connection and try again.");
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (body && body.message) || res.statusText;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Upload failed');
  }

  return body as CsvImportResult;
}
