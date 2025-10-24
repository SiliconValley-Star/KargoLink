import React from 'react';
export interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}
export declare const Button: React.FC<ButtonProps>;
export default Button;
//# sourceMappingURL=Button.d.ts.map