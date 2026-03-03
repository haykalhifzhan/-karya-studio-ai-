import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),
        avatar: v.optional(v.string()),
        onboardingCompleted: v.optional(v.boolean()),  // ✅ FIX: Optional
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"]),

    userStats: defineTable({
        userId: v.id("users"),
        // ✅ FIX: Semua stats optional (karena di-init setelah user create)
        totalGenerations: v.optional(v.number()),
        totalPhotos: v.optional(v.number()),
        totalVideos: v.optional(v.number()),
        totalEnhancements: v.optional(v.number()),
        templatesUsed: v.optional(v.array(v.string())),
        favoritesCount: v.optional(v.number()),
        batchesCompleted: v.optional(v.number()),
    }).index("by_user_id", ["userId"]),

    generations: defineTable({
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
        isFavorite: v.optional(v.boolean()),  // ✅ FIX: Optional
        createdAt: v.number(),
    })
        .index("by_user_id", ["userId"])
        .index("by_user_created", ["userId", "createdAt"]),

    achievements: defineTable({
        userId: v.id("users"),
        achievementId: v.string(),
        unlockedAt: v.number(),
    })
        .index("by_user_id", ["userId"])
        .index("by_user_achievement", ["userId", "achievementId"]),
});