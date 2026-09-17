import { ClickupStatusBanner } from '@/components/ClickupStatusBanner';
import { MoreMenu } from '@/components/MoreMenu';
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
            hamburger, so this would just duplicate them. Right padding
            is deliberately smaller than the left (pr-4/md:pr-5 vs
            pl-6/md:pl-8) - matching the left's larger px-8 on both sides
            left a lot of dead space after the last icon, disproportionate
            to the gap-3 between the icons themselves. */}
        <div className="hidden items-center justify-end gap-1.5 border-b border-line py-3 pl-6 pr-4 md:flex md:pl-8 md:pr-5">
          <ThemeToggle />
          {currentAdmin && <ProfileButton admin={currentAdmin} />}
          {currentAdmin?.role === 'ADMIN' && <MoreMenu />}
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
