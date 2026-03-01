'use client';
import { SignIn, useAuth } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-2 text-white group">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-slate-900" />
            </div>
            <span className="text-2xl font-bold">KaryaStudio AI</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Welcome back to your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
              creative workspace
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md">
            Continue your journey with AI-powered content creation. Your projects are waiting.
          </p>
        </div>

        <div className="relative z-10 text-slate-400 text-sm">
          © 2024 KaryaStudio AI. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-slate-900" />
              </div>
              <span className="text-2xl font-bold text-slate-900">KaryaStudio AI</span>
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
