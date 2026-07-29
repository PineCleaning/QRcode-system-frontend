const COLUMN_WIDTHS = ['w-24', 'w-28', 'w-full max-w-xs', 'w-20', 'w-16', 'w-20'];

export function TableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-[26px] border border-line bg-surface shadow-sm">
      <table className="w-full min-w-[880px] text-left text-[13.5px]">
        <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="whitespace-nowrap px-5.5 py-4">Client</th>
            <th className="whitespace-nowrap px-5.5 py-4">Site</th>
            <th className="px-5.5 py-4">Feedback</th>
            <th className="whitespace-nowrap px-5.5 py-4">Mobile</th>
            <th className="whitespace-nowrap px-5.5 py-4">Attachments</th>
            <th className="whitespace-nowrap px-5.5 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-line last:border-0">
              {COLUMN_WIDTHS.map((widthClass, c) => (
                <td key={c} className="px-5.5 py-4">
                  <div className={`h-3.5 animate-pulse rounded-full bg-line/70 ${widthClass}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
