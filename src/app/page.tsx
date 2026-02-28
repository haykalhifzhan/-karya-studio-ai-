'use client';

import Link from 'next/link';
import { Camera, Video, Sparkles, LayoutTemplate, Upload, Palette, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Floating decorative element */}
            <div className="absolute -left-20 top-20 h-64 w-64 animate-float rounded-full bg-yellow-500/10 blur-3xl" />
            <div className="absolute -right-20 bottom-20 h-64 w-64 animate-float rounded-full bg-yellow-500/10 blur-3xl" style={{ animationDelay: '1s' }} />
            
            <h1 className="animate-fade-in-up mb-6 max-w-5xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Transform Your Products Into{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Professional Marketing Content
              </span>
            </h1>
            
            <p className="animate-fade-in-up mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl" style={{ animationDelay: '0.2s' }}>
              AI-powered tools designed specifically for Indonesian MSMEs. Create stunning product photos and cinematic videos in minutes, not hours.
            </p>
            
            <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '0.4s' }}>
              <Link href="/register">
                <Button className="h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 text-base font-semibold text-slate-900 transition-transform hover:scale-105 hover:from-yellow-500 hover:to-yellow-700">
                  Start Creating Free
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" className="h-12 border-2 border-yellow-500 bg-transparent px-8 text-base font-semibold text-yellow-500 transition-all hover:bg-yellow-500/10 hover:text-yellow-400">
                  See Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything You Need to Shine Online
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Powerful AI features that help your products stand out in the digital marketplace
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <Card className="group cursor-pointer border-slate-200 bg-white p-6 transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <Camera className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                Smart Product Photography
              </h3>
              <p className="text-slate-600">
                Transform simple product shots into professional marketing photos with AI-enhanced backgrounds and lighting
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="group cursor-pointer border-slate-200 bg-white p-6 transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <Video className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                Cinematic Promo Videos
              </h3>
              <p className="text-slate-600">
                Create engaging video content that captures attention and drives sales across social media platforms
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="group cursor-pointer border-slate-200 bg-white p-6 transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <Sparkles className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                AI Prompt Enhancer
              </h3>
              <p className="text-slate-600">
                Get better results with our intelligent prompt enhancement that understands your creative vision
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="group cursor-pointer border-slate-200 bg-white p-6 transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <LayoutTemplate className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                Ready-Made Templates
              </h3>
              <p className="text-slate-600">
                Choose from professionally designed templates tailored for Indonesian market trends and preferences
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Create professional marketing content in three simple steps
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-3xl font-bold text-slate-900">
                1
              </div>
              <div className="mb-4 flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                  <Upload className="h-8 w-8 text-slate-700" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Upload or Describe
              </h3>
              <p className="text-slate-600">
                Upload your product photo or simply describe what you want to create with text
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-3xl font-bold text-slate-900">
                2
              </div>
              <div className="mb-4 flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                  <Palette className="h-8 w-8 text-slate-700" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Choose Style & Customize
              </h3>
              <p className="text-slate-600">
                Select from various styles and templates, then customize to match your brand
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-3xl font-bold text-slate-900">
                3
              </div>
              <div className="mb-4 flex justify-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                  <Download className="h-8 w-8 text-slate-700" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                Download Professional Content
              </h3>
              <p className="text-slate-600">
                Get your professional marketing content ready to share in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold text-yellow-500 sm:text-5xl">
                1,000+
              </div>
              <div className="text-lg text-slate-300">Photos Generated</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-yellow-500 sm:text-5xl">
                500+
              </div>
              <div className="text-lg text-slate-300">MSMEs Helped</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-yellow-500 sm:text-5xl">
                25+
              </div>
              <div className="text-lg text-slate-300">Templates Available</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-yellow-500 sm:text-5xl">
                9
              </div>
              <div className="text-lg text-slate-300">Achievements Unlocked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mb-8 text-lg text-slate-800 sm:text-xl">
            Join hundreds of Indonesian MSMEs already creating professional marketing content with KaryaStudio AI
          </p>
          <Link href="/register">
            <Button className="h-14 bg-slate-900 px-10 text-lg font-semibold text-white transition-transform hover:scale-105 hover:bg-slate-800">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="mb-2 text-xl font-bold text-white">
                KaryaStudio AI
              </div>
              <p className="text-sm text-slate-400">
                Empowering Indonesian MSMEs with AI-powered content creation
              </p>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/about" className="transition-colors hover:text-yellow-500">
                About
              </Link>
              <Link href="/templates" className="transition-colors hover:text-yellow-500">
                Templates
              </Link>
              <Link href="/pricing" className="transition-colors hover:text-yellow-500">
                Pricing
              </Link>
              <Link href="/contact" className="transition-colors hover:text-yellow-500">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} KaryaStudio AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
