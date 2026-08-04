import { HeaderSkeleton } from '@/components/skeletons/HeaderSkeleton';
import { StatCardsSkeleton } from '@/components/skeletons/StatCardsSkeleton';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';

const CLIENTS_COLUMNS = [
  { label: 'Name', width: 'w-28' },
  { label: 'Client ID', width: 'w-32' },
  { label: 'Sites', width: 'w-8' },
  { label: 'Status', width: 'w-16' },
  { label: 'Actions', width: 'w-32' },
];

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton titleWidth="w-24" actionWidths={['w-28', 'w-32']} />
      <StatCardsSkeleton />
      <div className="mt-6">
        <TableRowsSkeleton columns={CLIENTS_COLUMNS} minWidth={640} />
      </div>
    </div>
  );
}
