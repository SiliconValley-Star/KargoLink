"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const colors_1 = require("../theme/colors");
const typography_1 = require("../theme/typography");
const spacing_1 = require("../theme/spacing");
const getModalStyles = (size) => {
    const sizeStyles = {
        sm: { maxWidth: '400px' },
        md: { maxWidth: '600px' },
        lg: { maxWidth: '800px' },
        xl: { maxWidth: '1200px' },
    };
    return sizeStyles[size || 'md'];
};
const Modal = ({ isOpen, onClose, children, title, size = 'md', className, style, }) => {
    const modalSizeStyles = getModalStyles(size);
    react_1.default.useEffect(() => {
        const handleEscape = (e) => {
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
    if (!isOpen)
        return null;
    const overlayStyles = {
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
        padding: spacing_1.spacing[4],
    };
    const modalStyles = {
        backgroundColor: colors_1.colors.light.background,
        borderRadius: spacing_1.radius.lg,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        ...modalSizeStyles,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    };
    const headerStyles = {
        padding: `${spacing_1.spacing[6]} ${spacing_1.spacing[6]} ${spacing_1.spacing[4]}`,
        borderBottom: `1px solid ${colors_1.colors.neutral[200]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    };
    const titleStyles = {
        fontSize: typography_1.typography.fontSize['2xl'],
        fontWeight: typography_1.typography.fontWeight.semibold,
        fontFamily: typography_1.typography.fontFamily.sans.join(', '),
        color: colors_1.colors.light.text,
        margin: 0,
    };
    const contentStyles = {
        padding: spacing_1.spacing[6],
        flex: 1,
        overflow: 'auto',
    };
    const closeButtonStyles = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: spacing_1.spacing[2],
        color: colors_1.colors.neutral[500],
        fontSize: '24px',
        lineHeight: 1,
        borderRadius: spacing_1.radius.md,
        transition: 'all 0.2s ease-in-out',
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: overlayStyles, onClick: (e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }, children: (0, jsx_runtime_1.jsxs)("div", { className: className, style: { ...modalStyles, ...style }, onClick: (e) => e.stopPropagation(), children: [title && ((0, jsx_runtime_1.jsxs)("div", { style: headerStyles, children: [(0, jsx_runtime_1.jsx)("h2", { style: titleStyles, children: title }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, style: closeButtonStyles, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = colors_1.colors.neutral[100];
                                e.currentTarget.style.color = colors_1.colors.neutral[700];
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = colors_1.colors.neutral[500];
                            }, "aria-label": "Close modal", children: "\u00D7" })] })), (0, jsx_runtime_1.jsx)("div", { style: contentStyles, children: children })] }) }));
};
exports.Modal = Modal;
exports.default = exports.Modal;
//# sourceMappingURL=Modal.js.map