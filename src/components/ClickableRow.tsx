'use client';

import { useRouter } from 'next/navigation';

/**
 * Wraps a <tr> to make the whole row navigate to `href`, without
 * hijacking clicks on interactive elements already inside it (the Edit
 * modal trigger, Deactivate button, etc.) - those need to keep doing
 * their own thing, not also trigger a navigation underneath them.
 */
export function ClickableRow({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLTableRowElement>) {
    const target = e.target as HTMLElement;
    if (target.closest('a, button')) return;
    router.push(href);
  }

  return (
    <tr onClick={handleClick} className={`cursor-pointer ${className ?? ''}`}>
      {children}
    </tr>
  );
}
