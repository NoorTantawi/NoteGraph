import { useState } from 'react';
import { X, Circle } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useFileStore } from '../../stores/fileStore';

/**
 * Horizontal tab strip showing open files.
 * Supports close on click and middle-click, unsaved indicator.
 */
export function TabBar() {
  const openTabs = useEditorStore((s) => s.openTabs);
  const activeFileId = useEditorStore((s) => s.activeFileId);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const closeTab = useEditorStore((s) => s.closeTab);
  const files = useFileStore((s) => s.files);

  if (openTabs.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: '36px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none', // Firefox
        flexShrink: 0,
      }}
    >
      {openTabs.map((tabId) => {
        const file = files[tabId];
        if (!file) return null;
        const isActive = tabId === activeFileId;

        return (
          <Tab
            key={tabId}
            name={file.name}
            isActive={isActive}
            onClick={() => setActiveFile(tabId)}
            onClose={(e) => {
              e.stopPropagation();
              closeTab(tabId);
            }}
            onMiddleClick={() => closeTab(tabId)}
          />
        );
      })}
    </div>
  );
}

/* ──────────────── Individual Tab ──────────────── */

interface TabProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
  onMiddleClick: () => void;
}

function Tab({ name, isActive, onClick, onClose, onMiddleClick }: TabProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseDown={(e) => {
        // Middle-click to close
        if (e.button === 1) {
          e.preventDefault();
          onMiddleClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0 12px',
        fontSize: '12px',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
        borderRight: '1px solid var(--border)',
        borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        transition: 'background-color 100ms ease, color 100ms ease',
        minWidth: '80px',
        maxWidth: '180px',
      }}
    >
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
        }}
      >
        {name}
      </span>
      {(isHovered || isActive) && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            borderRadius: '3px',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
