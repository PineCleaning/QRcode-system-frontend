const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/** For the public feedback form - no session, no Authorization header. Matches the backend's public (unguarded) endpoints. */
export async function publicFetch<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T | null }> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  });

  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body };
}
