import { type InputHTMLAttributes, type ReactNode } from 'react';

/** Input variant presets */
export type InputVariant = 'default' | 'search';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual style variant */
  variant?: InputVariant;
  /** Icon element for search variant (rendered on the left) */
  icon?: ReactNode;
}

/** Base input styling using CSS custom properties */
const baseStyle: React.CSSProperties = {
  width: '100%',
  height: 36,
  paddingInline: 12,
  paddingBlock: 0,
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  lineHeight: 1,
  outline: 'none',
  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
};

/** Additional padding for search variant to accommodate left icon */
const searchInputStyle: React.CSSProperties = {
  ...baseStyle,
  paddingLeft: 36,
};

/**
 * Atomic Input component for NoteGraph.
 *
 * Supports a default variant and a search variant with a left-side icon.
 * Applies accent border + glow on focus.
 *
 * @example
 * ```tsx
 * <Input placeholder="Search notes..." variant="search" icon={<Search size={16} />} />
 * ```
 */
export function Input({
  variant = 'default',
  icon,
  className,
  style,
  ...rest
}: InputProps) {
  const isSearch = variant === 'search';

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)';
    rest.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.boxShadow = 'none';
    rest.onBlur?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.style.borderColor = 'var(--border-hover)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.style.borderColor = 'var(--border)';
    }
  };

  const inputStyle = isSearch ? { ...searchInputStyle, ...style } : { ...baseStyle, ...style };

  return (
    <div
      style={{ position: 'relative', width: '100%' }}
      className={className}
    >
      {/* Search icon positioned absolutely inside the input */}
      {isSearch && icon && (
        <span
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            color: 'var(--text-tertiary)',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </span>
      )}
      <input
        {...rest}
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
