const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/** For the public feedback form - no session, no Authorization header. Matches the backend's public (unguarded) endpoints. */
export async function publicFetch<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T | null }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      cache: 'no-store',
    });
  } catch {
    // A real network failure (backend unreachable) throws rather than
    // resolving - without this, a customer scanning a QR code during a
    // backend outage would hit Next's generic crash page instead of the
    // page.tsx caller's existing !ok -> InactiveFallback handling.
    return { ok: false, status: 0, body: null };
  }

  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body };
}
