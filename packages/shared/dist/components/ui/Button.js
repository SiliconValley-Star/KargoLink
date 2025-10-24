"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../theme/colors");
const typography_1 = require("../theme/typography");
const spacing_1 = require("../theme/spacing");
const getButtonStyles = (variant, size, disabled, loading, fullWidth) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: typography_1.typography.fontFamily.sans.join(', '),
        fontWeight: typography_1.typography.button.medium.fontWeight,
        lineHeight: typography_1.typography.button.medium.lineHeight,
        letterSpacing: typography_1.typography.button.medium.letterSpacing,
        borderRadius: spacing_1.radius.lg,
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        textDecoration: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        position: 'relative',
        opacity: disabled || loading ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        gap: spacing_1.spacing[2],
    };
    const sizeStyles = {
        sm: {
            fontSize: typography_1.typography.button.small.fontSize,
            padding: `${spacing_1.spacing[2]} ${spacing_1.spacing[3]}`,
            height: '32px',
        },
        md: {
            fontSize: typography_1.typography.button.medium.fontSize,
            padding: `${spacing_1.spacing[3]} ${spacing_1.spacing[4]}`,
            height: '40px',
        },
        lg: {
            fontSize: typography_1.typography.button.large.fontSize,
            padding: `${spacing_1.spacing[3]} ${spacing_1.spacing[6]}`,
            height: '48px',
        },
        xl: {
            fontSize: typography_1.typography.button.large.fontSize,
            padding: `${spacing_1.spacing[4]} ${spacing_1.spacing[8]}`,
            height: '56px',
        },
    };
    const variantStyles = {
        primary: {
            backgroundColor: colors_1.colors.primary[500],
            color: 'white',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        secondary: {
            backgroundColor: colors_1.colors.neutral[100],
            color: colors_1.colors.neutral[900],
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        outline: {
            backgroundColor: 'transparent',
            color: colors_1.colors.primary[500],
            border: `1px solid ${colors_1.colors.primary[300]}`,
        },
        ghost: {
            backgroundColor: 'transparent',
            color: colors_1.colors.primary[500],
        },
        destructive: {
            backgroundColor: colors_1.colors.error[500],
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
const Button = ({ children, variant = 'primary', size = 'md', disabled = false, loading = false, fullWidth = false, onClick, className, style, startIcon, endIcon, }) => {
    const buttonStyles = getButtonStyles(variant, size, disabled, loading, fullWidth);
    return ((0, jsx_runtime_1.jsxs)("button", { onClick: disabled || loading ? undefined : onClick, disabled: disabled || loading, className: className, style: { ...buttonStyles, ...style }, children: [loading && ((0, jsx_runtime_1.jsx)("div", { style: {
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                } })), !loading && startIcon && startIcon, children, !loading && endIcon && endIcon] }));
};
exports.Button = Button;
exports.default = exports.Button;
//# sourceMappingURL=Button.js.map