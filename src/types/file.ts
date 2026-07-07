/**
 * Core file system types for NoteGraph.
 * Every document and folder in the workspace is represented as a FileNode.
 */

export interface FileNode {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Display name including extension (e.g., "my-note.md") */
  name: string;
  /** Full path relative to workspace root (e.g., "folder/my-note.md") */
  path: string;
  /** Whether this is a file or folder */
  type: 'file' | 'folder';
  /** Markdown content — only present on files, empty string for folders */
  content: string;
  /** Ordered child IDs — only present on folders */
  children: string[];
  /** Parent folder ID, null for root-level items */
  parentId: string | null;
  /** Unix timestamp (ms) when created */
  createdAt: number;
  /** Unix timestamp (ms) when last modified */
  updatedAt: number;
  /** Extracted #tags from content */
  tags: string[];
  /** Extracted [[wikilink]] targets from content */
  links: string[];
  /** Word count of content */
  wordCount: number;
}

/** Minimal data needed to create a new file */
export interface CreateFileInput {
  name: string;
  parentId: string | null;
  type: 'file' | 'folder';
  content?: string;
}

/** Data for renaming a file */
export interface RenameFileInput {
  id: string;
  newName: string;
}

/** Sort options for file tree */
export type FileSortMode = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';

/** File tree expansion state */
export type ExpandedFolders = Set<string>;
