'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { achievements as allAchievements } from '@/lib/constants';
import { useUserStore } from '@/stores/userStore';
import type { AchievementRarity } from '@/types';
import { Camera, CheckCircle2, Footprints, Heart, Layers, LayoutTemplate, Lock, Sparkles, TrendingUp, Trophy, Video } from 'lucide-react';
import { useMemo, useState } from 'react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints,
  Camera,
  Video,
  Layers,
  TrendingUp,
  LayoutTemplate,
  Sparkles,
  Heart,
  Trophy,
};

export default function AchievementsPage() {
  const { stats, achievements: unlockedAchievements, onboardingCompleted } = useUserStore();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const achievementsWithProgress = useMemo(() => {
    return allAchievements.map((achievement) => {
      const unlockedData = unlockedAchievements.find(
        (ua) => ua.achievementId === achievement.id
      );
      const isUnlocked = !!unlockedData;

      // Calculate progress based on achievement criteria
      let currentProgress = 0;
      switch (achievement.id) {
        case 'first-step':
          currentProgress = onboardingCompleted ? 1 : 0;
          break;
        case 'creative-mind':
          currentProgress = stats?.totalPhotos || 0;
          break;
        case 'video-creator':
          currentProgress = stats?.totalVideos || 0;
          break;
        case 'batch-pro':
          currentProgress = stats?.batchesCompleted || 0;
          break;
        case 'consistent-user':
          currentProgress = stats?.totalGenerations || 0;
          break;
        case 'template-master':
          currentProgress = stats?.templatesUsed.length || 0;
          break;
        case 'prompt-expert':
          currentProgress = stats?.totalEnhancements || 0;
          break;
        case 'social-sharer':
          currentProgress = stats?.favoritesCount || 0;
          break;
        case 'msme-champion':
          currentProgress = stats?.totalGenerations || 0;
          break;
      }

      const progressPercentage = Math.min((currentProgress / achievement.threshold) * 100, 100);

      return {
        ...achievement,
        isUnlocked,
        unlockedAt: unlockedData?.unlockedAt,
        currentProgress,
        progressPercentage,
      };
    });
  }, [unlockedAchievements, stats, onboardingCompleted]);

  const filteredAchievements = useMemo(() => {
    return achievementsWithProgress.filter((achievement) => {
      if (filter === 'unlocked') return achievement.isUnlocked;
      if (filter === 'locked') return !achievement.isUnlocked;
      return true;
    });
  }, [achievementsWithProgress, filter]);

  const unlockedCount = achievementsWithProgress.filter((a) => a.isUnlocked).length;
  const totalCount = achievementsWithProgress.length;

  const getRarityColor = (rarity: AchievementRarity) => {
    const colors: Record<AchievementRarity, string> = {
      bronze: 'bg-amber-700 text-amber-100',
      silver: 'bg-gray-400 text-gray-800',
      gold: 'bg-yellow-400 text-yellow-900',
      platinum: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
    };
    return colors[rarity];
  };

  const getCardStyle = (isUnlocked: boolean, rarity: AchievementRarity) => {
    if (!isUnlocked) {
      return 'opacity-60 grayscale';
    }

    const glowColors: Record<AchievementRarity, string> = {
      bronze: 'shadow-amber-200/50',
      silver: 'shadow-gray-300/50',
      gold: 'shadow-yellow-300/50',
      platinum: 'shadow-cyan-300/50',
    };

    return `shadow-lg ${glowColors[rarity]} border-2 ${
      rarity === 'platinum' ? 'border-cyan-300' : 'border-transparent'
    }`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          <Badge variant="secondary" className="ml-auto text-sm">
            {unlockedCount}/{totalCount} Unlocked
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Complete challenges and unlock badges as you master KaryaStudio AI.
        </p>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <Progress value={(unlockedCount / totalCount) * 100} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {Math.round((unlockedCount / totalCount) * 100)}% Complete
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
          className={
            filter === 'all'
              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700'
              : ''
          }
        >
          All
        </Button>
        <Button
          variant={filter === 'unlocked' ? 'default' : 'outline'}
          onClick={() => setFilter('unlocked')}
          size="sm"
          className={
            filter === 'unlocked'
              ? 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700'
              : ''
          }
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Unlocked ({unlockedCount})
        </Button>
        <Button
          variant={filter === 'locked' ? 'default' : 'outline'}
          onClick={() => setFilter('locked')}
          size="sm"
          className={
            filter === 'locked'
              ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700'
              : ''
          }
        >
          <Lock className="w-4 h-4 mr-1" />
          Locked ({totalCount - unlockedCount})
        </Button>
      </div>

      {/* Achievement Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No achievements found</h3>
          <p className="text-muted-foreground">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const IconComponent = iconMap[achievement.icon] || Trophy;

            return (
              <Card
                key={achievement.id}
                className={`group transition-all duration-300 ${getCardStyle(
                  achievement.isUnlocked,
                  achievement.rarity
                )}`}
              >
                <CardContent className="p-6 relative">
                  {/* Locked Overlay */}
                  {!achievement.isUnlocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* Unlocked Checkmark */}
                  {achievement.isUnlocked && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                      achievement.isUnlocked
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                        : 'bg-muted'
                    }`}
                  >
                    <IconComponent
                      className={`w-8 h-8 ${
                        achievement.isUnlocked ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>

                    {/* Rarity Badge */}
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                    </Badge>

                    {/* Progress */}
                    {!achievement.isUnlocked && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {achievement.currentProgress} / {achievement.threshold}
                          </span>
                        </div>
                        <Progress value={achievement.progressPercentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.threshold - achievement.currentProgress} more to unlock
                        </p>
                      </div>
                    )}

                    {/* Unlock Date */}
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <div className="mt-4 text-xs text-muted-foreground">
                        Unlocked on {formatDate(achievement.unlockedAt)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
