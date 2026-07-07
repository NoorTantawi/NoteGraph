import React, { useEffect } from 'react';
import { useEmbeddingsStore } from '../../stores/embeddingsStore';
import { useEditorStore } from '../../stores/editorStore';
import { useFileStore } from '../../stores/fileStore';
import { getFileNameWithoutExtension } from '../../lib/utils';
import { FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const SimilarNotes: React.FC = () => {
  const { 
    isModelLoading, 
    progress, 
    error, 
    isReady, 
    similarNotes, 
    initModel, 
    findSimilarNotes 
  } = useEmbeddingsStore();
  
  const { activeFileId, openFile } = useEditorStore();
  const { files } = useFileStore();

  useEffect(() => {
    // When the active file changes, and the model is ready, trigger a search
    if (isReady && activeFileId) {
      findSimilarNotes(activeFileId);
    }
  }, [activeFileId, isReady, findSimilarNotes]);

  if (!isReady && !isModelLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-full">
        <div className="w-12 h-12 rounded-full bg-accent-glow flex items-center justify-center text-accent">
          <Sparkles size={24} />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-text-primary">Related Notes AI</h3>
          <p className="text-sm text-text-secondary">
            Discover latent connections in your knowledge graph using local AI. 
            The embedding model (~22MB) will be downloaded on first run.
          </p>
        </div>
        <Button onClick={initModel} className="w-full">
          Enable Local AI
        </Button>
      </div>
    );
  }

  if (isModelLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-full">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-primary">Loading AI Model...</p>
          {progress && (
            <p className="text-xs text-text-secondary">
              {progress.status === 'progress' 
                ? `Downloading: ${Math.round(progress.progress)}%` 
                : progress.status}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 h-full text-danger">
        <AlertCircle size={32} />
        <p className="text-sm">{error}</p>
        <Button variant="secondary" onClick={initModel}>Retry</Button>
      </div>
    );
  }

  if (!activeFileId) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full">
        <p className="text-sm text-text-secondary">Open a note to find related content.</p>
      </div>
    );
  }

  const validNotes = similarNotes
    .map(n => ({ ...n, file: files[n.id] }))
    .filter(n => n.file !== undefined && n.score > 0.4); // Threshold

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center space-x-2">
        <Sparkles size={16} className="text-accent" />
        <span className="text-sm font-medium text-text-primary">Related Notes</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {validNotes.length === 0 ? (
          <div className="p-4 text-center text-sm text-text-tertiary">
            No related notes found.
          </div>
        ) : (
          validNotes.map(note => (
            <button
              key={note.id}
              onClick={() => openFile(note.id)}
              className="w-full flex flex-col items-start p-3 rounded-md hover:bg-bg-hover transition-colors text-left group"
            >
              <div className="flex items-center space-x-2 w-full">
                <FileText size={14} className="text-text-tertiary group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium text-text-primary truncate flex-1">
                  {getFileNameWithoutExtension(note.file!.name)}
                </span>
                <span className="text-xs text-text-tertiary font-mono">
                  {Math.round(note.score * 100)}%
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
