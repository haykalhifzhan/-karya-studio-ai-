'use client';
import { SignIn, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LiquidEther from '@/components/LiquidEther';

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return null;
  if (isSignedIn) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Hidden on mobile) */}
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
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            Welcome back to your<br />
            <span className="text-[#d946ef] py-2">
              creative workspace
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md font-light leading-relaxed">
            Continue your journey with AI-powered content creation. Your projects are waiting.
          </p>
        </div>

        <div className="relative z-10 text-slate-400 text-sm font-light">
          © 2026 KaryaStudio AI. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.3)] p-1">
                <img src="/logo-new.png" alt="KaryaStudio Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">KaryaStudio AI</span>
            </Link>
          </div>

          <SignIn
            redirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            signInUrl="/register"
            appearance={{
              elements: {
                card: "shadow-none bg-transparent",
                headerTitle: "text-2xl font-bold text-slate-900",
                headerSubtitle: "text-slate-500",
              }
            }}
          />

          <p className="mt-8 text-center text-xs text-slate-500">
            By signing in, you agree to our{' '}
            <Link href="" className="underline hover:text-slate-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="" className="underline hover:text-slate-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
