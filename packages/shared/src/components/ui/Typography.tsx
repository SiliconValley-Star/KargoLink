import React from 'react';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption';
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'error' | 'success' | 'warning';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

const getTypographyStyles = (
  variant: TypographyProps['variant'],
  color: TypographyProps['color'],
  align: TypographyProps['align'],
  weight: TypographyProps['weight']
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans.join(', '),
    margin: 0,
    padding: 0,
  };

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    h1: {
      ...typography.heading.h1,
      marginBottom: '0.5em',
    },
    h2: {
      ...typography.heading.h2,
      marginBottom: '0.5em',
    },
    h3: {
      ...typography.heading.h3,
      marginBottom: '0.5em',
    },
    h4: {
      ...typography.heading.h4,
      marginBottom: '0.5em',
    },
    h5: {
      ...typography.heading.h5,
      marginBottom: '0.5em',
    },
    h6: {
      ...typography.heading.h6,
      marginBottom: '0.5em',
    },
    body: {
      ...typography.body.base,
      marginBottom: '1em',
    },
    bodyLarge: {
      ...typography.body.large,
      marginBottom: '1em',
    },
    bodySmall: {
      ...typography.body.small,
      marginBottom: '1em',
    },
    caption: {
      ...typography.caption,
      marginBottom: '0.5em',
    },
  };

  // Color styles
  const colorStyles: Record<string, string> = {
    primary: colors.primary[500],
    secondary: colors.neutral[600],
    text: colors.light.text,
    textSecondary: colors.light.textSecondary,
    error: colors.error[500],
    success: colors.success[500],
    warning: colors.warning[500],
  };

  // Weight styles
  const weightStyles: Record<string, string> = {
    normal: typography.fontWeight.normal,
    medium: typography.fontWeight.medium,
    semibold: typography.fontWeight.semibold,
    bold: typography.fontWeight.bold,
  };

  const currentVariant = variantStyles[variant || 'body'] || variantStyles.body;
  const defaultWeight = typography.fontWeight.normal;
  
  return {
    ...baseStyles,
    ...currentVariant,
    color: colorStyles[color || 'text'],
    textAlign: align || 'left',
    fontWeight: weight ? weightStyles[weight] : (currentVariant?.fontWeight || defaultWeight),
  };
};

const getDefaultElement = (variant: TypographyProps['variant']): keyof JSX.IntrinsicElements => {
  const elementMap: Record<string, keyof JSX.IntrinsicElements> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body: 'p',
    bodyLarge: 'p',
    bodySmall: 'p',
    caption: 'span',
  };
  
  return elementMap[variant || 'body'] || 'p';
};

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'text',
  align = 'left',
  weight,
  className,
  style,
  as,
}) => {
  const Component = as || getDefaultElement(variant);
  const typographyStyles = getTypographyStyles(variant, color, align, weight);

  return React.createElement(
    Component,
    {
      className,
      style: { ...typographyStyles, ...style },
    },
    children
  );
};

export default Typography;