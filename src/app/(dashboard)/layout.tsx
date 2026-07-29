import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardNav } from './DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page text-ink md:flex">
      <DashboardNav />
      <div className="flex flex-1 flex-col">
        {/* Desktop-only top strip - on mobile the toggle already lives in
            DashboardNav's own top bar next to the hamburger, so this
            would just duplicate it. */}
        <div className="hidden justify-end border-b border-line px-6 py-3 md:flex md:px-8">
          <ThemeToggle />
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
