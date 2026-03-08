'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { PhotoStyle } from '@/types';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import {
  Aperture,
  Camera,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Smile,
  Sparkles,
  Sun,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../../convex/_generated/api';

/* ─── Data ─────────────────────────────────────────────────────── */

const STYLE_OPTIONS = [
  { id: 'studio' as PhotoStyle, name: 'Studio', description: 'Clean professional setup', icon: Aperture, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { id: 'natural' as PhotoStyle, name: 'Natural', description: 'Warm outdoor lighting', icon: Sun, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  { id: 'premium' as PhotoStyle, name: 'Premium', description: 'Luxury high-end aesthetic', icon: Crown, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  { id: 'cheerful' as PhotoStyle, name: 'Cheerful', description: 'Bright colorful and fun', icon: Smile, color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
];

const SIZE_OPTIONS = [
  { label: 'Square', ratio: '1:1', value: '1024x1024', size: '1328×1328', desc: 'Instagram · Product' },
  { label: 'Landscape', ratio: '16:9', value: '1664x928', size: '1664×928', desc: 'Banner · Thumbnail' },
  { label: 'Standard', ratio: '4:3', value: '1472x1104', size: '1472×1104', desc: 'Classic photo ratio' },
  { label: 'Portrait', ratio: '3:4', value: '1104x1472', size: '1104×1472', desc: 'Pinterest · Portrait' },
  { label: 'Vertical', ratio: '9:16', value: '928x1664', size: '928×1664', desc: 'Story · Reels' },
];

/* ─── Component ─────────────────────────────────────────────────── */

export default function PhotoGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle>('studio');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [variations, setVariations] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [showEnhDialog, setShowEnhDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 500;
  const activeSize = SIZE_OPTIONS.find((s) => s.value === selectedSize)!;
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
    toast.success('Reference image added');
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) processFile(e.target.files[0]); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const removeFile = () => {
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Enhance ─────────────────────────────────────────────────── */
  const handleEnhance = async () => {
    if (!prompt.trim()) { toast.error('Enter a prompt first'); return; }
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/generate/enhance-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      if (data.success) { setEnhancedPrompt(data.enhanced); setShowEnhDialog(true); }
      else toast.error('Failed to enhance prompt');
    } catch { toast.error('Error enhancing prompt'); }
    finally { setIsEnhancing(false); }
  };

  /* ── Generate ────────────────────────────────────────────────── */
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a product description');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResults([]);

    const tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(tick);
          return 90;
        }
        return p + 3;
      });
    }, 100);

    try {
      let referenceImageUrl: string | null = null;

      // ✅ Upload to OSS first if user provided image
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          throw new Error('Failed to upload image');
        }

        // 🔥 FIX 1: Trim URL dari response upload API (hapus spasi awal/akhir)
        referenceImageUrl = uploadData.url?.toString().trim() || null;

        // Debug log untuk memastikan URL bersih
        console.log('📤 Upload response URL:', `"${referenceImageUrl}"`);
        console.log('📤 URL length:', referenceImageUrl?.length);
      }

      // 🔥 FIX 2: Pastikan URL final yang dikirim sudah di-trim lagi (double safety)
      const finalReferenceUrl = referenceImageUrl?.trim() || null;

      const res = await fetch('/api/generate/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          variations,
          size: selectedSize,
          // ✅ Hanya tambahkan referenceImageUrl jika ada nilainya (tidak null/empty)
          ...(finalReferenceUrl && { referenceImageUrl: finalReferenceUrl }),
        }),
      });

      const data = await res.json();
      clearInterval(tick);
      setProgress(100);

      if (data.success) {
        const generation = data.generation; // asumsinya dari API

        // Simpan ke Convex jika user tersedia
        if (convexUser?._id && generation?.resultUrls?.length) {
          try {
            await createGeneration({
              userId: convexUser._id,
              type: 'photo',
              prompt: prompt,
              enhancedPrompt: undefined, // nanti bisa diisi jika ada fitur enhance
              style: selectedStyle,
              status: 'completed',
              resultUrls: generation.resultUrls,
              thumbnailUrl: generation.thumbnailUrl || generation.resultUrls[0],
              // templateId: variations?.toString(), // optional
            });
          } catch (saveError) {
            console.error('Failed to save to Convex:', saveError);
          }
        }

        // Tampilkan hasil di UI
        if (generation?.resultUrls?.length) {
          setResults(generation.resultUrls);
          toast.success(`${generation.resultUrls.length} photo(s) generated!`);
        } else {
          toast.warning('No images returned');
        }
      }

    } catch (err: any) {
      clearInterval(tick);
      console.error('❌ Generation error:', err);
      toast.error(err.message || 'Generation error');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  /* ── Download ────────────────────────────────────────────────── */
  const handleDownload = async (url: string, idx: number) => {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `karya-photo-${Date.now()}-${idx + 1}.png`,
      });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast.success('Downloaded!');
    } catch {
      window.open(url, '_blank');
      toast.success('Opened in new tab — right-click to save');
    }
  };

  /* ── Preview nav ─────────────────────────────────────────────── */
  const navigate = (dir: 1 | -1) => {
    const next = (previewIndex + dir + results.length) % results.length;
    setPreviewIndex(next); setPreviewImage(results[next]);
  };

  /* ═══════════════════════════════ JSX ═══════════════════════════════ */
  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Ambient background glows — matching dashboard */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-purple-600/6 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/4 blur-[120px] rounded-full" />
      </div>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400/40 blur-lg rounded-xl" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 via-purple-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/40">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Photo Generator</h1>
              <p className="text-sm text-white/40">Create stunning product photos with AI</p>
            </div>
          </div>
        </div>

        {/* Generation button — top right on desktop */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 disabled:from-violet-500/50 disabled:to-purple-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
        >
          {isGenerating
            ? <><Loader2 className="w-4 h-4 animate-spin" />{Math.round(progress)}%</>
            : <><Sparkles className="w-4 h-4" />Generate Photos</>
          }
        </button>
      </div>

      {/* Progress bar (global, under header) */}
      {isGenerating && (
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>

        {/* ════════════ LEFT: Controls ════════════ */}
        <div className="space-y-3">

          {/* ① Reference image */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
              Reference Image <span className="normal-case font-normal">· optional</span>
            </p>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {previewUrl ? (
              <div
                className="relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer"
                onClick={removeFile}
              >
                <img src={previewUrl} alt="Reference" className="w-full aspect-video object-cover" />
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
                className="border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-xl transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center py-8 gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-200">
                    <Upload className="w-5 h-5 text-white/30 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">Drop image here or click to browse</p>
                    <p className="text-xs text-white/25 mt-0.5">JPG, PNG, GIF · max 5MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ② Prompt */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Product Description</p>
              <span className={`text-xs font-mono ${prompt.length > MAX_CHARS * 0.9 ? 'text-rose-400' : 'text-white/25'}`}>
                {prompt.length}/{MAX_CHARS}
              </span>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
              placeholder="e.g. Sleek matte black perfume bottle on white marble with soft warm lighting and subtle shadows..."
              className="min-h-[120px] resize-none bg-white/[0.03] border-white/8 text-white/90 placeholder:text-white/20 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 rounded-xl text-sm leading-relaxed"
              maxLength={MAX_CHARS}
            />

            {/* Char bar */}
            <div className="mt-2.5 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${prompt.length > MAX_CHARS * 0.9 ? 'bg-rose-500' : 'bg-purple-500/50'}`}
                style={{ width: `${(prompt.length / MAX_CHARS) * 100}%` }}
              />
            </div>

            <button
              onClick={handleEnhance}
              disabled={isEnhancing || !prompt.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/35 text-purple-400 hover:text-purple-300 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isEnhancing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Enhancing...</>
                : <><Wand2 className="w-3.5 h-3.5" />Enhance prompt with AI</>
              }
            </button>
          </div>

          {/* ③ Size + Style + Variations grouped */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">

            {/* Size */}
            <div className="p-5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Image Size</p>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="h-11 text-sm bg-white/[0.03] border-white/8 text-white hover:border-white/15 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 rounded-xl transition-all">
                  <SelectValue>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-white">{activeSize.label}</span>
                      <span className="text-white/35 text-xs">{activeSize.ratio} · {activeSize.size}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10 bg-[#0d0d0d] shadow-2xl">
                  {SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg cursor-pointer text-white/80 focus:bg-white/8 focus:text-white">
                      <div className="flex items-center gap-3 py-0.5">
                        <div className="font-semibold text-sm">{opt.label}</div>
                        <div className="text-white/35 text-xs">{opt.ratio}</div>
                        <div className="ml-auto text-white/25 text-xs">{opt.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style */}
            <div className="p-5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Visual Style</p>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map((style) => {
                  const Icon = style.icon;
                  const active = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${active
                        ? 'border-purple-500/50 bg-purple-500/12'
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
                        <p className="text-[11px] text-white/40 mt-1 leading-none">{style.description}</p>
                      </div>
                      {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generate — mobile only */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="md:hidden w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 disabled:from-violet-600/60 disabled:to-purple-700/60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-purple-500/30"
          >
            {isGenerating
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating... {Math.round(progress)}%</>
              : <><Sparkles className="w-4 h-4" />Generate Photos</>
            }
          </button>
        </div>

        {/* ════════════ RIGHT: Results ════════════ */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden min-h-[560px] flex flex-col">
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <p className="text-sm font-bold text-white">Generated Photos</p>
            {results.length > 0 && (
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                {results.length} result{results.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex-1 p-6">

            {/* Loading */}
            {isGenerating && (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/40">Processing with AI...</span>
                  <span className="text-purple-400 font-mono font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {Array.from({ length: variations }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-square w-full rounded-xl bg-white/5" />
                      <Skeleton className="h-9 w-full rounded-lg bg-white/5" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results grid */}
            {!isGenerating && results.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {results.map((url, i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-0.5 animate-scale-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="aspect-square bg-white/5">
                      <img
                        src={url}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    </div>

                    {/* Index badge */}
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                      {i + 1}/{results.length}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-end px-3 pb-3 gap-2">
                      <button
                        onClick={() => { setPreviewImage(url); setPreviewIndex(i); }}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-white/15 hover:bg-white/22 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />Preview
                      </button>
                      <button
                        onClick={() => handleDownload(url, i)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isGenerating && results.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-5">
                  <ImageIcon className="w-9 h-9 text-white/15" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Your photos will appear here</h3>
                <p className="text-sm text-white/35 max-w-[220px] leading-relaxed">
                  Fill in your description on the left, pick a style, then hit{' '}
                  <span className="text-purple-400 font-semibold">Generate</span>
                </p>

                {/* Step guide */}
                <div className="mt-8 space-y-3 text-left">
                  {[
                    { n: '1', label: 'Describe your product' },
                    { n: '2', label: 'Choose style & size' },
                    { n: '3', label: 'Click Generate Photos' },
                  ].map((step) => (
                    <div key={step.n} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-purple-500/30 bg-purple-500/8 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-purple-400">{step.n}</span>
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

      {/* ════════════ Preview Lightbox ════════════ */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-white/8 bg-[#080808]">
          <DialogHeader className="flex-row items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
            <DialogTitle className="text-sm font-semibold text-white">
              Photo {previewIndex + 1} of {results.length}
            </DialogTitle>
            <button
              onClick={() => handleDownload(previewImage!, previewIndex)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />Download
            </button>
          </DialogHeader>

          <div className="relative flex-1 flex items-center justify-center p-5 min-h-0">
            {results.length > 1 && (
              <button
                onClick={() => navigate(-1)}
                className="absolute left-3 z-10 w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}

            <div className="flex items-center justify-center max-h-[65vh] overflow-auto">
              {previewImage && (
                <img
                  src={previewImage}
                  alt={`Photo ${previewIndex + 1}`}
                  className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl"
                />
              )}
            </div>

            {results.length > 1 && (
              <button
                onClick={() => navigate(1)}
                className="absolute right-3 z-10 w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {results.length > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 px-5 border-t border-white/5 flex-shrink-0">
              {results.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => { setPreviewIndex(idx); setPreviewImage(url); }}
                  className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all duration-150 ${idx === previewIndex
                    ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/25'
                    : 'border-white/10 opacity-40 hover:opacity-75 hover:border-white/25'
                    }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ════════════ Enhance Dialog ════════════ */}
      <Dialog open={showEnhDialog} onOpenChange={setShowEnhDialog}>
        <DialogContent className="max-w-lg rounded-2xl border-white/8 bg-[#0a0a0a] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Wand2 className="w-4 h-4 text-purple-400" />
              AI Enhanced Prompt
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-white/35 uppercase tracking-wider">Original</p>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <p className="text-sm text-white/70 leading-relaxed">{prompt}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />Enhanced
              </p>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <p className="text-sm text-white/80 leading-relaxed">{enhancedPrompt}</p>
              </div>
            </div>

            <DialogFooter className="flex gap-2.5 pt-1">
              <Button
                onClick={() => { setPrompt(enhancedPrompt); setShowEnhDialog(false); toast.success('Enhanced prompt applied'); }}
                className="flex-1 h-10 bg-purple-600 hover:bg-purple-500 text-white border-0 rounded-xl font-semibold text-sm"
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
    </div>
  );
}
