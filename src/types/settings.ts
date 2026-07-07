/**
 * Settings & preferences types for NoteGraph.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export type LayoutMode = 'split' | 'editor' | 'preview';

export interface Settings {
  /** Color theme: light, dark, or follow system */
  theme: ThemeMode;
  /** Editor font size in pixels (12–24) */
  fontSize: number;
  /** Editor font family */
  fontFamily: string;
  /** Tab size for indentation (2 or 4) */
  tabSize: number;
  /** Show line numbers in editor */
  lineNumbers: boolean;
  /** Enable word wrap in editor */
  wordWrap: boolean;
  /** Enable vim keybindings */
  vimMode: boolean;
  /** Auto-save enabled */
  autoSave: boolean;
  /** Auto-save debounce delay in ms */
  autoSaveDelay: number;
  /** Sidebar width in pixels */
  sidebarWidth: number;
  /** Editor pane width percentage in split view (20–80) */
  editorWidth: number;
  /** Current layout mode */
  layoutMode: LayoutMode;
  /** Show the formatting toolbar */
  showToolbar: boolean;
  /** Enable browser spellcheck */
  spellCheck: boolean;
  /** The storage provider to use */
  storageProvider: 'indexeddb' | 'filesystem';
}

/** Default settings for new users */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  fontSize: 15,
  fontFamily: "'JetBrains Mono', monospace",
  tabSize: 2,
  lineNumbers: true,
  wordWrap: true,
  vimMode: false,
  autoSave: true,
  autoSaveDelay: 1000,
  sidebarWidth: 260,
  editorWidth: 50,
  layoutMode: 'split',
  showToolbar: true,
  spellCheck: false,
  storageProvider: 'indexeddb',
};
