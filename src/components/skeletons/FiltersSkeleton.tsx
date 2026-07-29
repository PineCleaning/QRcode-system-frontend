/** Matches FeedbackFilters' Client/Site dropdown pair. */
export function FiltersSkeleton() {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="w-full sm:w-56">
          <div className="mb-1 h-3 w-12 animate-pulse rounded-full bg-line/60" />
          <div className="h-[38px] w-full animate-pulse rounded-xl bg-line/40" />
        </div>
      ))}
    </div>
  );
}
