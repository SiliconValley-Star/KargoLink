import React from 'react';
export interface AlertProps {
    children: React.ReactNode;
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    onClose?: () => void;
    className?: string;
    style?: React.CSSProperties;
}
export declare const Alert: React.FC<AlertProps>;
export default Alert;
//# sourceMappingURL=Alert.d.ts.map