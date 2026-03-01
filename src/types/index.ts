// ========================
// Enums
// ========================

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type GenerationType = 'photo' | 'video';
export type TemplateCategory = 'food' | 'fashion' | 'handicrafts' | 'electronics' | 'cosmetics';
export type PhotoStyle = 'studio' | 'natural' | 'premium' | 'cheerful';
export type MotionStyle = 'zoom-in' | 'rotation-360' | 'parallax' | 'smoke' | 'smooth-transition' | 'cinematic-pan';
export type VideoDuration = 15 | 30;
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

// ========================
// Core Models
// ========================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface UserStats {
  totalGenerations: number;
  totalPhotos: number;
  totalVideos: number;
  totalEnhancements: number;
  templatesUsed: string[];
  favoritesCount: number;
  batchesCompleted: number;
}

export interface Generation {
  id: string;
  type: GenerationType;
  prompt: string;
  enhancedPrompt?: string;
  style?: PhotoStyle | MotionStyle;
  status: GenerationStatus;
  resultUrls: string[];
  thumbnailUrl?: string;
  videoUrl?: string;
  templateId?: string;
  isFavorite: boolean;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  prompt: string;
  previewUrl: string;
  tags: string[];
  usageCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  criteria: string;
  threshold: number;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

// ========================
// API Types
// ========================

export interface GeneratePhotoRequest {
  prompt: string;
  style: PhotoStyle;
  imageUrl?: string;
  variations: number;
  batchMode?: boolean;
  templateId?: string;
}

export interface GeneratePhotoResponse {
  success: boolean;
  generation: Generation;
}

export interface GenerateVideoRequest {
  imageUrl: string;
  motionStyle: MotionStyle;
  duration: VideoDuration;
}

export interface GenerateVideoResponse {
  success: boolean;
  generation: Generation;
}

export interface EnhancePromptRequest {
  prompt: string;
}

export interface EnhancePromptResponse {
  success: boolean;
  original: string;
  enhanced: string;
  improvements: string[];
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

// ========================
// Daily Tips
// ========================

export interface DailyTip {
  id: number;
  title: string;
  content: string;
  icon: string;
}
