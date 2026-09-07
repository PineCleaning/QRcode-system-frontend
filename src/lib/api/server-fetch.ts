import { createClient } from '../supabase/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/** No request from the admin portal (Add/Edit/Delete anywhere) should ever hang indefinitely - real steady-state latency is ~400-450ms, so 10s is a very generous ceiling, not a tight one. */
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Server-side only (Server Components/Actions) - attaches the current admin's Supabase access token. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new ApiError(401, 'Not authenticated');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: 'no-store',
      // Without this, a genuinely hung backend request (a stuck query, a
      // deadlock) leaves the caller's "Saving…" button disabled
      // indefinitely - there's no other timeout anywhere in this path.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new ApiError(0, 'This is taking longer than expected. Please try again.');
    }
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
