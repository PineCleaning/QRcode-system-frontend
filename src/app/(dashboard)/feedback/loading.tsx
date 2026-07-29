import { FiltersSkeleton } from '@/components/skeletons/FiltersSkeleton';
import { HeaderSkeleton } from '@/components/skeletons/HeaderSkeleton';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton titleWidth="w-28" withBadge />
      <FiltersSkeleton />
      <TableRowsSkeleton />
    </div>
  );
}
