import React, { useEffect } from 'react';
import { useFileStore } from '../../stores/fileStore';
import { FileTreeItem } from './FileTreeItem';

export function FileTree() {
  const isLoaded = useFileStore(s => s.isLoaded);
  const loadFromStorage = useFileStore(s => s.loadFromStorage);
  const getChildrenOf = useFileStore(s => s.getChildrenOf);

  useEffect(() => {
    if (!isLoaded) {
      loadFromStorage();
    }
  }, [isLoaded, loadFromStorage]);

  if (!isLoaded) {
    return <div className="p-4 text-sm text-[var(--text-secondary)]">Loading...</div>;
  }

  const rootFiles = getChildrenOf(null);

  return (
    <div className="py-2 overflow-y-auto overflow-x-hidden h-full">
      {rootFiles.length === 0 ? (
        <div className="px-4 py-2 text-sm text-[var(--text-tertiary)] italic">No files found</div>
      ) : (
        rootFiles.map(file => (
          <FileTreeItem key={file.id} file={file} />
        ))
      )}
    </div>
  );
}
