export type EmbeddingsWorkerRequest = 
  | { action: 'init' }
  | { action: 'embed'; id: string; text: string }
  | { action: 'search'; queryId: string; vector: number[]; allEmbeddings: Record<string, number[]> };

export type EmbeddingsWorkerResponse =
  | { action: 'init_progress'; progress: any }
  | { action: 'init_ready' }
  | { action: 'embed_result'; id: string; vector: number[] }
  | { action: 'search_result'; queryId: string; results: Array<{ id: string; score: number }> }
  | { action: 'error'; error: string };

class EmbeddingsClient {
  private worker: Worker | null = null;
  private messageIdCounter = 0;
  
  // Callbacks for Promises
  private embedCallbacks = new Map<string, { resolve: (vector: number[]) => void, reject: (err: any) => void }>();
  private searchCallbacks = new Map<string, { resolve: (results: Array<{id: string, score: number}>) => void, reject: (err: any) => void }>();
  
  // Event listeners for progress
  public onProgress?: (progress: any) => void;
  public onReady?: () => void;

  init() {
    if (this.worker) return;
    
    // Create the worker
    this.worker = new Worker(new URL('../workers/embeddings.worker.ts', import.meta.url), {
      type: 'module'
    });

    this.worker.addEventListener('message', (event: MessageEvent<EmbeddingsWorkerResponse>) => {
      const data = event.data;
      
      switch (data.action) {
        case 'init_progress':
          if (this.onProgress) this.onProgress(data.progress);
          break;
        case 'init_ready':
          if (this.onReady) this.onReady();
          break;
        case 'embed_result':
          const callbacks = this.embedCallbacks.get(data.id);
          if (callbacks) {
            callbacks.resolve(data.vector);
            this.embedCallbacks.delete(data.id);
          }
          break;
        case 'search_result':
          const searchCbs = this.searchCallbacks.get(data.queryId);
          if (searchCbs) {
            searchCbs.resolve(data.results);
            this.searchCallbacks.delete(data.queryId);
          }
          break;
        case 'error':
          console.error('Embeddings Worker Error:', data.error);
          break;
      }
    });

    this.worker.postMessage({ action: 'init' });
  }

  embed(id: string, text: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) this.init();
      
      this.embedCallbacks.set(id, { resolve, reject });
      this.worker!.postMessage({ action: 'embed', id, text });
    });
  }

  search(queryId: string, vector: number[], allEmbeddings: Record<string, number[]>): Promise<Array<{id: string, score: number}>> {
    return new Promise((resolve, reject) => {
      if (!this.worker) this.init();
      
      this.searchCallbacks.set(queryId, { resolve, reject });
      this.worker!.postMessage({ action: 'search', queryId, vector, allEmbeddings });
    });
  }
}

export const embeddingsClient = new EmbeddingsClient();
