"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Typography = void 0;
const react_1 = __importDefault(require("react"));
const typography_1 = require("../theme/typography");
const colors_1 = require("../theme/colors");
const getTypographyStyles = (variant, color, align, weight) => {
    const baseStyles = {
        fontFamily: typography_1.typography.fontFamily.sans.join(', '),
        margin: 0,
        padding: 0,
    };
    const variantStyles = {
        h1: {
            ...typography_1.typography.heading.h1,
            marginBottom: '0.5em',
        },
        h2: {
            ...typography_1.typography.heading.h2,
            marginBottom: '0.5em',
        },
        h3: {
            ...typography_1.typography.heading.h3,
            marginBottom: '0.5em',
        },
        h4: {
            ...typography_1.typography.heading.h4,
            marginBottom: '0.5em',
        },
        h5: {
            ...typography_1.typography.heading.h5,
            marginBottom: '0.5em',
        },
        h6: {
            ...typography_1.typography.heading.h6,
            marginBottom: '0.5em',
        },
        body: {
            ...typography_1.typography.body.base,
            marginBottom: '1em',
        },
        bodyLarge: {
            ...typography_1.typography.body.large,
            marginBottom: '1em',
        },
        bodySmall: {
            ...typography_1.typography.body.small,
            marginBottom: '1em',
        },
        caption: {
            ...typography_1.typography.caption,
            marginBottom: '0.5em',
        },
    };
    const colorStyles = {
        primary: colors_1.colors.primary[500],
        secondary: colors_1.colors.neutral[600],
        text: colors_1.colors.light.text,
        textSecondary: colors_1.colors.light.textSecondary,
        error: colors_1.colors.error[500],
        success: colors_1.colors.success[500],
        warning: colors_1.colors.warning[500],
    };
    const weightStyles = {
        normal: typography_1.typography.fontWeight.normal,
        medium: typography_1.typography.fontWeight.medium,
        semibold: typography_1.typography.fontWeight.semibold,
        bold: typography_1.typography.fontWeight.bold,
    };
    const currentVariant = variantStyles[variant || 'body'] || variantStyles.body;
    const defaultWeight = typography_1.typography.fontWeight.normal;
    return {
        ...baseStyles,
        ...currentVariant,
        color: colorStyles[color || 'text'],
        textAlign: align || 'left',
        fontWeight: weight ? weightStyles[weight] : (currentVariant?.fontWeight || defaultWeight),
    };
};
const getDefaultElement = (variant) => {
    const elementMap = {
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
const Typography = ({ children, variant = 'body', color = 'text', align = 'left', weight, className, style, as, }) => {
    const Component = as || getDefaultElement(variant);
    const typographyStyles = getTypographyStyles(variant, color, align, weight);
    return react_1.default.createElement(Component, {
        className,
        style: { ...typographyStyles, ...style },
    }, children);
};
exports.Typography = Typography;
exports.default = exports.Typography;
//# sourceMappingURL=Typography.js.map