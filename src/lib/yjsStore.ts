import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import type { FileNode } from '../types/file';

export const doc = new Y.Doc();

export type FileNodeMeta = Omit<FileNode, 'content'>;

// The central map for our file system tree and metadata
export const filesMap = doc.getMap<FileNodeMeta>('files');

// Persist the document locally to IndexedDB
export const indexeddbProvider = new IndexeddbPersistence('notegraph-yjs-db', doc);

// Connect to peers via WebRTC using the public Yjs signaling server
export const webrtcProvider = new WebrtcProvider('notegraph-workspace-alpha', doc, {
  signaling: ['wss://signaling.yjs.dev'],
});

// Debugging helpers
indexeddbProvider.on('synced', () => {
  console.log('✅ Yjs synced with IndexedDB');
});

webrtcProvider.on('synced', ({ synced }: { synced: boolean }) => {
  console.log('🌐 WebRTC synced:', synced);
});
