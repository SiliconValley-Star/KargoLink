import React from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    style?: React.CSSProperties;
}
export declare const Modal: React.FC<ModalProps>;
export default Modal;
//# sourceMappingURL=Modal.d.ts.map