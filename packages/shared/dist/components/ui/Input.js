"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../theme/colors");
const typography_1 = require("../theme/typography");
const spacing_1 = require("../theme/spacing");
const getInputStyles = (size, error, disabled, fullWidth, hasStartIcon, hasEndIcon) => {
    const baseStyles = {
        fontFamily: typography_1.typography.fontFamily.sans.join(', '),
        fontWeight: typography_1.typography.fontWeight.normal,
        borderRadius: spacing_1.radius.md,
        border: `1px solid ${error ? colors_1.colors.error[300] : colors_1.colors.neutral[300]}`,
        backgroundColor: disabled ? colors_1.colors.neutral[50] : colors_1.colors.light.background,
        color: disabled ? colors_1.colors.neutral[400] : colors_1.colors.light.text,
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
        width: fullWidth ? '100%' : 'auto',
        display: 'block',
    };
    const sizeStyles = {
        sm: {
            fontSize: typography_1.typography.fontSize.sm,
            padding: `${spacing_1.spacing[2]} ${spacing_1.spacing[3]}`,
            height: '32px',
            paddingLeft: hasStartIcon ? spacing_1.spacing[8] : spacing_1.spacing[3],
            paddingRight: hasEndIcon ? spacing_1.spacing[8] : spacing_1.spacing[3],
        },
        md: {
            fontSize: typography_1.typography.fontSize.base,
            padding: `${spacing_1.spacing[3]} ${spacing_1.spacing[4]}`,
            height: '40px',
            paddingLeft: hasStartIcon ? spacing_1.spacing[10] : spacing_1.spacing[4],
            paddingRight: hasEndIcon ? spacing_1.spacing[10] : spacing_1.spacing[4],
        },
        lg: {
            fontSize: typography_1.typography.fontSize.lg,
            padding: `${spacing_1.spacing[4]} ${spacing_1.spacing[5]}`,
            height: '48px',
            paddingLeft: hasStartIcon ? spacing_1.spacing[12] : spacing_1.spacing[5],
            paddingRight: hasEndIcon ? spacing_1.spacing[12] : spacing_1.spacing[5],
        },
    };
    return {
        ...baseStyles,
        ...sizeStyles[size || 'md'],
    };
};
const Input = ({ type = 'text', placeholder, value, defaultValue, disabled = false, required = false, error = false, errorMessage, label, size = 'md', fullWidth = false, startIcon, endIcon, className, style, onChange, onFocus, onBlur, }) => {
    const inputStyles = getInputStyles(size, error, disabled, fullWidth, !!startIcon, !!endIcon);
    const containerStyles = {
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-block',
    };
    const iconStyles = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        color: disabled ? colors_1.colors.neutral[400] : colors_1.colors.neutral[500],
        pointerEvents: 'none',
        zIndex: 1,
    };
    const startIconStyles = {
        ...iconStyles,
        left: size === 'sm' ? spacing_1.spacing[2] : size === 'lg' ? spacing_1.spacing[4] : spacing_1.spacing[3],
    };
    const endIconStyles = {
        ...iconStyles,
        right: size === 'sm' ? spacing_1.spacing[2] : size === 'lg' ? spacing_1.spacing[4] : spacing_1.spacing[3],
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, style: { ...containerStyles, ...style }, children: [label && ((0, jsx_runtime_1.jsxs)("label", { style: {
                    display: 'block',
                    fontSize: typography_1.typography.fontSize.sm,
                    fontWeight: typography_1.typography.fontWeight.medium,
                    color: colors_1.colors.light.text,
                    marginBottom: spacing_1.spacing[1],
                }, children: [label, required && (0, jsx_runtime_1.jsx)("span", { style: { color: colors_1.colors.error[500] }, children: " *" })] })), (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative' }, children: [startIcon && (0, jsx_runtime_1.jsx)("div", { style: startIconStyles, children: startIcon }), (0, jsx_runtime_1.jsx)("input", { type: type, placeholder: placeholder, value: value, defaultValue: defaultValue, disabled: disabled, required: required, style: inputStyles, onChange: (e) => onChange?.(e.target.value), onFocus: onFocus, onBlur: onBlur }), endIcon && (0, jsx_runtime_1.jsx)("div", { style: endIconStyles, children: endIcon })] }), error && errorMessage && ((0, jsx_runtime_1.jsx)("p", { style: {
                    fontSize: typography_1.typography.fontSize.xs,
                    color: colors_1.colors.error[500],
                    marginTop: spacing_1.spacing[1],
                    marginBottom: 0,
                }, children: errorMessage }))] }));
};
exports.Input = Input;
exports.default = exports.Input;
//# sourceMappingURL=Input.js.map