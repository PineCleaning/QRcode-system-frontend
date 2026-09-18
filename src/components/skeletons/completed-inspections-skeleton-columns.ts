import type { SkeletonColumn } from './TableRowsSkeleton';

/** Shared between the global Completed Inspections page's loading.tsx and its filter-transition skeleton, so both match the real table's columns exactly. */
export const COMPLETED_INSPECTIONS_SKELETON_COLUMNS: SkeletonColumn[] = [
  { label: 'Client', width: 'w-24' },
  { label: 'Site', width: 'w-24' },
  { label: 'Inspected By', width: 'w-24' },
  { label: 'Completed', width: 'w-24' },
  { label: 'Spaces', width: 'w-10' },
  { label: 'Average', width: 'w-14' },
  { label: 'Standard', width: 'w-20' },
  { label: 'Actions', width: 'w-16' },
];
