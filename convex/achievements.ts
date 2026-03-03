import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

// ✅ ACHIEVEMENTS DATA - Hardcoded di sini (tidak perlu import)
const allAchievements = [
  {
    id: "first-generation",
    name: "First Steps",
    description: "Create your first generation",
    threshold: 1,
    rarity: "bronze" as const,
    criteria: "Generate 1 items",
  },
  {
    id: "ten-generations",
    name: "Getting Started",
    description: "Create 10 generations",
    threshold: 10,
    rarity: "bronze" as const,
    criteria: "Generate 10 items",
  },
  {
    id: "fifty-generations",
    name: "Prolific Creator",
    description: "Create 50 generations",
    threshold: 50,
    rarity: "silver" as const,
    criteria: "Generate 50 items",
  },
  {
    id: "hundred-generations",
    name: "Master Creator",
    description: "Create 100 generations",
    threshold: 100,
    rarity: "gold" as const,
    criteria: "Generate 100 items",
  },
  {
    id: "first-photo",
    name: "Photographer",
    description: "Create your first photo",
    threshold: 1,
    rarity: "bronze" as const,
    criteria: "Generate 1 photo",
  },
  {
    id: "twenty-five-photos",
    name: "Photo Enthusiast",
    description: "Create 25 photos",
    threshold: 25,
    rarity: "silver" as const,
    criteria: "Generate 25 photos",
  },
  {
    id: "first-video",
    name: "Videographer",
    description: "Create your first video",
    threshold: 1,
    rarity: "bronze" as const,
    criteria: "Generate 1 video",
  },
  {
    id: "ten-videos",
    name: "Video Producer",
    description: "Create 10 videos",
    threshold: 10,
    rarity: "silver" as const,
    criteria: "Generate 10 videos",
  },
  {
    id: "first-step",
    name: "Welcome Aboard",
    description: "Complete onboarding",
    threshold: 1,
    rarity: "bronze" as const,
    criteria: "Complete onboarding",
  },
];

// ✅ GET ALL ACHIEVEMENTS WITH PROGRESS
export const getAllWithProgress = query({
  args: {},
  handler: async (ctx) => {
    try {
      const clerkUserId = await getAuthUserId(ctx);
      if (!clerkUserId) {
        console.log('⚠️ No authenticated user');
        return [];
      }

      // Find user by Clerk ID
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
        .unique();

      if (!user) {
        console.log('⚠️ User not found for clerkId:', clerkUserId);
        return [];
      }

      const userId = user._id;

      // Get user stats
      const stats = await ctx.db
        .query("userStats")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique();

      // Get unlocked achievements
      const unlocked = await ctx.db
        .query("achievements")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .collect();

      const unlockedIds = new Set(unlocked.map((u: any) => u.achievementId));

      // Calculate progress for each achievement
      return allAchievements.map((achievement) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        let currentProgress = 0;

        if (stats) {
          const criteria = achievement.criteria || '';
          
          if (criteria.includes('Generate') && criteria.includes('photo')) {
            currentProgress = stats.totalPhotos || 0;
          } else if (criteria.includes('Generate') && criteria.includes('video')) {
            currentProgress = stats.totalVideos || 0;
          } else if (criteria.includes('Generate') && criteria.includes('items')) {
            currentProgress = stats.totalGenerations || 0;
          } else if (criteria.includes('Complete onboarding')) {
            currentProgress = user?.onboardingCompleted ? 1 : 0;
          }
        }

        const threshold = achievement.threshold || 1;
        const progressPercent = Math.min((currentProgress / threshold) * 100, 100);

        return {
          ...achievement,
          isUnlocked,
          currentProgress,
          progressPercent: Math.round(progressPercent * 100) / 100,
          remainingProgress: Math.max(threshold - currentProgress, 0),
        };
      });

    } catch (error) {
      console.error('❌ Error in getAllWithProgress:', error);
      return [];
    }
  },
});

// ✅ UNLOCK ACHIEVEMENT
export const unlock = mutation({
  args: { achievementId: v.string() },
  handler: async (ctx, args) => {
    try {
      const clerkUserId = await getAuthUserId(ctx);
      if (!clerkUserId) throw new Error("Not authenticated");

      // Find user by Clerk ID
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
        .unique();

      if (!user) throw new Error("User not found");

      // Check if already unlocked
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_user_achievement", (q) =>
          q.eq("userId", user._id).eq("achievementId", args.achievementId)
        )
        .unique();

      if (existing) return existing._id;

      // Insert new achievement
      const id = await ctx.db.insert("achievements", {
        userId: user._id,
        achievementId: args.achievementId,
        unlockedAt: Date.now(),
      });

      return id;
    } catch (error) {
      console.error('❌ Error unlocking achievement:', error);
      throw error;
    }
  },
});

// ✅ COMPLETE ONBOARDING AND UNLOCK
export const completeOnboardingAndUnlock = mutation({
  handler: async (ctx) => {
    try {
      const clerkUserId = await getAuthUserId(ctx);
      if (!clerkUserId) throw new Error("Not authenticated");

      // Find user by Clerk ID
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
        .unique();

      if (!user) throw new Error("User not found");

      // Update onboarding status
      await ctx.db.patch(user._id, {
        onboardingCompleted: true,
        updatedAt: Date.now(),
      });

      // Check if achievement already unlocked
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_user_achievement", (q) =>
          q.eq("userId", user._id).eq("achievementId", "first-step")
        )
        .unique();

      let achievementId = null;
      if (!existing) {
        achievementId = await ctx.db.insert("achievements", {
          userId: user._id,
          achievementId: "first-step",
          unlockedAt: Date.now(),
        });
      }

      return { success: true, achievementId };
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      throw error;
    }
  },
});