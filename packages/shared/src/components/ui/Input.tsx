import React from 'react';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const getInputStyles = (
  size: InputProps['size'],
  error: boolean,
  disabled: boolean,
  fullWidth: boolean,
  hasStartIcon: boolean,
  hasEndIcon: boolean
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.fontWeight.normal,
    borderRadius: radius.md,
    border: `1px solid ${error ? colors.error[300] : colors.neutral[300]}`,
    backgroundColor: disabled ? colors.neutral[50] : colors.light.background,
    color: disabled ? colors.neutral[400] : colors.light.text,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    display: 'block',
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      fontSize: typography.fontSize.sm,
      padding: `${spacing[2]} ${spacing[3]}`,
      height: '32px',
      paddingLeft: hasStartIcon ? spacing[8] : spacing[3],
      paddingRight: hasEndIcon ? spacing[8] : spacing[3],
    },
    md: {
      fontSize: typography.fontSize.base,
      padding: `${spacing[3]} ${spacing[4]}`,
      height: '40px',
      paddingLeft: hasStartIcon ? spacing[10] : spacing[4],
      paddingRight: hasEndIcon ? spacing[10] : spacing[4],
    },
    lg: {
      fontSize: typography.fontSize.lg,
      padding: `${spacing[4]} ${spacing[5]}`,
      height: '48px',
      paddingLeft: hasStartIcon ? spacing[12] : spacing[5],
      paddingRight: hasEndIcon ? spacing[12] : spacing[5],
    },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size || 'md'],
  };
};

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  error = false,
  errorMessage,
  label,
  size = 'md',
  fullWidth = false,
  startIcon,
  endIcon,
  className,
  style,
  onChange,
  onFocus,
  onBlur,
}) => {
  const inputStyles = getInputStyles(size, error, disabled, fullWidth, !!startIcon, !!endIcon);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-block',
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: disabled ? colors.neutral[400] : colors.neutral[500],
    pointerEvents: 'none',
    zIndex: 1,
  };

  const startIconStyles: React.CSSProperties = {
    ...iconStyles,
    left: size === 'sm' ? spacing[2] : size === 'lg' ? spacing[4] : spacing[3],
  };

  const endIconStyles: React.CSSProperties = {
    ...iconStyles,
    right: size === 'sm' ? spacing[2] : size === 'lg' ? spacing[4] : spacing[3],
  };

  return (
    <div className={className} style={{ ...containerStyles, ...style }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.light.text,
            marginBottom: spacing[1],
          }}
        >
          {label}
          {required && <span style={{ color: colors.error[500] }}> *</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {startIcon && <div style={startIconStyles}>{startIcon}</div>}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          style={inputStyles}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        
        {endIcon && <div style={endIconStyles}>{endIcon}</div>}
      </div>

      {error && errorMessage && (
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.error[500],
            marginTop: spacing[1],
            marginBottom: 0,
          }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Input;