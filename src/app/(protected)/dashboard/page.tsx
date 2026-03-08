'use client';

import { Card, CardContent } from '@/components/ui/card';
import { achievements as allAchievements, dailyTips } from '@/lib/constants';
import { useUserStore } from '@/stores/userStore';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import {
  ArrowRight,
  Camera,
  Images,
  Lightbulb,
  Plus,
  Sparkles,
  Trophy,
  Video,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function DashboardPage() {
  const { user, stats, achievements: unlockedAchievements } = useUserStore();
  const { language } = useLanguage();

  const [convexTimedOut, setConvexTimedOut] = useState(false);

  const achievementsWithProgress = useQuery(api.achievements.getAllWithProgress, {});
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.auth.getCurrentUser,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );
  const recentGenerations = useQuery(
    api.generations.listByUser,
    convexUser ? { userId: convexUser._id, limit: 6 } : "skip"
  );

  useEffect(() => {
    if (achievementsWithProgress === undefined) {
      const timer = setTimeout(() => setConvexTimedOut(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [achievementsWithProgress]);

  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dailyTips[dayOfYear % dailyTips.length];
  }, []);

  const closestAchievements = useMemo(() => {
    if (!achievementsWithProgress || achievementsWithProgress.length === 0 || convexTimedOut) return [];
    return achievementsWithProgress
      .filter((a: any) => !a.isUnlocked)
      .sort((a: any, b: any) => b.progressPercent - a.progressPercent)
      .slice(0, 3);
  }, [achievementsWithProgress, convexTimedOut]);

  const formatDate = (dateString: number) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInHours < 24) {
      if (diffInHours < 1) return language === 'id' ? 'Baru saja' : 'Just now';
      return `${Math.floor(diffInHours)}h ${language === 'id' ? 'yang lalu' : 'ago'}`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ${language === 'id' ? 'yang lalu' : 'ago'}`;
    } else {
      return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Loading skeleton
  if (!user || !stats) {
    return (
      <div className="min-h-screen p-6 lg:p-8 space-y-8">
        <div className="space-y-3">
          <div className="h-10 w-72 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-5 w-48 rounded-lg bg-white/5 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
        </div>
        <div className="flex items-center gap-3 justify-center pt-4">
          <div className="h-5 w-5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          <p className="text-sm text-white/40">{language === 'id' ? 'Memuat dashboard...' : 'Loading dashboard...'}</p>
        </div>
      </div>
    );
  }

  if (!recentGenerations) {
    return (
      <div className="min-h-screen p-6 lg:p-8 space-y-8">
        <div className="flex items-center gap-3 justify-center pt-4">
          <div className="h-5 w-5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          <p className="text-sm text-white/40">{language === 'id' ? 'Memuat karya terbaru...' : 'Loading recent creations...'}</p>
        </div>
      </div>
    );
  }

  const showAchievements = achievementsWithProgress && !convexTimedOut && closestAchievements.length > 0;
  const firstName = user?.name?.split(' ')[0] || 'Creator';

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">

      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-purple-600/8 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-indigo-600/6 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-fuchsia-600/5 blur-[100px] rounded-full" />
      </div>

      {/* ══════════ HEADER ══════════ */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-white/40 font-medium mb-1 uppercase tracking-widest">
              {language === 'id' ? 'Selamat Datang Kembali' : 'Welcome Back'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              {firstName}
              <span className="animate-bounce origin-bottom inline-block">👋</span>
            </h1>
            <p className="text-white/40 text-sm mt-1.5">
              {language === 'id'
                ? 'Siap berkreasi hari ini? Studio AI Anda siap digunakan.'
                : 'Ready to create today? Your AI Studio is ready.'}
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-3">
            <Link href="/generate/photo">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/25">
                <Plus className="w-4 h-4" />
                {language === 'id' ? 'Buat Konten' : 'Create Content'}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════ STATS ROW ══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        {[
          {
            icon: Zap, label: language === 'id' ? 'Total Generasi' : 'Total Generated',
            value: stats?.totalGenerations || 0,
            color: '#a78bfa', bg: 'from-violet-500/15 to-violet-600/5', border: 'border-violet-500/20',
          },
          {
            icon: Camera, label: language === 'id' ? 'Foto Dibuat' : 'Photos Created',
            value: stats?.totalPhotos || 0,
            color: '#34d399', bg: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/20',
          },
          {
            icon: Video, label: language === 'id' ? 'Video Dibuat' : 'Videos Created',
            value: stats?.totalVideos || 0,
            color: '#60a5fa', bg: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/20',
          },
          {
            icon: Trophy, label: language === 'id' ? 'Pencapaian' : 'Achievements',
            value: `${unlockedAchievements?.length || 0}/${allAchievements.length}`,
            color: '#fbbf24', bg: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/20',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bg} border ${stat.border} p-5 hover:-translate-y-1 transition-all duration-300 group cursor-default`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}22`, border: `1px solid ${stat.color}33` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-black text-white mb-0.5">
              {typeof stat.value === 'string' ? (
                <>
                  {stat.value.split('/')[0]}
                  <span className="text-sm text-white/40 font-medium">/{stat.value.split('/')[1]}</span>
                </>
              ) : stat.value}
            </p>
            <p className="text-xs text-white/40 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ══════════ DAILY TIP ══════════ */}
      <div
        className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 flex items-start gap-4 animate-fade-in-up hover:border-purple-500/30 transition-colors"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">
            {language === 'id' ? 'Tips Harian' : 'Daily Tip'} · {dailyTip.title}
          </p>
          <p className="text-sm text-white/60 leading-relaxed">{dailyTip.content}</p>
        </div>
      </div>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-lg font-bold text-white mb-4">
          {language === 'id' ? '🚀 Mulai Berkreasi' : '🚀 Start Creating'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Photo Generator Card */}
          <Link href="/generate/photo" className="block group">
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent p-6 h-full hover:border-purple-500/40 hover:-translate-y-1.5 transition-all duration-300"
              style={{ boxShadow: '0 0 0 0 transparent', transition: 'all 0.3s' }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {language === 'id' ? 'Foto Produk AI' : 'AI Product Photo'}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  {language === 'id'
                    ? 'Ubah foto biasa menjadi foto katalog produk profesional dengan AI.'
                    : 'Turn ordinary photos into professional product catalog shots with AI.'}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-400 group-hover:gap-3 transition-all">
                  {language === 'id' ? 'Mulai Sekarang' : 'Start Now'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Video Generator Card */}
          <Link href="/generate/video" className="block group">
            <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-transparent p-6 h-full hover:border-indigo-500/40 hover:-translate-y-1.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {language === 'id' ? 'Video Promo AI' : 'AI Promo Video'}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  {language === 'id'
                    ? 'Animasikan produk Anda menjadi video promosi yang menarik perhatian.'
                    : 'Animate your products into attention-grabbing promotional videos.'}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400 group-hover:gap-3 transition-all">
                  {language === 'id' ? 'Mulai Sekarang' : 'Start Now'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary actions row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <Link href="/templates" className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{language === 'id' ? 'Jelajahi Template' : 'Browse Templates'}</p>
              <p className="text-xs text-white/40">{language === 'id' ? 'Desain siap pakai' : 'Ready-made designs'}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Link href="/gallery" className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
              <Images className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{language === 'id' ? 'Galeri Saya' : 'My Gallery'}</p>
              <p className="text-xs text-white/40">
                {recentGenerations.length} {language === 'id' ? 'karya tersimpan' : 'saved creations'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* ══════════ RECENT GENERATIONS ══════════ */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {language === 'id' ? '🖼️ Generasi Terbaru' : '🖼️ Recent Creations'}
          </h2>
          <Link href="/gallery" className="flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group">
            {language === 'id' ? 'Lihat Semua' : 'View All'}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentGenerations.length > 0 ? (
          <div className="relative">
            <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[#080010] to-transparent z-10 pointer-events-none" />
            <div className="overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              <div className="flex gap-4 min-w-max">
                {recentGenerations.map((gen) => (
                  <Link href="/gallery" key={gen._id} className="block group shrink-0">
                    <div className="w-48 aspect-[3/4] relative rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 duration-300 shadow-lg">
                      {gen.thumbnailUrl || gen.resultUrls?.[0] ? (
                        <>
                          <img
                            src={gen.thumbnailUrl || gen.resultUrls[0]}
                            alt={gen.type}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          {gen.type === 'photo' ? <Camera className="w-8 h-8 text-white/20" /> : <Video className="w-8 h-8 text-white/20" />}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${gen.type === 'photo' ? 'bg-purple-500/30 text-purple-300' : 'bg-indigo-500/30 text-indigo-300'}`}>
                          {gen.type}
                        </span>
                        <p className="text-[11px] text-white/50 mt-1">{formatDate(gen.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
              <Camera className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {language === 'id' ? 'Kanvas Masih Kosong' : 'Canvas is Empty'}
            </h3>
            <p className="text-sm text-white/40 mb-6 max-w-xs">
              {language === 'id'
                ? 'Mulai generasikan konten pertama Anda sekarang.'
                : 'Start generating your first piece of content now.'}
            </p>
            <Link href="/generate/photo">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/25">
                <Camera className="w-4 h-4" />
                {language === 'id' ? 'Buat Foto Baru' : 'Generate First Photo'}
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ══════════ ACHIEVEMENTS ══════════ */}
      {showAchievements && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              🎯 {language === 'id' ? 'Misi Aktif' : 'Active Missions'}
            </h2>
            <Link href="/achievements" className="flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors group">
              {language === 'id' ? 'Lihat Semua' : 'View All'}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {closestAchievements.map((achievement: any) => (
              <div
                key={achievement.id}
                className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${achievement.rarity === 'platinum' ? 'bg-gradient-to-br from-indigo-300 to-indigo-600' :
                      achievement.rarity === 'space' ? 'bg-gradient-to-br from-purple-300 to-purple-600' :
                        achievement.rarity === 'silver' ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                          'bg-gradient-to-br from-orange-400 to-orange-600'
                      }`}>
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{achievement.name}</h3>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{achievement.rarity}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-4 leading-relaxed">{achievement.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-purple-400 font-medium">
                        {achievement.remainingProgress > 0
                          ? `${achievement.remainingProgress} ${language === 'id' ? 'lagi' : 'more'}`
                          : language === 'id' ? 'Siap di-claim!' : 'Ready!'}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {achievement.currentProgress || 0}<span className="text-white/30">/{achievement.threshold}</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                        style={{ width: `${achievement.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Convex timeout warning */}
      {convexTimedOut && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-200">
                {language === 'id' ? 'Pelacakan pencapaian tidak tersedia' : 'Achievement tracking unavailable'}
              </p>
              <p className="text-xs text-amber-300/60">
                {language === 'id' ? 'Database tidak merespon. Coba refresh halaman.' : 'Database not responding. Try refreshing.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
