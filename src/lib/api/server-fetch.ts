import { createClient } from '../supabase/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface ApiFetchOptions extends RequestInit {
  /**
   * Opts this one call into Next's timed Data Cache instead of the
   * default `no-store` - only safe for read-only lookups that rarely
   * change (a client/site's name/address), never for anything that
   * just got mutated or that must reflect real-time state. A
   * `revalidatePath` call elsewhere does NOT clear this - a timed
   * cache entry is only ever invalidated by its own expiry or an
   * explicit `revalidateTag`, so this is a bounded, self-healing
   * staleness window (at most `revalidateSeconds` old), not a bug.
   *
   * Added 2026-09-16: measured that adding an inspection item cost
   * ~2.2s for its own write plus another ~1.5-3s re-fetching the
   * current page's client+site info (via revalidatePath forcing
   * page.tsx's Promise.all to re-run) even though neither actually
   * changed - that data doesn't need to be network-fresh on every
   * single item add within the same short session.
   */
  revalidateSeconds?: number;
}

/** Server-side only (Server Components/Actions) - attaches the current admin's Supabase access token. */
export async function apiFetch<T>(path: string, init?: ApiFetchOptions): Promise<T> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { revalidateSeconds, ...restInit } = init ?? {};

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...restInit,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
        Authorization: `Bearer ${session.access_token}`,
      },
      ...(revalidateSeconds !== undefined ? { next: { revalidate: revalidateSeconds } } : { cache: 'no-store' }),
    });
  } catch {
    // A genuine network failure (backend unreachable) throws a raw
    // "fetch failed" TypeError rather than resolving - wrap it as an
    // ApiError with a real message so callers (Server Actions,
    // error.tsx) show something a non-technical admin can understand.
    throw new ApiError(0, "Couldn't reach the server. Please check your connection and try again.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (body && (body.message as string)) || res.statusText;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message);
  }

  return body as T;
}
