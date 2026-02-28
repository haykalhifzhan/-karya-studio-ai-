'use client';

import { useState, useMemo } from 'react';
import { Search, Heart, Trash2, Download, Camera, Video, Filter, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
      a.href = blobUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <Badge variant="secondary" className="ml-auto text-sm">
            {filteredItems.length} items
          </Badge>
        </div>
        <p className="text-gray-600">
          View and manage all your generated photos and videos in one place.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('all')}
              size="sm"
              className={
                typeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700'
                  : ''
              }
            >
              All
            </Button>
            <Button
              variant={typeFilter === 'photo' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('photo')}
              size="sm"
              className={
                typeFilter === 'photo'
                  ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700'
                  : ''
              }
            >
              <Camera className="w-4 h-4 mr-1" />
              Photos
            </Button>
            <Button
              variant={typeFilter === 'video' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('video')}
              size="sm"
              className={
                typeFilter === 'video'
                  ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700'
                  : ''
              }
            >
              <Video className="w-4 h-4 mr-1" />
              Videos
            </Button>
          </div>

          {/* Favorites Toggle */}
          <Button
            variant={favoritesOnly ? 'default' : 'outline'}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            size="sm"
            className={
              favoritesOnly
                ? 'bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700'
                : ''
            }
          >
            <Heart className={`w-4 h-4 mr-1 ${favoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by prompt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">
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
              className="group cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-0 relative">
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                  <img
                    src={item.type === 'photo' ? item.resultUrls[0] : item.thumbnailUrl}
                    alt="Generated content"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      className={
                        item.type === 'photo'
                          ? 'bg-blue-500 text-white'
                          : 'bg-purple-500 text-white'
                      }
                    >
                      {item.type === 'photo' ? (
                        <Camera className="w-3 h-3 mr-1" />
                      ) : (
                        <Video className="w-3 h-3 mr-1" />
                      )}
                      {item.type === 'photo' ? 'Photo' : 'Video'}
                    </Badge>
                  </div>

                  {/* Favorite Button */}
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white transition-all"
                    onClick={(e) => handleToggleFavorite(item.id, e)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                      }`}
                    />
                  </button>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="text-white text-sm font-medium">View Details</div>
                  </div>
                </div>

                {/* Date */}
                <div className="p-2 text-xs text-gray-500 text-center">
                  {formatDate(item.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedItem.type === 'photo' ? (
                  <Camera className="w-5 h-5 text-blue-500" />
                ) : (
                  <Video className="w-5 h-5 text-purple-500" />
                )}
                {selectedItem.type === 'photo' ? 'Photo' : 'Video'} Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Image/Video */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                {selectedItem.type === 'photo' ? (
                  <img
                    src={selectedItem.resultUrls[0]}
                    alt="Generated content"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedItem.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Prompt</label>
                  <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedItem.prompt}
                  </p>
                </div>

                {selectedItem.enhancedPrompt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enhanced Prompt</label>
                    <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                      {selectedItem.enhancedPrompt}
                    </p>
                  </div>
                )}

                {selectedItem.style && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Style</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.style}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleToggleFavorite(selectedItem.id)}
                  className="flex-1"
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      selectedItem.isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                  {selectedItem.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleDownload(
                      selectedItem.type === 'photo'
                        ? selectedItem.resultUrls[0]
                        : selectedItem.videoUrl!,
                      `${selectedItem.type}-${selectedItem.id}.${
                        selectedItem.type === 'photo' ? 'png' : 'mp4'
                      }`
                    )
                  }
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {deleteConfirm === selectedItem.id ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedItem.id)}
                    className="flex-1"
                  >
                    Confirm Delete
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(selectedItem.id)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
