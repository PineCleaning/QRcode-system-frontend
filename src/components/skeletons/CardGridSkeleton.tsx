export function CardGridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-[22px] border border-line bg-surface p-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-line/70" />
          <div className="mt-2 h-3.5 w-3/4 animate-pulse rounded-full bg-line/70" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-line/50" />
        </div>
      ))}
    </div>
  );
}
