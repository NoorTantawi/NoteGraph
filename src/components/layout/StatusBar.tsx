import React from 'react';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';

export function StatusBar() {
  const activeFileId = useEditorStore(s => s.activeFileId);
  const files = useFileStore(s => s.files);

  const activeFile = activeFileId ? files[activeFileId] : null;

  return (
    <footer className="h-6 px-3 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-secondary)] shrink-0 select-none">
      <div className="flex items-center gap-4">
        {activeFile ? (
          <>
            <span className="truncate max-w-[200px]" title={activeFile.path}>{activeFile.name}</span>
            <span>{activeFile.wordCount || 0} words</span>
          </>
        ) : (
          <span>Ready</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        {activeFile && <span>UTF-8</span>}
      </div>
    </footer>
  );
}
