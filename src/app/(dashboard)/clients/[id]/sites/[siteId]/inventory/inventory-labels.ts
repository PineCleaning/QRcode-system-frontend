import type { InventoryCategory, InventoryStatus } from '@/lib/api/types';

/** Confirmed with the user 2026-09-02 - exact wording for both dropdowns. */
export const STATUS_LABELS: Record<InventoryStatus, string> = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  URGENT_LOW_STOCK: 'Urgent Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  GOOD: 'Good',
  NEEDS_REPAIR: 'Need Repair',
  OUT_OF_SERVICE: 'Out of Service',
};

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  CHEMICAL: 'Chemical',
  PPE: 'PPE',
  CONSUMABLES: 'Consumables (Paper & Disposables)',
  CLEANING_TOOLS_MANUAL: 'Cleaning Tools (Manual)',
  POWERED_EQUIPMENT_MACHINERY: 'Powered Equipment / Machinery',
  SPARE_PARTS: 'Spare Parts',
  OTHER: 'Other',
};

export const STATUS_OPTIONS = (Object.entries(STATUS_LABELS) as [InventoryStatus, string][]).map(([value, label]) => ({
  value,
  label,
}));

export const CATEGORY_OPTIONS = (Object.entries(CATEGORY_LABELS) as [InventoryCategory, string][]).map(([value, label]) => ({
  value,
  label,
}));

/** Status badge tone - low/urgent/repair/out-of-service read as attention-needed, the rest as neutral/positive. */
export const STATUS_BADGE_STYLES: Record<InventoryStatus, string> = {
  IN_STOCK: 'bg-green/15 text-green',
  GOOD: 'bg-green/15 text-green',
  LOW_STOCK: 'bg-amber/15 text-amber',
  URGENT_LOW_STOCK: 'bg-coral/15 text-coral',
  OUT_OF_STOCK: 'bg-coral/15 text-coral',
  NEEDS_REPAIR: 'bg-coral/15 text-coral',
  OUT_OF_SERVICE: 'bg-ink-muted/15 text-ink-muted',
};
