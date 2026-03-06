'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, Bell, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from '@/components/language-switcher';  // ✅ Import LanguageSwitcher
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '@/stores/userStore';
import { useLanguage } from '@/contexts/LanguageContext';  // ✅ Import useLanguage

export function Navbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();
  const { user } = useUserStore();
  const { t, language } = useLanguage();  // ✅ Ambil translation function

  const getPageTitle = () => {
    if (pathname === '/dashboard') return language === 'id' ? 'Dashboard' : 'Dashboard';
    if (pathname === '/generate/photo') return language === 'id' ? 'Generator Foto' : 'Photo Generator';
    if (pathname === '/generate/video') return language === 'id' ? 'Generator Video' : 'Video Generator';
    if (pathname === '/templates') return language === 'id' ? 'Template' : 'Templates';
    if (pathname === '/gallery') return language === 'id' ? 'Galeri' : 'Gallery';
    if (pathname === '/achievements') return language === 'id' ? 'Pencapaian' : 'Achievements';
    return 'KaryaStudio AI';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 backdrop-blur-xl lg:px-6" style={{ background: 'rgba(10,12,26,0.85)', borderBottom: '1px solid rgba(251,191,36,0.08)', boxShadow: '0 1px 0 rgba(251,191,36,0.05)' }}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden text-white/50 hover:text-white hover:bg-white/5"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-white/90">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative text-white/50 hover:text-white hover:bg-white/5 rounded-xl">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
        </Button>

        {/* ✅ Language Switcher - Tambah di sini */}
        <LanguageSwitcher />

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* User Profile */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-1.5 hover:border-purple-500/20 transition-all duration-200">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-xs font-bold text-white shadow-sm shadow-purple-500/20">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-white/80">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  );
}
