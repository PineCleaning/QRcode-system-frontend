import { HeaderSkeleton } from '@/components/skeletons/HeaderSkeleton';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';

const SITE_FEEDBACK_COLUMNS = [
  { label: 'Date', width: 'w-28' },
  { label: 'Feedback', width: 'w-full max-w-xs' },
  { label: 'Mobile', width: 'w-24' },
  { label: 'Attachments', width: 'w-16' },
  { label: 'Status', width: 'w-20', align: 'center' as const },
];

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton titleWidth="w-24" withBadge actionWidths={['w-32']} />
      <TableRowsSkeleton columns={SITE_FEEDBACK_COLUMNS} minWidth={720} />
    </div>
  );
}
