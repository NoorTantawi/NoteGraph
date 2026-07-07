import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { FileNode } from '../types/file';
import type { IStorageProvider } from '../types/storage';

interface NoteGraphDB extends DBSchema {
  files: {
    key: string;
    value: FileNode;
  };
  metadata: {
    key: string;
    value: any;
  };
  embeddings: {
    key: string;
    value: number[];
  };
}

const DB_NAME = 'notegraph-db';
const DB_VERSION = 2;

export class IndexedDBProvider implements IStorageProvider {
  name = 'indexeddb';
  private dbPromise: Promise<IDBPDatabase<NoteGraphDB>> | null = null;

  async init(): Promise<void> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<NoteGraphDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains('embeddings')) {
            db.createObjectStore('embeddings');
          }
        },
      });
    }
    await this.dbPromise;
  }

  private async getDB(): Promise<IDBPDatabase<NoteGraphDB>> {
    await this.init();
    return this.dbPromise!;
  }

  async getAllFiles(): Promise<FileNode[]> {
    const db = await this.getDB();
    return db.getAll('files');
  }

  async getFile(id: string): Promise<FileNode | undefined> {
    const db = await this.getDB();
    return db.get('files', id);
  }

  async saveFile(file: FileNode): Promise<void> {
    const db = await this.getDB();
    await db.put('files', file);
  }

  async saveAllFiles(files: FileNode[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction('files', 'readwrite');
    await Promise.all([
      ...files.map(file => tx.store.put(file)),
      tx.done
    ]);
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('files', id);
  }

  async renameFile(oldId: string, newId: string, newFile: FileNode): Promise<void> {
    const db = await this.getDB();
    if (oldId !== newId) {
      await db.delete('files', oldId);
    }
    await db.put('files', newFile);
  }

  async getMetadata(key: string): Promise<any> {
    const db = await this.getDB();
    const result = await db.get('metadata', key);
    return result ? result.value : undefined;
  }

  async setMetadata(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    await db.put('metadata', { key, value });
  }

  // --- Embeddings ---

  async saveEmbedding(id: string, vector: number[]): Promise<void> {
    const db = await this.getDB();
    await db.put('embeddings', vector, id);
  }

  async getEmbedding(id: string): Promise<number[] | undefined> {
    const db = await this.getDB();
    return db.get('embeddings', id);
  }

  async getAllEmbeddings(): Promise<Record<string, number[]>> {
    const db = await this.getDB();
    const tx = db.transaction('embeddings', 'readonly');
    const store = tx.objectStore('embeddings');
    const keys = await store.getAllKeys();
    const values = await store.getAll();
    
    const result: Record<string, number[]> = {};
    for (let i = 0; i < keys.length; i++) {
      result[keys[i] as string] = values[i];
    }
    return result;
  }

  async exportAllData(): Promise<{ files: FileNode[], metadata: Record<string, any> }> {
    const db = await this.getDB();
    const tx = db.transaction(['files', 'metadata'], 'readonly');
    
    const files = await tx.objectStore('files').getAll();
    const metadataEntries = await tx.objectStore('metadata').getAll();
    
    const metadata = metadataEntries.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, any>);
    
    await tx.done;
    
    return { files, metadata };
  }

  async importData(data: { files: FileNode[] }): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction('files', 'readwrite');
    
    await tx.objectStore('files').clear();
    
    await Promise.all([
      ...data.files.map(file => tx.store.put(file)),
      tx.done
    ]);
  }
}

