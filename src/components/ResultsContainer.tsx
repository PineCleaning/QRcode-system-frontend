'use client';

import type { ReactNode } from 'react';
import { useFilterPending } from './FilterPending';

export function ResultsContainer({ skeleton, children }: { skeleton: ReactNode; children: ReactNode }) {
  const { isPending } = useFilterPending();
  return <>{isPending ? skeleton : children}</>;
}
