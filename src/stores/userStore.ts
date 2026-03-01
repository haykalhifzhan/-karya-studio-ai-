import { create } from 'zustand';
import type { UserStats, UnlockedAchievement } from '@/types';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ConvexUser {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  onboardingCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

interface UserState {
  user: ConvexUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  stats: UserStats | null;
  achievements: UnlockedAchievement[];

  setUser: (user: ConvexUser, stats?: UserStats, achievements?: UnlockedAchievement[]) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateStats: (stats: Partial<UserStats>) => void;
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

// Tanpa persist - auth di-handle oleh Clerk
export const useUserStore = create<UserState>()(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    stats: null,
    achievements: [],

    setUser: (user, stats, achievements = []) =>
      set({
        user,
        stats: stats || defaultStats,
        achievements,
        isAuthenticated: true,
        isLoading: false
      }),

    setLoading: (loading) => set({ isLoading: loading }),

    logout: () =>
      set({
        user: null,
        stats: null,
        achievements: [],
        isAuthenticated: false,
        isLoading: false,
      }),

    completeOnboarding: () =>
      set((state) => ({
        user: state.user ? { ...state.user, onboardingCompleted: true } : null,
      })),

    updateStats: (newStats) =>
      set((state) => ({
        stats: state.stats ? { ...state.stats, ...newStats } : defaultStats,
      })),

    unlockAchievement: (achievementId) =>
      set((state) => {
        if (state.achievements.find((a) => a.achievementId === achievementId)) {
          return state;
        }
        return {
          achievements: [
            ...state.achievements,
            { achievementId, unlockedAt: Date.now() },
          ],
        };
      }),

    hasAchievement: (achievementId) =>
      !!get().achievements.find((a) => a.achievementId === achievementId),
  })
);

export function useSyncUserWithConvex() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { setUser, setLoading, logout } = useUserStore();

  const convexUser = useQuery(
    api.auth.getUserWithStats,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  useEffect(() => {
    if (!clerkLoaded) return;

    if (!clerkUser) {
      logout();
      setLoading(false);
      return;
    }

    if (convexUser) {
      setUser(
        {
          _id: convexUser._id,
          clerkId: convexUser.clerkId,
          email: convexUser.email,
          name: convexUser.name,
          avatar: convexUser.avatar,
          onboardingCompleted: convexUser.onboardingCompleted,
          createdAt: convexUser.createdAt,
          updatedAt: convexUser.updatedAt,
        },
        convexUser.stats || undefined,
        (convexUser.achievements || []).map((a: any) => ({
          achievementId: a.achievementId,
          unlockedAt: a.unlockedAt,
        }))
      );
    }
  }, [clerkUser, convexUser, clerkLoaded, setUser, logout, setLoading]);
}

export function useCompleteOnboarding() {
  const completeOnboardingMutation = useMutation(api.achievements.completeOnboardingAndUnlock);
  const { completeOnboarding, unlockAchievement } = useUserStore();

  const complete = async () => {
    try {
      // Panggil Convex mutation
      const result = await completeOnboardingMutation();

      // Update local state
      completeOnboarding();
      unlockAchievement('first-step');

      return result;
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      throw error;
    }
  };

  return { complete };
}
