import React from 'react';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

const getModalStyles = (size: ModalProps['size']) => {
  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1200px' },
  };

  return sizeStyles[size || 'md'];
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  className,
  style,
}) => {
  const modalSizeStyles = getModalStyles(size);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: spacing[4],
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: colors.light.background,
    borderRadius: radius.lg,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    ...modalSizeStyles,
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles: React.CSSProperties = {
    padding: `${spacing[6]} ${spacing[6]} ${spacing[4]}`,
    borderBottom: `1px solid ${colors.neutral[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.sans.join(', '),
    color: colors.light.text,
    margin: 0,
  };

  const contentStyles: React.CSSProperties = {
    padding: spacing[6],
    flex: 1,
    overflow: 'auto',
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: spacing[2],
    color: colors.neutral[500],
    fontSize: '24px',
    lineHeight: 1,
    borderRadius: radius.md,
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div
      style={overlayStyles}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={className}
        style={{ ...modalStyles, ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={headerStyles}>
            <h2 style={titleStyles}>{title}</h2>
            <button
              onClick={onClose}
              style={closeButtonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.neutral[100];
                e.currentTarget.style.color = colors.neutral[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.neutral[500];
              }}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}
        
        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;