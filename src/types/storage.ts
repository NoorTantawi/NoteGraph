import type { FileNode } from './file';

export interface IStorageProvider {
  /** The unique name of this provider (e.g., 'indexeddb', 'filesystem') */
  name: string;

  /** Initialize the storage provider (e.g., request permissions, open DB) */
  init(): Promise<void>;

  /** Retrieve all files recursively */
  getAllFiles(): Promise<FileNode[]>;

  /** Retrieve a specific file by ID */
  getFile(id: string): Promise<FileNode | undefined>;

  /** Save or update a file */
  saveFile(file: FileNode): Promise<void>;

  /** Save multiple files */
  saveAllFiles(files: FileNode[]): Promise<void>;

  /** Delete a file by ID */
  deleteFile(id: string): Promise<void>;

  /** Rename a file (handles path/ID changes in FS provider) */
  renameFile(oldId: string, newId: string, newFile: FileNode): Promise<void>;

  /** Retrieve metadata */
  getMetadata(key: string): Promise<any>;

  /** Set metadata */
  setMetadata(key: string, value: any): Promise<void>;

  /** Save a document embedding vector */
  saveEmbedding(id: string, vector: number[]): Promise<void>;

  /** Retrieve an embedding by file ID */
  getEmbedding(id: string): Promise<number[] | undefined>;

  /** Retrieve all embeddings for cosine similarity search */
  getAllEmbeddings(): Promise<Record<string, number[]>>;
}
