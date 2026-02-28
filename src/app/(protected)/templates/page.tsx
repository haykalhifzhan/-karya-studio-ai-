'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Copy, ArrowRight, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { templates } from '@/lib/constants';
import type { TemplateCategory } from '@/types';
import { toast } from 'sonner';

const categories: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'handicrafts', label: 'Handicrafts' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'cosmetics', label: 'Cosmetics' },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyPrompt = (prompt: string, name: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success(`Copied "${name}" prompt to clipboard!`);
  };

  const getCategoryColor = (category: TemplateCategory) => {
    const colors: Record<TemplateCategory, string> = {
      food: 'bg-orange-100 text-orange-700 border-orange-300',
      fashion: 'bg-pink-100 text-pink-700 border-pink-300',
      handicrafts: 'bg-amber-100 text-amber-700 border-amber-300',
      electronics: 'bg-blue-100 text-blue-700 border-blue-300',
      cosmetics: 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return colors[category];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
            <LayoutTemplate className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Template Gallery</h1>
        </div>
        <p className="text-gray-600">
          Browse our curated collection of professional prompt templates. Choose a template and
          customize it for your product.
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              className={
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 whitespace-nowrap'
                  : 'whitespace-nowrap'
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates by name or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <LayoutTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                {/* Preview Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={template.previewUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 font-mono bg-gray-50 p-2 rounded">
                      {template.prompt}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Usage Count */}
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="font-medium">{template.usageCount}</span>
                    <span>uses</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/generate/photo?template=${template.id}`}
                      className="flex-1"
                    >
                      <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white">
                        Use Template
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyPrompt(template.prompt, template.name)}
                      title="Copy prompt"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="mt-8 text-center text-sm text-gray-600">
        Showing {filteredTemplates.length} of {templates.length} templates
      </div>
    </div>
  );
}
