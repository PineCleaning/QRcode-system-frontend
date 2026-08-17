import Link from 'next/link';
import { getClickupStatusSafe } from '@/lib/api/clickup';

/**
 * Renders nothing unless ClickUp needs reconnecting - a personal API
 * token got revoked/regenerated in ClickUp, or otherwise stopped
 * working (see backend's ClickupService.runClickupCall /
 * ClickupConnectionService.markReconnectRequired). Shown on every
 * dashboard page (mounted in (dashboard)/layout.tsx) because real
 * customer feedback stops reaching ClickUp for as long as this goes
 * unnoticed - the exact silent failure that happened 2026-08-14 to
 * 2026-08-17 before this existed.
 */
export async function ClickupStatusBanner() {
  const status = await getClickupStatusSafe();
  if (!status?.needsReconnect) return null;

  return (
    <div className="border-b border-coral/30 bg-coral/10 px-4 py-2.5 sm:px-6 md:px-8">
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
