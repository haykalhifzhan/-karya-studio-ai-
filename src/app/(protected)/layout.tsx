'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { OnboardingTour } from '@/components/features/onboarding/OnboardingTour';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { useSyncUserWithConvex } from '@/stores/userStore';
import { LanguageProvider } from '@/contexts/LanguageContext';  // ✅ Import LanguageProvider

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { sidebarOpen } = useAppStore();

  // Sync user data dengan Convex
  useSyncUserWithConvex();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn, router]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    // ✅ WRAP dengan LanguageProvider
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div
          className={cn(
            'flex flex-1 flex-col overflow-hidden transition-all duration-300',
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          )}
        >
          <Navbar />
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
            <div className="animate-fade-in p-4 lg:p-6">{children}</div>
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <MobileNav />

        {/* Onboarding Tour */}
        <OnboardingTour />
      </div>
    </LanguageProvider>
  );
}