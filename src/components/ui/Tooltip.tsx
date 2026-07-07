import { type ReactNode, useState, useRef, useCallback } from 'react';
import { Kbd } from './Kbd';

/** Tooltip position relative to the anchor element */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip text content */
  content: string;
  /** The element the tooltip anchors to */
  children: ReactNode;
  /** Which side to render on */
  position?: TooltipPosition;
  /** Optional keyboard shortcut to display (e.g., "Ctrl+S") */
  shortcut?: string;
}

/** Delay in ms before showing the tooltip */
const SHOW_DELAY = 400;

/** Position → transform/placement offsets */
const positionStyles: Record<TooltipPosition, React.CSSProperties> = {
  top: {
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 6,
  },
  bottom: {
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: 6,
  },
  left: {
    right: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginRight: 6,
  },
  right: {
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginLeft: 6,
  },
};

/** Arrow styles per position */
const arrowStyles: Record<TooltipPosition, React.CSSProperties> = {
  top: {
    position: 'absolute',
    bottom: -3,
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: 6,
    height: 6,
    backgroundColor: 'var(--bg-tertiary)',
    border: 'none',
  },
  bottom: {
    position: 'absolute',
    top: -3,
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: 6,
    height: 6,
    backgroundColor: 'var(--bg-tertiary)',
    border: 'none',
  },
  left: {
    position: 'absolute',
    right: -3,
    top: '50%',
    transform: 'translateY(-50%) rotate(45deg)',
    width: 6,
    height: 6,
    backgroundColor: 'var(--bg-tertiary)',
    border: 'none',
  },
  right: {
    position: 'absolute',
    left: -3,
    top: '50%',
    transform: 'translateY(-50%) rotate(45deg)',
    width: 6,
    height: 6,
    backgroundColor: 'var(--bg-tertiary)',
    border: 'none',
  },
};

/**
 * Atomic Tooltip component for NoteGraph.
 *
 * Shows on hover after a 400ms delay. Supports four positions
 * and an optional keyboard shortcut badge.
 *
 * @example
 * ```tsx
 * <Tooltip content="Bold" shortcut="Ctrl+B">
 *   <button>B</button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  shortcut,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), SHOW_DELAY);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            ...positionStyles[position],
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 8px',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            lineHeight: 1,
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'tooltip-fade-in 100ms ease-out',
          }}
        >
          {/* Arrow */}
          <span style={arrowStyles[position]} />

          {content}

          {shortcut && (
            <span style={{ marginLeft: 2 }}>
              <Kbd>{shortcut}</Kbd>
            </span>
          )}
        </span>
      )}

      {/* Inline keyframes for the fade-in animation */}
      {visible && (
        <style>{`
          @keyframes tooltip-fade-in {
            from { opacity: 0; transform: ${positionStyles[position].transform} scale(0.96); }
            to   { opacity: 1; transform: ${positionStyles[position].transform} scale(1); }
          }
        `}</style>
      )}
    </span>
  );
}
