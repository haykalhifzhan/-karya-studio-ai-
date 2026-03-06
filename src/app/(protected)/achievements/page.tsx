'use client';

import { useMemo, useState } from 'react';
import {
  Trophy, CheckCircle2, Footprints, Camera, Video,
  Layers, TrendingUp, LayoutTemplate, Sparkles, Heart, Lock
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { achievements as allAchievements } from '@/lib/constants';
import type { AchievementRarity } from '@/types';

/* ─── Data & Helpers ───────────────────────────────────────────── */

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints, Camera, Video, Layers, TrendingUp, LayoutTemplate, Sparkles, Heart, Trophy,
};

const fmtDate = (timestamp: string | number) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(typeof timestamp === 'number' ? timestamp : Date.parse(timestamp)));

const RARITY_COLORS: Record<AchievementRarity, { bg: string; text: string; border: string; icon: string; lockedCard: string; lockedIconBox: string; unlockedCard: string; unlockedIconBox: string; dropShadow: string }> = {
  bronze: {
    bg: 'bg-[#cd7f32]/10',
    text: 'text-[#cd7f32]',
    border: 'border-[#cd7f32]/20',
    icon: 'text-[#cd7f32]',
    lockedCard: 'bg-gradient-to-br from-[#2a1708] to-black border-[#cd7f32]/30 hover:border-[#cd7f32]/50',
    lockedIconBox: 'bg-[#cd7f32]/20 border-[#cd7f32]/40 group-hover:bg-[#cd7f32]/30',
    unlockedCard: 'bg-gradient-to-br from-[#cd7f32]/20 to-[#1a1105] border-[#cd7f32]/40 hover:border-[#cd7f32]/60 hover:bg-[#cd7f32]/20 hover:-translate-y-1',
    unlockedIconBox: 'bg-gradient-to-br from-[#df9e5c] via-[#cd7f32] to-[#8b5a2b] shadow-lg shadow-[#cd7f32]/30 border-transparent',
    dropShadow: 'drop-shadow-[0_0_8px_rgba(205,127,50,0.5)]'
  },
  silver: {
    bg: 'bg-slate-300/10',
    text: 'text-slate-300',
    border: 'border-slate-300/20',
    icon: 'text-slate-300',
    lockedCard: 'bg-gradient-to-br from-[#11151a] to-black border-slate-800/50 hover:border-slate-600/50',
    lockedIconBox: 'bg-slate-900/40 border-slate-800/50 group-hover:bg-slate-800/40',
    unlockedCard: 'bg-gradient-to-br from-slate-400/20 to-[#11151a] border-slate-400/40 hover:border-slate-400/60 hover:bg-slate-400/20 hover:-translate-y-1',
    unlockedIconBox: 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 shadow-lg shadow-slate-400/30 border-transparent',
    dropShadow: 'drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]'
  },
  space: {
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-500/20',
    icon: 'text-fuchsia-400',
    lockedCard: 'bg-gradient-to-br from-[#1a0a1a] to-black border-fuchsia-900/30 hover:border-fuchsia-700/50',
    lockedIconBox: 'bg-fuchsia-950/40 border-fuchsia-900/40 group-hover:bg-fuchsia-900/40',
    unlockedCard: 'bg-gradient-to-br from-fuchsia-600/20 to-[#1a0a1a] border-fuchsia-500/40 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/20 hover:-translate-y-1',
    unlockedIconBox: 'bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-600 shadow-lg shadow-fuchsia-500/30 border-transparent',
    dropShadow: 'drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]'
  },
  platinum: {
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-400',
    border: 'border-cyan-400/20',
    icon: 'text-cyan-400',
    lockedCard: 'bg-gradient-to-br from-[#0a1a1a] to-black border-cyan-900/30 hover:border-cyan-700/50',
    lockedIconBox: 'bg-cyan-950/40 border-cyan-900/40 group-hover:bg-cyan-900/40',
    unlockedCard: 'bg-gradient-to-br from-cyan-400/20 to-[#0a1a1a] border-cyan-400/40 hover:border-cyan-300/60 hover:bg-cyan-400/20 hover:-translate-y-1',
    unlockedIconBox: 'bg-gradient-to-br from-cyan-200 via-cyan-400 to-teal-500 shadow-lg shadow-cyan-400/30 border-transparent',
    dropShadow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
  },
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unlocked', label: 'Unlocked', icon: CheckCircle2 },
  { value: 'locked', label: 'Locked', icon: Lock },
] as const;

/* ══════════════════════════════════════════════════════════════════ */
export default function AchievementsPage() {
  const { stats, achievements: unlockedAchievements } = useUserStore();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const achievementsWithProgress = useMemo(() => {
    return allAchievements.map((achievement) => {
      const unlockedData = unlockedAchievements.find(ua => ua.achievementId === achievement.id);
      const isUnlocked = !!unlockedData;

      let currentProgress = 0;
      switch (achievement.id) {
        case 'first-step': currentProgress = (stats?.totalGenerations ?? 0) > 0 ? 1 : 0; break;
        case 'creative-mind': currentProgress = stats?.totalPhotos || 0; break;
        case 'video-creator': currentProgress = stats?.totalVideos || 0; break;
        case 'batch-pro': currentProgress = stats?.batchesCompleted || 0; break;
        case 'consistent-user': currentProgress = stats?.totalGenerations || 0; break;
        case 'template-master': currentProgress = stats?.templatesUsed.length || 0; break;
        case 'prompt-expert': currentProgress = stats?.totalEnhancements || 0; break;
        case 'social-sharer': currentProgress = stats?.favoritesCount || 0; break;
        case 'msme-champion': currentProgress = stats?.totalGenerations || 0; break;
      }

      const progressPercentage = Math.min((currentProgress / achievement.threshold) * 100, 100);

      return {
        ...achievement,
        isUnlocked,
        unlockedAt: unlockedData?.unlockedAt,
        currentProgress,
        progressPercentage,
      };
    });
  }, [unlockedAchievements, stats]);

  const filteredAchievements = useMemo(() => {
    return achievementsWithProgress.filter((a) => {
      if (filter === 'unlocked') return a.isUnlocked;
      if (filter === 'locked') return !a.isUnlocked;
      return true;
    });
  }, [achievementsWithProgress, filter]);

  const unlockedCount = achievementsWithProgress.filter((a) => a.isUnlocked).length;
  const totalCount = achievementsWithProgress.length;
  const totalProgress = (unlockedCount / totalCount) * 100;

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Ambiental glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/4 blur-[120px] rounded-full" />
      </div>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-10 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/30 blur-lg rounded-xl" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffd700] via-[#daa520] to-[#b8860b] flex items-center justify-center shadow-xl shadow-[#daa520]/30 border border-[#ffd700]/50">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Achievements</h1>
              <p className="text-sm text-white/40">Complete challenges and unlock badges</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-2xl">
            <div className="text-right">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Unlocked</p>
              <p className="text-sm font-black text-white leading-none">{unlockedCount} / {totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#daa520]/10 flex items-center justify-center border border-[#daa520]/30 shadow-[0_0_10px_rgba(218,165,32,0.2)]">
              <Trophy className="w-4 h-4 text-[#ffd700]" />
            </div>
          </div>
        </div>

        {/* Global Progress */}
        <div className="max-w-md">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-white/50">Overall Progress</span>
            <span className="text-sm font-black text-amber-400">{Math.round(totalProgress)}%</span>
          </div>
          <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.04s' }}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const Icon = 'icon' in f ? f.icon : null;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${active
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500/80 text-white shadow-lg shadow-amber-500/20'
                : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/8 hover:border-white/20'
                }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'fill-current' : ''}`} />}
              {f.label}
              {f.value === 'unlocked' && <span className="ml-1 opacity-70">({unlockedCount})</span>}
              {f.value === 'locked' && <span className="ml-1 opacity-70">({totalCount - unlockedCount})</span>}
            </button>
          );
        })}
      </div>

      {/* ── Grid ───────────────────────────────────────────────── */}
      {filteredAchievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-4">
            <Trophy className="w-7 h-7 text-white/10" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No achievements found</h3>
          <p className="text-sm text-white/35">Try switching the filter tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
          {filteredAchievements.map((achievement, i) => {
            const IconComponent = iconMap[achievement.icon] || Trophy;
            const rStyle = RARITY_COLORS[achievement.rarity];
            const unlocked = achievement.isUnlocked;

            return (
              <div
                key={achievement.id}
                className={`group relative rounded-2xl border transition-all duration-300 animate-scale-in overflow-hidden ${unlocked
                  ? rStyle.unlockedCard
                  : `opacity-90 hover:opacity-100 ${rStyle.lockedCard} hover:-translate-y-0.5`
                  }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Status indicator top right */}
                <div className="absolute top-4 right-4 z-10">
                  {unlocked ? (
                    <CheckCircle2 className={`w-5 h-5 ${rStyle.text} ${rStyle.dropShadow}`} />
                  ) : (
                    <Lock className="w-4 h-4 text-white/20" />
                  )}
                </div>

                <div className="p-6">
                  {/* Icon Block */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 border ${unlocked
                    ? rStyle.unlockedIconBox
                    : rStyle.lockedIconBox
                    }`}>
                    <IconComponent className={`w-7 h-7 transition-colors ${unlocked ? 'text-white' : rStyle.icon}`} />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className={`text-lg font-black tracking-tight mb-1 transition-colors ${unlocked ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm leading-relaxed mb-4 ${unlocked ? 'text-white/60' : 'text-white/30 group-hover:text-white/50'}`}>
                      {achievement.description}
                    </p>
                  </div>

                  {/* Rarity limit */}
                  <div className="mb-5 flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${rStyle.bg} ${rStyle.text} ${unlocked ? rStyle.border : 'border-current'}`}>
                      {achievement.rarity}
                    </span>
                    {unlocked && achievement.unlockedAt && (
                      <span className="text-[10px] font-medium text-white/30">
                        {fmtDate(achievement.unlockedAt)}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar (if locked) */}
                  {!unlocked && (
                    <div className="space-y-2 mt-auto">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Progress</span>
                        <span className="text-xs font-bold text-white/50">
                          {achievement.currentProgress} <span className="text-white/20">/ {achievement.threshold}</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-white/20 rounded-full transition-all duration-700"
                          style={{ width: `${achievement.progressPercentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/25 text-right mt-1">
                        {achievement.threshold - achievement.currentProgress} more to unlock
                      </p>
                    </div>
                  )}

                  {/* Confetti effect when hovered if unlocked */}
                  {unlocked && (
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${rStyle.bg.replace('bg-', 'bg-').replace('/10', '/30')}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
