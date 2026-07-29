export interface SkeletonColumn {
  label: string;
  width: string;
  align?: 'left' | 'center';
}

const FEEDBACK_COLUMNS: SkeletonColumn[] = [
  { label: 'Client', width: 'w-24' },
  { label: 'Site', width: 'w-28' },
  { label: 'Feedback', width: 'w-full max-w-xs' },
  { label: 'Mobile', width: 'w-20' },
  { label: 'Attachments', width: 'w-16' },
  { label: 'Status', width: 'w-20', align: 'center' },
];

export function TableRowsSkeleton({
  rows = 6,
  columns = FEEDBACK_COLUMNS,
  minWidth = 880,
}: {
  rows?: number;
  columns?: SkeletonColumn[];
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-[26px] border border-line bg-surface shadow-sm">
      <table className="w-full text-left text-[13.5px]" style={{ minWidth }}>
        <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.label} className={`whitespace-nowrap px-5.5 py-4 ${col.align === 'center' ? 'text-center' : ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-line last:border-0">
              {columns.map((col, c) => (
                <td key={c} className={`px-5.5 py-4 ${col.align === 'center' ? 'text-center' : ''}`}>
                  <div className={`h-3.5 animate-pulse rounded-full bg-line/70 ${col.width} ${col.align === 'center' ? 'mx-auto' : ''}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
