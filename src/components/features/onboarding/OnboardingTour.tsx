'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  Camera,
  Video,
  LayoutTemplate,
  Trophy,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';

const steps = [
  {
    title: 'Welcome to KaryaStudio AI!',
    description:
      'Your professional design studio for creating stunning product photos and promo videos. Let us show you around!',
    icon: Sparkles,
    color: 'from-gold-400 to-gold-600',
  },
  {
    title: 'Your Dashboard',
    description:
      'This is your command center. View your stats, access quick actions, and see your recent creations all in one place.',
    icon: LayoutDashboard,
    color: 'from-blue-400 to-blue-600',
  },
  {
    title: 'Generate Product Photos',
    description:
      'Describe your product or upload an image, choose a style, and let AI create professional photos instantly. Try the prompt enhancer for better results!',
    icon: Camera,
    color: 'from-green-400 to-green-600',
  },
  {
    title: 'Create Promo Videos',
    description:
      'Transform your product photos into cinematic promo videos with motion effects like zoom, parallax, and cinematic pan.',
    icon: Video,
    color: 'from-purple-400 to-purple-600',
  },
  {
    title: 'Template Gallery',
    description:
      'Browse 25+ ready-made prompt templates organized by category. One click fills in everything for you — just customize and generate!',
    icon: LayoutTemplate,
    color: 'from-orange-400 to-orange-600',
  },
  {
    title: 'Earn Achievements!',
    description:
      'Complete challenges to unlock badges and track your creative journey. You just earned your first one — "First Step"!',
    icon: Trophy,
    color: 'from-gold-400 to-gold-600',
  },
];

function ConfettiEffect() {
  const [particles, setParticles] = useState<
    Array<{ id: number; left: number; color: string; delay: number; size: number }>
  >([]);

  useEffect(() => {
    const colors = ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
    const items = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const { onboardingCompleted, completeOnboarding, unlockAchievement } = useUserStore();

  useEffect(() => {
    if (onboardingCompleted) {
      setIsVisible(false);
    }
  }, [onboardingCompleted]);

  const handleComplete = useCallback(() => {
    setShowConfetti(true);
    completeOnboarding();
    unlockAchievement('first-step');
    toast.success('Onboarding complete! You earned the "First Step" badge!');

    setTimeout(() => {
      setShowConfetti(false);
      setIsVisible(false);
      router.push('/dashboard');
    }, 2500);
  }, [completeOnboarding, unlockAchievement, router]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSkip = () => {
    completeOnboarding();
    setIsVisible(false);
    router.push('/dashboard');
  };

  if (!isVisible || onboardingCompleted) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const progressValue = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {showConfetti && <ConfettiEffect />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Card className="w-full max-w-lg animate-scale-in border-border bg-card shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSkip}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <Progress value={progressValue} className="mb-8 h-2" />

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg animate-float`}
              >
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <button
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-8 bg-primary'
                      : i < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted'
                  }`}
                  onClick={() => setCurrentStep(i)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                Skip Tour
              </Button>

              <Button onClick={handleNext} className="gap-1 bg-primary hover:bg-primary/90">
                {isLastStep ? 'Get Started!' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
