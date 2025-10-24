import React from 'react';
import { colors } from '../theme/colors';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  className?: string;
  style?: React.CSSProperties;
}

const getSizeStyles = (size: LoadingSpinnerProps['size']) => {
  const sizes = {
    xs: '12px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
  };
  
  return sizes[size || 'md'];
};

const getColorStyles = (color: LoadingSpinnerProps['color']) => {
  const colorMap = {
    primary: colors.primary[500],
    secondary: colors.neutral[500],
    white: '#ffffff',
    current: 'currentColor',
  };
  
  return colorMap[color || 'primary'];
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  style,
}) => {
  const spinnerSize = getSizeStyles(size);
  const spinnerColor = getColorStyles(color);

  const spinnerStyles: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: `2px solid transparent`,
    borderTop: `2px solid ${spinnerColor}`,
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'cargolink-spin 1s linear infinite',
    ...style,
  };

  // Add keyframes to document if not already present
  React.useEffect(() => {
    const styleId = 'cargolink-spinner-keyframes';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = styleId;
      styleSheet.textContent = `
        @keyframes cargolink-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  return (
    <div
      className={className}
      style={spinnerStyles}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;