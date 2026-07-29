import { HeaderSkeleton } from '@/components/skeletons/HeaderSkeleton';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';

const SITES_COLUMNS = [
  { label: 'Site name', width: 'w-28' },
  { label: 'Address', width: 'w-32' },
  { label: 'Slug', width: 'w-36' },
  { label: 'Status', width: 'w-16' },
  { label: 'Actions', width: 'w-40' },
];

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton titleWidth="w-44" withSubtitle={false} actionWidths={['w-28']} />

      <div className="mb-4 flex items-center justify-between">
        <div className="h-5.5 w-14 animate-pulse rounded-full bg-line/70" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-line/60" />
      </div>

      <TableRowsSkeleton columns={SITES_COLUMNS} minWidth={760} />
    </div>
  );
}
