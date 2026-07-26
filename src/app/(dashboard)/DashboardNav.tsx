'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logout } from '../login/actions';

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <nav className="space-y-1">
        <Link
          prefetch={false}
          href="/clients"
          onClick={onNavigate}
          className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Clients
        </Link>
      </nav>
      <form action={logout} className="mt-8">
        <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">
          Sign out
        </button>
      </form>
    </>
  );
}

export function DashboardNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar - hidden on md+ where the persistent sidebar takes over */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <span className="text-sm font-semibold text-gray-900">Pine Cleaning Admin</span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
      </header>

      {/* Mobile slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white p-4 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Pine Cleaning Admin</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Persistent desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white p-4 md:block">
        <div className="mb-6 text-sm font-semibold text-gray-900">Pine Cleaning Admin</div>
        <NavLinks />
      </aside>
    </>
  );
}
