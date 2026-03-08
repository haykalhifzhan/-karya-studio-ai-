import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get user's generation history
export const getHistory = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const limit = args.limit || 50;

        const generations = await ctx.db
            .query("generations")
            .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
            .order("desc")
            .take(limit);

        return generations;
    },
});

// Get recent generations for dashboard
export const getRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const limit = args.limit || 6;

        const generations = await ctx.db
            .query("generations")
            .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
            .order("desc")
            .take(limit);

        return generations.map(g => ({
            ...g,
            createdAt: new Date(g.createdAt).toISOString(),
        }));
    },
});

export const create = mutation({
    args: {
        userId: v.id("users"),
        type: v.union(v.literal("photo"), v.literal("video")),
        prompt: v.string(),
        enhancedPrompt: v.optional(v.string()),
        style: v.optional(v.string()),
        status: v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("completed"),
            v.literal("failed")
        ),
        resultUrls: v.array(v.string()),
        thumbnailUrl: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        templateId: v.optional(v.string()),
        isFavorite: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // 1. Insert the generation
        await ctx.db.insert("generations", {
            ...args,
            createdAt: now,
        });

        // 2. Update or create userStats
        const stats = await ctx.db
            .query("userStats")
            .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
            .first();

        if (stats) {
            await ctx.db.patch(stats._id, {
                totalGenerations: (stats.totalGenerations || 0) + 1,
                totalPhotos:
                    args.type === "photo"
                        ? (stats.totalPhotos || 0) + 1
                        : stats.totalPhotos,
                totalVideos:
                    args.type === "video"
                        ? (stats.totalVideos || 0) + 1
                        : stats.totalVideos,
            });
        } else {
            await ctx.db.insert("userStats", {
                userId: args.userId,
                totalGenerations: 1,
                totalPhotos: args.type === "photo" ? 1 : 0,
                totalVideos: args.type === "video" ? 1 : 0,
                // other optional fields (templatesUsed, favoritesCount, batchesCompleted) are omitted
            });
        }
    },
});

// Update generation status/result
export const update = mutation({
    args: {
        generationId: v.id("generations"),
        updates: v.object({
            status: v.optional(v.union(
                v.literal("pending"),
                v.literal("processing"),
                v.literal("completed"),
                v.literal("failed")
            )),
            resultUrls: v.optional(v.array(v.string())),
            thumbnailUrl: v.optional(v.string()),
            videoUrl: v.optional(v.string()),
            enhancedPrompt: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const generation = await ctx.db.get(args.generationId);
        if (!generation || generation.userId !== userId) {
            throw new Error("Not found or unauthorized");
        }

        await ctx.db.patch(args.generationId, {
            ...args.updates,
        });

        return true;
    },
});

export const listByUser = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("generations")
            .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

// Toggle favorite
export const toggleFavorite = mutation({
    args: {
        generationId: v.id("generations"),
        isFavorite: v.optional(v.boolean()), // ← tambahkan opsional
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const generation = await ctx.db.get(args.generationId);
        if (!generation || generation.userId !== userId) {
            throw new Error("Not found or unauthorized");
        }

        // Jika isFavorite dikirim, gunakan itu; jika tidak, toggle
        const newFavorite = args.isFavorite !== undefined ? args.isFavorite : !generation.isFavorite;

        await ctx.db.patch(args.generationId, { isFavorite: newFavorite });

        // Update favorites count di stats
        const stats = await ctx.db
            .query("userStats")
            .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
            .unique();

        if (stats) {
            const currentCount = stats.favoritesCount ?? 0;
            const newCount = newFavorite
                ? currentCount + 1
                : Math.max(0, currentCount - 1);

            await ctx.db.patch(stats._id, { favoritesCount: newCount });
        }

        return newFavorite;
    },
});