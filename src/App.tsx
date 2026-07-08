import React, { useEffect } from 'react';
import { useFileStore } from './stores/fileStore';
import { useEditorStore } from './stores/editorStore';
import { useTheme } from './hooks/useTheme';

import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/layout/Sidebar';
import { TitleBar } from './components/layout/TitleBar';
import { TabBar } from './components/layout/TabBar';
import { StatusBar } from './components/layout/StatusBar';
import { Splitter } from './components/ui/Splitter';

import { MarkdownEditor } from './components/editor/MarkdownEditor';
import { MarkdownPreview } from './components/preview/MarkdownPreview';
import { WelcomeScreen } from './components/feature/WelcomeScreen';

import { CommandPalette } from './components/feature/CommandPalette';
import { SettingsPanel } from './components/feature/SettingsPanel';
import { ExportDialog } from './components/feature/ExportDialog';
import { GraphView } from './components/feature/GraphView';

import { useScrollSync } from './hooks/useScrollSync';

function MainEditorArea() {
  const { files, updateContent } = useFileStore();
  const { activeFileId, activeContent } = useEditorStore();

  const activeFile = activeFileId ? files[activeFileId] : null;

  // Split pane state
  const [editorWidthPercent, setEditorWidthPercent] = React.useState(50);
  
  const editorRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

  useScrollSync(editorRef, previewRef);

  const handleEditorChange = React.useCallback((newContent: string) => {
    if (activeFileId) {
      updateContent(activeFileId, newContent);
    }
  }, [activeFileId, updateContent]);

  if (!activeFile) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <TabBar />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Pane */}
        <div 
          style={{ width: `${editorWidthPercent}%` }}
          className="h-full relative shrink-0"
        >
          <MarkdownEditor 
            key={activeFile.id}
            fileId={activeFile.id}
            content={activeFile.content}
            onChange={handleEditorChange}
          />
        </div>

        <Splitter 
          onResize={setEditorWidthPercent} 
        />

        {/* Preview Pane */}
        <div 
          style={{ width: `${100 - editorWidthPercent}%` }}
          className="h-full overflow-y-auto bg-[var(--bg-primary)] shrink-0"
          ref={previewRef}
        >
          <MarkdownPreview content={activeContent !== null ? activeContent : activeFile.content} />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}

export default function App() {
  const { loadFromStorage, isLoaded, error, files } = useFileStore();
  useTheme(); // Initialize theme listener

  // Global modals state
  const { 
    commandPaletteOpen, toggleCommandPalette,
    settingsPanelOpen, toggleSettingsPanel,
    graphViewOpen,
    openTabs,
    activeFileId,
  } = useEditorStore();

  const activeFile = activeFileId ? files[activeFileId] : null;

  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+P / Ctrl+P -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center text-[var(--text-secondary)]">Loading NoteGraph...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <TitleBar />
      <div className="flex-1 overflow-hidden relative">
        {error ? (
          <div className="flex flex-col h-full items-center justify-center gap-4">
            <h2 className="text-xl font-bold">Storage Access Required</h2>
            <p className="text-[var(--text-secondary)]">{error}</p>
            <button 
              className="bg-[var(--accent)] text-white px-4 py-2 rounded-md hover:bg-[var(--accent-hover)] transition-colors"
              onClick={async () => {
                const provider = (await import('./lib/storageProvider')).getStorageProvider();
                if ('requestMount' in provider) {
                  // @ts-ignore
                  await provider.requestMount();
                  loadFromStorage();
                } else if ('verifyPermission' in provider) {
                  // @ts-ignore
                  await provider.verifyPermission();
                  loadFromStorage();
                }
              }}
            >
              Unlock Vault / Mount Folder
            </button>
            <button 
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline text-sm"
              onClick={() => toggleSettingsPanel()}
            >
              Change Storage Provider
            </button>
          </div>
        ) : (
          <AppShell
            sidebar={<Sidebar />}
            main={
              graphViewOpen ? (
                <GraphView />
              ) : openTabs.length === 0 || !activeFile ? (
                <WelcomeScreen />
              ) : (
                <MainEditorArea />
              )
            }
          />
        )}
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={toggleCommandPalette} />
      <SettingsPanel isOpen={settingsPanelOpen} onClose={toggleSettingsPanel} />
      <ExportDialog isOpen={exportDialogOpen} onClose={() => setExportDialogOpen(false)} />
    </div>
  );
}
