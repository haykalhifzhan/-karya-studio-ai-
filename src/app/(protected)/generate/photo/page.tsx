'use client';

import { useState } from 'react';
import { Camera, Sparkles, Download, Heart, Loader2, Image as ImageIcon, Aperture, Sun, Crown, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGenerationStore } from '@/stores/generationStore';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';
import type { PhotoStyle, Generation } from '@/types';

interface StyleOption {
  id: PhotoStyle;
  name: string;
  description: string;
  icon: typeof Aperture;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'studio',
    name: 'Studio',
    description: 'Clean professional setup',
    icon: Aperture,
  },
  {
    id: 'natural',
    name: 'Natural',
    description: 'Outdoor natural lighting',
    icon: Sun,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury high-end aesthetic',
    icon: Crown,
  },
  {
    id: 'cheerful',
    name: 'Cheerful',
    description: 'Bright colorful and fun',
    icon: Smile,
  },
];

export default function PhotoGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle>('studio');
  const [variations, setVariations] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const addGeneration = useGenerationStore((state) => state.addGeneration);
  const incrementStat = useUserStore((state) => state.incrementStat);

  const maxChars = 500;
  const charCount = prompt.length;

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.success) {
        setEnhancedPrompt(data.enhanced);
        setShowComparisonDialog(true);
      } else {
        toast.error('Failed to enhance prompt');
      }
    } catch (error) {
      console.error('Enhance error:', error);
      toast.error('Error enhancing prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyEnhanced = () => {
    setPrompt(enhancedPrompt);
    setShowComparisonDialog(false);
    toast.success('Enhanced prompt applied');
  };

  const handleKeepOriginal = () => {
    setShowComparisonDialog(false);
    toast.info('Keeping original prompt');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a product description');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setResults([]);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / 30); // 3 seconds total
      });
    }, 100);

    try {
      const response = await fetch('/api/generate/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          variations,
        }),
      });

      const data = await response.json();

      if (data.success) {
        clearInterval(progressInterval);
        setGenerationProgress(100);
        
        // Add to store
        addGeneration(data.generation);
        
        // Update stats
        incrementStat('totalPhotos');
        incrementStat('totalGenerations');
        
        // Set results
        setResults(data.generation.resultUrls || []);
        
        toast.success('Photos generated successfully!');
      } else {
        clearInterval(progressInterval);
        toast.error('Failed to generate photos');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Generation error:', error);
      toast.error('Error generating photos');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `karya-photo-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Photo downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download photo');
    }
  };

  const toggleFavorite = (index: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(index)) {
        newFavorites.delete(index);
        toast.info('Removed from favorites');
      } else {
        newFavorites.add(index);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-gold-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-800 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-gold rounded-xl shadow-lg">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-navy-900 dark:text-white">
                Photo Generator
              </h1>
              <p className="text-navy-600 dark:text-navy-300">
                Create stunning product photos with AI
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout - Split on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT SIDE - Input Form */}
          <div className="space-y-6 animate-slide-in-left">
            <Card className="border-navy-200 dark:border-navy-700 shadow-lg">
              <CardContent className="p-6 space-y-6">
                {/* Product Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-navy-900 dark:text-white">
                      Product Description
                    </label>
                    <Badge
                      variant={charCount > maxChars ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {charCount} / {maxChars}
                    </Badge>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, maxChars))}
                    placeholder="Describe your product in detail... (e.g., 'A premium leather handbag with gold accents, placed on a marble surface with soft lighting')"
                    className="min-h-[150px] resize-none border-navy-200 dark:border-navy-700 focus:ring-gold-500 focus:border-gold-500"
                    maxLength={maxChars}
                  />
                  
                  {/* Prompt Enhancer Button */}
                  <div className="mt-3">
                    <Button
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || !prompt.trim()}
                      variant="outline"
                      className="w-full border-gold-300 text-gold-700 hover:bg-gold-50 dark:border-gold-600 dark:text-gold-400 dark:hover:bg-navy-800"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Style Selector */}
                <div>
                  <label className="text-sm font-semibold text-navy-900 dark:text-white mb-3 block">
                    Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLE_OPTIONS.map((style) => {
                      const Icon = style.icon;
                      const isSelected = selectedStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 shadow-lg scale-105'
                              : 'border-navy-200 dark:border-navy-700 hover:border-gold-300 dark:hover:border-gold-600'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? 'bg-gold-500 text-white'
                                  : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-navy-900 dark:text-white text-sm">
                                {style.name}
                              </div>
                              <div className="text-xs text-navy-600 dark:text-navy-400 line-clamp-2">
                                {style.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variations Selector */}
                <div>
                  <label className="text-sm font-semibold text-navy-900 dark:text-white mb-3 block">
                    Number of Variations
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => setVariations(num)}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all duration-200 ${
                          variations === num
                            ? 'border-gold-500 bg-gold-500 text-white shadow-lg scale-105'
                            : 'border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:border-gold-300 dark:hover:border-gold-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full h-14 text-lg font-semibold bg-gradient-gold hover:opacity-90 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating... {Math.round(generationProgress)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Generate Photos
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE - Results */}
          <div className="animate-slide-in-right">
            <Card className="border-navy-200 dark:border-navy-700 shadow-lg min-h-[600px]">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">
                  Generated Photos
                </h2>

                {/* Loading State */}
                {isGenerating && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: variations }).map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="w-full aspect-square rounded-xl shimmer-bg animate-shimmer" />
                        <Skeleton className="w-full h-10 rounded-lg" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Results Grid */}
                {!isGenerating && results.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="group relative rounded-xl overflow-hidden border-2 border-navy-200 dark:border-navy-700 hover:border-gold-500 dark:hover:border-gold-500 transition-all duration-300 hover:shadow-xl animate-scale-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Image */}
                        <div className="aspect-square bg-navy-100 dark:bg-navy-800">
                          <img
                            src={imageUrl}
                            alt={`Generated photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                            <Button
                              size="sm"
                              onClick={() => handleDownload(imageUrl, index)}
                              className="bg-white text-navy-900 hover:bg-gold-100 shadow-lg"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleFavorite(index)}
                              className={`shadow-lg ${
                                favorites.has(index)
                                  ? 'bg-gold-500 text-white border-gold-500 hover:bg-gold-600'
                                  : 'bg-white text-navy-900 border-white hover:bg-gold-100'
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  favorites.has(index) ? 'fill-current' : ''
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!isGenerating && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-900/20 dark:to-gold-800/20 flex items-center justify-center mb-6 animate-float">
                      <ImageIcon className="w-16 h-16 text-gold-600 dark:text-gold-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">
                      Your photos will appear here
                    </h3>
                    <p className="text-navy-600 dark:text-navy-400 max-w-md">
                      Enter a product description, choose a style, and click generate to create stunning AI-powered product photos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Prompt Comparison Dialog */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-gold-500" />
              Enhanced Prompt Suggestion
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Original Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-navy-700 dark:text-navy-300">
                Original Prompt
              </label>
              <div className="p-4 rounded-lg bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700">
                <p className="text-navy-900 dark:text-white">{prompt}</p>
              </div>
            </div>

            {/* Enhanced Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gold-700 dark:text-gold-400">
                Enhanced Prompt
              </label>
              <div className="p-4 rounded-lg bg-gold-50 dark:bg-gold-900/20 border-2 border-gold-300 dark:border-gold-600">
                <p className="text-navy-900 dark:text-white">{enhancedPrompt}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleApplyEnhanced}
                className="flex-1 bg-gradient-gold text-white hover:opacity-90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Enhanced
              </Button>
              <Button
                onClick={handleKeepOriginal}
                variant="outline"
                className="flex-1 border-navy-300 dark:border-navy-600"
              >
                Keep Original
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
