import type { IStorageProvider } from '../types/storage';
import { IndexedDBProvider } from './storage';
import { FileSystemProvider } from './fsProvider';

// Helper to safely parse local storage settings synchronously
function getInitialProvider(): IStorageProvider {
  try {
    const stored = localStorage.getItem('notegraph-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.storageProvider === 'filesystem') {
        return new FileSystemProvider();
      }
    }
  } catch (e) {
    console.error('Failed to parse settings for storage provider:', e);
  }
  return new IndexedDBProvider();
}

let activeProvider: IStorageProvider = getInitialProvider();

export function getStorageProvider(): IStorageProvider {
  return activeProvider;
}

export function setStorageProvider(provider: IStorageProvider): void {
  activeProvider = provider;
}
