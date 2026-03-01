'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { achievements as allAchievements, dailyTips } from '@/lib/constants';
import { useGenerationStore } from '@/stores/generationStore';
import { useUserStore } from '@/stores/userStore';
import {
  ArrowRight,
  Calendar,
  Camera,
  Lightbulb,
  Trophy,
  Video,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

export default function DashboardPage() {
  const { user, stats, achievements: unlockedAchievements } = useUserStore();
  const { history } = useGenerationStore();

  const achievementsWithProgress = useQuery(
    api.achievements.getAllWithProgress,
    user?._id ? {} : "skip"
  );

  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dailyTips[dayOfYear % dailyTips.length];
  }, []);

  const recentGenerations = useMemo(() => history.slice(0, 6), [history]);

  const closestAchievements = useMemo(() => {
    if (!achievementsWithProgress) return [];
    return achievementsWithProgress
      .filter((a: any) => !a.isUnlocked)
      .sort((a: any, b: any) => b.progressPercent - a.progressPercent)
      .slice(0, 3);
  }, [achievementsWithProgress]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Just now';
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!user || !stats || achievementsWithProgress === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Welcome Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground mb-4">Here&apos;s what&apos;s happening with your creative studio today.</p>

        {/* Daily Tip Card */}
        <Card className="bg-gradient-to-r from-gold-500/10 to-gold-600/10 border-gold-500/20 shadow-md">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="bg-gold-500 text-white p-3 rounded-lg">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">💡 Daily Tip: {dailyTip.title}</h3>
              <p className="text-sm text-muted-foreground">{dailyTip.content}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Total Generations */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-blue-500/10 text-blue-600 p-4 rounded-xl">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Generations</p>
              <p className="text-3xl font-bold text-foreground">{stats?.totalGenerations}</p>
            </div>
          </CardContent>
        </Card>

        {/* Photos Created */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-green-500/10 text-green-600 p-4 rounded-xl">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Photos Created</p>
              <p className="text-3xl font-bold text-foreground">{stats?.totalPhotos}</p>
            </div>
          </CardContent>
        </Card>

        {/* Videos Created */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-purple-500/10 text-purple-600 p-4 rounded-xl">
              <Video className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Videos Created</p>
              <p className="text-3xl font-bold text-foreground">{stats?.totalVideos}</p>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-gold-500/10 text-gold-600 p-4 rounded-xl">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Achievements</p>
              <p className="text-3xl font-bold text-foreground">
                {unlockedAchievements.length}<span className="text-lg text-muted-foreground">/{allAchievements.length}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Generate Product Photo */}
        <Link href="/generate/photo" className="block group">
          <Card className="h-full bg-gradient-to-br from-gold-500 to-gold-600 text-white border-0 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="flex items-center justify-between p-8">
              <div className="space-y-2">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Generate Product Photo</h3>
                <p className="text-white/80">Create stunning AI-powered product images</p>
              </div>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
            </CardContent>
          </Card>
        </Link>

        {/* Create Promo Video */}
        <Link href="/generate/video" className="block group">
          <Card className="h-full bg-gradient-to-br from-navy-600 to-navy-700 text-white border-0 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <CardContent className="flex items-center justify-between p-8">
              <div className="space-y-2">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Create Promo Video</h3>
                <p className="text-white/80">Transform photos into engaging videos</p>
              </div>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Generations */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Recent Generations</h2>
          <Link href="/history">
            <Button variant="ghost" className="text-gold-600 hover:text-gold-700">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {recentGenerations.length > 0 ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {recentGenerations.map((generation) => (
                <Card key={generation.id} className="w-64 hover:shadow-lg transition-shadow duration-300 flex-shrink-0">
                  <CardContent className="p-4 space-y-3">
                    {/* Thumbnail */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      {generation.thumbnailUrl || generation.resultUrls[0] ? (
                        <Image
                          src={generation.thumbnailUrl || generation.resultUrls[0]}
                          alt={generation.type === 'photo' ? 'Product Photo' : 'Promo Video'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {generation.type === 'photo' ? (
                            <Camera className="w-12 h-12 text-muted-foreground" />
                          ) : (
                            <Video className="w-12 h-12 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={generation.type === 'photo' ? 'default' : 'secondary'}
                          className={generation.type === 'photo' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'}
                        >
                          {generation.type === 'photo' ? (
                            <>
                              <Camera className="w-3 h-3 mr-1" />
                              Photo
                            </>
                          ) : (
                            <>
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </>
                          )}
                        </Badge>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(generation.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{generation.prompt}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted p-6 rounded-full mb-4">
                <Camera className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No generations yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start creating amazing product photos and videos with AI. Your creations will appear here.
              </p>
              <div className="flex gap-4">
                <Link href="/generate/photo">
                  <Button className="bg-gold-600 hover:bg-gold-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Generate Photo
                  </Button>
                </Link>
                <Link href="/generate/video">
                  <Button variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Create Video
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievement Progress */}
      {closestAchievements.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Achievement Progress</h2>
            <Link href="/achievements">
              <Button variant="ghost" className="text-gold-600 hover:text-gold-700">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {closestAchievements.map((achievement: any) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-xl ${achievement.rarity === 'platinum'
                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                            : achievement.rarity === 'gold'
                              ? 'bg-gradient-to-br from-gold-300 to-gold-500 text-white'
                              : achievement.rarity === 'silver'
                                ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700'
                                : 'bg-gradient-to-br from-orange-300 to-orange-500 text-white'
                          }`}
                      >
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{achievement.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{achievement.rarity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">
                        {achievement.currentProgress} / {achievement.threshold}
                      </span>
                    </div>
                    <Progress
                      value={achievement.progressPercent}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {achievement.remainingProgress > 0
                        ? `${achievement.remainingProgress} more to unlock`
                        : 'Almost there!'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}