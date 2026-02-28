import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Generation } from '@/types';

interface GenerationState {
  history: Generation[];
  currentGeneration: Generation | null;
  batchQueue: Generation[];
  isGenerating: boolean;

  addGeneration: (gen: Generation) => void;
  updateGeneration: (id: string, partial: Partial<Generation>) => void;
  removeGeneration: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setCurrentGeneration: (gen: Generation | null) => void;
  setIsGenerating: (v: boolean) => void;
  addToBatchQueue: (gen: Generation) => void;
  clearBatchQueue: () => void;
  getFavorites: () => Generation[];
  getByType: (type: 'photo' | 'video') => Generation[];
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      history: [],
      currentGeneration: null,
      batchQueue: [],
      isGenerating: false,

      addGeneration: (gen) =>
        set((s) => ({ history: [gen, ...s.history] })),

      updateGeneration: (id, partial) =>
        set((s) => ({
          history: s.history.map((g) =>
            g.id === id ? { ...g, ...partial } : g
          ),
        })),

      removeGeneration: (id) =>
        set((s) => ({
          history: s.history.filter((g) => g.id !== id),
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          history: s.history.map((g) =>
            g.id === id ? { ...g, isFavorite: !g.isFavorite } : g
          ),
        })),

      setCurrentGeneration: (gen) => set({ currentGeneration: gen }),
      setIsGenerating: (v) => set({ isGenerating: v }),

      addToBatchQueue: (gen) =>
        set((s) => ({ batchQueue: [...s.batchQueue, gen] })),

      clearBatchQueue: () => set({ batchQueue: [] }),

      getFavorites: () => get().history.filter((g) => g.isFavorite),
      getByType: (type) => get().history.filter((g) => g.type === type),
    }),
    { name: 'karya-generation-store' }
  )
);
