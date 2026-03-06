'use client';

import { useState, useMemo } from 'react';
import { Search, Heart, Trash2, Download, Camera, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGenerationStore } from '@/stores/generationStore';
import { toast } from 'sonner';
import type { Generation, GenerationType } from '@/types';

export default function GalleryPage() {
  const { history, toggleFavorite, removeGeneration } = useGenerationStore();
  const [typeFilter, setTypeFilter] = useState<GenerationType | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Generation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return history.filter((item) => {
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesFavorites = !favoritesOnly || item.isFavorite;
      const matchesSearch =
        searchQuery === '' ||
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.enhancedPrompt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesFavorites && matchesSearch && item.status === 'completed';
    });
  }, [history, typeFilter, favoritesOnly, searchQuery]);

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleFavorite(id);
    if (selectedItem?.id === id) {
      setSelectedItem({ ...selectedItem, isFavorite: !selectedItem.isFavorite });
    }
    toast.success('Updated favorites');
  };

  const handleDelete = (id: string) => {
    removeGeneration(id);
    setSelectedItem(null);
    setDeleteConfirm(null);
    toast.success('Item deleted');
  };

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download started');
    } catch { toast.error('Failed to download'); }
  };

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateString));

  /* ── Filter button style helper ──────────────────────────────── */
  const filterBtn = (active: boolean, danger = false) =>
    `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${active
      ? danger
        ? 'bg-gradient-to-r from-rose-500 to-pink-600 border-rose-500/80 text-white shadow-md shadow-rose-500/20'
        : 'bg-gradient-to-r from-violet-500 to-purple-600 border-purple-500/80 text-white shadow-md shadow-purple-500/20'
      : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/8 hover:border-white/18'
    }`;

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in-up">

      {/* ── Header — matches Photo Generator style ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {/* Icon with glow — same pattern as photo/video generator */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-violet-400/35 blur-lg rounded-xl" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 via-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/35">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Gallery</h1>

          {/* Item count — right side */}
          {filteredItems.length > 0 && (
            <span className="ml-auto text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-sm text-white/40">
          View and manage all your generated photos and videos in one place.
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Type filters */}
          <button className={filterBtn(typeFilter === 'all')} onClick={() => setTypeFilter('all')}>All</button>
          <button className={filterBtn(typeFilter === 'photo')} onClick={() => setTypeFilter('photo')}>
            <Camera className="w-3.5 h-3.5" />Photos
          </button>
          <button className={filterBtn(typeFilter === 'video')} onClick={() => setTypeFilter('video')}>
            <Video className="w-3.5 h-3.5" />Videos
          </button>

          {/* Favorites toggle */}
          <button className={filterBtn(favoritesOnly, true)} onClick={() => setFavoritesOnly(!favoritesOnly)}>
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none z-10" />
          <Input
            type="text"
            placeholder="Search by prompt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 rounded-xl"
          />
        </div>
      </div>

      {/* ── Gallery Grid ── */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-5">
            <ImageIcon className="w-9 h-9 text-white/15" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">No items found</h3>
          <p className="text-sm text-white/35">
            {history.length === 0
              ? 'Start generating photos and videos to see them here.'
              : 'Try adjusting your filters or search query.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group cursor-pointer border-white/5 bg-white/[0.02] hover:border-white/12 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 rounded-2xl overflow-hidden"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-0 relative">
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden bg-white/[0.03]">
                  <img
                    src={item.type === 'photo' ? item.resultUrls[0] : item.thumbnailUrl}
                    alt="Generated content"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm bg-black/55 border ${item.type === 'photo'
                      ? 'border-blue-500/30 text-blue-300'
                      : 'border-violet-500/30 text-violet-300'
                      }`}>
                      {item.type === 'photo' ? <Camera className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
                      {item.type === 'photo' ? 'Photo' : 'Video'}
                    </span>
                  </div>

                  {/* Favorite button */}
                  <button
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all ${item.isFavorite
                      ? 'bg-rose-500/80 border-rose-400/40'
                      : 'bg-black/55 border-white/10 opacity-0 group-hover:opacity-100'
                      }`}
                    onClick={(e) => handleToggleFavorite(item.id, e)}
                  >
                    <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-white text-white' : 'text-white/70'}`} />
                  </button>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="text-white text-xs font-semibold">View Details</div>
                  </div>
                </div>

                {/* Date */}
                <div className="py-2.5 px-3 text-[10px] text-white/30 text-center">
                  {formatDate(item.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Detail Dialog ── */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border-white/10 !bg-[#050505] shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white text-sm font-bold">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedItem.type === 'photo' ? 'bg-blue-500/15' : 'bg-violet-500/15'}`}>
                  {selectedItem.type === 'photo'
                    ? <Camera className="w-3.5 h-3.5 text-blue-400" />
                    : <Video className="w-3.5 h-3.5 text-violet-400" />}
                </div>
                {selectedItem.type === 'photo' ? 'Photo' : 'Video'} Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Media */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/8">
                {selectedItem.type === 'photo' ? (
                  <img src={selectedItem.resultUrls[0]} alt="Generated" className="w-full h-full object-contain" />
                ) : (
                  <video src={selectedItem.videoUrl ?? undefined} controls className="w-full h-full object-contain" />
                )}
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1.5">Prompt</p>
                  <p className="text-sm text-white/65 leading-relaxed p-3 bg-white/[0.03] border border-white/8 rounded-xl">
                    {selectedItem.prompt}
                  </p>
                </div>
                {selectedItem.enhancedPrompt && (
                  <div>
                    <p className="text-[10px] font-bold text-violet-400/80 uppercase tracking-widest mb-1.5">Enhanced Prompt</p>
                    <p className="text-sm text-white/55 leading-relaxed p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
                      {selectedItem.enhancedPrompt}
                    </p>
                  </div>
                )}
                {selectedItem.style && (
                  <div>
                    <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-1.5">Style</p>
                    <span className="text-xs text-white/55 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg capitalize">{selectedItem.style}</span>
                  </div>
                )}
                <p className="text-xs text-white/30">Created: {formatDate(selectedItem.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleToggleFavorite(selectedItem.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border text-sm font-semibold transition-all duration-300 ${selectedItem.isFavorite
                    ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/15'
                    : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80 hover:bg-white/6 hover:border-white/20'
                    }`}
                >
                  <Heart className={`w-4 h-4 transition-transform ${selectedItem.isFavorite ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                  {selectedItem.isFavorite ? 'Added to Favorites' : 'Add to Favorites'}
                </button>

                <button
                  onClick={() => handleDownload(
                    selectedItem.type === 'photo' ? selectedItem.resultUrls[0] : selectedItem.videoUrl!,
                    `karya-${selectedItem.type}-${selectedItem.id}.${selectedItem.type === 'photo' ? 'png' : 'mp4'}`
                  )}
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
                >
                  <Download className="w-4 h-4" />Download
                </button>

                {deleteConfirm === selectedItem.id ? (
                  <button onClick={() => handleDelete(selectedItem.id)} className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all">
                    Confirm Delete
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(selectedItem.id)}
                    className="w-10 h-10 flex-shrink-0 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-rose-500/10 hover:border-rose-500/25 text-white/35 hover:text-rose-400 flex items-center justify-center transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
