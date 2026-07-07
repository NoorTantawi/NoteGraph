import { useRef, useCallback } from 'react';

interface SplitterProps {
  /** Called with new percentage (0-100) as user drags */
  onResize: (percentage: number) => void;
  /** Direction of the split */
  direction?: 'horizontal' | 'vertical';
}

/**
 * Draggable divider between editor and preview panes.
 * Double-click to reset to 50/50.
 */
export function Splitter({ onResize, direction = 'horizontal' }: SplitterProps) {
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;

        requestAnimationFrame(() => {
          const parent = containerRef.current?.parentElement;
          if (!parent) return;

          const rect = parent.getBoundingClientRect();
          let percentage: number;

          if (direction === 'horizontal') {
            percentage = ((moveEvent.clientX - rect.left) / rect.width) * 100;
          } else {
            percentage = ((moveEvent.clientY - rect.top) / rect.height) * 100;
          }

          // Clamp between 20% and 80%
          percentage = Math.max(20, Math.min(80, percentage));
          onResize(percentage);
        });
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onResize, direction]
  );

  const handleDoubleClick = useCallback(() => {
    onResize(50);
  }, [onResize]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        width: isHorizontal ? '5px' : '100%',
        height: isHorizontal ? '100%' : '5px',
        cursor: isHorizontal ? 'col-resize' : 'row-resize',
        backgroundColor: 'transparent',
        position: 'relative',
        flexShrink: 0,
        zIndex: 10,
      }}
      title="Drag to resize. Double-click to reset."
    >
      {/* Visible line */}
      <div
        style={{
          position: 'absolute',
          ...(isHorizontal
            ? { top: 0, bottom: 0, left: '50%', width: '1px', transform: 'translateX(-50%)' }
            : { left: 0, right: 0, top: '50%', height: '1px', transform: 'translateY(-50%)' }),
          backgroundColor: 'var(--border)',
          transition: 'background-color 150ms ease',
        }}
      />
      {/* Wider hover target with accent glow */}
      <style>{`
        .splitter-handle:hover > div:first-child,
        .splitter-handle:active > div:first-child {
          background-color: var(--accent) !important;
          box-shadow: 0 0 8px var(--accent-glow);
        }
      `}</style>
    </div>
  );
}
