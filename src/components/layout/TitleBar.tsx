import React from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { Menu, Search, Settings } from 'lucide-react';
import { ThemeToggle } from '../feature/ThemeToggle';

export function TitleBar() {
  const toggleSidebar = useEditorStore(s => s.toggleSidebar);
  const toggleSearchPanel = useEditorStore(s => s.toggleSearchPanel);
  const toggleSettingsPanel = useEditorStore(s => s.toggleSettingsPanel);

  return (
    <header className="h-10 px-4 bg-[var(--bg-primary)] border-b border-[var(--border)] flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-ring transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>
        <span className="font-semibold text-sm text-[var(--text-primary)] ml-1">NoteGraph</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={toggleSearchPanel}
          className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-ring transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
        <ThemeToggle />
        <button
          onClick={toggleSettingsPanel}
          className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-ring transition-colors"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
