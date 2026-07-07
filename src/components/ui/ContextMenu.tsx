import { type ReactNode, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Kbd } from './Kbd';

/** A single item in the context menu */
export interface ContextMenuItem {
  /** Display text for the item */
  label: string;
  /** Optional icon element (Lucide icon) */
  icon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Optional keyboard shortcut string */
  shortcut?: string;
  /** If true, renders a horizontal divider instead of an item */
  divider?: boolean;
  /** If true, applies danger (destructive) styling */
  danger?: boolean;
  /** If true, the item is grayed out and non-interactive */
  disabled?: boolean;
}

export interface ContextMenuProps {
  /** Menu items to render */
  items: ContextMenuItem[];
  /** Screen coordinates where the menu should appear */
  position: { x: number; y: number };
  /** Callback to close the menu */
  onClose: () => void;
}

/**
 * Atomic ContextMenu component for NoteGraph.
 *
 * Renders an absolutely-positioned dropdown menu at the given {x, y}.
 * Closes on click outside, Escape, or item click.
 * Animated with Motion scale + fade.
 *
 * @example
 * ```tsx
 * <ContextMenu
 *   items={[
 *     { label: 'Rename', icon: <Edit3 size={14} />, onClick: handleRename },
 *     { divider: true },
 *     { label: 'Delete', icon: <Trash2 size={14} />, onClick: handleDelete, danger: true },
 *   ]}
 *   position={{ x: 200, y: 300 }}
 *   onClose={() => setMenuOpen(false)}
 * />
 * ```
 */
export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  /** Close on Escape */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  /** Close on click outside */
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          zIndex: 55,
          minWidth: 180,
          padding: '4px 0',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          fontFamily: 'var(--font-ui)',
          overflow: 'hidden',
        }}
      >
        {items.map((item, index) => {
          /* Divider */
          if (item.divider) {
            return (
              <hr
                key={`divider-${index}`}
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--border)',
                  margin: '4px 0',
                }}
              />
            );
          }

          const isDanger = item.danger ?? false;
          const isDisabled = item.disabled ?? false;

          return (
            <button
              key={`${item.label}-${index}`}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                item.onClick?.();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDanger ? 'var(--danger)' : 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'var(--font-ui)',
                lineHeight: 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                textAlign: 'left',
                transition: 'background-color var(--transition-fast), color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled) {
                  e.currentTarget.style.backgroundColor = isDanger
                    ? 'var(--danger-subtle)'
                    : 'var(--bg-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Icon */}
              {item.icon && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    color: isDanger ? 'var(--danger)' : 'var(--text-secondary)',
                  }}
                >
                  {item.icon}
                </span>
              )}

              {/* Label */}
              <span style={{ flex: 1 }}>{item.label}</span>

              {/* Shortcut */}
              {item.shortcut && (
                <Kbd>{item.shortcut}</Kbd>
              )}
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
