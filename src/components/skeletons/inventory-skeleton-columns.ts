import type { SkeletonColumn } from './TableRowsSkeleton';

/** Shared between the global Inventory page's loading.tsx and its filter-transition skeleton, so both match the real table's columns exactly. */
export const INVENTORY_SKELETON_COLUMNS: SkeletonColumn[] = [
  { label: 'Client', width: 'w-24' },
  { label: 'Site', width: 'w-24' },
  { label: 'Item', width: 'w-28' },
  { label: 'Type', width: 'w-28' },
  { label: 'Status', width: 'w-20' },
  { label: 'Quantity', width: 'w-10' },
  { label: 'Last Supplied', width: 'w-20' },
  { label: 'Notes', width: 'w-full max-w-xs' },
  { label: 'Last Updated', width: 'w-24' },
  { label: 'Actions', width: 'w-16' },
];
