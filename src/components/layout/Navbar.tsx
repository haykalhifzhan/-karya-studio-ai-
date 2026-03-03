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
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-400" />
        </Button>
        
        {/* ✅ Language Switcher - Tambah di sini */}
        <LanguageSwitcher />
        
        {/* Dark Mode Toggle */}
        <ThemeToggle />
        
        {/* User Profile */}
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