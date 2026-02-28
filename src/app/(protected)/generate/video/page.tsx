'use client';

import { useState, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  Download,
  ZoomIn,
  RotateCw,
  Layers,
  Cloud,
  Blend,
  Film,
  Loader2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGenerationStore } from '@/stores/generationStore';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';
import type { MotionStyle, VideoDuration, Generation } from '@/types';

// Motion style data
const motionStyles = [
  {
    id: 'zoom-in' as MotionStyle,
    name: 'Zoom In',
    description: 'Dramatic zoom into the product',
    icon: ZoomIn,
  },
  {
    id: 'rotation-360' as MotionStyle,
    name: '360 Rotation',
    description: 'Full rotation around product',
    icon: RotateCw,
  },
  {
    id: 'parallax' as MotionStyle,
    name: 'Parallax',
    description: 'Layered depth parallax effect',
    icon: Layers,
  },
  {
    id: 'smoke' as MotionStyle,
    name: 'Smoke Effect',
    description: 'Mysterious smoke reveal',
    icon: Cloud,
  },
  {
    id: 'smooth-transition' as MotionStyle,
    name: 'Smooth Transition',
    description: 'Gentle fade transitions',
    icon: Blend,
  },
  {
    id: 'cinematic-pan' as MotionStyle,
    name: 'Cinematic Pan',
    description: 'Wide cinematic movement',
    icon: Film,
  },
];

// Sample images for demo
const sampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    name: 'Modern Watch',
  },
  {
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    name: 'Wireless Headphones',
  },
  {
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    name: 'Sunglasses',
  },
  {
    url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80',
    name: 'Sneakers',
  },
];

export default function VideoGeneratorPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedMotion, setSelectedMotion] = useState<MotionStyle>('zoom-in');
  const [duration, setDuration] = useState<VideoDuration>(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<Generation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addGeneration } = useGenerationStore();
  const { incrementStat } = useUserStore();

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle sample image selection
  const handleSampleSelect = (url: string) => {
    setImageUrl(url);
    setImagePreview(url);
  };

  // Handle video generation
  const handleGenerate = async () => {
    if (!imageUrl) {
      toast.error('Please upload or select an image');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedVideo(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 250);

    try {
      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          motionStyle: selectedMotion,
          duration,
        }),
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (data.success && data.generation) {
        // Add to generation store
        addGeneration(data.generation);

        // Update stats
        incrementStat('totalVideos');
        incrementStat('totalGenerations');

        setGeneratedVideo(data.generation);
        toast.success('Video generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate video');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Video generation error:', error);
      toast.error('An error occurred during video generation');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Handle video play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video download
  const handleDownload = () => {
    if (generatedVideo?.videoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideo.videoUrl;
      link.download = `karya-video-${generatedVideo.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Video download started!');
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Generator</h1>
        <p className="text-muted-foreground">
          Transform your product images into engaging marketing videos with AI-powered motion effects
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT SIDE - Input Form */}
        <div className="space-y-6">
          {/* Image Upload Zone */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Source Image</h3>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <p className="text-sm text-muted-foreground">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium">Click to upload image</p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Sample Images */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Or choose a sample:</p>
                <div className="grid grid-cols-4 gap-3">
                  {sampleImages.map((sample) => (
                    <div
                      key={sample.url}
                      onClick={() => handleSampleSelect(sample.url)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        imageUrl === sample.url
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent'
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="w-full h-20 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Motion Style Selector */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Motion Style</h3>
              <div className="grid grid-cols-2 gap-3">
                {motionStyles.map((style) => {
                  const IconComponent = style.icon;
                  return (
                    <Card
                      key={style.id}
                      onClick={() => setSelectedMotion(style.id)}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedMotion === style.id
                          ? 'border-2 border-primary ring-2 ring-primary/20'
                          : 'border-2 border-transparent'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">
                              {style.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {style.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Duration Selector */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Duration</h3>
              <div className="flex gap-3">
                <Button
                  variant={duration === 15 ? 'default' : 'outline'}
                  onClick={() => setDuration(15)}
                  className="flex-1"
                >
                  15 seconds
                </Button>
                <Button
                  variant={duration === 30 ? 'default' : 'outline'}
                  onClick={() => setDuration(30)}
                  className="flex-1"
                >
                  30 seconds
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !imageUrl}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating... {progress}%
              </>
            ) : (
              <>
                <Video className="w-5 h-5 mr-2" />
                Create Video
              </>
            )}
          </Button>
        </div>

        {/* RIGHT SIDE - Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>

              {isGenerating ? (
                // Loading State
                <div className="space-y-4">
                  <Skeleton className="w-full aspect-video rounded-lg" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Generating video...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing with {motionStyles.find(s => s.id === selectedMotion)?.name} effect</span>
                  </div>
                </div>
              ) : generatedVideo ? (
                // Video Player
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black group">
                    <video
                      ref={videoRef}
                      src={generatedVideo.videoUrl}
                      poster={generatedVideo.thumbnailUrl}
                      className="w-full aspect-video"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      controls
                    />
                    
                    {/* Play/Pause Overlay */}
                    <div
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"
                    >
                      {isPlaying ? (
                        <Pause className="w-16 h-16 text-white" />
                      ) : (
                        <Play className="w-16 h-16 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Generated Video</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {motionStyles.find(s => s.id === selectedMotion)?.name}
                        </Badge>
                        <Badge variant="outline">{duration}s</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
              ) : (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium mb-2">Your video preview will appear here</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Upload an image, select a motion style, and click Generate to create your video
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
