'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Copy, ArrowRight, LayoutTemplate } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { templates } from '@/lib/constants';
import type { TemplateCategory } from '@/types';
import { toast } from 'sonner';

/* ─── Data ─────────────────────────────────────────────────────── */

const CATEGORIES: { value: TemplateCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '✦' },
  { value: 'food', label: 'Food & Bev', emoji: '🍽' },
  { value: 'fashion', label: 'Fashion', emoji: '👗' },
  { value: 'handicrafts', label: 'Handicrafts', emoji: '🪴' },
  { value: 'electronics', label: 'Electronics', emoji: '⚡' },
  { value: 'cosmetics', label: 'Cosmetics', emoji: '💄' },
];

const CATEGORY_ACCENT: Record<TemplateCategory, { text: string; bg: string; border: string }> = {
  food: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  fashion: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  handicrafts: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  electronics: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  cosmetics: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

/* ─── Component ─────────────────────────────────────────────────── */

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (prompt: string, name: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success(`Copied "${name}" prompt`);
  };

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-purple-600/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0   w-[400px] h-[400px] bg-pink-600/4   blur-[120px] rounded-full" />
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-400/30 blur-lg rounded-xl" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-500/30">
              <LayoutTemplate className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Template Gallery</h1>
            <p className="text-sm text-white/40">Curated prompt templates · click to use instantly</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none z-10" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/25 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 rounded-xl"
          />
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-7 scrollbar-hide animate-fade-in-up" style={{ animationDelay: '0.04s' }}>
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all duration-200 flex-shrink-0 ${active
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 border-purple-500/80 text-white shadow-lg shadow-purple-500/25'
                : 'border-white/10 bg-white/5 text-white/55 hover:text-white/80 hover:bg-white/10 hover:border-white/20'
                }`}
            >
              <span className="text-base leading-none">{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-white/30 font-medium mb-5">
        Showing <span className="text-white/60 font-bold">{filteredTemplates.length}</span> of {templates.length} templates
      </p>

      {/* ── Template Grid ── */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-4">
            <LayoutTemplate className="w-7 h-7 text-white/15" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">No templates found</h3>
          <p className="text-sm text-white/35">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
          {filteredTemplates.map((template, i) => {
            const accent = CATEGORY_ACCENT[template.category];
            return (
              <div
                key={template.id}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/12 hover:-translate-y-1 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={template.previewUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm bg-black/55 ${accent.text} ${accent.border}`}>
                      {template.category}
                    </span>
                  </div>

                  {/* Usage count */}
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/60 border border-white/10">
                      {template.usageCount.toLocaleString()} uses
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-base text-white leading-snug drop-shadow-lg">{template.name}</h3>
                    <p className="text-white/65 text-xs mt-0.5 line-clamp-1 drop-shadow">{template.description}</p>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3">
                  {/* Prompt preview */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2.5">
                    <p className="text-[11px] font-mono text-white/35 line-clamp-2 leading-relaxed">
                      {template.prompt}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-white/40 border border-white/8 hover:border-purple-500/25 hover:text-purple-400/70 transition-colors cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-0.5">
                    <Link href={`/generate/photo?template=${template.id}`} className="flex-1">
                      <button className="w-full h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35">
                        Use Template
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleCopy(template.prompt, template.name)}
                      title="Copy prompt"
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white/35 hover:text-purple-400 hover:bg-purple-500/10 border border-white/8 hover:border-purple-500/25 transition-all duration-200 flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
