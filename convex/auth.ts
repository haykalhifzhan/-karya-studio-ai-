import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";  // ✅ IMPORT Id type

export const clerkConfig = {
    issuer: process.env.CLERK_JWT_ISSUER_DOMAIN,
};

// Called from Clerk webhook when user created
export const createUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        avatar: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existing) return existing._id;

        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
            name: args.name,
            avatar: args.avatar,
            onboardingCompleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        await ctx.db.insert("userStats", {
            userId,
            totalGenerations: 0,
            totalPhotos: 0,
            totalVideos: 0,
            totalEnhancements: 0,
            templatesUsed: [],
            favoritesCount: 0,
            batchesCompleted: 0,
        });

        return userId;
    },
});

// ✅ FIXED: Return type Id<"users"> | null
export const getAuthUserId = async (ctx: QueryCtx): Promise<Id<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
        .unique();

    return user?._id ?? null;  // user._id is already Id<"users">
};

// Get current user by clerkId
export const getCurrentUser = query({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
            .unique();
    },
});

// Get user with stats
export const getUserWithStats = query({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
            .unique();

        if (!user) return null;

        const stats = await ctx.db
            .query("userStats")
            .withIndex("by_user_id", (q: any) => q.eq("userId", user._id))
            .unique();

        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user_id", (q: any) => q.eq("userId", user._id))
            .collect();

        return { ...user, stats, achievements };
    },
});

// Update user profile
export const updateUser = mutation({
    args: {
        clerkId: v.string(),
        updates: v.object({
            name: v.optional(v.string()),
            avatar: v.optional(v.string()),
            onboardingCompleted: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, { clerkId, updates }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
            .unique();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, {
            ...updates,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

// Complete onboarding
export const completeOnboarding = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const user = await ctx.db.get(userId);  // ✅ userId is Id<"users"> now
        if (!user) throw new Error("User not found");

        await ctx.db.patch(userId, {  // ✅ userId is Id<"users"> now
            onboardingCompleted: true,
            updatedAt: Date.now(),
        });

        return true;
    },
});