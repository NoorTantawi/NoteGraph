import type { FileNode } from '../types/file';
import type { IStorageProvider } from '../types/storage';
import { IndexedDBProvider } from './storage';
import { getFileExtension, getFileNameWithoutExtension, countWords } from './utils';

// Helper to extract tags and links from content
function extractTagsAndLinks(content: string) {
  const tags = Array.from(content.matchAll(/#[\w-]+/g)).map(m => m[0]);
  const links = Array.from(content.matchAll(/\[\[(.*?)\]\]/g)).map(m => m[1]);
  return { tags, links };
}

export class FileSystemProvider implements IStorageProvider {
  name = 'filesystem';
  private handle: FileSystemDirectoryHandle | null = null;
  private metadataProvider = new IndexedDBProvider(); // Used for persisting the handle and settings

  async init(): Promise<void> {
    // Attempt to load the handle from IndexedDB
    const storedHandle = await this.metadataProvider.getMetadata('vaultHandle');
    if (storedHandle) {
      this.handle = storedHandle;
    }
  }

  /** Request a new directory handle from the user */
  async requestMount(): Promise<boolean> {
    try {
      // @ts-ignore - TS might not have the full File System Access API types
      this.handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await this.metadataProvider.setMetadata('vaultHandle', this.handle);
      return true;
    } catch (e) {
      console.error('Failed to mount vault', e);
      return false;
    }
  }

  /** Check if we have permission to use the stored handle */
  async verifyPermission(): Promise<boolean> {
    if (!this.handle) return false;
    try {
      // @ts-ignore
      const permission = await this.handle.queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') return true;
      // @ts-ignore
      const request = await this.handle.requestPermission({ mode: 'readwrite' });
      return request === 'granted';
    } catch (e) {
      console.error('Permission verification failed', e);
      return false;
    }
  }

  get isMounted(): boolean {
    return this.handle !== null;
  }

  private async walkDirectory(
    dirHandle: FileSystemDirectoryHandle,
    parentPath: string,
    parentId: string | null
  ): Promise<FileNode[]> {
    const nodes: FileNode[] = [];
    const children: string[] = [];
    
    // @ts-ignore
    for await (const entry of dirHandle.values()) {
      if (entry.name.startsWith('.')) continue; // Skip hidden files/folders

      const currentPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
      const id = currentPath; // Path is the ID in FS mode
      children.push(id);

      if (entry.kind === 'file' && entry.name.endsWith('.md')) {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const content = await file.text();
        const { tags, links } = extractTagsAndLinks(content);
        
        nodes.push({
          id,
          name: entry.name,
          path: currentPath,
          type: 'file',
          content,
          children: [],
          parentId,
          createdAt: file.lastModified,
          updatedAt: file.lastModified,
          tags,
          links,
          wordCount: countWords(content),
        });
      } else if (entry.kind === 'directory') {
        const subDirHandle = entry as FileSystemDirectoryHandle;
        const subNodes = await this.walkDirectory(subDirHandle, currentPath, id);
        
        // Push the folder itself
        nodes.push({
          id,
          name: entry.name,
          path: currentPath,
          type: 'folder',
          content: '',
          children: subNodes.filter(n => n.parentId === id).map(n => n.id),
          parentId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: [],
          links: [],
          wordCount: 0,
        });
        
        nodes.push(...subNodes);
      }
    }
    
    return nodes;
  }

  async getAllFiles(): Promise<FileNode[]> {
    if (!this.handle) throw new Error('No vault mounted');
    const granted = await this.verifyPermission();
    if (!granted) throw new Error('Permission denied');

    return this.walkDirectory(this.handle, '', null);
  }

  async getFile(id: string): Promise<FileNode | undefined> {
    const files = await this.getAllFiles(); // Naive implementation, could be optimized by traversing to the specific file
    return files.find(f => f.id === id);
  }

  private async getDirectoryHandleFromPath(pathParts: string[]): Promise<FileSystemDirectoryHandle | null> {
    if (!this.handle) return null;
    let curr = this.handle;
    for (const part of pathParts) {
      try {
        // @ts-ignore
        curr = await curr.getDirectoryHandle(part, { create: true });
      } catch (e) {
        return null;
      }
    }
    return curr;
  }

  async saveFile(file: FileNode): Promise<void> {
    if (!this.handle) throw new Error('No vault mounted');
    const pathParts = file.path.split('/');
    const fileName = pathParts.pop();
    if (!fileName) return;

    if (file.type === 'folder') {
      await this.getDirectoryHandleFromPath(file.path.split('/'));
      return;
    }

    const dirHandle = await this.getDirectoryHandleFromPath(pathParts);
    if (!dirHandle) throw new Error('Could not resolve parent directory');

    // @ts-ignore
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    // @ts-ignore
    const writable = await fileHandle.createWritable();
    await writable.write(file.content);
    await writable.close();
  }

  async saveAllFiles(files: FileNode[]): Promise<void> {
    for (const file of files) {
      await this.saveFile(file);
    }
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.handle) return;
    const pathParts = id.split('/');
    const fileName = pathParts.pop();
    if (!fileName) return;

    const dirHandle = await this.getDirectoryHandleFromPath(pathParts);
    if (!dirHandle) return;

    // @ts-ignore
    await dirHandle.removeEntry(fileName, { recursive: true });
  }

  async renameFile(oldId: string, newId: string, newFile: FileNode): Promise<void> {
    // 1. Save new file
    await this.saveFile(newFile);
    // 2. Delete old file
    if (oldId !== newId) {
      await this.deleteFile(oldId);
    }
  }

  async getMetadata(key: string): Promise<any> {
    return this.metadataProvider.getMetadata(key);
  }

  async setMetadata(key: string, value: any): Promise<void> {
    return this.metadataProvider.setMetadata(key, value);
  }

  async saveEmbedding(id: string, vector: number[]): Promise<void> {
    return this.metadataProvider.saveEmbedding(id, vector);
  }

  async getEmbedding(id: string): Promise<number[] | undefined> {
    return this.metadataProvider.getEmbedding(id);
  }

  async getAllEmbeddings(): Promise<Record<string, number[]>> {
    return this.metadataProvider.getAllEmbeddings();
  }
}
