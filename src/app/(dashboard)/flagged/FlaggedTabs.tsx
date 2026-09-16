'use client';

import { useState, type ReactNode } from 'react';

type Tab = 'feedback' | 'items';

/**
 * Client-side tab switcher for the Flagged page - both tables are already
 * fetched/rendered server-side (see page.tsx), this just toggles which one
 * is visible so there's no extra round trip on tab switch. Defaults to
 * "Flagged Inspection Items" per the client's request (that's the more
 * actively-used surface today).
 */
export function FlaggedTabs({
  feedbackCount,
  itemsCount,
  feedbackContent,
  itemsContent,
}: {
  feedbackCount: number;
  itemsCount: number;
  feedbackContent: ReactNode;
  itemsContent: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>('items');

  return (
    <div>
      <div role="tablist" className="mb-5 flex gap-1 border-b border-line">
        <TabButton label="Flagged Feedback" count={feedbackCount} active={tab === 'feedback'} onClick={() => setTab('feedback')} />
        <TabButton label="Flagged Inspection Items" count={itemsCount} active={tab === 'items'} onClick={() => setTab('items')} />
      </div>
      <div role="tabpanel" hidden={tab !== 'feedback'}>
        {feedbackContent}
      </div>
      <div role="tabpanel" hidden={tab !== 'items'}>
        {itemsContent}
      </div>
    </div>
  );
}

function TabButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-[13.5px] font-bold transition ${
        active ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'
      }`}
    >
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${active ? 'bg-ink text-page' : 'bg-ink/10 text-ink-muted'}`}
      >
        {count}
      </span>
    </button>
  );
}
