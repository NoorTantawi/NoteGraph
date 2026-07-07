/**
 * File system Zustand store for NoteGraph.
 *
 * Manages the in-memory file tree and syncs to the active storage provider.
 * Content updates are debounced to avoid thrashing storage on every keystroke.
 */

import { create } from 'zustand';
import type { CreateFileInput, FileNode } from '../types/file';
import { countWords, debounce, generateId } from '../lib/utils';
import { doc, filesMap, indexeddbProvider } from '../lib/yjsStore';
import { useEditorStore } from './editorStore';
import { useEmbeddingsStore } from './embeddingsStore';

/* ----------------------------------------------------------------
   Store interface
   ---------------------------------------------------------------- */

interface FileState {
  files: Record<string, FileNode>;
  rootIds: string[];
  expandedFolders: Set<string>;
  isLoaded: boolean;
  error: string | null;

  loadFromStorage: () => Promise<void>;
  createFile: (input: CreateFileInput) => Promise<string>;
  createFolder: (input: CreateFileInput) => Promise<string>;
  updateContent: (id: string, content: string) => void;
  renameFile: (id: string, newName: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  moveFile: (id: string, newParentId: string | null) => Promise<void>;

  toggleFolder: (id: string) => void;
  getFileByName: (name: string) => FileNode | undefined;
  getChildrenOf: (parentId: string | null) => FileNode[];
}

/* ----------------------------------------------------------------
   Helpers
   ---------------------------------------------------------------- */

function collectDescendantIdsMap(id: string): string[] {
  const node = filesMap.get(id);
  if (!node || node.type !== 'folder') return [];

  const ids: string[] = [];
  for (const childId of node.children) {
    ids.push(childId);
    ids.push(...collectDescendantIdsMap(childId));
  }
  return ids;
}

const debouncedSave = debounce((file: FileNode) => {
  if (file.type === 'file') {
    useEmbeddingsStore.getState().generateEmbeddingForFile(file.id, file.content);
  }
}, 300);

// Helper to remove extension for wikilink logic
function stripExtension(name: string) {
  return name.replace(/\.md$/, '');
}

/* ----------------------------------------------------------------
   Store
   ---------------------------------------------------------------- */

export const useFileStore = create<FileState>()((set, get) => ({
  files: {},
  rootIds: [],
  expandedFolders: new Set<string>(),
  isLoaded: false,
  error: null,

  loadFromStorage: async () => {
    try {
      // Wait for IndexedDB to load the initial state
      await new Promise<void>((resolve) => {
        if (indexeddbProvider.synced) {
          resolve();
        } else {
          indexeddbProvider.once('synced', () => resolve());
        }
      });

      const rebuildState = () => {
        const files: Record<string, FileNode> = {};
        const rootIds: string[] = [];

        for (const [id, meta] of filesMap.entries()) {
          const content = doc.getText(id).toString();
          files[id] = { ...meta, content } as FileNode;
          if (meta.parentId === null) {
            rootIds.push(id);
          }
        }

        rootIds.sort((a, b) => {
          const fa = files[a];
          const fb = files[b];
          if (!fa || !fb) return 0;
          if (fa.type !== fb.type) {
            return fa.type === 'folder' ? -1 : 1;
          }
          return fa.name.localeCompare(fb.name);
        });

        set({ files, rootIds, isLoaded: true, error: null });
      };

      rebuildState();

      // Observe map changes to update Zustand reactively
      filesMap.observe(() => {
        rebuildState();
      });

    } catch (e: any) {
      console.error('Failed to load storage:', e);
      set({ error: e.message || 'Failed to load storage', isLoaded: true });
    }
  },

  createFile: async (input) => {
    const now = Date.now();
    const id = generateId();

    const nodeMeta = {
      id,
      name: input.name,
      path: id, // Retained for type compatibility
      type: 'file' as const,
      children: [],
      parentId: input.parentId,
      createdAt: now,
      updatedAt: now,
      tags: [],
      links: [],
      wordCount: countWords(input.content ?? ''),
    };

    doc.transact(() => {
      filesMap.set(id, nodeMeta);
      if (input.content) {
        doc.getText(id).insert(0, input.content);
      }
      
      if (input.parentId) {
        const parentMeta = filesMap.get(input.parentId);
        if (parentMeta) {
          filesMap.set(input.parentId, {
            ...parentMeta,
            children: [...parentMeta.children, id]
          });
        }
      }
    });

    return id;
  },

  createFolder: async (input) => {
    const now = Date.now();
    const id = generateId();

    const nodeMeta = {
      id,
      name: input.name,
      path: id,
      type: 'folder' as const,
      children: [],
      parentId: input.parentId,
      createdAt: now,
      updatedAt: now,
      tags: [],
      links: [],
      wordCount: 0,
    };

    doc.transact(() => {
      filesMap.set(id, nodeMeta);
      
      if (input.parentId) {
        const parentMeta = filesMap.get(input.parentId);
        if (parentMeta) {
          filesMap.set(input.parentId, {
            ...parentMeta,
            children: [...parentMeta.children, id]
          });
        }
      }
    });

    return id;
  },

  updateContent: (id, content) => {
    // In step 1, we replace the entire Y.Text content to simulate update.
    // In step 2, y-codemirror will handle granular edits.
    const ytext = doc.getText(id);
    if (ytext.toString() !== content) {
      ytext.delete(0, ytext.length);
      ytext.insert(0, content);
    }
    
    // Update metadata
    const meta = filesMap.get(id);
    if (meta) {
      filesMap.set(id, {
        ...meta,
        updatedAt: Date.now(),
        wordCount: countWords(content)
      });
    }

    const currentFile = get().files[id];
    if (currentFile) {
      debouncedSave({ ...currentFile, content });
    }
  },

  renameFile: async (id, newName) => {
    const meta = filesMap.get(id);
    if (!meta) return;

    doc.transact(() => {
      filesMap.set(id, {
        ...meta,
        name: newName,
        updatedAt: Date.now(),
      });

      // Refactor Wikilinks across all other files
      const oldLinkTarget = stripExtension(meta.name);
      const newLinkTarget = stripExtension(newName);
      
      if (meta.type === 'file' && oldLinkTarget !== newLinkTarget) {
        const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wikilinkRegex = new RegExp(`\\[\\[${escapeRegExp(oldLinkTarget)}\\]\\]`, 'g');
        
        for (const [otherId, otherMeta] of filesMap.entries()) {
          if (otherMeta.type === 'file' && otherId !== id) {
            const otherText = doc.getText(otherId);
            const currentContent = otherText.toString();
            if (currentContent.includes(`[[${oldLinkTarget}]]`)) {
              const newContent = currentContent.replace(wikilinkRegex, `[[${newLinkTarget}]]`);
              otherText.delete(0, otherText.length);
              otherText.insert(0, newContent);

              filesMap.set(otherId, {
                ...otherMeta,
                updatedAt: Date.now(),
                wordCount: countWords(newContent)
              });
            }
          }
        }
      }
    });
  },

  deleteFile: async (id) => {
    const meta = filesMap.get(id);
    if (!meta) return;

    const idsToDelete = [id, ...collectDescendantIdsMap(id)];

    doc.transact(() => {
      if (meta.parentId) {
        const parentMeta = filesMap.get(meta.parentId);
        if (parentMeta) {
          filesMap.set(meta.parentId, {
            ...parentMeta,
            children: parentMeta.children.filter((cid) => cid !== id)
          });
        }
      }

      for (const deleteId of idsToDelete) {
        filesMap.delete(deleteId);
      }
    });

    set((state) => {
      const nextExpanded = new Set(state.expandedFolders);
      for (const deleteId of idsToDelete) {
        nextExpanded.delete(deleteId);
      }
      return { expandedFolders: nextExpanded };
    });
  },

  moveFile: async (id, newParentId) => {
    const meta = filesMap.get(id);
    if (!meta || meta.parentId === newParentId) return;

    doc.transact(() => {
      if (meta.parentId) {
        const oldParent = filesMap.get(meta.parentId);
        if (oldParent) {
          filesMap.set(meta.parentId, {
            ...oldParent,
            children: oldParent.children.filter((cid) => cid !== id)
          });
        }
      }

      if (newParentId) {
        const newParent = filesMap.get(newParentId);
        if (newParent) {
          filesMap.set(newParentId, {
            ...newParent,
            children: [...newParent.children, id]
          });
        }
      }

      filesMap.set(id, {
        ...meta,
        parentId: newParentId,
        updatedAt: Date.now()
      });
    });
  },

  /* ---- Tree ---- */

  toggleFolder: (id) =>
    set((state) => {
      const next = new Set(state.expandedFolders);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedFolders: next };
    }),

  getFileByName: (name) => {
    const { files } = get();
    return Object.values(files).find((f) => f.name === name);
  },

  getChildrenOf: (parentId) => {
    const { files, rootIds } = get();

    const ids = parentId
      ? files[parentId]?.children ?? []
      : rootIds;

    return ids
      .map((id) => files[id])
      .filter(Boolean)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  },
}));
