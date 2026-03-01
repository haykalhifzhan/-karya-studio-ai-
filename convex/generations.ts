import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
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
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
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
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .order("desc")
            .take(limit);

        return generations.map(g => ({
            ...g,
            createdAt: new Date(g.createdAt).toISOString(),
        }));
    },
});

// Create new generation
export const create = mutation({
    args: {
        type: v.union(v.literal("photo"), v.literal("video")),
        prompt: v.string(),
        style: v.optional(v.string()),
        variations: v.optional(v.number()),
        batchMode: v.optional(v.boolean()),
        templateId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const generationId = await ctx.db.insert("generations", {
            userId,
            type: args.type,
            prompt: args.prompt,
            style: args.style,
            status: "pending",
            resultUrls: [],
            isFavorite: false,
            createdAt: Date.now(),
        });

        // Update user stats
        const user = await ctx.db.get(userId);
        if (user) {
            await ctx.db.patch(userId, {
                updatedAt: Date.now(),
            });
        }

        // Update stats
        const stats = await ctx.db
            .query("userStats")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        if (stats) {
            const updates: any = {
                totalGenerations: stats.totalGenerations + 1,
            };

            if (args.type === "photo") {
                updates.totalPhotos = stats.totalPhotos + 1;
            } else {
                updates.totalVideos = stats.totalVideos + 1;
            }

            if (args.templateId && !stats.templatesUsed.includes(args.templateId)) {
                updates.templatesUsed = [...stats.templatesUsed, args.templateId];
            }

            await ctx.db.patch(stats._id, updates);
        }

        return generationId;
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

// Toggle favorite
export const toggleFavorite = mutation({
    args: { generationId: v.id("generations") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const generation = await ctx.db.get(args.generationId);
        if (!generation || generation.userId !== userId) {
            throw new Error("Not found or unauthorized");
        }

        await ctx.db.patch(args.generationId, {
            isFavorite: !generation.isFavorite,
        });

        // Update favorites count in stats
        const stats = await ctx.db
            .query("userStats")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .unique();

        if (stats) {
            const newCount = generation.isFavorite
                ? Math.max(0, stats.favoritesCount - 1)
                : stats.favoritesCount + 1;

            await ctx.db.patch(stats._id, { favoritesCount: newCount });
        }

        return !generation.isFavorite;
    },
});