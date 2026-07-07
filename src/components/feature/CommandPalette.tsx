import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { File, Search } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const { files } = useFileStore();
  const { openFile } = useEditorStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fileList = Object.values(files).filter(f => f.type === 'file');
  const filtered = query.trim() === '' 
    ? fileList 
    : fileList.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        openFile(filtered[selectedIndex].id);
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Go to file..." size="md">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a file name..."
            className="w-full pl-10"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        </div>

        <div className="max-h-64 overflow-y-auto flex flex-col gap-1 -mx-2 px-2">
          {filtered.length === 0 ? (
            <div className="text-center text-sm text-[var(--text-tertiary)] py-4">No files found.</div>
          ) : (
            filtered.map((file, idx) => (
              <button
                key={file.id}
                onClick={() => {
                  openFile(file.id);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors cursor-pointer ${
                  selectedIndex === idx 
                    ? 'bg-[var(--accent-glow)] text-[var(--accent)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <File size={16} />
                <span>{file.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
