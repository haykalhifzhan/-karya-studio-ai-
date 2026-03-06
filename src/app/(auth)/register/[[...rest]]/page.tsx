'use client';

import { SignUp, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LiquidEther from '@/components/LiquidEther';

export default function RegisterPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#080010] p-12 flex-col justify-between relative overflow-hidden">
        {/* Liquid Ether Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <LiquidEther
            colors={['#5227FF', '#9333ea', '#8B19EE', '#c026d3']}
            color0="#5227FF" color1="#9333ea" color2="#8B19EE"
            mouseForce={60} cursorSize={180}
            autoDemo={false} dissipation={0.985} resolution={0.5}
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-2 text-white group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.3)] p-1">
              <img src="/logo-new.png" alt="KaryaStudio Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight">KaryaStudio AI</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
            Start creating with<br />
            <span style={{ color: '#e879f9', textShadow: '0 0 24px rgba(232,121,249,0.5)' }}>
              AI-powered tools
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md font-semibold leading-relaxed">
            Join thousands of creators who are transforming their ideas into reality with KaryaStudio AI.
          </p>
        </div>

        <div className="relative z-10 text-slate-400 text-sm font-light">
          © 2024 KaryaStudio AI. All rights reserved.
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] p-1">
                <img src="/logo-new.png" alt="KaryaStudio Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">KaryaStudio AI</span>
            </Link>
          </div>

          <SignUp
            redirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            signInUrl="/login"
            appearance={{
              elements: {
                card: "shadow-none bg-transparent",
                headerTitle: "text-2xl font-bold text-slate-900",
                headerSubtitle: "text-slate-500",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}