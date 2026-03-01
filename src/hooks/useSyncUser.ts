"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useUserStore } from "@/stores/userStore";
import { api } from "../../convex/_generated/api";

export function useSyncUser() {
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
    const { setUser, setLoading, logout } = useUserStore();

    const convexUser = useQuery(
        api.auth.getUserWithStats,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );

    useEffect(() => {
        if (!isClerkLoaded) return;

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
                convexUser.achievements || []
            );
        }
    }, [clerkUser, convexUser, isClerkLoaded, setUser, logout, setLoading]);
}