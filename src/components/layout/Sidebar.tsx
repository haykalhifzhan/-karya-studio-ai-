'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import { useClerk } from '@clerk/nextjs';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Images,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Trophy,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate/photo', label: 'Photo Generator', icon: Camera },
  { href: '/generate/video', label: 'Video Generator', icon: Video },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate },
  { href: '/gallery', label: 'Gallery', icon: Images },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user, logout } = useUserStore();

  const handleLogout = async () => {
    await signOut({ redirectUrl: '/login' });
    logout();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col transition-all duration-300',
        'border-r border-white/5',
        'bg-gradient-to-b from-[#0a0c1a] via-[#0d0f20] to-[#080a15]',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-white/5">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center">
              <img
                src="/logo-new.png"
                alt="KaryaStudio Logo"
                width={36}
                height={36}
                className="rounded-xl object-contain bg-white p-0.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.7)] transition-all duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-white">KaryaStudio</span>
              <span className="text-[10px] text-purple-400/70 leading-tight font-medium tracking-wide">AI Studio</span>
            </div>
          </Link>
        )}
        {!sidebarOpen && (
          <div className="mx-auto">
            <img
              src="/logo-new.png"
              alt="KaryaStudio Logo"
              width={32}
              height={32}
              className="rounded-xl object-contain bg-white p-0.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            />
          </div>
        )}
        {sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
            onClick={toggleSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Toggle when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-5 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 shadow-lg shadow-purple-500/30 hover:bg-purple-400 transition-colors"
        >
          <ChevronRight className="h-3 w-3 text-white" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/10 text-purple-400 border border-purple-500/20 shadow-inner'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5 border border-transparent'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors duration-200',
                  isActive ? 'text-purple-400' : 'text-white/40 group-hover:text-white/70'
                )}
              />
              {sidebarOpen && (
                <span className={cn(isActive ? 'text-purple-300' : '')}>{item.label}</span>
              )}
              {/* Active indicator dot */}
              {isActive && sidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/5 p-2 space-y-1">
        {/* User info */}
        {sidebarOpen && user && (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-xs font-bold text-white shadow-md shadow-purple-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/90 truncate">{user.name}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {!sidebarOpen && user && (
          <div className="flex items-center justify-center py-1 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-xs font-bold text-white shadow-md shadow-purple-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            'w-full text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200',
            !sidebarOpen && 'px-0 justify-center'
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span className="ml-2 text-sm">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
