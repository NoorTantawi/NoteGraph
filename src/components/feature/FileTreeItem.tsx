import React from 'react';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { Folder, File as FileIcon, ChevronRight, ChevronDown } from 'lucide-react';
import type { FileNode } from '../../types/file';

interface FileTreeItemProps {
  file: FileNode;
  level?: number;
}

export function FileTreeItem({ file, level = 0 }: FileTreeItemProps) {
  const toggleFolder = useFileStore(s => s.toggleFolder);
  const expandedFolders = useFileStore(s => s.expandedFolders);
  const getChildrenOf = useFileStore(s => s.getChildrenOf);
  
  const openFile = useEditorStore(s => s.openFile);
  const activeFileId = useEditorStore(s => s.activeFileId);

  const isExpanded = expandedFolders.has(file.id);
  const isActive = activeFileId === file.id;

  const handleClick = () => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      openFile(file.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Context menu logic would go here
  };

  const paddingLeft = `${level * 12 + 8}px`;

  return (
    <div>
      <div
        className={`flex items-center py-1 pr-2 cursor-pointer text-sm select-none hover:bg-[var(--bg-hover)] ${isActive ? 'bg-[var(--bg-active)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
        style={{ paddingLeft }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span className="mr-1 flex items-center justify-center w-4 h-4 opacity-70">
          {file.type === 'folder' ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : null}
        </span>
        <span className="mr-2 flex items-center justify-center w-4 h-4 opacity-70">
          {file.type === 'folder' ? (
            <Folder size={14} />
          ) : (
            <FileIcon size={14} />
          )}
        </span>
        <span className="truncate">{file.name}</span>
      </div>
      
      {file.type === 'folder' && isExpanded && (
        <div>
          {getChildrenOf(file.id).map(child => (
            <FileTreeItem key={child.id} file={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
