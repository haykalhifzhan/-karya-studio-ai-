import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserStats, UnlockedAchievement } from '@/types';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  stats: UserStats;
  achievements: UnlockedAchievement[];

  setUser: (user: User, token: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
  incrementStat: (key: keyof Pick<UserStats, 'totalGenerations' | 'totalPhotos' | 'totalVideos' | 'totalEnhancements' | 'favoritesCount' | 'batchesCompleted'>) => void;
  addTemplateUsed: (templateId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  hasAchievement: (achievementId: string) => boolean;
}

const defaultStats: UserStats = {
  totalGenerations: 0,
  totalPhotos: 0,
  totalVideos: 0,
  totalEnhancements: 0,
  templatesUsed: [],
  favoritesCount: 0,
  batchesCompleted: 0,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      onboardingCompleted: false,
      stats: defaultStats,
      achievements: [],

      setUser: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      completeOnboarding: () => set({ onboardingCompleted: true }),

      incrementStat: (key) =>
        set((s) => ({
          stats: { ...s.stats, [key]: (s.stats[key] as number) + 1 },
        })),

      addTemplateUsed: (templateId) =>
        set((s) => ({
          stats: {
            ...s.stats,
            templatesUsed: s.stats.templatesUsed.includes(templateId)
              ? s.stats.templatesUsed
              : [...s.stats.templatesUsed, templateId],
          },
        })),

      unlockAchievement: (achievementId) =>
        set((s) => {
          if (s.achievements.find((a) => a.achievementId === achievementId)) return s;
          return {
            achievements: [
              ...s.achievements,
              { achievementId, unlockedAt: new Date().toISOString() },
            ],
          };
        }),

      hasAchievement: (achievementId) =>
        !!get().achievements.find((a) => a.achievementId === achievementId),
    }),
    { name: 'karya-user-store' }
  )
);
