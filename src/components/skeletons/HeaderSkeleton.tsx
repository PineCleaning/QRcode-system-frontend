/** Matches the plain (no-card) page header pattern used across Clients/Feedback/Assets/Client Detail/Site Feedback. */
export function HeaderSkeleton({
  titleWidth = 'w-40',
  withSubtitle = true,
  withBadge = false,
  actionWidths = [],
}: {
  titleWidth?: string;
  withSubtitle?: boolean;
  withBadge?: boolean;
  actionWidths?: string[];
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className={`h-7 animate-pulse rounded-full bg-line/70 ${titleWidth}`} />
          {withBadge && <div className="h-5 w-6 animate-pulse rounded-full bg-line/60" />}
        </div>
        {withSubtitle && <div className="mt-2.5 h-3.5 w-56 animate-pulse rounded-full bg-line/50" />}
      </div>
      {actionWidths.length > 0 && (
        <div className="flex gap-2.5">
          {actionWidths.map((w, i) => (
            <div key={i} className={`h-9 animate-pulse rounded-xl bg-line/60 ${w}`} />
          ))}
        </div>
      )}
    </div>
  );
}
