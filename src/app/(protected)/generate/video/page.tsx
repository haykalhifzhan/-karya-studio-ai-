'use client';

import { useState, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  Download,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useGenerationStore } from '@/stores/generationStore';
import { toast } from 'sonner';
import type { Generation } from '@/types';

const motionStyles = [
  { id: 'smooth', name: 'Smooth', icon: '🌊', desc: 'Gentle, flowing movement' },
  { id: 'dynamic', name: 'Dynamic', icon: '⚡', desc: 'Energetic, fast-paced' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎥', desc: 'Movie-like camera movement' },
  { id: 'zoom-in', name: 'Zoom In', icon: '🔍', desc: 'Slow zoom into subject' },
  { id: 'pan-left', name: 'Pan Left', icon: '⬅️', desc: 'Camera pans left' },
  { id: 'pan-right', name: 'Pan Right', icon: '➡️', desc: 'Camera pans right' },
];

const sampleImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
];

export default function VideoGeneratorPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [motionStyle, setMotionStyle] = useState('smooth');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<Generation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // ✅ NEW: Enhance Prompt State
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [showEnhanceDialog, setShowEnhanceDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addGeneration } = useGenerationStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG, PNG, GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast.success('Image uploaded successfully');
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please drop an image file (JPG, PNG, GIF)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast.success('Image uploaded successfully');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSampleSelect = (url: string) => {
    setPreviewUrl(url.trim());
    setUploadedFile(null);
  };

  // ✅ NEW: Enhance Prompt Handler
  const handleEnhancePrompt = async () => {
    if (!videoPrompt.trim()) {
      toast.error('Please enter a video description first');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-video-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: videoPrompt,
          motionStyle 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEnhancedPrompt(data.enhanced);
        setShowEnhanceDialog(true);
        toast.success('Prompt enhanced successfully!');
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
    setVideoPrompt(enhancedPrompt);
    setShowEnhanceDialog(false);
    toast.success('Enhanced prompt applied');
  };

  const handleKeepOriginal = () => {
    setShowEnhanceDialog(false);
    toast.info('Keeping original prompt');
  };

  const handleGenerate = async () => {
    if (!previewUrl) {
      toast.error('Please upload or select an image');
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setGeneratedVideo(null);

    try {
      let imageUrlForApi = previewUrl.trim();
      
      if (uploadedFile) {
        setProgress(20);
        toast.info('Uploading image to OSS...');
        
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const uploadResponse = await fetch('/api/upload-to-oss', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadData.success) {
          throw new Error(uploadData.message || 'Failed to upload image');
        }
        
        imageUrlForApi = uploadData.url.trim();
        console.log('✅ Uploaded to OSS:', imageUrlForApi);
        setProgress(50);
      }

      setProgress(60);
      toast.info('Generating video with AI...');

      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrlForApi,
          prompt: videoPrompt,
          motionStyle,
          duration,
          aspectRatio: '1280*720'
        }),
      });

      const data = await response.json();
      console.log('📥 Response:', data);

      if (data.success && data.generation) {
        setProgress(100);
        addGeneration(data.generation);
        setGeneratedVideo(data.generation);
        toast.success('Video generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate video', {
          description: data.hint || '',
        });
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Error generating video', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

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

  const handleDownload = async () => {
    if (!generatedVideo?.videoUrl) return;

    try {
      const response = await fetch(generatedVideo.videoUrl, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `karya-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Video downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      window.open(generatedVideo.videoUrl, '_blank');
      toast.success('Video opened in new tab');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-gold-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-800 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-gold rounded-xl shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-navy-900 dark:text-white">
                Video Generator
              </h1>
              <p className="text-navy-600 dark:text-navy-300">
                Transform your product images into engaging marketing videos with AI
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT SIDE - Input */}
          <div className="space-y-6 animate-slide-in-left">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Source Image</h3>
                
                <div
                  onClick={() => !previewUrl && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    previewUrl 
                      ? 'border-gold-300 bg-gold-50 dark:bg-gold-900/10' 
                      : 'border-navy-200 hover:border-gold-300 dark:border-navy-700'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {previewUrl ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="w-10 h-10 mx-auto mb-2 text-navy-400" />
                      <p className="text-navy-900 dark:text-white font-medium text-sm">
                        Click or drag to upload
                      </p>
                      <p className="text-xs text-navy-600 dark:text-navy-400 mt-1">
                        JPG, PNG or GIF (max. 5MB)
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm text-navy-600 dark:text-navy-400 mb-3">
                    {previewUrl ? 'Or choose a different sample:' : 'Or choose a sample:'}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {sampleImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSampleSelect(img)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          previewUrl === img
                            ? 'border-gold-500 ring-2 ring-gold-300'
                            : 'border-navy-200 hover:border-gold-300 dark:border-navy-700'
                        }`}
                      >
                        <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ✅ UPDATED: Video Description dengan Enhance Button */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold-500" />
                    <h3 className="text-lg font-semibold">Video Description (Optional)</h3>
                  </div>
                  <Button
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !videoPrompt.trim()}
                    variant="outline"
                    size="sm"
                    className="border-gold-300 text-gold-700 hover:bg-gold-50 dark:border-gold-600 dark:text-gold-400"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Enhance
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe how you want the video to look... (e.g., 'Product rotating slowly with dramatic lighting')"
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-2">
                  Leave empty for automatic generation based on the image
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Motion Style</h3>
                <div className="grid grid-cols-2 gap-3">
                  {motionStyles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setMotionStyle(style.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        motionStyle === style.id
                          ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 shadow-lg'
                          : 'border-navy-200 dark:border-navy-700 hover:border-gold-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{style.icon}</div>
                      <div className="font-semibold text-sm">{style.name}</div>
                      <div className="text-xs text-navy-600 dark:text-navy-400">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Duration: {duration}s</h3>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-gold-500"
                />
                <div className="flex justify-between text-xs text-navy-600 dark:text-navy-400 mt-2">
                  <span>3s</span><span>10s</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !previewUrl}
              className="w-full h-14 text-lg font-semibold bg-gradient-gold hover:opacity-90 text-white shadow-lg disabled:opacity-50"
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating... {progress}%</>
              ) : (
                <><Video className="w-5 h-5 mr-2" /> Generate Video</>
              )}
            </Button>
          </div>

          {/* RIGHT SIDE - Preview */}
          <div className="animate-slide-in-right">
            <Card className="min-h-[600px]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>

                {isGenerating ? (
                  <div className="space-y-4">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Generating video...</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                ) : generatedVideo ? (
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
                      <div
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-black/30"
                      >
                        {isPlaying ? <Pause className="w-16 h-16 text-white" /> : <Play className="w-16 h-16 text-white" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Generated Video</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{motionStyle}</Badge>
                          <Badge variant="outline">{duration}s</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setShowPreviewDialog(true)}>
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button onClick={handleDownload} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" /> Download Video
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4">
                      <Video className="w-8 h-8 text-gold-600" />
                    </div>
                    <p className="font-medium mb-2">Your video will appear here</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Upload an image and click Generate to create your video
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Enhance Prompt Dialog */}
      <Dialog open={showEnhanceDialog} onOpenChange={setShowEnhanceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-gold-500" />
              Enhanced Video Prompt
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Original Prompt */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-navy-700 dark:text-navy-300">
                Original Prompt
              </label>
              <div className="p-4 rounded-lg bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700">
                <p className="text-navy-900 dark:text-white">{videoPrompt}</p>
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
            <DialogFooter className="flex gap-3 pt-4">
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
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          {generatedVideo && (
            <video
              src={generatedVideo.videoUrl}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>Close</Button>
            <Button onClick={handleDownload}><Download className="w-4 h-4 mr-2" /> Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}