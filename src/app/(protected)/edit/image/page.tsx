'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import {
  ChevronLeft,
  Download,
  Eraser,
  Film,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Sparkles,
  Upload,
  Wand2,
  X,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../../convex/_generated/api';

const QUICK_TOOL_PROMPTS = {
  'remove-bg': { name: 'Remove Bg', desc: 'Remove background completely', icon: Eraser, color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  'enhance': { name: 'Enhance', desc: 'Improve quality & sharpness', icon: Sparkles, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  'studio': { name: 'Studio', desc: 'Professional studio look', icon: Film, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  'food': { name: 'Food', desc: 'Food photography style', icon: Zap, color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
};

const SIZE_OPTIONS = [
  { value: '1024x1024', label: 'Square', ratio: '1:1', size: '1328×1328', desc: 'Instagram · Product' },
  { value: '1280x720', label: 'Landscape', ratio: '16:9', size: '1280×720', desc: 'Banner · Thumbnail' },
  { value: '720x1280', label: 'Portrait', ratio: '9:16', size: '720×1280', desc: 'Story · Reels' },
];

export default function ImageEditorPage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editedImage, setEditedImage] = useState('');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 500;
  const activeSize = SIZE_OPTIONS.find((s) => s.value === size)!;
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.auth.getCurrentUser,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );
  const createGeneration = useMutation(api.generations.create);

  /* ── Upload ─────────────────────────────────────────────────── */
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be less than 10MB'); return; }
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setEditedImage('');
    toast.success('Image uploaded');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setEditedImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Enhance ─────────────────────────────────────────────────── */
  const handleEnhance = async () => {
    if (!prompt.trim()) { toast.error('Enter instructions first'); return; }
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/edit/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: activeTool || 'enhance' }),
      });
      const data = await res.json();
      if (data.success) {
        setPrompt(data.enhanced);
        toast.success('Prompt enhanced!');
      } else {
        toast.error('Failed to enhance prompt');
      }
    } catch {
      toast.error('Error enhancing prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  /* ── Edit ────────────────────────────────────────────────── */
  const handleEdit = async () => {
    if (!previewUrl) { toast.error('Please upload an image first'); return; }
    if (!prompt.trim()) { toast.error('Please describe how to edit the image'); return; }

    setIsEditing(true);
    setProgress(10);
    setEditedImage('');

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
      toast.info('Editing image with AI...');

      const res = await fetch('/api/edit/with-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrlForApi,
          prompt: prompt,
          size: size,
        }),
      });

      const data = await res.json();
      setProgress(100);

      if (data.success) {
        setEditedImage(data.editedImageUrl);
        if (convexUser?._id && data.editedImageUrl) {
          try {
            await createGeneration({
              userId: convexUser._id,
              type: 'photo', // always photo for image editing
              prompt: prompt, // final prompt used (may be enhanced)
              enhancedPrompt: undefined, // you can store the original if you track it separately
              style: activeTool || undefined,
              status: 'completed',
              resultUrls: [data.editedImageUrl],
              thumbnailUrl: data.editedImageUrl, // same image as thumbnail
              // videoUrl, templateId, isFavorite omitted
            });
          } catch (saveError) {
            console.error('Failed to save generation to Convex:', saveError);
            // Optionally show a non‑blocking toast
          }
        }
        toast.success('Image edited successfully!');
      } else {
        toast.error(data.error || 'Failed to edit image');
      }
    } catch (err: any) {
      toast.error('Error editing image', {
        description: err.message || 'Unknown error'
      });
    } finally {
      setIsEditing(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const handleQuickTool = (tool: string) => {
    setActiveTool(tool);
    setPrompt(QUICK_TOOL_PROMPTS[tool as keyof typeof QUICK_TOOL_PROMPTS]?.desc || '');
  };

  const handleDownload = async () => {
    if (!editedImage) return;
    try {
      const res = await fetch(editedImage);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `karya-edited-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast.success('Downloaded!');
    } catch {
      window.open(editedImage, '_blank');
      toast.success('Opened in new tab');
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-purple-600/6 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/4 blur-[120px] rounded-full" />
      </div>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()} className="text-white/60 hover:text-white">
            <ChevronLeft className="w-5 h-5 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400/40 blur-lg rounded-xl" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/40">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Image Editor</h1>
              <p className="text-sm text-white/40">AI-powered image editing & enhancement</p>
            </div>
          </div>
        </div>

        {/* Desktop Edit button - Top Right */}
        <button
          onClick={handleEdit}
          disabled={isEditing || !previewUrl || !prompt.trim()}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-purple-600/50 disabled:to-purple-700/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
        >
          {isEditing
            ? <><Loader2 className="w-4 h-4 animate-spin" />{progress}%</>
            : <><Wand2 className="w-4 h-4" />Edit Image</>
          }
        </button>
      </div>

      {/* Progress bar */}
      {isEditing && (
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

          {/* ① Source Image */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
              Source Image <span className="normal-case font-semibold text-white/60">· required</span>
            </p>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {previewUrl ? (
              <div onClick={removeFile} className="relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer">
                <img src={previewUrl} alt="Source" className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <X className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-semibold">Remove</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-xl transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center py-8 gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-200">
                    <Upload className="w-5 h-5 text-white/30 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">Drop image here or click to browse</p>
                    <p className="text-xs text-white/25 mt-0.5">JPG, PNG, GIF · max 10MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ② Quick Tools */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Quick Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(QUICK_TOOL_PROMPTS).map(([key, tool]) => {
                const Icon = tool.icon;
                const active = activeTool === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleQuickTool(key)}
                    className={`relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${active
                      ? 'border-purple-500/50 bg-purple-500/12'
                      : 'border-white/12 bg-white/6 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: active ? tool.bg : 'rgba(255,255,255,0.10)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: active ? tool.color : 'rgba(255,255,255,0.55)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold leading-none ${active ? 'text-white' : 'text-white/75'}`}>{tool.name}</p>
                      <p className="text-[11px] text-white/40 mt-1 leading-none">{tool.desc}</p>
                    </div>
                    {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ③ Edit Instructions */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Edit Instructions <span className="normal-case font-normal">· optional</span></p>
              <span className={`text-xs font-mono ${prompt.length > MAX_CHARS * 0.9 ? 'text-rose-400' : 'text-white/25'}`}>
                {prompt.length}/{MAX_CHARS}
              </span>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
              placeholder="e.g. Remove background and add soft shadow, enhance colors and sharpness..."
              className="min-h-[100px] resize-none bg-white/[0.03] border-white/8 text-white/90 placeholder:text-white/20 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 rounded-xl text-sm leading-relaxed"
              maxLength={MAX_CHARS}
            />

            <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${prompt.length > MAX_CHARS * 0.9 ? 'bg-rose-500' : 'bg-purple-500/50'}`}
                style={{ width: `${(prompt.length / MAX_CHARS) * 100}%` }}
              />
            </div>

            <p className="text-xs text-white/25 mt-2">Leave empty — AI will use quick tool settings</p>

            <button
              onClick={handleEnhance}
              disabled={isEnhancing || !prompt.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/35 text-purple-400 hover:text-purple-300 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isEnhancing
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Enhancing...</>
                : <><Sparkles className="w-3.5 h-3.5" />Enhance instructions with AI</>
              }
            </button>
          </div>

          {/* ④ Output Size */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Output Size</p>
            <Select value={size} onValueChange={setSize}>
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

          {/* Edit Button — mobile only */}
          <button
            onClick={handleEdit}
            disabled={isEditing || !previewUrl || !prompt.trim()}
            className="md:hidden w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-purple-600/60 disabled:to-purple-700/60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-purple-500/30"
          >
            {isEditing
              ? <><Loader2 className="w-4 h-4 animate-spin" />Editing... {progress}%</>
              : <><Wand2 className="w-4 h-4" />Edit Image</>
            }
          </button>
        </div>

        {/* ════════════ RIGHT: Preview ════════════ */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden min-h-[700px] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <p className="text-sm font-bold text-white">Preview</p>
            {editedImage && (
              <button
                onClick={() => setShowPreviewDialog(true)}
                className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5 text-white/50" />
              </button>
            )}
          </div>

          <div className="flex-1 p-6">
            {/* Loading */}
            {isEditing && (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/40">Processing with AI...</span>
                  <span className="text-purple-400 font-mono font-bold">{progress}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Skeleton className="aspect-square w-full rounded-xl bg-white/5" />
                  <Skeleton className="aspect-square w-full rounded-xl bg-white/5" />
                </div>
              </div>
            )}

            {/* Results - Side by Side Comparison */}
            {!isEditing && (previewUrl || editedImage) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-white/40">Original</span>
                  <span className="text-purple-400">Edited Result</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-6">
                        <ImageIcon className="w-12 h-12 text-white/15 mx-auto mb-3" />
                        <p className="text-white/30 text-sm">No image</p>
                      </div>
                    )}
                  </div>

                  {/* Edited */}
                  <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {editedImage ? (
                      <img src={editedImage} alt="Edited" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-6">
                        <Wand2 className="w-12 h-12 text-white/15 mx-auto mb-3" />
                        <p className="text-white/30 text-sm">Result will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isEditing && !previewUrl && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-5">
                  <ImageIcon className="w-9 h-9 text-white/15" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Your edits will appear here</h3>
                <p className="text-sm text-white/35 max-w-[240px] leading-relaxed">
                  Upload an image, choose a quick tool or describe your edit, then hit{' '}
                  <span className="text-purple-400 font-semibold">Edit Image</span>
                </p>
                <div className="mt-8 space-y-3 text-left">
                  {[
                    { n: '1', label: 'Upload your image' },
                    { n: '2', label: 'Choose tool or describe edit' },
                    { n: '3', label: 'Click Edit Image' },
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

      {/* Fullscreen Preview Dialog */}
      {editedImage && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl p-0 rounded-2xl border-white/8 bg-[#080808] overflow-hidden">
            <DialogHeader className="px-5 py-4 border-b border-white/5 flex-row items-center justify-between">
              <DialogTitle className="text-sm font-semibold text-white">Edit Preview</DialogTitle>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />Download
              </button>
            </DialogHeader>
            <div className="p-4">
              <img src={editedImage} alt="Edited" className="w-full rounded-xl" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}