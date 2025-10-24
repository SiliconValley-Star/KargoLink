import React from 'react';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

const getCardStyles = (
  variant: CardProps['variant'],
  padding: CardProps['padding'],
  onClick?: () => void,
  hover?: boolean
): { base: React.CSSProperties; hover: React.CSSProperties } => {
  const baseStyles: React.CSSProperties = {
    borderRadius: radius.lg,
    transition: 'all 0.2s ease-in-out',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    display: 'block',
    width: '100%',
  };

  // Padding styles
  const paddingStyles: Record<string, React.CSSProperties> = {
    none: { padding: '0' },
    sm: { padding: spacing[3] },
    md: { padding: spacing[4] },
    lg: { padding: spacing[6] },
    xl: { padding: spacing[8] },
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: colors.light.card,
      border: `1px solid ${colors.light.border}`,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    elevated: {
      backgroundColor: colors.light.card,
      border: 'none',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    outlined: {
      backgroundColor: 'transparent',
      border: `2px solid ${colors.neutral[200]}`,
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
    },
  };

  // Hover styles
  const hoverStyles: React.CSSProperties = hover || onClick ? {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'elevated'
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  } : {};

  return {
    base: {
      ...baseStyles,
      ...paddingStyles[padding || 'md'],
      ...variantStyles[variant || 'default'],
      ...(onClick && { cursor: 'pointer' }),
    },
    hover: hoverStyles,
  };
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  style,
  onClick,
  hover = false,
}) => {
  const cardStyles = getCardStyles(variant, padding, onClick, hover);

  return (
    <div
      onClick={onClick}
      className={className}
      style={{ ...cardStyles.base, ...style }}
      onMouseEnter={hover || onClick ? (e) => {
        Object.assign(e.currentTarget.style, cardStyles.hover);
      } : undefined}
      onMouseLeave={hover || onClick ? (e) => {
        Object.assign(e.currentTarget.style, cardStyles.base);
      } : undefined}
    >
      {children}
    </div>
  );
};

export default Card;