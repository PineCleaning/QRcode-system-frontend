'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ClickupStatus } from '@/lib/api/types';

const POLL_INTERVAL_MS = 30_000;

/**
 * Renders nothing unless ClickUp needs reconnecting - a personal API
 * token got revoked/regenerated in ClickUp, or otherwise stopped
 * working (see backend's ClickupService.runClickupCall /
 * ClickupConnectionService.markReconnectRequired).
 *
 * Client-side and polling, NOT a server-rendered part of the shared
 * layout (which is what this used to be) - Next's client Router Cache
 * reuses the layout's rendered output across same-layout navigations,
 * so a server-rendered banner only ever reflected whatever the
 * connection status was the last time the layout happened to
 * re-render. Since the actual disconnect is flipped by the backend's
 * cron (RetryWorkerService/FeedbackReconciliationService), completely
 * outside any Next.js request, there's no navigation event to hang a
 * revalidatePath() off of - polling is the only way this stays
 * accurate without requiring a hard refresh. Confirmed broken in
 * practice 2026-08-17: the /settings/clickup page (a real page
 * segment, always refetched) correctly showed "Disconnected", but
 * this banner (living in the cached layout) still didn't appear.
 */
export function ClickupStatusBanner() {
  const [status, setStatus] = useState<ClickupStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('/api/clickup-status', { cache: 'no-store' });
        if (!res.ok) return;
        const body = (await res.json()) as ClickupStatus;
        if (!cancelled) setStatus(body);
      } catch {
        // Transient fetch failure - keep showing whatever the last good status was rather than flicker.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!status?.needsReconnect) return null;

  return (
    <div className="sticky top-0 z-30 border-b border-coral/30 bg-coral/10 px-4 py-2.5 sm:px-6 md:px-8">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <p className="text-[13px] font-semibold text-ink">
          <span aria-hidden className="mr-1.5">
            ⚠
          </span>
          ClickUp is disconnected — feedback isn&apos;t syncing.
        </p>
        <Link
          prefetch={false}
          href="/settings/clickup"
          className="shrink-0 rounded-lg bg-coral px-3 py-1.5 text-[12px] font-bold text-page hover:opacity-90"
        >
          Reconnect →
        </Link>
      </div>
    </div>
  );
}
