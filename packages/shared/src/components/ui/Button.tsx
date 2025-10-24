import React from 'react';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const getButtonStyles = (variant: ButtonProps['variant'], size: ButtonProps['size'], disabled: boolean, loading: boolean, fullWidth: boolean): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.button.medium.fontWeight,
    lineHeight: typography.button.medium.lineHeight,
    letterSpacing: typography.button.medium.letterSpacing,
    borderRadius: radius.lg,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    textDecoration: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    position: 'relative',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    gap: spacing[2],
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      fontSize: typography.button.small.fontSize,
      padding: `${spacing[2]} ${spacing[3]}`,
      height: '32px',
    },
    md: {
      fontSize: typography.button.medium.fontSize,
      padding: `${spacing[3]} ${spacing[4]}`,
      height: '40px',
    },
    lg: {
      fontSize: typography.button.large.fontSize,
      padding: `${spacing[3]} ${spacing[6]}`,
      height: '48px',
    },
    xl: {
      fontSize: typography.button.large.fontSize,
      padding: `${spacing[4]} ${spacing[8]}`,
      height: '56px',
    },
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary[500],
      color: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[900],
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary[500],
      border: `1px solid ${colors.primary[300]}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary[500],
    },
    destructive: {
      backgroundColor: colors.error[500],
      color: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size || 'md'],
    ...variantStyles[variant || 'primary'],
  };
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className,
  style,
  startIcon,
  endIcon,
}) => {
  const buttonStyles = getButtonStyles(variant, size, disabled, loading, fullWidth);

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={className}
      style={{ ...buttonStyles, ...style }}
    >
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {!loading && startIcon && startIcon}
      {children}
      {!loading && endIcon && endIcon}
    </button>
  );
};

export default Button;