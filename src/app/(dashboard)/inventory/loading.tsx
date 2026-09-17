import { FiltersSkeleton } from '@/components/skeletons/FiltersSkeleton';
import { HeaderSkeleton } from '@/components/skeletons/HeaderSkeleton';
import { INVENTORY_SKELETON_COLUMNS } from '@/components/skeletons/inventory-skeleton-columns';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton titleWidth="w-40" withBadge />
      <FiltersSkeleton />
      <TableRowsSkeleton columns={INVENTORY_SKELETON_COLUMNS} minWidth={1100} />
    </div>
  );
}
