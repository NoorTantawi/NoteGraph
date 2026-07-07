import { type ReactNode, type ButtonHTMLAttributes } from 'react';

/**
 * Button variant styles — each maps to CSS custom property-based colors.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Button size presets */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Icon position relative to button label */
export type IconPosition = 'left' | 'right';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset controlling height, padding, and font size */
  size?: ButtonSize;
  /** Button content */
  children?: ReactNode;
  /** Optional icon element */
  icon?: ReactNode;
  /** Which side to render the icon on */
  iconPosition?: IconPosition;
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset';
}

/** Variant → CSS variable mappings */
const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: '1px solid transparent',
  },
  secondary: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    backgroundColor: 'var(--danger)',
    color: 'white',
    border: '1px solid transparent',
  },
};

/** Variant → hover CSS variable mappings */
const variantHoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--accent-hover)' },
  secondary: { backgroundColor: 'var(--bg-hover)' },
  ghost: { backgroundColor: 'var(--bg-hover)' },
  danger: { backgroundColor: 'var(--danger-hover)' },
};

/** Size → dimension and typography mappings */
const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 28, paddingInline: 10, fontSize: 12 },
  md: { height: 36, paddingInline: 14, fontSize: 14 },
  lg: { height: 44, paddingInline: 20, fontSize: 16 },
};

/** Icon gap sizes per button size */
const iconGap: Record<ButtonSize, number> = { sm: 4, md: 6, lg: 8 };

/**
 * Atomic Button component for NoteGraph.
 *
 * Supports four visual variants, three sizes, optional icons,
 * and a subtle scale-down animation on click.
 *
 * @example
 * ```tsx
 * <Button variant="primary" icon={<Save size={16} />}>
 *   Save Note
 * </Button>
 * ```
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  type = 'button',
  disabled,
  children,
  className,
  style,
  onMouseDown,
  ...rest
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: iconGap[size],
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    lineHeight: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all var(--transition-fast)',
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    outline: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  /**
   * Apply scale-down on mousedown for tactile feedback.
   * The CSS transition handles the smooth animation.
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(0.97)';
    }
    onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  /**
   * Hover styles are applied via onMouseEnter/onMouseLeave
   * because inline styles can't use :hover pseudo-class.
   */
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const hoverOverrides = variantHoverStyles[variant];
      for (const [key, value] of Object.entries(hoverOverrides)) {
        (e.currentTarget.style as any)[key] = value as string;
      }
    }
  };

  const handleMouseLeaveReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    const base = variantStyles[variant];
    for (const [key, value] of Object.entries(base)) {
      (e.currentTarget.style as any)[key] = value as string;
    }
    handleMouseLeave(e);
  };

  /**
   * Focus-visible ring for keyboard navigation accessibility.
   */
  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = 'none';
  };

  const iconNode = icon ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      {icon}
    </span>
  ) : null;

  return (
    <button
      type={type}
      disabled={disabled}
      className={className}
      style={baseStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveReset}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    >
      {iconPosition === 'left' && iconNode}
      {children}
      {iconPosition === 'right' && iconNode}
    </button>
  );
}
