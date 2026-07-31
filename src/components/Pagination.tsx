import Link from 'next/link';

/** Reused by every paginated list (Clients, Feedback, a client's Sites table). */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  itemLabel,
  buildHref,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  itemLabel: string;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5.5 py-4 sm:flex-row">
      <p className="text-[12.5px] text-ink-muted">
        Showing{' '}
        <span className="font-bold text-ink">
          {rangeStart}–{rangeEnd}
        </span>{' '}
        of <span className="font-bold text-ink">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-3">
        <Link
          prefetch={false}
          aria-label="Previous page"
          aria-disabled={page <= 1}
          href={page <= 1 ? '#' : buildHref(page - 1)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-page text-ink transition ${
            page <= 1 ? 'pointer-events-none opacity-40' : 'hover:-translate-y-px hover:bg-line/40'
          }`}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <span className="min-w-[90px] text-center text-[12.5px] font-bold text-ink-muted">
          Page {page} of {totalPages}
        </span>

        <Link
          prefetch={false}
          aria-label="Next page"
          aria-disabled={page >= totalPages}
          href={page >= totalPages ? '#' : buildHref(page + 1)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-page text-ink transition ${
            page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:-translate-y-px hover:bg-line/40'
          }`}
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
