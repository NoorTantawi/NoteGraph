import { type ReactNode } from 'react';

export interface KbdProps {
  /** The shortcut text to display (e.g., "Ctrl+S", "Mod+K") */
  children?: ReactNode;
  /** Optional platform modifier to auto-render ("mod" -> ⌘/Ctrl) */
  modifier?: 'mod';
}

/**
 * Detect macOS for Mod → ⌘ conversion.
 *
 * Uses navigator.userAgentData if available (modern browsers),
 * falling back to navigator.userAgent and navigator.platform for broader compatibility.
 */
export const isMac: boolean =
  typeof navigator !== 'undefined'
    ? // Modern API
      ('userAgentData' in navigator &&
        (navigator as any).userAgentData?.platform === 'macOS') ||
      // User Agent check (robust)
      /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent || '') ||
      // Legacy platform check
      /Mac|iPhone|iPad|iPod/i.test(navigator.platform ?? '')
    : false;

/**
 * Convert a "Mod" prefix to the platform-appropriate key symbol.
 * "Mod+K" → "⌘K" on Mac, "Ctrl+K" on Windows/Linux.
 */
function formatShortcut(text: string): string {
  if (typeof text !== 'string') return String(text);
  return text.replace(/\bMod\b/g, isMac ? '⌘' : 'Ctrl');
}

/**
 * Atomic Kbd (keyboard shortcut badge) component for NoteGraph.
 *
 * Renders a styled keyboard key with a subtle 3D inset shadow.
 * Auto-converts "Mod" to ⌘ on macOS and Ctrl on Windows/Linux.
 *
 * @example
 * ```tsx
 * <Kbd>Mod+S</Kbd>     → renders "⌘S" on Mac, "Ctrl+S" on Windows
 * <Kbd>Shift+Enter</Kbd>
 * ```
 */
export function Kbd({ children, modifier }: KbdProps) {
  let text: ReactNode = children;
  if (modifier === 'mod') {
    text = isMac ? '⌘' : 'Ctrl';
  } else if (typeof children === 'string') {
    text = formatShortcut(children);
  }

  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        paddingInline: 5,
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-code)',
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        boxShadow: 'var(--shadow-inset), 0 1px 0 var(--border)',
        userSelect: 'none',
      }}
    >
      {text}
    </kbd>
  );
}
