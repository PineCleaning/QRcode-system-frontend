import type { SelectOption } from '@/components/Select';
import type { InspectionRating } from '@/lib/api/types';

/** Mirrors backend/src/inspections/inspections.service.ts RATING_RANGES exactly - confirmed 2026-09-05 (Discovery doc §1.5). */
export const RATING_RANGES: Record<InspectionRating, [number, number]> = {
  EXCELLENT: [95, 100],
  ABOVE_AVERAGE: [85, 94],
  AVERAGE: [65, 84],
  BELOW_AVERAGE: [40, 64],
  VERY_POOR: [0, 39],
};

export const RATING_LABELS: Record<InspectionRating, string> = {
  EXCELLENT: 'Excellent',
  ABOVE_AVERAGE: 'Above Average',
  AVERAGE: 'Average',
  BELOW_AVERAGE: 'Below Average',
  VERY_POOR: 'Very Poor',
};

export const RATING_OPTIONS: SelectOption[] = (Object.keys(RATING_LABELS) as InspectionRating[]).map((value) => ({
  value,
  label: `${RATING_LABELS[value]} (${RATING_RANGES[value][0]}-${RATING_RANGES[value][1]}%)`,
}));

export const RATING_BADGE_STYLES: Record<InspectionRating, string> = {
  EXCELLENT: 'bg-green/15 text-green',
  ABOVE_AVERAGE: 'bg-green/15 text-green',
  AVERAGE: 'bg-amber-500/15 text-amber-600',
  BELOW_AVERAGE: 'bg-orange-500/15 text-orange-600',
  VERY_POOR: 'bg-coral/15 text-coral',
};
