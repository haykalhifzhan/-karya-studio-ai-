'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';

export function Navbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();
  const { user } = useUserStore();

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/generate/photo') return 'Photo Generator';
    if (pathname === '/generate/video') return 'Video Generator';
    if (pathname === '/templates') return 'Templates';
    if (pathname === '/gallery') return 'Gallery';
    if (pathname === '/achievements') return 'Achievements';
    return 'KaryaStudio AI';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-400" />
        </Button>
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  );
}
