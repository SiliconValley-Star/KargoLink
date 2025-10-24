"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const colors_1 = require("../theme/colors");
const typography_1 = require("../theme/typography");
const spacing_1 = require("../theme/spacing");
const getAlertStyles = (variant) => {
    const baseStyles = {
        padding: spacing_1.spacing[4],
        borderRadius: spacing_1.radius.lg,
        border: '1px solid',
        fontFamily: typography_1.typography.fontFamily.sans.join(', '),
        fontSize: typography_1.typography.fontSize.sm,
        lineHeight: typography_1.typography.lineHeight.relaxed,
    };
    const variantStyles = {
        info: {
            backgroundColor: colors_1.colors.primary[50],
            borderColor: colors_1.colors.primary[200],
            color: colors_1.colors.primary[800],
        },
        success: {
            backgroundColor: colors_1.colors.success[50],
            borderColor: colors_1.colors.success[200],
            color: colors_1.colors.success[800],
        },
        warning: {
            backgroundColor: colors_1.colors.warning[50],
            borderColor: colors_1.colors.warning[200],
            color: colors_1.colors.warning[800],
        },
        error: {
            backgroundColor: colors_1.colors.error[50],
            borderColor: colors_1.colors.error[200],
            color: colors_1.colors.error[800],
        },
    };
    return {
        ...baseStyles,
        ...variantStyles[variant || 'info'],
    };
};
const Alert = ({ children, variant = 'info', title, onClose, className, style, }) => {
    const alertStyles = getAlertStyles(variant);
    return ((0, jsx_runtime_1.jsx)("div", { className: className, style: { ...alertStyles, ...style }, role: "alert", children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [title && ((0, jsx_runtime_1.jsx)("div", { style: {
                                fontWeight: typography_1.typography.fontWeight.semibold,
                                marginBottom: spacing_1.spacing[1],
                            }, children: title })), (0, jsx_runtime_1.jsx)("div", { children: children })] }), onClose && ((0, jsx_runtime_1.jsx)("button", { onClick: onClose, style: {
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        marginLeft: spacing_1.spacing[2],
                        color: 'currentColor',
                        opacity: 0.7,
                        fontSize: '18px',
                        lineHeight: 1,
                    }, "aria-label": "Close alert", children: "\u00D7" }))] }) }));
};
exports.Alert = Alert;
exports.default = exports.Alert;
//# sourceMappingURL=Alert.js.map