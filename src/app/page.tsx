'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera, Video, Sparkles, LayoutTemplate,
  Upload, Palette, Download, ArrowRight, Zap, Star, TrendingUp, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LiquidEther from '@/components/LiquidEther';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';

/* ─── Tokens ─────────────────────────────────────────────── */
const SECTION_PAD = 'py-40 lg:py-64';
const CONTAINER = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

/* ─── Scroll-reveal wrapper ─────────────────────────────── */
type AnimType = 'fade-up' | 'fade-scale' | 'fade-blur' | 'fade-left' | 'fade-right';

function Reveal({
  children, delay = 0, className = '', animation = 'fade-up',
}: { children: React.ReactNode; delay?: number; className?: string; animation?: AnimType }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const variants: Record<AnimType, string> = {
    'fade-up': isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
    'fade-scale': isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
    'fade-blur': isVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-md',
    'fade-left': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
    'fade-right': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
  };
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${variants[animation]} ${className}`}>
      {children}
    </div>
  );
}

/* ─── Section label pill ─────────────────────────────────── */
function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm px-4 py-2 mt-8 lg:mt-12 mb-10">
      <Icon className="h-3.5 w-3.5 text-purple-400 fill-purple-400" />
      <span className="text-xs font-semibold text-purple-300 tracking-widest uppercase">{text}</span>
    </div>
  );
}

/* ─── Section heading block ──────────────────────────────── */
function SectionHeading({ title, subtitle, gradient }: { title: React.ReactNode; subtitle: string; gradient?: string }) {
  return (
    <div className="mb-10 lg:mb-16 text-center max-w-3xl mx-auto">
      <h2 className="mb-6 lg:mb-8 text-4xl font-black text-white sm:text-5xl lg:text-6xl tracking-tight leading-tight py-2">
        {title}
      </h2>
      <p className="text-xl text-slate-300 font-light leading-[1.75] max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

/* ─── Animated counter ───────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const { ref, isVisible } = useScrollAnimation();
  const count = useCountUp(target, 2200, isVisible);
  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

/* ─── Feature card ───────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, blobColor, delay = 0 }: {
  icon: React.ElementType; title: string; description: string;
  blobColor: string; delay?: number;
}) {
  return (
    <Reveal delay={delay} animation="fade-scale">
      <div className="group relative h-full rounded-3xl overflow-hidden border border-white/[0.12] border-t-white/25 border-l-white/20 backdrop-blur-2xl bg-white/[0.03] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-3 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* Blob */}
        <div className={`absolute -top-14 -left-14 w-44 h-44 rounded-full blur-3xl ${blobColor} opacity-50 group-hover:opacity-80 group-hover:scale-125 transition-all duration-700 pointer-events-none`} />
        <div className={`absolute -bottom-14 -right-14 w-36 h-36 rounded-full blur-3xl ${blobColor} opacity-30 group-hover:opacity-55 group-hover:scale-110 transition-all duration-700 pointer-events-none`} />

        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Icon className="h-6 w-6 text-white/90" />
          </div>
          <h3 className="mb-4 text-xl font-bold text-white tracking-tight leading-snug">{title}</h3>
          <p className="text-slate-300 font-light leading-[1.75] text-[0.94rem] flex-1">{description}</p>
          <div className="mt-6 flex items-center gap-1 text-sm text-purple-400/80 group-hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="font-medium">Learn more</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Step card ──────────────────────────────────────────── */
function StepCard({ step, icon: Icon, title, description, badgeColor, delay = 0 }: {
  step: number; icon: React.ElementType; title: string;
  description: string; badgeColor: string; delay?: number;
}) {
  return (
    <Reveal delay={delay} animation="fade-up">
      <div className="group relative h-full rounded-3xl overflow-hidden border border-white/[0.12] backdrop-blur-2xl bg-white/[0.03] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-3 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-center">
        {/* Step badge */}
        <div className={`mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-black shadow-[0_0_24px_rgba(139,92,246,0.4)] group-hover:scale-110 transition-transform duration-500`} style={{ background: badgeColor }}>{step}</div>

        {/* Icon */}
        <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/15 transition-all duration-500 group-hover:bg-white/[0.10] group-hover:border-white/25">
          <Icon className="h-9 w-9 text-white/75 group-hover:text-white transition-colors duration-500" />
        </div>

        <h3 className="mb-4 text-xl font-bold text-white tracking-tight">{title}</h3>
        <p className="text-slate-300 font-light leading-[1.75] text-[0.94rem]">{description}</p>
      </div>
    </Reveal>
  );
}

/* ─── Animated AI Studio Component ─────────────────────────── */
function AnimatedAIStudioMockup() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setPhase('idle');
      setProgress(0);
      return;
    }

    if (phase === 'idle') {
      const t = setTimeout(() => setPhase('scanning'), 800);
      return () => clearTimeout(t);
    }

    if (phase === 'scanning') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setPhase('done');
            return 100;
          }
          return p + 1.5; // Controls scanning speed
        });
      }, 40); // 100 / 1.5 * 40ms = approx 2.6 seconds
      return () => clearInterval(interval);
    }

    if (phase === 'done') {
      const t = setTimeout(() => {
        setPhase('idle');
        setProgress(0);
      }, 5000); // Hold final result before looping
      return () => clearTimeout(t);
    }
  }, [isVisible, phase]);

  const activeStep = phase === 'idle' ? -1 : phase === 'done' ? 3 : (progress < 33 ? 0 : progress < 66 ? 1 : 2);

  return (
    <div ref={ref} className="p-5 space-y-6">
      {/* Header and Subtitle */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-white">AI Studio</div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-[90%]">
          Upload a product photo and let AI automatically enhance background, lighting, and style to create professional marketing visuals.
        </p>
      </div>

      {/* Image comparison */}
      <div className="grid grid-cols-2 gap-3 h-40 relative group">
        <div className="rounded-xl overflow-hidden border border-dashed border-white/20 relative flex flex-col items-center justify-center p-3
          bg-[url('https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
          <div className="absolute top-2 left-2 text-[10px] font-medium bg-black/60 backdrop-blur-md rounded px-2 py-1 text-slate-300 z-10">Original Product Image</div>

          {phase === 'scanning' && (
            <div
              className="absolute left-0 right-0 h-1 bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,1)] z-20"
              style={{ top: `${progress}%` }}
            />
          )}
        </div>

        {/* Central Animated Flow Line */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center z-20 pointer-events-none">
          <div className="absolute w-[60%] sm:w-[50%] h-[2px] bg-purple-500/20 overflow-hidden rounded-full">
            <div className={`absolute top-0 left-[-100%] h-full w-[200%] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-80 ${phase === 'scanning' ? 'animate-[shimmer_1s_infinite]' : ''}`} />
          </div>
          <div className="flex justify-between w-[55%] sm:w-[45%]">
            <ChevronRight className={`w-5 h-5 text-purple-400/80 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] ${phase === 'scanning' ? 'animate-pulse' : 'opacity-30'}`} />
            <ChevronRight className={`w-5 h-5 text-purple-400/80 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] ${phase === 'scanning' ? 'animate-pulse' : 'opacity-30'}`} style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-purple-500/40 relative flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-slate-900">
          {phase === 'done' ? (
            <>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')] bg-cover bg-center animate-fade-in scale-105 transition-transform duration-[4s] ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/40 via-transparent to-transparent mix-blend-overlay"></div>
              <div className="absolute top-2 right-2 text-[10px] font-medium bg-purple-600/90 backdrop-blur-md rounded px-2 py-1 text-white z-10 border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.6)]">AI Enhanced Result ✨</div>
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(168,85,247,0.3)] pointer-events-none" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-purple-500/5 animate-pulse" />
              <div className="absolute top-2 right-2 text-[10px] font-medium bg-black/60 backdrop-blur-md rounded px-2 py-1 text-slate-400 z-10">AI Enhanced Result ✨</div>
              <div className="flex flex-col items-center justify-center gap-2 z-10">
                {phase === 'scanning' ? (
                  <>
                    <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
                    <span className="text-[10px] text-purple-300 font-medium">AI is enhancing...</span>
                    <div className="w-24 h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-75" style={{ width: `${progress}%` }} />
                    </div>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium pb-2">Waiting for AI...</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Processing Pipeline View */}
      <div className="bg-black/20 rounded-xl p-4 border border-white/5 pb-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">AI Processing Pipeline</div>
        <div className="space-y-4">
          {[
            { icon: LayoutTemplate, label: 'Background Replacement', desc: 'Removing clutter and generating studio backdrops' },
            { icon: Zap, label: 'Lighting Enhancement', desc: 'Fixing shadows and boosting color vibrancy' },
            { icon: Palette, label: 'Style Transfer', desc: 'Applying cinematic color grading' },
          ].map(({ icon: Icon, label, desc }, i) => {
            const isActive = activeStep === i;
            const isDone = activeStep > i;
            return (
              <div key={label} className={`flex gap-3 relative transition-opacity duration-500 ${phase === 'idle' ? 'opacity-40' : 'opacity-100'}`}>
                {i !== 2 && (
                  <div className={`absolute top-8 left-3.5 w-px h-[calc(100%+8px)] transition-colors duration-500 ${isDone ? 'bg-purple-500/50' : 'bg-white/10'}`} />
                )}
                <div className="flex flex-col items-center gap-1.5 shrink-0 relative mt-0.5">
                  <div className={`flex items-center justify-center w-4 h-4 rounded text-[10px] font-black transition-colors shadow-sm ${isActive || isDone ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center border transition-colors duration-500 ${isActive || isDone ? 'border-purple-500/50 bg-purple-500/10' : 'bg-gradient-to-br from-white/5 to-white/10 border-white/10'}`}>
                    <Icon className={`h-3.5 w-3.5 transition-colors duration-500 ${isActive || isDone ? 'text-purple-400' : 'text-slate-400'}`} />
                  </div>
                </div>

                <div className="flex-1 space-y-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold transition-colors duration-300 ${isActive || isDone ? 'text-white' : 'text-slate-400'}`}>{label}</span>
                    <span className={`text-[10px] font-bold text-purple-400 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>Processing...</span>
                    {isDone && <span className={`text-[10px] font-bold text-green-400 absolute right-0 ${isActive ? 'opacity-0' : 'opacity-100'}`}>Done</span>}
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">{desc}</p>

                  {isActive && (
                    <div className="h-[2px] w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-1/3 animate-[shimmer_1s_infinite] rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="min-h-screen relative bg-[#080010]">

      {/* ── Fixed Liquid Ether background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LiquidEther
          colors={['#5227FF', '#9333ea', '#8B19EE', '#c026d3']}
          color0="#5227FF" color1="#9333ea" color2="#8B19EE"
          mouseForce={60} cursorSize={180}
          autoDemo={false} dissipation={0.985} resolution={0.5}
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-black/30 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_16px_rgba(139,92,246,0.4)] p-1">
            <img src="/logo-new.png" alt="KaryaStudio Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">KaryaStudio <span className="text-purple-400">AI</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="cursor-pointer px-5 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Login</button>
          </Link>
          <Link href="/register">
            <button className="cursor-pointer px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.4)]">Get Started</button>
          </Link>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative overflow-hidden pt-40 pb-32 lg:pt-56 lg:pb-48 z-10">
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none animate-pulse duration-[4000ms]" />
        <div className="absolute -top-32 left-1/4 w-[50rem] h-[50rem] rounded-full bg-purple-700/12 blur-[150px] pointer-events-none" />
        <div className="absolute top-10 right-0 w-[30rem] h-[30rem] rounded-full bg-fuchsia-600/8 blur-[120px] pointer-events-none" />

        <div className={`relative z-10 ${CONTAINER}`}>
          <div className="flex flex-col items-center gap-16 lg:gap-20">

            {/* Top: Copy */}
            <div className="flex flex-col items-center text-center w-full max-w-5xl mx-auto mb-10 lg:mb-16">

              {/* Pill badge */}
              <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 backdrop-blur-md px-4 py-1.5 mb-8 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-white/5">
                <span className="text-[13px] font-medium text-purple-200 tracking-wide">✨ AI-Powered Studio for Indonesian UMKM</span>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-in-up duration-1000 mb-6 max-w-4xl text-4xl font-black text-white sm:text-5xl lg:text-6xl tracking-tight leading-tight py-2">
                Create Stunning <br className="hidden sm:block" />
                <span className="relative inline-block pb-1">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">Product Photos</span>
                  <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-[2px] opacity-70" />
                </span>{' '}
                with AI
              </h1>

              {/* Subtitle */}
              <p className="animate-fade-in-up mb-12 max-w-[650px] text-lg sm:text-xl text-slate-400 font-light leading-[1.8]" style={{ animationDelay: '0.15s' }}>
                Transform ordinary product images into professional marketing visuals in seconds — built for Indonesian UMKM.
              </p>

              {/* Call To Action Buttons */}
              <div className="animate-fade-in-up mt-8 md:mt-10 mb-16 flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center w-full" style={{ animationDelay: '0.3s' }}>
                <Link href="/register">
                  <button className="cursor-pointer group relative h-14 rounded-full bg-purple-900/40 backdrop-blur-md px-10 text-base font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] hover:bg-purple-800/50 border-2 border-purple-500/80 hover:border-purple-400 flex items-center justify-center gap-2 overflow-hidden mx-auto sm:mx-0 w-full sm:w-auto hover:-translate-y-0.5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <span className="relative z-10">Start Creating Free</span>
                    <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200 cursor-pointer" />
                  </button>
                </Link>
                <Link href="/templates">
                  <button className="cursor-pointer group h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-md px-10 text-base font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:text-white flex items-center justify-center mx-auto sm:mx-0 w-full sm:w-auto hover:-translate-y-0.5 shadow-sm">
                    Explore Templates
                  </button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="animate-fade-in-up flex flex-col sm:flex-row items-center gap-6 justify-center" style={{ animationDelay: '0.45s' }}>
                <div className="flex -space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="User Avatar"
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border-2 border-[#080010] ring-1 ring-white/20 object-cover relative transition-transform duration-300 hover:-translate-y-2 hover:z-20 animate-float"
                      style={{ zIndex: 10 - i, animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center sm:items-start gap-1">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <div className="flex gap-0.5 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 sm:h-3 w-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-white tracking-wide">4.8/5</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Trusted by <span className="text-white font-semibold">500+ Indonesian UMKM</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom: Dashboard Mockup */}
            <div className="w-full max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-violet-600/18 blur-3xl rounded-3xl scale-110" />
                <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] p-1">
                  {/* Chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                    <div className="mx-auto flex-1 max-w-[180px] h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-[10px] text-slate-500">app.karyastudio.ai</span>
                    </div>
                  </div>
                  {/* Content */}
                  <AnimatedAIStudioMockup />
                </div>
                {/* Floating badges */}
                <div className="absolute -top-5 -right-6 animate-float">
                  <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/15 backdrop-blur-md px-3 py-2 shadow-lg">
                    <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs text-green-300 font-semibold">+340% Engagement</span>
                  </div>
                </div>
                <div className="absolute -bottom-5 -left-6 animate-float" style={{ animationDelay: '1.2s' }}>
                  <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/15 backdrop-blur-md px-3 py-2 shadow-lg">
                    <Zap className="h-3.5 w-3.5 text-purple-400 fill-purple-400" />
                    <span className="text-xs text-purple-300 font-semibold">Generated in 30s</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="mt-20 lg:mt-40 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent z-10 relative" />

      {/* ══════════════ FEATURES ══════════════ */}
      <section className={`relative overflow-hidden ${SECTION_PAD} z-10 bg-black/20`}>
        <div className="absolute top-0 right-1/3 w-[35rem] h-[35rem] rounded-full bg-purple-700/12 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] rounded-full bg-fuchsia-700/8 blur-[100px] pointer-events-none" />

        <div className={`relative z-10 ${CONTAINER}`}>
          <Reveal animation="fade-blur" className="text-center">
            <SectionLabel icon={Sparkles} text="Features" />
            <SectionHeading
              title={<>Everything You Need to <span className="text-[#d946ef]">Shine Online</span></>}
              subtitle="Powerful AI tools purpose-built to make your products stand out in a competitive digital marketplace"
            />
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <FeatureCard icon={Camera} title="Smart Product Photography" description="Transform plain product shots into professional marketing photos with AI-enhanced backgrounds and studio-quality lighting." blobColor="bg-fuchsia-500" delay={0} />
            <FeatureCard icon={Video} title="Cinematic Promo Videos" description="Create attention-grabbing videos that capture interest and drive sales across all social media platforms." blobColor="bg-indigo-500" delay={100} />
            <FeatureCard icon={Sparkles} title="AI Prompt Enhancer" description="Get exceptional results with intelligent prompt enhancement that truly understands your creative vision." blobColor="bg-rose-500" delay={200} />
            <FeatureCard icon={LayoutTemplate} title="Ready-Made Templates" description="Choose from professionally designed templates tailored for Indonesian market trends and visual preferences." blobColor="bg-violet-500" delay={300} />
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent z-10 relative" />

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className={`relative ${SECTION_PAD} overflow-hidden z-10 bg-black/15`}>
        <div className="absolute top-1/2 left-0 w-[28rem] h-[28rem] bg-violet-600/8 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[28rem] h-[28rem] bg-fuchsia-600/8 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

        <div className={`relative ${CONTAINER} z-10`}>
          <Reveal animation="fade-blur" className="text-center">
            <SectionLabel icon={Zap} text="How It Works" />
            <SectionHeading
              title={<>Create in <span className="text-[#d946ef]">3 Simple Steps</span></>}
              subtitle="Transform your product ideas into professional marketing materials — no design skills required"
            />
          </Reveal>

          {/* Timeline connector */}
          <div className="relative">
            <div className="hidden lg:block absolute top-[3.5rem] left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-pink-500/50 z-0">
              <div className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" style={{ left: '30%' }} />
            </div>
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3 relative z-10 pt-6">
              <StepCard step={1} icon={Upload} title="Upload or Describe" description="Upload your product photo or simply describe what you want to create using a text prompt." badgeColor="#a855f7" delay={0} />
              <StepCard step={2} icon={Palette} title="Choose Style & Customize" description="Select from various styles and templates, then fine-tune every detail to match your brand identity." badgeColor="#d946ef" delay={150} />
              <StepCard step={3} icon={Download} title="Download & Share" description="Your professional marketing content is ready in seconds — export and share across all platforms directly." badgeColor="#e11d48" delay={300} />
            </div>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      {/* Removed divider to create seamless space */}

      {/* ══════════════ METRICS ══════════════ */}
      <section className={`relative ${SECTION_PAD} z-10 bg-transparent`}>
        <div className={`relative ${CONTAINER}`}>
          <Reveal animation="fade-blur" className="text-center mb-16">
            <SectionLabel icon={TrendingUp} text="Impact" />
            <h2 className="text-4xl font-black text-white sm:text-5xl tracking-tight mb-4">
              Trusted by Growing Businesses
            </h2>
            <p className="text-xl text-slate-300 font-light leading-[1.75] max-w-xl mx-auto">
              Real results from real Indonesian UMKM
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 mb-20 lg:mb-24">
            {[
              { target: 1000, suffix: '+', label: 'Photos Generated', sub: 'and counting', colorHex: '#a855f7', glow: 'rgba(139,92,246,0.5)' },
              { target: 500, suffix: '+', label: 'UMKM Helped', sub: 'across Indonesia', colorHex: '#d946ef', glow: 'rgba(217,70,239,0.5)' },
              { target: 25, suffix: '+', label: 'Templates', sub: 'professionally designed', colorHex: '#3b82f6', glow: 'rgba(99,102,241,0.5)' },
              { target: 9, suffix: '', label: 'Achievements', sub: 'unlocked by users', colorHex: '#f59e0b', glow: 'rgba(251,191,36,0.5)' },
            ].map(({ target, suffix, label, sub, colorHex, glow }, i) => (
              <Reveal key={label} delay={i * 100} animation="fade-scale">
                <div className="group relative text-center p-8 lg:p-10 rounded-3xl border border-white/[0.12] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1">
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `0 0 50px ${glow}` }} />
                  <div className="mb-3 py-2 text-5xl font-black sm:text-6xl" style={{ color: colorHex, filter: `drop-shadow(0 0 12px ${glow})` }}>
                    <AnimatedCounter target={target} suffix={suffix} />
                  </div>
                  <div className="text-base font-bold text-white/90 mb-1">{label}</div>
                  <div className="text-sm text-slate-400">{sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      {/* Removed below metrics to stop sections touching */}

      {/* ══════════════ CTA ══════════════ */}
      <section className="relative overflow-hidden py-14 md:py-[72px] lg:py-24 z-10 bg-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/4 w-[44rem] h-[44rem] bg-violet-700/20 rounded-full blur-[140px] animate-float" />
          <div className="absolute -bottom-40 right-1/4 w-[38rem] h-[38rem] bg-fuchsia-700/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <Reveal animation="fade-scale" className={`relative ${CONTAINER} text-center`}>
        <div
        style={{ borderRadius: '60px' }}
        className="relative overflow-visible bg-white/[0.04] backdrop-blur-3xl border border-white/20 border-t-white/30 shadow-[0_0_100px_rgba(139,92,246,0.2),inset_0_1px_0_rgba(255,255,255,0.10)] py-16 px-6 sm:px-12 lg:py-20 lg:px-16 mx-auto max-w-4xl"
      >

        {/* Orb wrapper */}
        <div className="absolute inset-0 overflow-hidden rounded-[60px] pointer-events-none z-0">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-violet-600 opacity-25 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-fuchsia-500 opacity-20 blur-3xl" />
        </div>

        {/* Badge */}
        <div className="absolute left-1/2 -top-6 sm:-top-7 -translate-x-1/2 z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-[#0f0518] px-4 py-2 sm:px-6 sm:py-2.5 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs sm:text-sm text-purple-200 font-semibold uppercase tracking-wider">
              Join 500+ Indonesian UMKM
            </span>
          </div>
        </div>

            <div className="relative z-10 pt-12 sm:pt-10">

              <h2 className="mb-8 py-2 text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight" style={{ textShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
                Ready to Transform<br />
                <span className="text-[#d946ef]">Your Business?</span>
              </h2>

              <p className="text-lg sm:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-[1.75]">
                Create professional marketing content in minutes — no design skills required. Start free and elevate your brand today.
              </p>

              <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button className="group h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 px-10 text-lg font-bold text-white transition-all hover:scale-105 shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:shadow-[0_0_60px_rgba(139,92,246,0.9)] rounded-full border border-violet-400/30 gap-2">
                    Get Started for Free <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button variant="outline" className="h-14 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-md px-9 text-base font-semibold text-slate-200 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all">
                    View Templates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent z-10 relative" />

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="relative bg-black/50 py-14 z-10">
        <div className={CONTAINER}>
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="text-center sm:text-left">
              <Link href="/" className="inline-flex items-center gap-2.5 group mb-2">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_16px_rgba(139,92,246,0.4)] p-1">
                  <img src="/logo-new.png" alt="KaryaStudio Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-black text-[#d946ef] tracking-tight">KaryaStudio AI</span>
              </Link>
              <p className="text-sm text-slate-400 font-light">
                Empowering Indonesian UMKM with AI-powered content creation
              </p>
            </div>
            <nav className="flex flex-wrap gap-8 text-sm text-slate-300 font-light justify-center">
              {['About', 'Templates', 'Pricing', 'Contact'].map(link => (
                <Link key={link} href={`/${link.toLowerCase()}`} className="hover:text-purple-400 hover:underline underline-offset-4 transition-colors">
                  {link}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} KaryaStudio AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
