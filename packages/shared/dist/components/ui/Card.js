"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../theme/colors");
const spacing_1 = require("../theme/spacing");
const getCardStyles = (variant, padding, onClick, hover) => {
    const baseStyles = {
        borderRadius: spacing_1.radius.lg,
        transition: 'all 0.2s ease-in-out',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'block',
        width: '100%',
    };
    const paddingStyles = {
        none: { padding: '0' },
        sm: { padding: spacing_1.spacing[3] },
        md: { padding: spacing_1.spacing[4] },
        lg: { padding: spacing_1.spacing[6] },
        xl: { padding: spacing_1.spacing[8] },
    };
    const variantStyles = {
        default: {
            backgroundColor: colors_1.colors.light.card,
            border: `1px solid ${colors_1.colors.light.border}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevated: {
            backgroundColor: colors_1.colors.light.card,
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        outlined: {
            backgroundColor: 'transparent',
            border: `2px solid ${colors_1.colors.neutral[200]}`,
            boxShadow: 'none',
        },
        ghost: {
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
        },
    };
    const hoverStyles = hover || onClick ? {
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
const Card = ({ children, variant = 'default', padding = 'md', className, style, onClick, hover = false, }) => {
    const cardStyles = getCardStyles(variant, padding, onClick, hover);
    return ((0, jsx_runtime_1.jsx)("div", { onClick: onClick, className: className, style: { ...cardStyles.base, ...style }, onMouseEnter: hover || onClick ? (e) => {
            Object.assign(e.currentTarget.style, cardStyles.hover);
        } : undefined, onMouseLeave: hover || onClick ? (e) => {
            Object.assign(e.currentTarget.style, cardStyles.base);
        } : undefined, children: children }));
};
exports.Card = Card;
exports.default = exports.Card;
//# sourceMappingURL=Card.js.map