import React from 'react';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const getBadgeStyles = (
  variant: BadgeProps['variant'],
  size: BadgeProps['size']
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.fontWeight.medium,
    borderRadius: radius.full,
    border: 'none',
    whiteSpace: 'nowrap',
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      fontSize: typography.fontSize.xs,
      padding: `${spacing[1]} ${spacing[2]}`,
      height: '20px',
    },
    md: {
      fontSize: typography.fontSize.sm,
      padding: `${spacing[1]} ${spacing[3]}`,
      height: '24px',
    },
    lg: {
      fontSize: typography.fontSize.base,
      padding: `${spacing[2]} ${spacing[4]}`,
      height: '32px',
    },
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[800],
    },
    primary: {
      backgroundColor: colors.primary[500],
      color: 'white',
    },
    success: {
      backgroundColor: colors.success[500],
      color: 'white',
    },
    warning: {
      backgroundColor: colors.warning[500],
      color: 'white',
    },
    error: {
      backgroundColor: colors.error[500],
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
      border: `1px solid ${colors.neutral[300]}`,
    },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size || 'md'],
    ...variantStyles[variant || 'default'],
  };
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  style,
}) => {
  const badgeStyles = getBadgeStyles(variant, size);

  return (
    <span
      className={className}
      style={{ ...badgeStyles, ...style }}
    >
      {children}
    </span>
  );
};

export default Badge;