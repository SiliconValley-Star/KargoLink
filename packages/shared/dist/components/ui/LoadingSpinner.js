"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const colors_1 = require("../theme/colors");
const getSizeStyles = (size) => {
    const sizes = {
        xs: '12px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
    };
    return sizes[size || 'md'];
};
const getColorStyles = (color) => {
    const colorMap = {
        primary: colors_1.colors.primary[500],
        secondary: colors_1.colors.neutral[500],
        white: '#ffffff',
        current: 'currentColor',
    };
    return colorMap[color || 'primary'];
};
const LoadingSpinner = ({ size = 'md', color = 'primary', className, style, }) => {
    const spinnerSize = getSizeStyles(size);
    const spinnerColor = getColorStyles(color);
    const spinnerStyles = {
        width: spinnerSize,
        height: spinnerSize,
        border: `2px solid transparent`,
        borderTop: `2px solid ${spinnerColor}`,
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'cargolink-spin 1s linear infinite',
        ...style,
    };
    react_1.default.useEffect(() => {
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
    return ((0, jsx_runtime_1.jsx)("div", { className: className, style: spinnerStyles, role: "status", "aria-label": "Loading" }));
};
exports.LoadingSpinner = LoadingSpinner;
exports.default = exports.LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.js.map