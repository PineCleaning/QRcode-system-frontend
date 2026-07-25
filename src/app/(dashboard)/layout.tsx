import Link from 'next/link';
import { logout } from '../login/actions';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <div className="mb-6 text-sm font-semibold text-gray-900">Pine Cleaning Admin</div>
        <nav className="space-y-1">
          <Link prefetch={false} href="/clients" className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Clients
          </Link>
        </nav>
        <form action={logout} className="mt-8">
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
