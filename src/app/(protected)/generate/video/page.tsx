'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useGenerationStore } from '@/stores/generationStore';
import type { Generation } from '@/types';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Film,
  Loader2,
  Maximize2,
  Play,
  Sparkles,
  Upload,
  Video,
  Wand2,
  Waves,
  X,
  Zap,
  ZoomIn
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../../convex/_generated/api';

/* ─── Data ─────────────────────────────────────────────────────── */

const MOTION_STYLES = [
  { id: 'smooth', name: 'Smooth', desc: 'Gentle flowing movement', icon: Waves, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  { id: 'dynamic', name: 'Dynamic', desc: 'Energetic, fast-paced', icon: Zap, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  { id: 'cinematic', name: 'Cinematic', desc: 'Movie-like camera work', icon: Film, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { id: 'zoom-in', name: 'Zoom In', desc: 'Slow zoom into subject', icon: ZoomIn, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  { id: 'pan-left', name: 'Pan Left', desc: 'Camera sweeps left', icon: ArrowLeft, color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  { id: 'pan-right', name: 'Pan Right', desc: 'Camera sweeps right', icon: ArrowRight, color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
];

/* ─── Component ─────────────────────────────────────────────────── */

export default function VideoGeneratorPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [motionStyle, setMotionStyle] = useState('smooth');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<Generation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [showEnhDialog, setShowEnhDialog] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addGeneration } = useGenerationStore();

  const MAX_CHARS = 500;
  const activeMotion = MOTION_STYLES.find((m) => m.id === motionStyle)!;
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.auth.getCurrentUser,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );
  const createGeneration = useMutation(api.generations.create);

  /* ── Upload ─────────────────────────────────────────────────── */
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be less than 5MB'); return; }
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    toast.success('Image uploaded');
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) processFile(e.target.files[0]); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const removeFile = () => {
    setUploadedFile(null);
    if (previewUrl && uploadedFile) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Sample picker ───────────────────────────────────────────── */
  const selectSample = (url: string) => { setPreviewUrl(url.trim()); setUploadedFile(null); };

  /* ── Enhance ─────────────────────────────────────────────────── */
  const handleEnhance = async () => {
    if (!videoPrompt.trim()) { toast.error('Enter a description first'); return; }
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/generate/enhance-video-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt, motionStyle }),
      });
      const data = await res.json();
      if (data.success) { setEnhancedPrompt(data.enhanced); setShowEnhDialog(true); }
      else toast.error('Failed to enhance prompt');
    } catch { toast.error('Error enhancing prompt'); }
    finally { setIsEnhancing(false); }
  };

  /* ── Generate ────────────────────────────────────────────────── */
  const handleGenerate = async () => {
    if (!previewUrl) { toast.error('Please upload or select an image first'); return; }
    setIsGenerating(true); setProgress(10); setGeneratedVideo(null);
    try {
      let imageUrlForApi = previewUrl.trim();

      if (uploadedFile) {
        setProgress(20);
        toast.info('Uploading image...');
        const form = new FormData();
        form.append('file', uploadedFile);
        const up = await fetch('/api/upload', { method: 'POST', body: form });
        const upd = await up.json();
        if (!upd.success) throw new Error(upd.message || 'Upload failed');
        imageUrlForApi = upd.url.trim();
        setProgress(50);
      }

      setProgress(60);
      toast.info('Generating video with AI...');
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageUrlForApi, prompt: videoPrompt, motionStyle, duration, aspectRatio: '1280*720' }),
      });
      const data = await res.json();

      if (data.success && data.generation) {
        setProgress(100);
        addGeneration(data.generation);
        setGeneratedVideo(data.generation);
        if (data.success && data.generation) {
          setProgress(100);
          addGeneration(data.generation);
          setGeneratedVideo(data.generation);
          toast.success('Video generated!');

          // Simpan ke Convex
          if (convexUser?._id) {
            try {
              await createGeneration({
                userId: convexUser._id,
                type: 'video',
                prompt: videoPrompt,
                enhancedPrompt: enhancedPrompt || undefined, // jika ada
                style: motionStyle,
                status: 'completed',
                resultUrls: data.generation.videoUrl ? [data.generation.videoUrl] : [],
                thumbnailUrl: data.generation.thumbnailUrl,
                videoUrl: data.generation.videoUrl,
                // templateId, isFavorite optional
              });
            } catch (saveError) {
              console.error('Gagal menyimpan ke Convex:', saveError);
              // Jangan ganggu user, cukup log
            }
          } else {
            console.warn('User Convex tidak ditemukan, generation tidak disimpan');
          }
        }
        toast.success('Video generated!');
      } else {
        toast.error(data.message || 'Failed to generate video', { description: data.hint || '' });
      }
    } catch (err) {
      toast.error('Error generating video', { description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsGenerating(false); setTimeout(() => setProgress(0), 800);
    }
  };

  /* ── Download ────────────────────────────────────────────────── */
  const handleDownload = async () => {
    if (!generatedVideo?.videoUrl) return;
    try {
      const res = await fetch(generatedVideo.videoUrl, { mode: 'cors' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `karya-video-${Date.now()}.mp4`,
      });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast.success('Downloaded!');
    } catch {
      window.open(generatedVideo.videoUrl, '_blank');
      toast.success('Opened in new tab');
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  /* ══════════════════════════════════ JSX ══════════════════════════════════ */
  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-indigo-600/6 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/4 blur-[120px] rounded-full" />
      </div>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-400/40 blur-lg rounded-xl" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 via-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/40">
              <Video className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Video Generator</h1>
            <p className="text-sm text-white/40">Turn your product photos into cinematic videos</p>
          </div>
        </div>

        {/* Desktop generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !previewUrl}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:from-indigo-600/50 disabled:to-violet-700/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/30"
        >
          {isGenerating
            ? <><Loader2 className="w-4 h-4 animate-spin" />{progress}%</>
            : <><Video className="w-4 h-4" />Generate Video</>
          }
        </button>
      </div>

      {/* Progress bar */}
      {isGenerating && (
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>

        {/* ════════════ LEFT: Controls ════════════ */}
        <div className="space-y-3">

          {/* ① Source image */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Source Image <span className="normal-case font-semibold text-white/60">· required</span></p>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {previewUrl ? (
              <div
                className="relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer"
                onClick={removeFile}
              >
                <img src={previewUrl} alt="Source" className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <X className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-semibold">Remove</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center py-8 gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-200">
                    <Upload className="w-5 h-5 text-white/30 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">Drop image here or click to browse</p>
                    <p className="text-xs text-white/25 mt-0.5">JPG, PNG, GIF · max 5MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sample images */}
            <div className="mt-4">
              <p className="text-xs text-white/30 mb-2.5 font-medium">
                {previewUrl ? 'Or choose a different sample:' : 'Or try a sample image:'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSample(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${previewUrl === img
                      ? 'border-indigo-500 shadow-lg shadow-indigo-500/25'
                      : 'border-white/10 hover:border-indigo-500/40'
                      }`}
                  >
                    <img src={img} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ② Description */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Video Description <span className="normal-case font-normal">· optional</span></p>
              <span className={`text-xs font-mono ${videoPrompt.length > MAX_CHARS * 0.9 ? 'text-rose-400' : 'text-white/25'}`}>
                {videoPrompt.length}/{MAX_CHARS}
              </span>
            </div>

            <Textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value.slice(0, MAX_CHARS))}
              placeholder="e.g. Product rotating slowly with dramatic lighting and smoke effect..."
              className="min-h-[100px] resize-none bg-white/[0.03] border-white/8 text-white/90 placeholder:text-white/20 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 rounded-xl text-sm leading-relaxed"
              maxLength={MAX_CHARS}
            />

            <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${videoPrompt.length > MAX_CHARS * 0.9 ? 'bg-rose-500' : 'bg-indigo-500/50'}`}
                style={{ width: `${(videoPrompt.length / MAX_CHARS) * 100}%` }}
              />
            </div>

            <p className="text-xs text-white/25 mt-2">Leave empty — AI will infer motion from the image</p>

            <button
              onClick={handleEnhance}
              disabled={isEnhancing || !videoPrompt.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/35 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isEnhancing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Enhancing...</>
                : <><Wand2 className="w-3.5 h-3.5" />Enhance description with AI</>
              }
            </button>
          </div>

          {/* ③ Motion style + Duration */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">

            {/* Motion */}
            <div className="p-5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Motion Style</p>
              <div className="grid grid-cols-2 gap-2">
                {MOTION_STYLES.map((style) => {
                  const Icon = style.icon;
                  const active = motionStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setMotionStyle(style.id)}
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${active
                        ? 'border-indigo-500/50 bg-indigo-500/8'
                        : 'border-white/12 bg-white/6 hover:bg-white/10 hover:border-white/20'
                        }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: active ? style.bg : 'rgba(255,255,255,0.10)' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: active ? style.color : 'rgba(255,255,255,0.55)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-none ${active ? 'text-white' : 'text-white/75'}`}>{style.name}</p>
                        <p className="text-[11px] text-white/40 mt-1 leading-none">{style.desc}</p>
                      </div>
                      {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Duration</p>
                <span className="text-sm font-bold text-white tabular-nums">{duration}s</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10"
                style={{ accentColor: '#6366f1' }}
              />
              <div className="flex justify-between mt-2">
                {[3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <span key={s} className={`text-[10px] font-medium ${s === duration ? 'text-indigo-400' : 'text-white/20'}`}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Generate — mobile only */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !previewUrl}
            className="md:hidden w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:from-indigo-600/60 disabled:to-violet-700/60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/30"
          >
            {isGenerating
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating... {progress}%</>
              : <><Video className="w-4 h-4" />Generate Video</>
            }
          </button>
        </div>

        {/* ════════════ RIGHT: Results ════════════ */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden min-h-[560px] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <p className="text-sm font-bold text-white">Generated Video</p>
            {generatedVideo && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  {activeMotion.name} · {duration}s
                </span>
                <button
                  onClick={() => setShowPreviewDialog(true)}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-white/50" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-6">

            {/* Loading */}
            {isGenerating && (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/40">Processing with AI...</span>
                  <span className="text-indigo-400 font-mono font-bold">{progress}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Skeleton className="w-full aspect-video rounded-xl bg-white/5 mt-4" />
              </div>
            )}

            {/* Result */}
            {!isGenerating && generatedVideo && (
              <div className="space-y-5">
                <div className="relative rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                  <video
                    ref={videoRef}
                    src={generatedVideo.videoUrl}
                    poster={generatedVideo.thumbnailUrl}
                    className="w-full aspect-video"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    controls={isPlaying}
                  />
                  {!isPlaying && (
                    <div
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 group-hover:bg-black/50 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-indigo-500/90 flex items-center justify-center shadow-2xl shadow-indigo-500/40 group-hover:scale-110 transition-transform duration-200">
                        <Play className="w-7 h-7 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
                >
                  <Download className="w-4 h-4" />Download MP4
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isGenerating && !generatedVideo && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-5">
                  <Video className="w-9 h-9 text-white/15" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Your video will appear here</h3>
                <p className="text-sm text-white/35 max-w-[240px] leading-relaxed">
                  Upload or select a product image, choose a motion style, then hit{' '}
                  <span className="text-indigo-400 font-semibold">Generate</span>
                </p>

                <div className="mt-8 space-y-3 text-left">
                  {[
                    { n: '1', label: 'Upload your product image' },
                    { n: '2', label: 'Choose motion style & duration' },
                    { n: '3', label: 'Click Generate Video' },
                  ].map((step) => (
                    <div key={step.n} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-indigo-500/30 bg-indigo-500/8 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-indigo-400">{step.n}</span>
                      </div>
                      <span className="text-xs text-white/35">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════ Enhance Dialog ════════════ */}
      <Dialog open={showEnhDialog} onOpenChange={setShowEnhDialog}>
        <DialogContent className="max-w-lg rounded-2xl border-white/8 bg-[#0a0a0a] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Wand2 className="w-4 h-4 text-indigo-400" />
              AI Enhanced Description
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-white/35 uppercase tracking-wider">Original</p>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <p className="text-sm text-white/70 leading-relaxed">{videoPrompt}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />Enhanced
              </p>
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <p className="text-sm text-white/80 leading-relaxed">{enhancedPrompt}</p>
              </div>
            </div>

            <DialogFooter className="flex gap-2.5 pt-1">
              <Button
                onClick={() => { setVideoPrompt(enhancedPrompt); setShowEnhDialog(false); toast.success('Enhanced description applied'); }}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-500 text-white border-0 rounded-xl font-semibold text-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />Apply Enhanced
              </Button>
              <Button
                onClick={() => { setShowEnhDialog(false); toast.info('Keeping original'); }}
                variant="outline"
                className="flex-1 h-10 rounded-xl border-white/10 text-white/60 hover:text-white bg-transparent hover:bg-white/5 text-sm"
              >
                Keep Original
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════ Fullscreen Preview Dialog ════════════ */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl p-0 rounded-2xl border-white/8 bg-[#080808] overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-white/5 flex-row items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-white">Video Preview</DialogTitle>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />Download
            </button>
          </DialogHeader>
          {generatedVideo && (
            <div className="p-4">
              <video
                src={generatedVideo.videoUrl}
                controls
                autoPlay
                className="w-full rounded-xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
