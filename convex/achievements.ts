import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";
import { achievements as allAchievements } from "@/lib/constants";

// Get all achievements with progress
export const getAllWithProgress = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db.get(userId);
        const stats = await ctx.db
            .query("userStats")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        const unlocked = await ctx.db
            .query("achievements")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();

        const unlockedIds = new Set(unlocked.map(u => u.achievementId));

        return allAchievements.map(achievement => {
            const isUnlocked = unlockedIds.has(achievement.id);
            let currentProgress = 0;

            // Calculate progress based on criteria
            if (stats) {
                if (achievement.criteria.includes('Generate') && achievement.criteria.includes('photo')) {
                    currentProgress = stats.totalPhotos;
                } else if (achievement.criteria.includes('Generate') && achievement.criteria.includes('video')) {
                    currentProgress = stats.totalVideos;
                } else if (achievement.criteria.includes('Complete 1 batch')) {
                    currentProgress = stats.batchesCompleted;
                } else if (achievement.criteria.includes('Generate') && achievement.criteria.includes('items')) {
                    currentProgress = stats.totalGenerations;
                } else if (achievement.criteria.includes('Use') && achievement.criteria.includes('templates')) {
                    currentProgress = stats.templatesUsed.length;
                } else if (achievement.criteria.includes('Enhance') && achievement.criteria.includes('prompts')) {
                    currentProgress = stats.totalEnhancements;
                } else if (achievement.criteria.includes('Save') && achievement.criteria.includes('favorites')) {
                    currentProgress = stats.favoritesCount;
                } else if (achievement.criteria === 'Complete onboarding') {
                    currentProgress = user?.onboardingCompleted ? 1 : 0;
                }
            }

            const progressPercent = Math.min((currentProgress / achievement.threshold) * 100, 100);

            return {
                ...achievement,
                isUnlocked,
                currentProgress,
                progressPercent,
                remainingProgress: Math.max(achievement.threshold - currentProgress, 0),
            };
        });
    },
});

// Unlock achievement
export const unlock = mutation({
    args: { achievementId: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if already unlocked
        const existing = await ctx.db
            .query("achievements")
            .withIndex("by_user_achievement", (q) =>
                q.eq("userId", userId).eq("achievementId", args.achievementId)
            )
            .unique();

        if (existing) return existing._id;

        const id = await ctx.db.insert("achievements", {
            userId,
            achievementId: args.achievementId,
            unlockedAt: Date.now(),
        });

        return id;
    },
});