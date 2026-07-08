import React from 'react';
import { Button } from '../ui/Button';
import { useEditorStore } from '../../stores/editorStore';
import { Kbd } from '../ui/Kbd';

export function WelcomeScreen() {
  const { toggleCommandPalette } = useEditorStore();
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-primary)] text-center px-4">
      <div className="w-24 h-24 mb-6 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-hover)] shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center text-4xl text-white font-bold">
        N
      </div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
        Welcome to NoteGraph
      </h1>
      <p className="text-[var(--text-secondary)] max-w-md mb-8">
        A fast, local-first Markdown knowledge base with seamless graph visualization.
      </p>
      
      <div className="flex flex-col gap-4 max-w-sm w-full text-left">
        <div className="flex justify-between items-center bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border)]">
          <span className="text-sm font-medium">Create new note</span>
          <span className="text-xs bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--text-secondary)] font-mono border border-[var(--border)] flex gap-1">
            Double-click Sidebar
          </span>
        </div>
        <div className="flex justify-between items-center bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border)]">
          <span className="text-sm font-medium">Search files</span>
          <span className="text-xs bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--text-secondary)] font-mono border border-[var(--border)] flex gap-1">
            <Kbd modifier="mod">P</Kbd>
          </span>
        </div>
        <div className="flex justify-between items-center bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border)]">
          <span className="text-sm font-medium">Toggle Sidebar</span>
          <span className="text-xs bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--text-secondary)] font-mono border border-[var(--border)] flex gap-1">
            <Kbd modifier="mod">B</Kbd>
          </span>
        </div>
      </div>
      
      <div className="mt-8">
        <Button variant="primary" onClick={toggleCommandPalette} size="lg">
          Open Command Palette
        </Button>
      </div>
    </div>
  );
}
