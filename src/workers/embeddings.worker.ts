import { pipeline, env } from '@xenova/transformers';

// Disable local models to fetch from HuggingFace Hub on first run
env.allowLocalModels = false;
env.useBrowserCache = true;

let featureExtractionPipeline: any = null;

// Initialize the pipeline
async function initPipeline() {
  if (featureExtractionPipeline) return featureExtractionPipeline;
  
  featureExtractionPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    progress_callback: (progress: any) => {
      self.postMessage({ action: 'init_progress', progress });
    }
  });
  
  self.postMessage({ action: 'init_ready' });
  return featureExtractionPipeline;
}

// Chunking function: splits by headings and paragraphs
function chunkText(text: string): string[] {
  // Split by double newline (paragraphs) or markdown headings
  const chunks = text.split(/(?:\n\s*\n|(?=^#{1,6}\s))/m);
  return chunks.map(c => c.trim()).filter(c => c.length > 0);
}

// Compute document-level embedding using mean pooling of chunks
async function computeDocumentEmbedding(text: string): Promise<number[]> {
  const pipe = await initPipeline();
  const chunks = chunkText(text);
  
  if (chunks.length === 0) {
    // Return a zero vector (all-MiniLM-L6-v2 outputs 384 dimensions)
    return new Array(384).fill(0);
  }
  
  const chunkVectors: number[][] = [];
  
  for (const chunk of chunks) {
    // Run feature extraction.
    // pooling: 'mean' and normalize: true are standard for sentence-transformers
    const output = await pipe(chunk, { pooling: 'mean', normalize: true });
    // output.data is a Float32Array
    chunkVectors.push(Array.from(output.data));
  }
  
  // Mean pooling across all chunks
  const dim = chunkVectors[0].length;
  const docVector = new Array(dim).fill(0);
  
  for (const vec of chunkVectors) {
    for (let i = 0; i < dim; i++) {
      docVector[i] += vec[i];
    }
  }
  
  // Average and normalize the document vector
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    docVector[i] /= chunks.length;
    norm += docVector[i] * docVector[i];
  }
  
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      docVector[i] /= norm;
    }
  }
  
  return docVector;
}

// Cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const data = event.data;
  
  try {
    if (data.action === 'init') {
      await initPipeline();
    } 
    else if (data.action === 'embed') {
      const vector = await computeDocumentEmbedding(data.text);
      self.postMessage({ action: 'embed_result', id: data.id, vector });
    }
    else if (data.action === 'search') {
      const { vector, allEmbeddings, queryId } = data;
      const results: Array<{ id: string; score: number }> = [];
      
      for (const [id, targetVector] of Object.entries(allEmbeddings)) {
        if (id === queryId) continue; // Skip comparing with itself
        const score = cosineSimilarity(vector as number[], targetVector as number[]);
        results.push({ id, score });
      }
      
      // Sort descending by score and take top 5
      results.sort((a, b) => b.score - a.score);
      const topResults = results.slice(0, 5);
      
      self.postMessage({ action: 'search_result', results: topResults, queryId });
    }
  } catch (error: any) {
    self.postMessage({ action: 'error', error: error.message });
  }
});
