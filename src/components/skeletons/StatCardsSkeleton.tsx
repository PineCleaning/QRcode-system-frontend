/** Matches the Clients page's hero card + 4 mini stat cards grid. */
export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      <div className="col-span-2 row-span-2 flex flex-col justify-between rounded-[26px] border border-line bg-surface p-6.5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-line/70" />
        <div className="h-11 w-16 animate-pulse rounded-full bg-line/70" />
        <div className="h-3 w-36 animate-pulse rounded-full bg-line/50" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="col-span-2 flex items-center gap-3.5 rounded-[26px] border border-line bg-surface p-4.5 sm:col-span-1">
          <div className="h-9.5 w-9.5 shrink-0 animate-pulse rounded-[11px] bg-line/60" />
          <div className="flex-1">
            <div className="h-5 w-8 animate-pulse rounded-full bg-line/70" />
            <div className="mt-1.5 h-2.5 w-16 animate-pulse rounded-full bg-line/50" />
          </div>
        </div>
      ))}
    </div>
  );
}
