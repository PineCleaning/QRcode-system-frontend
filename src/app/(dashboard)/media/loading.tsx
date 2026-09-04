import { CardGridSkeleton } from '@/components/skeletons/CardGridSkeleton';
import { FiltersSkeleton } from '@/components/skeletons/FiltersSkeleton';
import { HeaderSkeleton } from '@/components/skeletons/HeaderSkeleton';

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton titleWidth="w-20" withBadge />
      <FiltersSkeleton />
      <CardGridSkeleton />
    </div>
  );
}
