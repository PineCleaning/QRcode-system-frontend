/** Matches ClientForm/SiteForm's card: labeled inputs + Save/Cancel buttons. */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="max-w-md space-y-4 rounded-[26px] border border-line bg-surface p-6 shadow-sm">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="mb-2 h-3.5 w-24 animate-pulse rounded-full bg-line/70" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-line/40" />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <div className="h-9 w-28 animate-pulse rounded-xl bg-line/70" />
        <div className="h-9 w-20 animate-pulse rounded-xl bg-line/40" />
      </div>
    </div>
  );
}
