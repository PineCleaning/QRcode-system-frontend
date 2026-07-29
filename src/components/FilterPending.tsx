'use client';

import { createContext, useContext, useTransition, type ReactNode, type TransitionStartFunction } from 'react';

const FilterPendingContext = createContext<{ isPending: boolean; startTransition: TransitionStartFunction } | null>(
  null,
);

// Shared between the filter selects and the results area (siblings under the
// same server-rendered page) so selecting a filter can show a skeleton where
// the table/grid was, instead of nothing happening for the ~1s DB round trip.
export function FilterPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return <FilterPendingContext.Provider value={{ isPending, startTransition }}>{children}</FilterPendingContext.Provider>;
}

export function useFilterPending() {
  const ctx = useContext(FilterPendingContext);
  if (!ctx) throw new Error('useFilterPending must be used within a FilterPendingProvider');
  return ctx;
}
