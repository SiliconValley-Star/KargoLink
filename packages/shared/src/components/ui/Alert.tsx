import React from 'react';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const getAlertStyles = (variant: AlertProps['variant']): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    padding: spacing[4],
    borderRadius: radius.lg,
    border: '1px solid',
    fontFamily: typography.fontFamily.sans.join(', '),
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    info: {
      backgroundColor: colors.primary[50],
      borderColor: colors.primary[200],
      color: colors.primary[800],
    },
    success: {
      backgroundColor: colors.success[50],
      borderColor: colors.success[200],
      color: colors.success[800],
    },
    warning: {
      backgroundColor: colors.warning[50],
      borderColor: colors.warning[200],
      color: colors.warning[800],
    },
    error: {
      backgroundColor: colors.error[50],
      borderColor: colors.error[200],
      color: colors.error[800],
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant || 'info'],
  };
};

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className,
  style,
}) => {
  const alertStyles = getAlertStyles(variant);

  return (
    <div
      className={className}
      style={{ ...alertStyles, ...style }}
      role="alert"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {title && (
            <div
              style={{
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing[1],
              }}
            >
              {title}
            </div>
          )}
          <div>{children}</div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              marginLeft: spacing[2],
              color: 'currentColor',
              opacity: 0.7,
              fontSize: '18px',
              lineHeight: 1,
            }}
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;