import { FiltersSkeleton } from '@/components/skeletons/FiltersSkeleton';
import { HeaderSkeleton } from '@/components/skeletons/HeaderSkeleton';
import { COMPLETED_INSPECTIONS_SKELETON_COLUMNS } from '@/components/skeletons/completed-inspections-skeleton-columns';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton titleWidth="w-52" withBadge />
      <FiltersSkeleton />
      <TableRowsSkeleton columns={COMPLETED_INSPECTIONS_SKELETON_COLUMNS} minWidth={1040} />
    </div>
  );
}
