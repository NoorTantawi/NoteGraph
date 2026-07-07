import { create } from 'zustand';
import { embeddingsClient } from '../lib/embeddingsClient';
import { getStorageProvider } from '../lib/storageProvider';

interface EmbeddingsState {
  isModelLoading: boolean;
  progress: any | null;
  error: string | null;
  isReady: boolean;
  similarNotes: Array<{ id: string; score: number }>;
  
  // Actions
  initModel: () => void;
  generateEmbeddingForFile: (id: string, text: string) => Promise<void>;
  findSimilarNotes: (id: string) => Promise<void>;
  clearSimilarNotes: () => void;
}

export const useEmbeddingsStore = create<EmbeddingsState>()((set, get) => ({
  isModelLoading: false,
  progress: null,
  error: null,
  isReady: false,
  similarNotes: [],

  initModel: () => {
    if (get().isModelLoading || get().isReady) return;
    
    set({ isModelLoading: true, error: null });
    
    embeddingsClient.onProgress = (progress) => {
      set({ progress });
    };
    
    embeddingsClient.onReady = () => {
      set({ isModelLoading: false, isReady: true, progress: null });
    };
    
    // Trigger initialization
    embeddingsClient.init();
  },

  generateEmbeddingForFile: async (id: string, text: string) => {
    try {
      const vector = await embeddingsClient.embed(id, text);
      const provider = getStorageProvider();
      await provider.saveEmbedding(id, vector);
    } catch (e: any) {
      console.error('Failed to generate embedding for', id, e);
      set({ error: e.message || 'Failed to generate embedding' });
    }
  },

  findSimilarNotes: async (id: string) => {
    try {
      const provider = getStorageProvider();
      const allEmbeddings = await provider.getAllEmbeddings();
      
      const queryVector = allEmbeddings[id];
      if (!queryVector) {
        set({ similarNotes: [] });
        return;
      }

      // Calculate similarities in the worker
      const results = await embeddingsClient.search(id, queryVector, allEmbeddings);
      set({ similarNotes: results });
    } catch (e: any) {
      console.error('Failed to find similar notes for', id, e);
      set({ error: e.message || 'Failed to find similar notes' });
    }
  },

  clearSimilarNotes: () => {
    set({ similarNotes: [] });
  }
}));
