import { ClickupStatusBanner } from '@/components/ClickupStatusBanner';
import { ProfileButton } from '@/components/ProfileButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getCurrentAdmin } from '@/lib/api/current-admin';
import { DashboardNav } from './DashboardNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentAdmin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-page text-ink md:flex">
      <DashboardNav role={currentAdmin?.role} admin={currentAdmin} />
      <div className="flex flex-1 flex-col">
        <ClickupStatusBanner />
        {/* Desktop-only top strip - on mobile the toggle/profile button
            already live in DashboardNav's own top bar next to the
            hamburger, so this would just duplicate them. */}
        <div className="hidden items-center justify-end gap-3 border-b border-line px-6 py-3 md:flex md:px-8">
          <ThemeToggle />
          {currentAdmin && <ProfileButton admin={currentAdmin} />}
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
