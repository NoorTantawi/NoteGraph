/**
 * Editor UI Zustand store for NoteGraph.
 *
 * Manages transient editor state: open tabs, active file, and panel
 * visibility. This is intentionally NOT persisted — tabs are ephemeral
 * and reset on reload.
 */

import { create } from 'zustand';

/* ----------------------------------------------------------------
   Store interface
   ---------------------------------------------------------------- */

interface EditorState {
  /** ID of the currently active (focused) file, or null if none */
  activeFileId: string | null;
  /** Ordered list of open file IDs (tab bar) */
  openTabs: string[];
  /** The instant un-debounced content buffer for the active file */
  activeContent: string | null;
  /** Whether the sidebar is expanded */
  sidebarOpen: boolean;
  /** Whether the command palette overlay is visible */
  commandPaletteOpen: boolean;
  /** Whether the search panel is visible */
  searchPanelOpen: boolean;
  /** Whether the knowledge graph view is open */
  graphViewOpen: boolean;
  /** Whether the settings panel is open */
  settingsPanelOpen: boolean;

  /* ---- Tab management ---- */

  /** Open a file: adds a tab if needed and sets it as active. */
  openFile: (id: string) => void;
  /** Close a tab and adjust the active file to the nearest neighbor. */
  closeTab: (id: string) => void;
  /** Set the active file without opening a new tab. */
  setActiveFile: (id: string) => void;
  /** Update the active file content buffer. */
  setActiveContent: (content: string | null) => void;
  /** Reorder tabs by moving a tab from one index to another. */
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  /** Rename a tab ID (used when FileSystem mode changes file IDs). */
  renameTab: (oldId: string, newId: string) => void;

  /* ---- Panel toggles ---- */

  /** Toggle the sidebar visibility. */
  toggleSidebar: () => void;
  /** Toggle the command palette overlay. */
  toggleCommandPalette: () => void;
  /** Toggle the search panel. */
  toggleSearchPanel: () => void;
  /** Toggle the knowledge graph view. */
  toggleGraphView: () => void;
  /** Toggle the settings panel. */
  toggleSettingsPanel: () => void;
  /** Close all overlay panels (command palette, search, settings). */
  closeAllPanels: () => void;
}

/* ----------------------------------------------------------------
   Store
   ---------------------------------------------------------------- */

export const useEditorStore = create<EditorState>()((set) => ({
  /* ---- Initial state ---- */
  activeFileId: null,
  openTabs: [],
  activeContent: null,
  sidebarOpen: true,
  commandPaletteOpen: false,
  searchPanelOpen: false,
  graphViewOpen: false,
  settingsPanelOpen: false,

  /* ---- Tab management ---- */

  openFile: (id) =>
    set((state) => {
      const tabs = state.openTabs.includes(id)
        ? state.openTabs
        : [...state.openTabs, id];
      return { openTabs: tabs, activeFileId: id, activeContent: null };
    }),

  closeTab: (id) =>
    set((state) => {
      const idx = state.openTabs.indexOf(id);
      if (idx === -1) return state;

      const tabs = state.openTabs.filter((tabId) => tabId !== id);
      let nextActive = state.activeFileId;

      if (state.activeFileId === id) {
        if (tabs.length === 0) {
          nextActive = null;
        } else if (idx >= tabs.length) {
          /* Closed the last tab — select the new last */
          nextActive = tabs[tabs.length - 1];
        } else {
          /* Select the tab that slid into the closed tab's position */
          nextActive = tabs[idx];
        }
      }

      return { openTabs: tabs, activeFileId: nextActive, activeContent: null };
    }),

  setActiveFile: (id) =>
    set({ activeFileId: id, activeContent: null }),

  setActiveContent: (content) =>
    set({ activeContent: content }),

  reorderTabs: (fromIndex, toIndex) =>
    set((state) => {
      const tabs = [...state.openTabs];
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { openTabs: tabs };
    }),

  renameTab: (oldId, newId) =>
    set((state) => {
      const tabs = state.openTabs.map(id => id === oldId ? newId : id);
      const activeFileId = state.activeFileId === oldId ? newId : state.activeFileId;
      return { openTabs: tabs, activeFileId };
    }),

  /* ---- Panel toggles ---- */

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  toggleSearchPanel: () =>
    set((state) => ({ searchPanelOpen: !state.searchPanelOpen })),

  toggleGraphView: () =>
    set((state) => ({ graphViewOpen: !state.graphViewOpen })),

  toggleSettingsPanel: () =>
    set((state) => ({ settingsPanelOpen: !state.settingsPanelOpen })),

  closeAllPanels: () =>
    set({
      commandPaletteOpen: false,
      searchPanelOpen: false,
      settingsPanelOpen: false,
    }),
}));
