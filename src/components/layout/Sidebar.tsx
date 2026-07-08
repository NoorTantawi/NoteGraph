import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  PanelLeft,
  PanelLeftClose,
  FilePlus,
  FolderPlus,
  Search,
  Settings,
  Network,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  Pencil,
  Copy,
  X,
  Sparkles,
} from 'lucide-react';
import { useFileStore } from '../../stores/fileStore';
import { useEditorStore } from '../../stores/editorStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { FileNode } from '../../types/file';
import { SimilarNotes } from '../feature/SimilarNotes';
import { WidgetZone } from '../ui/WidgetZone';
import { Kbd } from '../ui/Kbd';
import { NewFileDialog } from '../feature/NewFileDialog';

/* ─────────────────────── Sidebar ─────────────────────── */

/**
 * Collapsible left sidebar with file tree, search, and actions.
 * Uses glassmorphism background and resizable width.
 */
export function Sidebar() {
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const sidebarWidth = useSettingsStore((s) => s.sidebarWidth);
  const [activeTab, setActiveTab] = useState<'files' | 'related'>('files');

  if (!sidebarOpen) return null;

  return (
    <aside
      style={{
        width: `${sidebarWidth}px`,
        minWidth: '200px',
        maxWidth: '400px',
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <SidebarHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'files' ? (
        <>
          <SidebarSearch />
          <WidgetZone name="sidebar-top" />
          <SidebarFileTree />
        </>
      ) : (
        <SimilarNotes />
      )}
      <WidgetZone name="sidebar-bottom" />
      <SidebarFooter />
    </aside>
  );
}

/* ─────────────────────── Header ─────────────────────── */

function SidebarHeader({ activeTab, setActiveTab }: { activeTab: 'files' | 'related', setActiveTab: (t: 'files' | 'related') => void }) {
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 12px 8px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('files')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: activeTab === 'files' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'files' ? 600 : 400,
            fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Network size={16} style={{ color: activeTab === 'files' ? 'var(--accent)' : 'inherit' }} />
          <span>Files</span>
        </button>
        <button
          onClick={() => setActiveTab('related')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: activeTab === 'related' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'related' ? 600 : 400,
            fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Sparkles size={16} style={{ color: activeTab === 'related' ? 'var(--accent)' : 'inherit' }} />
          <span>Related</span>
        </button>
      </div>
      <button
        onClick={toggleSidebar}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
        }}
        title="Collapse sidebar"
      >
        <PanelLeftClose size={16} />
      </button>
    </div>
  );
}

/* ─────────────────────── Search ─────────────────────── */

function SidebarSearch() {
  const [query, setQuery] = useState('');
  const toggleSearchPanel = useEditorStore((s) => s.toggleSearchPanel);

  return (
    <div style={{ padding: '8px 12px' }}>
      <button
        onClick={toggleSearchPanel}
        style={{
          width: '100%',
          padding: '6px 10px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-tertiary)',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'border-color 150ms ease',
        }}
      >
        <Search size={13} />
        <span>Search notes...</span>
        <span style={{ marginLeft: 'auto' }}>
          <Kbd>Mod+P</Kbd>
        </span>
      </button>
    </div>
  );
}

/* ─────────────────────── File Tree ─────────────────────── */

function SidebarFileTree() {
  const rootIds = useFileStore((s) => s.rootIds);
  const files = useFileStore((s) => s.files);
  const isLoaded = useFileStore((s) => s.isLoaded);
  const expandedFolders = useFileStore((s) => s.expandedFolders);
  const activeFileId = useEditorStore((s) => s.activeFileId);
  const openFile = useEditorStore((s) => s.openFile);
  const toggleFolder = useFileStore((s) => s.toggleFolder);

  const [newDialogState, setNewDialogState] = useState<{
    isOpen: boolean;
    type: 'file' | 'folder';
    parentId: string | null;
  }>({
    isOpen: false,
    type: 'file',
    parentId: null,
  });

  // Get root-level items
  const rootItems = rootIds
    .map((id) => files[id])
    .filter(Boolean)
    .sort((a, b) => {
      // Folders first, then alphabetical
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => {
        e.preventDefault();
        const srcId = e.dataTransfer.getData('text/plain');
        if (srcId) {
          await useFileStore.getState().moveFile(srcId, null);
        }
      }}
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '4px 0',
      }}
    >
      {/* New file / folder buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '2px 12px 6px',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            flex: 1,
          }}
        >
          Files
        </span>
        <IconButton
          icon={<FilePlus size={14} />}
          onClick={() => setNewDialogState({ isOpen: true, type: 'file', parentId: null })}
          title="New file"
        />
        <IconButton
          icon={<FolderPlus size={14} />}
          onClick={() => setNewDialogState({ isOpen: true, type: 'folder', parentId: null })}
          title="New folder"
        />
      </div>

      {rootItems.length === 0 ? (
        <div
          style={{
            padding: '20px 12px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '12px',
          }}
        >
          No files yet. Create one to get started.
        </div>
      ) : (
        rootItems.map((item) => (
          <FileTreeNode
            key={item.id}
            node={item}
            files={files}
            depth={0}
            activeFileId={activeFileId}
            expandedFolders={expandedFolders}
            onFileClick={openFile}
            onToggleFolder={toggleFolder}
          />
        ))
      )}

      <NewFileDialog
        isOpen={newDialogState.isOpen}
        onClose={() => setNewDialogState(prev => ({ ...prev, isOpen: false }))}
        type={newDialogState.type}
        parentId={newDialogState.parentId}
      />
    </div>
  );
}

/* ─────────────────── File Tree Node ─────────────────── */

interface FileTreeNodeProps {
  node: FileNode;
  files: Record<string, FileNode>;
  depth: number;
  activeFileId: string | null;
  expandedFolders: Set<string>;
  onFileClick: (id: string) => void;
  onToggleFolder: (id: string) => void;
}

function FileTreeNode({
  node,
  files,
  depth,
  activeFileId,
  expandedFolders,
  onFileClick,
  onToggleFolder,
}: FileTreeNodeProps) {
  const isActive = node.id === activeFileId;
  const isExpanded = expandedFolders.has(node.id);
  const isFolder = node.type === 'folder';
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [isDragOver, setIsDragOver] = useState(false);

  const renameFile = useFileStore(s => s.renameFile);
  const moveFile = useFileStore(s => s.moveFile);

  useEffect(() => {
    setRenameValue(node.name);
  }, [node.name]);

  const handleRenameSubmit = async () => {
    setIsRenaming(false);
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== node.name) {
      await renameFile(node.id, trimmed);
    } else {
      setRenameValue(node.name);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsRenaming(false);
      setRenameValue(node.name);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isFolder) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!isFolder) return;

    const srcId = e.dataTransfer.getData('text/plain');
    if (srcId && srcId !== node.id) {
      await moveFile(srcId, node.id);
    }
  };

  const children = isFolder
    ? (node.children || [])
        .map((id) => files[id])
        .filter(Boolean)
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
    : [];

  const handleRowClick = (e: React.MouseEvent) => {
    // If the click is a double click, don't trigger the toggle/open action;
    // let onDoubleClick rename state transition handle it.
    if (e.detail === 2) {
      e.stopPropagation();
      return;
    }
    if (isFolder) {
      onToggleFolder(node.id);
    } else {
      onFileClick(node.id);
    }
  };

  return (
    <div>
      <div
        onClick={handleRowClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 12px',
          paddingLeft: `${12 + depth * 16}px`,
          cursor: 'pointer',
          fontSize: '13px',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          backgroundColor: isActive
            ? 'var(--accent-glow)'
            : isDragOver
              ? 'var(--accent-glow)'
              : isHovered
                ? 'var(--bg-hover)'
                : 'transparent',
          borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          borderTop: isDragOver ? '1px dashed var(--accent)' : '1px solid transparent',
          borderBottom: isDragOver ? '1px dashed var(--accent)' : '1px solid transparent',
          transition: 'background-color 100ms ease, color 100ms ease',
          userSelect: 'none',
        }}
      >
        {isFolder ? (
          isExpanded ? (
            <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          ) : (
            <ChevronRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          )
        ) : (
          <span style={{ width: 14, flexShrink: 0 }} />
        )}

        {isFolder ? (
          isExpanded ? (
            <FolderOpen size={14} style={{ color: 'var(--accent-muted)', flexShrink: 0 }} />
          ) : (
            <Folder size={14} style={{ color: 'var(--accent-muted)', flexShrink: 0 }} />
          )
        ) : (
          <FileText size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        )}

        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              padding: '1px 4px',
              fontFamily: 'var(--font-ui)',
              outline: 'none',
              width: '100%',
            }}
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
            }}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {node.name}
          </span>
        )}
      </div>

      {/* Render children if expanded folder */}
      {isFolder && isExpanded && (
        <div>
          {children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              files={files}
              depth={depth + 1}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              onFileClick={onFileClick}
              onToggleFolder={onToggleFolder}
            />
          ))}
          {children.length === 0 && (
            <div
              style={{
                paddingLeft: `${12 + (depth + 1) * 16}px`,
                padding: '3px 12px',
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                fontStyle: 'italic',
              }}
            >
              Empty folder
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Footer ─────────────────────── */

function SidebarFooter() {
  const toggleSettingsPanel = useEditorStore((s) => s.toggleSettingsPanel);
  const toggleGraphView = useEditorStore((s) => s.toggleGraphView);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        borderTop: '1px solid var(--border)',
      }}
    >
      <IconButton
        icon={<Network size={15} />}
        onClick={toggleGraphView}
        title="Knowledge Graph"
      />
      <IconButton
        icon={<Settings size={15} />}
        onClick={toggleSettingsPanel}
        title="Settings"
      />
    </div>
  );
}

/* ─────────────── Shared Icon Button ─────────────── */

function IconButton({
  icon,
  onClick,
  title,
}: {
  icon: ReactNode;
  onClick: () => void;
  title: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
      style={{
        background: isHovered ? 'var(--bg-hover)' : 'none',
        border: 'none',
        padding: '4px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 100ms ease',
      }}
    >
      {icon}
    </button>
  );
}
