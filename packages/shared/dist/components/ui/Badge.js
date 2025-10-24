"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../theme/colors");
const typography_1 = require("../theme/typography");
const spacing_1 = require("../theme/spacing");
const getBadgeStyles = (variant, size) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: typography_1.typography.fontFamily.sans.join(', '),
        fontWeight: typography_1.typography.fontWeight.medium,
        borderRadius: spacing_1.radius.full,
        border: 'none',
        whiteSpace: 'nowrap',
    };
    const sizeStyles = {
        sm: {
            fontSize: typography_1.typography.fontSize.xs,
            padding: `${spacing_1.spacing[1]} ${spacing_1.spacing[2]}`,
            height: '20px',
        },
        md: {
            fontSize: typography_1.typography.fontSize.sm,
            padding: `${spacing_1.spacing[1]} ${spacing_1.spacing[3]}`,
            height: '24px',
        },
        lg: {
            fontSize: typography_1.typography.fontSize.base,
            padding: `${spacing_1.spacing[2]} ${spacing_1.spacing[4]}`,
            height: '32px',
        },
    };
    const variantStyles = {
        default: {
            backgroundColor: colors_1.colors.neutral[100],
            color: colors_1.colors.neutral[800],
        },
        primary: {
            backgroundColor: colors_1.colors.primary[500],
            color: 'white',
        },
        success: {
            backgroundColor: colors_1.colors.success[500],
            color: 'white',
        },
        warning: {
            backgroundColor: colors_1.colors.warning[500],
            color: 'white',
        },
        error: {
            backgroundColor: colors_1.colors.error[500],
            color: 'white',
        },
        outline: {
            backgroundColor: 'transparent',
            color: colors_1.colors.neutral[700],
            border: `1px solid ${colors_1.colors.neutral[300]}`,
        },
    };
    return {
        ...baseStyles,
        ...sizeStyles[size || 'md'],
        ...variantStyles[variant || 'default'],
    };
};
const Badge = ({ children, variant = 'default', size = 'md', className, style, }) => {
    const badgeStyles = getBadgeStyles(variant, size);
    return ((0, jsx_runtime_1.jsx)("span", { className: className, style: { ...badgeStyles, ...style }, children: children }));
};
exports.Badge = Badge;
exports.default = exports.Badge;
//# sourceMappingURL=Badge.js.map